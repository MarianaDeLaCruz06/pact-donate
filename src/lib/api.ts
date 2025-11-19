// Use relative URL in production, localhost in development
const getApiUrl = () => {
  // Check if VITE_API_URL is explicitly set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production (deployed), use relative URL
  // In development, use localhost
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? 'http://localhost:3001/api' : '/api';
};

const API_URL = getApiUrl();

// Storage keys
const TOKEN_KEY = 'lifelink_token';
const USER_KEY = 'lifelink_user';

// Helper functions
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const getUser = (): any => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

const setUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const auth = {
  register: async (data: {
    email: string;
    password: string;
    tipo: 'donante' | 'entidad';
    nombre?: string;
    documento?: string;
  }) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      setToken(response.token);
      setUser(response.user);
    }
    
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      setToken(response.token);
      setUser(response.user);
    }
    
    return response;
  },

  logout: () => {
    removeToken();
  },

  getUser: () => {
    return getUser();
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },
};

// Donantes API
export const donantes = {
  getByDocumento: (documento: string) => {
    return apiRequest(`/donantes/${documento}`);
  },

  updateTipoSangre: (documento: string, tipo_sangre: string) => {
    return apiRequest(`/donantes/${documento}/tipo-sangre`, {
      method: 'PATCH',
      body: JSON.stringify({ tipo_sangre }),
    });
  },
};

// Historias Clínicas API
export const historiasClinicas = {
  getAll: () => {
    return apiRequest('/historias-clinicas');
  },

  getByDocumento: (documento: string) => {
    return apiRequest(`/historias-clinicas/${documento}`).catch(() => null);
  },

  create: (data: {
    edad?: number;
    peso?: number;
    altura?: number;
    enfermedades?: string;
    medicamentos?: string;
    transfusiones_previas?: boolean;
    habitos_personales?: string;
    observaciones?: string;
    fecha_ultima_donacion?: string;
  }) => {
    return apiRequest('/historias-clinicas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: {
    estado?: string;
    observaciones_medicas?: string;
  }) => {
    return apiRequest(`/historias-clinicas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Donaciones API
export const donaciones = {
  getAll: () => {
    return apiRequest('/donaciones');
  },

  create: (data: {
    documento_donante: string;
    fecha_donacion: string;
    cantidad_ml: number;
    centro?: string;
    observaciones?: string;
  }) => {
    return apiRequest('/donaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Solicitudes API
export const solicitudes = {
  getAll: () => {
    return apiRequest('/solicitudes');
  },

  create: (data: {
    tipo_sangre: string;
    cantidad_ml: number;
    urgencia: string;
    fecha_requerida: string;
    observaciones?: string;
    es_emergencia?: boolean;
    ubicacion?: string;
  }) => {
    return apiRequest('/solicitudes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createEmergency: (data: {
    tipo_sangre: string;
    cantidad_ml: number;
    observaciones?: string;
    ubicacion?: string;
  }) => {
    return apiRequest('/solicitudes/emergencia', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Reportes API
export const reportes = {
  getDonaciones: (filters?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    banco?: string;
    tipo_sangre?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters?.banco) params.append('banco', filters.banco);
    if (filters?.tipo_sangre) params.append('tipo_sangre', filters.tipo_sangre);
    
    const query = params.toString();
    return apiRequest(`/reportes/donaciones${query ? `?${query}` : ''}`);
  },
};

// Búsqueda de Sangre API
export const busquedaSangre = {
  buscar: (filters?: {
    tipo_sangre?: string;
    ciudad?: string;
    departamento?: string;
    cantidad_minima?: number;
    entidad_id?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.tipo_sangre) params.append('tipo_sangre', filters.tipo_sangre);
    if (filters?.ciudad) params.append('ciudad', filters.ciudad);
    if (filters?.departamento) params.append('departamento', filters.departamento);
    if (filters?.cantidad_minima) params.append('cantidad_minima', filters.cantidad_minima.toString());
    if (filters?.entidad_id) params.append('entidad_id', filters.entidad_id);
    
    const query = params.toString();
    return apiRequest(`/busqueda-sangre${query ? `?${query}` : ''}`);
  },
};

// Inventario API
export const inventario = {
  getAll: () => {
    return apiRequest('/inventario');
  },

  update: (id: string, data: {
    cantidad_ml?: number;
    cantidad_unidades?: number;
    tipo_operacion: 'agregar' | 'despachar' | 'actualizar';
  }) => {
    return apiRequest(`/inventario/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Notificaciones API
export const notificaciones = {
  getAll: () => {
    return apiRequest('/notificaciones');
  },

  marcarLeida: (id: string) => {
    return apiRequest(`/notificaciones/${id}/leer`, {
      method: 'PATCH',
    });
  },
};

// Preferencias de Notificaciones API
export const preferenciasNotificaciones = {
  get: () => {
    return apiRequest('/preferencias-notificaciones');
  },

  update: (data: {
    recibir_notificaciones: boolean;
    solo_emergencias: boolean;
  }) => {
    return apiRequest('/preferencias-notificaciones', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export default {
  auth,
  donantes,
  historiasClinicas,
  donaciones,
  solicitudes,
  reportes,
  busquedaSangre,
  inventario,
  notificaciones,
  preferenciasNotificaciones,
};

