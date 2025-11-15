import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Transaction, TransactionItem, Product } from '../types';
import { GoogleGenerativeAI, Type } from '@google/generative-ai';

interface AddSaleModalProps {
    onClose: () => void;
    transactionToEdit?: Transaction | null;
}

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.471-1.471L13 18.75l1.188-.648a2.25 2.25 0 011.471-1.471L16.25 15l.648 1.188a2.25 2.25 0 011.471 1.471L19.5 18.75l-1.188.648a2.25 2.25 0 01-1.471 1.471z" />
    </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);


// Memoized component for better performance on product list rendering
const ProductButton = React.memo(({ 
    product, 
    onAdd, 
    availableStock 
}: { 
    product: Product, 
    onAdd: (product: Product) => void, 
    availableStock: number 
}) => {
    return (
        <button
            onClick={() => onAdd(product)}
            disabled={availableStock <= 0}
            className={`relative group flex flex-col items-center justify-start text-center border rounded-lg overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
                ${availableStock <= 0
                    ? 'bg-slate-50 dark:bg-slate-700/50 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-700 hover:shadow-md hover:-translate-y-1'
                }`}
            aria-label={`Añadir ${product.name} al carrito`}
        >
            <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-600">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
                {availableStock <= 0 && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center">
                        <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300 rounded-full">
                            Agotado
                        </span>
                    </div>
                )}
            </div>
            <div className="p-2 w-full">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate" title={product.name}>
                    {product.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    ({availableStock})
                </p>
            </div>
        </button>
    );
});


