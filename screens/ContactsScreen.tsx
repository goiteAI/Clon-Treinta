import React, { useState, useMemo } from 'react';
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

const ContactPurchaseHistory: React.FC<{ contactId: string }> = ({ contactId }) => {
    const { transactions, products } = useAppContext();

    const history = useMemo(() => {
        const contactTransactions = transactions.filter(t => t.contactId === contactId);

        if (contactTransactions.length === 0) {
            return { totalProducts: 0, topProducts: [] };
        }

        const productSales = new Map<string, { productId: string; quantity: number }>();
        let totalProducts = 0;

        contactTransactions.forEach(transaction => {
            transaction.items.forEach(item => {
                totalProducts += item.quantity;
                const existing = productSales.get(item.productId);
                if (existing) {
                    productSales.set(item.productId, { ...existing, quantity: existing.quantity + item.quantity });
                } else {
                    productSales.set(item.productId, { productId: item.productId, quantity: item.quantity });
                }
            });
        });

        const topProducts = Array.from(productSales.values())
            .sort((a, b) => b.quantity - a.quantity)
            .map(sale => {
                const product = products.find(p => p.id === sale.productId);
                return { ...sale, product };
            })
            .filter(item => !!item.product);

        return { totalProducts, topProducts };
    }, [contactId, transactions, products]);

    return (
        <div className="mt-3 pt-3 border-t dark:border-slate-700">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Historial de Compras</h4>
            <div className="bg-slate-50 p-3 rounded-md mb-3 dark:bg-slate-700/50">
                <p className="text-sm text-slate-600 dark:text-slate-400">Total de productos comprados: <span className="font-bold text-lg text-green-600">{history.totalProducts}</span></p>
            </div>
            
            {history.topProducts.length > 0 ? (
                <ul className="space-y-2">
                    {history.topProducts.map(item => (
                        <li key={item.productId} className="flex justify-between items-center text-sm p-1 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded">
                           <span className="text-slate-600 dark:text-slate-300">{item.product!.name}</span>
                           <span className="font-semibold text-slate-800 dark:text-slate-100">{item.quantity} uds.</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-center text-slate-500 dark:text-slate-400">Este cliente aún no tiene compras registradas.</p>
            )}
        </div>
    );
};


const ContactsScreen: React.FC = () => {
    const { contacts, deleteContact } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
    const [expandedContactId, setExpandedContactId] = useState<string | null>(null);

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
    
    const handleToggleExpand = (contactId: string) => {
        setExpandedContactId(prevId => (prevId === contactId ? null : contactId));
    };

    return (
        <div>
            <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Contactos</h1>
            </header>
            <div className="p-4 space-y-3">
                {contacts.map(c => (
                    <div key={c.id} className="bg-white p-3 rounded-lg shadow-sm dark:bg-slate-800">
                        <div className="flex items-center justify-between">
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
                                <button onClick={() => handleToggleExpand(c.id)} className="p-2 rounded-full transition-colors text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label={`Ver detalles de ${c.name}`}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 transition-transform ${expandedContactId === c.id ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {expandedContactId === c.id && <ContactPurchaseHistory contactId={c.id} />}
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