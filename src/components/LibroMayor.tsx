import React, { useState, useEffect } from 'react';
import { sosApi } from '../api/sos';
import { useAuth } from '../context/AuthContext';
import { Search, ChevronLeft, ChevronRight, FileText, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface MayorItem {
  cuenta: string;
  fecha: string;
  cuit: string | null;
  clipro: string;
  idcentrocosto: number;
  numero: string;
  montodebe: number;
  montohaber: number;
  montosaldo: number;
}

interface CuentaNode {
  id?: string | number;
  codigo?: string;
  arbol?: string;
  nombre?: string;
  desc?: string;
  hijos?: CuentaNode[];
  [key: string]: any;
}

export const LibroMayor: React.FC = () => {
  const { jwtc } = useAuth();
  
  const [items, setItems] = useState<MayorItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const currentYear = new Date().getFullYear().toString();
  const [ejercicio, setEjercicio] = useState(currentYear);
  const [fechadesde, setFechadesde] = useState(`${currentYear}-01-01`);
  const [fechahasta, setFechahasta] = useState(`${currentYear}-12-31`);
  const [arbol, setArbol] = useState('');
  
  // Pagination
  const [pagina, setPagina] = useState(1);
  const [registros, setRegistros] = useState(50);
  const [totalPages, setTotalPages] = useState(1); // will guess basically
  
  // Plan de Cuentas
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [isLoadingCuentas, setIsLoadingCuentas] = useState(false);
  const [showTree, setShowTree] = useState(false);

  useEffect(() => {
    if (jwtc) {
      loadCuentas();
    }
  }, [jwtc]);

  // Handle Enter key for search
  useEffect(() => {
    if (jwtc) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina]); // Only re-fetch automatically if page changes. Manual search is done by button

  const loadCuentas = async () => {
    setIsLoadingCuentas(true);
    try {
      const resp = await sosApi.getPlanDeCuentas(jwtc!);
      let list = resp?.cuentas || resp?.items || resp?.resultados || [];
      if (!Array.isArray(list) && typeof resp === 'object') {
        // sometimes it returns an object of objects or directly an array
        list = Array.isArray(resp) ? resp : [];
      }
      setCuentas(list);
    } catch (err: any) {
      console.warn("No se pudo cargar el plan de cuentas", err);
    } finally {
      setIsLoadingCuentas(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!jwtc) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const resp = await sosApi.getLibroMayor(jwtc, ejercicio, {
        fechadesde,
        fechahasta,
        pagina,
        registros,
        arbol
      });
      
      // Postman says it returns { fechadesde, fechahasta, items: [...] }
      if (resp && resp.items && Array.isArray(resp.items)) {
        setItems(resp.items);
        // Simple pagination logic, if we get 50 items, there might be more
        if (resp.items.length === registros) {
          setTotalPages(pagina + 1);
        } else {
          setTotalPages(pagina);
        }
      } else {
        setItems([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al cargar el libro mayor');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    if (typeof val !== 'number') return '$ 0.00';
    return val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('es-AR');
    } catch {
      return dateString;
    }
  };

  // Recursive tree render for accounts (fallback to flat options if tree doesn't have standard fields)
  // We assume accounts have something like "arbol" or "codigo" and "nombre" or "desc"
  const renderAccountNode = (cuenta: any, level = 0) => {
    // try to guess the arbol/code field and name field
    const code = cuenta.arbol || cuenta.codigo || cuenta.id || '';
    const name = cuenta.nombre || cuenta.descripcion || cuenta.desc || cuenta.cuenta || 'Cuenta';
    const children = cuenta.hijos || cuenta.children || [];
    const hasChildren = Array.isArray(children) && children.length > 0;

    return (
      <div key={code} className="flex flex-col">
        <div 
          className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer rounded ${arbol === code ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
          onClick={() => {
            setArbol(code);
            setShowTree(false);
          }}
        >
          <div className="w-4 h-4 mr-2 flex items-center justify-center text-gray-400">
            {hasChildren && <ChevronRightIcon className="w-3 h-3" />}
            {!hasChildren && <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>}
          </div>
          <span className="text-xs font-mono mr-2 text-gray-500">{code}</span>
          <span className="text-sm truncate">{name}</span>
        </div>
        {hasChildren && children.map((child: any) => renderAccountNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-bg-app">
      <div className="p-4 md:p-6 bg-white border-b border-border-main flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-bold text-text-main flex items-center">
            <FileText className="mr-2 text-primary-main w-5 h-5" />
            Libro Mayor Contable
          </h1>
        </div>

        <form onSubmit={(e) => { setPagina(1); handleSearch(e); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
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
                value={fechadesde} 
                onChange={(e) => setFechadesde(e.target.value)}
                className="rounded-[6px] border border-border-main bg-white px-3 py-2 text-[13px] outline-none focus:border-primary-main"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[12px] font-bold text-text-muted mb-1 uppercase">Hasta</label>
              <input 
                type="date" 
                value={fechahasta} 
                onChange={(e) => setFechahasta(e.target.value)}
                className="rounded-[6px] border border-border-main bg-white px-3 py-2 text-[13px] outline-none focus:border-primary-main"
                required
              />
            </div>

            <div className="flex flex-col md:col-span-2 relative">
              <label className="text-[12px] font-bold text-text-muted mb-1 uppercase">Cuenta Contable (Árbol)</label>
              <div className="relative w-full">
                <input 
                  type="text" 
                  value={arbol} 
                  onChange={(e) => setArbol(e.target.value)}
                  onFocus={() => setShowTree(true)}
                  className="w-full rounded-[6px] border border-border-main bg-white px-3 py-2 text-[13px] outline-none focus:border-primary-main pr-8"
                  placeholder="Ej: 01.01.01.001.001 (Opcional)"
                />
                <button 
                  type="button"
                  onClick={() => setShowTree(!showTree)}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              
              {/* Dropdown flotante temporal para seleccionar cuentas */}
              {showTree && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-border-main rounded-md shadow-lg max-h-60 overflow-y-auto w-full md:w-[400px]">
                  <div className="p-2 border-b border-border-main flex justify-between items-center bg-gray-50">
                    <span className="text-xs font-semibold text-gray-500">Selector de Cuentas</span>
                    <button type="button" onClick={() => setShowTree(false)} className="text-xs text-blue-600 hover:underline">Cerrar</button>
                  </div>
                  {isLoadingCuentas ? (
                     <div className="p-4 text-center text-sm text-gray-500">Cargando árbol...</div>
                  ) : cuentas.length > 0 ? (
                    <div className="py-2">
                       {cuentas.map(c => renderAccountNode(c))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No se detectó un árbol (ingrese código manualmente)
                    </div>
                  )}
                </div>
              )}
            </div>
            
          </div>
          
          <div className="flex items-center justify-end pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-primary-main text-white rounded-[6px] text-[13px] font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span>Buscando movimientos...</span>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Consultar Mayor
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 m-4 bg-red-50 border border-red-200 text-red-700 rounded-[6px] text-[13px]">
          {error}
        </div>
      )}

      <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col min-h-0">
        <div className="bg-white rounded-[8px] border border-border-main shadow-sm flex flex-col flex-1 overflow-hidden">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-bg-app border-b border-border-main sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider">Comprobante</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider">Cuenta / Cliente</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-right">Debe</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-right">Haber</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-right bg-gray-50/80">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {isLoading ? (
                  // Skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div></td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text-muted text-[13px]">
                      No hay movimientos en este ejercicio para la selección actual.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-bg-app transition-colors text-[13px]">
                      <td className="px-4 py-3 whitespace-nowrap text-text-main font-medium">
                        {formatDate(item.fecha)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-text-main">
                        {item.numero || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-text-main text-xs truncate max-w-[300px]" title={item.cuenta}>{item.cuenta}</div>
                        {item.clipro && <div className="text-[11px] text-text-muted truncate max-w-[300px] mt-0.5">{item.clipro}</div>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700 font-mono">
                        {item.montodebe !== 0 ? formatCurrency(item.montodebe) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700 font-mono">
                        {item.montohaber !== 0 ? formatCurrency(item.montohaber) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-text-main font-mono bg-gray-50/30">
                        {formatCurrency(item.montosaldo)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
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
