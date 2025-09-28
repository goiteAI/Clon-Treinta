
import React, { useRef, useState } from 'react';
import type { Transaction } from '../types';
import { useAppContext } from '../context/AppContext';
import { toPng } from 'html-to-image';

interface InvoiceModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ transaction, onClose }) => {
  const { products, contacts, companyInfo } = useAppContext();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const getProduct = (id: string) => products.find(p => p.id === id);
  const getContactName = (id?: string) => id ? contacts.find(c => c.id === id)?.name || 'Cliente Ocasional' : 'Cliente Ocasional';
  const formatCurrency = (amount: number) => amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

  const totalPaid = transaction.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const pendingBalance = transaction.totalAmount - totalPaid;

  const handlePrint = () => {
      window.print();
  }

  const handleShare = async () => {
    const node = invoiceRef.current;
    if (!node || !navigator.share) {
        if(!navigator.share) alert("Tu navegador no soporta la función de compartir.");
        return;
    }
    setIsSharing(true);

    // Create a clone to render off-screen without affecting the UI
    const clone = node.cloneNode(true) as HTMLElement;
    
    // Style the clone to ensure it's fully rendered but invisible
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '0px';
    clone.style.maxHeight = 'none'; // Remove height restriction
    clone.style.overflow = 'visible'; // Ensure all content is visible
    clone.style.width = `${node.offsetWidth}px`; // Match the original width

    document.body.appendChild(clone);

    try {
        const dataUrl = await toPng(clone, {
            cacheBust: true,
            quality: 0.95,
            pixelRatio: 2.5,
            backgroundColor: 'white',
        });
        
        document.body.removeChild(clone); // Clean up the clone immediately

        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `factura-${transaction.id.slice(-6)}.png`, { type: blob.type });

        await navigator.share({
            files: [file],
            title: `Factura ${transaction.id.slice(-6)}`,
            text: '¡Gracias por su compra!',
        });

    } catch (error) {
        if(document.body.contains(clone)) {
            document.body.removeChild(clone); // Ensure cleanup even on error
        }
        console.error('Error al compartir la factura:', error);
        // Do not show an alert if the user simply cancelled the share dialog
        if ((error as DOMException)?.name !== 'AbortError') {
          alert('No se pudo compartir la factura. Inténtalo de nuevo.');
        }
    } finally {
        setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:bg-white print:p-0">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col dark:bg-slate-800 print:shadow-none print:rounded-none print:dark:bg-white">
        <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center print:hidden">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Factura de Venta</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div ref={invoiceRef} id="invoice-content" className="p-6 space-y-4 max-h-[70vh] overflow-y-auto bg-white print:max-h-full print:overflow-visible">
          {/* Company Info */}
          <div className="text-center">
            {companyInfo.logoUrl && <img src={companyInfo.logoUrl} alt="logo" className="w-20 h-20 mx-auto mb-2 rounded-full object-cover"/>}
            <h3 className="font-bold text-2xl text-pink-600">{companyInfo.name}</h3>
            <p className="text-xs text-gray-500">{companyInfo.address}</p>
            <p className="text-xs text-gray-500">{companyInfo.phone}</p>
          </div>

          <div className="border-t border-dashed my-2"></div>

          {/* Transaction Info */}
          <div className="grid grid-cols-2 text-sm gap-x-2 gap-y-1">
            <div className="text-gray-600 font-medium">
              <p>Factura #:</p>
              <p>Fecha:</p>
              {transaction.dueDate && transaction.paymentMethod === 'Crédito' && (<p>Vence:</p>)}
              <p>Cliente:</p>
              <p>Método de Pago:</p>
            </div>
            <div className="text-right font-semibold text-black">
              <p>{transaction.id.slice(-6)}</p>
              <p>{new Date(transaction.date).toLocaleDateString('es-ES')}</p>
              {transaction.dueDate && transaction.paymentMethod === 'Crédito' && (<p>{new Date(transaction.dueDate).toLocaleDateString('es-ES')}</p>)}
              <p>{getContactName(transaction.contactId)}</p>
              <p>{transaction.paymentMethod}</p>
            </div>
          </div>
          
          <div className="border-t border-dashed my-2"></div>

          {/* Items */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-semibold pb-2 text-pink-600">Producto</th>
                  <th className="text-center font-semibold pb-2 text-pink-600">Cant.</th>
                  <th className="text-right font-semibold pb-2 text-pink-600">Precio</th>
                  <th className="text-right font-semibold pb-2 text-pink-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items.map(item => {
                  const product = getProduct(item.productId);
                  return (
                    <tr key={item.productId} className="text-black border-b border-gray-100">
                      <td className="py-2">{product?.name || 'Producto no encontrado'}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right py-2 font-medium">{formatCurrency(item.unitPrice * item.quantity)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-dashed my-2"></div>

          {/* Totals */}
            <div className="text-right text-sm space-y-2 pt-2">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Total a Pagar:</span>
                    <span className="font-bold text-xl text-pink-600">{formatCurrency(transaction.totalAmount)}</span>
                </div>
                {transaction.paymentMethod === 'Crédito' && (
                    <>
                        <div className="flex justify-between items-center border-t pt-2 mt-2">
                            <span className="font-medium text-gray-600">Total Pagado:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(totalPaid)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-yellow-100 p-2 rounded-md">
                            <span className="font-bold text-yellow-800">Saldo Pendiente:</span>
                            <span className="font-bold text-xl text-yellow-800">{formatCurrency(pendingBalance)}</span>
                        </div>
                    </>
                )}
            </div>

          <div className="text-center text-xs text-gray-500 pt-4">
            <p>¡Gracias por su compra!</p>
          </div>
        </div>
        <div className="flex justify-center gap-2 p-4 bg-slate-50 border-t rounded-b-lg dark:bg-slate-800/50 dark:border-slate-700 print:hidden">
            <button
                type="button"
                onClick={handleShare}
                disabled={isSharing}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors font-semibold disabled:bg-blue-300"
            >
                {isSharing ? 'Generando...' : 'Compartir'}
            </button>
             <button
                type="button"
                onClick={handlePrint}
                className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors font-semibold"
            >
                Imprimir
            </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
