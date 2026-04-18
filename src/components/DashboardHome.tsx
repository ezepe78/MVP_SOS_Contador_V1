import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { sosApi } from '../api/sos';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, AlertTriangle,
  CheckCircle, Wallet, Users, RefreshCw, ChevronDown
} from 'lucide-react';

// ────────────────────────────────────────────
// Utilidades puras (sin side effects)
// ────────────────────────────────────────────

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function parseSafeNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function formatCurrency(val: number): string {
  return val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
}

function formatCompactCurrency(val: number): string {
  if (Math.abs(val) >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return formatCurrency(val);
}

function extractItems(resp: any): any[] {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  // Buscar en claves conocidas de la API de SOS Contador
  const candidates = ['libros', 'comprobantes', 'items', 'data', 'listado', 'resultados'];
  for (const key of candidates) {
    if (resp[key] && Array.isArray(resp[key])) return resp[key];
  }
  // Fallback: buscar el primer array disponible en el objeto
  const possibleArray = Object.values(resp).find(val => Array.isArray(val));
  if (possibleArray) return possibleArray as any[];
  return [];
}

// Extrae totales que la API devuelve en la raíz del objeto (no dentro de libros)
function extractRootTotals(resp: any): Record<string, number> {
  if (!resp || typeof resp !== 'object') return {};
  const result: Record<string, number> = {};
  // Buscar en 'total' si es un array con un objeto de totales
  if (resp.total && Array.isArray(resp.total) && resp.total.length > 0) {
    const t = resp.total[0];
    for (const [key, val] of Object.entries(t)) {
      result[key] = parseSafeNumber(val);
    }
    return result;
  }
  // Buscar totales directos en la raíz
  const totalKeys = ['neto', 'gravado', 'neto_gravado', 'iva_total', 'iva', 'total', 'montototal',
    'iva_al_21', 'iva_al_10_5', 'iva_al_27', 'iva_al_5', 'iva_al_2_5',
    'DF_iva_al_21', 'CF_iva_al_21', 'ret_sufrida_realizado'];
  for (const key of totalKeys) {
    if (resp[key] !== undefined) {
      result[key] = parseSafeNumber(resp[key]);
    }
  }
  return result;
}

function sumField(items: any[], ...fieldNames: string[]): number {
  return items.reduce((acc, item) => {
    for (const f of fieldNames) {
      const val = parseSafeNumber(item[f]);
      if (val !== 0) return acc + val;
    }
    return acc;
  }, 0);
}

// ────────────────────────────────────────────
// Interfaces
// ────────────────────────────────────────────

interface KpiData {
  ventasNeto: number;
  ventasTotal: number;
  debitoFiscal: number;
  comprasNeto: number;
  comprasTotal: number;
  creditoFiscal: number;
  cobrosTotal: number;
  pagosTotal: number;
}

interface AlertItem {
  type: 'success' | 'warning' | 'danger';
  title: string;
  description: string;
  icon: React.ReactNode;
}

// ────────────────────────────────────────────
// Sub-componentes UI
// ────────────────────────────────────────────

const KpiCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  colorClass: string;
  isLoading: boolean;
}> = ({ label, value, icon, trend, colorClass, isLoading }) => (
  <div className="bg-white rounded-[12px] border border-border-main shadow-sm p-5 flex flex-col justify-between min-h-[130px] hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
      <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
    </div>
    {isLoading ? (
      <div className="animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-28 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-16"></div>
      </div>
    ) : (
      <>
        <div className="text-[22px] font-bold text-text-main tracking-tight">
          {formatCurrency(value)}
        </div>
        {trend !== undefined && trend !== 0 && (
          <div className={`flex items-center gap-1 mt-1 text-[11px] font-bold ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}% vs mes ant.
          </div>
        )}
      </>
    )}
  </div>
);

const AlertCard: React.FC<{ alert: AlertItem }> = ({ alert }) => {
  const colorMap = {
    success: 'border-l-green-500 bg-green-50/50',
    warning: 'border-l-amber-500 bg-amber-50/50',
    danger: 'border-l-red-500 bg-red-50/50',
  };
  const iconColorMap = {
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
  };
  return (
    <div className={`rounded-[8px] border border-border-main border-l-4 p-4 ${colorMap[alert.type]} transition-all hover:shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${iconColorMap[alert.type]}`}>{alert.icon}</div>
        <div>
          <div className="text-[13px] font-bold text-text-main">{alert.title}</div>
          <div className="text-[12px] text-text-muted mt-0.5">{alert.description}</div>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────
// Colores para gráficos
// ────────────────────────────────────────────

const CHART_COLORS = {
  ventas: '#2563eb',
  compras: '#f59e0b',
  cobros: '#10b981',
  pagos: '#ef4444',
  iva21: '#3b82f6',
  iva105: '#8b5cf6',
  iva27: '#06b6d4',
  ivaOtros: '#6b7280',
};

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6b7280'];

// ────────────────────────────────────────────
// Componente Principal
// ────────────────────────────────────────────

export const DashboardHome: React.FC = () => {
  const { jwtc } = useAuth();
  const now = new Date();
  const [anio, setAnio] = useState(now.getFullYear().toString());
  const [mes, setMes] = useState((now.getMonth() + 1).toString().padStart(2, '0'));
  const [isLoading, setIsLoading] = useState(false);
  const [kpi, setKpi] = useState<KpiData>({
    ventasNeto: 0, ventasTotal: 0, debitoFiscal: 0,
    comprasNeto: 0, comprasTotal: 0, creditoFiscal: 0,
    cobrosTotal: 0, pagosTotal: 0,
  });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [ivaBreakdown, setIvaBreakdown] = useState<any[]>([]);

  const ejercicio = anio;
  const periodo = `${anio}${mes}`;

  // ──── Fetch principal (Concurrente y Cacheado) ────
  const fetchDashboardData = async (forceRefresh = false) => {
    if (!jwtc) return;
    setIsLoading(true);

    try {
      const currentMonthNum = parseInt(mes, 10);
      const currentYearNum = parseInt(anio, 10);

      const monthPromises: Promise<any>[] = [];
      const labels: { m: string; a: string; label: string }[] = [];

      for (let i = 5; i >= 0; i--) {
        let m = currentMonthNum - i;
        let a = currentYearNum;
        if (m <= 0) { m += 12; a -= 1; }
        const ms = m.toString().padStart(2, '0');
        const as = a.toString();
        labels.push({ m: ms, a: as, label: `${MESES[m - 1]?.substring(0, 3)}` });
        monthPromises.push(
          Promise.allSettled([
            sosApi.getIvaVentas(jwtc, as, as, ms, forceRefresh),
            sosApi.getIvaCompras(jwtc, as, as, ms, forceRefresh),
          ])
        );
      }

      // Llamadas 100% paralelas: Los 6 meses + Pagos + Cobros del mes actual
      // (Bajo el capó, la caché evita peticiones redundantes si se superponen meses)
      const [allMonthsData, rCobrosSettled, rPagosSettled] = await Promise.all([
        Promise.all(monthPromises),
        sosApi.getCobros(jwtc, periodo, forceRefresh).catch(() => null),
        sosApi.getPagos(jwtc, periodo, forceRefresh).catch(() => null),
      ]);

      const currentMonthData = allMonthsData[5];
      const [rVentas, rCompras] = currentMonthData.map((r: any) =>
        r.status === 'fulfilled' ? r.value : null
      );
      
      const rCobros = rCobrosSettled;
      const rPagos = rPagosSettled;

      console.log('[Dashboard] Respuestas API:', { rVentas, rCompras, rCobros, rPagos });

      // ── Mapeo de datos 6 Meses -> TrendData (Memoización manual de una pasada) ──
      const trend = allMonthsData.map((results: any, idx: number) => {
        const [hV, hC] = results.map((r: any) => r.status === 'fulfilled' ? r.value : null);
        const vRoot = extractRootTotals(hV);
        const cRoot = extractRootTotals(hC);
        const vItems = extractItems(hV);
        const cItems = extractItems(hC);
        return {
          name: labels[idx].label,
          Ventas: vRoot.total || vRoot.montototal || vRoot.gravado || vRoot.neto
            || sumField(vItems, 'montototal', 'total') || sumField(vItems, 'neto', 'neto_gravado'),
          Compras: cRoot.total || cRoot.montototal || cRoot.gravado || cRoot.neto
            || sumField(cItems, 'montototal', 'total') || sumField(cItems, 'neto', 'neto_gravado'),
        };
      });
      setTrendData(trend);

      // ── IVA Ventas (Mes Actual) ──
      const ventasRootTotals = extractRootTotals(rVentas);
      const ventasItems = extractItems(rVentas);
      const ventasNeto = ventasRootTotals.gravado || ventasRootTotals.neto || ventasRootTotals.neto_gravado
        || sumField(ventasItems, 'neto', 'neto_gravado');
      const debitoFiscal = ventasRootTotals.iva_total || ventasRootTotals.iva
        || sumField(ventasItems, 'iva_total', 'iva', 'importe_iva');
      const ventasTotal = ventasRootTotals.total || ventasRootTotals.montototal
        || sumField(ventasItems, 'montototal', 'total', 'importe_total')
        || (ventasNeto + debitoFiscal);

      // ── IVA Compras (Mes Actual) ──
      const comprasRootTotals = extractRootTotals(rCompras);
      const comprasItems = extractItems(rCompras);
      const comprasNeto = comprasRootTotals.gravado || comprasRootTotals.neto || comprasRootTotals.neto_gravado
        || sumField(comprasItems, 'neto', 'neto_gravado');
      const creditoFiscal = comprasRootTotals.iva_total || comprasRootTotals.iva
        || sumField(comprasItems, 'iva_total', 'iva', 'importe_iva');
      const comprasTotal = comprasRootTotals.total || comprasRootTotals.montototal
        || sumField(comprasItems, 'montototal', 'total', 'importe_total')
        || (comprasNeto + creditoFiscal);

      // ── Cobros (Mes Actual) ──
      const cobrosRootTotals = extractRootTotals(rCobros);
      const cobrosItems = extractItems(rCobros);
      const cobrosTotal = cobrosRootTotals.total || cobrosRootTotals.montototal
        || sumField(cobrosItems, 'montototal', 'total', 'monto', 'importe');

      // ── Pagos (Mes Actual) ──
      const pagosRootTotals = extractRootTotals(rPagos);
      const pagosItems = extractItems(rPagos);
      const pagosTotal = pagosRootTotals.total || pagosRootTotals.montototal
        || sumField(pagosItems, 'montototal', 'total', 'monto', 'importe');

      setKpi({ ventasNeto, ventasTotal, debitoFiscal, comprasNeto, comprasTotal, creditoFiscal, cobrosTotal, pagosTotal });

      // ── Desglose IVA ──
      const iva21 = ventasRootTotals.iva_al_21 || ventasRootTotals.DF_iva_al_21 || sumField(ventasItems, 'iva_al_21');
      const iva105 = ventasRootTotals.iva_al_10_5 || sumField(ventasItems, 'iva_al_10_5');
      const iva27 = ventasRootTotals.iva_al_27 || sumField(ventasItems, 'iva_al_27');
      const ivaOtros = debitoFiscal - iva21 - iva105 - iva27;
      setIvaBreakdown([
        { name: 'IVA 21%', value: iva21 },
        { name: 'IVA 10.5%', value: iva105 },
        { name: 'IVA 27%', value: iva27 },
        { name: 'Otros', value: Math.max(0, ivaOtros) },
      ].filter(d => d.value > 0));

    } catch (err) {
      console.error('[Dashboard] Error cargando datos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwtc, anio, mes]);

  // ──── Métricas derivadas ────
  const posicionIVA = kpi.debitoFiscal - kpi.creditoFiscal;
  const margenOperativo = kpi.ventasNeto > 0
    ? ((kpi.ventasNeto - kpi.comprasNeto) / kpi.ventasNeto * 100)
    : 0;
  const tasaCobranza = kpi.ventasTotal > 0
    ? (kpi.cobrosTotal / kpi.ventasTotal * 100)
    : 0;

  // ──── Pie data ────
  const pieData = useMemo(() => [
    { name: 'Cobrado', value: kpi.cobrosTotal },
    { name: 'Pendiente', value: Math.max(0, kpi.ventasTotal - kpi.cobrosTotal) },
  ].filter(d => d.value > 0), [kpi]);

  // ──── Alertas inteligentes ────
  const alerts = useMemo<AlertItem[]>(() => {
    const list: AlertItem[] = [];

    if (posicionIVA > 0 && kpi.ventasNeto > 0 && (posicionIVA / kpi.ventasNeto) > 0.20) {
      list.push({
        type: 'danger', title: 'Posición IVA elevada',
        description: `El IVA a pagar (${formatCurrency(posicionIVA)}) supera el 20% del neto gravado. Considerar anticipar compras para equilibrar el crédito fiscal.`,
        icon: <AlertTriangle className="w-4 h-4" />,
      });
    }

    if (kpi.ventasTotal > 0 && tasaCobranza < 40) {
      list.push({
        type: 'warning', title: 'Cobranza baja',
        description: `Solo se cobró el ${tasaCobranza.toFixed(0)}% de lo facturado. Revisar cuenta corriente de clientes para depurar morosos.`,
        icon: <Wallet className="w-4 h-4" />,
      });
    }

    if (kpi.ventasTotal > 0 && kpi.cobrosTotal === 0) {
      list.push({
        type: 'warning', title: 'Sin cobros registrados',
        description: 'Existen ventas en el período pero no se registraron cobros. ¿Falta registrar ingresos en caja?',
        icon: <DollarSign className="w-4 h-4" />,
      });
    }

    if (kpi.ventasNeto > 0 && margenOperativo < 15) {
      list.push({
        type: 'danger', title: 'Margen operativo bajo',
        description: `El margen bruto es del ${margenOperativo.toFixed(1)}%. Las compras representan una proporción alta respecto a las ventas.`,
        icon: <TrendingDown className="w-4 h-4" />,
      });
    }

    if (kpi.comprasTotal > 0 && kpi.pagosTotal === 0) {
      list.push({
        type: 'warning', title: 'Pagos pendientes',
        description: 'Hay compras registradas sin pagos asociados. Verificar vencimientos de crédito con proveedores.',
        icon: <ShoppingCart className="w-4 h-4" />,
      });
    }

    if (list.length === 0) {
      list.push({
        type: 'success', title: 'Todo bajo control',
        description: 'Los indicadores del período se encuentran dentro de los rangos normales. No se detectaron desvíos relevantes.',
        icon: <CheckCircle className="w-4 h-4" />,
      });
    }

    return list;
  }, [kpi, posicionIVA, margenOperativo, tasaCobranza]);

  // ──── Custom Tooltip ────
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-border-main rounded-[8px] shadow-lg p-3 text-[12px]">
        <div className="font-bold text-text-main mb-1">{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-text-muted">{p.name}:</span>
            <span className="font-bold">{formatCompactCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-bg-app overflow-y-auto">
      {/* ── Header ── */}
      <div className="p-4 md:p-6 bg-white border-b border-border-main flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-text-main flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary-main" />
              Panel de Control
            </h1>
            <p className="text-[13px] text-text-muted mt-1">
              Indicadores financieros del ejercicio {anio} — {MESES[parseInt(mes, 10) - 1]}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <select
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                className="rounded-[6px] border border-border-main bg-white px-3 py-2 text-[13px] outline-none focus:border-primary-main appearance-none pr-8 cursor-pointer"
              >
                {[0, 1, 2, 3, 4].map(i => {
                  const y = (now.getFullYear() - i).toString();
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
              <select
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="rounded-[6px] border border-border-main bg-white px-3 py-2 text-[13px] outline-none focus:border-primary-main appearance-none pr-8 cursor-pointer"
              >
                {MESES.map((m, i) => (
                  <option key={i} value={(i + 1).toString().padStart(2, '0')}>{m}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isLoading}
              className="p-2 rounded-[6px] border border-border-main text-primary-main hover:bg-primary-main hover:text-white transition-colors disabled:opacity-50"
              title="Forzar actualización (Limpiar Caché)"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="p-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Ventas Netas" value={kpi.ventasNeto}
            icon={<DollarSign className="w-4 h-4 text-blue-600" />}
            colorClass="bg-blue-50" isLoading={isLoading}
          />
          <KpiCard
            label="Compras Netas" value={kpi.comprasNeto}
            icon={<ShoppingCart className="w-4 h-4 text-amber-600" />}
            colorClass="bg-amber-50" isLoading={isLoading}
          />
          <KpiCard
            label="Posición IVA" value={posicionIVA}
            icon={posicionIVA > 0
              ? <TrendingDown className="w-4 h-4 text-red-600" />
              : <TrendingUp className="w-4 h-4 text-green-600" />}
            colorClass={posicionIVA > 0 ? 'bg-red-50' : 'bg-green-50'}
            isLoading={isLoading}
          />
          <KpiCard
            label="Cobros del Mes" value={kpi.cobrosTotal}
            icon={<Wallet className="w-4 h-4 text-green-600" />}
            colorClass="bg-green-50" isLoading={isLoading}
          />
          <KpiCard
            label="Pagos del Mes" value={kpi.pagosTotal}
            icon={<Users className="w-4 h-4 text-purple-600" />}
            colorClass="bg-purple-50" isLoading={isLoading}
          />
        </div>
      </div>

      {/* ── Métricas secundarias ── */}
      <div className="px-4 md:px-6 pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-[10px] border border-border-main p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-[11px] text-text-muted font-bold uppercase">Margen Bruto</div>
              <div className={`text-[18px] font-bold ${margenOperativo < 15 ? 'text-red-600' : margenOperativo < 30 ? 'text-amber-600' : 'text-green-600'}`}>
                {isLoading ? '—' : `${margenOperativo.toFixed(1)}%`}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[10px] border border-border-main p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-[11px] text-text-muted font-bold uppercase">Tasa Cobranza</div>
              <div className={`text-[18px] font-bold ${tasaCobranza < 40 ? 'text-red-600' : tasaCobranza < 70 ? 'text-amber-600' : 'text-green-600'}`}>
                {isLoading ? '—' : `${tasaCobranza.toFixed(0)}%`}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[10px] border border-border-main p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-[11px] text-text-muted font-bold uppercase">Débito Fiscal</div>
              <div className="text-[18px] font-bold text-text-main">
                {isLoading ? '—' : formatCompactCurrency(kpi.debitoFiscal)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gráficos ── */}
      <div className="px-4 md:px-6 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Tendencia Ventas vs Compras (6 meses) */}
          <div className="lg:col-span-2 bg-white rounded-[12px] border border-border-main shadow-sm p-5">
            <h3 className="text-[13px] font-bold text-text-main mb-4">Ventas vs. Compras — Últimos 6 meses</h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.ventas} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={CHART_COLORS.ventas} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCompras" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.compras} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={CHART_COLORS.compras} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={formatCompactCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Area type="monotone" dataKey="Ventas" stroke={CHART_COLORS.ventas} fill="url(#gradVentas)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="Compras" stroke={CHART_COLORS.compras} fill="url(#gradCompras)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-text-muted text-[13px]">
                {isLoading ? 'Cargando tendencias...' : 'Sin datos suficientes para el gráfico'}
              </div>
            )}
          </div>

          {/* Composición IVA */}
          <div className="bg-white rounded-[12px] border border-border-main shadow-sm p-5">
            <h3 className="text-[13px] font-bold text-text-main mb-4">Composición IVA Ventas</h3>
            {ivaBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ivaBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={formatCompactCurrency} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} width={70} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
                    {ivaBreakdown.map((_, i) => (
                      <Cell key={i} fill={[CHART_COLORS.iva21, CHART_COLORS.iva105, CHART_COLORS.iva27, CHART_COLORS.ivaOtros][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-text-muted text-[13px]">
                {isLoading ? 'Cargando...' : 'Sin desglose de IVA'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Cobranza + Alertas ── */}
      <div className="px-4 md:px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Dona de cobranza */}
          <div className="bg-white rounded-[12px] border border-border-main shadow-sm p-5">
            <h3 className="text-[13px] font-bold text-text-main mb-4">Facturado vs. Cobrado</h3>
            {pieData.length > 0 && kpi.ventasTotal > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    paddingAngle={3} dataKey="value" strokeWidth={2} stroke="#fff"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-text-muted text-[13px]">
                {isLoading ? 'Cargando...' : 'Sin datos de cobranza'}
              </div>
            )}
          </div>

          {/* Alertas */}
          <div className="lg:col-span-2 bg-white rounded-[12px] border border-border-main shadow-sm p-5">
            <h3 className="text-[13px] font-bold text-text-main mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Alertas y Recomendaciones
            </h3>
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <AlertCard key={i} alert={alert} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
