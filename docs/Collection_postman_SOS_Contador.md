# Colección Postman: SOS Contador API

## Descripción General

API REST para la gestión contable e impositiva integral de SOS Contador. Permite administrar facturación (ventas y compras), cobros, pagos, contabilidad (asientos, libro mayor, sumas y saldos), libros IVA, clientes/proveedores, productos, e integración con AFIP.

### Autenticación y Variables de Entorno

La API utiliza un sistema de **doble JWT**:
- `jwt`: Se obtiene al hacer login. Se usa para gestionar CUITs.
- `jwtc`: Se obtiene seleccionando una CUIT. Se usa para operaciones contables/facturación.

| Variable | Descripción | Valor Base |
| --- | --- | --- |
| `url` | URL base del servidor | `https://api.sos-contador.com/api-comunidad` |
| `usuario` | Email/usuario de acceso | - |
| `clave` | Contraseña del usuario | - |

---

## 1. Acceso

### 1.1 `POST {{url}}/register` - Registrar usuario
- **Auth:** Ninguna
- **Body (JSON):**
```json
{
  "usuario": "{{usuario}}",
  "password": "{{clave}}"
}
```

### 1.2 `POST {{url}}/login` - Login usuario
- **Auth:** Ninguna
- **Body (JSON):**
```json
{
  "usuario": "{{usuario}}",
  "password": "{{clave}}"
}
```
> **Nota:** Guarda el token de retorno en la variable de entorno `jwt`.

### 1.3 `GET {{url}}/cuit/credentials/:idcuit` - Login CUIT
- **Auth:** Bearer `{{jwt}}`
- **Path Params:** `idcuit` (ID numérico de la CUIT)

---

## 2. Actividad

### 2.1 `GET {{url}}/actividad/listado/:busca?` - Buscar actividades
- **Auth:** Bearer `{{jwtc}}`
- **Query Params:** `busca` (Texto de búsqueda, opcional)

---

## 3. AFIP

### 3.1 `GET {{url}}/afip/eventanilla` - e-Ventanilla AFIP
- **Auth:** Bearer `{{jwtc}}`
- **Query Params:** 
  - `desde` (ej: `2020-02-01`)
  - `hasta` (ej: `2020-03-27`)

---

## 4. Asiento

### 4.1 `GET {{url}}/asiento/listado/:periodo` - Listado de asientos
- **Auth:** Bearer `{{jwtc}}`
- **Path Params:** `periodo` (ej: `hoy`, `semana`, `mes`, `anio`)
- **Query Params:** `pagina` (default 1), `registros` (default 50)

### 4.2 `GET {{url}}/asiento/detalle/:id` - Detalle de asiento
- **Auth:** Bearer `{{jwtc}}`

### 4.3 `PUT {{url}}/asiento/:id` - Actualizar asiento
- **Auth:** Bearer `{{jwtc}}`
- **Body (JSON):**
```json
{
  "fecha": "2021-01-01",
  "memo": "",
  "idcentrocosto": "1",
  "idprovinciaiibb": "1",
  "imputaciones": [
      { "cuid": "1", "fd": "100.00", "fh": "0", "memo": "fila 1" },
      { "cuid": "2", "fd": "0", "fh": "100.00", "memo": "fila 2" }
  ]
}
```

### 4.4 `DELETE {{url}}/asiento/:id` - Eliminar asiento
- **Auth:** Bearer `{{jwtc}}`

---

## 5. CAE

### 5.1 `GET {{url}}/cae/status/:id` - Estado de CAE
- **Auth:** Bearer `{{jwtc}}`

---

## 6. Centro de Costo

### 6.1 `GET {{url}}/centrocosto/listado`
- **Auth:** Bearer `{{jwtc}}`

### 6.2 `POST {{url}}/centrocosto`
- **Auth:** Bearer `{{jwtc}}`
- **Body (JSON):**
```json
{ "centro": "Nuevo centro de costo" }
```

### 6.3 `PUT {{url}}/centrocosto/:id`
- **Auth:** Bearer `{{jwtc}}`
- **Body (JSON):**
```json
{ "centro": "Centro Mercado Pago" }
```

### 6.4 `DELETE {{url}}/centrocosto/:id`
- **Auth:** Bearer `{{jwtc}}`

---

## 7. Cliente

### 7.1 `GET {{url}}/cliente/listado`
- **Auth:** Bearer `{{jwtc}}`
- **Query Params:** 
  - `proveedor` (boolean, default: true)
  - `cliente` (boolean, default: true)
  - `pagina` (int)
  - `registros` (int)
  - `txbuscar` (texto de búsqueda)

### 7.2 `POST {{url}}/cliente`
- **Auth:** Bearer `{{jwtc}}`
- **Body (JSON):**
```json
{
  "cuit": "30500001735",
  "clipro": "Banco de Galicia",
  "idprovincia": 19,
  "idtipocondicioniva": 5,
  "email": "{{usuario}}"
}
```

### 7.3 `PUT {{url}}/cliente/:id`
- **Auth:** Bearer `{{jwtc}}`
- **Body (JSON):** Igual al POST.

### 7.4 `DELETE {{url}}/cliente/:id`
- **Auth:** Bearer `{{jwtc}}`

---

## 8. Cobro

### 8.1 `GET {{url}}/cobro/listado/:periodo`
- **Auth:** Bearer `{{jwtc}}`
- **Query Params:** `pagina`, `registros`

### 8.2 `GET {{url}}/cobro/detalle/:id`
- **Auth:** Bearer `{{jwtc}}`

### 8.3 `PUT {{url}}/cobro/:id`
- **Auth:** Bearer `{{jwtc}}`
- **Body (JSON):**
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
      { "fv": "100.00", "cuid": "1" }
  ]
}
```

### 8.4 `DELETE {{url}}/cobro/:id`
- **Auth:** Bearer `{{jwtc}}`

---

## 9. Compra

### 9.1 `GET {{url}}/compra/listado/:periodo`
- **Auth:** Bearer `{{jwtc}}`
- **Query Params:** `pagina`, `registros`

### 9.2 `GET {{url}}/compra/detalle/:id`
- **Auth:** Bearer `{{jwtc}}`

### 9.3 `POST {{url}}/compra/consulta`
- **Auth:** Bearer `{{jwtc}}`
- **Body (JSON):**
```json
{
  "fecha_desde": "2020-01-01",
  "fecha_hasta": "2020-04-31"
}
```

### 9.4 `PUT {{url}}/compra/:id`
- **Auth:** Bearer `{{jwtc}}`
- **Body (JSON):**
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
  "descuento": 0,
  "imputaciones": [{ "imputa": [{ "i": "neto", "a": 21.00, "v": 100.00 }], "cuid": 176792 }],
  "productos": [{ "id": 1, "u": 7, "fc": 1, "fu": 100.00, "fa": 21.00, "cuid": 1 }]
}
```
*(Nota: Ejemplo extraído de la colección, contiene docenas de llaves operativas).*

### 9.5 `DELETE {{url}}/compra/:id`
- **Auth:** Bearer `{{jwtc}}`

---

## 10. CUIT

### 10.1 `GET {{url}}/cuit/listado`
- **Auth:** Bearer `{{jwt}}`

### 10.2 `GET {{url}}/cuit/credentials/:idcuit`
- **Auth:** Bearer `{{jwt}}`

### 10.3 `GET {{url}}/cuit/parametros`
- **Auth:** Bearer `{{jwtc}}`

### 10.4 `GET {{url}}/cuit/ccma`
- **Auth:** Bearer `{{jwtc}}`

### 10.5 `GET {{url}}/cuit/sct`
- **Auth:** Bearer `{{jwtc}}`

### 10.6 `POST {{url}}/cuit`
- **Auth:** Bearer `{{jwt}}`
- **Body (JSON):**
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

### 10.7 `PUT {{url}}/cuit/parametros/mobile`
- **Auth:** Bearer `{{jwtc}}`

---

## 11. Cuenta Contable & 12. Cuenta Corriente

- **`GET {{url}}/cuentacontable/listado`**: Plan de cuentas completo.
- **`GET {{url}}/cuentacorriente/listado`**: Saldos de cuentas corrientes:
```json
{
    "CP": "C",
    "fechadesde":"2025-01-01",
    "fechahasta":"2025-04-30",
    "tipo":"T",
    "idclipro": 1
}
```

---

## 13. Email

### 13.1 `POST {{url}}/email/enviar`
- **Auth:** Bearer `{{jwtc}}`
- **Body (JSON):**
```json
{
  "comprobantes": [ 15272705 ],
  "idcliente": 1,
  "email": "{{usuario}}"
}
```

---

## 14 a 17. Utilidades (Grupo Modificador, Impresión, Índice, IVA)

- **`GET {{url}}/grupomodificador/listado`**
- **`POST {{url}}/grupomodificador`**: `{ "grupomodificador": "Grupo", "productos": [1,2] }`
- **`GET {{url}}/impresion/parametros`**
- **`GET {{url}}/indiceaniomes/listado`**
- **`GET {{url}}/iva/listado/:ejercicio?anio=XXXX&mes=YY`**: Posición de IVA F.2002.

