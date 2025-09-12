# Dockerfile para o backend Node.js
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache openssl netcat-openbsd

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Expor porta
EXPOSE 3001

# Comando para desenvolvimento
CMD ["sh", "-c", "sleep 15 && npx prisma generate && npx prisma db push && npm run dev"]

