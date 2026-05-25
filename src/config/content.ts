// Configuración centralizada del contenido del RETO DE 3 DÍAS - BÁLTICA MVP
// Este archivo permite cambiar fácilmente URLs de media cuando estén disponibles

export interface MediaAsset {
  url: string | null;
  duration: string;
  title?: string;
}

export interface DayContent {
  id: number;
  key: string;
  title: {
    'es-LATAM': string;
    'es-ES': string;
    'en': string;
  };
  subtitle: {
    'es-LATAM': string;
    'es-ES': string;
    'en': string;
  };
  video: MediaAsset;
  audio: MediaAsset;
  pdf: MediaAsset;
  practice: {
    'es-LATAM': string;
    'es-ES': string;
    'en': string;
  };
  audioSection?: {
    category: { 'es-LATAM': string; 'es-ES': string; 'en': string };
    title: { 'es-LATAM': string; 'es-ES': string; 'en': string };
    description: { 'es-LATAM': string; 'es-ES': string; 'en': string };
  };
}

// Day 0 extended content: dual videos + PDF (no audio)
export const day0ExtendedContent = {
  welcomeVideo: { url: '/BIENVENIDA.mp4', duration: '2:00', title: 'Bienvenida' } as MediaAsset,
  introVideo: { url: '/INTRODUCCION.mp4', duration: '2:30', title: 'Introducción' } as MediaAsset,
  welcomePdf: { url: '/Bienvenida.pdf', duration: '', title: 'Bienvenida' } as MediaAsset,
  introPdf: { url: '/INTRODUCCIÓN.pdf', duration: '', title: 'Guía de Introducción' } as MediaAsset,
};

// Day 0 (Block 0) base content for backward compat
export const welcomeContent: DayContent = {
  id: 0,
  key: 'welcome',
  title: {
    'es-LATAM': 'Bienvenida e Introducción',
    'es-ES': 'Bienvenida e Introducción',
    'en': 'Welcome & Introduction',
  },
  subtitle: {
    'es-LATAM': 'Hoy conocerás el programa y darás tu primer paso hacia el bienestar',
    'es-ES': 'Hoy conocerás el programa y darás tu primer paso hacia el bienestar',
    'en': 'Today you will learn about the program and take your first step towards wellbeing',
  },
  video: {
    url: null, // No video for Day 0 per PDF spec
    duration: '',
    title: '',
  },
  audio: {
    url: null, // No audio for Day 0 per PDF spec
    duration: '',
    title: '',
  },
  pdf: {
    url: null, // No PDF for Day 0 per PDF spec
    duration: '',
    title: '',
  },
  practice: {
    'es-LATAM': 'Respira profundo 3 veces y recuerda: estás aquí por ti.',
    'es-ES': 'Respira profundo 3 veces y recuerda: estás aquí por ti.',
    'en': 'Take 3 deep breaths and remember: you are here for yourself.',
  },
};

export const day1Content: DayContent = {
  id: 1,
  key: 'day1',
  title: {
    'es-LATAM': 'Día 1: Grounding',
    'es-ES': 'Día 1: Grounding',
    'en': 'Day 1: Grounding',
  },
  subtitle: {
    'es-LATAM': 'Hoy es el primer paso. Estás aquí, y eso ya es un logro.',
    'es-ES': 'Hoy es el primer paso. Estás aquí, y eso ya es un logro.',
    'en': 'Today is the first step. You are here, and that is already an achievement.',
  },
  video: {
    url: '/GROUNDING.mp4',
    duration: '2:30',
    title: 'Reflexión del día 1',
  },
  audio: {
    url: '/Audio Grounding MAESTRO.mp3',
    duration: '5:00',
    title: 'Meditación: Notar y Estar',
  },
  pdf: {
    url: '/GROUNDING día 1.pdf',
    duration: '',
    title: 'Material día 1 - Grounding',
  },
  practice: {
    'es-LATAM': 'Toma 3 respiraciones profundas antes de cada comida hoy.',
    'es-ES': 'Toma 3 respiraciones profundas antes de cada comida hoy.',
    'en': 'Take 3 deep breaths before each meal today.',
  },
  audioSection: {
    category: {
      'es-LATAM': 'Tu pausa diaria',
      'es-ES': 'Tu pausa diaria',
      'en': 'Your daily pause',
    },
    title: {
      'es-LATAM': 'Meditación: Notar y Estar',
      'es-ES': 'Meditación: Notar y Estar',
      'en': 'Meditation: Notice and Be',
    },
    description: {
      'es-LATAM': 'Un espacio breve para soltar la prisa y conectar con tu respiración.',
      'es-ES': 'Un espacio breve para soltar la prisa y conectar con tu respiración.',
      'en': 'A brief space to let go of hurry and connect with your breath.',
    },
  },
};