// Memoized and self-contained component for cart items to improve performance and state management
const CartItem = React.memo(({
    item,
    product,
    maxStock,
    onUpdateQuantity,
    onRemove
}: {
    item: TransactionItem;
    product: Product;
    maxStock: number;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemove: (productId: string) => void;
}) => {
    const [inputValue, setInputValue] = useState(String(item.quantity));
    const inputId = `qty-input-${item.productId}`;

    useEffect(() => {
        if (document.activeElement?.id !== inputId) {
            setInputValue(String(item.quantity));
        }
    }, [item.quantity, inputId]);

    const handleBlur = () => {
        const newQuantity = parseInt(inputValue, 10) || 0;
        onUpdateQuantity(item.productId, newQuantity);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    return (
         <li className="flex items-center gap-2 text-sm border-b pb-2 dark:border-slate-700">
            <div className="flex-grow">
                <p className="font-semibold">{product.name}</p>
                <p className="text-xs text-slate-500">${item.unitPrice.toLocaleString('es-CO')} c/u</p>
            </div>
            <div className="flex items-center gap-1">
                <button type="button" onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 bg-slate-200 hover:bg-slate-300 rounded-md font-bold transition-colors dark:bg-slate-600 dark:hover:bg-slate-500">-</button>
                <input
                    id={inputId}
                    type="number"
                    value={inputValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-12 text-center border rounded-md p-1 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    max={maxStock}
                    min="0"
                />
                <button type="button" onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 bg-slate-200 hover:bg-slate-300 rounded-md font-bold transition-colors dark:bg-slate-600 dark:hover:bg-slate-500">+</button>
            </div>
            <p className="w-24 text-right font-medium">
                ${(item.unitPrice * item.quantity).toLocaleString('es-CO')}
            </p>
            <button type="button" onClick={() => onRemove(item.productId)} className="text-red-500 hover:text-red-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </li>
    );
});


const AddSaleModal: React.FC<AddSaleModalProps> = ({ onClose, transactionToEdit }) => {
    const { products, contacts, addTransaction, updateTransaction } = useAppContext();
    const isEditMode = !!transactionToEdit;

    const [cart, setCart] = useState<TransactionItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Crédito' | 'Transferencia'>('Efectivo');
    const [contactId, setContactId] = useState<string>('');
    const [paymentDays, setPaymentDays] = useState<number>(0);
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

    const [pastedOrder, setPastedOrder] = useState('');
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [aiNotification, setAiNotification] = useState<string | null>(null);
    const [showPasteSection, setShowPasteSection] = useState(false);


    const getAvailableStock = useCallback((product: Product) => {
        if (!isEditMode || !transactionToEdit) {
            return product.stock;
        }
        const originalItem = transactionToEdit.items.find(i => i.productId === product.id);
        return product.stock + (originalItem?.quantity || 0);
    }, [isEditMode, transactionToEdit, products]);

    useEffect(() => {
        if (isEditMode && transactionToEdit) {
            setCart(transactionToEdit.items);
            setPaymentMethod(transactionToEdit.paymentMethod);
            setContactId(transactionToEdit.contactId || '');
            setTransactionDate(new Date(transactionToEdit.date).toISOString().split('T')[0]);
            if (transactionToEdit.dueDate && transactionToEdit.paymentMethod === 'Crédito') {
                const due = new Date(transactionToEdit.dueDate);
                const start = new Date(transactionToEdit.date);
                const diffTime = Math.max(0, due.getTime() - start.getTime());
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
                setPaymentDays(diffDays);
            } else {
                setPaymentDays(0);
            }
        }
    }, [isEditMode, transactionToEdit]);

    const handleAddProduct = useCallback((product: Product) => {
        const availableStock = getAvailableStock(product);
        if (availableStock <= 0) return;

        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.productId === product.id);
            if (existingItem) {
                if (existingItem.quantity < availableStock) {
                    return currentCart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
                }
                return currentCart;
            } else {
                return [...currentCart, { productId: product.id, quantity: 1, unitPrice: product.price }];
            }
        });
    }, [getAvailableStock]);
    
    const handleUpdateQuantity = useCallback((productId: string, newQuantity: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        const availableStock = getAvailableStock(product);
        const validatedQuantity = Math.max(0, Math.min(availableStock, newQuantity));

        setCart(currentCart => {
            if (validatedQuantity === 0) {
                return currentCart.filter(item => item.productId !== productId);
            } else {
                return currentCart.map(item => item.productId === productId ? { ...item, quantity: validatedQuantity } : item);
            }
        });
    }, [getAvailableStock, products]);

    const handleRemoveItem = useCallback((productId: string) => {
        setCart(currentCart => currentCart.filter(item => item.productId !== productId));
    }, []);

    const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [cart]);

    const handleProcessOrder = async () => {
        setIsProcessingAI(true);
        setAiNotification(null);
        
        const availableProductNames = products.map(p => p.name).join(', ');
        
        try {
            const ai = new GoogleGenerativeAI({ apiKey: process.env.API_KEY || '' });
            const prompt = `Analiza el siguiente texto de un pedido y extrae los productos y sus cantidades. Solo puedes usar productos de la lista de "Productos disponibles". Ignora cualquier texto que no sea un pedido, saludos o despedidas.

Texto del pedido:
"${pastedOrder}"

Productos disponibles:
${availableProductNames}

Responde únicamente con el JSON.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                productName: { type: Type.STRING, description: `El nombre del producto, debe coincidir exactamente con uno de la lista de productos disponibles.` },
                                quantity: { type: Type.NUMBER, description: 'La cantidad del producto solicitado.' },
                            },
                            required: ['productName', 'quantity'],
                        },
                    },
                }
            });

            const parsedItems = JSON.parse(response.text);
            
            if (!Array.isArray(parsedItems)) {
                throw new Error("La respuesta de la IA no es una lista válida.");
            }

            const newCartItems: TransactionItem[] = [];
            const notFoundProducts: string[] = [];

            for (const item of parsedItems) {
                const product = products.find(p => p.name.toLowerCase() === item.productName.toLowerCase());
                if (product) {
                    newCartItems.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price });
                } else {
                    notFoundProducts.push(item.productName);
                }
            }
            
            setCart(currentCart => {
                 const mergedCart = [...currentCart];
                 newCartItems.forEach(newItem => {
                    const existingItemIndex = mergedCart.findIndex(ci => ci.productId === newItem.productId);
                    if (existingItemIndex > -1) {
                        mergedCart[existingItemIndex].quantity += newItem.quantity;
                    } else {
                        mergedCart.push(newItem);
                    }
                });

                return mergedCart.map(item => {
                    const product = products.find(p => p.id === item.productId)!;
                    const availableStock = getAvailableStock(product);
                    return { ...item, quantity: Math.min(item.quantity, availableStock) };
                }).filter(item => item.quantity > 0);
            });


            if (notFoundProducts.length > 0) {
                setAiNotification(`No se encontraron: ${notFoundProducts.join(', ')}. Por favor, añádelos manualmente.`);
            } else {
                setAiNotification('¡Pedido añadido al carrito!');
                setTimeout(() => setAiNotification(null), 3000);
            }

        } catch (error) {
            console.error("Error processing order with AI:", error);
            setAiNotification('Hubo un error al analizar el pedido. Por favor, intenta de nuevo.');
        } finally {
            setIsProcessingAI(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return;

        const date = new Date(transactionDate);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); 

        const baseTransaction = {
            items: cart,
            totalAmount,
            date: date.toISOString(),
            paymentMethod,
        };

        const dueDate = (paymentMethod === 'Crédito' && paymentDays > 0)
            ? new Date(new Date(baseTransaction.date).setDate(new Date(baseTransaction.date).getDate() + (paymentDays - 1))).toISOString()
            : undefined;

        if (isEditMode && transactionToEdit) {
            const updatedTransaction: Transaction = {
                ...transactionToEdit,
                ...baseTransaction,
                contactId: contactId || undefined,
                dueDate: dueDate,
            };
            updateTransaction(updatedTransaction);
        } else {
            const newTransaction = {
                ...baseTransaction,
                ...(contactId ? { contactId } : {}),
                ...(dueDate ? { dueDate } : {}),
            };
            addTransaction(newTransaction as Omit<Transaction, 'id'>);
        }
        
        onClose();
    };
    
    const getProduct = (id: string) => products.find(p => p.id === id);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] flex flex-col dark:bg-slate-800">
                <div className="p-4 border-b dark:border-slate-700">
                  <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">{isEditMode ? 'Editar Venta' : 'Registrar Venta'}</h2>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto pr-2 space-y-4">
                     <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <button type="button" onClick={() => setShowPasteSection(!showPasteSection)} className="flex justify-between items-center w-full p-3 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Pegar pedido de WhatsApp</span>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform ${showPasteSection ? 'rotate-180' : ''}`} />
                        </button>
                        {showPasteSection && (
                            <div className="p-3 border-t dark:border-slate-700 space-y-2">
                                <textarea 
                                    value={pastedOrder}
                                    onChange={(e) => setPastedOrder(e.target.value)}
                                    placeholder="Pega aquí el mensaje de tu cliente..."
                                    className="w-full h-24 p-2 border rounded-md focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    disabled={isProcessingAI}
                                />
                                <button
                                    type="button"
                                    onClick={handleProcessOrder}
                                    disabled={isProcessingAI || !pastedOrder.trim()}
                                    className="w-full flex items-center justify-center gap-2 p-2 bg-green-500 text-white rounded-md transition-colors hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed"
                                >
                                    <SparklesIcon className="w-5 h-5"/>
                                    {isProcessingAI ? 'Procesando...' : 'Analizar Pedido con IA'}
                                </button>
                                {aiNotification && <p className={`text-sm mt-2 ${aiNotification.startsWith('No se encontraron') ? 'text-red-500' : 'text-green-600'}`}>{aiNotification}</p>}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300">Productos Disponibles</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
                            {products.map(p => (
                                <ProductButton
                                    key={p.id}
                                    product={p}
                                    onAdd={handleAddProduct}
                                    availableStock={getAvailableStock(p)}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300 mt-3">Carrito</h3>
                      {cart.length > 0 ? (
                          <ul className="space-y-2 mt-2">
                              {cart.map(item => {
                                  const product = getProduct(item.productId);
                                  if (!product) return null;
                                  return (
                                      <CartItem
                                        key={item.productId}
                                        item={item}
                                        product={product}
                                        maxStock={getAvailableStock(product)}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemove={handleRemoveItem}
                                      />
                                  )
                              })}
                          </ul>
                      ) : <p className="text-sm text-center text-slate-500 py-4 bg-slate-50 rounded-md dark:bg-slate-700/50">Añade productos al carrito</p>}
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border-t dark:bg-slate-800/50 dark:border-slate-700">
                    <div className="font-bold text-xl text-right mb-4">Total: ${totalAmount.toLocaleString('es-CO')}</div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
                            <input
                                type="date"
                                value={transactionDate}
                                onChange={e => setTransactionDate(e.target.value)}
                                className="w-full p-2 border rounded-md mt-1 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <select value={contactId} onChange={e => setContactId(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent self-end dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="">Cliente Ocasional</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                         <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as 'Efectivo' | 'Crédito' | 'Transferencia')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Crédito">Crédito</option>
                        </select>
                        {paymentMethod === 'Crédito' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Plazo en días</label>
                                <input
                                    type="number"
                                    placeholder="Ej: 30"
                                    value={paymentDays || ''}
                                    onChange={e => setPaymentDays(parseInt(e.target.value, 10))}
                                    className="w-full p-2 border rounded-md mt-1 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">{isEditMode ? 'Guardar Cambios' : 'Guardar Venta'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSaleModal;