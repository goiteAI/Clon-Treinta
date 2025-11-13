import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import type { CompanyInfo } from '../types';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{title}</h2>
        {children}
    </div>
);

const SettingsScreen: React.FC = () => {
    const { 
        companyInfo, 
        updateCompanyInfo, 
        theme, 
        toggleTheme, 
        resetData,
        products,
        transactions,
        contacts,
        stockInEntries,
        salesUnitCorrection,
        importData
    } = useAppContext();
    
    const [info, setInfo] = useState<CompanyInfo>(companyInfo);
    const [logoPreview, setLogoPreview] = useState<string | null>(companyInfo.logoUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setInfo(companyInfo);
        setLogoPreview(companyInfo.logoUrl);
    }, [companyInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInfo({ ...info, [e.target.name]: e.target.value });
    };
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setInfo({ ...info, logoUrl: result });
                setLogoPreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveCompanyInfo = () => {
        updateCompanyInfo(info);
        alert('Información guardada con éxito.');
    };

    const handleExportData = () => {
        const dataToExport = {
            products,
            transactions,
            contacts,
            companyInfo,
            stockInEntries,
            theme,
            salesUnitCorrection
        };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mi-negocio-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportData = () => {
        fileInputRef.current?.click();
    };

    const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target?.result as string);
                    if (confirm("¿Estás seguro de que quieres importar estos datos? Se sobrescribirán todos los datos actuales.")) {
                       await importData(data);
                       alert('¡Datos importados con éxito!');
                    }
                } catch (error) {
                    alert("Error al leer el archivo. Asegúrate de que es un archivo de backup válido.");
                    console.error("Import error:", error);
                }
            };
            reader.readAsText(file);
        }
    };
    
    const handleResetData = () => {
        if (confirm("¿ESTÁS SEGURO? Esta acción borrará TODOS tus datos (productos, ventas, gastos, etc.) y no se puede deshacer.")) {
            if (confirm("CONFIRMACIÓN FINAL: ¿Realmente quieres borrar todos los datos de la aplicación?")) {
                resetData();
                alert('Los datos han sido restaurados a los valores iniciales.');
            }
        }
    };

    return (
        <div>
            <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ajustes</h1>
                <p className="text-slate-500 dark:text-slate-400">Configura tu negocio y gestiona tus datos.</p>
            </header>

            <div className="p-4 space-y-6">
                <Section title="Información del Negocio">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden dark:bg-slate-700 flex-shrink-0">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                )}
                            </div>
                            <input type="file" onChange={handleLogoChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/50 dark:file:text-green-300 dark:hover:file:bg-green-900"/>
                        </div>
                        <input name="name" value={info.name} onChange={handleChange} placeholder="Nombre del negocio" className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <input name="address" value={info.address} onChange={handleChange} placeholder="Dirección" className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <input name="phone" value={info.phone} onChange={handleChange} placeholder="Teléfono 1" className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <input name="phone2" value={info.phone2} onChange={handleChange} placeholder="Teléfono 2 (Opcional)" className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        <button onClick={handleSaveCompanyInfo} className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">Guardar Información</button>
                    </div>
                </Section>
                
                <Section title="Apariencia">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-300">Tema Oscuro</span>
                        <button onClick={() => toggleTheme()} className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-slate-200 dark:bg-slate-600">
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </Section>
                
                <Section title="Gestión de Datos">
                    <div className="space-y-3">
                        <button onClick={handleExportData} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Exportar (Crear Backup)
                        </button>
                        <button onClick={handleImportData} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                           Importar (Restaurar Backup)
                        </button>
                        <input type="file" ref={fileInputRef} onChange={onFileSelected} accept=".json" className="hidden" />
                        <button onClick={handleResetData} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Restaurar Datos de Fábrica
                        </button>
                    </div>
                </Section>
            </div>
        </div>
    );
};

export default SettingsScreen;