import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de usuário
export const usuarioService = {
  // Registrar usuário
  registrar: async (dados) => {
    const response = await api.post('/api/usuarios/registrar', dados);
    return response.data;
  },

  // Login
  login: async (dados) => {
    const response = await api.post('/api/usuarios/login', dados);
    return response.data;
  },

  // Obter perfil
  obterPerfil: async () => {
    const response = await api.get('/api/usuarios/perfil');
    return response.data;
  },

  // Atualizar perfil
  atualizarPerfil: async (dados) => {
    const response = await api.put('/api/usuarios/perfil', dados);
    return response.data;
  },
};

// Serviços de planilha
export const planilhaService = {
  // Listar planilhas
  listar: async () => {
    const response = await api.get('/api/planilhas');
    return response.data;
  },

  // Obter planilha específica
  obter: async (id) => {
    const response = await api.get(`/api/planilhas/${id}`);
    return response.data;
  },

  // Criar planilha
  criar: async (dados) => {
    const response = await api.post('/api/planilhas', dados);
    return response.data;
  },

  // Atualizar planilha
  atualizar: async (id, dados) => {
    const response = await api.put(`/api/planilhas/${id}`, dados);
    return response.data;
  },

  // Excluir planilha
  excluir: async (id) => {
    const response = await api.delete(`/api/planilhas/${id}`);
    return response.data;
  },

  // Obter limites do plano
  obterLimites: async () => {
    const response = await api.get('/api/planilhas/limites');
    return response.data;
  },
};

export default api;

