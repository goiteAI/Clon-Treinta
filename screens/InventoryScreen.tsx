

import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Product, StockHistoryEntry, StockInEntry } from '../types';
import EditStockModal from '../components/EditStockModal';
import ConfirmationModal from '../components/ConfirmationModal';
import StockInModal from '../components/StockInModal';


// --- MODAL DE PRODUCTO ---
const ProductModal: React.FC<{ onClose: () => void; productToEdit?: Product | null }> = ({ onClose, productToEdit }) => {
    const { addProduct, updateProduct } = useAppContext();
    const isEditMode = !!productToEdit;
    
    const [name, setName] = useState(productToEdit?.name || '');
    const [price, setPrice] = useState(productToEdit?.price || 0);
    const [cost, setCost] = useState(productToEdit?.cost || 0);
    const [stock, setStock] = useState(productToEdit?.stock || 0);
    const [imageUrl, setImageUrl] = useState(productToEdit?.imageUrl || '');
    const [imagePreview, setImagePreview] = useState<string | null>(productToEdit?.imageUrl || null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImageUrl(result);
                setImagePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || price <= 0) return;
        
        const finalImageUrl = imageUrl || `https://via.placeholder.com/200x200.png?text=${encodeURIComponent(name)}`;
        
        if (isEditMode && productToEdit) {
            const updatedProduct: Product = {
                ...productToEdit,
                name,
                price,
                cost,
                imageUrl: finalImageUrl,
            };
            updateProduct(updatedProduct);
        } else {
            const newProduct: Omit<Product, 'id' | 'stockHistory'> = { name, price, cost, stock, imageUrl: finalImageUrl };
            addProduct(newProduct);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col dark:bg-slate-800">
                <div className="p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">{isEditMode ? 'Editar Producto' : 'Añadir Producto'}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="flex flex-col items-center">
                            <label htmlFor="product-image" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Imagen del Producto</label>
                            <div className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center mb-2 overflow-hidden dark:bg-slate-700">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>
                            <input id="product-image" type="file" onChange={handleImageChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/50 dark:file:text-green-300 dark:hover:file:bg-green-900"/>
                        </div>
                        <input type="text" placeholder="Nombre del producto" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" required/>
                        <input type="number" placeholder="Precio de venta" value={price || ''} onChange={e => setPrice(parseFloat(e.target.value))} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" required/>
                        <input type="number" placeholder="Costo" value={cost || ''} onChange={e => setCost(parseFloat(e.target.value))} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        { !isEditMode && <input type="number" placeholder="Stock inicial" value={stock || ''} onChange={e => setStock(parseInt(e.target.value, 10))} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" required/>}
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

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);


// --- DASHBOARD DE INVENTARIO ---
type TimePeriod = 'today' | 'week' | 'month' | 'year';

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-slate-800 h-full">
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);


const InventoryDashboard: React.FC = () => {
    const { products } = useAppContext();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

    const reasonToText = (reason: StockHistoryEntry['reason']) => {
        const map = {
            'initial': 'Stock Inicial',
            'adjustment': 'Ajuste Manual',
            'sale': 'Venta',
            'sale_update': 'Venta Editada',
            'sale_delete': 'Venta Anulada',
            'restock': 'Entrada Mercancía',
            'restock_update': 'Entrada Editada',
            'restock_delete': 'Entrada Anulada'
        };
        return map[reason] || 'Desconocido';
    }

    const analyticsData = useMemo(() => {
        const now = new Date();
        let startDate: Date;

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (timePeriod) {
            case 'week': {
                const firstDayOfWeek = new Date(startOfToday); // Create a clone
                const day = firstDayOfWeek.getDay();
                // Adjust for Sunday being 0, assuming week starts on Monday
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
            case 'today':
            default:
                startDate = startOfToday;
                break;
        }

        const allMovements = products.flatMap(p => 
            p.stockHistory.map(h => ({ ...h, product: p }))
        );

        const filteredMovements = allMovements.filter(h => new Date(h.date) >= startDate);
        
        const unitsConsumed = filteredMovements.reduce((sum, h) => (h.reason === 'adjustment' && h.change < 0) ? sum + Math.abs(h.change) : sum, 0);

        return {
            unitsConsumed,
            recentMovements: filteredMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20),
        };
    }, [products, timePeriod]);
    

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-slate-800">
                <div className="flex justify-center mb-4 rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
                    {(['today', 'week', 'month', 'year'] as TimePeriod[]).map(period => (
                        <button
                            key={period}
                            onClick={() => setTimePeriod(period)}
                            className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${timePeriod === period ? 'bg-white text-green-600 shadow-sm dark:bg-slate-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        >
                            {period === 'today' ? 'Hoy' : period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Año'}
                        </button>
                    ))}
                </div>
                <div className="mb-6">
                    <div className="max-w-xs mx-auto">
                        <StatCard title="Unidades Consumidas" value={analyticsData.unitsConsumed.toString()} color="text-orange-500" />
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-slate-800">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Historial de Movimientos Recientes</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {analyticsData.recentMovements.length > 0 ? analyticsData.recentMovements.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 text-sm p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 rounded-md object-cover bg-slate-100 flex-shrink-0"/>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{item.product.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{reasonToText(item.reason)}</p>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold text-lg ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.change > 0 ? '+' : ''}{item.change}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>
                    )) : <p className="text-center text-slate-500 py-4">No hay movimientos registrados.</p>}
                </div>
            </div>
        </div>
    );
};

