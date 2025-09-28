// FIX: Replaced placeholder content with a complete React component implementation for the Contacts screen. This screen now displays a list of contacts, uses the AppContext to fetch data, and includes a button to open a modal for adding new contacts, resolving the module and reference errors.
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import AddContactModal from '../components/AddContactModal';

const ContactsScreen: React.FC = () => {
    const { contacts } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Contactos</h1>
            </header>
            <div className="p-4 space-y-3">
                {contacts.map(c => (
                    <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between dark:bg-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold dark:bg-green-900/50 dark:text-green-300">
                                {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{c.phone}</p>
                            </div>
                        </div>
                        {/* Future action buttons could go here, e.g., edit, delete */}
                    </div>
                ))}
            </div>
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105"
                aria-label="Añadir nuevo contacto"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
            {isModalOpen && <AddContactModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default ContactsScreen;
