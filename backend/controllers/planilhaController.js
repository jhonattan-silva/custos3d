const { prisma } = require('../config/db');

// Limites por tipo de plano
const LIMITES_PLANO = {
  gratuito: {
    maxLinhas: 10,
    maxColunasPersonalizadas: 3
  },
  basico: {
    maxLinhas: 50,
    maxColunasPersonalizadas: 10
  },
  premium: {
    maxLinhas: -1, // Ilimitado
    maxColunasPersonalizadas: -1 // Ilimitado
  }
};

// Verificar limites do plano
const verificarLimites = (tipoPlano, dadosBase, colunasPersonalizadas) => {
  const limites = LIMITES_PLANO[tipoPlano];
  
  if (!limites) {
    throw new Error('Tipo de plano inválido');
  }

  // Verificar limite de linhas
  if (limites.maxLinhas !== -1 && dadosBase.linhas && dadosBase.linhas.length > limites.maxLinhas) {
    return {
      valido: false,
      erro: `Plano ${tipoPlano} permite no máximo ${limites.maxLinhas} linhas`
    };
  }

  // Verificar limite de colunas personalizadas
  if (limites.maxColunasPersonalizadas !== -1 && 
      colunasPersonalizadas.colunas && 
      colunasPersonalizadas.colunas.length > limites.maxColunasPersonalizadas) {
    return {
      valido: false,
      erro: `Plano ${tipoPlano} permite no máximo ${limites.maxColunasPersonalizadas} colunas personalizadas`
    };
  }

  return { valido: true };
};

// Criar nova planilha
const criarPlanilha = async (req, res) => {
  try {
    const { nome, dadosBase, colunasPersonalizadas } = req.body;

    // Obter tipo de plano do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      select: { tipoPlano: true }
    });

    if (!usuario) {
      return res.status(404).json({ 
        erro: 'Usuário não encontrado' 
      });
    }

    // Dados padrão se não fornecidos
    const dadosBasePadrao = dadosBase || {
      linhas: [],
      configuracao: {
        moeda: 'BRL',
        margemLucro: 30,
        custoHora: 50
      }
    };

    const colunasPersonalizadasPadrao = colunasPersonalizadas || {
      colunas: []
    };

    // Verificar limites do plano
    const verificacao = verificarLimites(
      usuario.tipoPlano, 
      dadosBasePadrao, 
      colunasPersonalizadasPadrao
    );

    if (!verificacao.valido) {
      return res.status(400).json({ 
        erro: verificacao.erro 
      });
    }

    // Criar planilha
    const novaPlanilha = await prisma.planilha.create({
      data: {
        idUsuario: req.usuarioId,
        nome: nome || 'Minha Planilha',
        dadosBase: dadosBasePadrao,
        colunasPersonalizadas: colunasPersonalizadasPadrao
      }
    });

    res.status(201).json({
      mensagem: 'Planilha criada com sucesso',
      planilha: novaPlanilha
    });

  } catch (error) {
    console.error('Erro ao criar planilha:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor' 
    });
  }
};

// Listar planilhas do usuário
const listarPlanilhas = async (req, res) => {
  try {
    const planilhas = await prisma.planilha.findMany({
      where: { idUsuario: req.usuarioId },
      select: {
        id: true,
        nome: true,
        criadaEm: true,
        atualizadaEm: true
      },
      orderBy: { atualizadaEm: 'desc' }
    });

    res.json(planilhas);

  } catch (error) {
    console.error('Erro ao listar planilhas:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor' 
    });
  }
};

// Obter planilha específica
const obterPlanilha = async (req, res) => {
  try {
    const { id } = req.params;

    const planilha = await prisma.planilha.findFirst({
      where: {
        id: parseInt(id),
        idUsuario: req.usuarioId
      }
    });

    if (!planilha) {
      return res.status(404).json({ 
        erro: 'Planilha não encontrada' 
      });
    }

    res.json(planilha);

  } catch (error) {
    console.error('Erro ao obter planilha:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor' 
    });
  }
};

// Atualizar planilha
const atualizarPlanilha = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, dadosBase, colunasPersonalizadas } = req.body;

    // Verificar se planilha existe e pertence ao usuário
    const planilhaExistente = await prisma.planilha.findFirst({
      where: {
        id: parseInt(id),
        idUsuario: req.usuarioId
      },
      include: {
        usuario: {
          select: { tipoPlano: true }
        }
      }
    });

    if (!planilhaExistente) {
      return res.status(404).json({ 
        erro: 'Planilha não encontrada' 
      });
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {};
    
    if (nome !== undefined) {
      dadosAtualizacao.nome = nome;
    }

    if (dadosBase !== undefined) {
      dadosAtualizacao.dadosBase = dadosBase;
    }

    if (colunasPersonalizadas !== undefined) {
      dadosAtualizacao.colunasPersonalizadas = colunasPersonalizadas;
    }

    // Se houver dados para verificar limites
    if (dadosBase || colunasPersonalizadas) {
      const dadosParaVerificar = dadosBase || planilhaExistente.dadosBase;
      const colunasParaVerificar = colunasPersonalizadas || planilhaExistente.colunasPersonalizadas;

      const verificacao = verificarLimites(
        planilhaExistente.usuario.tipoPlano,
        dadosParaVerificar,
        colunasParaVerificar
      );

      if (!verificacao.valido) {
        return res.status(400).json({ 
          erro: verificacao.erro 
        });
      }
    }

    // Atualizar planilha
    const planilhaAtualizada = await prisma.planilha.update({
      where: { id: parseInt(id) },
      data: dadosAtualizacao
    });

    res.json({
      mensagem: 'Planilha atualizada com sucesso',
      planilha: planilhaAtualizada
    });

  } catch (error) {
    console.error('Erro ao atualizar planilha:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor' 
    });
  }
};

// Excluir planilha
const excluirPlanilha = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se planilha existe e pertence ao usuário
    const planilha = await prisma.planilha.findFirst({
      where: {
        id: parseInt(id),
        idUsuario: req.usuarioId
      }
    });

    if (!planilha) {
      return res.status(404).json({ 
        erro: 'Planilha não encontrada' 
      });
    }

    // Excluir planilha
    await prisma.planilha.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      mensagem: 'Planilha excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir planilha:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor' 
    });
  }
};

// Obter limites do plano do usuário
const obterLimitesPlano = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      select: { tipoPlano: true }
    });

    if (!usuario) {
      return res.status(404).json({ 
        erro: 'Usuário não encontrado' 
      });
    }

    const limites = LIMITES_PLANO[usuario.tipoPlano];

    res.json({
      tipoPlano: usuario.tipoPlano,
      limites
    });

  } catch (error) {
    console.error('Erro ao obter limites do plano:', error);
    res.status(500).json({ 
      erro: 'Erro interno do servidor' 
    });
  }
};

module.exports = {
  criarPlanilha,
  listarPlanilhas,
  obterPlanilha,
  atualizarPlanilha,
  excluirPlanilha,
  obterLimitesPlano
};

