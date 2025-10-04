import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { StockInEntry } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface StockInModalProps {
    onClose: () => void;
    stockInEntryToEdit?: StockInEntry | null;
}

const StockInModal: React.FC<StockInModalProps> = ({ onClose, stockInEntryToEdit }) => {
    const { products, addStockInEntry, updateStockInEntry } = useAppContext();
    const isEditMode = !!stockInEntryToEdit;
    
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [reference, setReference] = useState('');
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [entryToConfirm, setEntryToConfirm] = useState<Omit<StockInEntry, 'id'> | StockInEntry | null>(null);

    useEffect(() => {
        if (isEditMode && stockInEntryToEdit) {
            setDate(new Date(stockInEntryToEdit.date).toISOString().split('T')[0]);
            setReference(stockInEntryToEdit.reference || '');
            const initialQuantities = stockInEntryToEdit.items.reduce((acc, item) => {
                acc[item.productId] = item.quantity;
                return acc;
            }, {} as Record<string, number>);
            setQuantities(initialQuantities);
        }
    }, [isEditMode, stockInEntryToEdit]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    const handleQuantityChange = (productId: string, value: string) => {
        const newQuantity = parseInt(value, 10);
        setQuantities(prev => ({
            ...prev,
            [productId]: isNaN(newQuantity) || newQuantity < 0 ? 0 : newQuantity,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const items = Object.entries(quantities)
            .filter(([, quantity]) => Number(quantity) > 0)
            .map(([productId, quantity]) => ({ productId, quantity: Number(quantity) }));

        if (items.length === 0) {
            // Optionally show an error message
            return;
        }

        const entryDate = new Date(date);
        entryDate.setMinutes(entryDate.getMinutes() + entryDate.getTimezoneOffset()); 

        if (isEditMode && stockInEntryToEdit) {
            const updatedEntry: StockInEntry = {
                ...stockInEntryToEdit,
                date: entryDate.toISOString(),
                reference,
                items,
            };
            setEntryToConfirm(updatedEntry);
        } else {
            const newEntry: Omit<StockInEntry, 'id'> = {
                date: entryDate.toISOString(),
                reference,
                items,
            };
            setEntryToConfirm(newEntry);
        }
    };

    const handleConfirmSave = () => {
        if (!entryToConfirm) return;
        
        if ('id' in entryToConfirm) {
            updateStockInEntry(entryToConfirm as StockInEntry);
        } else {
            addStockInEntry(entryToConfirm as Omit<StockInEntry, 'id'>);
        }
        
        setEntryToConfirm(null);
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] flex flex-col dark:bg-slate-800">
                    <div className="p-4 border-b dark:border-slate-700">
                        <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">{isEditMode ? 'Editar Entrada' : 'Registrar Entrada de Mercancía'}</h2>
                        <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                           {isEditMode ? 'Modifica los detalles de la entrada.' : 'Añade aquí los productos que llegan a tu inventario.'}
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Entrada</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="w-full p-2 border rounded-md mt-1 focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Referencia (Opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Factura #123, Proveedor A"
                                        value={reference}
                                        onChange={e => setReference(e.target.value)}
                                        className="w-full p-2 border rounded-md mt-1 focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Buscar producto..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="px-4 pb-4 flex-1 overflow-y-auto">
                            <div className="space-y-3">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="grid grid-cols-12 gap-2 items-center">
                                        <label htmlFor={`qty-${product.id}`} className="col-span-8 sm:col-span-9 text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={product.name}>
                                            {product.name}
                                        </label>
                                        <div className="col-span-4 sm:col-span-3">
                                            <input
                                                id={`qty-${product.id}`}
                                                type="number"
                                                placeholder="Cant."
                                                min="0"
                                                value={quantities[product.id] || ''}
                                                onChange={e => handleQuantityChange(product.id, e.target.value)}
                                                className="w-full p-1.5 border rounded-md text-center focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t rounded-b-lg dark:bg-slate-800/50 dark:border-slate-700">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">{isEditMode ? 'Guardar Cambios' : 'Guardar Entrada'}</button>
                        </div>
                    </form>
                </div>
            </div>

            {entryToConfirm && (
                <ConfirmationModal
                    isOpen={!!entryToConfirm}
                    onClose={() => setEntryToConfirm(null)}
                    onConfirm={handleConfirmSave}
                    title="Confirmar Entrada"
                    message={`¿Estás seguro de que quieres ${isEditMode ? 'actualizar' : 'guardar'} esta entrada? El stock de los productos se ajustará de acuerdo a las cantidades especificadas.`}
                    confirmText="Confirmar"
                />
            )}
        </>
    );
};

export default StockInModal;