
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { CompanyInfo } from '../types';

const SettingsScreen: React.FC = () => {
    const { companyInfo, updateCompanyInfo, resetData, theme, toggleTheme } = useAppContext();
    const [formState, setFormState] = useState<CompanyInfo>(companyInfo);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormState(companyInfo);
    }, [companyInfo]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormState(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateCompanyInfo(formState);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div>
            <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ajustes del Negocio</h1>
            </header>
            <div className="p-4">
                <div className="bg-white p-6 rounded-lg shadow-sm max-w-lg mx-auto dark:bg-slate-800">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="logo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logo del Negocio</label>
                            <div className="flex items-center gap-4">
                                 {formState.logoUrl ? 
                                    <img src={formState.logoUrl} alt="Logo preview" className="w-16 h-16 rounded-full object-cover bg-slate-100"/> :
                                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 dark:bg-slate-700 dark:text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                 }
                                <input id="logo" type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/50 dark:file:text-green-300 dark:hover:file:bg-green-900"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre del Negocio</label>
                            <input type="text" id="name" name="name" value={formState.name} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dirección / NIT</label>
                            <input type="text" id="address" name="address" value={formState.address} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
                            <input type="tel" id="phone" name="phone" value={formState.phone} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className={`px-5 py-2 rounded-md text-white font-semibold transition-all duration-300 ${isSaved ? 'bg-blue-500' : 'bg-green-500 hover:bg-green-600'}`}>
                                {isSaved ? '¡Guardado!' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                         <div className="flex items-center justify-between py-4">
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Modo Oscuro</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">Reduce el brillo para una menor fatiga visual.</span>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-green-600' : 'bg-gray-200'}`}
                                role="switch"
                                aria-checked={theme === 'dark'}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}
                                ></span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={resetData}
                            className="w-full px-5 py-2 rounded-md text-white font-semibold bg-red-500 hover:bg-red-600 transition-colors"
                        >
                            Borrar Datos y Reiniciar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;