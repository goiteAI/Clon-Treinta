import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Contact } from '../types';

type TimePeriod = 'week' | 'month' | 'year';

const ClientDetailModal: React.FC<{ client: Contact; onClose: () => void }> = ({ client, onClose }) => {
    const { transactions, products } = useAppContext();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

    const clientProductData = useMemo(() => {
        const now = new Date();
        let startDate: Date;
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (timePeriod) {
            case 'week': {
                const firstDayOfWeek = new Date(today);
                const day = firstDayOfWeek.getDay();
                const diff = firstDayOfWeek.getDate() - day + (day === 0 ? -6 : 1);
                firstDayOfWeek.setDate(diff);
                startDate = new Date(firstDayOfWeek.setHours(0, 0, 0, 0));
                break;
            }
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
        }

        const filteredTransactions = transactions.filter(t => 
            t.contactId === client.id && new Date(t.date) >= startDate
        );

        const productQuantities = new Map<string, number>();
        filteredTransactions.forEach(t => {
            t.items.forEach(item => {
                productQuantities.set(item.productId, (productQuantities.get(item.productId) || 0) + item.quantity);
            });
        });

        return Array.from(productQuantities.entries())
            .map(([productId, totalQuantity]) => {
                const product = products.find(p => p.id === productId);
                return { product, totalQuantity };
            })
            .filter(item => !!item.product)
            .sort((a, b) => b.totalQuantity - a.totalQuantity);

    }, [client, timePeriod, transactions, products]);

    const periodTitles: Record<TimePeriod, string> = {
        week: 'Esta Semana',
        month: 'Este Mes',
        year: 'Este Año'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col dark:bg-slate-800 max-h-[85vh]">
                <div className="p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">{client.name}</h2>
                    <p className="text-sm text-center text-slate-500 dark:text-slate-400">Productos comprados</p>
                </div>
                
                <div className="p-4">
                    <div className="flex justify-center mb-4 rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
                      {(['week', 'month', 'year'] as TimePeriod[]).map(period => (
                        <button
                          key={period}
                          onClick={() => setTimePeriod(period)}
                          className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${timePeriod === period ? 'bg-white text-green-600 shadow-sm dark:bg-slate-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                          {periodTitles[period]}
                        </button>
                      ))}
                    </div>
                </div>

                <div className="px-4 pb-4 space-y-3 flex-1 overflow-y-auto">
                    {clientProductData.length > 0 ? clientProductData.map(({ product, totalQuantity }) => (
                        <div key={product!.id} className="flex items-center gap-4 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            <img src={product!.imageUrl} alt={product!.name} className="w-12 h-12 rounded-md object-cover bg-slate-100 flex-shrink-0"/>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{product!.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-xl text-green-600">{totalQuantity}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">unidades</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-slate-500 py-10">
                            <p>Este cliente no ha comprado productos en el período seleccionado.</p>
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

export default ClientDetailModal;