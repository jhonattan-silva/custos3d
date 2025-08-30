// Arquivo para testes manuais da API
// Execute com: node utils/testesApi.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
let token = '';

// Configurar axios para incluir token automaticamente
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Função para exibir resultados
const log = (titulo, dados) => {
  console.log(`\n🔍 ${titulo}`);
  console.log('='.repeat(50));
  console.log(JSON.stringify(dados, null, 2));
};

// Função para tratar erros
const tratarErro = (erro, operacao) => {
  console.log(`\n❌ Erro em ${operacao}:`);
  if (erro.response) {
    console.log('Status:', erro.response.status);
    console.log('Dados:', erro.response.data);
  } else {
    console.log('Erro:', erro.message);
  }
};

// Testes da API
async function executarTestes() {
  try {
    console.log('🚀 Iniciando testes da API...');

    // 1. Testar status da API
    console.log('\n📡 Testando conexão com a API...');
    const status = await api.get('/health');
    log('Status da API', status.data);

    // 2. Registrar usuário
    console.log('\n👤 Registrando usuário...');
    const novoUsuario = {
      email: `teste${Date.now()}@email.com`,
      senha: '123456'
    };

    const registro = await api.post('/api/usuarios/registrar', novoUsuario);
    log('Usuário registrado', registro.data);
    
    // Salvar token
    token = registro.data.token;

    // 3. Fazer login
    console.log('\n🔐 Fazendo login...');
    const login = await api.post('/api/usuarios/login', {
      email: novoUsuario.email,
      senha: novoUsuario.senha
    });
    log('Login realizado', login.data);

    // 4. Obter perfil
    console.log('\n👤 Obtendo perfil...');
    const perfil = await api.get('/api/usuarios/perfil');
    log('Perfil do usuário', perfil.data);

    // 5. Obter limites do plano
    console.log('\n📊 Obtendo limites do plano...');
    const limites = await api.get('/api/planilhas/limites');
    log('Limites do plano', limites.data);

    // 6. Criar planilha
    console.log('\n📋 Criando planilha...');
    const novaPlanilha = {
      nome: 'Planilha de Teste',
      dadosBase: {
        linhas: [
          {
            id: 1,
            nome: 'Peça Teste',
            material: 'PLA',
            peso: 50,
            tempo: 120,
            custo: 15.50
          }
        ],
        configuracao: {
          moeda: 'BRL',
          margemLucro: 30,
          custoHora: 50
        }
      },
      colunasPersonalizadas: {
        colunas: [
          {
            id: 1,
            nome: 'Pós-processamento',
            tipo: 'numero',
            valor: 5.00
          }
        ]
      }
    };

    const planilhaCriada = await api.post('/api/planilhas', novaPlanilha);
    log('Planilha criada', planilhaCriada.data);

    const planilhaId = planilhaCriada.data.planilha.id;

    // 7. Listar planilhas
    console.log('\n📋 Listando planilhas...');
    const planilhas = await api.get('/api/planilhas');
    log('Lista de planilhas', planilhas.data);

    // 8. Obter planilha específica
    console.log('\n📋 Obtendo planilha específica...');
    const planilhaEspecifica = await api.get(`/api/planilhas/${planilhaId}`);
    log('Planilha específica', planilhaEspecifica.data);

    // 9. Atualizar planilha
    console.log('\n📋 Atualizando planilha...');
    const planilhaAtualizada = await api.put(`/api/planilhas/${planilhaId}`, {
      nome: 'Planilha Atualizada',
      dadosBase: {
        ...novaPlanilha.dadosBase,
        linhas: [
          ...novaPlanilha.dadosBase.linhas,
          {
            id: 2,
            nome: 'Segunda Peça',
            material: 'PETG',
            peso: 75,
            tempo: 180,
            custo: 22.50
          }
        ]
      }
    });
    log('Planilha atualizada', planilhaAtualizada.data);

    // 10. Testar limite de linhas (para plano gratuito)
    console.log('\n⚠️ Testando limite de linhas...');
    try {
      const planilhaComMuitasLinhas = {
        nome: 'Teste Limite',
        dadosBase: {
          linhas: Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            nome: `Peça ${i + 1}`,
            material: 'PLA',
            peso: 50,
            tempo: 120,
            custo: 15.50
          })),
          configuracao: novaPlanilha.dadosBase.configuracao
        },
        colunasPersonalizadas: { colunas: [] }
      };

      await api.post('/api/planilhas', planilhaComMuitasLinhas);
    } catch (erro) {
      console.log('✅ Limite de linhas funcionando corretamente');
      console.log('Erro esperado:', erro.response.data.erro);
    }

    console.log('\n✅ Todos os testes concluídos com sucesso!');

  } catch (erro) {
    tratarErro(erro, 'execução dos testes');
  }
}

// Executar testes se arquivo for chamado diretamente
if (require.main === module) {
  executarTestes();
}

module.exports = { executarTestes };

