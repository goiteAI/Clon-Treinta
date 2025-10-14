import React from 'react';
import type { Transaction } from '../types';

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

interface SaleActionsModalProps {
    transaction: Transaction;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const SaleActionsModal: React.FC<SaleActionsModalProps> = ({ transaction, onClose, onEdit, onDelete }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col dark:bg-slate-800">
            <div className="p-4 border-b dark:border-slate-700">
                <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">Venta #{transaction.invoiceNumber}</h2>
                <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selecciona una acción</p>
            </div>
            <div className="p-4 space-y-3">
                <button onClick={onEdit} className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600">
                    <PencilIcon className="w-6 h-6 text-blue-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-100">Editar Venta</span>
                </button>
                <button onClick={onDelete} className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600">
                    <TrashIcon className="w-6 h-6 text-red-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-100">Eliminar Venta</span>
                </button>
            </div>
            <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t rounded-b-lg dark:bg-slate-800/50 dark:border-slate-700">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100">Cancelar</button>
            </div>
        </div>
    </div>
);

export default SaleActionsModal;
