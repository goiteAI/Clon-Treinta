import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { GoogleGenAI, FunctionDeclaration, Type, Chat } from '@google/generative-ai';
import type { Contact, Product, Transaction, TransactionItem } from '../types';

type Message = {
    role: 'user' | 'model';
    text: string;
};

const GeminiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M6.02002 8.09025C6.02002 5.29025 8.27002 3.04025 11.07 3.04025C13.87 3.04025 16.12 5.29025 16.12 8.09025C16.12 10.8903 13.87 13.1403 11.07 13.1403C8.27002 13.1403 6.02002 10.8903 6.02002 8.09025Z" fill="url(#paint0_linear_1_2)"/>
    <path d="M12.9299 20.9598C12.9299 18.1598 15.1799 15.9098 17.9799 15.9098C20.7799 15.9098 23.0299 18.1598 23.0299 20.9598C23.0299 23.7598 20.7799 26.0098 17.9799 26.0098C15.1799 26.0098 12.9299 23.7598 12.9299 20.9598Z" fill="url(#paint1_linear_1_2)"/>
    <defs>
    <linearGradient id="paint0_linear_1_2" x1="11.07" y1="3.04025" x2="11.07" y2="13.1403" gradientUnits="userSpaceOnUse">
    <stop stopColor="#63EAF1"/>
    <stop offset="1" stopColor="#4A85FF"/>
    </linearGradient>
    <linearGradient id="paint1_linear_1_2" x1="17.9799" y1="15.9098" x2="17.9799" y2="26.0098" gradientUnits="userSpaceOnUse">
    <stop stopColor="#F4B3FF"/>
    <stop offset="1" stopColor="#A882FF"/>
    </linearGradient>
    </defs>
  </svg>
);

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);


const AIAssistantModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const context = useAppContext();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const tools: FunctionDeclaration[] = [
        {
            name: 'addProduct',
            description: 'Añade un nuevo producto al inventario.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'Nombre del producto.' },
                    price: { type: Type.NUMBER, description: 'Precio de venta del producto.' },
                    cost: { type: Type.NUMBER, description: 'Costo del producto (opcional).' },
                    stock: { type: Type.INTEGER, description: 'Cantidad de stock inicial.' },
                },
                required: ['name', 'price', 'stock'],
            },
        },
        {
            name: 'addTransaction',
            description: 'Registra una nueva venta.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    items: {
                        type: Type.ARRAY,
                        description: 'Lista de productos vendidos.',
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                productName: { type: Type.STRING, description: 'El nombre exacto del producto.' },
                                quantity: { type: Type.INTEGER, description: 'La cantidad vendida.' }
                            },
                            required: ['productName', 'quantity']
                        }
                    },
                    paymentMethod: { type: Type.STRING, enum: ['Efectivo', 'Crédito', 'Transferencia'], description: 'Método de pago.' },
                    contactName: { type: Type.STRING, description: 'El nombre del cliente. Si no se provee, se asigna a "Cliente Ocasional".' }
                },
                required: ['items', 'paymentMethod']
            }
        },
        {
            name: 'addContact',
            description: 'Añade un nuevo cliente.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'Nombre del cliente.' },
                    phone: { type: Type.STRING, description: 'Número de teléfono del cliente.' },
                },
                required: ['name', 'phone'],
            },
        },
        {
            name: 'getProductInfo',
            description: 'Obtiene información sobre un producto, como su stock o precio.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    productName: { type: Type.STRING, description: 'El nombre del producto a consultar.' },
                },
                required: ['productName'],
            },
        },
    ];

    useEffect(() => {
        const initChat = async () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const model = 'gemini-2.5-flash';
                chatRef.current = ai.chats.create({
                    model: model,
                    config: {
                        systemInstruction: "Eres un asistente experto para gestionar una app de negocios. Tu nombre es GestiBot. Puedes añadir productos, registrar ventas, añadir clientes y consultar información. Usa las herramientas disponibles para cumplir las peticiones. Sé amable y conversacional. Si un nombre de producto o cliente no es exacto, pide una clarificación. Al añadir una venta, necesitas el nombre exacto del producto y su cantidad. Si el usuario no lo provee, pregunta por ello. Siempre confirma la acción realizada con un resumen amigable. Responde siempre en español.",
                        tools: [{ functionDeclarations: tools }]
                    },
                });
                setMessages([{ role: 'model', text: '¡Hola! Soy GestiBot. ¿Cómo puedo ayudarte a gestionar tu negocio hoy?' }]);
            } catch (error) {
                console.error("Error initializing AI assistant:", error);
                 setMessages([{ role: 'model', text: 'Lo siento, no pude inicializar el asistente de IA. Verifica tu conexión o la configuración.' }]);
            }
        };
        initChat();
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !chatRef.current) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await chatRef.current.sendMessage(input);
            const response = result;
            const functionCalls = response.functionCalls;

            if (functionCalls && functionCalls.length > 0) {
                 const functionCall = functionCalls[0];
                 const { name, args } = functionCall;
                 let functionResult;

                 try {
                    switch (name) {
                        case 'addProduct':
                            await context.addProduct(args as Omit<Product, 'id' | 'stockHistory'>);
                            functionResult = { success: true, message: `Producto "${args.name}" añadido correctamente.` };
                            break;
                        case 'addTransaction':
                            {
                                const items = args.items as { productName: string, quantity: number }[];
                                const transactionItems: TransactionItem[] = [];
                                let error: string | null = null;

                                for (const item of items) {
                                    const product = context.products.find(p => p.name.toLowerCase() === item.productName.toLowerCase());
                                    if (!product) {
                                        error = `El producto "${item.productName}" no fue encontrado. Por favor, verifica el nombre.`;
                                        break;
                                    }
                                    if (product.stock < item.quantity) {
                                        error = `No hay suficiente stock para "${item.productName}". Stock disponible: ${product.stock}.`;
                                        break;
                                    }
                                    transactionItems.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price });
                                }

                                if (error) {
                                    functionResult = { success: false, error };
                                    break;
                                }

                                const contact = context.contacts.find(c => c.name.toLowerCase() === (args.contactName as string)?.toLowerCase());
                                const contactId = contact?.id;

                                await context.addTransaction({
                                    items: transactionItems,
                                    totalAmount: transactionItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
                                    paymentMethod: args.paymentMethod as any,
                                    contactId: contactId,
                                    date: new Date().toISOString()
                                });
                                functionResult = { success: true, message: `Venta registrada exitosamente.` };
                            }
                            break;
                        case 'addContact':
                            await context.addContact(args as Omit<Contact, 'id' | 'nextInvoiceNumber'>);
                            functionResult = { success: true, message: `Cliente "${args.name}" añadido.` };
                            break;
                        case 'getProductInfo':
                            {
                                const product = context.products.find(p => p.name.toLowerCase() === (args.productName as string).toLowerCase());
                                if (product) {
                                    functionResult = { success: true, info: `Hay ${product.stock} unidades de ${product.name} en stock. Su precio de venta es ${product.price}.` };
                                } else {
                                    functionResult = { success: false, error: `Producto "${args.productName}" no encontrado.` };
                                }
                            }
                            break;
                        default:
                            functionResult = { success: false, error: `Función desconocida: ${name}` };
                    }
                } catch(e) {
                     functionResult = { success: false, error: `Ocurrió un error al ejecutar la acción: ${(e as Error).message}` };
                }


                const functionResponseResult = await chatRef.current.sendMessage([
                    {
                        functionResponse: {
                            name,
                            response: functionResult,
                        },
                    },
                ]);
                setMessages(prev => [...prev, { role: 'model', text: functionResponseResult.text }]);

            } else {
                setMessages(prev => [...prev, { role: 'model', text: response.text }]);
            }
        } catch (e) {
            console.error("Error sending message to AI:", e);
            setMessages(prev => [...prev, { role: 'model', text: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 flex flex-col" role="dialog" aria-modal="true" aria-labelledby="ai-assistant-title">
            <header className="flex items-center justify-between p-4 border-b dark:border-slate-700 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <GeminiIcon className="w-6 h-6"/>
                    <h2 id="ai-assistant-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">Asistente AI</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Cerrar chat">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-green-500 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'}`}>
                           <p className="text-sm" dangerouslySetInnerHTML={{__html: msg.text.replace(/\n/g, '<br />')}}/>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-xs px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700 rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t dark:border-slate-700 flex-shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe tu petición aquí..."
                        className="w-full p-3 border rounded-full focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors disabled:bg-slate-400" disabled={isLoading || !input.trim()}>
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIAssistantModal;