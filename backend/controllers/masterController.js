/*
 * MASTER CONTROLLER
 * 
 * Função: Controlador responsável por operações administrativas do sistema
 * Permite gerenciar usuários, parâmetros, fórmulas e configurações globais
 * 
 * Funções:
 * - listarUsuarios: Lista todos os usuários com filtros
 * - atualizarUsuario: Atualiza dados de um usuário
 * - desativarUsuario: Desativa conta de usuário
 * - obterParametros: Obtém parâmetros globais do sistema
 * - atualizarParametros: Atualiza configurações globais
 * - obterFormulas: Lista fórmulas de cálculo editáveis
 * - atualizarFormula: Modifica fórmula específica
 * - obterPlanos: Obtém configuração dos planos de assinatura
 * - atualizarPlano: Modifica configuração de um plano
 * - obterMetricas: Dashboard com estatísticas do sistema
 * - obterLogs: Histórico de atividades para auditoria
 * 
 * Parâmetros de entrada:
 * - req.usuarioId: ID do admin autenticado
 * - req.body: Dados específicos de cada operação
 * - req.params: IDs e nomes para operações específicas
 * - req.query: Filtros e paginação
 * 
 * Retornos:
 * - JSON com dados solicitados ou confirmação de operação
 * - Status codes apropriados (200, 201, 400, 403, 404, 500)
 * - Logs de auditoria para todas as operações críticas
 */

const masterService = require('../services/masterService');

// Listar todos os usuários
const listarUsuarios = async (req, res) => {
  try {
    const { page = 1, limit = 50, plano, status, search } = req.query;
    
    const usuarios = await masterService.listarUsuarios({
      page: parseInt(page),
      limit: parseInt(limit),
      plano,
      status,
      search
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar dados de usuário
const atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, plano, status, role } = req.body;
    
    const usuario = await masterService.atualizarUsuario(id, {
      nome,
      email,
      plano,
      status,
      role
    });

    // Log da ação para auditoria
    await masterService.criarLog({
      acao: 'UPDATE_USER',
      adminId: req.usuarioId,
      targetId: id,
      detalhes: { nome, email, plano, status, role }
    });

    res.json({
      mensagem: 'Usuário atualizado com sucesso',
      usuario
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    const status = error.message === 'Usuário não encontrado' ? 404 : 400;
    res.status(status).json({ erro: error.message });
  }
};

// Desativar usuário
const desativarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    await masterService.desativarUsuario(id);

    // Log da ação para auditoria
    await masterService.criarLog({
      acao: 'DEACTIVATE_USER',
      adminId: req.usuarioId,
      targetId: id
    });

    res.json({
      mensagem: 'Usuário desativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    const status = error.message === 'Usuário não encontrado' ? 404 : 500;
    res.status(status).json({ erro: error.message });
  }
};

// Obter parâmetros globais
const obterParametros = async (req, res) => {
  try {
    const parametros = await masterService.obterParametros();
    res.json(parametros);
  } catch (error) {
    console.error('Erro ao obter parâmetros:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar parâmetros globais
const atualizarParametros = async (req, res) => {
  try {
    const parametros = await masterService.atualizarParametros(req.body);

    // Log da ação para auditoria
    await masterService.criarLog({
      acao: 'UPDATE_PARAMETERS',
      adminId: req.usuarioId,
      detalhes: req.body
    });

    res.json({
      mensagem: 'Parâmetros atualizados com sucesso',
      parametros
    });
  } catch (error) {
    console.error('Erro ao atualizar parâmetros:', error);
    res.status(400).json({ erro: error.message });
  }
};

// Obter fórmulas de cálculo
const obterFormulas = async (req, res) => {
  try {
    const formulas = await masterService.obterFormulas();
    res.json(formulas);
  } catch (error) {
    console.error('Erro ao obter fórmulas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar fórmula específica
const atualizarFormula = async (req, res) => {
  try {
    const { nome } = req.params;
    const { formula, descricao } = req.body;
    
    const formulaAtualizada = await masterService.atualizarFormula(nome, {
      formula,
      descricao
    });

    // Log da ação para auditoria
    await masterService.criarLog({
      acao: 'UPDATE_FORMULA',
      adminId: req.usuarioId,
      detalhes: { nome, formula, descricao }
    });

    res.json({
      mensagem: 'Fórmula atualizada com sucesso',
      formula: formulaAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar fórmula:', error);
    res.status(400).json({ erro: error.message });
  }
};

// Obter configuração dos planos
const obterPlanos = async (req, res) => {
  try {
    const planos = await masterService.obterPlanos();
    res.json(planos);
  } catch (error) {
    console.error('Erro ao obter planos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar configuração de plano
const atualizarPlano = async (req, res) => {
  try {
    const { tipo } = req.params;
    const configuracao = req.body;
    
    const plano = await masterService.atualizarPlano(tipo, configuracao);

    // Log da ação para auditoria
    await masterService.criarLog({
      acao: 'UPDATE_PLAN',
      adminId: req.usuarioId,
      detalhes: { tipo, configuracao }
    });

    res.json({
      mensagem: 'Plano atualizado com sucesso',
      plano
    });
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(400).json({ erro: error.message });
  }
};

// Obter métricas do dashboard
const obterMetricas = async (req, res) => {
  try {
    const { periodo = '30d' } = req.query;
    
    const metricas = await masterService.obterMetricas(periodo);
    res.json(metricas);
  } catch (error) {
    console.error('Erro ao obter métricas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter logs de auditoria
const obterLogs = async (req, res) => {
  try {
    const { page = 1, limit = 100, acao, adminId, dataInicio, dataFim } = req.query;
    
    const logs = await masterService.obterLogs({
      page: parseInt(page),
      limit: parseInt(limit),
      acao,
      adminId,
      dataInicio,
      dataFim
    });

    res.json(logs);
  } catch (error) {
    console.error('Erro ao obter logs:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = {
  listarUsuarios,
  atualizarUsuario,
  desativarUsuario,
  obterParametros,
  atualizarParametros,
  obterFormulas,
  atualizarFormula,
  obterPlanos,
  atualizarPlano,
  obterMetricas,
  obterLogs
};