const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware de autenticação
const autenticarToken = async (req, res, next) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        erro: 'Token de acesso requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar se usuário ainda existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.usuarioId },
      select: { id: true, email: true, tipoPlano: true }
    });

    if (!usuario) {
      return res.status(401).json({
        erro: 'Token inválido - usuário não encontrado'
      });
    }

    // Adicionar dados do usuário à requisição
    req.usuarioId = usuario.id;
    req.usuario = usuario;

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        erro: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        erro: 'Token expirado'
      });
    }

    console.error('Erro na autenticação:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar plano específico
const verificarPlano = (planosPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        erro: 'Usuário não autenticado'
      });
    }

    if (!planosPermitidos.includes(req.usuario.tipoPlano)) {
      return res.status(403).json({
        erro: `Acesso negado. Plano ${req.usuario.tipoPlano} não tem permissão para esta funcionalidade`,
        planoAtual: req.usuario.tipoPlano,
        planosNecessarios: planosPermitidos
      });
    }

    next();
  };
};

// Middleware para verificar acesso administrativo usando Prisma
const verificarAdmin = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      include: { role: true }
    });

    if (!usuario || !usuario.role) {
      return res.status(403).json({
        erro: 'Acesso negado. Usuário sem role definido.'
      });
    }

    const userRole = usuario.role.nome;

    if (userRole !== 'admin' && userRole !== 'master') {
      return res.status(403).json({
        erro: 'Acesso negado. Permissão de administrador necessária.'
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = {
  autenticarToken,
  verificarPlano,
  verificarAdmin
};

