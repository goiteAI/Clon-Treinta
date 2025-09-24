
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Expense } from '../types';

const AddExpenseModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addExpense } = useAppContext();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState('Varios');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!description || amount <= 0) return;
        
        const newExpense: Omit<Expense, 'id'> = { description, amount, category, date: new Date().toISOString() };
        addExpense(newExpense);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Registrar Gasto</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input type="text" placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" required/>
                    <input type="number" placeholder="Monto" value={amount || ''} onChange={e => setAmount(parseFloat(e.target.value))} className="w-full p-2 border rounded" required/>
                     <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded">
                        <option>Varios</option>
                        <option>Inventario</option>
                        <option>Servicios</option>
                        <option>Alquiler</option>
                     </select>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ExpensesScreen: React.FC = () => {
    const { expenses } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const formatCurrency = (amount: number) => amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Gastos</h1>
            <div className="space-y-3">
                {expenses.map(e => (
                    <div key={e.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{e.description}</p>
                            <p className="text-sm text-slate-500">{new Date(e.date).toLocaleDateString('es-ES')} - {e.category}</p>
                        </div>
                        <p className="font-bold text-red-600">{formatCurrency(e.amount)}</p>
                    </div>
                ))}
            </div>
            <button onClick={() => setIsModalOpen(true)} className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-3xl">+</button>
            {isModalOpen && <AddExpenseModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default ExpensesScreen;
