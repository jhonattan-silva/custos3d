/*
 * Função: Sidebar deslizante para visualização e edição das configurações da planilha
 * Permite alterar valores base usados nos cálculos automáticos
 * 
 * Funcionalidades:
 * - Modo visualização: Exibe configurações organizadas em seções
 * - Modo edição: Permite alterar todas as configurações
 * - Exemplo em tempo real: Mostra cálculo atualizado conforme edita
 * - Animação de abertura/fechamento
 * - Overlay para fechar clicando fora
 * 
 * Props:
 * - aberto (boolean): Controla se sidebar está visível
 * - onFechar (function): Callback para fechar sidebar
 * - configuracoes (object): Configurações atuais da planilha
 * - onSalvarConfiguracoes (function): Callback para salvar alterações
 * - carregandoSalvar (boolean): Flag de loading durante salvamento
 * 
 * Estados internos:
 * - config: Configurações locais (editáveis)
 * - editando: Flag do modo edição
 * 
 * Configurações gerenciadas:
 * - custoKgFilamento, custoEnergia, potenciaImpressora
 * - custoHora, margemLucro, custoFixoMensal, horasTrabalhoMes
 */

import React, { useState } from 'react';
import CampoForm from '../CampoForm/CampoForm';
import Botao from '../Botao/Botao';
import styles from './Sidebar.module.css';

