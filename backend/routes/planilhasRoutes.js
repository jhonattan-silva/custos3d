/*
 * PLANILHAS ROUTES
 * 
 * Função: Define as rotas HTTP para operações com planilhas de precificação 3D
 * Todas as rotas requerem autenticação via middleware
 * 
 * Rotas disponíveis:
 * - GET / : Lista todas as planilhas do usuário
 * - GET /limites : Obtém limites do plano do usuário  
 * - GET /:id : Obtém planilha específica por ID
 * - POST / : Cria nova planilha
 * - PUT /:id : Atualiza planilha existente
 * - DELETE /:id : Exclui planilha
 * 
 * Middlewares aplicados:
 * - autenticarToken: Verifica se usuário está autenticado
 * - verificarPlano: Verifica limites do plano (para futuras funcionalidades premium)
 * 
 * Parâmetros esperados:
 * - Headers: Authorization com Bearer token
 * - Body: Dados da planilha em formato JSON
 * - Params: ID da planilha quando aplicável
 */

const express = require('express');
const router = express.Router();
const { autenticarToken } = require('../middleware/authMiddleware');
const {
  criarPlanilha,
  listarPlanilhas,
  obterPlanilha,
  atualizarPlanilha,
  excluirPlanilha,
  obterLimitesPlano
} = require('../controllers/planilhaController');

// IMPORTANTE: Rota /limites DEVE vir ANTES de /:id para evitar conflitos
router.get('/limites', autenticarToken, obterLimitesPlano);

// Listar planilhas do usuário
router.get('/', autenticarToken, listarPlanilhas);

// Obter planilha específica (DEVE vir APÓS /limites)
router.get('/:id', autenticarToken, obterPlanilha);

// Criar nova planilha
router.post('/', autenticarToken, criarPlanilha);

// Atualizar planilha
router.put('/:id', autenticarToken, atualizarPlanilha);

// Excluir planilha
router.delete('/:id', autenticarToken, excluirPlanilha);

module.exports = router;

