import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Product } from '../types';

const AddProductModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addProduct } = useAppContext();
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [cost, setCost] = useState(0);
    const [stock, setStock] = useState(0);
    const [imageUrl, setImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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
        if(!name || price <= 0 || stock < 0) return;
        
        const finalImageUrl = imageUrl || `https://via.placeholder.com/200x200.png?text=${encodeURIComponent(name)}`;
        const newProduct: Omit<Product, 'id'> = { name, price, cost, stock, imageUrl: finalImageUrl };
        addProduct(newProduct);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col dark:bg-slate-800">
                <div className="p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">Añadir Producto</h2>
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
                        <input type="number" placeholder="Stock inicial" value={stock || ''} onChange={e => setStock(parseInt(e.target.value, 10))} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" required/>
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

const EditStockModal: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
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

const InventoryScreen: React.FC = () => {
    const { products } = useAppContext();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const formatCurrency = (amount: number) => amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    return (
        <div>
            <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Inventario</h1>
            </header>
            <div className="p-4 space-y-3">
                {products.map(p => (
                    <div key={p.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-4 dark:bg-slate-800">
                        <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-md object-cover bg-slate-100"/>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Precio: {formatCurrency(p.price)}</p>
                        </div>
                        <button 
                            onClick={() => setEditingProduct(p)} 
                            className="text-right hover:bg-slate-100 p-2 rounded-md transition-colors dark:hover:bg-slate-700"
                            aria-label={`Editar stock de ${p.name}`}
                        >
                           <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{p.stock}</p>
                           <p className="text-xs text-slate-400">en stock</p>
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
            {isAddModalOpen && <AddProductModal onClose={() => setIsAddModalOpen(false)} />}
            {editingProduct && <EditStockModal product={editingProduct} onClose={() => setEditingProduct(null)} />}
        </div>
    );
};

export default InventoryScreen;