const Sidebar = ({
  aberto,
  onFechar,
  configuracoes,
  onSalvarConfiguracoes,
  carregandoSalvar = false
}) => {
  const [config, setConfig] = useState(configuracoes || {
    custoKgFilamento: 80,
    custoEnergia: 0.65,
    potenciaImpressora: 200,
    custoHora: 50,
    margemLucro: 30,
    custoFixoMensal: 500,
    horasTrabalhoMes: 160
  });

  const [editando, setEditando] = useState(false);

  // Atualiza configuração local
  const atualizarConfig = (campo, valor) => {
    setConfig(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Salva as configurações
  const salvarConfiguracoes = async () => {
    try {
      await onSalvarConfiguracoes(config);
      setEditando(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  // Cancela edição e volta aos valores originais
  const cancelarEdicao = () => {
    setConfig(configuracoes);
    setEditando(false);
  };

  // Calcula exemplo de custo
  const calcularExemplo = () => {
    const pesoExemplo = 15; // 15g
    const tempoExemplo = 2.5; // 2.5h

    const custoMaterial = (pesoExemplo / 1000) * config.custoKgFilamento;
    const custoEnergia = tempoExemplo * config.custoEnergia * (config.potenciaImpressora / 1000);
    const custoTrabalho = (tempoExemplo * 0.2) * config.custoHora;
    const custoTotal = custoMaterial + custoEnergia + custoTrabalho;
    const precoFinal = custoTotal * (1 + (config.margemLucro / 100));

    return {
      custoMaterial: custoMaterial.toFixed(2),
      custoEnergia: custoEnergia.toFixed(2),
      custoTrabalho: custoTrabalho.toFixed(2),
      precoFinal: precoFinal.toFixed(2)
    };
  };

  const exemplo = calcularExemplo();

  return (
    <>
      {/* Overlay para fechar sidebar */}
      {aberto && (
        <div 
          className={styles.overlay}
          onClick={onFechar}
        />
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${aberto ? styles.aberto : ''}`}>
        <div className={styles.header}>
          <div className={styles.titulo}>
            <h3>⚙️ Configurações</h3>
            <p>Valores base para cálculos</p>
          </div>
          <button 
            onClick={onFechar}
            className={styles.botaoFechar}
            title="Fechar"
          >
            ×
          </button>
        </div>

        <div className={styles.conteudo}>
          {!editando ? (
            // Modo visualização
            <div className={styles.visualizacao}>
              <div className={styles.secao}>
                <h4>💰 Custos Operacionais</h4>
                <div className={styles.item}>
                  <span className={styles.label}>🧵 Filamento (R$/kg):</span>
                  <span className={styles.valor}>R$ {config.custoKgFilamento.toFixed(2)}</span>
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>⚡ Energia (R$/kWh):</span>
                  <span className={styles.valor}>R$ {config.custoEnergia.toFixed(3)}</span>
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>🔌 Potência (W):</span>
                  <span className={styles.valor}>{config.potenciaImpressora}W</span>
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>👷 Hora Trabalho (R$/h):</span>
                  <span className={styles.valor}>R$ {config.custoHora.toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.secao}>
                <h4>📊 Margem e Custos</h4>
                <div className={styles.item}>
                  <span className={styles.label}>💰 Margem de Lucro:</span>
                  <span className={styles.valor}>{config.margemLucro}%</span>
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>🏢 Custos Fixos/Mês:</span>
                  <span className={styles.valor}>R$ {config.custoFixoMensal.toFixed(2)}</span>
                </div>
                <div className={styles.item}>
                  <span className={styles.label}>⏰ Horas Trabalho/Mês:</span>
                  <span className={styles.valor}>{config.horasTrabalhoMes}h</span>
                </div>
              </div>

              <div className={styles.exemplo}>
                <h4>📋 Exemplo de Cálculo</h4>
                <p className={styles.exemploDescricao}>Miniatura 15g, 2.5h impressão</p>
                <div className={styles.exemploCalculo}>
                  <div className={styles.exemploItem}>
                    <span>Material:</span>
                    <span>R$ {exemplo.custoMaterial}</span>
                  </div>
                  <div className={styles.exemploItem}>
                    <span>Energia:</span>
                    <span>R$ {exemplo.custoEnergia}</span>
                  </div>
                  <div className={styles.exemploItem}>
                    <span>Trabalho:</span>
                    <span>R$ {exemplo.custoTrabalho}</span>
                  </div>
                  <div className={styles.exemploTotal}>
                    <span>Preço Final:</span>
                    <strong>R$ {exemplo.precoFinal}</strong>
                  </div>
                </div>
              </div>

              <Botao 
                onClick={() => setEditando(true)}
                variante="primary"
                className={styles.botaoEditar}
              >
                ✏️ Editar Configurações
              </Botao>
            </div>
          ) : (
            // Modo edição
            <div className={styles.edicao}>
              <div className={styles.formEdicao}>
                <CampoForm
                  rotulo="🧵 Custo do Filamento (R$/kg)"
                  tooltip="Preço médio do filamento por quilograma"
                >
                  <input
                    type="number"
                    value={config.custoKgFilamento}
                    onChange={(e) => atualizarConfig('custoKgFilamento', parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                  />
                </CampoForm>

                <CampoForm
                  rotulo="⚡ Custo da Energia (R$/kWh)"
                  tooltip="Tarifa de energia elétrica por kWh"
                >
                  <input
                    type="number"
                    value={config.custoEnergia}
                    onChange={(e) => atualizarConfig('custoEnergia', parseFloat(e.target.value) || 0)}
                    step="0.001"
                    min="0"
                  />
                </CampoForm>

                <CampoForm
                  rotulo="🔌 Potência da Impressora (W)"
                  tooltip="Potência total da impressora 3D em watts"
                >
                  <input
                    type="number"
                    value={config.potenciaImpressora}
                    onChange={(e) => atualizarConfig('potenciaImpressora', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </CampoForm>

                <CampoForm
                  rotulo="👷 Custo Hora de Trabalho (R$/h)"
                  tooltip="Valor da sua hora de trabalho para pós-processamento"
                >
                  <input
                    type="number"
                    value={config.custoHora}
                    onChange={(e) => atualizarConfig('custoHora', parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                  />
                </CampoForm>

                <CampoForm
                  rotulo="💰 Margem de Lucro (%)"
                  tooltip="Percentual de lucro aplicado sobre os custos totais"
                >
                  <input
                    type="number"
                    value={config.margemLucro}
                    onChange={(e) => atualizarConfig('margemLucro', parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </CampoForm>

                <CampoForm
                  rotulo="🏢 Custos Fixos Mensais (R$)"
                  tooltip="Custos fixos mensais do negócio"
                >
                  <input
                    type="number"
                    value={config.custoFixoMensal}
                    onChange={(e) => atualizarConfig('custoFixoMensal', parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                  />
                </CampoForm>
              </div>

              <div className={styles.botoesEdicao}>
                <Botao 
                  onClick={cancelarEdicao}
                  variante="secondary"
                  tamanho="small"
                >
                  Cancelar
                </Botao>
                <Botao 
                  onClick={salvarConfiguracoes}
                  variante="success"
                  tamanho="small"
                  carregando={carregandoSalvar}
                >
                  💾 Salvar
                </Botao>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
