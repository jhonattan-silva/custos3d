# Dockerfile para o frontend React
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (cache otimizado)
COPY package*.json ./

# Limpar cache npm e instalar dependências
RUN npm cache clean --force && npm install

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Comando para desenvolvimento
CMD ["npm", "start"]

