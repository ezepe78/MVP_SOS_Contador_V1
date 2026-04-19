# Arquitectura Técnica

## Enfoque arquitectónico
Se utiliza una arquitectura de **Single Page Application (SPA)** con un **Backend-for-Frontend (BFF) ligero** en desarrollo y **Edge Rewrites** en producción. 

- **Desarrollo**: Un servidor Express (`server.ts`) actúa como proxy inverso para redirigir las peticiones `/api/*` a la API real de SOS Contador, resolviendo problemas de CORS y centralizando logs de tráfico.
- **Producción (Vercel)**: Se emplean reglas nativas de `vercel.json` para realizar el forwarding de peticiones sin latencia de servidor intermedio.

## Sistema de Caché (Performance Vibe)
Dada la naturaleza de reporte de la aplicación, se implementó `ApiCache` en `sos.ts`:
- **TTL**: 3 minutos por default.
- **Inmutabilidad**: Los datos se clonan al entrar y salir del caché para evitar efectos colaterales en la UI.
- **Aislamiento**: Las claves de caché incluyen el JWT para evitar colisiones entre sesiones.

## Modelo de datos
Los datos son efímeros y provienen de los endpoints consumidos, organizados en:
- **Sesión**: `jwt` (Global) y `jwtc` (CUIT específico).
- **Entidades Contables**: `Planes de Cuentas`, `Libros Mayor`, `Sumas y Saldos`.
- **Entidades Impositivas**: `Comprobantes de Venta`, `Comprobantes de Compra`, `Reportes IVA`.
- **Contribuyentes**: `CUITs` y su metadata de conexión.

## Gestión de estado global
Se emplea **React Context API** (`AuthContext`) para:
- Tokens de sesión.
- Información del CUIT Activo (`selectedCuit`).
- Estado de autenticación global.

Para listados específicos y estados de carga locales, se utilizan Hooks de React (`useState`, `useEffect`) integrando el patrón de **Early Return** para manejo de errores.

## Decisiones de UX/UI
- **Atomic Design**: Componentes aislados y reutilizables para tablas, tarjetas y selectores.
- **Resiliencia Visual**: Todos los componentes manejan estados de *Loading*, *Empty* y *Error*.
- **Visualización de Datos**: Integración de `Recharts` para convertir payloads JSON en gráficos dinámicos (Dashboard Home).

## Almacenamiento Local
Se preserva en `localStorage`:
- `jwt`: Token maestro del usuario.
- `jwtc`: Último token de CUIT activo.
- `selectedCuit`: Detalle de la empresa seleccionada.
- `lastUsedCuitId`: Para reconexión rápida.

