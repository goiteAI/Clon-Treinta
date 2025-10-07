import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

// Keys to check in localStorage for legacy data.
// In this case, we assume old keys are the same as new keys.
const LEGACY_KEYS = [
    'products', 'transactions', 'expenses', 'contacts', 
    'companyInfo', 'stockInEntries', 'theme', 'salesUnitCorrection'
];

const RescueScreen: React.FC = () => {
    const { importLegacyData } = useAppContext();
    const [foundData, setFoundData] = useState<Record<string, any> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkLegacyData = () => {
            let data: Record<string, any> = {};
            let dataFound = false;
            
            LEGACY_KEYS.forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    try {
                        data[key] = JSON.parse(item);
                        dataFound = true;
                    } catch (e) {
                        console.error(`Could not parse legacy data for key: ${key}`);
                    }
                }
            });

            if (dataFound) {
                setFoundData(data);
            }
            setIsLoading(false);
        };

        checkLegacyData();
    }, []);

    const handleImport = async () => {
        if (!confirm("Esto reemplazará todos los datos actuales en esta aplicación. ¿Estás seguro de que quieres continuar?")) {
            return;
        }

        try {
            await importLegacyData();
            alert('¡Datos importados con éxito! La aplicación se recargará.');
            window.location.href = '/'; // Redirect to home
        } catch (error) {
            console.error("Error importing legacy data:", error);
            alert(`Hubo un error al importar los datos: ${(error as Error).message}`);
        }
    };
    
    const renderDataSummary = () => {
        if (!foundData) return null;
        return (
            <ul className="list-disc list-inside bg-slate-100 p-4 rounded-md text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                {foundData.products && <li>{foundData.products.length} productos</li>}
                {foundData.transactions && <li>{foundData.transactions.length} transacciones</li>}
                {foundData.expenses && <li>{foundData.expenses.length} gastos</li>}
                {foundData.contacts && <li>{foundData.contacts.length} contactos</li>}
                {foundData.companyInfo && <li>Información del negocio</li>}
            </ul>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 text-center">
                <div className="mx-auto mb-4 w-16 h-16 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Rescate de Datos</h1>

                {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        <p className="ml-3 text-slate-500 dark:text-slate-400">Buscando datos...</p>
                    </div>
                ) : foundData ? (
                    <div>
                        <p className="text-green-600 font-semibold bg-green-100 dark:bg-green-900/50 p-3 rounded-lg mb-4">
                            ¡Buenas noticias! Hemos encontrado datos antiguos en este navegador.
                        </p>
                        <div className="text-left my-4">{renderDataSummary()}</div>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/50 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700/50 mb-6">
                            <strong>Advertencia:</strong> La importación reemplazará todos los datos guardados actualmente en la aplicación.
                        </p>
                        <button
                            onClick={handleImport}
                            className="w-full px-5 py-3 rounded-lg text-white font-semibold bg-green-500 hover:bg-green-600 transition-colors shadow-md"
                        >
                            Importar Datos Antiguos
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-red-600 font-semibold bg-red-100 dark:bg-red-900/50 p-3 rounded-lg mb-4">
                            No se encontraron datos antiguos para importar en este navegador.
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Asegúrate de estar usando el mismo dispositivo y navegador donde guardaste tus datos originalmente. Esta función solo puede leer datos guardados localmente.
                        </p>
                    </div>
                )}
                 <div className="mt-8">
                    <a href="/" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                        Volver al inicio
                    </a>
                </div>
            </div>
        </div>
    );
};

export default RescueScreen;