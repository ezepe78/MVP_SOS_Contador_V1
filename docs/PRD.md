# PRD (Product Requirements Document)

## 1. Descripción del Producto
Dashboard para estudios contables en Argentina que permite la ágil consulta de clientes y visualización de totales de IVA correspondientes a un CUIT específico operando contra public APIs de SOS Contador.

## 2. Planteamiento del Problema
El acceso habitual a los informes básicos como Libros IVA Ventas en plataformas contables completas suele requerir múltiples clics y flujo de pantallas. Un entorno tipo Dashboard enfocado exclusivamente a reportes ahorra tiempo.

## 3. Objetivos del Producto
- Minimizar el tiempo que tarda un contador en ver cuánto Débito Fiscal tiene generado una empresa hoy.
- Evitar procesos intermedios, proporcionando una conexión simple a la API.

## 4. Usuarios Objetivo
- Contadores Públicos.
- Administrativos o Asistentes de Estudios Contables en Argentina.

## 5. Alcance
Queda cubierto el inicio de sesión vía SOS Contador y la lectura paginada de clientes + Libro de IVA Ventas. Fuera de alcance: Modificación/Edición de datos y Subida de comprobantes AFIP.

## 6. Módulos Funcionales
MF1: Autenticación.
MF2: Emulación de Operador CUIT (Selección).
MF3: Módulo Analítico de Clientes (Paginated Data Retrieval).
MF4: Módulo Impositivo IVA Ventas (Monthly Aggregations Retrieval).

## 7. Flujos de Usuario
Ver `FLUJO_USUARIO.md`

## 8. Reglas de Negocio
- Toda consulta depende del `jwtc` (Token Específico de Relación CUIT).
- La información mostrada proviene en tiempo real y no se guarda internamente de un día para otro (excepto tokens temporales).

## 9. Modelo de Datos
N/A - Direct Passthrough (Se utiliza el output puro entregado en payload JSON por API HTTP GET).

## 10. Requisitos de la API
- Comunicación con CORS permitido o uso de Headers en Frontend.
- Endpoints: `/login`, `/cuit/listado`, `/cuit/credentials/:idcuit`, `/cliente/listado`, `/libroivaventa/listado/:ejercicio`.

## 11. Requisitos No Funcionales
- Respuesta rápida en Frontend (Cargando Asíncrono).
- Sin Backends acoplados que requieran mantención para el código en sí.

## 12. Requisitos de UX
- Simple, Limpio. Menú visual estático lateral y grandes tarjetas de información en métricas vitales (Totales $).

## 13. Casos Extremos
- Token Vencido (API error de Autorización 4XX) devuelve al login.
- Sin clientes -> Muestra "sin resultados" estilizado.

## 14. Métricas (Futuro)
- Cantidad de logins exitosos.
- Cantidad de consultas de mes.

## 15. Seguridad y Cumplimiento
- Credenciales encriptadas vía TLS en las peticiones de fetch HTTP nativo.
- JWT persistido temporalmente en LocalStorage bajo políticas del explorador.

## 16. Arquitectura Técnica
Ver `ARQUITECTURA.md`

## 17. Hoja de Ruta
Ver `ROADMAP.md`
