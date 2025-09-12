/*
 * Função: Serviço que implementa a lógica de negócio para usuários
 * Gerencia operações no banco de dados e validações de usuário
 * 
 * Funções principais:
 * - validarDadosCadastro: Valida dados para cadastro de usuário
 * - validarDadosLogin: Valida dados para login
 * - verificarEmailExistente: Verifica se email já está em uso
 * - criarUsuario: Cria novo usuário com validações
 * - autenticarUsuario: Autentica usuário por email/senha ou OAuth
 * - obterPerfilUsuario: Busca perfil completo do usuário
 * - atualizarPerfilUsuario: Atualiza dados do perfil
 * 
 * Parâmetros:
 * - usuarioId: ID do usuário
 * - dados: Objeto com nome, email, senha, etc.
 * 
 * Validações implementadas:
 * - Email único
 * - Senha mínima 6 caracteres
 * - Nome obrigatório
 * - Hash seguro da senha
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

class UsuarioService {
  // Gerar token JWT
  gerarToken(usuarioId) {
    return jwt.sign({ usuarioId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  }

  // Validar dados de cadastro
  validarDadosCadastro(dados) {
    const { nome, email, senha } = dados;
    
    if (!email || !senha) {
      throw new Error('Email e senha são obrigatórios');
    }

    if (!nome) {
      throw new Error('Nome é obrigatório');
    }

    if (senha.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres');
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email deve ter um formato válido');
    }
  }

  // Verificar se email já existe
  async verificarEmailExistente(email, excluirId = null) {
    const where = { email };
    if (excluirId) {
      where.id = { not: excluirId };
    }

    const usuarioExistente = await prisma.usuario.findUnique({ where });
    return !!usuarioExistente;
  }

  // Criar novo usuário
  async criarUsuario(dados) {
    try {
      console.log('🔧 Service: Iniciando criação de usuário:', dados);
      
      const { nome, email, senha } = dados;

      // Validar dados
      console.log('🔍 Service: Validando dados...');
      this.validarDadosCadastro(dados);

      // Verificar se email já existe
      console.log('📧 Service: Verificando email existente...');
      const emailJaExiste = await this.verificarEmailExistente(email);
      if (emailJaExiste) {
        throw new Error('Este email já está em uso');
      }

      // Hash da senha
      console.log('🔒 Service: Criando hash da senha...');
      const senhaHash = await bcrypt.hash(senha, 12);

      // Criar usuário
      console.log('💾 Service: Criando usuário no banco...');
      const roleUsuario = await prisma.role.findUnique({ where: { nome: 'gratuito' } });
      if (!roleUsuario) {
        throw new Error('Role padrão não encontrada. Execute o seed primeiro.');
      }

      const novoUsuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          tipoPlano: 'gratuito',
          status: 'ativo',
          roleId: roleUsuario.id
        }
      });

      console.log('✅ Service: Usuário criado:', novoUsuario.id);

      // Gerar token
      console.log('🎫 Service: Gerando token...');
      const token = this.gerarToken(novoUsuario.id);

      // Remover senha da resposta
      const { senha: _, ...usuarioSemSenha } = novoUsuario;

      return {
        usuario: usuarioSemSenha,
        token
      };
    } catch (error) {
      console.error('❌ Service: Erro ao criar usuário:', error);
      throw error;
    }
  }

  // Autenticar usuário
  async autenticarUsuario(dados) {
    const { email, senha, provedorOauth, idProvedorOauth } = dados;

    let usuario = null;

    // Login com email e senha
    if (email && senha) {
      usuario = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!usuario || !usuario.senha) {
        throw new Error('Credenciais inválidas');
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        throw new Error('Credenciais inválidas');
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
        throw new Error('Usuário não encontrado');
      }
    }

    if (!usuario) {
      throw new Error('Dados de login inválidos');
    }

    // Gerar token
    const token = this.gerarToken(usuario.id);

    // Remover senha da resposta
    const { senha: _, ...usuarioSemSenha } = usuario;

    return {
      usuario: usuarioSemSenha,
      token
    };
  }

  // Obter perfil do usuário
  async obterPerfilUsuario(usuarioId) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        planilhas: {
          select: {
            id: true,
            nome: true,
            criadaEm: true,
            atualizadaEm: true
          },
          orderBy: { atualizadaEm: 'desc' }
        }
      }
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Remover senha da resposta
    const { senha: _, ...usuarioSemSenha } = usuario;

    return usuarioSemSenha;
  }

  // Atualizar perfil do usuário
  async atualizarPerfilUsuario(usuarioId, dados) {
    const { nome, email, senha } = dados;
    const dadosAtualizacao = {};

    if (nome) {
      dadosAtualizacao.nome = nome;
    }

    if (email) {
      // Verificar se email já está em uso por outro usuário
      const emailJaExiste = await this.verificarEmailExistente(email, usuarioId);
      if (emailJaExiste) {
        throw new Error('Email já está em uso');
      }
      dadosAtualizacao.email = email;
    }

    if (senha) {
      if (senha.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }
      dadosAtualizacao.senha = await bcrypt.hash(senha, 12);
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: dadosAtualizacao
    });

    // Remover senha da resposta
    const { senha: _, ...usuarioSemSenha } = usuarioAtualizado;

    return usuarioSemSenha;
  }
}

module.exports = new UsuarioService();