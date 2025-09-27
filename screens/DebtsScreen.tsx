
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Transaction } from '../types';
import AddPaymentModal from '../components/AddPaymentModal';

const DebtsScreen: React.FC = () => {
    const { transactions, contacts } = useAppContext();
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const debts = useMemo(() => {
        return transactions
            .filter(t => {
                if (t.paymentMethod !== 'Crédito') return false;
                const totalPaid = t.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                return t.totalAmount > totalPaid;
            })
            .sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime());
    }, [transactions]);

    const getContactName = (id: string | undefined) => id ? contacts.find(c => c.id === id)?.name || 'Desconocido' : 'Cliente Ocasional';
    const formatCurrency = (amount: number) => amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    const totalDebt = useMemo(() => {
        return debts.reduce((total, t) => {
            const totalPaid = t.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
            return total + (t.totalAmount - totalPaid);
        }, 0);
    }, [debts]);

    return (
        <div>
            <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cuentas por Cobrar</h1>
                <p className="text-slate-500 dark:text-slate-400">Gestiona las deudas de tus clientes.</p>
            </header>
            
            <div className="p-4">
                <div className="bg-red-100 border-l-4 border-red-400 text-red-800 p-4 rounded-r-lg shadow-sm mb-6 dark:bg-red-900/50 dark:border-red-500 dark:text-red-300">
                    <p className="text-sm">Total por cobrar</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalDebt)}</p>
                </div>

                <div className="space-y-3">
                    {debts.length > 0 ? debts.map(t => {
                        const totalPaid = t.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                        const amountDue = t.totalAmount - totalPaid;

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const dueDate = t.dueDate ? new Date(t.dueDate) : null;
                        if (dueDate) dueDate.setHours(0, 0, 0, 0);

                        const isOverdue = dueDate ? dueDate < today : false;
                        const isDueToday = dueDate ? dueDate.getTime() === today.getTime() : false;

                        return (
                            <div key={t.id} className="bg-white p-4 rounded-lg shadow-sm dark:bg-slate-800">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-slate-100">{getContactName(t.contactId)}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Total: {formatCurrency(t.totalAmount)}</p>
                                        {t.dueDate && (
                                            <div className="mt-1">
                                               {isOverdue ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                                                        Vencido: {new Date(t.dueDate).toLocaleDateString('es-ES')}
                                                    </span>
                                               ) : isDueToday ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                                                        Vence Hoy
                                                    </span>
                                               ) : (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Vence: {new Date(t.dueDate).toLocaleDateString('es-ES')}
                                                    </p>
                                               )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-red-600">{formatCurrency(amountDue)}</p>
                                        <p className="text-xs text-slate-400">Pendiente</p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t flex justify-end dark:border-slate-700">
                                    <button
                                        onClick={() => setSelectedTransaction(t)}
                                        className="px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-green-600 transition-colors"
                                    >
                                        Registrar Abono
                                    </button>
                                </div>
                            </div>
                        )
                    }) : (
                         <p className="text-center text-slate-500 py-8 dark:text-slate-400">¡Felicidades! No tienes deudas pendientes.</p>
                    )}
                </div>
            </div>

            {selectedTransaction && (
                <AddPaymentModal
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                />
            )}
        </div>
    );
};

export default DebtsScreen;