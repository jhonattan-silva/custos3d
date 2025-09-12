/*
 * Função: Controlador responsável por gerenciar as operações de usuários
 * 
 * Funções:
 * - cadastrarUsuario: Registra novo usuário no sistema
 * - loginUsuario: Autentica usuário existente
 * - obterPerfil: Obtém perfil completo do usuário
 * - atualizarPerfil: Atualiza dados do perfil do usuário
 * 
 * Parâmetros de entrada:
 * - req.usuarioId: ID do usuário autenticado (vem do middleware)
 * - req.body: Dados do usuário (nome, email, senha, etc.)
 * 
 * Retornos:
 * - JSON com dados do usuário ou mensagens de sucesso/erro
 * - Status codes apropriados (200, 201, 400, 401, 404, 500)
 */

const usuarioService = require('../services/usuarioService');

// Cadastrar novo usuário
const cadastrarUsuario = async (req, res) => {
  try {
    console.log('� Tentativa de cadastro:', { email: req.body.email });
    
    const resultado = await usuarioService.criarUsuario(req.body);

    console.log('✅ Usuário criado com sucesso:', resultado.usuario.id);

    res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário criado com sucesso',
      ...resultado
    });

  } catch (error) {
    console.error('❌ Erro ao cadastrar usuário:', error);
    
    // Determinar status code baseado no tipo de erro
    let status = 500;
    if (error.message.includes('obrigatório') || 
        error.message.includes('formato') || 
        error.message.includes('caracteres') ||
        error.message.includes('já está em uso')) {
      status = 400;
    }

    res.status(status).json({ 
      sucesso: false,
      erro: error.message
    });
  }
};

// Login de usuário
const loginUsuario = async (req, res) => {
  try {
    const resultado = await usuarioService.autenticarUsuario(req.body);

    res.json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso',
      ...resultado
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    
    // Determinar status baseado no tipo de erro
    let status = 500;
    if (error.message.includes('Credenciais inválidas') || 
        error.message.includes('não encontrado')) {
      status = 401;
    } else if (error.message.includes('inválidos')) {
      status = 400;
    }

    res.status(status).json({ 
      sucesso: false,
      erro: error.message
    });
  }
};

// Obter perfil do usuário
const obterPerfil = async (req, res) => {
  try {
    const usuario = await usuarioService.obterPerfilUsuario(req.usuarioId);

    res.json({
      sucesso: true,
      usuario
    });

  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    const status = error.message === 'Usuário não encontrado' ? 404 : 500;
    res.status(status).json({ 
      sucesso: false,
      erro: error.message
    });
  }
};

// Atualizar perfil do usuário
const atualizarPerfil = async (req, res) => {
  try {
    const usuario = await usuarioService.atualizarPerfilUsuario(req.usuarioId, req.body);

    res.json({
      sucesso: true,
      mensagem: 'Perfil atualizado com sucesso',
      usuario
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    
    let status = 500;
    if (error.message.includes('já está em uso') || 
        error.message.includes('caracteres')) {
      status = 400;
    }

    res.status(status).json({ 
      sucesso: false,
      erro: error.message
    });
  }
};

module.exports = {
  cadastrarUsuario,
  loginUsuario,
  obterPerfil,
  atualizarPerfil
};

