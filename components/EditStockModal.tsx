import React, { useState } from 'react';
import type { Product } from '../types';
import { useAppContext } from '../context/AppContext';

interface EditStockModalProps {
  product: Product;
  onClose: () => void;
}

const EditStockModal: React.FC<EditStockModalProps> = ({ product, onClose }) => {
    const { updateProductStock } = useAppContext();
    const [stock, setStock] = useState(product.stock);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (stock < 0) return;
        updateProductStock(product.id, stock);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col dark:bg-slate-800">
                <div className="p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">Editar Stock</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <p className="text-slate-600 text-center dark:text-slate-300">Producto: <span className="font-semibold text-slate-800 dark:text-slate-100">{product.name}</span></p>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nueva cantidad en stock</label>
                            <input 
                                id="stock"
                                type="number" 
                                placeholder="Cantidad en stock" 
                                value={stock} 
                                onChange={e => setStock(parseInt(e.target.value, 10) || 0)} 
                                className="w-full p-2 border rounded-md mt-1 focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                                required
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t rounded-b-lg dark:bg-slate-800/50 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">Actualizar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStockModal;
