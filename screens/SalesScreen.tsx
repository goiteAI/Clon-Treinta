import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Transaction, Contact } from '../types';
import InvoiceModal from '../components/InvoiceModal';
import AddSaleModal from '../components/AddSaleModal';
import ConfirmationModal from '../components/ConfirmationModal';


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

const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

type SalesTab = 'history' | 'topProducts' | 'topClients';

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


const TopProductsView: React.FC = () => {
    const { transactions, products } = useAppContext();
    const formatCurrency = (amount: number) => amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    const topProducts = useMemo(() => {
        const productSales = new Map<string, { productId: string; quantity: number }>();

        transactions.forEach(transaction => {
            transaction.items.forEach(item => {
                const existing = productSales.get(item.productId);
                if (existing) {
                    productSales.set(item.productId, { ...existing, quantity: existing.quantity + item.quantity });
                } else {
                    productSales.set(item.productId, { productId: item.productId, quantity: item.quantity });
                }
            });
        });

        return Array.from(productSales.values())
            .sort((a, b) => b.quantity - a.quantity)
            .map(sale => {
                const product = products.find(p => p.id === sale.productId);
                return { ...sale, product };
            })
            .filter(item => !!item.product); // Filter out items where product is not found
    }, [transactions, products]);

    return (
        <div className="space-y-3">
            {topProducts.length > 0 ? topProducts.map((item, index) => (
                <div key={item.productId} className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-4 dark:bg-slate-800">
                    <span className="font-bold text-lg text-slate-400 dark:text-slate-500 w-8 text-center">#{index + 1}</span>
                    <img src={item.product!.imageUrl} alt={item.product!.name} className="w-16 h-16 rounded-md object-cover bg-slate-100"/>
                    <div className="flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{item.product!.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Precio: {formatCurrency(item.product!.price)}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-2xl text-green-600">{item.quantity}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">vendidos</p>
                    </div>
                </div>
            )) : (
                <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-lg dark:bg-slate-800/50 dark:text-slate-400">
                    <p>No hay datos de ventas para mostrar.</p>
                </div>
            )}
        </div>
    );
};

