# SOS Contador API - Documentación Completa

## Descripción General

API REST para la gestión contable e impositiva integral de SOS Contador. Permite administrar facturación (ventas y compras), cobros, pagos, contabilidad (asientos, libro mayor, sumas y saldos), clientes/proveedores, productos, y reportes fiscales (IVA, Libro IVA).

**Base URL:** `{{url}}`

## Sistema de Autenticación

La API utiliza un sistema de autenticación JWT de dos niveles:

| Nivel | Token | Obtención | Uso |
|-------|-------|-----------|-----|
| 1 | `{{jwt}}` | POST `/login` | Listar y seleccionar CUITs |
| 2 | `{{jwtc}}` | GET `/cuit/credentials/:idcuit` | Operar con datos contables de una CUIT |

---

## 1. ACCESO (3 endpoints)

### 1.1 POST `{{url}}/register` - Registrar usuario

Registra un nuevo usuario en el sistema SOS Contador.

| Sección | Detalle |
|---------|---------|
| **Auth** | No requiere autenticación |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | |

```json
{
  "usuario": "{{usuario}}",
  "password": "{{clave}}"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `usuario` | string | Email o nombre de usuario |
| `password` | string | Contraseña del usuario |

---

### 1.2 POST `{{url}}/login` - Login usuario

Autentica un usuario y retorna el token JWT de nivel 1. Este token se usa para listar y seleccionar CUITs.

| Sección | Detalle |
|---------|---------|
| **Auth** | No requiere autenticación |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | |

```json
{
  "usuario": "{{usuario}}",
  "password": "{{clave}}"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `usuario` | string | Email o nombre de usuario |
| `password` | string | Contraseña |

**Respuesta:** Token JWT que se almacena en la variable `jwt`.

**Test Script:** Valida status 200 y extrae el token JWT almacenándolo en `pm.environment.set("jwt", token)`.

---

### 1.3 GET `{{url}}/cuit/credentials/:idcuit` - Login CUIT

Obtiene el token JWT de nivel 2 (JWTC) para operar con una CUIT específica. Este token es necesario para acceder a todos los endpoints de datos contables.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwt}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | |

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `:idcuit` | int | ID de la CUIT a seleccionar |

**Respuesta:** Token JWTC que se almacena en la variable `jwtc`.

**Test Script:** Valida status 200 y extrae el token JWT almacenándolo en environment.

---

## 2. ACTIVIDAD (1 endpoint)

### 2.1 GET `{{url}}/actividad/listado/:busca?` - Buscar actividades

Busca actividades económicas por texto.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | |

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `:busca` | string | Texto de búsqueda (opcional) |

---

## 3. AFIP (1 endpoint)

### 3.1 GET `{{url}}/afip/eventanilla` - e-Ventanilla AFIP

Consulta las comunicaciones de la e-Ventanilla de AFIP en un rango de fechas.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | (ninguno adicional) |
| **Query Params** | |

| Param | Tipo | Ejemplo | Descripción |
|-------|------|---------|-------------|
| `desde` | AAAA-MM-DD | 2020-02-01 | Fecha inicio |
| `hasta` | AAAA-MM-DD | 2020-03-27 | Fecha fin |

---

## 4. ASIENTO (4 endpoints)

### 4.1 GET `{{url}}/asiento/listado/:periodo` - Listado de asientos

Lista los asientos contables del periodo indicado con paginación.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | (ninguno adicional) |
| **Path Variables** | |

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `:periodo` | string | Periodo contable |

| Query Param | Tipo | Default | Descripción |
|-------------|------|---------|-------------|
| `pagina` | int | 1 | Número de página |
| `registros` | int | 50 | Registros por página |

---

### 4.2 GET `{{url}}/asiento/detalle/:id` - Detalle de asiento

Obtiene el detalle completo de un asiento contable, incluyendo todas las líneas con cuentas, debe, haber y descripción.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | (ninguno adicional) |
| **Path Variables** | |

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `:id` | int | ID del asiento |

---

### 4.3 PUT `{{url}}/asiento/:id` - Actualizar asiento

Actualiza un asiento contable existente.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | |

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `:id` | int | ID del asiento a actualizar |

**Body (JSON):**

```json
{
  "fecha": "2021-01-01",
  "memo": "",
  "idcentrocosto": "1",
  "idprovinciaiibb": "1",
  "imputaciones": [
    {
      "cuid": "1",
      "fd": "100.00",
      "fh": "0",
      "memo": "fila 1"
    },
    {
      "cuid": "2",
      "fd": "0",
      "fh": "100.00",
      "memo": "fila 2"
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `fecha` | AAAA-MM-DD | Fecha del asiento |
| `memo` | string | Observaciones |
| `idcentrocosto` | string | ID centro de costo |
| `idprovinciaiibb` | string | ID provincia IIBB |
| `imputaciones` | array | Líneas del asiento |
| `imputaciones[].cuid` | string | ID cuenta contable |
| `imputaciones[].fd` | string | Importe Debe |
| `imputaciones[].fh` | string | Importe Haber |
| `imputaciones[].memo` | string | Descripción de la línea |

---

### 4.4 DELETE `{{url}}/asiento/:id` - Eliminar asiento

Elimina un asiento contable.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | |

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `:id` | int | ID del asiento a eliminar |

---

## 5. CAE (1 endpoint)

### 5.1 GET `{{url}}/cae/status/:id` - Estado de CAE

Obtiene el estado del CAE de un comprobante de venta (aprobado, rechazado, pendiente).

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | (ninguno adicional) |
| **Path Variables** | |

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `:id` | int | ID del comprobante |

---

## 6. CENTRO DE COSTO (4 endpoints)

### 6.1 GET `{{url}}/centrocosto/listado` - Listado

Lista todos los centros de costo de la CUIT activa.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |

---

### 6.2 POST `{{url}}/centrocosto` - Crear

Crea un nuevo centro de costo.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | |

```json
{
  "centro": "Nuevo centro de costo"
}
```

---

### 6.3 PUT `{{url}}/centrocosto/:id` - Actualizar

Actualiza los datos de un centro de costo existente.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del centro de costo |
| **Body (JSON)** | |

```json
{
  "centro": "Centro Mercado Pago"
}
```

---

### 6.4 DELETE `{{url}}/centrocosto/:id` - Eliminar

Elimina un centro de costo.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del centro de costo |

---

## 7. CLIENTE (4 endpoints)

### 7.1 GET `{{url}}/cliente/listado` - Listado

Lista los clientes y/o proveedores de la CUIT activa con paginación.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Query Params** | |

| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `proveedor` | boolean | true | Incluir proveedores |
| `cliente` | boolean | true | Incluir clientes |
| `pagina` | int | 1 | Número de página |
| `registros` | int | 50 | Registros por página |
| `txbuscar` | string | (disabled) | Texto o CUIT del cliente a buscar |

---

### 7.2 POST `{{url}}/cliente` - Crear

Crea un nuevo cliente o proveedor.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | |

```json
{
  "cuit": "30500001735",
  "clipro": "Banco de Galicia",
  "idprovincia": 19,
  "idtipocondicioniva": 5,
  "email": "{{usuario}}"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cuit` | string | CUIT del cliente |
| `clipro` | string | Razón social |
| `idprovincia` | int | ID de provincia |
| `idtipocondicioniva` | int | ID condición IVA |
| `email` | string | Email de contacto |

---

### 7.3 PUT `{{url}}/cliente/:id` - Actualizar

Actualiza los datos de un cliente o proveedor existente.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del cliente |
| **Body (JSON)** | |

```json
{
  "cuit": "30500001735",
  "clipro": "Banco de Galicia Modificado",
  "idprovincia": 19,
  "idtipocondicioniva": 5,
  "email": "{{usuario}}"
}
```

---

### 7.4 DELETE `{{url}}/cliente/:id` - Eliminar

Elimina un cliente o proveedor.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del cliente |

---

## 8. COBRO (4 endpoints)

### 8.1 GET `{{url}}/cobro/listado/:periodo` - Listado

Lista los cobros del periodo indicado con paginación.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | (ninguno adicional) |
| **Path Variables** | `:periodo` - Periodo contable |

| Query Param | Tipo | Default | Descripción |
|-------------|------|---------|-------------|
| `pagina` | int | 1 | Número de página |
| `registros` | int | 50 | Registros por página |

---

### 8.2 GET `{{url}}/cobro/detalle/:id` - Detalle

Obtiene el detalle completo de un cobro, incluyendo comprobantes asociados, medios de pago e importes.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | (ninguno adicional) |
| **Path Variables** | `:id` (int) - ID del cobro |

---

### 8.3 PUT `{{url}}/cobro/:id` - Actualizar

Actualiza los datos de un cobro existente.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del cobro |
| **Body (JSON)** | |

```json
{
  "fecha": "2021-01-01",
  "idclipro": "1",
  "idcuenta": "1",
  "idprovinciaiibb": "1",
  "idcentrocosto": "1",
  "memo": "",
  "referencia": "1234",
  "imputaciones": [
    {
      "fv": "100.00",
      "cuid": "1"
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `fecha` | AAAA-MM-DD | Fecha del cobro |
| `idclipro` | string | ID cliente/proveedor |
| `idcuenta` | string | ID cuenta |
| `idprovinciaiibb` | string | ID provincia IIBB |
| `idcentrocosto` | string | ID centro de costo |
| `memo` | string | Observaciones |
| `referencia` | string | Referencia |
| `imputaciones` | array | Imputaciones del cobro |
| `imputaciones[].fv` | string | Importe |
| `imputaciones[].cuid` | string | ID comprobante |

---

### 8.4 DELETE `{{url}}/cobro/:id` - Eliminar

Elimina un registro de cobro.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del cobro |

---

## 9. COMPRA (5 endpoints)

### 9.1 GET `{{url}}/compra/listado/:periodo` - Listado

Lista los comprobantes de compra del periodo indicado con paginación.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | (ninguno adicional) |
| **Path Variables** | `:periodo` - Periodo contable |

| Query Param | Tipo | Default | Descripción |
|-------------|------|---------|-------------|
| `pagina` | int | 1 | Número de página |
| `registros` | int | 50 | Registros por página |

---

### 9.2 GET `{{url}}/compra/detalle/:id` - Detalle

Obtiene el detalle completo de un comprobante de compra, incluyendo items, importes y datos del proveedor.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | (ninguno adicional) |
| **Path Variables** | `:id` (int) - ID del comprobante |

---

### 9.3 POST `{{url}}/compra/consulta` - Consulta avanzada

Consulta avanzada de compras con múltiples filtros combinables (fechas, números, proveedor, tipo de comprobante).

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | |

```json
{
  "fecha_desde": "2020-01-01",
  "fecha_hasta": "2020-04-31"
}
```

---

### 9.4 PUT `{{url}}/compra/:id` - Actualizar

Actualiza los datos de un comprobante de compra existente.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del comprobante |
| **Body (JSON)** | |

```json
{
  "fecha": null,
  "idclipro": 1,
  "cuitclipro": "244243763",
  "idcuenta": 1,
  "fcncnd": "F",
  "letra": "C",
  "puntoventa": 1,
  "numero": null,
  "numerohasta": null,
  "obtienecae": false,
  "fechaiva": null,
  "idprovinciaiibb": 19,
  "idcentrocosto": 1,
  "memo": "",
  "referencia": "1234",
  "descuento": 0,
  "uniqueid": "550e8400-e29b-41d4-a716-446655440000",
  "controlainconsistencia": 0,
  "imputaciones": [{
    "imputa": [{
      "i": "neto",
      "a": 21.00,
      "v": 100.00
    }],
    "cuid": 176792
  }],
  "productos": [{
    "id": 1,
    "u": 7,
    "fc": 1,
    "fu": 100.00,
    "fa": 21.00,
    "cuid": 1
  }]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `fecha` | date/null | Fecha del comprobante |
| `idclipro` | int | ID cliente/proveedor |
| `cuitclipro` | string | CUIT del proveedor |
| `idcuenta` | int | ID cuenta |
| `fcncnd` | string | Tipo: F(factura), C(crédito), D(débito) |
| `letra` | string | Letra: A, B, C |
| `puntoventa` | int | Punto de venta |
| `numero` | int/null | Número de comprobante |
| `numerohasta` | int/null | Número hasta |
| `obtienecae` | boolean | Si obtiene CAE |
| `fechaiva` | date/null | Fecha IVA |
| `idprovinciaiibb` | int | ID provincia IIBB |
| `idcentrocosto` | int | ID centro de costo |
| `memo` | string | Observaciones |
| `referencia` | string | Referencia |
| `descuento` | number | Descuento |
| `uniqueid` | UUID | Identificador único |
| `controlainconsistencia` | int | Control de inconsistencia |
| `imputaciones` | array | Imputaciones impositivas |
| `imputaciones[].imputa[].i` | string | Tipo imputación (neto, etc.) |
| `imputaciones[].imputa[].a` | number | Alícuota |
| `imputaciones[].imputa[].v` | number | Valor |
| `imputaciones[].cuid` | int | ID cuenta |
| `productos` | array | Productos del comprobante |
| `productos[].id` | int | ID producto |
| `productos[].u` | int | ID unidad |
| `productos[].fc` | int | Cantidad |
| `productos[].fu` | number | Precio unitario |
| `productos[].fa` | number | Alícuota IVA |
| `productos[].cuid` | int | ID cuenta |

---

### 9.5 DELETE `{{url}}/compra/:id` - Eliminar

Elimina un comprobante de compra.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del comprobante |

---

## 10. CUIT (7 endpoints)

### 10.1 GET `{{url}}/cuit/listado` - Listado de CUITs

Lista todas las CUITs (empresas) asociadas al usuario autenticado, incluyendo las propias y las compartidas por otros usuarios.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwt}}` |
| **Headers** | `Content-Type: application/json` |

---

### 10.2 GET `{{url}}/cuit/credentials/:idcuit` - Obtener credenciales

Obtiene las credenciales (token JWTC) para operar con una CUIT específica.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwt}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:idcuit` (int) - ID de la CUIT |

---

### 10.3 GET `{{url}}/cuit/parametros` - Parámetros de CUIT

Obtiene los parámetros de configuración de la CUIT activa (datos fiscales, configuración de facturación, etc.).

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |

---

### 10.4 GET `{{url}}/cuit/ccma` - CCMA

Obtiene los datos del Código de Cuenta de Movimiento de Activos (CCMA) de la CUIT activa.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |

---

### 10.5 GET `{{url}}/cuit/sct` - SCT

Obtiene los datos del Sistema de Control de Transacciones (SCT) de la CUIT activa.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |

---

### 10.6 POST `{{url}}/cuit` - Crear CUIT

Crea una nueva CUIT (empresa/contribuyente) asociada al usuario.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwt}}` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | |

```json
{
  "cuit": "30500001735",
  "razonsocial": "Banco de Galicia",
  "idperfil": 36,
  "idcondicioniva": 1,
  "idprovincia": 19,
  "categoria": "D",
  "codactividad": "12300"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cuit` | string | Número de CUIT |
| `razonsocial` | string | Razón social |
| `idperfil` | int | ID del perfil |
| `idcondicioniva` | int | ID condición IVA |
| `idprovincia` | int | ID provincia |
| `categoria` | string | Categoría monotributo |
| `codactividad` | string | Código de actividad económica |

---

### 10.7 PUT `{{url}}/cuit/parametros/mobile` - Actualizar parámetros mobile

Actualiza los parámetros mobile de la CUIT activa.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | |

```json
{
  "configurado": false,
  "idcuenta": null,
  "idcentro": null,
  "puntoventa": null,
  "codigoimpresora": null,
  "idimpresora": null,
  "nombreimpresora": null,
  "alicuota": null,
  "etiquetareferencia": null
}
```

---

## 11. CUENTA CONTABLE (1 endpoint)

### 11.1 GET `{{url}}/cuentacontable/listado` - Plan de cuentas

Lista el plan de cuentas contables completo de la CUIT activa, con estructura jerárquica.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |

---

## 12. CUENTA CORRIENTE (1 endpoint)

### 12.1 GET `{{url}}/cuentacorriente/listado` - Saldos

Lista las cuentas corrientes de clientes y proveedores con sus saldos.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | |

```json
{
  "CP": "C",
  "fechadesde": "2025-01-01",
  "fechahasta": "2025-04-30",
  "tipo": "T",
  "idclipro": 1
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `CP` | string | C=Cliente, P=Proveedor |
| `fechadesde` | AAAA-MM-DD | Fecha inicio |
| `fechahasta` | AAAA-MM-DD | Fecha fin |
| `tipo` | string | T=Todos |
| `idclipro` | int | ID cliente/proveedor |

---

## 13. EMAIL (1 endpoint)

### 13.1 POST `{{url}}/email/enviar` - Enviar comprobante

Envía comprobantes de venta por email al cliente.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | |

```json
{
  "comprobantes": [15272705],
  "idcliente": 1,
  "email": "{{usuario}}"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `comprobantes` | array int | IDs de comprobantes a enviar |
| `idcliente` | int | ID del cliente destinatario |
| `email` | string | Email de destino |

---

## 14. GRUPO MODIFICADOR (4 endpoints)

### 14.1 GET `{{url}}/grupomodificador/listado` - Listado

Lista todos los grupos modificadores de la CUIT activa.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |

---

### 14.2 POST `{{url}}/grupomodificador` - Crear

Crea un nuevo grupo modificador.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | |

```json
{
  "grupomodificador": "Grupo nuevo",
  "productos": [1, 2, 3]
}
```

---

### 14.3 PUT `{{url}}/grupomodificador/:id` - Actualizar

Actualiza los datos de un grupo modificador existente.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del grupo modificador |
| **Body (JSON)** | |

```json
{
  "grupomodificador": "Grupo nuevo 2",
  "productos": [1, 2, 3]
}
```

---

### 14.4 DELETE `{{url}}/grupomodificador/:id` - Eliminar

Elimina un grupo modificador.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del grupo modificador |

---

## 15. IMPRESION (1 endpoint)

### 15.1 GET `{{url}}/impresion/parametros` - Parámetros de impresión

Obtiene los parámetros de configuración de impresión de comprobantes (formato de página, márgenes, logo, datos del encabezado).

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |

---

## 16. INDICE AÑO/MES (1 endpoint)

### 16.1 GET `{{url}}/indiceaniomes/listado` - Listado de índices

Lista los índices disponibles organizados por año y mes.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | (ninguno adicional) |

---

## 17. IVA (1 endpoint)

### 17.1 GET `{{url}}/iva/listado/:ejercicio` - Reporte F.2002

Genera el reporte de posición de IVA por actividad (F.2002) para un ejercicio y periodo determinado.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:ejercicio` - Ejercicio contable |

| Query Param | Tipo | Descripción |
|-------------|------|-------------|
| `anio` | AAAA | Año del periodo |
| `mes` | MM | Mes del periodo |

---

## 18. LIBRO IVA (2 endpoints)

### 18.1 GET `{{url}}/libroivaventa/listado/:ejercicio` - Libro IVA Ventas

Genera el Libro IVA Ventas para un ejercicio y periodo. Retorna el listado completo de comprobantes con desglose de IVA por alícuota.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:ejercicio` - Ejercicio contable |

| Query Param | Tipo | Ejemplo | Descripción |
|-------------|------|---------|-------------|
| `anio` | AAAA | `{{anio}}` | Año del periodo |
| `mes` | MM | `{{mes}}` | Mes del periodo |

**Campos de respuesta:** fecha, letra, sucursal, numero, clipro, cuit, neto, iva_total, iva_al_21, iva_al_10_5, iva_al_27, iva_al_5, iva_al_2_5, iva_otros, montototal

**Test Script:** Incluye visualización HTML con resumen de totales, desglose IVA por alícuota y tabla detallada de comprobantes.

---

### 18.2 GET `{{url}}/libroivacompra/listado/:ejercicio` - Libro IVA Compras

Genera el Libro IVA Compras para un ejercicio y periodo. Retorna el listado completo de comprobantes de compra con desglose de IVA por alícuota.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:ejercicio` - Ejercicio contable |

| Query Param | Tipo | Ejemplo | Descripción |
|-------------|------|---------|-------------|
| `anio` | AAAA | `{{anio}}` | Año del periodo |
| `mes` | MM | `{{mes}}` | Mes del periodo |

---

## 19. MAYOR (1 endpoint)

### 19.1 GET `{{url}}/mayor/listado/:ejercicio` - Libro Mayor

Obtiene el listado del Libro Mayor para un ejercicio contable con filtros avanzados.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | (ninguno adicional) |
| **Path Variables** | `:ejercicio` - Ejercicio contable |

| Query Param | Tipo | Descripción |
|-------------|------|-------------|
| `fechadesde` | AAAA-MM-DD | Fecha inicio (dentro del ejercicio) |
| `fechahasta` | AAAA-MM-DD | Fecha fin (dentro del ejercicio) |
| `pagina` | int | Número de página |
| `registros` | int | Registros por página |
| `arbol` | string | Código de cuenta contable (ej: 01.01.01.001.001) |

---

## 20. PAGO (4 endpoints)

### 20.1 GET `{{url}}/pago/listado/:periodo` - Listado

Lista los pagos del periodo indicado con paginación.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | (ninguno adicional) |
| **Path Variables** | `:periodo` - Periodo contable |

| Query Param | Tipo | Default | Descripción |
|-------------|------|---------|-------------|
| `pagina` | int | 1 | Número de página |
| `registros` | int | 50 | Registros por página |

---

### 20.2 GET `{{url}}/pago/detalle/:id` - Detalle

Obtiene el detalle completo de un pago, incluyendo comprobantes asociados, medios de pago e importes.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | (ninguno adicional) |
| **Path Variables** | `:id` (int) - ID del pago |

---

### 20.3 PUT `{{url}}/pago/:id` - Actualizar

Actualiza los datos de un pago existente.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del pago |
| **Body (JSON)** | |

```json
{
  "fecha": "2021-01-01",
  "idclipro": "1",
  "idcuenta": "1",
  "idprovinciaiibb": "1",
  "idcentrocosto": "1",
  "memo": "",
  "referencia": "1234",
  "imputaciones": [
    {
      "fv": "100.00",
      "cuid": "1"
    }
  ]
}
```

---

### 20.4 DELETE `{{url}}/pago/:id` - Eliminar

Elimina un registro de pago.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del pago |

---

## 21. PRODUCTO (4 endpoints)

### 21.1 GET `{{url}}/producto/listado` - Listado

Lista los productos y servicios de la CUIT activa con paginación.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |

| Query Param | Tipo | Default | Descripción |
|-------------|------|---------|-------------|
| `pagina` | int | 1 | Número de página |
| `registros` | int | 50 | Registros por página |

---

### 21.2 POST `{{url}}/producto` - Crear

Crea un nuevo producto o servicio.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | |

```json
{
  "codigo": "1234",
  "producto": "Nuevo producto",
  "idproductoservicio": 1,
  "idunidad": 1,
  "idcentrocosto": 3348,
  "idgrupomodi": null,
  "tasaiva": 21.00,
  "precio1": 10.00,
  "precio2": 0.00,
  "precio3": 0.00,
  "precio4": 0.00,
  "precio5": 0.00,
  "costo": 5.00,
  "excluirIIBB": false,
  "memo": "",
  "visible": true
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `codigo` | string | Código del producto |
| `producto` | string | Nombre/descripción |
| `idproductoservicio` | int | ID tipo producto/servicio |
| `idunidad` | int | ID unidad de medida |
| `idcentrocosto` | int | ID centro de costo |
| `idgrupomodi` | int/null | ID grupo modificador |
| `tasaiva` | number | Tasa de IVA (%) |
| `precio1`-`precio5` | number | Listas de precios |
| `costo` | number | Costo del producto |
| `excluirIIBB` | boolean | Excluir de IIBB |
| `memo` | string | Observaciones |
| `visible` | boolean | Visible en listados |

---

### 21.3 PUT `{{url}}/producto/:id` - Actualizar

Actualiza los datos de un producto o servicio existente.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del producto |
| **Body (JSON)** | Misma estructura que POST |

---

### 21.4 DELETE `{{url}}/producto/:id` - Eliminar

Elimina un producto o servicio.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del producto |

---

## 22. PROVINCIA (1 endpoint)

### 22.1 GET `{{url}}/provincia/listado` - Listado de provincias

Lista todas las provincias argentinas con sus IDs para uso en formularios de clientes/proveedores.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |

---

## 23. PUNTO DE VENTA (4 endpoints)

### 23.1 GET `{{url}}/puntoventa/listado` - Listado

Lista todos los puntos de venta habilitados de la CUIT activa.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |

---

### 23.2 POST `{{url}}/puntoventa` - Crear

Crea un nuevo punto de venta.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Body (JSON)** | |

```json
{
  "puntoventa": 1,
  "codactividad": "023210",
  "nombre": "Nombre del Punto de Venta",
  "domicilio": "Manuel Belgrano 448, Ciudadela, Buenos Aires",
  "cbu": ""
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `puntoventa` | int | Número de punto de venta |
| `codactividad` | string | Código de actividad |
| `nombre` | string | Nombre descriptivo |
| `domicilio` | string | Domicilio comercial |
| `cbu` | string | CBU asociado |

---

### 23.3 PUT `{{url}}/puntoventa/:id` - Actualizar

Actualiza los datos de un punto de venta existente.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del punto de venta |
| **Body (JSON)** | Misma estructura que POST |

---

### 23.4 DELETE `{{url}}/puntoventa/:id` - Eliminar

Elimina un punto de venta.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del punto de venta |

---

## 24. RECIBO (1 endpoint)

### 24.1 GET `{{url}}/recibo/listado/:periodo` - Listado de recibos

Lista los recibos del periodo indicado con paginación.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | (ninguno adicional) |
| **Path Variables** | `:periodo` - Periodo contable |

| Query Param | Tipo | Default | Descripción |
|-------------|------|---------|-------------|
| `pagina` | int | 1 | Número de página |
| `registros` | int | 50 | Registros por página |

---

## 25. SUMAS Y SALDOS (1 endpoint)

### 25.1 GET `{{url}}/sumasysaldos/listado/:ejercicio` - Balance

Genera el balance de Sumas y Saldos para un ejercicio contable y rango de fechas.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:ejercicio` - Ejercicio contable |

| Query Param | Tipo | Descripción |
|-------------|------|-------------|
| `fechadesde` | AAAA-MM-DD | Fecha inicio del periodo |
| `fechahasta` | AAAA-MM-DD | Fecha fin del periodo |

---

## 26. TIPO (1 endpoint)

### 26.1 GET `{{url}}/tipo/listado/:modulo/:busca?` - Tipos por módulo

Lista los tipos disponibles para un módulo específico, con búsqueda opcional.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | |

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `:modulo` | string | Nombre del módulo (ej: venta, compra, cobro) |
| `:busca` | string | Texto de búsqueda (opcional) |

---

## 27. UNIDAD (1 endpoint)

### 27.1 GET `{{url}}/unidad/listado` - Unidades de medida

Lista todas las unidades de medida disponibles (unidad, kilogramo, litro, metro, etc.).

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |

---

## 28. VENTA (7 endpoints)

### 28.1 GET `{{url}}/venta/listado/:modo/:periodo/:cae` - Listado

Lista los comprobantes de venta con filtros por modo, periodo y estado de CAE.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | |

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `:modo` | string | Modo de listado |
| `:periodo` | string | Periodo contable |
| `:cae` | string | Filtro por estado de CAE |

| Query Param | Tipo | Default | Descripción |
|-------------|------|---------|-------------|
| `pagina` | int | 1 | Número de página |
| `registros` | int | 50 | Registros por página |
| `fecha_desde` | AAAA-MM-DD | - | Fecha inicio |
| `fecha_hasta` | AAAA-MM-DD | - | Fecha fin |

---

### 28.2 GET `{{url}}/venta/detalle/:id` - Detalle

Obtiene el detalle completo de un comprobante de venta, incluyendo items, importes, datos del cliente e información fiscal.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del comprobante |

---

### 28.3 GET `{{url}}/venta/pdf/:id` - Descargar PDF

Genera y descarga el PDF del comprobante de venta para impresión o envío.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del comprobante |

---

### 28.4 POST `{{url}}/venta/consulta` - Consulta avanzada

Consulta avanzada de ventas con múltiples filtros combinables.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |

| Query Param | Tipo | Default | Descripción |
|-------------|------|---------|-------------|
| `pagina` | int | 1 | Número de página |
| `registros` | int | 50 | Cantidad de registros por página |

**Body (JSON):**

```json
{
  "fecha_desde": "2020-01-01",
  "fecha_hasta": "2020-04-31",
  "numero_desde": 3,
  "numero_hasta": 111,
  "sucursal": [1, 4],
  "tipo_factura": ["F"],
  "idclipro": [582660]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `fecha_desde` | AAAA-MM-DD | Fecha inicio |
| `fecha_hasta` | AAAA-MM-DD | Fecha fin |
| `numero_desde` | int | Número de comprobante desde |
| `numero_hasta` | int | Número de comprobante hasta |
| `sucursal` | array int | IDs de sucursales |
| `tipo_factura` | array string | Tipos: A, B, C, F, etc. |
| `idclipro` | array int | IDs de clientes |

---

### 28.5 PUT `{{url}}/venta/:id` - Actualizar

Actualiza los datos de un comprobante de venta existente.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del comprobante |
| **Body (JSON)** | |

```json
{
  "idtipo_operacion": 2,
  "fecha": null,
  "idclipro": 1,
  "cuitclipro": "50000000016",
  "idcuenta": null,
  "fcncnd": "F",
  "letra": "C",
  "puntoventa": 1,
  "numero": 1,
  "numerohasta": null,
  "obtienecae": false,
  "fechaiva": null,
  "idprovinciaiibb": null,
  "idcentrocosto": null,
  "memo": "Factura de Prueba",
  "referencia": "Factura Prueba 12345",
  "descuento": 0,
  "uniqueid": "550e8400-e29b-41d4-a716-446655440000",
  "imputaciones": [{
    "i": "neto",
    "a": 0,
    "v": 1550.00
  }],
  "productos": [{
    "id": 772500,
    "u": 7,
    "fc": 1,
    "fu": 1550.00,
    "fa": 21.00
  }]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `idtipo_operacion` | int | Tipo de operación |
| `fecha` | date/null | Fecha del comprobante |
| `idclipro` | int | ID cliente/proveedor |
| `cuitclipro` | string | CUIT del cliente |
| `idcuenta` | int/null | ID cuenta |
| `fcncnd` | string | F=Factura, C=Crédito, D=Débito |
| `letra` | string | Letra: A, B, C |
| `puntoventa` | int | Punto de venta |
| `numero` | int | Número de comprobante |
| `numerohasta` | int/null | Número hasta |
| `obtienecae` | boolean | Si obtiene CAE de AFIP |
| `fechaiva` | date/null | Fecha IVA |
| `idprovinciaiibb` | int/null | ID provincia IIBB |
| `idcentrocosto` | int/null | ID centro de costo |
| `memo` | string | Observaciones |
| `referencia` | string | Referencia |
| `descuento` | number | Descuento |
| `uniqueid` | UUID | Identificador único |
| `imputaciones` | array | Imputaciones |
| `imputaciones[].i` | string | Tipo (neto, etc.) |
| `imputaciones[].a` | number | Alícuota |
| `imputaciones[].v` | number | Valor |
| `productos` | array | Productos |
| `productos[].id` | int | ID producto |
| `productos[].u` | int | ID unidad |
| `productos[].fc` | int | Cantidad |
| `productos[].fu` | number | Precio unitario |
| `productos[].fa` | number | Alícuota IVA |

---

### 28.6 PUT `{{url}}/venta/archivar/:id` - Archivar

Archiva un comprobante de venta para sacarlo del listado activo sin eliminarlo.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del comprobante |

---

### 28.7 DELETE `{{url}}/venta/:id` - Eliminar

Elimina un comprobante de venta.

| Sección | Detalle |
|---------|---------|
| **Auth** | Bearer `{{jwtc}}` |
| **Headers** | `Content-Type: application/json` |
| **Path Variables** | `:id` (int) - ID del comprobante |

---

## Resumen de Endpoints (71 total)

| Módulo | GET | POST | PUT | DELETE | Total |
|--------|-----|------|-----|--------|-------|
| Acceso | 1 | 2 | - | - | 3 |
| Actividad | 1 | - | - | - | 1 |
| AFIP | 1 | - | - | - | 1 |
| Asiento | 2 | - | 1 | 1 | 4 |
| CAE | 1 | - | - | - | 1 |
| Centro de Costo | 1 | 1 | 1 | 1 | 4 |
| Cliente | 1 | 1 | 1 | 1 | 4 |
| Cobro | 2 | - | 1 | 1 | 4 |
| Compra | 2 | 1 | 1 | 1 | 5 |
| CUIT | 5 | 1 | 1 | - | 7 |
| Cuenta Contable | 1 | - | - | - | 1 |
| Cuenta Corriente | 1 | - | - | - | 1 |
| Email | - | 1 | - | - | 1 |
| Grupo Modificador | 1 | 1 | 1 | 1 | 4 |
| Impresión | 1 | - | - | - | 1 |
| Índice Año/Mes | 1 | - | - | - | 1 |
| IVA | 1 | - | - | - | 1 |
| Libro IVA | 2 | - | - | - | 2 |
| Mayor | 1 | - | - | - | 1 |
| Pago | 2 | - | 1 | 1 | 4 |
| Producto | 1 | 1 | 1 | 1 | 4 |
| Provincia | 1 | - | - | - | 1 |
| Punto de Venta | 1 | 1 | 1 | 1 | 4 |
| Recibo | 1 | - | - | - | 1 |
| Sumas y Saldos | 1 | - | - | - | 1 |
| Tipo | 1 | - | - | - | 1 |
| Unidad | 1 | - | - | - | 1 |
| Venta | 3 | 1 | 2 | 1 | 7 |
| **TOTAL** | **34** | **11** | **12** | **10** | **71** |
