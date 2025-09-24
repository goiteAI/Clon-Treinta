
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Contact } from '../types';

const AddContactModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addContact } = useAppContext();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isContactPickerSupported, setisContactPickerSupported] = useState(false);

    useEffect(() => {
        if ('contacts' in navigator && 'ContactsManager' in window) {
            setisContactPickerSupported(true);
        }
    }, []);

    const handleImportContact = async () => {
        try {
            const contacts = await (navigator as any).contacts.select(['name', 'tel'], { multiple: false });
            if (contacts.length > 0) {
                const { name, tel } = contacts[0];
                const newContact: Omit<Contact, 'id'> = {
                    name: name[0] || '',
                    phone: tel[0] || '',
                };
                addContact(newContact);
                onClose();
            }
        } catch (error) {
            console.error("Error importing contact:", error);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !phone) return;
        addContact({ name, phone });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                 {isContactPickerSupported && (
                    <>
                        <button onClick={handleImportContact} className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-md">Importar de Contactos</button>
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="flex-shrink mx-4 text-gray-400">o</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>
                    </>
                )}
                <h2 className="text-xl font-bold mb-4 text-center">Crear Nuevo Contacto</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required/>
                    <input type="tel" placeholder="Número de teléfono" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded" required/>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md">Guardar</button>
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
        <div className="p-4">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Contactos</h1>
            <div className="space-y-3">
                {contacts.length > 0 ? contacts.map(c => (
                    <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-800">{c.name}</p>
                            <p className="text-sm text-slate-500">{c.phone}</p>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-slate-500 py-8">Aún no tienes contactos guardados.</p>
                )}
            </div>
            <button onClick={() => setIsModalOpen(true)} className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-3xl">+</button>
            {isModalOpen && <AddContactModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default ContactsScreen;
