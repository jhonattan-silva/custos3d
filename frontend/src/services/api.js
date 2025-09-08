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
    // Log detalhado para debug
    console.error('Erro da API:', {
      status: error.response?.status,
      code: error.code,
      message: error.message,
      url: error.config?.url
    });

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
  // cadastrar usuário
  cadastrar: async (dados) => {
    const response = await api.post('/api/usuarios/cadastrar', dados);
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
    try {
      const response = await api.get('/api/planilhas');
      return response.data;
    } catch (error) {
      // Se for erro de rede ou 404, retorna array vazio para desenvolvimento
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.warn('Backend não disponível, retornando dados vazios para desenvolvimento');
        return [];
      }
      throw error;
    }
  },

  // Obter planilha específica
  obter: async (id) => {
    try {
      const response = await api.get(`/api/planilhas/${id}`);
      return response.data;
    } catch (error) {
      // Para desenvolvimento, se backend não existir, simula dados
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.warn('Backend não disponível, simulando planilha para desenvolvimento');
        return {
          id: id,
          nome: 'Planilha de Desenvolvimento',
          dadosBase: {
            linhas: [],
            configuracao: {
              moeda: 'BRL',
              custoKgFilamento: 90,
              custoEnergia: 0.65,
              potenciaImpressora: 200,
              custoHora: 50,
              margemLucro: 30,
              custoFixoMensal: 500,
              horasTrabalhoMes: 160
            }
          }
        };
      }
      throw error;
    }
  },

  // Criar planilha
  criar: async (dados) => {
    try {
      const response = await api.post('/api/planilhas', dados);
      return response.data;
    } catch (error) {
      // Para desenvolvimento, simula criação bem-sucedida
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.warn('Backend não disponível, simulando criação de planilha');
        const planilhaSimulada = {
          planilha: {
            id: 'dev-' + Date.now(),
            ...dados,
            criadaEm: new Date().toISOString(),
            atualizadaEm: new Date().toISOString()
          }
        };
        return planilhaSimulada;
      }
      throw error;
    }
  },

  // Atualizar planilha
  atualizar: async (id, dados) => {
    try {
      const response = await api.put(`/api/planilhas/${id}`, dados);
      return response.data;
    } catch (error) {
      // Para desenvolvimento, simula atualização bem-sucedida
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.warn('Backend não disponível, simulando atualização de planilha');
        return { sucesso: true, planilha: { id, ...dados } };
      }
      throw error;
    }
  },

  // Excluir planilha
  excluir: async (id) => {
    try {
      const response = await api.delete(`/api/planilhas/${id}`);
      return response.data;
    } catch (error) {
      // Para desenvolvimento, simula exclusão bem-sucedida
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.warn('Backend não disponível, simulando exclusão de planilha');
        return { sucesso: true };
      }
      throw error;
    }
  },

  // Obter limites do plano - agora reativado
  obterLimites: async () => {
    try {
      const response = await api.get('/api/planilhas/limites');
      return response.data;
    } catch (error) {
      // Para desenvolvimento, retorna limites padrão
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.warn('Backend não disponível, retornando limites padrão');
        return {
          tipoPlano: 'gratuito',
          limites: {
            maxLinhas: 50,
            maxColunasPersonalizadas: 3
          }
        };
      }
      throw error;
    }
  },
};

export default api;

