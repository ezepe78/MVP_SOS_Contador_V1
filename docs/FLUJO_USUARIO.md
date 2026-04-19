# Flujo de Usuario

## 1. Convenciones de flujo
El flujo es jerárquico-funcional: Login -> Selector -> Home Dashboard -> [Módulos Específicos].

## 2. Actores
Contador, Analista Contable, Socio del Estudio.

## 3. Navegación global
La navegación opera sobre un "Shell" con Sidebar dinámico:
- **Home**: Dashboard Gerencial gráfico.
- **Ventas**: Libro IVA Ventas.
- **Compras**: Libro IVA Compras.
- **Clientes**: Maestro de Clientes/Proveedores.
- **Contabilidad**: Acceso a Mayor y Sumas y Saldos.

## 4. Pantallas y Rutas
- `/login`: Autenticación Master.
- `/selector`: Listado de CUITs disponibles.
- `/dashboard`: Vista de bienvenida con gráficos de evolución.
- `/dashboard/ventas`: Reporte de facturación emitida.
- `/dashboard/compras`: Reporte de facturación recibida.
- `/dashboard/clientes`: Grilla de entidades.
- `/dashboard/mayor`: Filtros y tabla de libro mayor.
- `/dashboard/balances`: Sumas y Saldos.

## 5. Flujos de usuario principales
**Autenticación y Selección**
1. App carga -> Verifica `localStorage`. Si hay `jwt` y `selectedCuit`, intenta reconexión directa al Dashboard.
2. Si falla o no existe, muestra Login.
3. Tras Login, redirige al Selector.
4. Tras Selección, genera `jwtc` y activa el Dashboard.

**Consulta Contable (Libro Mayor)**
1. El usuario selecciona "Libro Mayor" en el menú.
2. Selecciona una cuenta del Plan de Cuentas (Buscador integrado).
3. Define rango de fechas.
4. La App solicita datos, los indexa en caché y muestra la grilla con saldos parciales.

## 6. Persistencia y Estado
- El CUIT seleccionado persiste entre recargas.
- Se puede cambiar de CUIT en cualquier momento desde el botón de perfil/sidebar, lo que limpia el `jwtc` y reabre el Selector.

## 7. Manejo de Errores (Flow)
- Error de Red: Notificación superior "Sin conexión".
- Error 401/403: Redirección forzada a Login con limpieza de storage.
- Datos Vacíos: Ilustración de estado vacío con sugerencia de cambio de filtros.

## 8. Estados de la interfaz
- **Skeleton Loads**: Para tablas y gráficos durante el fetch asíncrono.
- **Interactive Feedback**: Botones con estado "Procesando...".
- **Glassmorphism**: Estética moderna en tarjetas y modales.

