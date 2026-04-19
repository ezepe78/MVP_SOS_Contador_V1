# Roadmap y Plan de Evolución

## Estado actual del desarrollo
**FASE 1: MVP Completado** ✅
- Integración real con flujo completo de autenticación de SOS Contador (DOBLE JWT).
- Interfaz gráfica base (Login, Selector de CUIT, Sidebar).
- Módulo de consulta de clientes (Paginación y Buscador).
- Módulo de Libro IVA Ventas (Filtros por período).

**FASE 2: Optimizaciones y Estabilidad** ✅
- Intercepción global de errores (Log-out automático 4xx).
- Sistema de **Caché persistente (TTL 3m)** para optimización de API calls.
- Proxy Server local para desarrollo y Rewrites en Vercel.
- Soporte para TypeScript estricto.

**FASE 3: Inteligencia Contable (En Progreso)** 🚀
- [x] Dashboard Home con gráficos de evolución (Ventas vs Compras) usando Recharts.
- [x] Módulo de Libro IVA Compras.
- [x] Módulo de Libro Mayor con búsqueda granular.
- [x] Módulo de Sumas y Saldos.
- [ ] Exportación a PDF/Excel de reportes.

## Fases futuras organizadas de manera lógica

### FASE 4: Experiencia Integral y Pulido
- PWA (Progressive Web App) para instalación en dispositivos móviles.
- Modo Oscuro nativo basado en preferencias de sistema.
- Animaciones refinadas con Motion para transiciones entre módulos.
- Implementación de Tests unitarios y de integración para el wrapper de API.

### FASE 5: BI y Analítica Avanzada
- Alertas de discrepancias entre libros IVA y contabilidad.
- Generador de reportes comparativos interanuales.
- Integración con notificaciones de AFIP (Ventanilla Electrónica).
- Dashboard multi-cuit (comparativa entre empresas del mismo estudio).

