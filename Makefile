# Makefile para facilitar comandos Docker do projeto

# Comandos principais
.PHONY: up down build logs shell migrate studio clean

# Subir todos os serviços (backend + frontend + mysql)
up:
	docker-compose up -d

# Subir com logs visíveis
up-logs:
	docker-compose up

# Parar todos os serviços
down:
	docker-compose down

# Rebuild e subir
build:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

# Rebuild completo (limpa volumes também)
recriar:
	@echo "🧹 Limpando ambiente..."
	docker-compose down -v
	docker volume prune -f
	@echo "🔨 Reconstruindo imagens..."
	docker-compose build --no-cache
	@echo "🚀 Iniciando serviços..."
	docker-compose up -d mysql
	@echo "⏳ Aguardando MySQL inicializar..."
	@timeout /t 30 /nobreak > nul
	docker-compose up -d backend
	@echo "⏳ Aguardando backend inicializar..."
	@timeout /t 20 /nobreak > nul
	docker-compose up -d frontend
	@echo "✅ Todos os serviços iniciados!"
	@echo "🔗 Frontend: http://localhost:3000"
	@echo "🔗 Backend: http://localhost:3001"
	@echo "📊 Para acessar o Prisma Studio: make studio"

# Rebuild apenas o backend
rebuild-backend:
	docker-compose stop backend
	docker-compose build --no-cache backend
	docker-compose up -d backend

# Rebuild apenas o frontend
rebuild-frontend:
	docker-compose stop frontend
	docker-compose build --no-cache frontend
	docker-compose up -d frontend

# Debug: rebuild e acompanhar logs do backend
debug-backend:
	docker-compose down
	docker-compose build --no-cache backend
	docker-compose up -d mysql
	@echo "⏳ Aguardando MySQL iniciar..."
	@sleep 10
	docker-compose up backend

# Debug: acompanhar apenas logs do backend em tempo real
watch-backend:
	docker-compose logs -f backend

# Ver logs de todos os serviços
logs:
	docker-compose logs -f

# Ver logs apenas do backend
logs-backend:
	docker-compose logs -f backend

# Ver logs apenas do frontend
logs-frontend:
	docker-compose logs -f frontend

# Ver logs apenas do MySQL
logs-mysql:
	docker-compose logs -f mysql

# Entrar no container do backend
shell-backend:
	docker-compose exec backend sh

# Entrar no container do frontend
shell-frontend:
	docker-compose exec frontend sh

# Executar migrações
migrate:
	docker-compose exec backend npx prisma migrate dev

# Gerar cliente Prisma
generate:
	docker-compose exec backend npx prisma generate

# Subir Prisma Studio
studio:
	docker-compose --profile studio up prisma-studio -d

# Parar Prisma Studio
studio-down:
	docker-compose stop prisma-studio

# Reset do banco (cuidado!)
reset-db:
	docker-compose exec backend npx prisma migrate reset

# Limpar tudo (volumes, containers, etc)
clean:
	docker-compose down -v
	docker system prune -f

# Status dos containers
status:
	docker-compose ps

# Instalar dependências no backend
install-backend:
	docker-compose exec backend npm install

# Instalar dependências no frontend
install-frontend:
	docker-compose exec frontend npm install

# Comando mais simples para Windows
start:
	@echo "🚀 Iniciando todos os serviços..."
	docker-compose up -d
	@echo "✅ Serviços iniciados!"
	@echo "🔗 Frontend: http://localhost:3000"
	@echo "🔗 Backend: http://localhost:3001"
	@echo "📊 Para acessar o Prisma Studio: make studio"

# Inicialização passo a passo para Windows
init-win:
	@echo "🧹 Limpando ambiente..."
	docker-compose down -v
	docker volume prune -f
	@echo "🔨 Reconstruindo imagens..."
	docker-compose build --no-cache
	@echo "🗄️ Iniciando MySQL..."
	docker-compose up -d mysql
	@echo "⏳ Aguarde 30 segundos e depois execute: make start-backend"

# Iniciar backend após MySQL estar pronto
start-backend:
	@echo "🚀 Iniciando backend..."
	docker-compose up -d backend
	@echo "⏳ Aguarde 20 segundos e depois execute: make start-frontend"

# Iniciar frontend após backend estar pronto  
start-frontend:
	@echo "🎨 Iniciando frontend..."
	docker-compose up -d frontend
	@echo "✅ Todos os serviços iniciados!"
	@echo "🔗 Frontend: http://localhost:3000"
	@echo "🔗 Backend: http://localhost:3001"

