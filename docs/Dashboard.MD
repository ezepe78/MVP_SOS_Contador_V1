# Documentación Técnica del Dashboard (SOS Contador MVP)

Este documento detalla exhaustivamente cómo se calculan de forma interna los diferentes Indicadores Clave de Rendimiento (KPIs) exhibidos en el componente `DashboardHome.tsx`. 

Toda la información es consolidada en el cliente luego de consultar los endpoints correspondientes de la API (IVA Ventas, IVA Compras, Cobros, Pagos).

---

## 1. Métricas Primarias (Obtenidas Directamente)

Estas métricas representan sumatorias o totales directos extraídos de las respuestas de la API (buscando en campos como `gravado`, `neto`, `iva_total`, `montototal` a nivel raíz de la respuesta, o sumando iterativamente los registros individuales).

*   **Ventas Netas (`ventasNeto`)**: Representa el importe "Gravado" o "Neto" total de las facturas de venta del periodo, sin impuestos.
*   **Compras Netas (`comprasNeto`)**: Representa el importe "Gravado" o "Neto" total de las facturas de compra del periodo, sin impuestos.
*   **Débito Fiscal (`debitoFiscal`)**: El total de impuesto IVA generado por las Ventas.
*   **Crédito Fiscal (`creditoFiscal`)**: El total de impuesto IVA soportado por las Compras.
*   **Ventas Totales (`ventasTotal`)**: El importe bruto total facturado a clientes (Ventas Netas + Débito Fiscal + Otros tributos).
*   **Compras Totales (`comprasTotal`)**: El importe bruto total facturado por proveedores (Compras Netas + Crédito Fiscal + Otros tributos).
*   **Cobros del Mes (`cobrosTotal`)**: Total de dinero ingresado y registrado como cobro en el mes seleccionado.
*   **Pagos del Mes (`pagosTotal`)**: Total de dinero egresado y registrado como pago en el mes seleccionado.

---

## 2. Métricas Derivadas (Calculadas en Cliente)

Estos indicadores se formulan relacionando dos o más de las Métricas Primarias para brindar un análisis rápido del estado comercial o impositivo.

### Posición IVA
Indica el saldo técnico estimado de impuesto al valor agregado para el periodo en curso.
*   **Fórmula:** `Débito Fiscal - Crédito Fiscal`
*   **Interpretación Visual:** 
    *   Si es **positivo (> 0)**, implica un saldo a pagar a la AFIP (se muestra en Rojo).
    *   Si es **negativo (< 0)**, implica un saldo a favor técnico (se muestra en Verde).

### Margen Bruto (Operativo)
Representa qué porcentaje del ingreso neto se retiene después de deducir los costos directos (compras). Es un indicador crucial de rentabilidad base mensual.
*   **Fórmula:** `((Ventas Netas - Compras Netas) / Ventas Netas) * 100`
*   **Condición Especial:** Si `Ventas Netas` es 0, el margen se establece automáticamente en `0%` para evitar dividir por cero.
*   **Interpretación Visual (Semáforo):**
    *   Menor a 15%: **Rojo (Crítico)**
    *   De 15% a 30%: **Amarillo (Alerta)**
    *   Mayor a 30%: **Verde (Saludable)**

### Tasa de Cobranza
Mide la eficiencia y velocidad con la que la empresa está convirtiendo sus facturas de venta en dinero líquido (flujo de caja).
*   **Fórmula:** `(Cobros del Mes / Ventas Totales) * 100`
*   **Condición Especial:** Si `Ventas Totales` es 0, la tasa es `0%`.
*   **Interpretación Visual (Semáforo):**
    *   Menor a 40%: **Rojo (Mala cobrabilidad / Riesgo financiero)**
    *   De 40% a 70%: **Amarillo (Atención)**
    *   Mayor a 70%: **Verde (Buena liquidez)**

---

## 3. Lógica de "Alertas y Recomendaciones" Inteligentes

El sistema dispara advertencias textuales en la interfaz del usuario al detectar anomalías en la correlación de los datos. Se evalúan secuencialmente:

1.  **Posición IVA elevada (Peligro):** Se dispara si hay IVA a pagar y ese monto supera el 20% de las *Ventas Netas*. Sugiere que no se ingresaron suficientes compras o gastos con IVA para descontar o los márgenes de venta fueron inusualmente altos en la relación.
2.  **Cobranza baja (Advertencia):** Se dispara si hubo ventas en el mes, pero la *Tasa de Cobranza* calculada es inferior al 40%.
3.  **Sin cobros registrados (Advertencia):** Se dispara si las *Ventas Totales* > 0, pero los *Cobros del Mes* son exactamente `0`. Indica posible falta de carga administrativa en el módulo de caja/cobranzas.
4.  **Margen operativo bajo (Peligro):** Se dispara si el *Margen Bruto* cae por debajo del 15% (los gastos/compras se "comieron" casi todos los ingresos).
5.  **Pagos pendientes (Advertencia):** Se dispara si las *Compras Totales* > 0, pero los *Pagos del Mes* son exactamente `0`.
6.  **Todo bajo control (Éxito):** Mensaje por defecto cuando ninguno de los umbrales críticos anteriores ha sido transgredido.
