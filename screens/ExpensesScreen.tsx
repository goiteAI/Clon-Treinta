import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Expense } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';

const AddExpenseModal: React.FC<{ onClose: () => void; expenseToEdit?: Expense | null }> = ({ onClose, expenseToEdit }) => {
    const { addExpense, updateExpense } = useAppContext();
    const isEditMode = !!expenseToEdit;
    
    const [description, setDescription] = useState(expenseToEdit?.description || '');
    const [amount, setAmount] = useState(expenseToEdit?.amount || 0);
    const [category, setCategory] = useState(expenseToEdit?.category || 'Varios');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!description || amount <= 0) return;
        
        if (isEditMode && expenseToEdit) {
            const updatedExpense: Expense = { ...expenseToEdit, description, amount, category };
            updateExpense(updatedExpense);
        } else {
            const newExpense: Omit<Expense, 'id'> = { description, amount, category, date: new Date().toISOString() };
            addExpense(newExpense);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col dark:bg-slate-800">
                <div className="p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">{isEditMode ? 'Editar Gasto' : 'Registrar Gasto'}</h2>
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
                        <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">{isEditMode ? 'Guardar Cambios' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

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


const ExpensesScreen: React.FC = () => {
    const { expenses, deleteExpense } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
    
    const formatCurrency = (amount: number) => amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    const categoryIcons = {
        Varios: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>,
        Inventario: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
        Servicios: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        Alquiler: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    };

    const handleOpenEditModal = (expense: Expense) => {
        setExpenseToEdit(expense);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setExpenseToEdit(null);
    };

    const handleDelete = () => {
        if (expenseToDelete) {
            deleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
        }
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
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-red-600">{formatCurrency(e.amount)}</p>
                            <button onClick={() => handleOpenEditModal(e)} className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 p-2 rounded-full transition-colors" aria-label={`Editar gasto ${e.description}`}>
                                <PencilIcon className="w-5 h-5"/>
                            </button>
                            <button onClick={() => setExpenseToDelete(e)} className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 p-2 rounded-full transition-colors" aria-label={`Eliminar gasto ${e.description}`}>
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => setIsModalOpen(true)} className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
            {isModalOpen && <AddExpenseModal onClose={handleCloseModal} expenseToEdit={expenseToEdit}/>}
            {expenseToDelete && (
                <ConfirmationModal
                    isOpen={!!expenseToDelete}
                    onClose={() => setExpenseToDelete(null)}
                    onConfirm={handleDelete}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que quieres eliminar el gasto "${expenseToDelete.description}"? Esta acción no se puede deshacer.`}
                />
            )}
        </div>
    );
};

export default ExpensesScreen;
