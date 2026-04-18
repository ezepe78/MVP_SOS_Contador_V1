# Dashboard SOS Contador

## Descripción general del sistema
MVP (Producto Mínimo Viable) de un dashboard web para contadores en Argentina, integrado directamente con la API pública de SOS Contador sin necesidad de un backend intermediario.

## Objetivo del proyecto
Brindar una interfaz simplificada, amigable y moderna para que los contadores puedan consultar rápidamente la cartera de clientes de un contribuyente específico y acceder a los totales y detalles mensuales del Libro IVA Ventas.

## Características principales
- **Autenticación real (DOBLE JWT)**: Integración con el sistema de tokens de SOS Contador (JWT master y JWT-CUIT).
- **Selección de Contribuyente**: Permite elegir con qué CUIT se desea operar.
- **Consultas Rápidas**: Visualización paginada y con buscador de clientes.
- **Libro IVA Ventas**: Detalle mensual de importes netos, IVA (débito fiscal) y total general.

## Stack tecnológico utilizado
- Frontend: React (Hooks)
- Estilos: Tailwind CSS, Lucide React (Íconos)
- Construcción y empaquetado: Vite
- Lenguaje: TypeScript

## Instrucciones básicas para ejecutar el proyecto en entorno local
1. Instalar dependencias: `npm install`
2. Configurar variable de entorno (Opcional): `VITE_API_BASE_URL` si se desea cambiar el endpoint base de la API.
3. Levantar servidor local: `npm run dev`
4. Acceder vía `http://localhost:3000` (el puerto puede variar según Vite).
