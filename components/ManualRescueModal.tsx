import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface ManualRescueModalProps {
  onClose: () => void;
}

const ManualRescueModal: React.FC<ManualRescueModalProps> = ({ onClose }) => {
    const { importData } = useAppContext();
    const [pastedData, setPastedData] = useState('');
    const [importError, setImportError] = useState('');

    const rescueCode = `(function(){const d={};['products','transactions','expenses','contacts','companyInfo','stockInEntries','theme','salesUnitCorrection'].forEach(k=>{const i=localStorage.getItem(k);if(i)try{d[k]=JSON.parse(i)}catch(e){}});prompt('Copia TODO este texto y pégalo en la nueva app:',JSON.stringify(d))})();`;

    const handleCopyCode = () => {
        navigator.clipboard.writeText(rescueCode).then(() => {
            alert('¡Código de rescate copiado al portapapeles!');
        }).catch(err => {
            console.error('Failed to copy code: ', err);
            alert('No se pudo copiar el código. Por favor, cópialo manualmente.');
        });
    };

    const handleImport = async () => {
        setImportError('');
        if (!pastedData.trim()) {
            setImportError('La caja de datos está vacía. Pega los datos que copiaste de la app antigua.');
            return;
        }

        try {
            const data = JSON.parse(pastedData);
            if (window.confirm("¿Estás seguro de que quieres importar estos datos? Se sobrescribirán todos los datos actuales.")) {
               await importData(data);
               alert('¡Datos importados con éxito! La aplicación se recargará.');
               window.location.reload();
            }
        } catch (error) {
            console.error("Import error:", error);
            setImportError('Error al leer los datos pegados. Asegúrate de haber copiado todo el texto de la ventana emergente.');
        }
    };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col dark:bg-slate-800 max-h-[90vh]">
        <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Herramienta de Rescate Manual</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
            {/* --- PASO 1 y 2 --- */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg dark:bg-blue-900/50 dark:border-blue-700/50">
                <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300">Paso 1 y 2: Extrae los datos de la app ANTIGUA</h3>
                <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-700 dark:text-slate-300">
                    <li>Pulsa el botón de abajo para copiar el "código de rescate".</li>
                    <div className="my-2">
                        <textarea readOnly value={rescueCode} className="w-full text-xs p-2 rounded bg-slate-200 dark:bg-slate-700 font-mono" rows={3}></textarea>
                        <button onClick={handleCopyCode} className="w-full mt-1 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Copiar Código</button>
                    </div>
                    <li>Abre la <strong>versión antigua</strong> de la app.</li>
                    <li>En la barra de direcciones del navegador, borra la URL y escribe <code className="text-xs bg-slate-200 dark:bg-slate-600 p-1 rounded">javascript:</code></li>
                    <li><strong>Pega el código</strong> que copiaste justo después de los dos puntos.</li>
                    <li>Pulsa "Enter" o "Ir".</li>
                </ol>
            </div>

            {/* --- PASO 3 y 4 --- */}
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg dark:bg-green-900/50 dark:border-green-700/50">
                <h3 className="text-lg font-bold text-green-800 dark:text-green-300">Paso 3 y 4: Importa los datos en esta app NUEVA</h3>
                <ol className="list-decimal list-inside mt-2 space-y-2 text-slate-700 dark:text-slate-300">
                    <li>Aparecerá una ventana emergente en la app antigua. <strong>Copia TODO el texto</strong> que contiene.</li>
                    <li>Vuelve aquí y <strong>pega el texto</strong> en la caja de abajo.</li>
                </ol>
                <div className="mt-4">
                    <textarea 
                        value={pastedData}
                        onChange={(e) => setPastedData(e.target.value)}
                        placeholder="Pega aquí los datos que copiaste de la app antigua..."
                        className="w-full text-sm p-2 rounded bg-white dark:bg-slate-700 font-mono border dark:border-slate-600"
                        rows={5}
                    ></textarea>
                     {importError && <p className="text-red-500 text-xs mt-1">{importError}</p>}
                    <button 
                        onClick={handleImport}
                        className="w-full mt-2 bg-green-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                        Importar Datos Pegados
                    </button>
                </div>
            </div>
        </div>
        
        <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t rounded-b-lg dark:bg-slate-800/50 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-100">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualRescueModal;
