import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import AddSaleModal from '../components/AddSaleModal';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

type TimePeriod = 'today' | 'week' | 'month' | 'year';

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-slate-800">
    <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const SubStat: React.FC<{ title: string; value: string; color?: string }> = ({ title, value, color = 'text-slate-800 dark:text-slate-100' }) => (
    <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
);


const DashboardScreen: React.FC = () => {
  const { transactions, expenses } = useAppContext();
  const [isAddSaleModalOpen, setIsAddSaleModalOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };
  
  const balanceData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let title: string;
    let cardTitlePrefix: string;

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (timePeriod) {
        case 'week':
            const dayOfWeek = today.getDay();
            const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            startDate = new Date(new Date(today.setDate(diff)).setHours(0, 0, 0, 0));
            title = 'Balance de la Semana';
            cardTitlePrefix = 'Ventas';
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            title = 'Balance del Mes';
            cardTitlePrefix = 'Ventas';
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            title = 'Balance del Año';
            cardTitlePrefix = 'Ventas';
            break;
        case 'today':
        default:
            startDate = today;
            title = 'Balance del Día';
            cardTitlePrefix = 'Ventas de Hoy';
            break;
    }

    const filteredTransactions = transactions.filter(t => new Date(t.date) >= startDate);

    const totalSales = filteredTransactions.reduce((sum: number, t) => sum + t.totalAmount, 0);

    const costs = expenses
      .filter(e => new Date(e.date) >= startDate)
      .reduce((sum: number, e) => sum + e.amount, 0);
      
    const totalTransactions = filteredTransactions.length;
    const averageSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    const salesByPaymentMethod = filteredTransactions.reduce((acc: Record<string, number>, t) => {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.totalAmount;
        return acc;
    }, {} as Record<string, number>);
    
    return {
      totalSales,
      totalExpenses: costs,
      profit: totalSales - costs,
      title,
      cardTitlePrefix,
      totalTransactions,
      averageSale,
      salesByPaymentMethod,
    };
  }, [transactions, expenses, timePeriod]);

  const PIE_COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac'];

  const pieData = useMemo(() => {
    return Object.entries(balanceData.salesByPaymentMethod).map(([name, value]) => ({ name, value }));
  }, [balanceData.salesByPaymentMethod]);
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't render label for small slices
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
  };


  return (
    <div>
      <header className="p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Inicio</h1>
        <p className="text-slate-500 dark:text-slate-400">Un resumen de tu negocio.</p>
      </header>

      <div className="p-4 space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm dark:bg-slate-800">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{balanceData.title}</h2>
            <div className="flex justify-center mb-6 rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
              {(['today', 'week', 'month', 'year'] as TimePeriod[]).map(period => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${timePeriod === period ? 'bg-white text-green-600 shadow-sm dark:bg-slate-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  {period === 'today' ? 'Hoy' : period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Año'}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                {/* Left Side: Stats */}
                <div className="space-y-4">
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <StatCard title={balanceData.cardTitlePrefix} value={formatCurrency(balanceData.totalSales)} color="text-green-600" />
                        <StatCard title="Gastos" value={formatCurrency(balanceData.totalExpenses)} color="text-red-600" />
                        <StatCard title="Utilidad" value={formatCurrency(balanceData.profit)} color={balanceData.profit >= 0 ? 'text-blue-600' : 'text-red-600'} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t text-center dark:border-slate-700">
                         <SubStat title="Promedio por Venta" value={formatCurrency(balanceData.averageSale)} color="text-blue-600" />
                         <SubStat title="Transacciones" value={balanceData.totalTransactions.toString()} />
                    </div>
                </div>

                {/* Right Side: Chart */}
                {pieData.length > 0 ? (
                    <div className="flex flex-col items-center justify-center w-full h-auto">
                        <div className="relative w-full max-w-[250px] h-52">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="60%"
                                        outerRadius="80%"
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        cornerRadius={5}
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} className="focus:outline-none" />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(balanceData.totalSales)}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
                            {pieData.map((entry, index) => (
                                <div key={`legend-${index}`} className="flex items-center text-sm">
                                    <span 
                                        className="w-3 h-3 rounded-full mr-2" 
                                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                    ></span>
                                    <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
                                    <span className="font-semibold ml-1 text-slate-800 dark:text-slate-200">{formatCurrency(entry.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center text-center text-slate-500 py-8 h-full rounded-lg bg-slate-50 dark:bg-slate-700/50 dark:text-slate-400">
                        <p>No hay datos de ventas para este período.</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      <button onClick={() => setIsAddSaleModalOpen(true)} className="fixed bottom-20 right-5 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105" aria-label="Registrar nueva venta">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
      </button>
      {isAddSaleModalOpen && <AddSaleModal onClose={() => setIsAddSaleModalOpen(false)} />}
    </div>
  );
};

export default DashboardScreen;