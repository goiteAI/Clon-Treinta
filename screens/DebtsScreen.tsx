import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Transaction } from '../types';

const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

const DebtsScreen: React.FC = () => {
    const { transactions, contacts, addPayment, updatePayment } = useAppContext();
    const [addingPaymentTo, setAddingPaymentTo] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentError, setPaymentError] = useState<string>('');
    const [editingPaymentInfo, setEditingPaymentInfo] = useState<{ transactionId: string; paymentIndex: number; amount: number } | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'paid'; message: string } | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

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
    
    const handleSavePayment = (transaction: Transaction) => {
        setPaymentError('');
        const totalPaid = transaction.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const amountDue = transaction.totalAmount - totalPaid;

        if (paymentAmount <= 0) {
            setPaymentError('El monto del abono debe ser mayor a cero.');
            return;
        }
        if (paymentAmount > amountDue) {
            setPaymentError(`El monto no puede superar el saldo pendiente de ${formatCurrency(amountDue)}.`);
            return;
        }
        
        addPayment(transaction.id, paymentAmount);

        const newTotalPaid = totalPaid + paymentAmount;
        if (newTotalPaid >= transaction.totalAmount) {
            setNotification({ type: 'paid', message: '¡Deuda completada! El cliente ha saldado su cuenta.' });
        } else {
            setNotification({ type: 'success', message: 'Abono registrado con éxito.' });
        }

        setAddingPaymentTo(null); // Close the form on success
        setPaymentAmount(0);
    };

    const handleSavePaymentEdit = () => {
        if (!editingPaymentInfo) return;
        setPaymentError('');

        const { transactionId, paymentIndex, amount: newAmount } = editingPaymentInfo;
        
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        const originalPayment = transaction.payments?.[paymentIndex];
        const originalAmount = originalPayment?.amount || 0;

        const totalPaidWithoutOriginal = (transaction.payments?.reduce((sum, p) => sum + p.amount, 0) || 0) - originalAmount;
        const maxAllowedAmount = transaction.totalAmount - totalPaidWithoutOriginal;

        if (newAmount <= 0) {
            setPaymentError('El monto del abono debe ser mayor a cero.');
            return;
        }
        
        if (newAmount > maxAllowedAmount) {
            setPaymentError(`El monto no puede superar el saldo pendiente de ${formatCurrency(maxAllowedAmount)}.`);
            return;
        }
        
        updatePayment(transactionId, paymentIndex, newAmount);
        setEditingPaymentInfo(null);
        setPaymentError('');
    };


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

                                <div className="mt-4 pt-4 border-t dark:border-slate-700 space-y-4">
                                    {t.payments && t.payments.length > 0 && (
                                        <div>
                                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Historial de Abonos</p>
                                            <ul className="space-y-1 text-sm">
                                                {t.payments.map((payment, index) => {
                                                    const isEditing = editingPaymentInfo?.transactionId === t.id && editingPaymentInfo?.paymentIndex === index;
                                                    return isEditing ? (
                                                        <li key={index} className="bg-slate-50 p-2 rounded-lg dark:bg-slate-700/50">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={editingPaymentInfo.amount || ''}
                                                                    onChange={e => setEditingPaymentInfo(info => info ? {...info, amount: parseFloat(e.target.value) || 0} : null)}
                                                                    className="flex-grow p-1 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                                    autoFocus
                                                                />
                                                                <button onClick={handleSavePaymentEdit} className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-md hover:bg-green-600">Guardar</button>
                                                                <button onClick={() => setEditingPaymentInfo(null)} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Cancelar</button>
                                                            </div>
                                                            {paymentError && editingPaymentInfo?.transactionId === t.id && editingPaymentInfo?.paymentIndex === index && <p className="text-red-500 text-xs mt-1">{paymentError}</p>}
                                                        </li>
                                                    ) : (
                                                        <li key={index} className="flex justify-between items-center text-slate-500 dark:text-slate-400 group p-1 rounded">
                                                            <span>{new Date(payment.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-green-600">{formatCurrency(payment.amount)}</span>
                                                                <button onClick={() => {
                                                                    setEditingPaymentInfo({ transactionId: t.id, paymentIndex: index, amount: payment.amount });
                                                                    setPaymentError('');
                                                                }} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-500">
                                                                    <PencilIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                    {addingPaymentTo === t.id ? (
                                        <div className="bg-slate-50 p-3 rounded-lg dark:bg-slate-700/50">
                                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Registrar Nuevo Abono</p>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Monto"
                                                    value={paymentAmount || ''}
                                                    onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                                                    className="flex-grow p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                    autoFocus
                                                    min="1"
                                                    max={amountDue}
                                                />
                                                <button
                                                    onClick={() => handleSavePayment(t)}
                                                    className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-green-600 transition-colors"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    onClick={() => setAddingPaymentTo(null)}
                                                    className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                                    aria-label="Cancelar"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            {paymentError && addingPaymentTo === t.id && <p className="text-red-500 text-xs mt-2">{paymentError}</p>}
                                        </div>
                                    ) : (
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => {
                                                    setAddingPaymentTo(t.id);
                                                    setPaymentAmount(0);
                                                    setPaymentError('');
                                                }}
                                                className="px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-green-600 transition-colors"
                                            >
                                                Registrar Abono
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }) : (
                         <p className="text-center text-slate-500 py-8 dark:text-slate-400">¡Felicidades! No tienes deudas pendientes.</p>
                    )}
                </div>
            </div>

            {notification && (
                <div 
                    className={`fixed bottom-20 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white font-semibold z-50 animate-fade-in-out
                        ${notification.type === 'paid' ? 'bg-blue-500' : 'bg-green-500'}`}
                >
                    <p>{notification.message}</p>
                </div>
            )}
        </div>
    );
};

export default DebtsScreen;