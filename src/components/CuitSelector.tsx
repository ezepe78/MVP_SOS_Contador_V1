import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sosApi } from '../api/sos';
import { Building2, Search, LogOut } from 'lucide-react';

export const CuitSelector: React.FC = () => {
  const { jwt, cachedCuits, setJwtc, setSelectedCuit, logout } = useAuth();
  const [cuits, setCuits] = useState<any[]>(cachedCuits || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCuits();
  }, []);

  const fetchCuits = async () => {
    setIsLoading(true);
    setError('');
    try {
      const resp = await sosApi.getCuitListado(jwt!);
      // Dependiendo de cómo devuelva la API
      let lista = cachedCuits || [];
      if (Array.isArray(resp) && resp.length > 0) {
        lista = resp;
      } else if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
        lista = resp.data;
      } else if (resp.cuits && Array.isArray(resp.cuits) && resp.cuits.length > 0) {
        lista = resp.cuits;
      } else if (resp.rows && Array.isArray(resp.rows) && resp.rows.length > 0) {
        lista = resp.rows;
      } else if (resp.items && Array.isArray(resp.items) && resp.items.length > 0) {
        lista = resp.items;
      } else if (resp.resultados && Array.isArray(resp.resultados) && resp.resultados.length > 0) {
        lista = resp.resultados;
      } else if (typeof resp === 'object' && Object.keys(resp).length > 0 && !resp.error) {
        // En caso de que sea un formato desconocido, logueamos para debug
        console.warn('Estructura desconocida en /cuit/listado:', resp);
      }
      setCuits(lista);
    } catch (err: any) {
      if (cachedCuits && cachedCuits.length > 0) {
        // Si hay error pero tenemos los cuits del login, usamos el cache silenciosamente
        setCuits(cachedCuits);
      } else {
        setError(err?.message || 'Error al obtener la lista de CUITs');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (cuitObj: any) => {
    try {
      setError('');
      setIsLoading(true);
      // ID depende de cómo lo devuelva la API, id o idcuit
      const id = cuitObj.idcuit || cuitObj.id;
      const resp = await sosApi.getCuitCredentials(jwt!, id);
      
      const token = resp?.jwt || resp?.jwtc || resp?.token || resp?.access_token;
      if (token) {
        setJwtc(token);
        setSelectedCuit(cuitObj);
      } else {
        setError('No se pudo obtener el token para este CUIT.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al seleccionar CUIT');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCuits = cuits.filter(c => 
    (c.razonsocial || c.razon_social || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.cuit || '').includes(searchTerm)
  );

  return (
    <div className="flex h-screen w-full flex-col items-center bg-bg-app pt-[40px] px-4 font-sans">
      <div className="w-full max-w-2xl text-right mb-4">
        <button 
          onClick={logout}
          className="inline-flex items-center text-[13px] font-bold text-text-muted hover:text-text-main"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>

      <div className="w-full max-w-2xl rounded-[12px] bg-white border border-border-main overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div className="bg-white border-b border-border-main px-[24px] py-[30px] text-center">
          <Building2 className="mx-auto h-12 w-12 text-primary-main mb-3" />
          <h2 className="text-[20px] font-bold text-text-main">Seleccionar Empresa / CUIT</h2>
          <p className="mt-2 text-text-muted text-[13px]">
            Elegí con qué contribuyente vas a operar
          </p>
        </div>

        <div className="p-[20px] bg-bg-app">
          {error && (
            <div className="mb-[15px] rounded-[6px] bg-red-50 p-4 text-[13px] text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="relative mb-[15px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-text-muted" />
            </div>
            <input
              type="text"
              className="block w-full rounded-[6px] border border-border-main bg-white pl-[35px] pr-3 py-2 text-[13px] outline-none focus:border-primary-main placeholder-text-muted"
              placeholder="Buscar por Razón Social o CUIT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-96 overflow-y-auto bg-white rounded-[12px] border border-border-main p-[10px]">
            {isLoading ? (
              <div className="flex justify-center flex-1 items-center py-[40px]">
                <span className="text-text-muted text-[13px]">Cargando empresas...</span>
              </div>
            ) : filteredCuits.length === 0 ? (
              <div className="text-center py-[40px] text-[13px] text-text-muted">
                No se encontraron CUITs disponibles.
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filteredCuits.map((cuit, idx) => (
                  <button
                    key={cuit.idcuit || cuit.id || idx}
                    onClick={() => handleSelect(cuit)}
                    className="w-full text-left flex items-center justify-between px-3 py-2 hover:bg-bg-app rounded-[6px] transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-[14px] text-text-main">{cuit.razonsocial || cuit.razon_social || 'Sin Razón Social'}</p>
                      <p className="text-[12px] font-mono text-text-muted mt-[2px]">{cuit.cuit || 'N/A'}</p>
                    </div>
                    <div className="text-[13px] font-bold text-primary-main">
                      Seleccionar &rarr;
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
