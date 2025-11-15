import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI, FunctionDeclarationTool, FunctionDeclaration, Type, Part, Chat } from '@google/generative-ai';
import { useAppContext } from '../context/AppContext';

interface Message {
    id: string;
    role: 'user' | 'model' | 'function';
    parts: Part[];
}

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.471-1.471L13 18.75l1.188-.648a2.25 2.25 0 011.471-1.471L16.25 15l.648 1.188a2.25 2.25 0 011.471 1.471L19.5 18.75l-1.188.648a2.25 2.25 0 01-1.471 1.471z" />
    </svg>
);

const AIAssistantModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const context = useAppContext();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const initChat = async () => {
            try {
                const ai = new GoogleGenerativeAI(process.env.API_KEY || '');

                const tools: FunctionDeclarationTool[] = [
                    {
                        functionDeclarations: [
                            {
                                name: 'addProduct',
                                description: 'Añade un nuevo producto al inventario de la tienda.',
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING, description: 'El nombre del producto.' },
                                        price: { type: Type.NUMBER, description: 'El precio de venta del producto.' },
                                        cost: { type: Type.NUMBER, description: 'El costo de compra del producto.' },
                                        stock: { type: Type.NUMBER, description: 'La cantidad inicial en stock.' },
                                    },
                                    required: ['name', 'price', 'stock'],
                                },
                            },
                            {
                                name: 'addTransaction',
                                description: 'Registra una nueva venta de uno o más productos.',
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        items: {
                                            type: Type.ARRAY,
                                            description: 'Una lista de productos a vender.',
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    productName: { type: Type.STRING, description: 'El nombre del producto vendido.' },
                                                    quantity: { type: Type.NUMBER, description: 'La cantidad de unidades vendidas.' },
                                                },
                                                required: ['productName', 'quantity'],
                                            },
                                        },
                                        contactName: { type: Type.STRING, description: 'El nombre del cliente. Si no se especifica, es una venta a "Cliente Ocasional".' },
                                        paymentMethod: { type: Type.STRING, description: 'El método de pago (Efectivo, Crédito, Transferencia).', enum: ['Efectivo', 'Crédito', 'Transferencia'] },
                                    },
                                    required: ['items', 'paymentMethod'],
                                },
                            },
                             {
                                name: 'addContact',
                                description: 'Crea un nuevo cliente.',
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING, description: 'El nombre del cliente.' },
                                        phone: { type: Type.STRING, description: 'El número de teléfono del cliente.' },
                                    },
                                    required: ['name', 'phone'],
                                },
                            },
                            {
                                name: 'getProductInfo',
                                description: 'Obtiene información sobre un producto, como su stock y precio.',
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        productName: { type: Type.STRING, description: 'El nombre del producto a consultar.' },
                                    },
                                    required: ['productName'],
                                },
                            },
                        ]
                    }
                ];

                const chatSession = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    tools,
                });

                setChat(chatSession);
                
                setMessages([{
                    id: `model-${Date.now()}`,
                    role: 'model',
                    parts: [{ text: '¡Hola! Soy GestiBot. ¿Cómo puedo ayudarte a gestionar tu negocio hoy?' }],
                }]);

            } catch (error) {
                console.error("Error initializing Gemini:", error);
                setMessages([{
                    id: `model-${Date.now()}`,
                    role: 'model',
                    parts: [{ text: 'Lo siento, no pude conectarme con el asistente de IA. Por favor, verifica la configuración.' }],
                }]);
            }
        };

        initChat();
    }, []);

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || !chat) return;

        setIsLoading(true);
        const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', parts: [{ text: messageText }] };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            let response = await chat.sendMessage(messageText);

            while (true) {
                const functionCalls = response.functionCalls;
                if (!functionCalls || functionCalls.length === 0) {
                    break; 
                }

                console.log("Function Calls:", functionCalls);

                const functionResponses: Part[] = [];

                for (const fc of functionCalls) {
                    const { name, args } = fc;
                    let result: any;
                    let functionSuccess = true;

                    try {
                        switch (name) {
                            case 'addProduct':
                                await context.addProduct({ name: args.name as string, price: args.price as number, cost: (args.cost as number) || 0, stock: args.stock as number, imageUrl: '' });
                                result = { success: true, message: `Producto "${args.name}" añadido.` };
                                break;
                            case 'addTransaction': {
                                const items = args.items as { productName: string, quantity: number }[];
                                const transactionItems = [];
                                let allProductsFound = true;
                                for (const item of items) {
                                    const product = context.products.find(p => p.name.toLowerCase() === item.productName.toLowerCase());
                                    if (product) {
                                        transactionItems.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price });
                                    } else {
                                        result = { success: false, message: `No encontré el producto "${item.productName}".` };
                                        allProductsFound = false;
                                        break;
                                    }
                                }
                                if(allProductsFound) {
                                    const contactName = args.contactName as string;
                                    const contact = contactName ? context.contacts.find(c => c.name.toLowerCase() === contactName.toLowerCase()) : null;
                                    if(contactName && !contact){
                                         result = { success: false, message: `No encontré al cliente "${contactName}".` };
                                    } else {
                                        await context.addTransaction({ items: transactionItems, totalAmount: 0, paymentMethod: args.paymentMethod as any, contactId: contact?.id });
                                        result = { success: true, message: "Venta registrada exitosamente." };
                                    }
                                }
                                break;
                            }
                            case 'addContact':
                                await context.addContact({ name: args.name as string, phone: args.phone as string });
                                result = { success: true, message: `Cliente "${args.name}" añadido.` };
                                break;
                            case 'getProductInfo': {
                                const productName = args.productName as string;
                                const product = context.products.find(p => p.name.toLowerCase() === productName.toLowerCase());
                                if (product) {
                                    result = { success: true, stock: product.stock, price: product.price };
                                } else {
                                    result = { success: false, message: `Producto "${productName}" no encontrado.` };
                                }
                                break;
                            }
                            default:
                                result = { success: false, message: `Función "${name}" no reconocida.` };
                                functionSuccess = false;
                        }
                    } catch (e) {
                        result = { success: false, message: `Error ejecutando la función "${name}": ${(e as Error).message}` };
                        functionSuccess = false;
                    }

                    functionResponses.push({
                        functionResponse: {
                            name,
                            response: { name, content: result },
                        }
                    });
                }
                
                response = await chat.sendMessage({ parts: functionResponses });
            }

            const modelMessage: Message = { id: `model-${Date.now()}`, role: 'model', parts: [{ text: response.text }] };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            const errorMessage: Message = { id: `model-${Date.now()}-error`, role: 'model', parts: [{ text: "Lo siento, algo salió mal. Por favor, intenta de nuevo." }] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[90vh] flex flex-col dark:bg-slate-800">
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <SparklesIcon className="w-6 h-6 text-blue-500"/>
                         <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Asistente GestiBot</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>
                                {msg.parts[0].text}
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex justify-start">
                             <div className="max-w-xs px-4 py-2 rounded-2xl bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t dark:border-slate-700">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ej: Añade 2 Coca-Colas a la venta..."
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md transition-colors hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIAssistantModal;