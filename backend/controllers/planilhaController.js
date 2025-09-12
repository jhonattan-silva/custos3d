/*
 * Função: Controlador responsável por gerenciar as operações CRUD das planilhas de precificação 3D
 * 
 * Funções:
 * - criarPlanilha: Cria uma nova planilha para o usuário autenticado
 * - listarPlanilhas: Lista todas as planilhas do usuário
 * - obterPlanilha: Obtém uma planilha específica por ID
 * - atualizarPlanilha: Atualiza dados de uma planilha existente
 * - excluirPlanilha: Remove uma planilha do sistema
 * - obterLimitesPlano: Retorna os limites do plano do usuário
 * 
 * Parâmetros de entrada:
 * - req.usuarioId: ID do usuário autenticado (vem do middleware de auth)
 * - req.body: Dados da planilha (nome, dadosBase, colunasPersonalizadas)
 * - req.params.id: ID da planilha para operações específicas
 * 
 * Retornos:
 * - JSON com dados da planilha ou mensagens de sucesso/erro
 * - Status codes apropriados (200, 201, 400, 404, 500)
 */

const planilhaService = require('../services/planilhaService');

// Criar nova planilha
const criarPlanilha = async (req, res) => {
  try {
    const planilha = await planilhaService.criarPlanilha(req.usuarioId, req.body);
    res.status(201).json({
      sucesso: true,
      mensagem: 'Planilha criada com sucesso',
      planilha
    });
  } catch (error) {
    console.error('Erro ao criar planilha:', error);
    res.status(400).json({ 
      sucesso: false,
      erro: error.message 
    });
  }
};

// Listar planilhas do usuário
const listarPlanilhas = async (req, res) => {
  try {
    const planilhas = await planilhaService.listarPlanilhas(req.usuarioId);
    res.json(planilhas);
  } catch (error) {
    console.error('Erro ao listar planilhas:', error);
    res.status(500).json({ 
      sucesso: false,
      erro: 'Erro interno do servidor' 
    });
  }
};

// Obter planilha específica
const obterPlanilha = async (req, res) => {
  try {
    const planilha = await planilhaService.obterPlanilha(req.params.id, req.usuarioId);
    res.json(planilha);
  } catch (error) {
    console.error('Erro ao obter planilha:', error);
    const status = error.message === 'Planilha não encontrada' ? 404 : 500;
    res.status(status).json({ 
      sucesso: false,
      erro: error.message 
    });
  }
};

// Atualizar planilha
const atualizarPlanilha = async (req, res) => {
  try {
    const planilha = await planilhaService.atualizarPlanilha(req.params.id, req.usuarioId, req.body);
    res.json({
      sucesso: true,
      mensagem: 'Planilha atualizada com sucesso',
      planilha
    });
  } catch (error) {
    console.error('Erro ao atualizar planilha:', error);
    const status = error.message === 'Planilha não encontrada' ? 404 : 400;
    res.status(status).json({ 
      sucesso: false,
      erro: error.message 
    });
  }
};

// Excluir planilha
const excluirPlanilha = async (req, res) => {
  try {
    await planilhaService.excluirPlanilha(req.params.id, req.usuarioId);
    res.json({
      sucesso: true,
      mensagem: 'Planilha excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir planilha:', error);
    const status = error.message === 'Planilha não encontrada' ? 404 : 500;
    res.status(status).json({ 
      sucesso: false,
      erro: error.message 
    });
  }
};

// Obter limites do plano do usuário
const obterLimitesPlano = async (req, res) => {
  try {
    const limites = await planilhaService.obterLimitesPlano(req.usuarioId);
    res.json({
      sucesso: true,
      ...limites
    });
  } catch (error) {
    console.error('Erro ao obter limites do plano:', error);
    res.status(500).json({ 
      sucesso: false,
      erro: 'Erro interno do servidor' 
    });
  }
};

module.exports = {
  criarPlanilha,
  listarPlanilhas,
  obterPlanilha,
  atualizarPlanilha,
  excluirPlanilha,
  obterLimitesPlano
};