export const day2Content: DayContent = {
  id: 2,
  key: 'day2',
  title: {
    'es-LATAM': 'Día 2: Acción con Propósito',
    'es-ES': 'Día 2: Acción con Propósito',
    'en': 'Day 2: Purposeful Action',
  },
  subtitle: {
    'es-LATAM': 'Hoy conectamos lo que haces con lo que importa.',
    'es-ES': 'Hoy conectamos lo que haces con lo que importa.',
    'en': 'Today we connect what you do with what matters.',
  },
  video: {
    url: '/Accion con Proposito.mp4',
    duration: '2:30',
    title: 'Reflexión del día 2',
  },
  audio: {
    url: '/Audios AconP MAESTRO.mp3',
    duration: '5:00',
    title: 'Audio: Habitar el cuerpo',
  },
  pdf: {
    url: '/AUTOCUIDADO día 2.pdf',
    duration: '',
    title: 'Guía de Bienvenida: Calma y Foco',
  },
  practice: {
    'es-LATAM': 'Realiza una acción pequeña alineada con tu valor elegido.',
    'es-ES': 'Realiza una acción pequeña alineada con tu valor elegido.',
    'en': 'Perform a small action aligned with your chosen value.',
  },
  audioSection: {
    category: {
      'es-LATAM': 'Momento de calma',
      'es-ES': 'Momento de calma',
      'en': 'Moment of calm',
    },
    title: {
      'es-LATAM': 'Audio: Habitar el cuerpo',
      'es-ES': 'Audio: Habitar el cuerpo',
      'en': 'Audio: Inhabit the body',
    },
    description: {
      'es-LATAM': 'Relaja la mente mientras le das a tu cuerpo el descanso que necesita hoy.',
      'es-ES': 'Relaja la mente mientras le das a tu cuerpo el descanso que necesita hoy.',
      'en': 'Relax the mind while giving your body the rest it needs today.',
    },
  },
};

export const day3Content: DayContent = {
  id: 3,
  key: 'day3',
  title: {
    'es-LATAM': 'Día 3: Autocompasión',
    'es-ES': 'Día 3: Autocompasión',
    'en': 'Day 3: Self-Compassion',
  },
  subtitle: {
    'es-LATAM': 'Llegaste hasta aquí. Eso dice mucho de ti.',
    'es-ES': 'Llegaste hasta aquí. Eso dice mucho de ti.',
    'en': 'You made it this far. That says a lot about you.',
  },
  video: {
    url: '/Autocompasion.mp4',
    duration: '2:00',
    title: 'Cierre del programa',
  },
  audio: {
    url: '/Audio Autocompasión MAESTRO.mp3',
    duration: '5:00',
    title: 'Práctica: Soltar y Renovar',
  },
  pdf: {
    url: '/AUTOCOMPASION día 3.pdf',
    duration: '',
    title: 'Material día 3',
  },
  practice: {
    'es-LATAM': 'Este es el comienzo de una relación más amable contigo.',
    'es-ES': 'Este es el comienzo de una relación más amable contigo.',
    'en': 'Write yourself a kind phrase and remember it throughout the day.',
  },
  audioSection: {
    category: {
      'es-LATAM': 'Espacio de bienestar',
      'es-ES': 'Espacio de bienestar',
      'en': 'Wellbeing space',
    },
    title: {
      'es-LATAM': 'Práctica: Soltar y Renovar',
      'es-ES': 'Práctica: Soltar y Renovar',
      'en': 'Practice: Release and Renew',
    },
    description: {
      'es-LATAM': 'Concluye este viaje con una guía diseñada para llevar la calma contigo a todas partes.',
      'es-ES': 'Concluye este viaje con una guía diseñada para llevar la calma contigo a todas partes.',
      'en': 'Conclude this journey with a guide designed to carry calm with you everywhere.',
    },
  },
};

