<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Blueprint SaaS de Lealtad en 3 Planes

## Objetivo del documento

Este documento define una propuesta integral para construir una plataforma SaaS de lealtad superior a Loyalz Club, tomando como referencia las capacidades observadas en Loyalz Club y Puntospoint, y extendiéndolas con una arquitectura más escalable, más integrable, más analítica y más orientada a omnicanalidad.[^1][^2]

La oportunidad es clara: Loyalz Club destaca por su rapidez de implementación, tarjetas digitales en wallet, notificaciones push, programa de referidos, múltiples mecánicas promocionales y conectividad por API/webhooks; Puntospoint agrega una capa más robusta de segmentación multivariable, análisis predictivo, consultoría especializada, integración nativa con WhatsApp Business API, métricas emocionales y gamificación.[^2][^1]

La recomendación estratégica es diseñar la nueva SaaS como una plataforma modular con tres niveles comerciales y técnicos — Básico, Intermedio y Avanzado — donde cada plan incremente profundidad funcional, automatización, analítica, personalización, integraciones y capacidades enterprise, sin romper la simplicidad del producto base.[^3][^1][^2]

## Benchmark base

### Loyalz Club

Loyalz Club se posiciona como una plataforma de fidelización rápida para negocios locales, con puesta en marcha ágil, tarjetas digitales en Apple Wallet y Google Wallet, mecánicas como estampas, cashbacks, gift cards, membresías, descuentos y cupones, además de push notifications, segmentación, programa de referidos, secuencias automatizadas e integraciones vía API, webhooks y Zapier.[^1]

También comunica métricas operativas como nuevos vs. viejos clientes, tasa de retención, ingresos, ticket promedio, nivel de lealtad, top clientes, clientes insatisfechos, dispositivos, tarjetas entregadas y perfil de clientes.[^1]

Su fortaleza principal es la simplicidad: permite lanzar un club digital en poco tiempo con foco en comercio local y wallet marketing, pero no enfatiza un motor headless/API-first, modelos predictivos avanzados, campañas omnicanal profundas, WhatsApp nativo, ni una capa fuerte de consultoría o customer success especializado.[^1]

### Puntospoint

Puntospoint plantea una propuesta más robusta y consultiva: combina estrategia, tecnología y datos, declara más de 4 millones de usuarios y promueve programas personalizados por perfil de cliente, experiencias emocionales, métricas de engagement emocional, segmentación inteligente multivariable, análisis predictivo de comportamiento de compra, insights accionables y campañas soportadas por especialistas.[^2]

Además, resalta integración nativa con WhatsApp Business API, conexión con ERP/POS, gamificación, validación de cupones en línea y una implementación lista para usar sin desarrollos eternos.[^2]

Su diferencial central no es solo el software sino el modelo híbrido software + acompañamiento experto, lo que eleva la capacidad de ejecución del cliente y el retorno esperado del programa de lealtad.[^2]

### Gap de mercado a capturar

La nueva SaaS debe combinar la velocidad y usabilidad de Loyalz Club con la profundidad estratégica y analítica de Puntospoint, y además incorporar una base tecnológica desacoplada tipo API-first para integrarse de forma nativa con POS, e-commerce, CRM, ERP, CDP, apps móviles y canales conversacionales.[^3][^1][^2]

En términos prácticos, esto implica construir una plataforma que funcione bien para pymes desde el día 1, pero que también pueda crecer hacia mid-market y enterprise sin rehacerse por completo.[^3][^1][^2]

## Principios de producto

### Producto que debe ganar

La plataforma debe nacer con seis principios rectores:

- Simplicidad operativa para lanzar un programa sin fricción.[^1]
- Omnicanalidad real: tienda física, e-commerce, app, wallet, QR, links y mensajería.[^2][^1]
- Arquitectura modular y API-first para integrarse con stacks existentes.[^3][^1]
- Analítica accionable, no solo dashboards descriptivos.[^2]
- Automatización de marketing ligada al ciclo de vida del cliente.[^1][^2]
- Escalabilidad comercial por planes, sin canibalizar el plan superior.[^1][^2]


### Tesis de diferenciación

La plataforma debe venderse no como “otro sistema de puntos”, sino como una infraestructura de crecimiento para retención, frecuencia, ticket promedio y CLTV, donde la lealtad sea un motor conectado al comportamiento del cliente.[^2][^1]

Eso cambia el posicionamiento desde “tarjeta digital con promociones” hacia “loyalty OS” para marcas, cadenas, retail, restaurantes, wellness, franquicias, e-commerce y negocios con recurrencia.[^3][^1][^2]

