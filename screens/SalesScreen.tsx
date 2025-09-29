import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Transaction } from '../types';
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


const SalesScreen: React.FC = () => {
    const { transactions, contacts, deleteTransaction } = useAppContext();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [showFilters, setShowFilters] = useState(false);

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
              <div className="mb-4">
                   <button onClick={() => setShowFilters(!showFilters)} className="w-full text-left font-semibold text-blue-600 p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors dark:bg-blue-900/50 dark:hover:bg-blue-900">
                      {showFilters ? 'Ocultar Filtros y Orden' : 'Mostrar Filtros y Orden'}
                  </button>
                  {showFilters && (
                      <div className="bg-white p-4 rounded-b-lg shadow-sm dark:bg-slate-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Filtering */}
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
                              {/* Sorting */}
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
                      </div>
                  )}
              </div>
              
              <div className="space-y-3">
                  {filteredAndSortedTransactions.length > 0 ? filteredAndSortedTransactions.map(t => (
                      <div key={t.id} className="bg-white p-3 rounded-lg shadow-sm dark:bg-slate-800">
                          <div className="flex justify-between items-start">
                             <div className="flex items-start gap-3 flex-1">
                                <div className="mt-1">{paymentMethodIcons[t.paymentMethod]}</div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{getContactName(t.contactId)}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Factura #{t.invoiceNumber} - {new Date(t.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric'})} - <span className={`font-medium`}>{t.paymentMethod}</span></p>
                                </div>
                             </div>
                              <div className="text-right">
                                  <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{formatCurrency(t.totalAmount)}</p>
                                   <button onClick={() => setSelectedTransaction(t)} className="text-xs text-blue-500 hover:underline">Factura</button>
                              </div>
                              <div className="flex flex-col gap-2 ml-3 pl-3 border-l dark:border-slate-700">
                                <button onClick={() => setTransactionToEdit(t)} className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors" aria-label={`Editar venta #${t.invoiceNumber}`}>
                                    <PencilIcon className="w-5 h-5"/>
                                </button>
                                <button onClick={() => setTransactionToDelete(t)} className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors" aria-label={`Eliminar venta #${t.invoiceNumber}`}>
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </div>
                          </div>
                      </div>
                  )) : (
                     <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-lg dark:bg-slate-800/50 dark:text-slate-400">
                         <p>No hay ventas que coincidan con tus filtros.</p>
                         <p className="text-sm">Intenta ajustar el rango de fechas o los filtros.</p>
                     </div>
                  )}
              </div>

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
