# Dashboard SOS Contador

## Descripción general del sistema
MVP (Producto Mínimo Viable) de un dashboard web de alto rendimiento para contadores en Argentina. Se integra con la API de SOS Contador utilizando un sistema de **Proxy Seguro** para gestionar CORS y autenticación, ofreciendo una experiencia fluida y rápida "vibe-driven".

## Objetivo del proyecto
Optimizar la labor contable permitiendo consultas inmediatas de indicadores clave (IVA, Libro Mayor, Sumas y Saldos) sin la complejidad de navegar por múltiples menús de gestión.

## Características principales
- **Autenticación Robusta**: Manejo de doble JWT (Master y CUIT) con persistencia inteligente.
- **Caché Inteligente**: Sistema de caché en memoria (TTL 3m) para minimizar latencia y consumo de API.
- **Dashboard Gerencial**: Visualización gráfica mediante Recharts de Ventas y Compras.
- **Módulos Impositivos**: Libro IVA Ventas e IVA Compras con desglose de alícuotas.
- **Módulos Contables**: Consulta ágil de Plan de Cuentas, Libro Mayor y Sumas y Saldos.
- **Gestión de Clientes**: Listado paginado con búsqueda asíncrona.

## Stack tecnológico utilizado
- **Core**: React 19 + TypeScript.
- **Build Tool**: Vite 6.
- **Proxy**: Express + http-proxy-middleware (Local) / Vercel Rewrites (Producción).
- **Styling**: Tailwind CSS 4 + Lucide React (Íconos).
- **Animaciones**: Motion.
- **Gráficos**: Recharts.

## Instrucciones para ejecución local
1. Instalar dependencias: `npm install`
2. Levantar el entorno de desarrollo: `npm run dev`
   - Esto inicia un servidor Express en el puerto **3000** que sirve el proxy de API y el middleware de Vite.
3. Acceder vía `http://localhost:3000`.

---
*Nota: Para despliegue en Vercel, se utiliza la configuración en `vercel.json` que mapea los rewrites de `/api/*` directamente a la API de SOS Contador.*

