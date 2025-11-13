import { GoogleGenAI, FunctionDeclaration, Type, Chat } from "@google/genai";
import type { Product, Contact, Transaction, TransactionItem } from '../types';

// Interface for app functions passed from the component context
export interface AppFunctions {
    products: Product[];
    contacts: Contact[];
    transactions: Transaction[];
    addTransaction: (transaction: Omit<Transaction, 'id' | 'invoiceNumber'>) => Promise<void>;
    addPayment: (transactionId: string, amount: number) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
let chat: Chat;

// Helper to find product by name (case-insensitive, partial match)
const findProduct = (products: Product[], name: string): Product | undefined => {
    if (!name) return undefined;
    const searchTerm = name.toLowerCase();
    // Prioritize exact match
    const exactMatch = products.find(p => p.name.toLowerCase() === searchTerm);
    if (exactMatch) return exactMatch;
    // Fallback to partial match
    return products.find(p => p.name.toLowerCase().includes(searchTerm));
};

// Helper to find contact by name (case-insensitive, partial match)
const findContact = (contacts: Contact[], name: string): Contact | undefined => {
    if (!name) return undefined;
    const searchTerm = name.toLowerCase();
     // Prioritize exact match
    const exactMatch = contacts.find(c => c.name.toLowerCase() === searchTerm);
    if (exactMatch) return exactMatch;
    // Fallback to partial match
    return contacts.find(c => c.name.toLowerCase().includes(searchTerm));
};

// Tool Declarations for Gemini
const tools: { functionDeclarations: FunctionDeclaration[] } = {
    functionDeclarations: [
        {
            name: "addSale",
            description: "Crea una nueva transacción de venta. Utiliza los nombres de productos y contactos existentes.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    items: {
                        type: Type.ARRAY,
                        description: "Una lista de productos a vender.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                productName: { type: Type.STRING, description: "El nombre de un producto existente para vender." },
                                quantity: { type: Type.NUMBER, description: "La cantidad del producto a vender." },
                            },
                            required: ["productName", "quantity"],
                        },
                    },
                    contactName: { type: Type.STRING, description: "Opcional. El nombre de un cliente existente al que se le realiza la venta." },
                    paymentMethod: { type: Type.STRING, enum: ["Efectivo", "Crédito", "Transferencia"], description: "El método de pago." },
                },
                required: ["items", "paymentMethod"],
            },
        },
        {
            name: "addPayment",
            description: "Registra un abono o pago a la deuda pendiente de un cliente.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    contactName: { type: Type.STRING, description: "El nombre del cliente que realiza el pago. El pago se aplicará a su deuda más antigua." },
                    amount: { type: Type.NUMBER, description: "La cantidad de dinero que se abona." },
                },
                required: ["contactName", "amount"],
            },
        },
        {
            name: "updateProduct",
            description: "Actualiza la información de un producto existente, como su nombre, precio o costo.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    productNameToUpdate: { type: Type.STRING, description: "El nombre actual del producto que se desea modificar." },
                    newName: { type: Type.STRING, description: "Opcional. El nuevo nombre para el producto." },
                    newPrice: { type: Type.NUMBER, description: "Opcional. El nuevo precio de venta para el producto." },
                    newCost: { type: Type.NUMBER, description: "Opcional. El nuevo costo del producto." },
                },
                required: ["productNameToUpdate"],
            },
        },
    ],
};

const systemInstruction = `Eres GestiBot, un asistente virtual para administrar una tienda. Usas las funciones disponibles para registrar ventas, abonos y actualizar productos. Eres directo y servicial. Cuando ejecutes una acción, informa al usuario del resultado de forma clara y concisa. Si no encuentras un producto o cliente, pide al usuario que lo aclare.`;

export const startChat = () => {
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
            tools: [tools],
        },
    });
};

export const runChat = async (prompt: string, appFunctions: AppFunctions): Promise<string> => {
    if (!chat) {
        startChat();
    }

    const result = await chat.sendMessage({ message: prompt });
    
    if (result.functionCalls) {
        const functionCalls = result.functionCalls;
        const functionResponses = [];

        for (const call of functionCalls) {
            const { name, args } = call;
            let callResult: any;

            try {
                if (name === "addSale") {
                    const items = args.items as { productName: string, quantity: number }[];
                    const cartItems: TransactionItem[] = [];
                    let hasError = false;
                    for (const item of items) {
                        const product = findProduct(appFunctions.products, item.productName);
                        if (!product) {
                            hasError = true;
                            callResult = { error: `No se encontró el producto "${item.productName}". Por favor, verifica el nombre.` };
                            break;
                        }
                        if (product.stock < item.quantity) {
                            hasError = true;
                            callResult = { error: `No hay suficiente stock para "${item.productName}". Disponible: ${product.stock}.` };
                            break;
                        }
                        cartItems.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price });
                    }

                    if (!hasError) {
                        const contact = findContact(appFunctions.contacts, args.contactName as string);
                        const totalAmount = cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

                        await appFunctions.addTransaction({
                            items: cartItems,
                            totalAmount,
                            date: new Date().toISOString(),
                            paymentMethod: args.paymentMethod as 'Efectivo' | 'Crédito' | 'Transferencia',
                            contactId: contact?.id,
                        });
                        callResult = { success: true, message: `Venta registrada por un total de ${totalAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}.` };
                    }
                } else if (name === "addPayment") {
                    const contact = findContact(appFunctions.contacts, args.contactName as string);
                    if (!contact) {
                        callResult = { error: `No se encontró al cliente "${args.contactName}".` };
                    } else {
                        const contactDebts = appFunctions.transactions.filter(t =>
                            t.contactId === contact.id &&
                            t.paymentMethod === 'Crédito' &&
                            (t.payments?.reduce((sum, p) => sum + p.amount, 0) || 0) < t.totalAmount
                        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                        if (contactDebts.length === 0) {
                            callResult = { error: `El cliente "${args.contactName}" no tiene deudas pendientes.` };
                        } else {
                            await appFunctions.addPayment(contactDebts[0].id, args.amount as number);
                            callResult = { success: true, message: `Abono de ${args.amount} registrado para ${args.contactName}.` };
                        }
                    }
                } else if (name === "updateProduct") {
                    const product = findProduct(appFunctions.products, args.productNameToUpdate as string);
                    if (!product) {
                        callResult = { error: `No se encontró el producto "${args.productNameToUpdate}".` };
                    } else {
                        const updatedProduct = { ...product };
                        if (args.newName) updatedProduct.name = args.newName as string;
                        if (args.newPrice) updatedProduct.price = args.newPrice as number;
                        if (args.newCost) updatedProduct.cost = args.newCost as number;
                        await appFunctions.updateProduct(updatedProduct);
                        callResult = { success: true, message: `Producto "${args.productNameToUpdate}" actualizado.` };
                    }
                } else {
                    callResult = { error: `Función desconocida: ${name}` };
                }
            } catch (e) {
                console.error(e);
                callResult = { error: `Hubo un error al ejecutar la acción: ${(e as Error).message}` };
            }

            functionResponses.push({
                 id: call.id,
                 name: call.name,
                 response: { result: JSON.stringify(callResult) }
            });
        }
        
        const secondResult = await chat.sendToolResponse({
            functionResponses: { functionResponses: functionResponses }
        });
        return secondResult.text.trim();
    } else {
        return result.text.trim();
    }
};
