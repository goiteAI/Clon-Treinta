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
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <h2 className="text-xl font-bold mb-2">Registrar Abono</h2>
                <div className="mb-4 text-sm text-slate-600">
                    <p>Deuda Total: <span className="font-semibold">{formatCurrency(transaction.totalAmount)}</span></p>
                    <p>Saldo Pendiente: <span className="font-semibold text-red-600">{formatCurrency(amountDue)}</span></p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="paymentAmount" className="block text-sm font-medium text-slate-700">Monto del abono</label>
                        <input
                            id="paymentAmount"
                            type="number"
                            placeholder="0"
                            value={amount || ''}
                            onChange={e => setAmount(parseFloat(e.target.value))}
                            className="w-full p-2 border rounded mt-1"
                            required
                            min="1"
                            max={amountDue}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md">Guardar Abono</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentModal;
