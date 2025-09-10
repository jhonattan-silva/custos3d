const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

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

// CORS
app.use(cors());

// Rotas
const usuariosRoutes = require('./routes/usuariosRoutes');
app.use('/api/usuarios', usuariosRoutes);

// Rota de teste 
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando!' });
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