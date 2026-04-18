import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sosApi } from '../api/sos';
import { Search, ChevronLeft, ChevronRight, User } from 'lucide-react';

export const ClientesList: React.FC = () => {
  const { jwtc } = useAuth();
  const [clientes, setClientes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const registrosPorPagina = 50;

  useEffect(() => {
    fetchClientes();
  }, [page]); 
  
  // Separamos la busqueda del effect para optimizar llamadas
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // al buscar, reseteamos a pagina 1
    fetchClientes(1);
  };

  const fetchClientes = async (pageToFetch = page) => {
    setIsLoading(true);
    setError('');
    try {
      const resp = await sosApi.getClientes(jwtc!, {
        pagina: pageToFetch,
        registros: registrosPorPagina,
        txbuscar: searchTerm
      });
      // Puede devolver array directo o { data: [], total: ... }
      setClientes(Array.isArray(resp) ? resp : resp.data || []);
    } catch (err: any) {
      setError(err?.message || 'Error al obtener clientes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-bg-app">
      {/* Header Sleek */}
      <div className="h-[60px] bg-white border-b border-border-main flex justify-between items-center px-6 flex-shrink-0">
        <h1 className="text-[18px] text-text-main font-bold">Cartera de Clientes</h1>
        <div className="flex items-center gap-3">
          <span className="px-2 py-[2px] rounded-[10px] text-[10px] font-bold bg-accent-main text-primary-main">JWT Conectado</span>
          <div className="w-8 h-8 bg-[#ddd] rounded-full"></div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 overflow-hidden flex flex-col gap-5">
        
        {/* Table Container */}
        <div className="bg-white rounded-[12px] border border-border-main flex-1 overflow-hidden flex flex-col">
          {/* Table Header Filter */}
          <div className="p-4 border-b border-border-main flex flex-wrap justify-between items-center gap-4">
            <form onSubmit={handleSearch} className="flex gap-[10px]">
              <input
                type="text"
                placeholder="Buscar cliente..."
                className="px-3 py-1.5 rounded-[6px] border border-border-main bg-white text-[13px] outline-none focus:border-primary-main"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit"
                className="px-3 py-1.5 rounded-[6px] border border-border-main bg-white cursor-pointer text-[13px] hover:bg-bg-app"
              >
                Buscar
              </button>
            </form>
            <div className="text-[12px] text-text-muted">
              Página {page}
            </div>
          </div>

          {error ? (
            <div className="p-4 text-[13px] text-red-700 m-4 bg-red-50 rounded-[6px]">
              {error}
            </div>
          ) : isLoading ? (
            <div className="flex justify-center flex-1 items-center">
              <span className="text-text-muted text-[13px]">Cargando clientes...</span>
            </div>
          ) : clientes.length === 0 ? (
            <div className="flex justify-center flex-1 items-center p-12 text-center">
              <span className="text-text-muted text-[13px]">No se encontraron resultados.</span>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr>
                      <th className="bg-gray-50 text-text-muted text-[11px] uppercase px-5 py-3 text-left border-b border-border-main w-[70%]">
                        Razón Social / Nombre
                      </th>
                      <th className="bg-gray-50 text-text-muted text-[11px] uppercase px-5 py-3 text-left border-b border-border-main w-[30%]">
                        CUIT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((cliente, idx) => (
                      <tr key={cliente.idcliente || cliente.id || idx}>
                        <td className="px-5 py-3 border-b border-border-main text-[13px] whitespace-nowrap overflow-hidden text-ellipsis text-text-main font-bold">
                          {cliente.razon_social || cliente.nombre || '-'}
                        </td>
                        <td className="px-5 py-3 border-b border-border-main text-[12px] font-mono text-text-main">
                          {cliente.cuit || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="px-5 py-3 border-t border-border-main text-right">
                <div className="flex gap-[10px] justify-end">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`px-3 py-1.5 rounded-[6px] border border-border-main text-[13px] ${page === 1 ? 'opacity-50 cursor-not-allowed bg-white text-text-main' : 'bg-white cursor-pointer hover:bg-bg-app text-text-main'}`}
                  >
                    &laquo; Ant.
                  </button>
                  <button className="px-3 py-1.5 rounded-[6px] border border-primary-main bg-accent-main text-text-main text-[13px]">
                    {page}
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={clientes.length < registrosPorPagina}
                    className={`px-3 py-1.5 rounded-[6px] border border-border-main text-[13px] ${clientes.length < registrosPorPagina ? 'opacity-50 cursor-not-allowed bg-white text-text-main' : 'bg-white cursor-pointer hover:bg-bg-app text-text-main'}`}
                  >
                    Sig. &raquo;
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
