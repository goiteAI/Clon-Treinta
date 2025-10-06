import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Transaction } from '../types';

interface TopSoldProductsModalProps {
    onClose: () => void;
    transactions: Transaction[];
    periodTitle: string;
}

const TopSoldProductsModal: React.FC<TopSoldProductsModalProps> = ({ onClose, transactions, periodTitle }) => {
    const { products } = useAppContext();
    const formatCurrency = (amount: number) => amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    const topProducts = useMemo(() => {
        const productSales = new Map<string, { productId: string; quantity: number }>();

        transactions.forEach(transaction => {
            transaction.items.forEach(item => {
                const existing = productSales.get(item.productId);
                if (existing) {
                    productSales.set(item.productId, { ...existing, quantity: existing.quantity + item.quantity });
                } else {
                    productSales.set(item.productId, { productId: item.productId, quantity: item.quantity });
                }
            });
        });

        return Array.from(productSales.values())
            .sort((a, b) => b.quantity - a.quantity)
            .map(sale => {
                const product = products.find(p => p.id === sale.productId);
                return { ...sale, product };
            })
            .filter(item => !!item.product);
    }, [transactions, products]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col dark:bg-slate-800">
                <div className="p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">Productos más vendidos</h2>
                    <p className="text-sm text-center text-slate-500 dark:text-slate-400">{periodTitle}</p>
                </div>
                <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    {topProducts.length > 0 ? topProducts.map((item, index) => (
                        <div key={item.productId} className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <span className="font-bold text-lg text-slate-400 dark:text-slate-500 w-8 text-center">#{index + 1}</span>
                            <img src={item.product!.imageUrl} alt={item.product!.name} className="w-12 h-12 rounded-md object-cover bg-slate-100"/>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{item.product!.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Precio: {formatCurrency(item.product!.price)}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-xl text-green-600">{item.quantity}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">vendidos</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-slate-500 py-10">
                            <p>No hay productos vendidos en este período.</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t rounded-b-lg dark:bg-slate-800/50 dark:border-slate-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default TopSoldProductsModal;
