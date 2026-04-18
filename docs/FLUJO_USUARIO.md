# Flujo de Usuario

## 1. Convenciones de flujo
El flujo es lineal bidireccional dependiendo del estado del token: Login -> Empresa -> Dashboard.

## 2. Actores
Contador (Usuario Administrador del sistema).

## 3. Navegación global
La navegación opera sobre un "Shell" (Menú lateral permanente en Desktop, Desplegable Hamburger en Mobile).

## 4. Pantallas
- `/login`: Pantalla blanca, centrada de iniciar sesión.
- `/selector`: Pantalla con tarjeta estilo Modal listando Razón Social.
- `/dashboard/clientes`: Activa vista de tabla de Clientes en Componentes principales.
- `/dashboard/ivaventas`: Activa vista de consultas de período de IVA.

## 5. Flujos de usuario principales
**Login y Consulta**
1. App carga -> Verifica `localStorage`. Al no encontrar token, renderiza `Pantalla de Login`.
2. Usuario completa datos correctos -> Dispara POST API y recibe JWT. Graba en memoria.
3. App renderiza automática -> `Pantalla de Selección de CUIT`. Dispara fetch `cuit/listado`.
4. El usuario ve la lista, pincha en CUIT y la App llama GET para el `jwtc`. Graba en memoria y rutea al `Dashboard`.

## 6. Flujos alternativos
**Recarga F5**
- Tras dar F5 (refrescar el navegador) desde el Dashboard central, la app detecta que ya posee `jwt` y `jwtc` (en localStorage) y se saltea el login mostrando instantáneamente el contenido previamente observado.

## 7. Flujos de error
- Si un usuario coloca una contraseña errónea, SOS Contador retorna error 4XX con mensaje en body JSON, el cual se muestra textualmente en rojo bajo el header del Login.

## 8. Comentarios del sistema
- Se utilizan estados `isLoading` para bloquear los submits múltiples en botones (Ej. botón oscuro con leyenda "Autenticando..." en lugar de "Ingresar").

## 9. Permisos
- Sólo pueden ver la información contenida y obtenida los usuarios validados contra la Base de Datos oficial de SOS Contador.

## 10. Estados de la interfaz de usuario
- Error State (ROJO).
- Loading State (Azul/Grisado con deshabilitación de interacciones).
- Empty Data List (Ilustración gris con leyenda "Seleccioná Año y Mes" o "Sin resultados").
