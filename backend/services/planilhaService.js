/*
 * Função: Serviço que implementa a lógica de negócio para planilhas de precificação 3D
 * Gerencia operações no banco de dados e validações de limites por plano
 * 
 * Funções principais:
 * - verificarLimites: Valida se a planilha respeita os limites do plano do usuário
 * - criarPlanilha: Cria nova planilha com validação de limites
 * - listarPlanilhas: Busca todas as planilhas do usuário
 * - obterPlanilha: Obtém uma planilha específica com verificação de propriedade
 * - atualizarPlanilha: Atualiza planilha existente com validação
 * - excluirPlanilha: Remove planilha com verificação de propriedade
 * - obterLimitesPlano: Retorna limites baseados no tipo de plano
 * 
 * Parâmetros:
 * - usuarioId: ID do usuário proprietário
 * - dados: Objeto com nome, dadosBase e colunasPersonalizadas
 * - id: ID da planilha para operações específicas
 * 
 * Limites por plano:
 * - Gratuito: A DEFINIR
 * - Básico: A DEFINIR  
 * - Premium: Ilimitado
 */

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

class PlanilhaService {
  // Verificar limites do plano
  verificarLimites(tipoPlano, dadosBase, colunasPersonalizadas) {
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
  }

  // Criar nova planilha
  async criarPlanilha(usuarioId, dados) {
    const { nome, dadosBase, colunasPersonalizadas } = dados;

    // Obter tipo de plano do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { tipo_plano: true } // Corrigido para snake_case
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
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
    const verificacao = this.verificarLimites(
      usuario.tipo_plano, // Corrigido para snake_case
      dadosBasePadrao, 
      colunasPersonalizadasPadrao
    );

    if (!verificacao.valido) {
      throw new Error(verificacao.erro);
    }

    // Criar planilha com campos corretos
    return await prisma.planilha.create({
      data: {
        id_usuario: usuarioId, // Corrigido para snake_case
        nome: nome || 'Minha Planilha',
        dados_base: dadosBasePadrao, // Corrigido para snake_case
        colunas_personalizadas: colunasPersonalizadasPadrao // Corrigido para snake_case
      }
    });
  }

  // Listar planilhas do usuário
  async listarPlanilhas(usuarioId) {
    return await prisma.planilha.findMany({
      where: { id_usuario: usuarioId }, // Corrigido para snake_case
      select: {
        id: true,
        nome: true,
        criada_em: true, // Corrigido para snake_case
        atualizada_em: true // Corrigido para snake_case
      },
      orderBy: { atualizada_em: 'desc' }
    });
  }

  // Obter planilha específica
  async obterPlanilha(id, usuarioId) {
    const planilha = await prisma.planilha.findFirst({
      where: {
        id: parseInt(id),
        id_usuario: usuarioId // Corrigido para snake_case
      }
    });

    if (!planilha) {
      throw new Error('Planilha não encontrada');
    }

    return planilha;
  }

  // Atualizar planilha
  async atualizarPlanilha(id, usuarioId, dados) {
    const { nome, dadosBase, colunasPersonalizadas } = dados;

    // Verificar se planilha existe e pertence ao usuário
    const planilhaExistente = await prisma.planilha.findFirst({
      where: {
        id: parseInt(id),
        id_usuario: usuarioId // Corrigido para snake_case
      },
      include: {
        usuario: {
          select: { tipo_plano: true } // Corrigido para snake_case
        }
      }
    });

    if (!planilhaExistente) {
      throw new Error('Planilha não encontrada');
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
      const dadosParaVerificar = dadosBase || planilhaExistente.dados_base; // Corrigido
      const colunasParaVerificar = colunasPersonalizadas || planilhaExistente.colunas_personalizadas; // Corrigido

      const verificacao = this.verificarLimites(
        planilhaExistente.usuario.tipo_plano, // Corrigido para snake_case
        dadosParaVerificar,
        colunasParaVerificar
      );

      if (!verificacao.valido) {
        throw new Error(verificacao.erro);
      }
    }

    // Atualizar planilha - ajustar campos para snake_case
    const dadosAtualizacaoCorrigidos = {};
    if (nome !== undefined) dadosAtualizacaoCorrigidos.nome = nome;
    if (dadosBase !== undefined) dadosAtualizacaoCorrigidos.dados_base = dadosBase;
    if (colunasPersonalizadas !== undefined) dadosAtualizacaoCorrigidos.colunas_personalizadas = colunasPersonalizadas;

    return await prisma.planilha.update({
      where: { id: parseInt(id) },
      data: dadosAtualizacaoCorrigidos
    });
  }

  // Excluir planilha
  async excluirPlanilha(id, usuarioId) {
    // Verificar se planilha existe e pertence ao usuário
    const planilha = await prisma.planilha.findFirst({
      where: {
        id: parseInt(id),
        id_usuario: usuarioId // Corrigido para snake_case
      }
    });

    if (!planilha) {
      throw new Error('Planilha não encontrada');
    }

    // Excluir planilha
    return await prisma.planilha.delete({
      where: { id: parseInt(id) }
    });
  }

  // Obter limites do plano
  async obterLimitesPlano(usuarioId) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { tipo_plano: true } // Corrigido para snake_case
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const limites = LIMITES_PLANO[usuario.tipo_plano];

    return {
      tipoPlano: usuario.tipo_plano,
      limites
    };
  }
}

module.exports = new PlanilhaService();
