import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ClientesList } from './ClientesList';
import { IvaVentas } from './IvaVentas';
import { LibroMayor } from './LibroMayor';
import { Building2, Users, FileText, Menu, X, BookOpen } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { selectedCuit, clearCuitSelection, logout } = useAuth();
  const [activeView, setActiveView] = useState<'clientes' | 'iva' | 'mayor'>('clientes');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-[280px] bg-sidebar border-r border-border-main transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col flex-shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full bg-sidebar">
          {/* Header */}
          <div className="px-[20px] py-[20px] border-b border-border-main">
            <h2 className="text-[18px] text-primary-main mb-1 font-bold">SOS Contador</h2>
            <p className="text-[12px] text-text-muted">Dashboard v1.0.0</p>
          </div>

          {/* CUIT Selector Info */}
          <div className="px-[20px] pt-[20px] pb-0">
            <div className="text-[10px] uppercase font-bold text-text-muted mb-2 tracking-[0.5px]">
              CUIT Seleccionado
            </div>
            
            <div 
              className="bg-accent-main border border-primary-main rounded-[6px] p-[10px] mb-[15px] cursor-pointer"
              onClick={clearCuitSelection}
              title="Cambiar CUIT"
            >
               <div className="font-bold text-text-main">{selectedCuit?.cuit || 'Sin CUIT'}</div>
               <div className="text-[11px] text-text-muted truncate">{selectedCuit?.razon_social || 'Desconocido'}</div>
            </div>

            <div className="text-[10px] uppercase font-bold text-text-muted mt-[15px] mb-2 tracking-[0.5px]">
              Menú
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-[20px] pb-5 space-y-1 overflow-y-auto">
            <button
               onClick={() => { setActiveView('clientes'); setIsSidebarOpen(false); }}
               className={`w-full text-left px-3 py-2 rounded-[6px] text-[14px] mb-1 transition-colors flex flex-col ${activeView === 'clientes' ? 'bg-primary-main text-white' : 'text-text-main hover:bg-bg-app'}`}
            >
               <span className="font-bold">Clientes</span>
            </button>
            <button
               onClick={() => { setActiveView('iva'); setIsSidebarOpen(false); }}
               className={`w-full text-left px-3 py-2 rounded-[6px] text-[14px] mb-1 transition-colors flex flex-col ${activeView === 'iva' ? 'bg-primary-main text-white' : 'text-text-main hover:bg-bg-app'}`}
            >
               <span className="font-bold">Libro IVA Ventas</span>
            </button>
            <button
               onClick={() => { setActiveView('mayor'); setIsSidebarOpen(false); }}
               className={`w-full text-left px-3 py-2 rounded-[6px] text-[14px] mb-1 transition-colors flex flex-col ${activeView === 'mayor' ? 'bg-primary-main text-white' : 'text-text-main hover:bg-bg-app'}`}
            >
               <span className="font-bold">Libro Mayor</span>
            </button>
          </nav>

          {/* Footer */}
          <div className="p-[20px] border-t border-border-main">
            <button 
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-[6px] text-[14px] transition-colors text-text-muted hover:bg-bg-app font-bold"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg-app">
        {/* Topbar for mobile */}
        <header className="lg:hidden bg-white border-b border-border-main px-4 py-3 flex items-center justify-between text-primary-main">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="mr-3">
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-bold text-[18px]">SOS App</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full p-0 flex flex-col">
          {activeView === 'clientes' && <ClientesList />}
          {activeView === 'iva' && <IvaVentas />}
          {activeView === 'mayor' && <LibroMayor />}
        </div>
      </main>

    </div>
  );
};
