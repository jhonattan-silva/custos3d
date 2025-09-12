// filepath: c:\Users\TI\PROJETOS\custos-3d\backend\prisma\seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar permissões
  const permissoes = [
    { nome: 'criar_planilha', modulo: 'planilha', acao: 'criar' },
    { nome: 'editar_planilha', modulo: 'planilha', acao: 'editar' },
    { nome: 'deletar_planilha', modulo: 'planilha', acao: 'deletar' },
    { nome: 'visualizar_planilha', modulo: 'planilha', acao: 'visualizar' },
    { nome: 'gerenciar_maquinas', modulo: 'maquina', acao: 'gerenciar' },
    { nome: 'gerenciar_materiais', modulo: 'material', acao: 'gerenciar' },
    { nome: 'gerenciar_mao_obra', modulo: 'mao_obra', acao: 'gerenciar' },
    { nome: 'administrar_usuarios', modulo: 'usuario', acao: 'administrar' },
  ];

  for (const perm of permissoes) {
    await prisma.permissao.upsert({
      where: { nome: perm.nome },
      update: {},
      create: perm,
    });
  }

  console.log('✅ Permissões criadas');

  // Criar roles
  const roles = [
    {
      nome: 'admin',
      descricao: 'Administrador com acesso total',
      permissoes: permissoes.map(p => p.nome), // Todas as permissões
    },
    {
      nome: 'usuario',
      descricao: 'Usuário padrão',
      permissoes: ['criar_planilha', 'editar_planilha', 'deletar_planilha', 'visualizar_planilha', 'gerenciar_maquinas', 'gerenciar_materiais', 'gerenciar_mao_obra'],
    },
  ];

  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { nome: roleData.nome },
      update: {},
      create: {
        nome: roleData.nome,
        descricao: roleData.descricao,
      },
    });

    // Associar permissões ao role
    for (const permNome of roleData.permissoes) {
      const permissao = await prisma.permissao.findUnique({ where: { nome: permNome } });
      if (permissao) {
        await prisma.rolePermissao.upsert({
          where: { roleId_permissaoId: { roleId: role.id, permissaoId: permissao.id } },
          update: {},
          create: { roleId: role.id, permissaoId: permissao.id },
        });
      }
    }
  }

  console.log('✅ Roles e permissões associadas criadas');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });