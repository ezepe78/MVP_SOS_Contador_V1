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

export const sosApi = {
  login: async (usuario: string, clave: string) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuario, password: clave }),
    });
    return handleResponse(res);
  },

  getCuitListado: async (jwt: string) => {
    const res = await fetch(`${API_BASE_URL}/cuit/listado`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
    });
    return handleResponse(res);
  },

  getCuitCredentials: async (jwt: string, idCuit: string) => {
    const res = await fetch(`${API_BASE_URL}/cuit/credentials/${idCuit}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
    });
    return handleResponse(res);
  },

  getClientes: async (jwtc: string, params: { pagina: number; registros: number; txbuscar?: string }) => {
    const query = new URLSearchParams({
      cliente: 'true',
      proveedor: 'true',
      pagina: params.pagina.toString(),
      registros: params.registros.toString(),
    });
    
    if (params.txbuscar) {
      query.append('txbuscar', params.txbuscar);
    }

    const res = await fetch(`${API_BASE_URL}/cliente/listado?${query.toString()}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtc}`
      },
    });
    return handleResponse(res);
  },

  getIvaVentas: async (jwtc: string, ejercicio: string, anio: string, mes: string) => {
    const query = new URLSearchParams({
      anio,
      mes
    });

    const res = await fetch(`${API_BASE_URL}/libroivaventa/listado/${ejercicio}?${query.toString()}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtc}`
      },
    });
    return handleResponse(res);
  },

  getPlanDeCuentas: async (jwtc: string) => {
    const res = await fetch(`${API_BASE_URL}/cuentacontable/listado`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtc}`
      },
    });
    return handleResponse(res);
  },

  getLibroMayor: async (
    jwtc: string, 
    ejercicio: string, 
    params: { fechadesde: string; fechahasta: string; pagina: number; registros: number; arbol?: string }
  ) => {
    const query = new URLSearchParams({
      fechadesde: params.fechadesde,
      fechahasta: params.fechahasta,
      pagina: params.pagina.toString(),
      registros: params.registros.toString(),
    });
    
    if (params.arbol && params.arbol.trim() !== '') {
      query.append('arbol', params.arbol);
    }

    const res = await fetch(`${API_BASE_URL}/mayor/listado/${ejercicio}?${query.toString()}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtc}`
      },
    });
    return handleResponse(res);
  }
};
