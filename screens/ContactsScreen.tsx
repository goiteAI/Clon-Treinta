import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import AddContactModal from '../components/AddContactModal';
import ConfirmationModal from '../components/ConfirmationModal';
import type { Contact } from '../types';

const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 00-2.09 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const ContactsScreen: React.FC = () => {
    const { contacts, deleteContact } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

    const handleOpenAddModal = () => {
        setContactToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (contact: Contact) => {
        setContactToEdit(contact);
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        if (contactToDelete) {
            deleteContact(contactToDelete.id);
            setContactToDelete(null);
        }
    };

    return (
        <div>
            <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Contactos</h1>
            </header>
            <div className="p-4 space-y-3">
                {contacts.map(c => (
                    <div key={c.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between dark:bg-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold dark:bg-green-900/50 dark:text-green-300">
                                {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{c.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleOpenEditModal(c)} className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 p-2 rounded-full transition-colors" aria-label={`Editar ${c.name}`}>
                               <PencilIcon className="w-5 h-5"/>
                            </button>
                             <button onClick={() => setContactToDelete(c)} className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 p-2 rounded-full transition-colors" aria-label={`Eliminar ${c.name}`}>
                               <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={handleOpenAddModal}
                className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105"
                aria-label="Añadir nuevo contacto"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
            {isModalOpen && <AddContactModal contactToEdit={contactToEdit} onClose={() => setIsModalOpen(false)} />}
            {contactToDelete && (
                <ConfirmationModal
                    isOpen={!!contactToDelete}
                    onClose={() => setContactToDelete(null)}
                    onConfirm={handleDelete}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que quieres eliminar al contacto "${contactToDelete.name}"? Esta acción no se puede deshacer.`}
                />
            )}
        </div>
    );
};

export default ContactsScreen;
