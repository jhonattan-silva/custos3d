const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware de autenticação
const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      erro: 'Token de acesso requerido'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Erro na verificação do token:', err);
      return res.status(403).json({ erro: 'Token inválido' });
    }

    req.usuarioId = decoded.usuarioId;
    next();
  });
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

