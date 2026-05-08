export const PRIORITIES = {
    1: { label: 'Crítica', color: '#E44258', icon: '▲' },
    2: { label: 'Alta', color: '#FDAB3D', icon: '●' },
    3: { label: 'Media', color: '#4A6CF7', icon: '▸' },
    4: { label: 'Baja', color: '#C4C4C4', icon: '○' },
};

export const PROJECT_TYPES = {
    saas: 'SaaS',
    idea: 'Idea',
    negocio: 'Negocio',
    cliente: 'Cliente',
    interno: 'Interno',
};

export const PMI_PHASES = {
    0: 'Inicio',
    1: 'Planificación',
    2: 'Ejecución',
    3: 'Monitoreo',
    4: 'Cierre',
};

export const PHASE_TASKS = {
    0: ['Definir objetivo del proyecto', 'Identificar stakeholders', 'Evaluar viabilidad inicial', 'Documentar idea principal'],
    1: ['Definir alcance detallado', 'Crear cronograma', 'Estimar presupuesto', 'Identificar riesgos', 'Definir métricas de éxito'],
    2: ['Configurar ambiente de trabajo', 'Ejecutar entregables principales', 'Gestionar equipo/recursos', 'Reportar avance semanal'],
    3: ['Revisar métricas vs plan', 'Ajustar cronograma si necesario', 'Documentar lecciones aprendidas', 'Validar calidad de entregables'],
    4: ['Entrega final al cliente/usuario', 'Documentación completa', 'Retrospectiva del proyecto', 'Archivar proyecto'],
};

export const TASK_CATEGORIES = {
    personal: 'Personal',
    admin: 'Admin',
    cliente: 'Cliente',
    desarrollo: 'Desarrollo',
    soporte: 'Soporte',
};

export const QUADRANTS = {
    q1: { label: 'Hacer primero', color: '#00CA72' },
    q2: { label: 'Planificar', color: '#4A6CF7' },
    q3: { label: 'Delegar', color: '#FDAB3D' },
    q4: { label: 'Evitar', color: '#C4C4C4' },
};

export const PROJECT_COLORS = [
    '#1D9E75', '#185FA5', '#BA7517', '#993556', '#4A6CF7',
    '#9B59B6', '#E67E22', '#2ECC71', '#E74C3C', '#1ABC9C',
];
