-- CreateTable
CREATE TABLE `maquinas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `marca` VARCHAR(191) NULL,
    `modelo` VARCHAR(191) NULL,
    `preco_compra` DOUBLE NULL,
    `custo_energia_hora` DOUBLE NOT NULL DEFAULT 0.15,
    `taxa_depreciacao` DOUBLE NOT NULL DEFAULT 0.1,
    `vida_util_horas` INTEGER NULL,
    `consumo_watts` INTEGER NULL,
    `observacoes` VARCHAR(191) NULL,
    `ativa` BOOLEAN NOT NULL DEFAULT true,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materiais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo_material` VARCHAR(191) NOT NULL,
    `preco_unidade` DOUBLE NOT NULL,
    `unidade_medida` VARCHAR(191) NOT NULL DEFAULT 'kg',
    `cor` VARCHAR(191) NULL,
    `densidade_g_cm3` DOUBLE NULL,
    `temperatura_impressao` INTEGER NULL,
    `fornecedor` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipos_mao_obra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `categoria` VARCHAR(191) NOT NULL,
    `valor_por_minuto` DOUBLE NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projetos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL DEFAULT 'Novo Projeto',
    `nome_cliente` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'rascunho',
    `valor_total_estimado` DOUBLE NULL,
    `margem_lucro_percent` DOUBLE NOT NULL DEFAULT 30,
    `moeda` VARCHAR(191) NOT NULL DEFAULT 'BRL',
    `dados_base` JSON NOT NULL,
    `colunas_personalizadas` JSON NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_projeto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_projeto` INTEGER NOT NULL,
    `id_maquina` INTEGER NULL,
    `id_material` INTEGER NULL,
    `ordem_item` INTEGER NOT NULL,
    `campos_padrao` JSON NOT NULL,
    `campos_calculados` JSON NOT NULL,
    `campos_personalizados` JSON NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `maquinas` ADD CONSTRAINT `maquinas_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materiais` ADD CONSTRAINT `materiais_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tipos_mao_obra` ADD CONSTRAINT `tipos_mao_obra_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projetos` ADD CONSTRAINT `projetos_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_projeto` ADD CONSTRAINT `itens_projeto_id_projeto_fkey` FOREIGN KEY (`id_projeto`) REFERENCES `projetos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_projeto` ADD CONSTRAINT `itens_projeto_id_maquina_fkey` FOREIGN KEY (`id_maquina`) REFERENCES `maquinas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_projeto` ADD CONSTRAINT `itens_projeto_id_material_fkey` FOREIGN KEY (`id_material`) REFERENCES `materiais`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