## Arquitectura funcional recomendada

La SaaS debe diseñarse por capas funcionales desacopladas, de modo que los planes habiliten o restrinjan capacidades sobre una misma base tecnológica.[^3]

### Núcleo transaccional

Este núcleo administra clientes, wallets, perfiles, earn/redeem, balances, reglas de puntos, expiración, cupones, cashbacks, sellos, membresías y gift cards.[^1]

### Motor de reglas

Debe permitir definir campañas por evento, compra, frecuencia, ticket, categoría, segmento, local, canal, horario y comportamiento. Este motor debe ser configurable por interfaz y también por API para casos complejos.[^3][^1]

### CRM/segmentación

Se requiere una capa de perfiles unificados, tags, atributos personalizados, historial de compras, RFM, afinidad de categorías, valor de vida, score de riesgo y score de activación.[^2]

### Orquestación de campañas

Debe disparar journeys por push, email, SMS y WhatsApp, según eventos del ciclo de vida: registro, primera compra, segunda compra, inactividad, cumpleaños, casi expiración de puntos, upgrade de tier, recuperación de churn y reactivación post-cupón.[^1][^2]

### Analytics y CDP light

La plataforma necesita pasar de dashboards básicos a una capa de cohortes, funnels, retención, redención, incremental lift, CLTV, atribución de campaña, predicción de churn y propensión a compra.[^2]

### Integraciones

Debe haber conectores con POS, Shopify, WooCommerce, VTEX, CRM, ERP, Meta/WhatsApp Business API, Stripe, pasarelas locales, webhooks y APIs públicas.[^3][^1][^2]

### Consola de administración

La administración debe contemplar multi-sucursal, multi-manager, roles/permisos, aprobaciones, auditoría, logs, catálogo de recompensas, fraude, liquidaciones y plantillas de campañas.[^1][^2]

## Estructura comercial de 3 planes

La mejor manera de lanzar la SaaS es con una escalera clara:

- Básico: adquisición rápida de pymes y negocios locales.
- Intermedio: crecimiento para cadenas, franquicias y e-commerce en expansión.
- Avanzado: operación enterprise, omnicanal y orientada a datos.[^2][^1]

El diseño de planes debe seguir la lógica “simple de vender, lógico de usar, difícil de comparar solo por precio”, donde cada plan desbloquea resultados, no solo checkboxes.[^1][^2]

## Plan Básico

### Perfil ideal

Negocios locales, restaurantes, cafeterías, barberías, spas, tiendas independientes, estudios fitness, dark kitchens y pequeños e-commerce que necesitan un programa listo para usar sin integración compleja.[^1]

### Objetivo de negocio

Permitir lanzar un programa en horas o pocos días, capturar base de clientes, activar recompra y comunicar promociones con mínima curva de aprendizaje.[^1]

### Propuesta del plan

Este plan debe competir directamente con Loyalz Club y superarlo en claridad de uso, calidad UX, automatización base y reporting útil para dueños no técnicos.[^1]

### Funcionalidades del plan Básico

#### Motor de programa

- Tarjeta digital wallet y versión web del perfil del cliente.[^1]
- Registro con QR, landing rápida o formulario embebible.[^1]
- Puntos básicos por compra.
- Sellos / estampas.
- Cashback simple.
- Cupones de bienvenida y cumpleaños.[^1]
- Membresía simple opcional.
- Referidos básicos con premio fijo.[^1]


#### Customer data

- Base de clientes unificada.
- Campos básicos: nombre, mail, teléfono, cumpleaños, sucursal favorita.
- Historial de visitas / compras manual o integrado liviano.
- Etiquetas manuales y segmentos simples: nuevos, recurrentes, inactivos, top compradores.[^1]


#### Comunicación

- Push notifications.[^1]
- Email transaccional básico.
- Plantillas preconfiguradas para bienvenida, recompensa alcanzada, cumpleaños e inactividad.


#### Dashboard

- Nuevos clientes.
- Clientes recurrentes.
- Tasa de retención básica.[^1]
- Ticket promedio.[^1]
- Redenciones.
- Ventas generadas por campaña.
- Ranking de clientes.[^1]


#### Admin

- 1 a 3 sucursales.
- 1 a 5 managers.
- Roles simples: admin / staff.
- Catálogo de recompensas base.
- Scanner web para validar beneficios o asignar puntos.[^1]


#### Integraciones

