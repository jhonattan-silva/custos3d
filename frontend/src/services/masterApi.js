/*
 * MASTER API SERVICE
 * 
 * Função: Serviço para comunicação com endpoints administrativos
 * Gerencia operações do painel master
 * 
 * Endpoints disponíveis:
 * - usuarios: CRUD de usuários do sistema
 * - parametros: Configurações globais
 * - formulas: Fórmulas de cálculo editáveis
 * - planos: Configuração de planos
 * - metricas: Dashboard administrativo
 * - logs: Auditoria do sistema
 * 
 * Autenticação:
 * - Todas as requests incluem Bearer token
 * - Requer role master/admin
 * 
 * Tratamento de erros:
 * - Intercepta erros de autorização
 * - Logs de operações críticas
 * - Fallback para dados locais em desenvolvimento
 */

import api from './api';

// Serviços da API Master (simulado para desenvolvimento)
export const masterService = {
  // Obter métricas do dashboard
  async obterMetricas() {
    // Simula requisição para desenvolvimento
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalUsuarios: 150,
          usuariosAtivos: 120,
          planilhasTotal: 450,
          receitaMensal: 2500.00,
          crescimentoMensal: 15.5
        });
      }, 1000);
    });
  },

  // Listar usuários
  async listarUsuarios(filtros = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) params.append(key, filtros[key]);
      });
      
      const response = await api.get(`/master/usuarios?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  },

  async atualizarUsuario(id, dados) {
    try {
      const response = await api.put(`/master/usuarios/${id}`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  },

  async desativarUsuario(id) {
    try {
      const response = await api.delete(`/master/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      throw error;
    }
  },

  // Parâmetros
  async obterParametros() {
    try {
      const response = await api.get('/master/parametros');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter parâmetros:', error);
      throw error;
    }
  },

  async atualizarParametros(parametros) {
    try {
      const response = await api.put('/master/parametros', parametros);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar parâmetros:', error);
      throw error;
    }
  },

  // Fórmulas
  async obterFormulas() {
    try {
      const response = await api.get('/master/formulas');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter fórmulas:', error);
      throw error;
    }
  },

  async atualizarFormula(nome, dados) {
    try {
      const response = await api.put(`/master/formulas/${nome}`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar fórmula:', error);
      throw error;
    }
  },

  // Planos
  async obterPlanos() {
    try {
      const response = await api.get('/master/planos');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter planos:', error);
      throw error;
    }
  },

  async atualizarPlano(tipo, configuracao) {
    try {
      const response = await api.put(`/master/planos/${tipo}`, configuracao);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      throw error;
    }
  },

  // Logs
  async obterLogs(filtros = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) params.append(key, filtros[key]);
      });
      
      const response = await api.get(`/master/logs?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter logs:', error);
      throw error;
    }
  }
};