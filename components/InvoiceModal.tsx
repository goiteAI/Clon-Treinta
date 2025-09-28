
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

  const handlePrint = () => {
      window.print();
  }

  const handleShare = async () => {
    if (!invoiceRef.current || !navigator.share) return;
    setIsSharing(true);

    try {
        const dataUrl = await toPng(invoiceRef.current, { 
            cacheBust: true, 
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: 'white'
        });
        
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `factura-${transaction.id.slice(-6)}.png`, { type: blob.type });

        await navigator.share({
            files: [file],
            title: `Factura ${transaction.id.slice(-6)}`,
            text: '¡Gracias por su compra!',
        });

    } catch (error) {
        console.error('Error al compartir la factura:', error);
        alert('No se pudo compartir la factura. Inténtalo de nuevo.');
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
            <h3 className="font-bold text-lg text-black">{companyInfo.name}</h3>
            <p className="text-xs text-gray-700">{companyInfo.address}</p>
            <p className="text-xs text-gray-700">{companyInfo.phone}</p>
          </div>

          <div className="border-t border-dashed my-4"></div>

          {/* Transaction Info */}
          <div className="flex justify-between text-sm">
            <div className="text-gray-700">
              <p>Factura #:</p>
              <p>Fecha:</p>
              <p>Cliente:</p>
              <p>Método de Pago:</p>
            </div>
            <div className="text-right font-medium text-black">
              <p>{transaction.id.slice(-6)}</p>
              <p>{new Date(transaction.date).toLocaleDateString('es-ES')}</p>
              <p>{getContactName(transaction.contactId)}</p>
              <p>{transaction.paymentMethod}</p>
            </div>
          </div>
          
          <div className="border-t border-dashed my-4"></div>

          {/* Items */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-semibold pb-1 text-black">Producto</th>
                  <th className="text-center font-semibold pb-1 text-black">Cant.</th>
                  <th className="text-right font-semibold pb-1 text-black">Precio</th>
                  <th className="text-right font-semibold pb-1 text-black">Total</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items.map(item => {
                  const product = getProduct(item.productId);
                  return (
                    <tr key={item.productId} className="text-black">
                      <td className="py-1">{product?.name || 'Producto no encontrado'}</td>
                      <td className="text-center py-1">{item.quantity}</td>
                      <td className="text-right py-1">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right py-1">{formatCurrency(item.unitPrice * item.quantity)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-dashed my-4"></div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-gray-700">Total a Pagar:</p>
              <p className="font-bold text-xl text-black">{formatCurrency(transaction.totalAmount)}</p>
            </div>
          </div>
          <div className="text-center text-xs text-gray-700 pt-4">
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
