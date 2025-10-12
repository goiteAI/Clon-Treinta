import React from 'react';
import type { Page } from '../../types';

interface NavItemProps {
  page: Page;
  title: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<NavItemProps> = ({ page, title, icon, currentPage, setCurrentPage }) => {
  const isActive = currentPage === page;
  const color = isActive ? 'text-green-500' : 'text-gray-500 dark:text-gray-400';

  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${color}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {React.cloneElement(icon, { className: `w-6 h-6 mb-1` })}
      <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>{title}</span>
    </button>
  );
};

const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.121 0l9.045 9.045M4.5 12.75v6a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25v-6" />
  </svg>
);

const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0H21M12 12.75h.008v.008H12v-.008z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21a3.375 3.375 0 003.375-3.375V12.188c0-.775.625-1.406 1.406-1.406h4.438c.781 0 1.406.631 1.406 1.406v5.438a3.375 3.375 0 003.375 3.375M9 12.188c1.181.563 2.57.563 3.75 0" />
    </svg>
);

const InboxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125A2.25 2.25 0 014.5 4.875h15a2.25 2.25 0 012.25 2.25v9.75a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 16.875V7.125zm19.5 0v.375c0 .621-.504 1.125-1.125 1.125H3.375A1.125 1.125 0 012.25 7.5V7.125" />
  </svg>
);

const ReceiptPercentIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3m-3 0h-3m2.25-4.5h5.25m-5.25 0h3m-3 0h-3m2.25-4.5h5.25m-5.25 0h3m-3 0h-3m2.25-4.5h5.25m-5.25 0h3m-3 0h-3M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const UserGroupIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-1.023-.19-2.057-1.28-2.057a3.374 3.374 0 00-3.374 3.374c0 1.19.828 2.21 2.09 2.21A3.374 3.374 0 0010.5 15.792zM15.75 9.75a3.375 3.375 0 016.75 0 3.375 3.375 0 01-6.75 0zM4.5 19.5a3 3 0 013-3h1.5a3 3 0 013 3v.5a3 3 0 01-3 3h-1.5a3 3 0 01-3-3v-.5z" />
  </svg>
);

const CogIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0115 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
    </svg>
);


const CashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0H21m-9 12.75h5.25m-5.25 0h-1.5m-1.5 0H3.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 4.5h.008v.008H12v-.008z" />
    </svg>
);


const BottomNav: React.FC<{ currentPage: Page; setCurrentPage: (page: Page) => void }> = ({ currentPage, setCurrentPage }) => {
  const navItems: Omit<NavItemProps, 'currentPage' | 'setCurrentPage'>[] = [
    { page: 'dashboard', title: 'Inicio', icon: <HomeIcon /> },
    { page: 'sales', title: 'Ventas', icon: <BanknotesIcon /> },
    { page: 'debts', title: 'Deudas', icon: <CashIcon /> },
    { page: 'inventory', title: 'Inventario', icon: <InboxIcon /> },
    { page: 'expenses', title: 'Gastos', icon: <ReceiptPercentIcon /> },
    { page: 'contacts', title: 'Contactos', icon: <UserGroupIcon /> },
    { page: 'settings', title: 'Ajustes', icon: <CogIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-md z-40 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-around max-w-screen-md mx-auto">
        {navItems.map(item => (
          <NavItem
            key={item.page}
            {...item}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;