import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Contact } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface AddContactModalProps {
    onClose: () => void;
    contactToEdit?: Contact | null;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ onClose, contactToEdit }) => {
    const { addContact, updateContact, deleteContact } = useAppContext();
    const isEditMode = !!contactToEdit;

    const [name, setName] = useState(contactToEdit?.name || '');
    const [phone, setPhone] = useState(contactToEdit?.phone || '');
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) return;

        if (isEditMode && contactToEdit) {
            const updatedContact: Contact = { ...contactToEdit, name, phone };
            updateContact(updatedContact);
        } else {
            const newContact: Omit<Contact, 'id' | 'nextInvoiceNumber'> = { name, phone };
            addContact(newContact);
        }
        
        onClose();
    };

    const handleDelete = () => {
        if (contactToEdit) {
            deleteContact(contactToEdit.id);
            setIsConfirmingDelete(false);
            onClose();
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col dark:bg-slate-800">
                    <div className="p-4 border-b dark:border-slate-700">
                        <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">{isEditMode ? 'Editar Contacto' : 'Añadir Contacto'}</h2>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-4">
                            <input
                                type="text"
                                placeholder="Nombre del contacto"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Número de teléfono"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                required
                            />
                        </div>
                        <div className="flex justify-between items-center gap-2 p-4 bg-slate-50 border-t rounded-b-lg dark:bg-slate-800/50 dark:border-slate-700">
                            {isEditMode && (
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmingDelete(true)}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                                >
                                    Eliminar
                                </button>
                            )}
                            <div className="flex-grow flex justify-end gap-2">
                                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">{isEditMode ? 'Guardar Cambios' : 'Guardar'}</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {isEditMode && contactToEdit && (
                 <ConfirmationModal
                    isOpen={isConfirmingDelete}
                    onClose={() => setIsConfirmingDelete(false)}
                    onConfirm={handleDelete}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que quieres eliminar al contacto "${contactToEdit.name}"? Esta acción no se puede deshacer.`}
                />
            )}
        </>
    );
};

export default AddContactModal;