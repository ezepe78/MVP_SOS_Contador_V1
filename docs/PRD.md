# PRD (Product Requirements Document)

## 1. Descripción del Producto
Dashboard para estudios contables en Argentina que permite la ágil consulta de clientes, reportes impositivos (IVA) y estados contables (Mayor, Sumas y Saldos) operando contra APIs de SOS Contador.

## 2. Planteamiento del Problema
Los contadores pierden tiempo navegando en sistemas ERP complejos para obtener datos rápidos de control. Este Dashboard centraliza la información vital en una interfaz de alto rendimiento.

## 3. Objetivos del Producto
- Reducir el tiempo de consulta de Débito y Crédito Fiscal.
- Proporcionar una visión gerencial rápida (gráficos) de la evolución operativa.
- Facilitar el acceso a mayores contables sin interrupciones de flujo.

## 4. Usuarios Objetivo
- Contadores Públicos.
- Administrativos contables.
- Dueños de PYMEs que usan SOS Contador como plataforma base.

## 5. Alcance
Lectura y visualización de datos:
- Dashboard de Ventas/Compras (Gráficos).
- Listado de Clientes/Proveedores.
- Libros IVA (Ventas y Compras).
- Contabilidad: Libro Mayor y Sumas y Saldos.
*Fuera de alcance: Alta/Baja/Modificación (ABM) de registros.*

## 6. Módulos Funcionales
MF1: **Autenticación Adaptativa**: Manejo de sesiones persistentes.
MF2: **Selector Multi-Empresa**: Búsqueda y selección de CUIT con generación de JWTC.
MF3: **Dashboard Home**: Analítica visual con Recharts (Ventas vs Compras).
MF4: **Módulo Impositivo**: Consulta de IVA Ventas e IVA Compras por período.
MF5: **Módulo Contable**: Libro Mayor con búsqueda por cuenta y Sumas y Saldos a fecha.
MF6: **Gestor de Clientes**: Maestro de clientes/proveedores con búsqueda real-time.

## 7. Flujos de Usuario
Ver `FLUJO_USUARIO.md`

## 8. Reglas de Negocio
- Toda consulta depende del `jwtc` (Token Específico de Relación CUIT).
- Los datos se sirven con caché efímero (3 min) para optimizar la performance sin perder actualidad.
- Los reportes contables dependen de la definición del `ejercicio` fiscal activo.

## 9. Modelo de Datos
Efímero (Client-Side State). Consumo directo de JSON API.

## 10. Requisitos de la API
- Proxy Reverse local para bypass de CORS.
- Endpoints: `/login`, `/cuit/listado`, `/cuit/credentials`, `/cliente/listado`, `/libroivaventa/listado`, `/libroivacompra/listado`, `/mayor/listado`, `/sumasysaldos/listado`.

## 11. Requisitos No Funcionales
- **Vibe Performance**: Transiciones suaves (Motion) y carga asíncrona no bloqueante.
- **Caché Layer**: Reducción de llamadas redundantes a la API.

## 12. Requisitos de UX
- Diseño Premium (Dark/Light compatible).
- Sidebar persistente con estado de CUIT activo visible.
- Feedback inmediato en acciones de carga.

## 13. Casos Extremos
- API Offline: Pantalla de error con opción de reintento.
- Sesión Expirada: Redirección automática al Login con guardado de última ruta.

## 14. Seguridad
- Cifrado TLS en tránsito.
- Almacenamiento seguro de tokens en LocalStorage.
- Limpieza de caché al cerrar sesión.

## 15. Arquitectura Técnica
Ver `ARQUITECTURA.md`