- CSV import/export.
- Webhooks básicos.
- API básica para alta de clientes, emisión de puntos y redenciones.[^1]
- Stripe/pasarela básica para membresías o gift cards.[^1]


### Diferenciales que conviene agregar incluso en Básico

- Constructor visual de campañas simples con asistente de onboarding.
- Benchmark interno: “tu retención está arriba/abajo del promedio de tu categoría”.
- Dashboard de salud del programa con semáforo: captación, activación, redención, recurrencia.
- Biblioteca de campañas “1 click” por industria: café, restaurant, salon, gym, retail local.


### Lo que NO debería incluir en Básico

- Omnicanalidad completa.
- Reglas avanzadas multi-condición.
- Predicción de churn o CLTV.
- WhatsApp Business nativo.
- Segmentación por comportamiento profundo.
- Multiempresa y capacidades enterprise.


## Plan Intermedio

### Perfil ideal

Cadenas medianas, franquicias, grupos de restaurantes, retail regional, clínicas, wellness chains y e-commerce con necesidad de integración y automatización más sofisticada.[^2][^1]

### Objetivo de negocio

Pasar de un programa táctico a un sistema de crecimiento recurrente que conecte tiendas, clientes, campañas y segmentos con mayor precisión.[^2]

### Propuesta del plan

Este plan debe ser el corazón comercial de la plataforma. Debe resolver el dolor del negocio que ya valida el loyalty, pero necesita más personalización, más automatización y más visibilidad de desempeño por canal, sucursal o segmento.[^2]

### Funcionalidades del plan Intermedio

#### Programa y reglas

- Todo lo del plan Básico.
- Reglas avanzadas por categoría, ticket, frecuencia, día/hora, local y canal.
- Multiplicadores de puntos por campaña.
- Tiers / niveles VIP con beneficios dinámicos.
- Misiones y retos simples.
- Bundles de recompensas y cupones inteligentes.
- Gift cards mejoradas y saldo promocional.
- Membresías recurrentes con perks variables.[^1]


#### Segmentación y datos

- Segmentación multivariable.[^2]
- RFM automático.
- Segmentos dinámicos por comportamiento.
- Afinidad por categoría/producto.
- Detección de clientes en riesgo de abandono basada en reglas heurísticas.
- CLTV estimado no predictivo o semi-predictivo.
- Perfiles enriquecidos con eventos y atributos custom.


#### Comunicación y journeys

- Push + email + SMS.[^2]
- Journeys automáticos visuales.
- Triggers: primera compra, segunda compra, upgrade de tier, inactividad por días, puntos por vencer, aniversario, recuperación de carrito o visita sin compra.
- A/B testing de mensajes y campañas.
- Calendario de campañas por sucursal o marca.


#### Integraciones

- POS connectors prioritarios.
- Shopify, WooCommerce y VTEX.[^2]
- Webhooks completos.
- API pública documentada.
- Integraciones con CRM/ERP seleccionados.
- Integración con Meta Ads / audiencias como opcional futuro.


#### Analytics

- Dashboard por sucursal / canal / segmento.
- Cohortes de retención.
- Tasa de redención por campaña.
- Lift de recompra post-campaña.
- Conversión de referidos.
- Revenue attribution básico de campañas.
- Vista comparativa entre locales.


#### Operación

- Multi-sucursal amplia.
- Multi-manager con permisos granulares.
- Auditoría de cambios.
- Aprobaciones de campañas.
- Centro de soporte y playbooks por industria.


### Diferenciales clave del plan Intermedio

- WhatsApp como addon premium o beta controlada, porque el mercado latino lo valora mucho y Puntospoint lo posiciona con fuerza.[^2]
- Gamificación ligera pero útil: retos, streaks, badges, meta mensual, progreso visual.[^2]
- Catálogo de promociones inteligentes según segmento y propensión.
- API suficientemente buena para partners e integradores.


### Resultado esperado del plan Intermedio

Este plan debe convertir a la plataforma en una pieza central del stack comercial del cliente, no solo en una herramienta de promociones.[^3][^2]

## Plan Avanzado

### Perfil ideal

Enterprise retail, marcas con omnicanalidad, franquicias grandes, grupos multiunidad, e-commerce con alto volumen, marketplaces verticales, fintech loyalty, telco y organizaciones con equipos de data/marketing más sofisticados.[^3][^2]

### Objetivo de negocio

Ofrecer una infraestructura de loyalty enterprise con arquitectura flexible, datos centralizados, campañas complejas y capacidades predictivas, de modo que la plataforma pueda competir no solo con SaaS simples sino con suites más profundas.[^3][^2]

