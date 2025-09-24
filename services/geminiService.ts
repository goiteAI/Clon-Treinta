import { GoogleGenAI } from "@google/genai";
import type { Transaction, Expense } from '../types';

// Per coding guidelines, initialize directly and assume API_KEY is set via environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getBusinessInsights = async (transactions: Transaction[], expenses: Expense[]): Promise<string> => {
  const prompt = `
    Eres un asesor de negocios experto para pequeñas tiendas y microempresas en Latinoamérica.
    Analiza los siguientes datos de transacciones y gastos en formato JSON.
    
    Transacciones:
    ${JSON.stringify(transactions.slice(0, 20), null, 2)}
    
    Gastos:
    ${JSON.stringify(expenses.slice(0, 20), null, 2)}
    
    Basado en estos datos, proporciona un breve resumen del rendimiento del negocio y 3 sugerencias accionables y claras para mejorar la rentabilidad o la gestión.
    Formatea tu respuesta en Markdown simple, usando encabezados y listas. Sé conciso y directo.
    Ejemplo de respuesta:
    
    ### Resumen Rápido
    Tus ventas recientes son consistentes, pero un gasto importante ha afectado tu ganancia neta.
    
    ### Sugerencias Clave
    *   **Sugerencia 1:** Descripción de la sugerencia.
    *   **Sugerencia 2:** Descripción de la sugerencia.
    *   **Sugerencia 3:** Descripción de la sugerencia.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching insights from Gemini API:", error);
    return "Hubo un error al contactar al asistente de IA. Por favor, intenta de nuevo más tarde.";
  }
};
