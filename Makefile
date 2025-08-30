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

# Comandos específicos para desenvolvimento
dev-backend:
	docker-compose up backend mysql -d

dev-frontend:
	docker-compose up frontend -d

dev-full:
	docker-compose up -d

