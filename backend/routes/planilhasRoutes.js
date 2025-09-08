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
const { 
  criarPlanilha,
  listarPlanilhas,
  obterPlanilha,
  atualizarPlanilha,
  excluirPlanilha,
  obterLimitesPlano
} = require('../controllers/planilhaController');
const { autenticarToken, verificarPlano } = require('../middleware/authMiddleware');

// Todas as rotas de planilhas requerem autenticação
router.use(autenticarToken);

// Rotas básicas (disponíveis para todos os planos)
router.get('/', listarPlanilhas);
router.get('/limites', obterLimitesPlano); //rota para obter limites do plano
router.get('/:id', obterPlanilha);
router.post('/', criarPlanilha);
router.put('/:id', atualizarPlanilha);
router.delete('/:id', excluirPlanilha);

// Rotas premium (exemplo para futuras funcionalidades)
// router.get('/:id/relatorio', verificarPlano(['basico', 'premium']), gerarRelatorio);
// router.post('/:id/exportar', verificarPlano(['premium']), exportarPlanilha);

module.exports = router;