### Propuesta del plan

El plan Avanzado debe transformar la plataforma en un “loyalty operating system” con APIs, reglas, gobierno de datos, analítica, automatización avanzada y soporte estratégico premium.[^3][^2]

### Funcionalidades del plan Avanzado

#### Loyalty engine enterprise

- Todo lo del plan Intermedio.
- Motor headless/API-first completo.[^3]
- Múltiples programas por marca, país, unidad o línea de negocio.
- Reglas encadenadas y jerarquizadas.
- Marketplace de recompensas y wallets múltiples.
- Monedero de puntos, saldo promocional, cashback y crédito promocional coexistiendo.
- Motor antifraude para earn/redeem.
- Reglas de aprobación y límites por staff/local.


#### Datos y CDP

- Perfil 360 del cliente.
- Event ingestion en tiempo real.
- Identity resolution básica.
- Customer timeline unificado.
- CLTV predictivo.[^2]
- Churn prediction.[^2]
- Propensión a compra y next best action.
- Recomendaciones de oferta/producto por segmento o cliente.[^2]
- Exportación a data warehouse / BI.


#### Orquestación omnicanal

- Push, email, SMS, WhatsApp Business API nativo.[^2]
- Orquestación por journeys complejos multi-canal.
- Frequency capping.
- Prioridad de canal.
- Templates dinámicos con variables, catálogos y contenido condicional.
- Campañas accionadas por eventos online y offline.


#### Analítica avanzada

- Cohortes avanzadas.
- Incrementalidad e impacto por campaña.
- Medición por canal, sucursal, cohortes y segmentos.
- Alertas automáticas por caída de actividad o anomalías.
- Forecast de redención y costo de pasivos del programa.
- ROI del programa y margen por campaña.
- Dashboards ejecutivos y operativos diferenciados.


#### Integraciones y ecosistema

- API pública completa con scopes y rate limits.[^3]
- SDKs y documentación para partners.
- SSO, SCIM, auditoría, logs y compliance.
- Integraciones con ERP, CRM, e-commerce, CDP, BI, call center y plataformas de tickets.
- Webhooks avanzados y event bus.


#### Servicio premium

- Customer success dedicado.
- Equipo de estrategia de loyalty opcional, inspirado en el valor consultivo que Puntospoint hace visible en su propuesta.[^2]
- Workshops trimestrales de optimización.
- QBRs, benchmarking y recomendaciones accionables.


### Diferenciales decisivos del plan Avanzado

- Arquitectura verdaderamente embebible en apps propias y experiencias externas.[^3]
- IA aplicada a segmentación, recomendaciones y priorización de campañas, siguiendo la línea de “evolución dinámica con herramientas de IA” que Puntospoint comunica.[^2]
- Gobierno de datos, seguridad y escalabilidad para cuentas grandes.


## Matriz de funcionalidades por plan

| Módulo | Básico | Intermedio | Avanzado |
| :-- | :-- | :-- | :-- |
| Tarjetas wallet | Sí | Sí | Sí |
| Puntos/sellos/cupones | Sí | Sí | Sí |
| Cashback/gift cards/membresías | Sí, base | Sí, ampliado | Sí, avanzado |
| Referidos | Sí, base | Sí, optimizable | Sí, multicanal |
| Tiers VIP | No | Sí | Sí |
| Gamificación | Muy básica | Sí | Sí, avanzada |
| Segmentación manual | Sí | Sí | Sí |
| Segmentación dinámica | Limitada | Sí | Sí |
| Segmentación multivariable | No | Sí | Sí |
| Push | Sí | Sí | Sí |
| Email | Básico | Sí | Sí |
| SMS | No | Sí | Sí |
| WhatsApp Business API | No | Add-on / beta | Sí nativo |
| Cohortes | No | Sí | Sí avanzada |
| Predictivo churn / CLTV | No | Parcial | Sí |
| API pública | Básica | Sí | Sí avanzada |
| Webhooks | Básicos | Sí | Sí |
| POS / e-commerce connectors | Limitados | Sí | Sí ampliados |
| Multi-sucursal | Limitado | Sí | Sí enterprise |
| Roles granulares | No | Sí | Sí |
| Auditoría | No | Sí | Sí avanzada |
| SSO / compliance | No | No | Sí |
| Customer success dedicado | No | Opcional | Sí |

## Roadmap de implementación sugerido

