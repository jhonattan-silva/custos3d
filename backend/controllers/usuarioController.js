const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

// Gerar token JWT
const gerarToken = (usuarioId) => {
  return jwt.sign({ usuarioId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Registrar novo usuário
const registrarUsuario = async (req, res) => {
  try {
    const { email, senha, provedorOauth, idProvedorOauth } = req.body;

    // Validar dados obrigatórios
    if (!email && !provedorOauth) {
      return res.status(400).json({ 
        erro: 'Email ou provedor OAuth é obrigatório' 
      });
    }

    // Verificar se usuário já existe
    let usuarioExistente = null;
    if (email) {
      usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
      });
    }
    
    if (provedorOauth && idProvedorOauth) {
      usuarioExistente = await prisma.usuario.findFirst({
        where: {
          provedorOauth,
          idProvedorOauth
        }
      });
    }

    if (usuarioExistente) {
      return res.status(400).json({ 
        erro: 'Usuário já existe' 
      });
    }

    // Hash da senha (se fornecida)
    let senhaHash = null;
    if (senha) {
      senhaHash = await bcrypt.hash(senha, 12);
    }

    // Criar usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        email,
        senha: senhaHash,
        provedorOauth,
        idProvedorOauth,
        tipoPlano: 'gratuito'
      }
    });

    // Gerar token
    const token = gerarToken(novoUsuario.id);

    // Remover senha da resposta
    const { senha: _, ...usuarioSemSenha } = novoUsuario;

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      usuario: usuarioSemSenha,
      token
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor' 
    });
  }
};

// Login de usuário
const loginUsuario = async (req, res) => {
  try {
    const { email, senha, provedorOauth, idProvedorOauth } = req.body;

    let usuario = null;

    // Login com email e senha
    if (email && senha) {
      usuario = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!usuario || !usuario.senha) {
        return res.status(401).json({ 
          erro: 'Credenciais inválidas' 
        });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ 
          erro: 'Credenciais inválidas' 
        });
      }
    }

    // Login com OAuth
    if (provedorOauth && idProvedorOauth) {
      usuario = await prisma.usuario.findFirst({
        where: {
          provedorOauth,
          idProvedorOauth
        }
      });

      if (!usuario) {
        return res.status(401).json({ 
          erro: 'Usuário não encontrado' 
        });
      }
    }

    if (!usuario) {
      return res.status(400).json({ 
        erro: 'Dados de login inválidos' 
      });
    }

    // Gerar token
    const token = gerarToken(usuario.id);

    // Remover senha da resposta
    const { senha: _, ...usuarioSemSenha } = usuario;

    res.json({
      mensagem: 'Login realizado com sucesso',
      usuario: usuarioSemSenha,
      token
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor' 
    });
  }
};

// Obter perfil do usuário
const obterPerfil = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      include: {
        planilhas: {
          select: {
            id: true,
            nome: true,
            criadaEm: true,
            atualizadaEm: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ 
        erro: 'Usuário não encontrado' 
      });
    }

    // Remover senha da resposta
    const { senha: _, ...usuarioSemSenha } = usuario;

    res.json(usuarioSemSenha);

  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor' 
    });
  }
};

// Atualizar perfil do usuário
const atualizarPerfil = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const dadosAtualizacao = {};

    if (email) {
      // Verificar se email já está em uso
      const emailExistente = await prisma.usuario.findFirst({
        where: {
          email,
          id: { not: req.usuarioId }
        }
      });

      if (emailExistente) {
        return res.status(400).json({ 
          erro: 'Email já está em uso' 
        });
      }

      dadosAtualizacao.email = email;
    }

    if (senha) {
      dadosAtualizacao.senha = await bcrypt.hash(senha, 12);
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: req.usuarioId },
      data: dadosAtualizacao
    });

    // Remover senha da resposta
    const { senha: _, ...usuarioSemSenha } = usuarioAtualizado;

    res.json({
      mensagem: 'Perfil atualizado com sucesso',
      usuario: usuarioSemSenha
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor' 
    });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obterPerfil,
  atualizarPerfil
};

