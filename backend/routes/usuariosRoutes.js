const express = require('express');
const router = express.Router();
const { 
  cadastrarUsuario, 
  loginUsuario, 
  obterPerfil, 
  atualizarPerfil 
} = require('../controllers/usuarioController');
const { autenticarToken } = require('../middleware/authMiddleware');

// Rotas públicas (sem autenticação)
router.post('/cadastrar', cadastrarUsuario);
router.post('/login', loginUsuario);

// Rotas protegidas (com autenticação)
router.get('/perfil', autenticarToken, obterPerfil);
router.put('/perfil', autenticarToken, atualizarPerfil);

module.exports = router;

