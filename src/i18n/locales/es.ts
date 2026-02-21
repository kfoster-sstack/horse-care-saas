const es = {
  // Common
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    close: 'Cerrar',
    confirm: 'Confirmar',
    back: 'Atrás',
    next: 'Siguiente',
    done: 'Hecho',
    search: 'Buscar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    yes: 'Sí',
    no: 'No',
    ok: 'OK',
    task: 'tarea',
    tasks: 'tareas',
  },

  // Navigation / Tab Bar
  nav: {
    home: 'Inicio',
    horses: 'Caballos',
    calendar: 'Calendario',
    messages: 'Mensajes',
    settings: 'Ajustes',
  },

  // Home Page
  home: {
    greeting: {
      morning: 'Buenos días',
      afternoon: 'Buenas tardes',
      evening: 'Buenas noches',
    },
    assignedToYou: 'Asignadas a Ti',
    todaysTasks: 'Tareas de Hoy',
    allTodaysTasks: 'Todas las Tareas de Hoy',
    noTasksAssigned: 'No tienes tareas asignadas. ¡Consulta con tu equipo!',
    noTasksToday: 'No hay tareas para hoy. ¡Excelente trabajo!',
    horsesNeedingAttention: 'Caballos que Requieren Atención',
    recentActivity: 'Actividad Reciente',
  },

  // Quick Actions
  quickActions: {
    title: 'Acciones Rápidas',
    logCare: 'Registrar Cuidado',
    addReminder: 'Agregar Recordatorio',
    viewHorses: 'Ver Caballos',
    viewCalendar: 'Ver Calendario',
  },

  // Horses
  horses: {
    title: 'Caballos',
    addHorse: 'Agregar Caballo',
    noHorses: 'No hay caballos aún. ¡Agrega tu primer caballo!',
    stallLocation: 'Pesebrera {{location}}',
    alerts: '{{count}} alertas',
    gender: {
      mare: 'Yegua',
      gelding: 'Castrado',
      stallion: 'Semental',
    },
    tabs: {
      overview: 'Resumen',
      medical: 'Médico',
      documents: 'Documentos',
      careLog: 'Registro de Cuidados',
    },
    profile: {
      basicInfo: 'Información Básica',
      breed: 'Raza',
      color: 'Color',
      birthDate: 'Fecha de Nacimiento',
      age: 'Edad',
      feedingSchedule: 'Horario de Alimentación',
      feedingsPerDay: '{{count}} comidas por día',
      feedType: 'Tipo de Alimento',
      emergencyContacts: 'Contactos de Emergencia',
      allergies: 'Alergias',
      medications: 'Medicamentos',
      specialNeeds: 'Necesidades Especiales',
      notes: 'Notas',
    },
  },

  // Calendar
  calendar: {
    title: 'Calendario',
    today: 'Hoy',
    noEvents: 'No hay eventos este día',
    addEvent: 'Agregar Evento',
    eventTypes: {
      vet_visit: 'Visita Veterinaria',
      farrier: 'Herrador',
      lesson: 'Clase',
      show: 'Competencia',
      vaccination: 'Vacunación',
      other: 'Otro',
    },
  },

  // Care Logging
  careLog: {
    title: 'Registrar Cuidado',
    selectActivity: 'Seleccionar Tipo de Actividad',
    activityTypes: {
      feeding: 'Alimentación',
      turnout: 'Salida a Potrero',
      blanketing: 'Manta',
      medication: 'Medicación',
      exercise: 'Ejercicio',
      grooming: 'Aseo',
      health_check: 'Chequeo de Salud',
      farrier: 'Herrador',
      vet_visit: 'Visita Veterinaria',
      other: 'Otro',
    },
    fields: {
      date: 'Fecha',
      time: 'Hora',
      notes: 'Notas',
      addPhotos: 'Agregar Fotos',
    },
    feeding: {
      mealType: 'Tipo de Comida',
      breakfast: 'Desayuno',
      lunch: 'Almuerzo',
      dinner: 'Cena',
      feedType: 'Tipo de Alimento',
      hay: 'Heno',
      grain: 'Grano',
      supplements: 'Suplementos',
      quantity: 'Cantidad',
      waterChecked: 'Agua Revisada',
    },
    turnout: {
      duration: 'Duración',
      location: 'Ubicación',
      solo: 'Salida Individual',
      withOthers: 'Con Otros Caballos',
    },
    medication: {
      name: 'Nombre del Medicamento',
      dosage: 'Dosis',
      method: 'Método de Administración',
      oral: 'Oral',
      injection: 'Inyección',
      topical: 'Tópico',
    },
    exercise: {
      type: 'Tipo de Ejercicio',
      riding: 'Monta',
      lunging: 'Trabajo a la Cuerda',
      groundwork: 'Trabajo en Piso',
      walking: 'Caminata',
      duration: 'Duración',
      intensity: 'Intensidad',
      light: 'Ligera',
      moderate: 'Moderada',
      intense: 'Intensa',
    },
    grooming: {
      activities: 'Actividades de Aseo',
      brushing: 'Cepillado',
      hoof_pick: 'Limpieza de Cascos',
      mane_detangle: 'Desenredar Crin',
      tail_detangle: 'Desenredar Cola',
      bathing: 'Baño',
    },
  },

  // Reminders
  reminders: {
    title: 'Recordatorios',
    addReminder: 'Agregar Recordatorio',
    noReminders: 'No hay recordatorios. ¡Crea uno para mantenerte al día con el cuidado!',
    dueToday: 'Vence Hoy',
    upcoming: 'Próximos',
    overdue: 'Vencidos',
    completed: 'Completados',
    markComplete: 'Marcar como Completo',
    priority: {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
    },
    repeat: {
      never: 'Nunca',
      daily: 'Diario',
      weekly: 'Semanal',
      biweekly: 'Quincenal',
      monthly: 'Mensual',
      quarterly: 'Trimestral',
      biannually: 'Semestral',
      yearly: 'Anual',
    },
    types: {
      vaccination: 'Vacunación',
      farrier: 'Herrador',
      vet_checkup: 'Chequeo Veterinario',
      dental: 'Dental',
      deworming: 'Desparasitación',
      feeding: 'Alimentación',
      medication: 'Medicación',
      exercise: 'Ejercicio',
      grooming: 'Aseo',
      supplement: 'Suplemento',
      coggins: 'Coggins',
      other: 'Otro',
    },
    leadTime: {
      none: 'Ninguno',
      '15min': '15 minutos antes',
      '1hour': '1 hora antes',
      '1day': '1 día antes',
      '3days': '3 días antes',
      '1week': '1 semana antes',
      '2weeks': '2 semanas antes',
    },
  },

  // Documents
  documents: {
    title: 'Documentos',
    upload: 'Subir Documento',
    noDocuments: 'No hay documentos aún',
    categories: {
      health_records: 'Registros de Salud',
      registration: 'Registro',
      contracts: 'Contratos',
      insurance: 'Seguro',
      photos: 'Fotos',
      coggins: 'Coggins',
      other: 'Otro',
    },
    expires: 'Vence el {{date}}',
    expired: 'Vencido',
    validForTravel: 'Válido para viajar',
  },

  // Settings
  settings: {
    title: 'Ajustes',

    // Team Management
    teamManagement: {
      title: 'Gestión de Equipo',
      inviteMember: 'Invitar Miembro',
      members: 'Miembros',
      pendingInvites: 'Invitaciones Pendientes',
      noTeamMembers: 'No hay miembros del equipo aún',
      removeMember: 'Eliminar Miembro',
      changeRole: 'Cambiar Rol',
      assignHorses: 'Asignar Caballos',
      subscriptionInfo: '{{current}}/{{max}} miembros del equipo',
      upgradeToInvite: 'Actualiza para invitar más miembros',
    },

    // Account Section
    account: {
      title: 'Cuenta',
      profileInfo: 'Información del Perfil',
      subscription: 'Suscripción',
    },

    // User Mode Section
    userMode: {
      title: 'Modo de Usuario',
      standard: 'Estándar',
      standardDesc: 'Acceso completo para gestionar tus caballos y establo',
      trainer: 'Modo Entrenador',
      trainerDesc: 'Conecta con múltiples negocios/establos',
      staff: 'Personal/Empleado',
      staffDesc: 'Acceso limitado según lo asignado por el propietario del negocio',
      boarder: 'Pensionista/Propietario de Caballo',
      boarderDesc: 'Ver tus caballos y comunicarte con el personal del establo',
      currentMode: 'Modo Actual',
      switchMode: 'Cambiar Modo',
      trainerModeEnabled: 'Modo Entrenador Activado',
      staffModeEnabled: 'Modo Personal Activado',
      linkedBusinesses: 'Negocios Vinculados',
      addBusiness: 'Agregar Negocio',
      removeBusiness: 'Eliminar',
      noLinkedBusinesses: 'No hay negocios vinculados aún',
      enterBusinessCode: 'Ingresa el código del negocio para vincular',
      businessCode: 'Código del Negocio',
      linkBusiness: 'Vincular Negocio',
      yourBusinessCode: 'Tu Código de Negocio',
      shareCode: 'Comparte este código con entrenadores o personal',
      staffRestrictions: 'Las cuentas de personal solo pueden acceder a un negocio por correo',
      ownerFeatures: 'Las funciones del propietario del negocio estarán ocultas en Modo Personal',
    },

    // Preferences Section
    preferences: {
      title: 'Preferencias',
      darkMode: 'Modo Oscuro',
      language: 'Idioma',
      languageEnglish: 'Inglés (English)',
      languageSpanish: 'Español',
      units: 'Unidades',
      imperial: 'Imperial (lbs, in)',
      metric: 'Métrico (kg, cm)',
    },

    // Notifications Section
    notifications: {
      title: 'Notificaciones',
      allNotifications: 'Todas las Notificaciones',
      emailNotifications: 'Notificaciones por Correo',
      pushNotifications: 'Notificaciones Push',
    },

    // Data & Sync Section
    dataSync: {
      title: 'Datos y Sincronización',
      lastSynced: 'Última Sincronización',
      minutesAgo: 'hace {{count}} minutos',
      clearCache: 'Borrar Caché',
    },

    // Help & Support Section
    helpSupport: {
      title: 'Ayuda y Soporte',
      helpCenter: 'Centro de Ayuda',
      contactSupport: 'Contactar Soporte',
      reportBug: 'Reportar un Error',
    },

    // About Section
    about: {
      title: 'Acerca de',
      version: 'Versión',
      termsOfService: 'Términos de Servicio',
      privacyPolicy: 'Política de Privacidad',
    },

    // Account Actions Section
    accountActions: {
      title: 'Acciones de Cuenta',
      signOut: 'Cerrar Sesión',
      deleteAccount: 'Eliminar Cuenta',
      confirmDelete: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
    },
  },

  // Subscription / Plans
  subscription: {
    freePlan: 'Plan Gratuito',
    teamPlan: 'Plan de Equipo',
    businessPlan: 'Plan de Negocio',
    unknownPlan: 'Plan Desconocido',
    upgrade: 'Actualizar',
    upgradeTo: 'Actualizar a {{plan}}',
    currentPlan: 'Plan Actual',
    upgradeMessage: 'Actualiza a Plan de Equipo para invitar miembros y desbloquear funciones de colaboración',
    features: {
      horses: '{{count}} caballos',
      teamMembers: '{{count}} miembros del equipo',
      unlimitedHorses: 'Caballos ilimitados',
      unlimitedTeam: 'Equipo ilimitado',
      cloudSync: 'Sincronización en la nube',
      prioritySupport: 'Soporte prioritario',
      advancedReporting: 'Reportes avanzados',
    },
  },

  // Roles
  roles: {
    owner: 'Propietario',
    manager: 'Gerente',
    staff: 'Personal',
    volunteer: 'Voluntario',
    boarder: 'Pensionista',
  },

  // Status
  status: {
    active: 'Activo',
    pending: 'Pendiente',
    inactive: 'Inactivo',
  },

  // Activity Feed
  activity: {
    title: 'Actividad Reciente',
    noActivity: 'No hay actividad reciente',
    loggedBy: 'Registrado por {{name}}',
    at: 'a las',
  },

  // Task Card
  taskCard: {
    assignedTo: 'Asignado a {{name}}',
    assignedToYou: 'Asignado a ti',
    dueAt: 'Vence a las {{time}}',
    overdue: 'Vencido',
    for: 'para',
  },

  // Forms
  forms: {
    required: 'Requerido',
    optional: 'Opcional',
    selectOption: 'Selecciona una opción',
    enterValue: 'Ingresa un valor',
    email: 'Correo',
    name: 'Nombre',
    phone: 'Teléfono',
    role: 'Rol',
  },

  // Alerts & Messages
  alerts: {
    unsavedChanges: 'Tienes cambios sin guardar. ¿Estás seguro de que deseas salir?',
    confirmAction: '¿Estás seguro de que deseas continuar?',
    operationSuccess: 'Operación completada exitosamente',
    operationFailed: 'Operación fallida. Por favor, intenta de nuevo.',
  },

  // Shop
  shop: {
    title: 'Tienda',
    viewAll: 'Ver Todo',
    addToCart: 'Agregar al Carrito',
    outOfStock: 'Agotado',
    sale: 'Oferta',
    new: 'Nuevo',
    bestseller: 'Más Vendido',
    categories: {
      blankets: 'Mantas',
      fly_protection: 'Protección contra Moscas',
      supplements: 'Suplementos',
      grooming: 'Aseo',
      tack: 'Talabartería',
      health: 'Salud',
      stable: 'Establo',
      apparel: 'Ropa',
    },
  },

  // Emergency Contacts
  emergencyContacts: {
    veterinarian: 'Veterinario',
    farrier: 'Herrador',
    barn_manager: 'Gerente del Establo',
    owner: 'Propietario',
    other: 'Otro',
  },

  // Time/Date
  time: {
    today: 'Hoy',
    yesterday: 'Ayer',
    tomorrow: 'Mañana',
    thisWeek: 'Esta Semana',
    nextWeek: 'Próxima Semana',
    thisMonth: 'Este Mes',
  },
};

export default es;
