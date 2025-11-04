import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import AddContactModal from '../components/AddContactModal';
import ClientDetailModal from '../components/ClientDetailModal';
import type { Contact } from '../types';

// Icons
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.418a.562.562 0 01.321.988l-4.204 3.055a.563.563 0 00-.182.635l1.578 4.87a.562.562 0 01-.812.622l-4.39-3.182a.563.563 0 00-.652 0l-4.39 3.182a.562.562 0 01-.812-.622l1.578-4.87a.563.563 0 00-.182-.635l-4.204-3.055a.562.562 0 01.321-.988h5.418a.563.563 0 00.475-.31L11.48 3.5z" />
    </svg>
);


// TopClientsView component
const TopClientsView: React.FC<{ onClientClick: (client: Contact) => void }> = ({ onClientClick }) => {
    const { contacts, transactions } = useAppContext();

    const topClientsData = useMemo(() => {
        const salesByClient = new Map<string, number>();

        transactions.forEach(t => {
            if (t.contactId) {
                const totalItems = t.items.reduce((sum, item) => sum + item.quantity, 0);
                salesByClient.set(t.contactId, (salesByClient.get(t.contactId) || 0) + totalItems);
            }
        });

        return Array.from(salesByClient.entries())
            .map(([contactId, totalProducts]) => {
                const contact = contacts.find(c => c.id === contactId);
                return { contact, totalProducts };
            })
            .filter(item => !!item.contact)
            .sort((a, b) => b.totalProducts - a.totalProducts) as { contact: Contact; totalProducts: number }[];
    }, [transactions, contacts]);

    if (topClientsData.length === 0) {
        return (
            <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-lg dark:bg-slate-800/50 dark:text-slate-400">
                <p>No hay datos de ventas por cliente para mostrar.</p>
                <p className="text-sm">Asegúrate de asignar clientes a tus ventas.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3">
            {topClientsData.map(({ contact, totalProducts }, index) => (
                <button
                    key={contact.id}
                    onClick={() => onClientClick(contact)}
                    className="w-full text-left bg-white p-3 rounded-lg shadow-sm flex items-center justify-between gap-4 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold dark:bg-slate-700 dark:text-slate-400 flex-shrink-0">
                           {index + 1}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{contact.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{contact.phone}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg text-green-600">{totalProducts}</p>
                        <p className="text-xs text-slate-400">productos</p>
                    </div>
                </button>
            ))}
        </div>
    );
};


// Main ClientsScreen component
const ClientsScreen: React.FC = () => {
    const { contacts } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
    const [activeTab, setActiveTab] = useState<'list' | 'top'>('list');
    const [selectedClientForDetail, setSelectedClientForDetail] = useState<Contact | null>(null);

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
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Clientes</h1>
            </header>

            <div className="p-4">
                <div className="border-b mb-4 dark:border-slate-700">
                    <div className="flex -mb-px">
                        <button onClick={() => setActiveTab('list')} className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'list' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                            Lista de Clientes
                        </button>
                        <button onClick={() => setActiveTab('top')} className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'top' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                            <div className="flex items-center gap-1.5">
                                <StarIcon className="w-4 h-4" />
                                <span>Top Clientes</span>
                            </div>
                        </button>
                    </div>
                </div>

                {activeTab === 'list' && (
                    <div className="space-y-3">
                        {contacts.map(c => (
                            <button
                                key={c.id}
                                onClick={() => handleOpenEditModal(c)}
                                className="w-full text-left bg-white p-3 rounded-lg shadow-sm flex items-center justify-between gap-2 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                aria-label={`Editar ${c.name}`}
                            >
                                <div className="flex flex-1 items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold dark:bg-green-900/50 dark:text-green-300 flex-shrink-0">
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{c.phone}</p>
                                    </div>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            </button>
                        ))}
                    </div>
                )}
                
                {activeTab === 'top' && <TopClientsView onClientClick={setSelectedClientForDetail} />}
            </div>

            <button
                onClick={handleOpenAddModal}
                className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105"
                aria-label="Añadir nuevo cliente"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>

            {isModalOpen && <AddContactModal contactToEdit={contactToEdit} onClose={() => setIsModalOpen(false)} />}
            {selectedClientForDetail && <ClientDetailModal client={selectedClientForDetail} onClose={() => setSelectedClientForDetail(null)} />}
        </div>
    );
};

export default ClientsScreen;