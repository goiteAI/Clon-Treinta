
import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { useAppContext } from '../context/AppContext';

interface AddPaymentModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ transaction, onClose }) => {
    const { addPayment } = useAppContext();
    const [amount, setAmount] = useState(0);

    const totalPaid = useMemo(() => transaction.payments?.reduce((sum, p) => sum + p.amount, 0) || 0, [transaction.payments]);
    const amountDue = transaction.totalAmount - totalPaid;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0 || amount > amountDue) {
            // Basic validation
            alert(`El monto debe ser mayor a 0 y menor o igual al saldo pendiente de ${formatCurrency(amountDue)}`);
            return;
        }
        addPayment(transaction.id, amount);
        onClose();
    };
    
    const formatCurrency = (value: number) => value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col dark:bg-slate-800">
                <div className="p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">Registrar Abono</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="mb-4 text-sm text-center bg-slate-50 p-3 rounded-md dark:bg-slate-700">
                            <p className="dark:text-slate-300">Deuda Total: <span className="font-semibold text-slate-700 dark:text-slate-100">{formatCurrency(transaction.totalAmount)}</span></p>
                            <p className="mt-1 dark:text-slate-300">Saldo Pendiente: <span className="font-semibold text-red-600 text-base">{formatCurrency(amountDue)}</span></p>
                        </div>
                        <div>
                            <label htmlFor="paymentAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Monto del abono</label>
                            <input
                                id="paymentAmount"
                                type="number"
                                placeholder="0"
                                value={amount || ''}
                                onChange={e => setAmount(parseFloat(e.target.value))}
                                className="w-full p-2 border rounded-md mt-1 focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                required
                                min="1"
                                max={amountDue}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t rounded-b-lg dark:bg-slate-900/50 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">Guardar Abono</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentModal;