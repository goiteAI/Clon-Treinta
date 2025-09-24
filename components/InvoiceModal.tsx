import React, { useMemo, useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { useAppContext } from '../context/AppContext';

interface InvoiceModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ transaction, onClose }) => {
  const { products, contacts, companyInfo, transactions } = useAppContext();
  const [isShareSupported, setIsShareSupported] = useState(false);

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
    
    // Return a formatted invoice number like 001, 002, etc.
    return (invoiceIndex + 1).toString().padStart(3, '0');

  }, [transaction, transactions]);

  const handlePrint = () => {
      window.print();
  }
  
  const handleShare = async () => {
    if (!navigator.share) {
        alert('La función de compartir no está disponible en este navegador.');
        return;
    }

    let shareText = `¡Hola ${contact ? contact.name : 'Cliente'}! Aquí está el resumen de tu factura #${invoiceNumber} de ${companyInfo.name}.\n\n`;
    shareText += `Total: ${formatCurrency(transaction.totalAmount)}\n`;
    if (transaction.paymentMethod === 'Crédito') {
        shareText += `Saldo Pendiente: ${formatCurrency(amountDue)}\n`;
    }
    shareText += `\n¡Gracias por tu compra!`;
    
    const shareData = {
        title: `Factura de ${companyInfo.name}`,
        text: shareText,
    };

    try {
        await navigator.share(shareData);
    } catch (err) {
        console.error('Error al compartir:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[95vh] flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-center">Factura de Venta</h2>
        </div>
        
        <div id="invoice-printable" className="p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="w-2/3">
              <h1 className="text-xl font-bold text-slate-800">{companyInfo.name}</h1>
              <p className="text-sm text-slate-600">{companyInfo.address}</p>
              <p className="text-sm text-slate-600">{companyInfo.phone}</p>
            </div>
            {companyInfo.logoUrl && (
              <div className="w-1/3 flex justify-end">
                <img src={companyInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain" />
              </div>
            )}
          </div>

          {/* Customer and Invoice Info */}
          <div className="flex justify-between mb-6 text-sm">
            <div>
              <p className="font-bold text-slate-700">Factura para:</p>
              <p>{contact ? contact.name : 'Cliente Ocasional'}</p>
              <p>{contact?.phone}</p>
            </div>
            <div className="text-right">
              <p><span className="font-bold">Factura #:</span> {invoiceNumber}</p>
              <p><span className="font-bold">Fecha:</span> {new Date(transaction.date).toLocaleDateString('es-ES')}</p>
              {transaction.dueDate && (
                  <p><span className="font-bold">Vence:</span> {new Date(transaction.dueDate).toLocaleDateString('es-ES')}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6 text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left font-semibold">Producto</th>
                <th className="p-2 text-center font-semibold">Cant.</th>
                <th className="p-2 text-right font-semibold">Precio Unit.</th>
                <th className="p-2 text-right font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {transaction.items.map(item => (
                <tr key={item.productId} className="border-b">
                  <td className="p-2">{getProductName(item.productId)}</td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="p-2 text-right">{formatCurrency(item.unitPrice * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs text-sm">
              <div className="flex justify-between py-1">
                <span className="font-semibold text-slate-600">Subtotal:</span>
                <span>{formatCurrency(transaction.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-t">
                <span className="font-bold text-slate-800">Total:</span>
                <span className="font-bold">{formatCurrency(transaction.totalAmount)}</span>
              </div>
              {transaction.paymentMethod === 'Crédito' && (
                <>
                  <div className="flex justify-between py-1 mt-2 border-t">
                    <span className="font-semibold text-slate-600">Total Pagado:</span>
                    <span className="text-green-600">{formatCurrency(totalPaid)}</span>
                  </div>
                   <div className="flex justify-between py-1 bg-slate-100 rounded-md px-2">
                    <span className="font-bold text-red-600">Saldo Pendiente:</span>
                    <span className="font-bold text-red-600">{formatCurrency(amountDue)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        <div className="p-4 bg-slate-50 border-t flex justify-end gap-2 no-print">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md">Cerrar</button>
          {isShareSupported && 
            <button onClick={handleShare} className="px-4 py-2 bg-green-500 text-white rounded-md">Compartir</button>
          }
          <button onClick={handlePrint} className="px-4 py-2 bg-blue-500 text-white rounded-md">Imprimir / Guardar PDF</button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;