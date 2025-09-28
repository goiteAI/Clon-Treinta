// FIX: Replaced placeholder content with a complete React component implementation for the Add Contact modal. This component provides a form to add a new contact and uses the AppContext to save the data, resolving the reference errors.
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Contact } from '../types';

interface AddContactModalProps {
    onClose: () => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ onClose }) => {
    const { addContact } = useAppContext();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) return;

        const newContact: Omit<Contact, 'id'> = { name, phone };
        addContact(newContact);
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
                    <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t rounded-b-lg dark:bg-slate-800/50 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddContactModal;
