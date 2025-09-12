#!/bin/sh

echo "🔄 Aguardando MySQL estar disponível..."

# Aguardar MySQL
while ! nc -z mysql 3306; do
  echo "⏳ MySQL não está pronto ainda..."
  sleep 2
done

echo "✅ MySQL está pronto!"

# Instalar dependências se não existirem
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Aplicar migrações
echo "🗄️ Aplicando migrações..."
npx prisma db push

# Iniciar servidor
echo "🚀 Iniciando servidor..."
if [ "$NODE_ENV" = "production" ]; then
    npm start
else
    npm run dev
fi