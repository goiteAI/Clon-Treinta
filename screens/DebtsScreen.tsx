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
        <div className="p-4">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Cuentas por Cobrar</h1>
            <p className="text-slate-500 mb-4">Gestiona las deudas de tus clientes.</p>
            
            <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-lg shadow-sm mb-6">
                <p className="text-sm">Total por cobrar</p>
                <p className="text-2xl font-bold">{formatCurrency(totalDebt)}</p>
            </div>

            <div className="space-y-3">
                {debts.length > 0 ? debts.map(t => {
                    const totalPaid = t.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                    const amountDue = t.totalAmount - totalPaid;
                    const isOverdue = t.dueDate ? new Date(t.dueDate) < new Date() : false;

                    return (
                        <div key={t.id} className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-slate-800">{getContactName(t.contactId)}</p>
                                    <p className="text-sm text-slate-500">Total: {formatCurrency(t.totalAmount)}</p>
                                    {t.dueDate && (
                                        <p className={`text-xs font-semibold ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
                                            Vence: {new Date(t.dueDate).toLocaleDateString('es-ES')}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-red-600">{formatCurrency(amountDue)}</p>
                                    <p className="text-xs text-slate-400">Pendiente</p>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t flex justify-end">
                                <button
                                    onClick={() => setSelectedTransaction(t)}
                                    className="px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-green-600"
                                >
                                    Registrar Abono
                                </button>
                            </div>
                        </div>
                    )
                }) : (
                     <p className="text-center text-slate-500 py-8">¡Felicidades! No tienes deudas pendientes.</p>
                )}
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
