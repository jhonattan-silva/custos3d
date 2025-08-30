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
const { autenticarToken, verificarPlano } = require('../middleware/auth');

// Todas as rotas de planilhas requerem autenticação
router.use(autenticarToken);

// Rotas básicas (disponíveis para todos os planos)
router.get('/', listarPlanilhas);
router.get('/limites', obterLimitesPlano);
router.get('/:id', obterPlanilha);
router.post('/', criarPlanilha);
router.put('/:id', atualizarPlanilha);
router.delete('/:id', excluirPlanilha);

// Rotas premium (exemplo para futuras funcionalidades)
// router.get('/:id/relatorio', verificarPlano(['basico', 'premium']), gerarRelatorio);
// router.post('/:id/exportar', verificarPlano(['premium']), exportarPlanilha);

module.exports = router;

