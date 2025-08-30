const express = require('express');
const router = express.Router();
const { 
  registrarUsuario, 
  loginUsuario, 
  obterPerfil, 
  atualizarPerfil 
} = require('../controllers/usuarioController');
const { autenticarToken } = require('../middleware/auth');

// Rotas públicas (sem autenticação)
router.post('/registrar', registrarUsuario);
router.post('/login', loginUsuario);

// Rotas protegidas (com autenticação)
router.get('/perfil', autenticarToken, obterPerfil);
router.put('/perfil', autenticarToken, atualizarPerfil);

module.exports = router;

