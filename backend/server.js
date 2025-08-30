const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const PROD_CERT_PATH = "/etc/letsencrypt/live/seusite.com.br/";

// Conexão com banco de dados
const { conectarBanco } = require('./config/db');

// Middlewares globais
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(helmet());

// CORS com controle de origem
const allowedOrigins = [
  'http://localhost:3000',
  'https://seusite.com.br'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Rotas
const usuariosRoutes = require('./routes/usuariosRoutes');
const planilhasRoutes = require('./routes/planilhasRoutes');

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/planilhas', planilhasRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'API de Precificação 3D funcionando!',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Precificação 3D API',
    timestamp: new Date().toISOString()
  });
});

// Servir arquivos estáticos (ex: uploads)
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Servir frontend em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
  });
}

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    erro: 'Rota não encontrada',
    metodo: req.method,
    url: req.originalUrl
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    erro: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

// Inicialização do servidor
async function iniciarServidor() {
  try {
    await conectarBanco();

    if (process.env.DISABLE_SSL === 'true') {
      iniciarHttp();
    } else if (process.env.NODE_ENV === 'production') {
      iniciarHttps(
        path.join(PROD_CERT_PATH, 'privkey.pem'),
        path.join(PROD_CERT_PATH, 'fullchain.pem')
      );
    } else if (process.env.SSL_CERT_PATH && process.env.SSL_KEY_PATH) {
      iniciarHttps(process.env.SSL_KEY_PATH, process.env.SSL_CERT_PATH);
    } else {
      iniciarHttp();
    }
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Função para iniciar servidor HTTP
function iniciarHttp() {
  http.createServer(app).listen(PORT, () => {
    console.log(`🚀 Servidor HTTP rodando na porta ${PORT}`);
  });
}

// Função para iniciar servidor HTTPS
function iniciarHttps(keyPath, certPath) {
  try {
    const privateKey = fs.readFileSync(path.resolve(keyPath), 'utf8');
    const certificate = fs.readFileSync(path.resolve(certPath), 'utf8');
    const credentials = { key: privateKey, cert: certificate };

    https.createServer(credentials, app).listen(PORT, () => {
      console.log(`🔒 Servidor HTTPS rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Certificados não encontrados. Executando servidor em HTTP.');
    iniciarHttp();
  }
}

// Encerramento gracioso
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  const { desconectarBanco } = require('./config/db');
  await desconectarBanco();
  process.exit(0);
});

// Iniciar aplicação
iniciarServidor();