### Fase 1: MVP comercializable

La primera fase debe enfocarse en vender rápido y probar activación y retención del producto.[^1]

Alcance recomendado:

- Plan Básico completo.
- Infraestructura central de clientes, wallets, earn/redeem, campañas simples y dashboard base.
- API básica y webhooks.
- Roles mínimos y soporte multi-sucursal limitado.
- Biblioteca de campañas por vertical.


### Fase 2: Escalamiento mid-market

La segunda fase debe habilitar el plan Intermedio y abrir el canal de revenue más sólido.[^2]

Alcance recomendado:

- Motor de reglas avanzado.
- Segmentación dinámica y RFM.
- Journeys visuales.
- Integraciones POS/e-commerce priorizadas.
- Cohortes, atribución básica y comparativa entre sucursales.
- Gamificación ligera.


### Fase 3: Plataforma enterprise

La tercera fase debe convertir la solución en infraestructura de loyalty escalable.[^3][^2]

Alcance recomendado:

- Arquitectura API-first/headless.[^3]
- WhatsApp nativo.[^2]
- Predictivos, next best action y modelos de riesgo.[^2]
- SSO, compliance, event bus y SDKs.
- Equipo consultivo premium.


## Módulos técnicos recomendados

### Backoffice

- Dashboard ejecutivo.
- Dashboard por sucursal.
- Constructor de campañas.
- Constructor de segmentos.
- Catálogo de recompensas.
- Gestión de usuarios, roles y permisos.
- Centro de integraciones.
- Analytics lab.


### Front del cliente final

- Wallet pass.
- Web app ligera para ver puntos, recompensas, historial y retos.
- Landing embebible para registro.
- Experiencias especiales para referidos, cupones y campañas.


### Core técnico

- Servicio de identidad del cliente.
- Servicio de loyalty ledger.
- Servicio de campañas / journeys.
- Servicio de comunicaciones.
- Servicio de analytics/events.
- API gateway.
- Webhooks/event bus.
- Servicio antifraude.


## Recomendaciones de pricing y empaque

La estructura de planes no debe basarse solo en cantidad de locales o managers, como ocurre en enfoques más simples, sino en valor funcional y complejidad de operación.[^1]

Una propuesta sólida sería:

- Básico: precio accesible, orientado a volumen de pymes, con límites por contactos, locales y campañas activas.
- Intermedio: precio por sucursal o por MAU/contactos activos, con integraciones, journeys y analítica avanzada.
- Avanzado: contrato custom, onboarding pagado, fee de plataforma + volumen de eventos/contactos + servicios premium.


## Funcionalidades prioritarias para “arrasar” a Loyalz

Para superar claramente a Loyalz Club, las cinco apuestas prioritarias deberían ser:

1. Omnicanalidad real con WhatsApp, email, SMS, push y wallet.[^2][^1]
2. Segmentación dinámica y analítica predictiva, no solo reporting descriptivo.[^2]
3. API-first y conectores nativos para POS/e-commerce/CRM.[^3][^1][^2]
4. Gamificación y journeys más sofisticados.[^2]
5. Customer success consultivo y playbooks por industria.[^2]

## Riesgos de producto a evitar

- Hacer un producto demasiado enterprise desde el inicio y perder velocidad de adopción.
- Construir demasiadas mecánicas promocionales sin un modelo claro de medición de impacto.
- Ofrecer demasiada flexibilidad sin templates guiados.
- Depender solo de wallet/push cuando el mercado latino responde muy bien a WhatsApp.[^1][^2]
- No diseñar la data model desde el inicio para omnicanalidad y eventos en tiempo real.[^3][^2]


## Recomendación final de producto

La mejor estrategia es construir una plataforma con ADN self-serve en la entrada, músculo de automatización en el middle market y arquitectura API-first consultiva en enterprise. Esa combinación toma la simplicidad y velocidad de Loyalz Club, la profundidad de datos y servicio de Puntospoint, y la convierte en una plataforma de loyalty preparada para escalar comercial y técnicamente.[^3][^1][^2]

En la práctica, el plan Básico debe vender implementación rápida; el Intermedio debe vender crecimiento con automatización; y el Avanzado debe vender control, omnicanalidad y ciencia de datos aplicada a retención.[^3][^1][^2]

<div align="center">⁂</div>

[^1]: https://loyalzclub.com

[^2]: https://www.puntospoint.com

[^3]: https://www.openloyalty.io/insider/how-to-integrate-an-api-first-loyalty-engine-with-your-tech-stack

