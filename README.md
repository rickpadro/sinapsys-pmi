# SinapSYS Projects

Plataforma personal de gestión de proyectos bajo metodología **PMI**, con tareas, calendario, asistente IA, multiusuario y autenticación OTP.

---

## Gestión de Proyectos

### Creación de proyectos

Cada proyecto captura la información clave para evaluar su viabilidad y priorización:

- **Nombre, tipo y descripción**
- **Fase PMI**: Inicio → Planificación → Ejecución → Monitoreo → Cierre
- **Prioridad**: P1 Crítica / P2 Alta / P3 Media / P4 Baja
- **Impacto y Esfuerzo** (escala 1–10) — base para la Matriz de Prioridad
- **Viabilidad**: mercado, financiero, técnico y riesgo (RadarChart)
- **Tags, color, links y documentos**

Los proyectos también pueden crearse mediante el **Asistente IA** en modo conversacional: describes tu idea y el sistema propone nombre, descripción, fases y tareas iniciales.

---

### Ciclo de vida (fases PMI)

```
Inicio → Planificación → Ejecución → Monitoreo → Cierre
```

Cada fase incluye una **lista de tareas PMI predefinidas** (checklist) que guían al equipo en las actividades estándar de cada etapa. El progreso visual se muestra en la barra de fases en la parte superior de cada proyecto.

---

### Tareas

Dentro de cada proyecto se gestionan tareas con:

- **Prioridad** (P1–P4), **categoría**, **fecha de entrega** y **tiempo estimado**
- **Pasos** — subtareas dentro de una tarea
- **Notas** — criterios de aceptación o contexto
- **Asignación** — asignar tareas a miembros del equipo
- **Estados**: pendiente → en progreso → completada

La **Vista Foco** (`/tasks`) agrupa todas las tareas entre proyectos en secciones: Vencidas, Hoy, Próximas 7 días, Sin fecha y Completadas.

---

### Matriz de Prioridad

La vista `/matrix` muestra todos los proyectos en un **ScatterChart de 4 cuadrantes** según su impacto vs. esfuerzo:

| Cuadrante | Descripción |
|-----------|-------------|
| Alto impacto / Bajo esfuerzo | **Hacer primero** |
| Alto impacto / Alto esfuerzo | **Planificar** |
| Bajo impacto / Bajo esfuerzo | **Delegar** |
| Bajo impacto / Alto esfuerzo | **Eliminar** |

---

### Viabilidad

Cada proyecto tiene un **RadarChart** con 4 dimensiones evaluadas del 1 al 10:
- **Mercado** — demanda y oportunidad
- **Financiero** — retorno y recursos
- **Técnico** — factibilidad de implementación
- **Riesgo** — exposición y mitigación

---

### Equipo y roles

Los proyectos son multiusuario. El propietario puede invitar colaboradores por email con diferentes roles:

| Rol | Acceso |
|-----|--------|
| **Propietario** | Control total del proyecto |
| **Manager** | Edita proyecto, invita miembros, gestiona tareas |
| **Colaborador** | Crea y edita tareas, usa el asistente IA |
| **Observador** | Solo lectura |

La invitación llega por email con un enlace de aceptación. Si el invitado no tiene cuenta, puede registrarse directamente desde el link.

---

### Asistente IA por proyecto

Cada proyecto tiene un **chat con Claude (Anthropic)** que conoce el contexto: nombre, fase, prioridad, impacto, esfuerzo y viabilidad. Sirve para:

- Resolver dudas sobre la metodología PMI
- Obtener recomendaciones sobre el proyecto
- Identificar riesgos y próximos pasos

---

### Calendario

Vista mensual y semanal con todas las tareas de todos los proyectos (propios y de equipo), filtrable por proyecto.

---

### Exportaciones

Exporta tus proyectos y tareas en formato **PDF** o **Excel** desde cualquier vista.

---

## Autenticación

Login mediante **OTP passwordless** (código de 6 dígitos) enviado por:
- 📧 Email (SMTP)
- 📱 SMS (Twilio)

También soporta login con contraseña tradicional.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Laravel 12 + PHP 8.2 |
| Frontend | React 19 + Inertia.js 2 |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Base de datos | MySQL 8 |
| IA | Anthropic Claude API |
| SMS | Twilio |
| Gráficas | Recharts |
| Exports | DomPDF + Laravel Excel |

---

## Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/rickpadro/sinapsys-pmi.git
cd sinapsys-pmi

# Instalar dependencias
composer install
npm install

# Configurar entorno
cp .env.example .env
php artisan key:generate

# Configurar base de datos en .env y migrar
php artisan migrate --seed

# Compilar assets
npm run build

# Servidor de desarrollo
php artisan serve
```

### Variables de entorno requeridas

```env
DB_DATABASE=sinapsys_projects
ANTHROPIC_API_KEY=sk-ant-...
TWILIO_SID=AC...
TWILIO_TOKEN=...
TWILIO_FROM=+1...
MAIL_MAILER=smtp
MAIL_HOST=...
MAIL_USERNAME=...
MAIL_PASSWORD=...
```

---

## Licencia

Proyecto privado — SinapSYS Ecosistemas © 2026
