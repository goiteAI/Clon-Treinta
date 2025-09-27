
import React, { useState, useCallback } from 'react';
import { getBusinessInsights } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';

const AIAssistant: React.FC = () => {
  const { transactions, expenses } = useAppContext();
  const [insights, setInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGetInsights = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setInsights('');
    try {
      const result = await getBusinessInsights(transactions, expenses);
      setInsights(result);
    } catch (err) {
      setError('Failed to get insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [transactions, expenses]);

  // A simple markdown to HTML parser
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-md font-bold text-slate-700 dark:text-slate-300 mt-3 mb-1">{line.substring(4)}</h3>;
      }
      if (line.startsWith('* ')) {
        return <li key={index} className="text-slate-600 dark:text-slate-300 ml-5 list-disc">{line.substring(2)}</li>;
      }
      return <p key={index} className="text-slate-600 dark:text-slate-300 mb-2">{line}</p>;
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-slate-800">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Asistente IA</h2>
        <button
          onClick={handleGetInsights}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm disabled:bg-green-300 transition-colors"
        >
          {isLoading ? 'Analizando...' : 'Obtener Análisis'}
        </button>
      </div>
      <div className="mt-4">
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {insights && (
            <div className="prose prose-sm max-w-none">
                {renderMarkdown(insights)}
            </div>
        )}
        {!isLoading && !insights && <p className="text-sm text-slate-500 dark:text-slate-400">Haz clic para obtener un análisis de tu negocio con IA.</p>}
      </div>
    </div>
  );
};

export default AIAssistant;