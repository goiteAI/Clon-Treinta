
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Contact } from '../types';

const AddContactModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addContact } = useAppContext();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) return;
        
        addContact({ name, phone });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col dark:bg-slate-800">
                <div className="p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">Añadir Contacto</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <input type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
                        <input type="tel" placeholder="Número de teléfono" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
                    </div>
                    <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t rounded-b-lg dark:bg-slate-800/50 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ContactsScreen: React.FC = () => {
    const { contacts } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Contactos</h1>
            </header>
            <div className="p-4 space-y-3">
                {contacts.length > 0 ? contacts.map(c => (
                    <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center dark:bg-slate-800">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4 dark:bg-green-900">
                            <span className="text-lg font-bold text-green-600 dark:text-green-300">{c.name.charAt(0)}</span>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{c.phone}</p>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-slate-500 py-8 dark:text-slate-400">No tienes contactos guardados todavía.</p>
                )}
            </div>
            <button onClick={() => setIsModalOpen(true)} className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105" aria-label="Añadir nuevo contacto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
            {isModalOpen && <AddContactModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default ContactsScreen;