// --- HISTORIAL DE ENTRADAS DE MERCANCÍA ---
const StockInHistoryView: React.FC<{
    onEdit: (entry: StockInEntry) => void;
    onDelete: (entry: StockInEntry) => void;
}> = ({ onEdit, onDelete }) => {
    const { stockInEntries, products } = useAppContext();
    const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

    const getProduct = (id: string) => products.find(p => p.id === id);

    const handleToggleExpand = (entryId: string) => {
        setExpandedEntryId(prevId => (prevId === entryId ? null : entryId));
    };

    return (
        <div className="space-y-3">
            {stockInEntries.length > 0 ? stockInEntries.map(entry => {
                const isExpanded = expandedEntryId === entry.id;
                const totalItems = entry.items.reduce((sum, item) => sum + item.quantity, 0);

                return (
                    <div key={entry.id} className="bg-white rounded-lg shadow-sm dark:bg-slate-800">
                        <div className="w-full p-3 flex items-center gap-4 text-left">
                            <button 
                                onClick={() => handleToggleExpand(entry.id)}
                                className="flex items-center gap-4 text-left flex-grow"
                                aria-expanded={isExpanded}
                                aria-controls={`stockin-details-${entry.id}`}
                            >
                                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 dark:bg-slate-700 dark:text-slate-400 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                                        {new Date(entry.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {entry.reference ? `Ref: ${entry.reference}` : 'Sin referencia'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-green-600">+{totalItems}</p>
                                        <p className="text-xs text-slate-400">unidades</p>
                                    </div>
                                    <ChevronDownIcon className={`h-5 w-5 transition-transform text-slate-400 ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                            <div className="flex flex-col gap-2 ml-2">
                                <button onClick={() => onEdit(entry)} className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 p-1" aria-label="Editar entrada"><PencilIcon className="w-5 h-5"/></button>
                                <button onClick={() => onDelete(entry)} className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 p-1" aria-label="Eliminar entrada"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        {isExpanded && (
                            <div id={`stockin-details-${entry.id}`} className="px-4 pb-4">
                                <div className="border-t pt-3 dark:border-slate-700">
                                    <ul className="space-y-2">
                                        {entry.items.map(item => {
                                            const product = getProduct(item.productId);
                                            return (
                                                <li key={item.productId} className="flex justify-between items-center text-sm p-2 rounded-md bg-slate-50 dark:bg-slate-700/50">
                                                    <span className="text-slate-700 dark:text-slate-300">{product?.name || 'Producto no encontrado'}</span>
                                                    <span className="font-semibold text-slate-800 dark:text-slate-100">+{item.quantity} uds.</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }) : (
                <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-lg dark:bg-slate-800/50 dark:text-slate-400">
                    <p>No has registrado ninguna entrada de mercancía.</p>
                    <p className="text-sm">Usa el botón azul para añadir tu primera entrada.</p>
                </div>
            )}
        </div>
    );
};


// --- PANTALLA PRINCIPAL DE INVENTARIO ---
const InventoryScreen: React.FC = () => {
    const { products, deleteProduct, deleteStockInEntry } = useAppContext();
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [stockEditingProduct, setStockEditingProduct] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [stockInEntryToEdit, setStockInEntryToEdit] = useState<StockInEntry | null>(null);
    const [stockInEntryToDelete, setStockInEntryToDelete] = useState<StockInEntry | null>(null);
    const [activeTab, setActiveTab] = useState<'list' | 'dashboard' | 'stock_in_history'>('list');
    const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
    const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

    const formatCurrency = (amount: number) => amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    
    const canAddStockIn = products.length > 0;

    const handleOpenAddModal = () => {
        setProductToEdit(null);
        setIsProductModalOpen(true);
    };
    
    const handleOpenStockInAddModal = () => {
        setStockInEntryToEdit(null);
        setIsStockInModalOpen(true);
    };

    const handleOpenStockInEditModal = (entry: StockInEntry) => {
        setStockInEntryToEdit(entry);
        setIsStockInModalOpen(true);
    };

    const handleOpenEditModal = (product: Product) => {
        setProductToEdit(product);
        setIsProductModalOpen(true);
    };
    
    const handleDeleteConfirm = () => {
        if (productToDelete) {
            deleteProduct(productToDelete.id);
            setProductToDelete(null);
        }
    };
    
    const handleStockInDeleteConfirm = () => {
        if (stockInEntryToDelete) {
            deleteStockInEntry(stockInEntryToDelete.id);
            setStockInEntryToDelete(null);
        }
    };

    const handleToggleExpand = (productId: string) => {
        setExpandedProductId(prevId => (prevId === productId ? null : productId));
    };
    
    const reasonToText = (reason: StockHistoryEntry['reason']) => {
        const map = {
            'initial': 'Stock Inicial',
            'adjustment': 'Ajuste Manual',
            'sale': 'Venta',
            'sale_update': 'Venta Editada',
            'sale_delete': 'Venta Anulada',
            'restock': 'Entrada Mercancía',
            'restock_update': 'Entrada Editada',
            'restock_delete': 'Entrada Anulada'
        };
        return map[reason] || 'Desconocido';
    }


    return (
        <div>
            <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Inventario</h1>
            </header>

            <div className="p-4">
                <div className="border-b mb-4 dark:border-slate-700">
                    <div className="flex -mb-px">
                        <button onClick={() => setActiveTab('list')} className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'list' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                            Productos
                        </button>
                        <button onClick={() => setActiveTab('stock_in_history')} className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'stock_in_history' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                            Entradas Registradas
                        </button>
                        <button onClick={() => setActiveTab('dashboard')} className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                            Análisis
                        </button>
                    </div>
                </div>

                {activeTab === 'list' && (
                    <div className="space-y-3 pb-20">
                        {products.map(p => {
                            const isExpanded = expandedProductId === p.id;
                            
                            const sortedHistory = [...p.stockHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                            let runningStock = 0;
                            const historyWithStock = sortedHistory.map(entry => {
                                runningStock += entry.change;
                                return { ...entry, resultingStock: runningStock };
                            }).reverse();

                            return (
                                <div key={p.id} className="bg-white rounded-lg shadow-sm dark:bg-slate-800 transition-all duration-300">
                                    <div className="w-full p-3 flex items-center gap-2 text-left">
                                        <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-md object-cover bg-slate-100 flex-shrink-0"/>
                                        
                                        <button
                                            type="button"
                                            onClick={() => handleToggleExpand(p.id)}
                                            className="flex-1 flex items-center justify-between text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                            aria-expanded={isExpanded}
                                            aria-controls={`product-history-${p.id}`}
                                        >
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Precio: {formatCurrency(p.price)}</p>
                                            </div>
                                            <ChevronDownIcon className={`h-5 w-5 transition-transform text-slate-400 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>

                                        <button
                                            onClick={() => setStockEditingProduct(p)}
                                            className="text-right hover:bg-slate-100 p-2 rounded-lg transition-colors dark:hover:bg-slate-700 flex-shrink-0"
                                            aria-label={`Editar stock de ${p.name}`}
                                        >
                                            <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{p.stock}</p>
                                            <p className="text-xs text-slate-400">en stock</p>
                                        </button>
                                    </div>
                                     {isExpanded && (
                                        <div id={`product-history-${p.id}`} className="px-4 pb-4">
                                            <div className="border-t pt-4 dark:border-slate-700">
                                                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Historial de Movimientos</h4>
                                                {historyWithStock.length > 0 ? (
                                                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                                                        {historyWithStock.map((item, index) => (
                                                            <li key={index} className="flex justify-between items-center text-sm p-2 rounded-md bg-slate-50 dark:bg-slate-700/50">
                                                                <div>
                                                                    <p className="font-medium text-slate-800 dark:text-slate-200">{reasonToText(item.reason)}</p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(item.date).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className={`font-bold text-lg ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {item.change > 0 ? '+' : ''}{item.change}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Resultante: {item.resultingStock}</p>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-center text-sm text-slate-500 py-4">No hay historial de movimientos para este producto.</p>
                                                )}

                                                <div className="mt-4 pt-4 border-t border-dashed dark:border-slate-600 flex items-center justify-end gap-4">
                                                    <button 
                                                        onClick={() => handleOpenEditModal(p)}
                                                        className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" aria-label={`Editar ${p.name}`}
                                                    >
                                                        <PencilIcon className="w-4 h-4"/>
                                                        <span>Editar</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => setProductToDelete(p)}
                                                        className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors" aria-label={`Eliminar ${p.name}`}
                                                    >
                                                        <TrashIcon className="w-4 h-4"/>
                                                        <span>Eliminar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
                
                {activeTab === 'stock_in_history' && (
                    <StockInHistoryView 
                        onEdit={handleOpenStockInEditModal} 
                        onDelete={setStockInEntryToDelete} 
                    />
                )}
                {activeTab === 'dashboard' && <InventoryDashboard />}
            </div>

            {isFabMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 z-40" 
                    onClick={() => setIsFabMenuOpen(false)}
                    aria-hidden="true"
                ></div>
            )}
            <div className="fixed bottom-20 right-5 z-40 flex flex-col items-end gap-4">
                {/* Action Menu */}
                <div 
                    className={`transition-all duration-300 ease-in-out flex flex-col items-end gap-4 ${isFabMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                >
                    {/* Action button 1: Add Stock In */}
                    <div className="flex items-center gap-3">
                        <span className={`bg-white text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200 px-3 py-1 rounded-md shadow-sm ${!canAddStockIn && 'text-slate-400 dark:text-slate-500'}`}>
                            Registrar Entrada
                        </span>
                        <button 
                            onClick={() => { handleOpenStockInAddModal(); setIsFabMenuOpen(false); }} 
                            className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
                            aria-label={canAddStockIn ? "Registrar Entrada de Mercancía" : "Añada productos para registrar entradas"}
                            disabled={!canAddStockIn}
                            title={!canAddStockIn ? "Primero debes añadir productos." : "Registrar Entrada de Mercancía"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Action button 2: Add Product */}
                    <div className="flex items-center gap-3">
                        <span className="bg-white text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200 px-3 py-1 rounded-md shadow-sm">
                            Añadir Producto
                        </span>
                        <button 
                            onClick={() => { handleOpenAddModal(); setIsFabMenuOpen(false); }} 
                            className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-green-700"
                            aria-label="Añadir nuevo producto"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Main FAB */}
                <button 
                    onClick={() => setIsFabMenuOpen(!isFabMenuOpen)} 
                    className="bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                    aria-haspopup="true"
                    aria-expanded={isFabMenuOpen}
                    aria-label="Añadir nuevo"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 transition-transform duration-300 ${isFabMenuOpen ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
            
            {isProductModalOpen && <ProductModal productToEdit={productToEdit} onClose={() => setIsProductModalOpen(false)} />}
            {isStockInModalOpen && <StockInModal stockInEntryToEdit={stockInEntryToEdit} onClose={() => setIsStockInModalOpen(false)} />}
            {stockEditingProduct && <EditStockModal product={stockEditingProduct} onClose={() => setStockEditingProduct(null)} />}
            {productToDelete && (
                <ConfirmationModal
                    isOpen={!!productToDelete}
                    onClose={() => setProductToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que quieres eliminar el producto "${productToDelete.name}"? Esta acción no se puede deshacer.`}
                />
            )}
            {stockInEntryToDelete && (
                <ConfirmationModal
                    isOpen={!!stockInEntryToDelete}
                    onClose={() => setStockInEntryToDelete(null)}
                    onConfirm={handleStockInDeleteConfirm}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que quieres eliminar esta entrada de mercancía? El stock de los productos involucrados será revertido. Esta acción no se puede deshacer.`}
                />
            )}
        </div>
    );
};

export default InventoryScreen;