const TopClientsView: React.FC = () => {
    const { transactions, contacts } = useAppContext();
    const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

    const topClients = useMemo(() => {
        const clientSales = new Map<string, { contactId: string; totalQuantity: number }>();

        transactions.forEach(transaction => {
            if (transaction.contactId) {
                const totalItemsInTransaction = transaction.items.reduce((sum, item) => sum + item.quantity, 0);
                const existing = clientSales.get(transaction.contactId);
                if (existing) {
                    clientSales.set(transaction.contactId, { ...existing, totalQuantity: existing.totalQuantity + totalItemsInTransaction });
                } else {
                    clientSales.set(transaction.contactId, { contactId: transaction.contactId, totalQuantity: totalItemsInTransaction });
                }
            }
        });

        return Array.from(clientSales.values())
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .map(sale => {
                const contact = contacts.find(c => c.id === sale.contactId);
                return { ...sale, contact };
            })
            .filter(item => !!item.contact);
    }, [transactions, contacts]);
    
    const handleToggleExpand = (contactId: string) => {
        setExpandedClientId(prevId => (prevId === contactId ? null : contactId));
    };

    return (
         <div className="space-y-3">
            {topClients.length > 0 ? topClients.map((item, index) => (
                <div key={item.contactId} className="bg-white p-3 rounded-lg shadow-sm dark:bg-slate-800">
                    <button
                        onClick={() => handleToggleExpand(item.contactId)}
                        className="w-full flex items-center justify-between gap-2 text-left"
                        aria-expanded={expandedClientId === item.contactId}
                        aria-controls={`client-details-${item.contactId}`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-lg text-slate-400 dark:text-slate-500 w-8 text-center">#{index + 1}</span>
                             <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold dark:bg-green-900/50 dark:text-green-300 flex-shrink-0">
                                {item.contact!.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{item.contact!.name}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                            <div>
                                <p className="font-bold text-2xl text-green-600">{item.totalQuantity}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">comprados</p>
                            </div>
                             <ChevronDownIcon className={`h-5 w-5 transition-transform text-slate-400 ${expandedClientId === item.contactId ? 'rotate-180' : ''}`} />
                        </div>
                    </button>
                    {expandedClientId === item.contactId && (
                         <div id={`client-details-${item.contactId}`}>
                            <ContactPurchaseHistory contactId={item.contactId} />
                        </div>
                    )}
                </div>
            )) : (
                <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-lg dark:bg-slate-800/50 dark:text-slate-400">
                    <p>No hay datos de ventas de clientes para mostrar.</p>
                </div>
            )}
        </div>
    );
};


const SaleActionsModal: React.FC<{
    transaction: Transaction;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ transaction, onClose, onEdit, onDelete }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col dark:bg-slate-800">
            <div className="p-4 border-b dark:border-slate-700">
                <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">Venta #{transaction.invoiceNumber}</h2>
                <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selecciona una acción</p>
            </div>
            <div className="p-4 space-y-3">
                <button onClick={onEdit} className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600">
                    <PencilIcon className="w-6 h-6 text-blue-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-100">Editar Venta</span>
                </button>
                <button onClick={onDelete} className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600">
                    <TrashIcon className="w-6 h-6 text-red-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-100">Eliminar Venta</span>
                </button>
            </div>
            <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t rounded-b-lg dark:bg-slate-800/50 dark:border-slate-700">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100">Cancelar</button>
            </div>
        </div>
    </div>
);


const SalesScreen: React.FC = () => {
    const { transactions, contacts, deleteTransaction } = useAppContext();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [isFilterAccordionOpen, setIsFilterAccordionOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<SalesTab>('history');
    const [saleForActions, setSaleForActions] = useState<Transaction | null>(null);

    // Filter states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'Efectivo' | 'Crédito' | 'Transferencia'>('all');
    const [contactFilter, setContactFilter] = useState<string>('all');
    
    // Sort states
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const filteredAndSortedTransactions = useMemo(() => {
        let filtered = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            if (dateFrom && transactionDate < new Date(dateFrom)) return false;
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (transactionDate > toDate) return false;
            }
            if (paymentMethodFilter !== 'all' && t.paymentMethod !== paymentMethodFilter) return false;
            if (contactFilter !== 'all' && t.contactId !== contactFilter) return false;
            return true;
        });

        filtered.sort((a, b) => {
            if (sortBy === 'date') {
                return sortOrder === 'desc' ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime();
            } else {
                return sortOrder === 'desc' ? b.totalAmount - a.totalAmount : a.totalAmount - b.totalAmount;
            }
        });
        
        return filtered;
    }, [transactions, dateFrom, dateTo, paymentMethodFilter, contactFilter, sortBy, sortOrder]);


    const getContactName = (id: string | undefined) => id ? contacts.find(c => c.id === id)?.name || 'Desconocido' : 'Cliente Ocasional';
    const formatCurrency = (amount: number) => amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    
    const paymentMethodIcons = {
        Efectivo: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.162-.216c-1.356 0-2.46 1.104-2.46 2.46 0 1.355 1.104 2.46 2.46 2.46s2.46-1.105 2.46-2.46v-1.611a1 1 0 011-1 1 1 0 110-2 1 1 0 01-1-1V4a1 1 0 112 0v1.586a1 1 0 011 1v1.611a4.5 4.5 0 01-1.162.216v-1.698c.22.07.41.163.567.267C13.436 7.418 14 8.23 14 9.13v1.543a1 1 0 01-1 1h-1.543a1 1 0 01-1-1v-1.543a1 1 0 011-1h1.543a1 1 0 110 2h-1.543a1 1 0 01-1-1V9.13c0-.9.564-1.712 1.433-2.112zM4.34 8.252A4.5 4.5 0 018.868 6.57v1.698a2.5 2.5 0 00-4.528 0V8.252zM15.66 11.748a4.5 4.5 0 01-4.528 0v1.698a2.5 2.5 0 004.528 0v-1.698z"/></svg>,
        Crédito: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
        Transferencia: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-1.5-1.5a2 2 0 112.828-2.828l1.5 1.5 3-3zM3 4a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V5a1 1 0 00-1-1H3z" clipRule="evenodd" /></svg>,
    };

    const handleDelete = () => {
        if (transactionToDelete) {
            deleteTransaction(transactionToDelete.id);
            setTransactionToDelete(null);
        }
    };
    
    const resetFilters = () => {
        setDateFrom('');
        setDateTo('');
        setPaymentMethodFilter('all');
        setContactFilter('all');
        setSortBy('date');
        setSortOrder('desc');
    };

    const hasActiveFilters = dateFrom || dateTo || paymentMethodFilter !== 'all' || contactFilter !== 'all';
    const isDefaultSort = sortBy === 'date' && sortOrder === 'desc';

    return (
        <div>
            <header className="p-4 border-b bg-white flex justify-between items-center dark:bg-slate-800 dark:border-slate-700">
               <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ventas</h1>
               <button onClick={() => setIsAddModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-green-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Nueva Venta</span>
                </button>
            </header>
            
            <div className="p-4">
              <div className="border-b mb-4 dark:border-slate-700">
                <div className="flex -mb-px">
                    <button onClick={() => setActiveTab('history')} className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'history' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        Historial
                    </button>
                    <button onClick={() => setActiveTab('topProducts')} className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'topProducts' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        Top Productos
                    </button>
                    <button onClick={() => setActiveTab('topClients')} className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'topClients' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        Top Clientes
                    </button>
                </div>
              </div>

              {activeTab === 'history' && (
                <>
                    <div className="mb-4">
                        <div className="bg-white rounded-lg shadow-sm dark:bg-slate-800">
                            <button onClick={() => setIsFilterAccordionOpen(!isFilterAccordionOpen)} className="w-full flex justify-between items-center font-semibold text-slate-700 dark:text-slate-300 p-3" aria-expanded={isFilterAccordionOpen} aria-controls="filters-content">
                                <div className="flex items-center gap-2">
                                    <FilterIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                    <span>Filtros y Ordenación</span>
                                </div>
                                <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${isFilterAccordionOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isFilterAccordionOpen && (
                                <div id="filters-content" className="p-4 border-t dark:border-slate-700 mt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium">Desde</label>
                                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full p-1 border rounded focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Hasta</label>
                                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full p-1 border rounded focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Método de pago</label>
                                            <select value={paymentMethodFilter} onChange={e => setPaymentMethodFilter(e.target.value as 'all' | 'Efectivo' | 'Crédito' | 'Transferencia')} className="w-full p-1 border rounded focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                                <option value="all">Todos</option>
                                                <option value="Efectivo">Efectivo</option>
                                                <option value="Crédito">Crédito</option>
                                                <option value="Transferencia">Transferencia</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Cliente</label>
                                            <select value={contactFilter} onChange={e => setContactFilter(e.target.value)} className="w-full p-1 border rounded focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                                <option value="all">Todos</option>
                                                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Ordenar por</label>
                                            <select value={sortBy} onChange={e => setSortBy(e.target.value as 'date' | 'amount')} className="w-full p-1 border rounded focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                                <option value="date">Fecha</option>
                                                <option value="amount">Monto</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Orden</label>
                                            <select value={sortOrder} onChange={e => setSortOrder(e.target.value as 'desc' | 'asc')} className="w-full p-1 border rounded focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                                <option value="desc">Descendente</option>
                                                <option value="asc">Ascendente</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button onClick={resetFilters} className="text-blue-600 hover:underline text-sm font-semibold">Limpiar Filtros</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {!isFilterAccordionOpen && (hasActiveFilters || !isDefaultSort) && (
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Filtros activos:</span>
                            {dateFrom && <span className="pill">Desde: {dateFrom}</span>}
                            {dateTo && <span className="pill">Hasta: {dateTo}</span>}
                            {paymentMethodFilter !== 'all' && <span className="pill">{paymentMethodFilter}</span>}
                            {contactFilter !== 'all' && <span className="pill">{getContactName(contactFilter)}</span>}
                            {!isDefaultSort && <span className="pill bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Orden: {sortBy === 'date' ? 'Fecha' : 'Monto'} ({sortOrder === 'desc' ? 'Desc' : 'Asc'})</span>}
                            <button onClick={resetFilters} className="text-blue-600 hover:underline text-xs ml-auto font-semibold">Limpiar</button>
                        </div>
                    )}
                  
                  <div className="space-y-3">
                      {filteredAndSortedTransactions.length > 0 ? filteredAndSortedTransactions.map(t => (
                         <div key={t.id} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center dark:bg-slate-800">
                            <button onClick={() => setSaleForActions(t)} className="flex items-center gap-3 flex-1 text-left p-1 -m-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="mt-1">{paymentMethodIcons[t.paymentMethod]}</div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{getContactName(t.contactId)}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Factura #{t.invoiceNumber} - {new Date(t.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric'})}</p>
                                    <p className="font-bold text-lg text-slate-800 dark:text-slate-100 mt-1">{formatCurrency(t.totalAmount)}</p>
                                </div>
                            </button>
                            <div className="ml-4 flex-shrink-0">
                                <button onClick={() => setSelectedTransaction(t)} className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                                    Factura
                                </button>
                            </div>
                        </div>
                      )) : (
                         <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-lg dark:bg-slate-800/50 dark:text-slate-400">
                             <p>No hay ventas que coincidan con tus filtros.</p>
                             <p className="text-sm">Intenta ajustar el rango de fechas o los filtros.</p>
                         </div>
                      )}
                  </div>
                </>
              )}

              {activeTab === 'topProducts' && <TopProductsView />}
              {activeTab === 'topClients' && <TopClientsView />}

              {saleForActions && (
                <SaleActionsModal
                    transaction={saleForActions}
                    onClose={() => setSaleForActions(null)}
                    onEdit={() => {
                        setTransactionToEdit(saleForActions);
                        setSaleForActions(null);
                    }}
                    onDelete={() => {
                        setTransactionToDelete(saleForActions);
                        setSaleForActions(null);
                    }}
                />
               )}
              {isAddModalOpen && <AddSaleModal onClose={() => setIsAddModalOpen(false)} />}
              {transactionToEdit && <AddSaleModal transactionToEdit={transactionToEdit} onClose={() => setTransactionToEdit(null)} />}
              {transactionToDelete && (
                <ConfirmationModal
                    isOpen={!!transactionToDelete}
                    onClose={() => setTransactionToDelete(null)}
                    onConfirm={handleDelete}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que quieres eliminar la venta #${transactionToDelete.invoiceNumber}? Se restaurará el stock de los productos vendidos. Esta acción no se puede deshacer.`}
                />
              )}
              {selectedTransaction && <InvoiceModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />}
            </div>
        </div>
    );
};

export default SalesScreen;