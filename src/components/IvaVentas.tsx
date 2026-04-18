import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sosApi } from '../api/sos';
import { Calculator, FileText } from 'lucide-react';

export const IvaVentas: React.FC = () => {
  const { jwtc } = useAuth();
  const [comprobantes, setComprobantes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const currentYear = new Date().getFullYear();
  const [anio, setAnio] = useState(currentYear.toString());
  const [mes, setMes] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));

  const fetchIva = async () => {
    setIsLoading(true);
    setError('');
    // Asumimos que ejercicio es el año, o '2024' según el ejemplo en la doc
    const ejercicio = anio; 
    try {
      const resp = await sosApi.getIvaVentas(jwtc!, ejercicio, anio, mes);
      setComprobantes(Array.isArray(resp) ? resp : resp.data || []);
    } catch (err: any) {
      setError(err?.message || 'Error al obtener Libro IVA Ventas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIva();
  };

  const formatearMoneda = (valor: any) => {
    const num = Number(valor);
    if (isNaN(num)) return '$ 0,00';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(num);
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) return '-';
    // Asumiendo AAAA-MM-DD
    const parts = fecha.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return fecha;
  };

  // Calcular totales
  const totalIva = comprobantes.reduce((acc, curr) => acc + (Number(curr.iva) || Number(curr.importe_iva) || 0), 0);
  const totalGeneral = comprobantes.reduce((acc, curr) => acc + (Number(curr.total) || Number(curr.importe_total) || 0), 0);

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
      <div className="h-[60px] bg-white border-b border-border-main flex justify-between items-center px-6 flex-shrink-0">
        <h1 className="text-[18px] text-text-main font-bold">Libro IVA Ventas</h1>
        <div className="flex items-center gap-3">
          <span className="px-2 py-[2px] rounded-[10px] text-[10px] font-bold bg-accent-main text-primary-main">JWT Conectado</span>
          <div className="w-8 h-8 bg-[#ddd] rounded-full"></div>
        </div>
      </div>

      <div className="p-[24px] flex-1 overflow-hidden flex flex-col gap-[20px]">
        {/* Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px]">
          <div className="bg-white rounded-[12px] p-[16px] border border-border-main shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="text-[11px] uppercase tracking-[0.5px] text-text-muted mb-1 font-bold">Subtotal Neto</div>
            <div className="text-[20px] font-bold font-mono text-text-main">
              {comprobantes.length ? formatearMoneda(comprobantes.reduce((acc, curr) => acc + (Number(curr.neto) || Number(curr.neto_gravado) || 0), 0)) : '$ 0,00'}
            </div>
          </div>
          <div className="bg-white rounded-[12px] p-[16px] border border-border-main shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="text-[11px] uppercase tracking-[0.5px] text-text-muted mb-1 font-bold">Débito Fiscal (IVA)</div>
            <div className="text-[20px] font-bold font-mono text-primary-main">{formatearMoneda(totalIva)}</div>
          </div>
          <div className="bg-white rounded-[12px] p-[16px] border border-border-main shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="text-[11px] uppercase tracking-[0.5px] text-text-muted mb-1 font-bold">Total General</div>
            <div className="text-[20px] font-bold font-mono text-text-main">{formatearMoneda(totalGeneral)}</div>
          </div>
        </div>

        {error && (
          <div className="p-4 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-[6px]">
            {error}
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white rounded-[12px] border border-border-main flex-1 overflow-hidden flex flex-col">
          <div className="p-[16px] px-[20px] border-b border-border-main flex justify-between items-center">
            <form onSubmit={handleSubmit} className="flex gap-[10px]">
              <select
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="px-3 py-1.5 rounded-[6px] border border-border-main bg-white cursor-pointer text-[13px] outline-none"
              >
                {meses.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                className="px-3 py-1.5 rounded-[6px] border border-border-main bg-white cursor-pointer text-[13px] outline-none"
              >
                {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isLoading}
                className="px-3 py-1.5 rounded-[6px] border border-primary-main bg-primary-main text-white font-bold cursor-pointer text-[13px] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Consultando...' : 'Consultar'}
              </button>
            </form>
            <div className="text-[12px] text-text-muted">
              Registros: {comprobantes.length}
            </div>
          </div>

          {!isLoading && comprobantes.length === 0 && !error ? (
            <div className="flex justify-center flex-1 items-center p-12 text-center bg-gray-50/50">
              <span className="text-text-muted text-[13px]">Seleccioná Año y Mes para consultar el Libro IVA Ventas.</span>
            </div>
          ) : !isLoading && comprobantes.length > 0 ? (
            <>
              <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr>
                      <th className="bg-gray-50 text-text-muted text-[11px] uppercase px-5 py-3 text-left border-b border-border-main w-[15%]">Fecha</th>
                      <th className="bg-gray-50 text-text-muted text-[11px] uppercase px-5 py-3 text-left border-b border-border-main w-[40%]">Cliente</th>
                      <th className="bg-gray-50 text-text-muted text-[11px] uppercase px-5 py-3 text-left border-b border-border-main w-[15%]">Neto</th>
                      <th className="bg-gray-50 text-text-muted text-[11px] uppercase px-5 py-3 text-left border-b border-border-main w-[15%]">IVA</th>
                      <th className="bg-gray-50 text-text-muted text-[11px] uppercase px-5 py-3 text-left border-b border-border-main w-[15%]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprobantes.map((comp, idx) => (
                      <tr key={comp.id || idx}>
                        <td className="px-5 py-3 border-b border-border-main text-[13px] whitespace-nowrap overflow-hidden text-ellipsis text-text-main">
                          {formatearFecha(comp.fecha)}
                        </td>
                        <td className="px-5 py-3 border-b border-border-main text-[13px] whitespace-nowrap overflow-hidden text-ellipsis text-text-main" title={comp.cliente || comp.razon_social}>
                          {comp.cliente || comp.razon_social || '-'}
                        </td>
                        <td className="px-5 py-3 border-b border-border-main text-[12px] font-mono whitespace-nowrap overflow-hidden text-ellipsis text-text-main">
                          {formatearMoneda(comp.neto || comp.neto_gravado)}
                        </td>
                        <td className="px-5 py-3 border-b border-border-main text-[12px] font-mono whitespace-nowrap overflow-hidden text-ellipsis text-text-main">
                          {formatearMoneda(comp.iva || comp.importe_iva)}
                        </td>
                        <td className="px-5 py-3 border-b border-border-main text-[12px] font-mono whitespace-nowrap overflow-hidden text-ellipsis text-text-main font-bold">
                          {formatearMoneda(comp.total || comp.importe_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-border-main text-right">
                <div className="flex gap-[10px] justify-end">
                  <button disabled className="opacity-50 cursor-not-allowed bg-white px-3 py-1.5 rounded-[6px] border border-border-main text-[13px] text-text-main">
                    &laquo; Ant.
                  </button>
                  <button className="px-3 py-1.5 rounded-[6px] border border-primary-main bg-accent-main text-primary-main text-[13px] font-bold">
                    1
                  </button>
                  <button disabled className="opacity-50 cursor-not-allowed bg-white px-3 py-1.5 rounded-[6px] border border-border-main text-[13px] text-text-main">
                    Sig. &raquo;
                  </button>
                </div>
              </div>
            </>
          ) : isLoading ? (
            <div className="flex justify-center flex-1 items-center">
              <span className="text-text-muted text-[13px]">Buscando comprobantes...</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

};
