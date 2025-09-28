
import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { Transaction } from '../types';
import { useAppContext } from '../context/AppContext';
import * as htmlToImage from 'html-to-image';

interface InvoiceModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ transaction, onClose }) => {
  const { products, contacts, companyInfo, transactions } = useAppContext();
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Producto desconocido';
  const getContact = (id: string | undefined) => id ? contacts.find(c => c.id === id) : null;
  
  const formatCurrency = (amount: number) => amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  
  const contact = getContact(transaction.contactId);

  const totalPaid = transaction.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const amountDue = transaction.totalAmount - totalPaid;

  const invoiceNumber = useMemo(() => {
    if (!transaction.contactId) {
      return transaction.id.slice(-6); // Fallback for occasional clients
    }

    const clientTransactions = transactions
      .filter(t => t.contactId === transaction.contactId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const invoiceIndex = clientTransactions.findIndex(t => t.id === transaction.id);
    
    return (invoiceIndex + 1).toString().padStart(3, '0');

  }, [transaction, transactions]);

  const handlePrint = () => {
      window.print();
  }
  
  const handleShare = async () => {
    if (!navigator.share || !invoiceRef.current) {
        alert('La función de compartir no está disponible en este navegador.');
        return;
    }
    
    setIsSharing(true);
    try {
        const blob = await htmlToImage.toBlob(invoiceRef.current, {
            backgroundColor: '#ffffff', // Ensure a white background for consistent sharing
            pixelRatio: 2, // Increase resolution for better quality
        });

        if (!blob) {
            throw new Error('No se pudo crear la imagen de la factura.');
        }

        const file = new File([blob], `factura-${invoiceNumber}.png`, { type: blob.type });

        await navigator.share({
            title: `Factura de ${companyInfo.name}`,
            text: `¡Hola ${contact ? contact.name : 'Cliente'}! Aquí está tu factura #${invoiceNumber}.`,
            files: [file],
        });

    } catch (err) {
        console.error('Error al compartir la imagen de la factura:', err);
        alert('No se pudo generar la imagen de la factura para compartir.');
    } finally {
        setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[95vh] flex flex-col dark:bg-slate-800">
        <div className="p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">Factura de Venta</h2>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div id="invoice-printable" ref={invoiceRef} className="text-slate-800 bg-white p-4">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-2/3">
                <h1 className="text-2xl font-bold text-pink-600">{companyInfo.name}</h1>
                <p className="text-sm text-slate-600">{companyInfo.address}</p>
                <p className="text-sm text-slate-600">{companyInfo.phone}</p>
              </div>
              {companyInfo.logoUrl && (
                <div className="w-1/3 flex justify-end">
                  <img src={companyInfo.logoUrl} alt="Logo" className="w-24 h-24 object-contain" />
                </div>
              )}
            </div>

            {/* Customer and Invoice Info */}
            <div className="flex justify-between mb-6 text-sm">
              <div>
                <p className="font-bold text-slate-700">Factura para:</p>
                <p className="text-slate-800">{contact ? contact.name : 'Cliente Ocasional'}</p>
                <p className="text-slate-800">{contact?.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-800"><span className="font-bold">Factura #:</span> {invoiceNumber}</p>
                <p className="text-slate-800"><span className="font-bold">Fecha:</span> {new Date(transaction.date).toLocaleDateString('es-ES')}</p>
                {transaction.dueDate && (
                    <p className="text-slate-800"><span className="font-bold">Vence:</span> {new Date(transaction.dueDate).toLocaleDateString('es-ES')}</p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-6 text-sm">
              <thead>
                <tr className="bg-pink-50">
                  <th className="p-2 text-left font-semibold text-pink-700 uppercase text-xs tracking-wider">Producto</th>
                  <th className="p-2 text-center font-semibold text-pink-700 uppercase text-xs tracking-wider">Cant.</th>
                  <th className="p-2 text-right font-semibold text-pink-700 uppercase text-xs tracking-wider">Precio Unit.</th>
                  <th className="p-2 text-right font-semibold text-pink-700 uppercase text-xs tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items.map(item => (
                  <tr key={item.productId} className="border-b">
                    <td className="p-2 text-slate-800">{getProductName(item.productId)}</td>
                    <td className="p-2 text-center text-slate-800">{item.quantity}</td>
                    <td className="p-2 text-right text-slate-800">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-2 text-right text-slate-800">{formatCurrency(item.unitPrice * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs text-sm text-slate-800">
                <div className="flex justify-between py-1">
                  <span className="font-semibold text-slate-600">Subtotal:</span>
                  <span>{formatCurrency(transaction.totalAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-t mt-1">
                  <span className="font-bold text-lg text-pink-600">Total:</span>
                  <span className="font-bold text-lg text-pink-600">{formatCurrency(transaction.totalAmount)}</span>
                </div>
                {transaction.paymentMethod === 'Crédito' && (
                  <>
                    <div className="flex justify-between py-1 mt-2 border-t">
                      <span className="font-semibold text-slate-600">Total Pagado:</span>
                      <span className="text-green-600">{formatCurrency(totalPaid)}</span>
                    </div>
                     <div className="flex justify-between py-2 bg-lime-100 rounded-md px-2 mt-1">
                      <span className="font-bold text-lime-700">Saldo Pendiente:</span>
                      <span className="font-bold text-lime-700">{formatCurrency(amountDue)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t flex justify-end gap-2 no-print dark:bg-slate-900/50 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500">Cerrar</button>
          <button onClick={handlePrint} className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-md transition-colors">Imprimir / PDF</button>
          {isShareSupported && 
            <button onClick={handleShare} disabled={isSharing} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors disabled:bg-green-300 min-w-[120px]">
                {isSharing ? 'Compartiendo...' : 'Compartir'}
            </button>
          }
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;