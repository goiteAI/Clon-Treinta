import React, { useState, useMemo } from 'recharts';
import { useAppContext } from '../context/AppContext';
import type { Product, StockHistoryEntry } from '../types';
import EditStockModal from '../components/EditStockModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';


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
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
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


// --- DASHBOARD DE INVENTARIO ---
type TimePeriod = 'today' | 'week' | 'month' | 'year';

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-slate-800">
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

const InventoryDashboard: React.FC = () => {
    const { products } = useAppContext();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    };

    const analyticsData = useMemo(() => {
        const now = new Date();
        let startDate: Date;
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (timePeriod) {
            case 'week':
                const dayOfWeek = today.getDay();
                const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                startDate = new Date(new Date(today.setDate(diff)).setHours(0, 0, 0, 0));
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'today':
            default:
                startDate = today;
                break;
        }

        const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0);
        const profitPotential = products.reduce((sum, p) => sum + (p.stock * (p.price - p.cost)), 0);

        const allMovements = products.flatMap(p => 
            p.stockHistory.map(h => ({ ...h, product: p }))
        );

        const filteredMovements = allMovements.filter(h => new Date(h.date) >= startDate);
        
        const unitsSold = filteredMovements.reduce((sum, h) => h.change < 0 ? sum + Math.abs(h.change) : sum, 0);
        const unitsAdded = filteredMovements.reduce((sum, h) => h.change > 0 ? sum + h.change : sum, 0);

        return {
            inventoryValue,
            profitPotential,
            unitsSold,
            unitsAdded,
            recentMovements: allMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20),
            chartData: [{ name: 'Movimientos', Entradas: unitsAdded, Salidas: unitsSold }],
        };
    }, [products, timePeriod]);
    
    const reasonToText = (reason: StockHistoryEntry['reason']) => {
        const map = {
            'initial': 'Stock Inicial',
            'adjustment': 'Ajuste Manual',
            'sale': 'Venta',
            'sale_update': 'Venta Editada',
            'sale_delete': 'Venta Anulada',
        };
        return map[reason] || 'Desconocido';
    }

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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard title="Valor del Inventario" value={formatCurrency(analyticsData.inventoryValue)} color="text-blue-600" />
                    <StatCard title="Potencial de Ganancia" value={formatCurrency(analyticsData.profitPotential)} color="text-green-600" />
                    <StatCard title="Unidades Vendidas" value={analyticsData.unitsSold.toString()} color="text-red-600" />
                    <StatCard title="Unidades Añadidas" value={analyticsData.unitsAdded.toString()} color="text-green-600" />
                </div>
                
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '0.5rem', backdropFilter: 'blur(5px)' }}/>
                            <Legend />
                            <Bar dataKey="Entradas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Salidas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-slate-800">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Historial de Movimientos Recientes</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {analyticsData.recentMovements.length > 0 ? analyticsData.recentMovements.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{item.product.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(item.date).toLocaleString('es-ES')} - {reasonToText(item.reason)}</p>
                            </div>
                            <span className={`font-bold text-lg ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {item.change > 0 ? '+' : ''}{item.change}
                            </span>
                        </div>
                    )) : <p className="text-center text-slate-500 py-4">No hay movimientos registrados.</p>}
                </div>
            </div>
        </div>
    );
};


// --- PANTALLA PRINCIPAL DE INVENTARIO ---
const InventoryScreen: React.FC = () => {
    const { products, deleteProduct } = useAppContext();
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [stockEditingProduct, setStockEditingProduct] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState<'list' | 'dashboard'>('list');

    const formatCurrency = (amount: number) => amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    
    const handleOpenAddModal = () => {
        setProductToEdit(null);
        setIsProductModalOpen(true);
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


    return (
        <div>
            <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Inventario</h1>
            </header>

            <div className="p-4">
                <div className="border-b mb-4 dark:border-slate-700">
                    <div className="flex -mb-px">
                        <button onClick={() => setActiveTab('list')} className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'list' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                            Lista de Productos
                        </button>
                        <button onClick={() => setActiveTab('dashboard')} className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                            Análisis de Inventario
                        </button>
                    </div>
                </div>

                {activeTab === 'list' && (
                    <div className="space-y-3">
                        {products.map(p => (
                            <div key={p.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-4 dark:bg-slate-800">
                                <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-md object-cover bg-slate-100"/>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Precio: {formatCurrency(p.price)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setStockEditingProduct(p)} 
                                        className="text-right hover:bg-slate-100 p-2 rounded-md transition-colors dark:hover:bg-slate-700"
                                        aria-label={`Editar stock de ${p.name}`}
                                    >
                                    <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{p.stock}</p>
                                    <p className="text-xs text-slate-400">en stock</p>
                                    </button>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => handleOpenEditModal(p)} className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors" aria-label={`Editar ${p.name}`}>
                                            <PencilIcon className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => setProductToDelete(p)} className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors" aria-label={`Eliminar ${p.name}`}>
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'dashboard' && <InventoryDashboard />}
            </div>

            {activeTab === 'list' && (
                <button onClick={handleOpenAddModal} className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105" aria-label="Añadir nuevo producto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            )}
            
            {isProductModalOpen && <ProductModal productToEdit={productToEdit} onClose={() => setIsProductModalOpen(false)} />}
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
        </div>
    );
};

export default InventoryScreen;