import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sosApi } from '../api/sos';
import { Calculator, FileText, Search, Download, Calendar, ArrowRight, Table } from 'lucide-react';

interface IvaVentaItem {
  fecha: string;
  letra: string;
  sucursal: string | number;
  numero: string | number;
  clipro?: string;
  razonsocial?: string;
  cliente?: string;
  cuit?: string;
  neto: number;
  iva_total?: number;
  iva?: number;
  importe_iva?: number;
  iva_al_21?: number;
  iva_al_10_5?: number;
  iva_al_27?: number;
  iva_al_5?: number;
  iva_al_2_5?: number;
  iva_otros?: number;
  montototal?: number;
  total?: number;
  importe_total?: number;
}

export const IvaVentas: React.FC = () => {
  const { jwtc } = useAuth();
  const [comprobantes, setComprobantes] = useState<IvaVentaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const currentYear = new Date().getFullYear().toString();
  const [ejercicio, setEjercicio] = useState(currentYear);
  const [anio, setAnio] = useState(currentYear);
  const [mes, setMes] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));

  const [respSumary, setRespSummary] = useState<any>(null);

  const fetchIva = async () => {
    if (!jwtc) return;
    setIsLoading(true);
    setError('');
    
    try {
      console.log("Consultando IVA Ventas con:", { ejercicio, anio, mes });
      const resp = await sosApi.getIvaVentas(jwtc, ejercicio, anio, mes);
      console.log("Respuesta IVA Ventas completa:", resp);

      let itemsArray = [];
      
      if (Array.isArray(resp)) {
        itemsArray = resp;
      } else if (resp && typeof resp === 'object') {
        // Guardamos el objeto completo para usar los totales de la raíz si existen
        setRespSummary(resp);
        
        // Buscamos el array de comprobantes en las propiedades conocidas
        itemsArray = resp.comprobantes || resp.items || resp.data || resp.resultados || resp.listado || [];
        
        // Si no lo encontramos y el objeto tiene una propiedad que es un array, usamos esa
        if (itemsArray.length === 0) {
          const possibleArray = Object.values(resp).find(val => Array.isArray(val));
          if (possibleArray) itemsArray = possibleArray as any[];
        }
      }
      
      setComprobantes(itemsArray);
    } catch (err: any) {
      console.error("Error al obtener Libro IVA Ventas:", err);
      setError(err?.message || 'Error al obtener Libro IVA Ventas. Verifique la conexión y los permisos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIva();
  };

  const parseSafeNumber = (val: any): number => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    // Si es un string, intentamos limpiar formatos de miles/decimales comunes
    const clean = String(val).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const formatearMoneda = (valor: any) => {
    const num = typeof valor === 'number' ? valor : parseSafeNumber(valor);
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(num);
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) return '-';
    const cleanDate = fecha.split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return fecha;
  };

  // Cálculos de Totales (Lógica Cooperativa de 3 niveles)
  const totales = React.useMemo(() => {
    // 1. Intentar calcular sumando el listado actual (siempre es la fuente de verdad de lo que se ve)
    const calculados = comprobantes.reduce((acc, curr) => {
      const neto = parseSafeNumber(curr.neto || (curr as any).neto_gravado);
      const ivaValue = parseSafeNumber(curr.iva_total || curr.iva || curr.importe_iva);
      const totalValue = parseSafeNumber(curr.montototal || curr.total || curr.importe_total) || (neto + ivaValue);
      
      const iva21 = parseSafeNumber(curr.iva_al_21);
      const iva105 = parseSafeNumber(curr.iva_al_10_5);

      return {
        neto: acc.neto + neto,
        iva: acc.iva + ivaValue,
        total: acc.total + totalValue,
        iva21: acc.iva21 + iva21,
        iva105: acc.iva105 + iva105
      };
    }, { neto: 0, iva: 0, total: 0, iva21: 0, iva105: 0 });

    // 2. Si el cálculo dio 0 pero tenemos datos en respSumary (raíz de API), preferimos los de la raíz
    if (calculados.total === 0 && respSumary) {
      return {
        neto: parseSafeNumber(respSumary.gravado || respSumary.neto),
        iva: parseSafeNumber(respSumary.iva_total || respSumary.iva),
        total: parseSafeNumber(respSumary.total || respSumary.montototal),
        iva21: parseSafeNumber(respSumary.iva_al_21 || respSumary.DF_iva_al_21),
        iva105: parseSafeNumber(respSumary.iva_al_10_5 || respSumary.DF_iva_al_10_5)
      };
    }

    // 3. Si el cálculo de comprobantes es > 0, lo usamos (o lo mezclamos con la raíz si faltan campos)
    return {
      neto: calculados.neto || parseSafeNumber(respSumary?.gravado),
      iva: calculados.iva || parseSafeNumber(respSumary?.iva_total),
      total: calculados.total || parseSafeNumber(respSumary?.total),
      iva21: calculados.iva21 || parseSafeNumber(respSumary?.iva_al_21),
      iva105: calculados.iva105 || parseSafeNumber(respSumary?.iva_al_10_5)
    };
  }, [comprobantes, respSumary]);

  const meses = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-bg-app">
      {/* Header Sleek */}
      <div className="h-[64px] bg-white border-b border-border-main flex justify-between items-center px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Calculator className="text-primary-main w-5 h-5" />
          <h1 className="text-[18px] text-text-main font-bold">Libro IVA Ventas</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-[12px] text-text-muted bg-bg-app px-3 py-1.5 rounded-full border border-border-main">
            <Calendar className="w-3.5 h-3.5" />
            <span>Ejercicio: <strong>{ejercicio}</strong></span>
          </div>
          <div className="w-8 h-8 bg-accent-main rounded-full flex items-center justify-center text-primary-main font-bold text-[12px]">
            {mes}
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-hidden flex flex-col gap-6">
        
        {/* Filters Panel */}
        <div className="bg-white p-5 rounded-[12px] border border-border-main shadow-sm shadow-black/[0.02]">
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Ejercicio</label>
              <input
                type="text"
                value={ejercicio}
                onChange={(e) => setEjercicio(e.target.value)}
                className="w-[100px] px-3 py-2 rounded-[8px] border border-border-main bg-white text-[13px] outline-none focus:border-primary-main transition-colors"
                placeholder="AAAA"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Año</label>
              <input
                type="text"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                className="w-[100px] px-3 py-2 rounded-[8px] border border-border-main bg-white text-[13px] outline-none focus:border-primary-main transition-colors"
                placeholder="AAAA"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Mes</label>
              <select
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="w-[140px] px-3 py-2 rounded-[8px] border border-border-main bg-white cursor-pointer text-[13px] outline-none focus:border-primary-main transition-colors"
              >
                {meses.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-[8px] bg-primary-main text-white font-bold text-[13px] flex items-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-70 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Consultando...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Consultar</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white rounded-[16px] p-5 border border-border-main shadow-sm shadow-black/[0.02] flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <FileText className="w-16 h-16" />
            </div>
            <div className="text-[11px] uppercase tracking-[1px] text-text-muted mb-1 font-bold">Subtotal Neto</div>
            <div className="text-[24px] font-bold text-text-main tracking-tight">{formatearMoneda(totales.neto)}</div>
            <div className="mt-2 text-[11px] text-green-600 font-bold flex items-center gap-1">
               Gravado Registrado
            </div>
          </div>
          <div className="bg-white rounded-[16px] p-5 border border-border-main shadow-sm shadow-black/[0.02] flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <Calculator className="w-16 h-16 text-primary-main" />
            </div>
            <div className="text-[11px] uppercase tracking-[1px] text-text-muted mb-1 font-bold">Débito Fiscal (IVA)</div>
            <div className="text-[24px] font-bold text-primary-main tracking-tight">{formatearMoneda(totales.iva)}</div>
            <div className="mt-2 text-[10px] text-text-muted flex gap-3">
               <span>21%: <strong>{formatearMoneda(totales.iva21)}</strong></span>
               <span>10.5%: <strong>{formatearMoneda(totales.iva105)}</strong></span>
            </div>
          </div>
          <div className="bg-primary-main rounded-[16px] p-5 shadow-lg shadow-primary-main/20 flex flex-col justify-between text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-[0.1]">
              <Table className="w-16 h-16" />
            </div>
            <div className="text-[11px] uppercase tracking-[1px] text-white/70 mb-1 font-bold">Total General</div>
            <div className="text-[24px] font-bold tracking-tight">{formatearMoneda(totales.total)}</div>
            <div className="mt-2 text-[11px] text-white/50 font-medium">Facturado en el periodo</div>
          </div>
          <div className="bg-white rounded-[16px] p-5 border border-border-main shadow-sm shadow-black/[0.02] flex flex-col justify-center items-center text-center">
             <div className="text-[10px] text-text-muted uppercase font-bold mb-3 tracking-widest">Acciones Rápidas</div>
             <div className="flex gap-2">
                <button className="p-2.5 rounded-[10px] border border-border-main hover:bg-bg-app transition-colors text-text-main" title="Descargar Excel">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2.5 rounded-[10px] border border-border-main hover:bg-bg-app transition-colors text-text-main" title="Ver Detalle Ampliado">
                  <ArrowRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>

        {error && (
          <div className="p-4 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-[8px] flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            {error}
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white rounded-[16px] border border-border-main flex-1 overflow-hidden flex flex-col shadow-sm shadow-black/[0.01]">
          {!isLoading && comprobantes.length === 0 && !error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/20">
              <div className="w-16 h-16 bg-bg-app rounded-full flex items-center justify-center mb-4 border border-border-main text-text-muted">
                <FileText className="w-6 h-6 opacity-30" />
              </div>
              <h3 className="text-[15px] font-bold text-text-main mb-1">Sin comprobantes para mostrar</h3>
              <p className="text-text-muted text-[13px] max-w-[280px]">Seleccioná un periodo y hacé clic en Consultar para ver el Libro IVA Ventas.</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full border-collapse min-w-[900px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-50/80 backdrop-blur-sm border-b border-border-main">
                      <th className="text-text-muted text-[10px] font-bold uppercase tracking-widest px-6 py-4 text-left">Fecha</th>
                      <th className="text-text-muted text-[10px] font-bold uppercase tracking-widest px-6 py-4 text-left">Tipo / Número</th>
                      <th className="text-text-muted text-[10px] font-bold uppercase tracking-widest px-6 py-4 text-left">Cliente / CUIT</th>
                      <th className="text-text-muted text-[10px] font-bold uppercase tracking-widest px-6 py-4 text-right">Neto Gravado</th>
                      <th className="text-text-muted text-[10px] font-bold uppercase tracking-widest px-6 py-4 text-right">Débito IVA</th>
                      <th className="text-text-muted text-[10px] font-bold uppercase tracking-widest px-6 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/50">
                    {isLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                          <td className="px-6 py-4">
                            <div className="h-3.5 bg-gray-100 rounded w-48 mb-2"></div>
                            <div className="h-3 bg-gray-50 rounded w-32"></div>
                          </td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20 ml-auto"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20 ml-auto"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24 ml-auto"></div></td>
                        </tr>
                      ))
                    ) : (
                      comprobantes.map((comp, idx) => {
                        const razon = comp.clipro || comp.razonsocial || comp.razon_social || comp.cliente || '-';
                        const nro = comp.numero || 'S/N';
                        const punto = comp.sucursal ? String(comp.sucursal).padStart(4, '0') : '0000';
                        const letra = comp.letra || 'F';
                        
                        const neto = parseSafeNumber(comp.neto || (comp as any).neto_gravado);
                        const iva = parseSafeNumber(comp.iva_total || comp.iva || comp.importe_iva);
                        const total = parseSafeNumber(comp.montototal || comp.total || comp.importe_total) || (neto + iva);

                        return (
                          <tr key={idx} className="hover:bg-bg-app/50 transition-colors group">
                            <td className="px-6 py-4 text-[13px] text-text-main font-medium whitespace-nowrap">
                              {formatearFecha(comp.fecha)}
                            </td>
                            <td className="px-6 py-4 text-[13px] whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 flex items-center justify-center bg-accent-main text-primary-main text-[10px] font-bold rounded-sm border border-primary-main/10">{letra}</span>
                                <span className="text-text-main font-mono">{punto}-{nro}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 overflow-hidden">
                              <div className="text-[13px] font-bold text-text-main truncate max-w-[320px]" title={razon}>{razon}</div>
                              <div className="text-[11px] text-text-muted mt-0.5">{comp.cuit || 'CUIT Desconocido'}</div>
                            </td>
                            <td className="px-6 py-4 text-[13px] text-right font-mono text-text-main whitespace-nowrap">
                              {formatearMoneda(neto)}
                            </td>
                            <td className="px-6 py-4 text-[13px] text-right font-mono text-text-main whitespace-nowrap">
                              {formatearMoneda(iva)}
                            </td>
                            <td className="px-6 py-4 text-[13px] text-right font-bold font-mono text-text-main whitespace-nowrap group-hover:text-primary-main transition-colors">
                              {formatearMoneda(total)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {!isLoading && comprobantes.length > 0 && (
                    <tfoot className="sticky bottom-0 z-10 bg-white border-t-2 border-primary-main/20">
                      <tr className="bg-primary-main/[0.02]">
                        <td colSpan={3} className="px-6 py-4 text-[11px] font-bold text-primary-main uppercase tracking-widest">
                          Total General del Periodo
                        </td>
                        <td className="px-6 py-4 text-[14px] text-right font-bold font-mono text-primary-main whitespace-nowrap">
                          {formatearMoneda(totales.neto)}
                        </td>
                        <td className="px-6 py-4 text-[14px] text-right font-bold font-mono text-primary-main whitespace-nowrap">
                          {formatearMoneda(totales.iva)}
                        </td>
                        <td className="px-6 py-4 text-[15px] text-right font-bold font-mono text-primary-main whitespace-nowrap bg-primary-main/5">
                          {formatearMoneda(totales.total)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              <div className="px-6 py-4 border-t border-border-main bg-gray-50/30 flex items-center justify-between">
                <div className="text-[12px] text-text-muted font-medium">
                  Total de Comprobantes: <span className="text-text-main font-bold">{comprobantes.length}</span>
                </div>
                <div className="flex gap-[8px]">
                  <button disabled className="opacity-50 cursor-not-allowed px-3 py-1.5 rounded-[8px] border border-border-main bg-white text-[12px] font-bold text-text-main shadow-sm">
                    Anterior
                  </button>
                  <button className="px-4 py-1.5 rounded-[8px] bg-primary-main text-white text-[12px] font-bold shadow-md shadow-primary-main/10">
                    1
                  </button>
                  <button disabled className="opacity-50 cursor-not-allowed px-3 py-1.5 rounded-[8px] border border-border-main bg-white text-[12px] font-bold text-text-main shadow-sm">
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
