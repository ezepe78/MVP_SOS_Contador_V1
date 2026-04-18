import React, { useState, useEffect } from 'react';
import { sosApi } from '../api/sos';
import { useAuth } from '../context/AuthContext';
import { Search, ChevronLeft, ChevronRight, Scale, AlertTriangle } from 'lucide-react';

interface SumasItem {
  id?: string | number;
  cuenta: string;
  codigo?: string;
  arbol?: string;
  debe?: number;
  haber?: number;
  saldo?: number;
  montodebe?: number;
  montohaber?: number;
  montosaldo?: number;
  [key: string]: any;
}

const formatCurrency = (val: number) => {
  if (typeof val !== 'number') return '$ 0.00';
  return val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
};

const SumasRow = React.memo(({ item }: { item: SumasItem }) => {
  const accountName = item.cuenta || item.nombre || item.desc || '-';
  const accountCode = item.arbol || item.codigo || item.id || '';
  const debe = item.debe || item.montodebe || 0;
  const haber = item.haber || item.montohaber || 0;
  const saldo = item.saldo || item.montosaldo || 0;

  return (
    <tr className="hover:bg-bg-app transition-colors text-[13px]">
      <td className="px-5 py-3 border-b border-border-main text-text-main font-medium">
        <div className="flex flex-col">
          <span>{accountName}</span>
          {accountCode && <span className="text-[11px] text-text-muted font-mono">{accountCode}</span>}
        </div>
      </td>
      <td className="px-5 py-3 border-b border-border-main text-right text-gray-700 font-mono">
        {debe !== 0 ? formatCurrency(debe) : '-'}
      </td>
      <td className="px-5 py-3 border-b border-border-main text-right text-gray-700 font-mono">
        {haber !== 0 ? formatCurrency(haber) : '-'}
      </td>
      <td className="px-5 py-3 border-b border-border-main text-right font-bold text-text-main font-mono bg-gray-50/30">
        {formatCurrency(saldo)}
      </td>
    </tr>
  );
});

