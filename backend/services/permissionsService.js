/*
 * PERMISSIONS SERVICE
 * 
 * Função: Serviço centralizado para gerenciamento de permissões e roles
 * Sistema escalável que permite adicionar novos tipos de usuários e permissões
 * 
 * Funcionalidades:
 * - Verificação de permissões por usuário
 * - Gerenciamento de roles e permissões
 * - Cache de permissões para performance
 * - Validação de acesso modular
 * 
 * Estrutura de permissões:
 * - modulo.acao (ex: users.admin, spreadsheets.write)
 * - Granularidade fina para controle preciso
 * - Facilita adição de novos módulos/funcionalidades
 * 
 * Tipos de usuário suportados:
 * - user: Usuário comum (planilhas próprias)
 * - moderator: Moderador (relatórios, suporte)
 * - admin: Administrador (gerenciamento completo)
 * - master: Acesso total ao sistema
 * - Facilmente extensível para novos roles
 */

const { prisma } = require('../config/db');

class PermissionsService {
  constructor() {
    // Cache de permissões para melhor performance
    this.permissionsCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  // Obter todas as permissões de um usuário
  async getUserPermissions(usuarioId) {
    const cacheKey = `user_${usuarioId}`;
    
    // Verificar cache primeiro
    if (this.permissionsCache.has(cacheKey)) {
      const cached = this.permissionsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.permissions;
      }
    }

    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(usuarioId) },
        include: {
          role: {
            include: {
              role_permissoes: {
                include: {
                  permissao: true
                }
              }
            }
          }
        }
      });

      if (!usuario || !usuario.role) {
        return [];
      }

      const permissions = usuario.role.role_permissoes.map(rp => rp.permissao.nome);
      
      // Salvar no cache
      this.permissionsCache.set(cacheKey, {
        permissions,
        timestamp: Date.now()
      });

      return permissions;
    } catch (error) {
      console.error('Erro ao obter permissões do usuário:', error);
      return [];
    }
  }

  // Verificar se usuário tem permissão específica
  async hasPermission(usuarioId, permission) {
    const userPermissions = await this.getUserPermissions(usuarioId);
    return userPermissions.includes(permission);
  }

  // Verificar se usuário tem permissão em módulo específico
  async hasModulePermission(usuarioId, module, action) {
    const permission = `${module}.${action}`;
    return await this.hasPermission(usuarioId, permission);
  }

  // Verificar se usuário é admin de algum módulo
  async isModuleAdmin(usuarioId, module) {
    return await this.hasModulePermission(usuarioId, module, 'admin');
  }

  // Verificar se usuário tem acesso ao painel administrativo
  async hasAdminAccess(usuarioId) {
    const adminPermissions = [
      'system.read',
      'users.admin', 
      'spreadsheets.admin'
    ];

    const userPermissions = await this.getUserPermissions(usuarioId);
    return adminPermissions.some(perm => userPermissions.includes(perm));
  }

  // Limpar cache de um usuário específico
  clearUserCache(usuarioId) {
    const cacheKey = `user_${usuarioId}`;
    this.permissionsCache.delete(cacheKey);
  }

  // Limpar todo o cache
  clearAllCache() {
    this.permissionsCache.clear();
  }

  // Listar todos os roles disponíveis
  async getAllRoles() {
    try {
      return await prisma.role.findMany({
        where: { ativo: true },
        include: {
          role_permissoes: {
            include: {
              permissao: true
            }
          }
        },
        orderBy: { nome: 'asc' }
      });
    } catch (error) {
      console.error('Erro ao listar roles:', error);
      return [];
    }
  }

  // Obter permissões de um role específico
  async getRolePermissions(roleId) {
    try {
      const role = await prisma.role.findUnique({
        where: { id: parseInt(roleId) },
        include: {
          role_permissoes: {
            include: {
              permissao: true
            }
          }
        }
      });

      if (!role) return [];

      return role.role_permissoes.map(rp => rp.permissao);
    } catch (error) {
      console.error('Erro ao obter permissões do role:', error);
      return [];
    }
  }

  // Atualizar role de um usuário
  async updateUserRole(usuarioId, roleId) {
    try {
      const resultado = await prisma.usuario.update({
        where: { id: parseInt(usuarioId) },
        data: { role_id: parseInt(roleId) },
        include: {
          role: true
        }
      });

      // Limpar cache do usuário
      this.clearUserCache(usuarioId);

      return resultado;
    } catch (error) {
      console.error('Erro ao atualizar role do usuário:', error);
      throw error;
    }
  }

  // Criar novo role
  async createRole(nome, descricao, permissoes = []) {
    try {
      const role = await prisma.role.create({
        data: {
          nome,
          descricao,
          role_permissoes: {
            create: permissoes.map(permissaoId => ({
              permissao_id: parseInt(permissaoId)
            }))
          }
        },
        include: {
          role_permissoes: {
            include: {
              permissao: true
            }
          }
        }
      });

      return role;
    } catch (error) {
      console.error('Erro ao criar role:', error);
      throw error;
    }
  }

  // Listar todas as permissões disponíveis
  async getAllPermissions() {
    try {
      return await prisma.permissao.findMany({
        orderBy: [
          { modulo: 'asc' },
          { acao: 'asc' }
        ]
      });
    } catch (error) {
      console.error('Erro ao listar permissões:', error);
      return [];
    }
  }

  // Middleware para verificar permissões
  checkPermission(permission) {
    return async (req, res, next) => {
      try {
        const hasAccess = await this.hasPermission(req.usuarioId, permission);
        
        if (!hasAccess) {
          return res.status(403).json({ 
            erro: 'Acesso negado. Permissão insuficiente.',
            permissaoNecessaria: permission
          });
        }

        next();
      } catch (error) {
        console.error('Erro ao verificar permissão:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
      }
    };
  }

  // Middleware para verificar acesso admin
  checkAdminAccess() {
    return async (req, res, next) => {
      try {
        const hasAccess = await this.hasAdminAccess(req.usuarioId);
        
        if (!hasAccess) {
          return res.status(403).json({ 
            erro: 'Acesso negado. Permissão de administrador necessária.'
          });
        }

        next();
      } catch (error) {
        console.error('Erro ao verificar acesso admin:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
      }
    };
  }
}

module.exports = new PermissionsService();