import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import AddContactModal from '../components/AddContactModal';
import type { Contact } from '../types';

const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

const ContactsScreen: React.FC = () => {
    const { contacts } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

    const handleOpenAddModal = () => {
        setContactToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (contact: Contact) => {
        setContactToEdit(contact);
        setIsModalOpen(true);
    };
    
    return (
        <div>
            <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Contactos</h1>
            </header>
            <div className="p-4 space-y-3">
                {contacts.map(c => (
                    <div key={c.id} className="bg-white p-3 rounded-lg shadow-sm dark:bg-slate-800">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-1 items-center gap-4 text-left p-1 -m-1">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold dark:bg-green-900/50 dark:text-green-300 flex-shrink-0">
                                    {c.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{c.phone}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <button onClick={() => handleOpenEditModal(c)} className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 p-2 rounded-full transition-colors" aria-label={`Editar ${c.name}`}>
                                   <PencilIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={handleOpenAddModal}
                className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105"
                aria-label="Añadir nuevo contacto"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
            {isModalOpen && <AddContactModal contactToEdit={contactToEdit} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default ContactsScreen;