const en = {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    task: 'task',
    tasks: 'tasks',
  },

  // Navigation / Tab Bar
  nav: {
    home: 'Home',
    horses: 'Horses',
    calendar: 'Calendar',
    messages: 'Messages',
    settings: 'Settings',
  },

  // Home Page
  home: {
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },
    assignedToYou: 'Assigned to You',
    todaysTasks: "Today's Tasks",
    allTodaysTasks: "All Today's Tasks",
    noTasksAssigned: 'No tasks assigned to you. Check with your team!',
    noTasksToday: 'No tasks for today. Great job!',
    horsesNeedingAttention: 'Horses Needing Attention',
    recentActivity: 'Recent Activity',
  },

  // Quick Actions
  quickActions: {
    title: 'Quick Actions',
    logCare: 'Log Care',
    addReminder: 'Add Reminder',
    viewHorses: 'View Horses',
    viewCalendar: 'View Calendar',
  },

  // Horses
  horses: {
    title: 'Horses',
    addHorse: 'Add Horse',
    noHorses: 'No horses yet. Add your first horse!',
    stallLocation: 'Stall {{location}}',
    alerts: '{{count}} alerts',
    gender: {
      mare: 'Mare',
      gelding: 'Gelding',
      stallion: 'Stallion',
    },
    tabs: {
      overview: 'Overview',
      medical: 'Medical',
      documents: 'Documents',
      careLog: 'Care Log',
    },
    profile: {
      basicInfo: 'Basic Information',
      breed: 'Breed',
      color: 'Color',
      birthDate: 'Birth Date',
      age: 'Age',
      feedingSchedule: 'Feeding Schedule',
      feedingsPerDay: '{{count}} feedings per day',
      feedType: 'Feed Type',
      emergencyContacts: 'Emergency Contacts',
      allergies: 'Allergies',
      medications: 'Medications',
      specialNeeds: 'Special Needs',
      notes: 'Notes',
    },
  },

  // Calendar
  calendar: {
    title: 'Calendar',
    today: 'Today',
    noEvents: 'No events on this day',
    addEvent: 'Add Event',
    eventTypes: {
      vet_visit: 'Vet Visit',
      farrier: 'Farrier',
      lesson: 'Lesson',
      show: 'Show',
      vaccination: 'Vaccination',
      other: 'Other',
    },
  },

  // Care Logging
  careLog: {
    title: 'Log Care',
    selectActivity: 'Select Activity Type',
    activityTypes: {
      feeding: 'Feeding',
      turnout: 'Turnout',
      blanketing: 'Blanketing',
      medication: 'Medication',
      exercise: 'Exercise',
      grooming: 'Grooming',
      health_check: 'Health Check',
      farrier: 'Farrier',
      vet_visit: 'Vet Visit',
      other: 'Other',
    },
    fields: {
      date: 'Date',
      time: 'Time',
      notes: 'Notes',
      addPhotos: 'Add Photos',
    },
    feeding: {
      mealType: 'Meal Type',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      feedType: 'Feed Type',
      hay: 'Hay',
      grain: 'Grain',
      supplements: 'Supplements',
      quantity: 'Quantity',
      waterChecked: 'Water Checked',
    },
    turnout: {
      duration: 'Duration',
      location: 'Location',
      solo: 'Solo Turnout',
      withOthers: 'With Other Horses',
    },
    medication: {
      name: 'Medication Name',
      dosage: 'Dosage',
      method: 'Administration Method',
      oral: 'Oral',
      injection: 'Injection',
      topical: 'Topical',
    },
    exercise: {
      type: 'Exercise Type',
      riding: 'Riding',
      lunging: 'Lunging',
      groundwork: 'Groundwork',
      walking: 'Walking',
      duration: 'Duration',
      intensity: 'Intensity',
      light: 'Light',
      moderate: 'Moderate',
      intense: 'Intense',
    },
    grooming: {
      activities: 'Grooming Activities',
      brushing: 'Brushing',
      hoof_pick: 'Hoof Pick',
      mane_detangle: 'Mane Detangle',
      tail_detangle: 'Tail Detangle',
      bathing: 'Bathing',
    },
  },

  // Reminders
  reminders: {
    title: 'Reminders',
    addReminder: 'Add Reminder',
    noReminders: 'No reminders. Create one to stay on top of care!',
    dueToday: 'Due Today',
    upcoming: 'Upcoming',
    overdue: 'Overdue',
    completed: 'Completed',
    markComplete: 'Mark Complete',
    priority: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    },
    repeat: {
      never: 'Never',
      daily: 'Daily',
      weekly: 'Weekly',
      biweekly: 'Biweekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      biannually: 'Biannually',
      yearly: 'Yearly',
    },
    types: {
      vaccination: 'Vaccination',
      farrier: 'Farrier',
      vet_checkup: 'Vet Checkup',
      dental: 'Dental',
      deworming: 'Deworming',
      feeding: 'Feeding',
      medication: 'Medication',
      exercise: 'Exercise',
      grooming: 'Grooming',
      supplement: 'Supplement',
      coggins: 'Coggins',
      other: 'Other',
    },
    leadTime: {
      none: 'None',
      '15min': '15 minutes before',
      '1hour': '1 hour before',
      '1day': '1 day before',
      '3days': '3 days before',
      '1week': '1 week before',
      '2weeks': '2 weeks before',
    },
  },

  // Documents
  documents: {
    title: 'Documents',
    upload: 'Upload Document',
    noDocuments: 'No documents yet',
    categories: {
      health_records: 'Health Records',
      registration: 'Registration',
      contracts: 'Contracts',
      insurance: 'Insurance',
      photos: 'Photos',
      coggins: 'Coggins',
      other: 'Other',
    },
    expires: 'Expires {{date}}',
    expired: 'Expired',
    validForTravel: 'Valid for travel',
  },

  // Settings
  settings: {
    title: 'Settings',

    // Team Management
    teamManagement: {
      title: 'Team Management',
      inviteMember: 'Invite Member',
      members: 'Members',
      pendingInvites: 'Pending Invites',
      noTeamMembers: 'No team members yet',
      removeMember: 'Remove Member',
      changeRole: 'Change Role',
      assignHorses: 'Assign Horses',
      subscriptionInfo: '{{current}}/{{max}} team members',
      upgradeToInvite: 'Upgrade to invite more members',
    },

    // Account Section
    account: {
      title: 'Account',
      profileInfo: 'Profile Information',
      subscription: 'Subscription',
    },

    // User Mode Section
    userMode: {
      title: 'User Mode',
      standard: 'Standard',
      standardDesc: 'Full access to manage your horses and barn',
      trainer: 'Trainer Mode',
      trainerDesc: 'Connect to multiple businesses/barns',
      staff: 'Staff/Employee',
      staffDesc: 'Limited access as assigned by business owner',
      boarder: 'Boarder/Horse Owner',
      boarderDesc: 'View your horses and communicate with barn staff',
      currentMode: 'Current Mode',
      switchMode: 'Switch Mode',
      trainerModeEnabled: 'Trainer Mode Enabled',
      staffModeEnabled: 'Staff Mode Enabled',
      linkedBusinesses: 'Linked Businesses',
      addBusiness: 'Add Business',
      removeBusiness: 'Remove',
      noLinkedBusinesses: 'No linked businesses yet',
      enterBusinessCode: 'Enter business code to link',
      businessCode: 'Business Code',
      linkBusiness: 'Link Business',
      yourBusinessCode: 'Your Business Code',
      shareCode: 'Share this code with trainers or staff',
      staffRestrictions: 'Staff accounts can only access one business per email',
      ownerFeatures: 'Business owner features will be hidden in Staff mode',
    },

    // Preferences Section
    preferences: {
      title: 'Preferences',
      darkMode: 'Dark Mode',
      language: 'Language',
      languageEnglish: 'English',
      languageSpanish: 'Spanish (Español)',
      units: 'Units',
      imperial: 'Imperial (lbs, in)',
      metric: 'Metric (kg, cm)',
    },

    // Notifications Section
    notifications: {
      title: 'Notifications',
      allNotifications: 'All Notifications',
      emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications',
    },

    // Data & Sync Section
    dataSync: {
      title: 'Data & Sync',
      lastSynced: 'Last Synced',
      minutesAgo: '{{count}} minutes ago',
      clearCache: 'Clear Cache',
    },

    // Help & Support Section
    helpSupport: {
      title: 'Help & Support',
      helpCenter: 'Help Center',
      contactSupport: 'Contact Support',
      reportBug: 'Report a Bug',
    },

    // About Section
    about: {
      title: 'About',
      version: 'Version',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
    },

    // Account Actions Section
    accountActions: {
      title: 'Account Actions',
      signOut: 'Sign Out',
      deleteAccount: 'Delete Account',
      confirmDelete: 'Are you sure you want to delete your account? This action cannot be undone.',
    },
  },

  // Subscription / Plans
  subscription: {
    freePlan: 'Free Plan',
    teamPlan: 'Team Plan',
    businessPlan: 'Business Plan',
    unknownPlan: 'Unknown Plan',
    upgrade: 'Upgrade',
    upgradeTo: 'Upgrade to {{plan}}',
    currentPlan: 'Current Plan',
    upgradeMessage: 'Upgrade to Team to invite members and unlock collaboration features',
    features: {
      horses: '{{count}} horses',
      teamMembers: '{{count}} team members',
      unlimitedHorses: 'Unlimited horses',
      unlimitedTeam: 'Unlimited team',
      cloudSync: 'Cloud sync',
      prioritySupport: 'Priority support',
      advancedReporting: 'Advanced reporting',
    },
  },

  // Roles
  roles: {
    owner: 'Owner',
    manager: 'Manager',
    staff: 'Staff',
    volunteer: 'Volunteer',
    boarder: 'Boarder',
  },

  // Status
  status: {
    active: 'Active',
    pending: 'Pending',
    inactive: 'Inactive',
  },

  // Activity Feed
  activity: {
    title: 'Recent Activity',
    noActivity: 'No recent activity',
    loggedBy: 'Logged by {{name}}',
    at: 'at',
  },

  // Task Card
  taskCard: {
    assignedTo: 'Assigned to {{name}}',
    assignedToYou: 'Assigned to you',
    dueAt: 'Due at {{time}}',
    overdue: 'Overdue',
    for: 'for',
  },

  // Forms
  forms: {
    required: 'Required',
    optional: 'Optional',
    selectOption: 'Select an option',
    enterValue: 'Enter a value',
    email: 'Email',
    name: 'Name',
    phone: 'Phone',
    role: 'Role',
  },

  // Alerts & Messages
  alerts: {
    unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
    confirmAction: 'Are you sure you want to continue?',
    operationSuccess: 'Operation completed successfully',
    operationFailed: 'Operation failed. Please try again.',
  },

  // Shop
  shop: {
    title: 'Shop',
    viewAll: 'View All',
    addToCart: 'Add to Cart',
    outOfStock: 'Out of Stock',
    sale: 'Sale',
    new: 'New',
    bestseller: 'Bestseller',
    categories: {
      blankets: 'Blankets',
      fly_protection: 'Fly Protection',
      supplements: 'Supplements',
      grooming: 'Grooming',
      tack: 'Tack',
      health: 'Health',
      stable: 'Stable',
      apparel: 'Apparel',
    },
  },

  // Emergency Contacts
  emergencyContacts: {
    veterinarian: 'Veterinarian',
    farrier: 'Farrier',
    barn_manager: 'Barn Manager',
    owner: 'Owner',
    other: 'Other',
  },

  // Time/Date
  time: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    nextWeek: 'Next Week',
    thisMonth: 'This Month',
  },
};

export default en;
