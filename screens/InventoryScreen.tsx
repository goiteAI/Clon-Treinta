import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Product } from '../types';

const AddProductModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addProduct } = useAppContext();
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [cost, setCost] = useState(0);
    const [stock, setStock] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || price <= 0 || stock < 0) return;
        
        const newProduct: Omit<Product, 'id'> = { name, price, cost, stock, imageUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 200)}/200` };
        addProduct(newProduct);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Añadir Producto</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input type="text" placeholder="Nombre del producto" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required/>
                    <input type="number" placeholder="Precio de venta" value={price || ''} onChange={e => setPrice(parseFloat(e.target.value))} className="w-full p-2 border rounded" required/>
                    <input type="number" placeholder="Costo" value={cost || ''} onChange={e => setCost(parseFloat(e.target.value))} className="w-full p-2 border rounded" />
                    <input type="number" placeholder="Stock inicial" value={stock || ''} onChange={e => setStock(parseInt(e.target.value, 10))} className="w-full p-2 border rounded" required/>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md">Guardar</button>
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
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <h2 className="text-xl font-bold mb-2">Editar Stock</h2>
                <p className="text-slate-600 mb-4">Producto: <span className="font-semibold">{product.name}</span></p>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <label htmlFor="stock" className="block text-sm font-medium text-slate-700">Nueva cantidad en stock</label>
                    <input 
                        id="stock"
                        type="number" 
                        placeholder="Cantidad en stock" 
                        value={stock} 
                        onChange={e => setStock(parseInt(e.target.value, 10) || 0)} 
                        className="w-full p-2 border rounded" 
                        required
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md">Actualizar</button>
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
        <div className="p-4">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Inventario</h1>
            <div className="space-y-3">
                {products.map(p => (
                    <div key={p.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-4">
                        <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-md object-cover"/>
                        <div className="flex-1">
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-sm text-slate-500">Precio: {formatCurrency(p.price)}</p>
                        </div>
                        <button 
                            onClick={() => setEditingProduct(p)} 
                            className="text-right hover:bg-slate-100 p-2 rounded-md transition-colors"
                            aria-label={`Editar stock de ${p.name}`}
                        >
                           <p className="font-bold text-lg">{p.stock}</p>
                           <p className="text-xs text-slate-400">en stock</p>
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-3xl">+</button>
            {isAddModalOpen && <AddProductModal onClose={() => setIsAddModalOpen(false)} />}
            {editingProduct && <EditStockModal product={editingProduct} onClose={() => setEditingProduct(null)} />}
        </div>
    );
};

export default InventoryScreen;