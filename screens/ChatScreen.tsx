import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { runChat, startChat, AppFunctions } from '../services/geminiService';
import type { ChatMessage } from '../types';


const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.47-1.47l-1.188-.648 1.188-.648a2.25 2.25 0 011.47-1.47l.648-1.188.648 1.188a2.25 2.25 0 011.47 1.47l1.188.648-1.188.648a2.25 2.25 0 01-1.47 1.47z" />
    </svg>
);

const PaperAirplaneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.826L11.25 9.25v1.5l-7.14 2.04a.75.75 0 00-.95.826l1.414 4.949a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
    </svg>
);

const ChatScreen: React.FC = () => {
    const context = useAppContext();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        startChat();
        setMessages([
            {
                role: 'model',
                parts: [{ text: '¡Hola! Soy GestiBot, tu asistente de negocios. ¿Cómo puedo ayudarte hoy? \n\nPuedes probar con: \n- "Vende 2 Coca-Cola y 1 Chocoramo a Cliente Frecuente en efectivo" \n- "Registra un abono de 5000 para Vecino Tienda" \n- "Cambia el precio de Jumbo Jet a 3200"' }],
            },
        ]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const appFunctions: AppFunctions = {
                products: context.products,
                contacts: context.contacts,
                transactions: context.transactions,
                addTransaction: context.addTransaction,
                addPayment: context.addPayment,
                updateProduct: context.updateProduct,
            };
            const responseText = await runChat(currentInput, appFunctions);
            const modelMessage: ChatMessage = { role: 'model', parts: [{ text: responseText }] };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error running chat:", error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: 'Lo siento, ocurrió un error al procesar tu solicitud.' }] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700 flex items-center gap-2">
                 <SparklesIcon className="w-6 h-6 text-green-500" />
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Asistente IA</h1>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-prose p-3 rounded-2xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-green-500 text-white rounded-br-lg' : 'bg-slate-200 text-slate-800 rounded-bl-lg dark:bg-slate-700 dark:text-slate-200'}`}>
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-prose p-3 rounded-2xl bg-slate-200 text-slate-800 rounded-bl-lg dark:bg-slate-700 dark:text-slate-200">
                           <div className="flex items-center gap-2">
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t dark:bg-slate-800 dark:border-slate-700">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe tu solicitud aquí..."
                        className="flex-1 p-3 border rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow hover:bg-green-600 transition-colors disabled:bg-slate-400" disabled={isLoading || !input.trim()}>
                        <PaperAirplaneIcon className="w-6 h-6"/>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatScreen;