// Objeto para acceso fácil por número de día
export const dayContents: Record<number, DayContent> = {
  0: welcomeContent,
  1: day1Content,
  2: day2Content,
  3: day3Content,
};

// Opciones de valores para Día 2
export const valueOptions = {
  'es-LATAM': [
    { value: 'paz', label: 'Paz' },
    { value: 'conexion', label: 'Conexión' },
    { value: 'creatividad', label: 'Creatividad' },
    { value: 'salud', label: 'Salud' },
    { value: 'familia', label: 'Familia' },
    { value: 'crecimiento', label: 'Crecimiento' },
  ],
  'es-ES': [
    { value: 'paz', label: 'Paz' },
    { value: 'conexion', label: 'Conexión' },
    { value: 'creatividad', label: 'Creatividad' },
    { value: 'salud', label: 'Salud' },
    { value: 'familia', label: 'Familia' },
    { value: 'crecimiento', label: 'Crecimiento' },
  ],
  'en': [
    { value: 'peace', label: 'Peace' },
    { value: 'connection', label: 'Connection' },
    { value: 'creativity', label: 'Creativity' },
    { value: 'health', label: 'Health' },
    { value: 'family', label: 'Family' },
    { value: 'growth', label: 'Growth' },
  ],
};

// Opciones de acciones para Día 1
export const actionOptions = {
  'es-LATAM': [
    { value: 'breathing', label: 'Tomar 3 respiraciones profundas antes de cada comida' },
    { value: 'walking', label: 'Caminar 5 minutos en silencio' },
    { value: 'gratitude', label: 'Escribir una cosa por la que estoy agradecido/a' },
  ],
  'es-ES': [
    { value: 'breathing', label: 'Tomar 3 respiraciones profundas antes de cada comida' },
    { value: 'walking', label: 'Caminar 5 minutos en silencio' },
    { value: 'gratitude', label: 'Escribir una cosa por la que estoy agradecido/a' },
  ],
  'en': [
    { value: 'breathing', label: 'Take 3 deep breaths before each meal' },
    { value: 'walking', label: 'Walk 5 minutes in silence' },
    { value: 'gratitude', label: 'Write one thing I am grateful for' },
  ],
};

// Opciones de franja horaria
export const timeSlotOptions = {
  'es-LATAM': [
    { value: 'morning', label: 'Por la mañana' },
    { value: 'afternoon', label: 'Por la tarde' },
    { value: 'evening', label: 'Por la noche' },
  ],
  'es-ES': [
    { value: 'morning', label: 'Por la mañana' },
    { value: 'afternoon', label: 'Por la tarde' },
    { value: 'evening', label: 'Por la noche' },
  ],
  'en': [
    { value: 'morning', label: 'In the morning' },
    { value: 'afternoon', label: 'In the afternoon' },
    { value: 'evening', label: 'In the evening' },
  ],
};

// Logros del MVP
export interface Achievement {
  id: string;
  icon: string;
  title: {
    'es-LATAM': string;
    'es-ES': string;
    'en': string;
  };
  description: {
    'es-LATAM': string;
    'es-ES': string;
    'en': string;
  };
  condition: (progress: { completedDays: number[]; streak: number }) => boolean;
}