---

## 18. Libro IVA (Ventas y Compras)

Generación de reportes exigidos por AFIP (incluyen test en Postman para renderizar plantillas HTML resumiendo desglose por alícuotas).

### 18.1 `GET {{url}}/libroivaventa/listado/:ejercicio`
- **Auth:** Bearer `{{jwtc}}`
- **Query Params:** `anio`, `mes`

### 18.2 `GET {{url}}/libroivacompra/listado/:ejercicio`
- **Auth:** Bearer `{{jwtc}}`
- **Query Params:** `anio`, `mes`

---

## 19. Mayor

### 19.1 `GET {{url}}/mayor/listado/:ejercicio`
- **Auth:** Bearer `{{jwtc}}`
- **Query Params:**
  - `fechadesde` (AAAA-MM-DD)
  - `fechahasta` (AAAA-MM-DD)
  - `pagina`
  - `registros`
  - `arbol` (Ej: `01.01.01.001.001`)

---

## 20. Pago

- **`GET {{url}}/pago/listado/:periodo`**
- **`GET {{url}}/pago/detalle/:id`**
- **`PUT {{url}}/pago/:id`** *(Actualización JSON análogo al cobro)*
- **`DELETE {{url}}/pago/:id`**

---

## 21. Producto

- **`GET {{url}}/producto/listado`**
- **`POST {{url}}/producto`**
```json
{
  "codigo": "1234",
  "producto": "Nuevo producto",
  "idproductoservicio": 1,
  "tasaiva": 21.00,
  "precio1": 10.00,
  "costo": 5.00
}
```
- **`PUT {{url}}/producto/:id`**
- **`DELETE {{url}}/producto/:id`**

---

## 22 a 27. Auxiliares (Provincia, TPV, Recibo, Sumas y Tipos)

Endpoints estándar para listado de catálogos y gestión simple:

- `{{url}}/provincia/listado`
- `{{url}}/puntoventa/listado` *(y POST/PUT asociado)*
- `{{url}}/recibo/listado/:periodo`
- `{{url}}/sumasysaldos/listado/:ejercicio` *(con querys `fechadesde` / `fechahasta`)*
- `{{url}}/tipo/listado/:modulo/:busca?` 
- `{{url}}/unidad/listado`

---

## 28. Venta

Gestión completa de facturas de venta.

### 28.1 `GET {{url}}/venta/listado/:modo/:periodo/:cae`
- **Auth:** Bearer `{{jwtc}}`
- **Path Vars:** `modo` (borradores|facturas), `periodo` (hoy|mes|entre_fechas), `cae` (sincae|concae|todas)
- **Query Params:**
  - `pagina` (int) - ej: `1`
  - `registros` (int) - ej: `50`
  - `fecha_desde` (AAAA-MM-DD) - ej: `2020-01-01`
  - `fecha_hasta` (AAAA-MM-DD) - ej: `2021-04-01`

### 28.2 `GET {{url}}/venta/detalle/:id`
- **Auth:** Bearer `{{jwtc}}`

### 28.3 `GET {{url}}/venta/pdf/:id`
- **Auth:** Bearer `{{jwtc}}`

### 28.4 `POST {{url}}/venta/consulta`
- **Auth:** Bearer `{{jwtc}}`
- **Query Params:** `pagina`, `registros`
- **Body (JSON):**
```json
{
  "fecha_desde": "2020-01-01",
  "fecha_hasta": "2020-04-31",
  "numero_desde": 3,
  "numero_hasta": 111,
  "sucursal": [ 1, 4 ],
  "tipo_factura": [ "F" ],
  "idclipro": [ 582660 ]
}
```

### 28.5 `PUT {{url}}/venta/archivar/:id`
- **Auth:** Bearer `{{jwtc}}`

### 28.6 `PUT {{url}}/venta/:id`
- **Auth:** Bearer `{{jwtc}}`
- **Body (JSON):**
```json
{
   "idtipo_operacion": 2,
   "fecha": null,
   "idclipro": 1,
   "cuitclipro": "50000000016",
   "fcncnd": "F",
   "letra": "C",
   "puntoventa": 1,
   "numero": 1,
   "imputaciones": [{ "i": "neto", "a": 0, "v": 1550.00 }],
   "productos": [{ "id": 772500, "u": 7, "fc": 1, "fu": 1550.00, "fa": 21.00 }]
}
```

### 28.7 `DELETE {{url}}/venta/:id`
- **Auth:** Bearer `{{jwtc}}`