export const SumasYSaldos: React.FC = () => {
  const { jwtc } = useAuth();
  
  const [ejercicio, setEjercicio] = useState(new Date().getFullYear().toString());
  const [fechaDesde, setFechaDesde] = useState(`${new Date().getFullYear()}-01-01`);
  const [fechaHasta, setFechaHasta] = useState(`${new Date().getFullYear()}-12-31`);
  
  const [items, setItems] = useState<SumasItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [pagina, setPagina] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const registros = 50; // default pagination size if needed

  useEffect(() => {
    // Para que no esté vacío al iniciar, podríamos cargar inicial o esperar a que el usuario busque
    // handleSearch(null); // Descomentar si se desea carga automática inicial
  }, [jwtc]);

  const handleSearch = async (e?: React.FormEvent, forceRefresh = false) => {
    if (e) e.preventDefault();
    if (!jwtc) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      const safeEj = ejercicio.trim() || new Date().getFullYear().toString();
      
      const resp = await sosApi.getSumasYSaldos(jwtc, safeEj, fechaDesde, fechaHasta, forceRefresh);
      
      let parsedItems: any[] = [];

      // The API might return an array directly, or an object { items: [] }, or { data: [] }
      if (Array.isArray(resp)) {
        parsedItems = resp;
      } else if (resp && resp.items && Array.isArray(resp.items)) {
        parsedItems = resp.items;
      } else if (resp && resp.data && Array.isArray(resp.data)) {
        parsedItems = resp.data;
      } else if (resp && typeof resp === 'object' && !resp.mensaje) {
        // Podría ser un objeto donde las keys son las cuentas
        parsedItems = Object.values(resp).filter(val => typeof val === 'object');
      }

      if (parsedItems && parsedItems.length > 0) {
        setItems(parsedItems);
        // Basic pagination deduction if backend doesn't provide
        if (parsedItems.length === registros) {
          setTotalPages(pagina + 1);
        } else {
          setTotalPages(pagina);
        }
      } else {
        setItems([]);
        if (resp && resp.mensaje) {
          setError(resp.mensaje);
        } else {
           setError('No se encontraron sumas y saldos para los filtros indicados.');
        }
      }
    } catch (err: any) {
      console.error("[UI] Error al cargar Sumas y Saldos:", err);
      const errorMessage = err?.message || 'Error desconocido al cargar las sumas y saldos';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const totalDebe = items.reduce((acc, curr) => acc + (curr.debe || curr.montodebe || 0), 0);
  const totalHaber = items.reduce((acc, curr) => acc + (curr.haber || curr.montohaber || 0), 0);
  const totalSaldo = items.reduce((acc, curr) => acc + (curr.saldo || curr.montosaldo || 0), 0);

  return (
    <div className="flex flex-col h-full bg-bg-app">
      <div className="p-4 md:p-6 bg-white border-b border-border-main flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-bold text-text-main flex items-center">
            <Scale className="mr-2 text-primary-main w-5 h-5" />
            Balance de Sumas y Saldos
          </h1>
          <button
              onClick={() => handleSearch(undefined, true)}
              disabled={isLoading}
              className="p-1.5 transition-colors text-text-muted hover:bg-gray-100 rounded-md"
              title="Forzar actualización (Ignorar caché)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-refresh-cw ${isLoading ? 'animate-spin' : ''}`}>
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              </svg>
          </button>
        </div>

        <form onSubmit={(e) => { setPagina(1); handleSearch(e); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-[12px] font-bold text-text-muted mb-1 uppercase">Ejercicio</label>
              <input 
                type="text" 
                value={ejercicio} 
                onChange={(e) => setEjercicio(e.target.value)}
                className="rounded-[6px] border border-border-main bg-white px-3 py-2 text-[13px] outline-none focus:border-primary-main"
                placeholder="AAAA"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[12px] font-bold text-text-muted mb-1 uppercase">Desde</label>
              <input 
                type="date" 
                value={fechaDesde} 
                onChange={(e) => setFechaDesde(e.target.value)}
                className="rounded-[6px] border border-border-main bg-white px-3 py-2 text-[13px] outline-none focus:border-primary-main"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[12px] font-bold text-text-muted mb-1 uppercase">Hasta</label>
              <input 
                type="date" 
                value={fechaHasta} 
                onChange={(e) => setFechaHasta(e.target.value)}
                className="rounded-[6px] border border-border-main bg-white px-3 py-2 text-[13px] outline-none focus:border-primary-main"
                required
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary-main text-white font-bold py-2 px-4 rounded-[6px] text-[13px] hover:bg-primary-dark transition-colors flex items-center justify-center h-[38px] disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col min-h-0 bg-transparent">
        {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[6px] flex items-center text-[13px]">
              <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
        )}

        <div className="flex-1 bg-white rounded-[8px] border border-border-main overflow-hidden flex flex-col shadow-sm">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left min-w-[800px] border-collapse">
              <thead className="bg-gray-50 border-b border-border-main sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider w-[40%]">Cuenta</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-right w-[20%]">Sumas Debe</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-right w-[20%]">Sumas Haber</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-right bg-gray-100/50 w-[20%]">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4 border-b border-border-main"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                      <td className="px-5 py-4 border-b border-border-main"><div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div></td>
                      <td className="px-5 py-4 border-b border-border-main"><div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div></td>
                      <td className="px-5 py-4 border-b border-border-main"><div className="h-4 bg-gray-200 rounded w-28 ml-auto"></div></td>
                    </tr>
                  ))
                ) : items.length === 0 && !error ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-text-muted text-[13px]">
                      Haga clic en <strong>Buscar</strong> para consultar el balance.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <SumasRow key={item.id || item.codigo || item.arbol || idx} item={item} />
                  ))
                )}
              </tbody>
              {!isLoading && items.length > 0 && (
                 <tfoot className="bg-gray-50 border-t border-border-main sticky bottom-0 z-10">
                    <tr className="font-bold text-text-main text-[13px]">
                        <td className="px-5 py-3 text-right">TOTALES</td>
                        <td className="px-5 py-3 text-right font-mono">{formatCurrency(totalDebe)}</td>
                        <td className="px-5 py-3 text-right font-mono">{formatCurrency(totalHaber)}</td>
                        <td className="px-5 py-3 text-right font-mono">{formatCurrency(totalSaldo)}</td>
                    </tr>
                 </tfoot>
              )}
            </table>
          </div>
          
          <div className="bg-white border-t border-border-main px-4 py-3 flex items-center justify-between">
            <span className="text-[12px] text-text-muted">
              Mostrando {items.length > 0 ? (pagina - 1) * registros + 1 : 0} a {(pagina - 1) * registros + items.length} registros
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1 || isLoading}
                className="p-1.5 rounded-[4px] border border-border-main text-text-main disabled:opacity-50 hover:bg-gray-50 transition-colors"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[13px] font-bold px-2">{pagina}</span>
              <button
                onClick={() => setPagina(p => p + 1)}
                disabled={pagina >= totalPages || isLoading}
                className="p-1.5 rounded-[4px] border border-border-main text-text-main disabled:opacity-50 hover:bg-gray-50 transition-colors"
                title="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