export const achievements: Achievement[] = [
  {
    id: 'first-step',
    icon: '🌱',
    title: {
      'es-LATAM': 'Primer paso',
      'es-ES': 'Primer paso',
      'en': 'First step',
    },
    description: {
      'es-LATAM': 'Diste el primer paso hacia tu bienestar',
      'es-ES': 'Diste el primer paso hacia tu bienestar',
      'en': 'You took the first step towards your wellbeing',
    },
    condition: (p) => p.completedDays.includes(0) && p.completedDays.includes(1),
  },
  {
    id: 'day2-complete',
    icon: '⭐',
    title: {
      'es-LATAM': 'En camino',
      'es-ES': 'En camino',
      'en': 'On the way',
    },
    description: {
      'es-LATAM': 'Completaste el Día 2. ¡Sigue así!',
      'es-ES': 'Completaste el Día 2. ¡Sigue así!',
      'en': 'You completed Day 2. Keep going!',
    },
    condition: (p) => p.completedDays.includes(2),
  },
  {
    id: 'day3-complete',
    icon: '💪',
    title: {
      'es-LATAM': 'Constancia',
      'es-ES': 'Constancia',
      'en': 'Consistency',
    },
    description: {
      'es-LATAM': 'Tres días seguidos. ¡La constancia es clave!',
      'es-ES': 'Tres días seguidos. ¡La constancia es clave!',
      'en': 'Three days in a row. Consistency is key!',
    },
    condition: (p) => p.completedDays.includes(3),
  },
  {
    id: 'program-complete',
    icon: '🏆',
    title: {
      'es-LATAM': 'Reto Completado',
      'es-ES': 'Reto Completado',
      'en': 'Challenge Completed',
    },
    description: {
      'es-LATAM': 'Completaste el programa de 3 días',
      'es-ES': 'Completaste el programa de 3 días',
      'en': 'You completed the 3-day program',
    },
    condition: (p) => p.completedDays.includes(3),
  },
  {
    id: 'streak-3',
    icon: '🔥',
    title: {
      'es-LATAM': '3 días seguidos',
      'es-ES': '3 días seguidos',
      'en': '3-day streak',
    },
    description: {
      'es-LATAM': '¡Tres días sin parar!',
      'es-ES': '¡Tres días sin parar!',
      'en': 'Three days without stopping!',
    },
    condition: (p) => p.streak >= 3,
  },
  {
    id: 'streak-7',
    icon: '🌟',
    title: {
      'es-LATAM': '7 días seguidos',
      'es-ES': '7 días seguidos',
      'en': '7-day streak',
    },
    description: {
      'es-LATAM': 'Una semana completa de dedicación',
      'es-ES': 'Una semana completa de dedicación',
      'en': 'A full week of dedication',
    },
    condition: (p) => p.streak >= 7,
  },
];

// Mock data para historial de actividad
export const mockActivityLogs = [
  {
    id: '1',
    timestamp: '2026-01-27T09:15:00',
    event_type: 'login' as const,
    event_detail: 'Inicio de sesión',
    metadata: { browser: 'Chrome' },
  },
  {
    id: '2',
    timestamp: '2026-01-27T09:16:00',
    event_type: 'day_started' as const,
    event_detail: 'Bienvenida iniciada',
    metadata: { day: 0 },
  },
  {
    id: '3',
    timestamp: '2026-01-27T09:18:00',
    event_type: 'media_started' as const,
    event_detail: 'Video reproducción iniciada',
    metadata: { type: 'video', day: 0 },
  },
  {
    id: '4',
    timestamp: '2026-01-27T09:20:00',
    event_type: 'media_completed' as const,
    event_detail: 'Video reproducción completada',
    metadata: { type: 'video', day: 0 },
  },
  {
    id: '5',
    timestamp: '2026-01-27T09:25:00',
    event_type: 'day_completed' as const,
    event_detail: 'Bienvenida completada',
    metadata: { day: 0 },
  },
  {
    id: '6',
    timestamp: '2026-01-27T09:26:00',
    event_type: 'day_started' as const,
    event_detail: 'Día 1 desbloqueado',
    metadata: { day: 1 },
  },
];
