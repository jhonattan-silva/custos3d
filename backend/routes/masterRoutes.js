/*
 * MASTER ROUTES
 * 
 * Função: Define as rotas HTTP para operações administrativas do sistema
 * Acesso restrito apenas para usuários com role 'master' ou 'admin'
 * 
 * Rotas disponíveis:
 * - GET /usuarios : Lista todos os usuários do sistema
 * - PUT /usuarios/:id : Atualiza dados de um usuário
 * - DELETE /usuarios/:id : Desativa/remove usuário
 * - GET /parametros : Obtém parâmetros globais do sistema
 * - PUT /parametros : Atualiza parâmetros globais
 * - GET /formulas : Lista fórmulas de cálculo
 * - PUT /formulas/:nome : Atualiza fórmula específica
 * - GET /planos : Obtém configuração dos planos
 * - PUT /planos/:tipo : Atualiza configuração de um plano
 * - GET /metricas : Dashboard com métricas do sistema
 * - GET /logs : Histórico de atividades
 * 
 * Middlewares aplicados:
 * - autenticarToken: Verifica se usuário está autenticado
 * - verificarMaster: Verifica se usuário tem permissão de administrador
 * 
 * Parâmetros esperados:
 * - Headers: Authorization com Bearer token
 * - Body: Dados específicos de cada endpoint
 * - Query: Filtros e paginação quando aplicável
 */

const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/masterController');
const { autenticarToken, verificarMaster } = require('../middleware/authMiddleware');

// Todas as rotas master requerem autenticação e permissão especial
router.use(autenticarToken);
router.use(verificarMaster);

// Rotas de usuários
router.get('/usuarios', listarUsuarios);
router.put('/usuarios/:id', atualizarUsuario);
router.delete('/usuarios/:id', desativarUsuario);

// Rotas de parâmetros do sistema
router.get('/parametros', obterParametros);
router.put('/parametros', atualizarParametros);

// Rotas de fórmulas
router.get('/formulas', obterFormulas);
router.put('/formulas/:nome', atualizarFormula);

// Rotas de planos
router.get('/planos', obterPlanos);
router.put('/planos/:tipo', atualizarPlano);

// Rotas de métricas e logs
router.get('/metricas', obterMetricas);
router.get('/logs', obterLogs);

module.exports = router;