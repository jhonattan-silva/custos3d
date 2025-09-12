const { PrismaClient } = require('@prisma/client');

let prisma;

const conectarBanco = async () => {
  try {
    if (!prisma) {
      console.log('🔌 Conectando ao banco de dados...');
      prisma = new PrismaClient({
        log: ['info', 'warn', 'error'],
        errorFormat: 'pretty',
      });
      
      // Tentar conectar com retry
      let tentativas = 5;
      while (tentativas > 0) {
        try {
          await prisma.$connect();
          console.log('✅ Conectado ao banco de dados');
          break;
        } catch (error) {
          tentativas--;
          console.log(`❌ Tentativa de conexão falhou. Tentativas restantes: ${tentativas}`);
          if (tentativas === 0) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    return prisma;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error);
    throw error;
  }
};

const desconectarBanco = async () => {
  try {
    if (prisma) {
      await prisma.$disconnect();
      console.log('🔌 Desconectado do banco de dados');
    }
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco:', error);
  }
};

// Função para obter a instância do prisma
const obterPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }
  return prisma;
};

module.exports = {
  prisma: obterPrisma(),
  conectarBanco,
  desconectarBanco,
  obterPrisma
};

