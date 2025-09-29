import React from 'react';
import type { Transaction } from '../types';

interface DeleteSaleConfirmationModalProps {
    transaction: Transaction;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteSaleConfirmationModal: React.FC<DeleteSaleConfirmationModalProps> = ({ transaction, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col dark:bg-slate-800">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Confirmar Eliminación</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">¿Estás seguro de que quieres eliminar la venta <span className="font-semibold">#{transaction.invoiceNumber}</span>? Se restaurará el stock de los productos vendidos. Esta acción no se puede deshacer.</p>
                </div>
                <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t rounded-b-lg dark:bg-slate-800/50 dark:border-slate-700">
                    <button onClick={onCancel} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100">Cancelar</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors">Eliminar</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteSaleConfirmationModal;