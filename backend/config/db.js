const { PrismaClient } = require('@prisma/client');

// Instância única do Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Logs para desenvolvimento
});

// Função para conectar ao banco
async function conectarBanco() {
  try {
    await prisma.$connect();
    console.log('✅ Yahooo! Conectado ao Banco!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

// Função para desconectar do banco
async function desconectarBanco() {
  await prisma.$disconnect();
  console.log('🔌 Desconectado do banco de dados');
}

module.exports = {
  prisma,
  conectarBanco,
  desconectarBanco
};

