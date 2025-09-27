

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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col dark:bg-slate-800">
                <div className="p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">Registrar Gasto</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <input type="text" placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" required/>
                        <input type="number" placeholder="Monto" value={amount || ''} onChange={e => setAmount(parseFloat(e.target.value))} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" required/>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option>Varios</option>
                            <option>Inventario</option>
                            <option>Servicios</option>
                            <option>Alquiler</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t rounded-b-lg dark:bg-slate-800/50 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">Guardar</button>
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

    const categoryIcons = {
        Varios: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>,
        Inventario: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
        Servicios: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        Alquiler: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    };

    return (
        <div>
            <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Gastos</h1>
            </header>
            <div className="p-4 space-y-3">
                {expenses.map(e => (
                    <div key={e.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center dark:bg-slate-800">
                        <div className="flex items-center gap-4">
                            <div>{categoryIcons[e.category as keyof typeof categoryIcons] || categoryIcons['Varios']}</div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{e.description}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(e.date).toLocaleDateString('es-ES')} - {e.category}</p>
                            </div>
                        </div>
                        <p className="font-bold text-red-600">{formatCurrency(e.amount)}</p>
                    </div>
                ))}
            </div>
            <button onClick={() => setIsModalOpen(true)} className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
            {isModalOpen && <AddExpenseModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default ExpensesScreen;