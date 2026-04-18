# Roadmap y Plan de Evolución

## Estado actual del desarrollo
**FASE 1: MVP Completado**
- Integración real con flujo completo de autenticación de SOS Contador (DOBLE JWT).
- Interfaz gráfica básica (Login, Selector de CUIT, Sidebar de navegación).
- Módulo de consulta de clientes (Paginación y Buscador).
- Módulo de Libro IVA Ventas (Filtros por período).

## Fases futuras organizadas de manera lógica

### FASE 2: Optimizaciones y Manejo de Errores
- Intercepción global de errores (Automático log-out en 401).
- PWA (Progressive Web App) para uso como aplicación nativa en celulares.
- Persistencia mejorada y manejo de expiración de JWT.

### FASE 3: Nuevos Módulos
- Módulo de Compras (Libro IVA Compras - Crédito Fiscal).
- Resumen/Dashboard Home con gráficos de evolución (usando Recharts).
- Exportación en CSV o Excel de los listados consultados.

### FASE 4: Experiencia Integral
- Modo Oscuro automático según el sistema operativo.
- Personalización del panel según preferencias del contador.
- Configuración de alertas de vencimientos impositivos de AFIP.
