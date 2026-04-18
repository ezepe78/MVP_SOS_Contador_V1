// Heartbeat para verificar carga de versión (v2.2 - Caché Inteligente)
console.log("[SOS-API] Cargando v2.2 de sos.ts - Protección contra TypeError y Caché API activada");

// ────────────────────────────────────────────
// Sistema de Caché Local (TTL 3 minutos)
// ────────────────────────────────────────────
class ApiCache {
  private cache = new Map<string, { data: any, timestamp: number }>();
  private readonly TTL = 3 * 60 * 1000; // 3 minutos

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    // Devolvemos un clon profundo para aislar mutaciones de la UI (Cumpliendo inmutabilidad)
    return JSON.parse(JSON.stringify(item.data));
  }

  set(key: string, data: any) {
    this.cache.set(key, { data: JSON.parse(JSON.stringify(data)), timestamp: Date.now() });
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();

export const API_BASE_URL = '/api';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse(res: Response) {
  if (res.status === 401 || res.status === 403) {
    throw new AuthError('Sesión expirada o credenciales inválidas.');
  }
  
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new ApiError('Error al parsear la respuesta del servidor.');
  }

  if (!res.ok || data.error) {
    if (res.status === 401 || res.status === 403 || data.error === 'Token invalido') {
      throw new AuthError(data.mensaje || data.error || 'Sesión expirada o credenciales inválidas.');
    }
    throw new ApiError(data.mensaje || data.message || data.error || 'Error en la solicitud a la API.');
  }

  return data;
}

// Wrapper nativo para atrapar y servir GET de forma concurrente
async function cachedFetch(url: string, jwt: string, forceRefresh: boolean = false) {
  const cacheKey = `${jwt}-${url}`;
  
  if (!forceRefresh) {
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      console.log(`[SOS-API] Caché HIT: ${url}`);
      return cachedData;
    }
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
  });

  const data = await handleResponse(res);
  apiCache.set(cacheKey, data);
  return data;
}

export const sosApi = {
  login: async (usuario: string, clave: string) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuario, password: clave }),
    });
    return handleResponse(res);
  },

  getCuitListado: async (jwt: string, forceRefresh = false) => {
    return cachedFetch(`${API_BASE_URL}/cuit/listado`, jwt, forceRefresh);
  },

  getCuitCredentials: async (jwt: string, idCuit: string, forceRefresh = false) => {
    return cachedFetch(`${API_BASE_URL}/cuit/credentials/${idCuit}`, jwt, forceRefresh);
  },

  getClientes: async (jwtc: string, options: { pagina: number; registros: number; txbuscar?: string }, forceRefresh = false) => {
    const query = new URLSearchParams({
      cliente: 'true',
      proveedor: 'true',
      pagina: options.pagina.toString(),
      registros: options.registros.toString(),
    });
    
    if (options.txbuscar) {
      query.append('txbuscar', options.txbuscar);
    }

    return cachedFetch(`${API_BASE_URL}/cliente/listado?${query.toString()}`, jwtc, forceRefresh);
  },

  getIvaVentas: async (jwtc: string, ejercicio: string, anio: string, mes: string, forceRefresh = false) => {
    if (!ejercicio || !anio || !mes) {
      throw new ApiError('Faltan parámetros obligatorios (Ejercicio, Año o Mes) para la consulta de IVA.');
    }
    const query = new URLSearchParams({ anio, mes });
    return cachedFetch(`${API_BASE_URL}/libroivaventa/listado/${ejercicio}?${query.toString()}`, jwtc, forceRefresh);
  },

  getPlanDeCuentas: async (jwtc: string, forceRefresh = false) => {
    return cachedFetch(`${API_BASE_URL}/cuentacontable/listado`, jwtc, forceRefresh);
  },

  getLibroMayor: async (
    jwtc: string, 
    ejercicio: string, 
    incomingParams: any
  ) => {
    try {
      console.log("[API] getLibroMayor trace:", { jwtc: !!jwtc, ej: ejercicio, hasParams: !!incomingParams });
      
      // Sanitización radical de parámetros
      const p = incomingParams || {};
      
      const fDesde = String(p.filtroFechaDesde || p.fechadesde || '');
      const fHasta = String(p.filtroFechaHasta || p.fechahasta || '');
      const pPagina = String(p.pagina || 1);
      const pRegistros = String(p.registros || 50);
      const pArbol = (p.arbol || '').toString().trim();

      const query = new URLSearchParams({
        fechadesde: fDesde,
        fechahasta: fHasta,
        pagina: pPagina,
        registros: pRegistros,
      });
      
      if (pArbol) {
        query.append('arbol', pArbol);
      }

      if (!ejercicio) {
         throw new ApiError('El parámetro "ejercicio" es obligatorio.');
      }

      const res = await cachedFetch(`${API_BASE_URL}/mayor/listado/${ejercicio}?${query.toString()}`, jwtc, incomingParams?.forceRefresh || false);
      return res;
    } catch (err: any) {
      console.error("[API] Error fatal en getLibroMayor:", err);
      // Re-lanzar con contexto si no es ya un Error conocido
      if (err instanceof AuthError || err instanceof ApiError) throw err;
      throw new ApiError(`Error en ejecución de getLibroMayor: ${err.message}`);
    }
  },

  // ────────────────────────────────────────────
  // Métodos para Dashboard Gerencial
  // ────────────────────────────────────────────

  getIvaCompras: async (jwtc: string, ejercicio: string, anio: string, mes: string, forceRefresh = false) => {
    if (!ejercicio || !anio || !mes) {
      throw new ApiError('Faltan parámetros obligatorios para IVA Compras.');
    }
    const query = new URLSearchParams({ anio, mes });
    return cachedFetch(`${API_BASE_URL}/libroivacompra/listado/${ejercicio}?${query.toString()}`, jwtc, forceRefresh);
  },

  getVentas: async (jwtc: string, periodo: string, forceRefresh = false) => {
    if (!periodo) throw new ApiError('El período es obligatorio para consultar ventas.');
    const query = new URLSearchParams({ pagina: '1', registros: '500' });
    return cachedFetch(`${API_BASE_URL}/venta/listado/T/${periodo}/T?${query.toString()}`, jwtc, forceRefresh);
  },

  getCobros: async (jwtc: string, periodo: string, forceRefresh = false) => {
    if (!periodo) throw new ApiError('El período es obligatorio para consultar cobros.');
    const query = new URLSearchParams({ pagina: '1', registros: '500' });
    return cachedFetch(`${API_BASE_URL}/cobro/listado/${periodo}?${query.toString()}`, jwtc, forceRefresh);
  },

  getPagos: async (jwtc: string, periodo: string, forceRefresh = false) => {
    if (!periodo) throw new ApiError('El período es obligatorio para consultar pagos.');
    const query = new URLSearchParams({ pagina: '1', registros: '500' });
    return cachedFetch(`${API_BASE_URL}/pago/listado/${periodo}?${query.toString()}`, jwtc, forceRefresh);
  },

  getSumasYSaldos: async (jwtc: string, ejercicio: string, fechaDesde: string, fechaHasta: string, forceRefresh = false) => {
    if (!ejercicio) throw new ApiError('El ejercicio es obligatorio para Sumas y Saldos.');
    const query = new URLSearchParams({ fechadesde: fechaDesde, fechahasta: fechaHasta });
    return cachedFetch(`${API_BASE_URL}/sumasysaldos/listado/${ejercicio}?${query.toString()}`, jwtc, forceRefresh);
  },

  getIvaReporte: async (jwtc: string, ejercicio: string, anio: string, mes: string, forceRefresh = false) => {
    if (!ejercicio || !anio || !mes) {
      throw new ApiError('Faltan parámetros obligatorios para el reporte IVA F.2002.');
    }
    const query = new URLSearchParams({ anio, mes });
    return cachedFetch(`${API_BASE_URL}/iva/listado/${ejercicio}?${query.toString()}`, jwtc, forceRefresh);
  }
};

