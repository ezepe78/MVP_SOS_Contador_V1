# Arquitectura Técnica

## Enfoque arquitectónico
Se optó por una arquitectura **Client-Side Rendering (CSR)** pura, eliminando la necesidad de un backend propio (Backend-For-Frontend). Esto responde al requerimiento de un "MVP directo contra la API". Toda la comunicación se realiza vía peticiones HTTP estándar gestionadas desde el navegador usando `fetch`.

## Modelo de datos
Al no disponer de base de datos propia, los datos son efímeros y provienen estrictamente de los endpoints consumidos:
- Sesión / Credenciales: `jwt` y `jwtc`.
- Contribuyentes: `cuit`, `idcuit`, `razon_social`.
- Clientes: array de entidades.
- IVAVentas: array de comprobantes (`fecha`, `neto`, `iva`, `total`).

## Gestión de estado global
Se emplea **React Context API** (`AuthContext`) como gestor de estado para las sesiones y el CUIT activo, garantizando un flujo descendente claro de los tokens de autenticación `jwt` (master) y `jwtc` (cuit-specific token) requeridos por SOS Contador.
Para la gestión local a nivel de vista (listados y filtros) se utilizan Hooks tradicionales de React (`useState`, `useEffect`).

## Decisiones de UX/UI
- **Enfoque Mobile-First**: La barra lateral (Sidebar) es responsiva, ocultándose y apareciendo desde un menú tipo hamburguesa en pantallas pequeñas.
- Todo en pantalla debe estar en lenguaje español claro, orientado a contadores de Argentina (Términos: "Débito Fiscal", "CUIT", "Razón Social").
- Componentes modulares y fácilmente separables con retroalimentación visual al usuario (Loading spinners/text, Toasts/Mensajes de error integrados).

## Almacenamiento LocaL
Se utiliza `localStorage` únicamente para almacenar:
- Token de login `jwt`.
- Token CUIT `jwtc`.
- Información del CUIT seleccionado `selectedCuit`.
Esto garantiza la persistencia en recargas de navegador y facilita la vuelta a la aplicación sin reautenticación si los tokens no han caducado.
