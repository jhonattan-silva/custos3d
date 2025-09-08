/*
 * DASHBOARD COMPONENT
 * 
 * Função: Página principal do usuário após login, exibe e gerencia planilhas de precificação 3D
 * 
 * Funcionalidades:
 * - Listagem de planilhas do usuário
 * - Criação de novas planilhas via modal de configuração
 * - Exclusão de planilhas existentes
 * - Exibição de informações do plano (limites)
 * - Tutorial para novos usuários
 * - Navegação para edição de planilhas
 * 
 * Estados principais:
 * - planilhas: Array com planilhas do usuário
 * - limites: Informações do plano e limites
 * - carregando: Flag de loading inicial
 * - erro: Mensagens de erro para usuário
 * - criandoPlanilha: Flag de loading para criação
 * - mostrarModalConfig: Controle do modal de configuração
 * - configInicial: Configurações padrão para nova planilha
 * 
 * Funções principais:
 * - carregarDados: Busca planilhas do backend
 * - criarPlanilhaCompleta: Cria planilha com configurações
 * - excluirPlanilha: Remove planilha após confirmação
 * - iniciarCriacaoPlanilha: Abre modal de configuração
 * 
 * Props: Nenhuma (página principal)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { planilhaService } from '../../services/api';
import Modal from '../../components/Modal/Modal';
import Botao from '../../components/Botao/Botao';
import CampoForm from '../../components/CampoForm/CampoForm';
import ListaSuspensa from '../../components/ListaSuspensa/ListaSuspensa'; // Importando o componente de lista suspensa
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [planilhas, setPlanilhas] = useState([]);  // Info das planilhas do usuário
  const [limites, setLimites] = useState(null); //info do plano contratado
  const [carregando, setCarregando] = useState(true); //utilitario de loading  
  const [erro, setErro] = useState(''); //utilitario de erros  
  const [criandoPlanilha, setCriandoPlanilha] = useState(false); //Controle criação/edição  
  const [mostrarTutorial, setMostrarTutorial] = useState(false); //Utilitário tutorial
  const [mostrarModalConfig, setMostrarModalConfig] = useState(false); // Novo estado para controlar o modal de configuração inicial

  const { usuario, logout } = useAuth(); //useAuth para logout
  const navigate = useNavigate(); //useNavigate para navegação entre páginas

  const [configInicial, setConfigInicial] = useState({
    nomePlanilha: 'Nova Planilha',
    custoKgFilamento: 80, // R$ por kg
    custoEnergia: 0.65, // R$ por kWh  
    potenciaImpressora: 200, // Watts
    custoHora: 50, // R$ por hora de trabalho
    margemLucro: 30, // %
    custoFixoMensal: 500, // Custos fixos (aluguel, etc)
    horasTrabalhoMes: 160 // Horas úteis por mês
  });

  // Quando o componente carrega, já vai buscar os dados
  useEffect(() => {
    carregarDados();
  }, []);

  // Mostra o tutorial
  useEffect(() => {
    if (planilhas.length === 0 && !carregando) { //se não tem planilhas e não está mais carregando
      setMostrarTutorial(true);
    }
  }, [planilhas, carregando]);

  // Carrega as planilhas do backend
  const carregarDados = async () => {
    try {
      setCarregando(true);
      
      // Tenta carregar as planilhas do backend
      const planilhasData = await planilhaService.listar();
      setPlanilhas(planilhasData);
      
      // AINDA SEM LIMITES ESPECIFICADOS
      setLimites({
        tipoPlano: 'gratuito',
        limites: {
          maxLinhas: 50,
          maxColunasPersonalizadas: 3
        }
      });
    } catch (error) {
      console.error('Erro detalhado:', error);
      
      // Se for erro 404, significa que o endpoint não existe ainda
      if (error.response?.status === 404) {
        setErro('⚠️ Backend ainda não implementado - usando dados de exemplo');
        // Define dados de exemplo para desenvolvimento
        setPlanilhas([]);
      } else if (error.code === 'ERR_NETWORK') {
        setErro('❌ Servidor backend não está rodando (verifique se está na porta 3001)');
        setPlanilhas([]);
      } else {
        setErro('Erro ao carregar planilhas');
      }
      
      // Mesmo com erro, define os limites padrão
      setLimites({
        tipoPlano: 'gratuito',
        limites: {
          maxLinhas: 50,
          maxColunasPersonalizadas: 3
        }
      });
    } finally {
      setCarregando(false);
    }
  };

  // Inicia o processo de criação de planilha abrindo o modal
  const iniciarCriacaoPlanilha = () => {
    setMostrarModalConfig(true);
  };

  // Cria uma planilha com estrutura básica e configurações
  const criarPlanilhaCompleta = async () => {
    try {
      setCriandoPlanilha(true);
      
      // Estrutura básica da planilha com colunas essenciais
      const estruturaBasica = {
        nome: configInicial.nomePlanilha,
        dadosBase: {
          linhas: [
            // Primeira linha vazia pronta para edição
            {
              id: Date.now(),
              item: '',
              material: 'PLA',
              peso: 0,
              tempoImpressao: 0,
              suporte: 'Não',
              complexidade: 'Média',
              custoMaterial: '0.00',
              custoEnergia: '0.00',
              custoTrabalho: '0.00',
              precoFinal: '0.00'
            }
          ],
          configuracao: {
            moeda: 'BRL',
            custoKgFilamento: configInicial.custoKgFilamento,
            custoEnergia: configInicial.custoEnergia,
            potenciaImpressora: configInicial.potenciaImpressora,
            custoHora: configInicial.custoHora,
            margemLucro: configInicial.margemLucro,
            custoFixoMensal: configInicial.custoFixoMensal,
            horasTrabalhoMes: configInicial.horasTrabalhoMes
          }
        },
        colunasPersonalizadas: {
          colunas: [
            // Colunas básicas da planilha de precificação 3D
            { id: 'item', nome: 'Item/Produto', tipo: 'texto', editavel: true },
            { id: 'material', nome: 'Material', tipo: 'select', opcoes: ['PLA', 'ABS', 'PETG', 'TPU'], editavel: true },
            { id: 'peso', nome: 'Peso (g)', tipo: 'numero', editavel: true },
            { id: 'tempoImpressao', nome: 'Tempo (h)', tipo: 'numero', editavel: true },
            { id: 'suporte', nome: 'Suporte', tipo: 'select', opcoes: ['Sim', 'Não'], editavel: true },
            { id: 'complexidade', nome: 'Complexidade', tipo: 'select', opcoes: ['Baixa', 'Média', 'Alta'], editavel: true },
            { id: 'custoMaterial', nome: 'Custo Material (R$)', tipo: 'moeda', editavel: false, calculado: true },
            { id: 'custoEnergia', nome: 'Custo Energia (R$)', tipo: 'moeda', editavel: false, calculado: true },
            { id: 'custoTrabalho', nome: 'Custo Trabalho (R$)', tipo: 'moeda', editavel: false, calculado: true },
            { id: 'precoFinal', nome: 'Preço Final (R$)', tipo: 'moeda', editavel: false, calculado: true }
          ]
        }
      };

      const novaPlanilha = await planilhaService.criar(estruturaBasica);
      
      // Fecha o modal e navega para a planilha
      setMostrarModalConfig(false);
      navigate(`/planilha/${novaPlanilha.planilha.id}`);
    } catch (error) {
      console.error('Erro ao criar planilha:', error);
      
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        setErro('⚠️ Backend em desenvolvimento - simulando criação');
        setMostrarModalConfig(false);
        // Para desenvolvimento, navega para uma planilha simulada
        navigate('/planilha/dev-exemplo');
      } else {
        const mensagem = error.response?.data?.erro || 'Erro ao criar planilha';
        setErro(mensagem);
      }
    } finally {
      setCriandoPlanilha(false);
    }
  };

  // Atualiza um campo da configuração inicial
  const atualizarConfig = (campo, valor) => {
    setConfigInicial(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Apaga uma planilha
  const excluirPlanilha = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir a planilha "${nome}"?`)) {
      return; // Se cancelou, nem faz nada
    }

    try {
      await planilhaService.excluir(id);
      // Remove da lista local sem precisar recarregar tudo
      setPlanilhas(planilhas.filter(p => p.id !== id));
    } catch (error) {
      setErro('Erro ao excluir planilha');
    }
  };

  // Formata a data pra ficar bonita no padrão brasileiro
  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Se ainda tá carregando, mostra a telinha de loading
  if (carregando) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Carregando suas planilhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <header className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1>🎯 Precificação 3D</h1>
            <p>Bem-vindo, {usuario?.email}</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.planoInfo}>
              <span className={`${styles.planoBadge} ${styles[`plano${limites?.tipoPlano?.charAt(0).toUpperCase() + limites?.tipoPlano?.slice(1)}`]}`}>
                {limites?.tipoPlano?.toUpperCase()}
              </span>
            </div>
            <button onClick={logout} className={styles.logoutButton}>
              🚪 Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className={styles.dashboardMain}>
        {erro && (
          <div className={styles.errorBanner}>
            ⚠️ {erro}
            <button onClick={() => setErro('')} className={styles.errorClose}>×</button>
          </div>
        )}

        {/* Tutorial para novos usuários */}
        {mostrarTutorial && (
          <div className={styles.tutorialBanner}>
            <div className={styles.tutorialContent}>
              <div className={styles.tutorialIcon}>🚀</div>
              <div className={styles.tutorialText}>
                <h3>Bem-vindo à Precificação 3D!</h3>
                <p>Crie planilhas profissionais para calcular custos de impressão 3D com precisão</p>
              </div>
              <button 
                onClick={() => setMostrarTutorial(false)} 
                className={styles.tutorialClose}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Informações do plano */}
        {limites && (
          <div className={styles.planoCard}>
            <div className={styles.planoHeader}>
              <h3>📋 Seu Plano: {limites.tipoPlano.charAt(0).toUpperCase() + limites.tipoPlano.slice(1)}</h3>
              {limites.tipoPlano === 'gratuito' && (
                <span className={styles.upgradeHint}>⭐ Faça upgrade para mais recursos</span>
              )}
            </div>
            <div className={styles.limitesInfo}>
              <div className={styles.limiteItem}>
                <span>📊 Linhas por planilha:</span>
                <strong>
                  {limites.limites.maxLinhas === -1 ? 'Ilimitado' : limites.limites.maxLinhas}
                </strong>
              </div>
              <div className={styles.limiteItem}>
                <span>⚙️ Colunas personalizadas:</span>
                <strong>
                  {limites.limites.maxColunasPersonalizadas === -1 ? 'Ilimitado' : limites.limites.maxColunasPersonalizadas}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Configuração Inicial usando os novos componentes */}
        <Modal
          isOpen={mostrarModalConfig}
          onClose={() => setMostrarModalConfig(false)}
          title="🎯 Configuração Inicial da Planilha"
          size="large"
          footer={
            <div className={styles.modalButtons}>
              <Botao 
                variante="secondary"
                onClick={() => setMostrarModalConfig(false)}
              >
                Cancelar
              </Botao>
              <Botao 
                variante="success"
                onClick={criarPlanilhaCompleta}
                carregando={criandoPlanilha}
                icone={criandoPlanilha ? null : "🚀"}
              >
                {criandoPlanilha ? 'Criando Planilha...' : 'Criar Planilha'}
              </Botao>
            </div>
          }
        >
          <div className={styles.modalIntro}>
            <p>Configure os valores base que serão usados nos cálculos automáticos da sua planilha de precificação 3D:</p>
          </div>
          
          <div className={styles.configForm}>
            <CampoForm
              rotulo="📋 Nome da Planilha"
              tooltip="Digite um nome descritivo para identificar esta planilha facilmente"
              obrigatorio
            >
              <input
                type="text"
                value={configInicial.nomePlanilha}
                onChange={(e) => atualizarConfig('nomePlanilha', e.target.value)}
                placeholder="Ex: Miniaturas RPG 2024"
              />
            </CampoForm>

            <div className={styles.configGrid}>
              <CampoForm
                rotulo="🧵 Custo do Filamento (R$/kg)"
                tooltip="Preço médio do filamento por quilograma. Usado para calcular o custo do material baseado no peso da peça."
              >
                <input
                  type="number"
                  value={configInicial.custoKgFilamento}
                  onChange={(e) => atualizarConfig('custoKgFilamento', parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                  placeholder="80.00"
                />
              </CampoForm>

              <CampoForm
                rotulo="⚡ Custo da Energia (R$/kWh)"
                tooltip="Tarifa de energia elétrica por kWh. Consulte sua conta de luz para obter o valor exato."
              >
                <input
                  type="number"
                  value={configInicial.custoEnergia}
                  onChange={(e) => atualizarConfig('custoEnergia', parseFloat(e.target.value) || 0)}
                  step="0.001"
                  min="0"
                  placeholder="0.650"
                />
              </CampoForm>

              <CampoForm
                rotulo="🔌 Potência da Impressora (W)"
                tooltip="Potência total da impressora 3D em watts. Inclui hotend, mesa aquecida e motores. Consulte o manual do equipamento."
              >
                <input
                  type="number"
                  value={configInicial.potenciaImpressora}
                  onChange={(e) => atualizarConfig('potenciaImpressora', parseInt(e.target.value) || 0)}
                  min="0"
                  placeholder="200"
                />
              </CampoForm>

              <CampoForm
                rotulo="👷 Custo Hora de Trabalho (R$/h)"
                tooltip="Valor da sua hora de trabalho para pós-processamento (limpeza, suporte, acabamento). Aproximadamente 20% do tempo de impressão."
              >
                <input
                  type="number"
                  value={configInicial.custoHora}
                  onChange={(e) => atualizarConfig('custoHora', parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                  placeholder="50.00"
                />
              </CampoForm>

              <CampoForm
                rotulo="💰 Margem de Lucro (%)"
                tooltip="Percentual de lucro aplicado sobre os custos totais. Recomendado entre 20% e 50% dependendo do mercado."
              >
                <input
                  type="number"
                  value={configInicial.margemLucro}
                  onChange={(e) => atualizarConfig('margemLucro', parseFloat(e.target.value) || 0)}
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="30.0"
                />
              </CampoForm>

              <CampoForm
                rotulo="🏢 Custos Fixos Mensais (R$)"
                tooltip="Custos fixos mensais do negócio: aluguel, energia, internet, etc. Usado para cálculos avançados de rentabilidade."
              >
                <ListaSuspensa
                  valor={configInicial.custoFixoMensal}
                  aoAlterar={(valor) => atualizarConfig('custoFixoMensal', valor)}
                  opcoes={[
                    { valor: 0, rotulo: 'R$ 0,00' },
                    { valor: 250, rotulo: 'R$ 250,00' },
                    { valor: 500, rotulo: 'R$ 500,00' },
                    { valor: 750, rotulo: 'R$ 750,00' },
                    { valor: 1000, rotulo: 'R$ 1.000,00' },
                    { valor: 1500, rotulo: 'R$ 1.500,00' },
                    { valor: 2000, rotulo: 'R$ 2.000,00' },
                    { valor: 2500, rotulo: 'R$ 2.500,00' },
                    { valor: 5000, rotulo: 'R$ 5.000,00' }
                  ]}
                  semOpcaoSelecionada
                />
              </CampoForm>
            </div>
          </div>

          <div className={styles.configPreview}>
            <div className={styles.previewHeader}>
              <h4>📊 Simulação de Cálculo</h4>
              <span className={styles.previewSubtitle}>Exemplo: Miniatura 15g, 2.5h de impressão</span>
            </div>
            
            <div className={styles.previewCalculation}>
              <div className={styles.calcStep}>
                <span>Material:</span>
                <span>R$ {(15/1000 * configInicial.custoKgFilamento).toFixed(2)}</span>
              </div>
              <div className={styles.calcStep}>
                <span>Energia:</span>
                <span>R$ {(2.5 * configInicial.custoEnergia * configInicial.potenciaImpressora/1000).toFixed(2)}</span>
              </div>
              <div className={styles.calcStep}>
                <span>Trabalho:</span>
                <span>R$ {(0.5 * configInicial.custoHora).toFixed(2)}</span>
              </div>
              <div className={styles.calcTotal}>
                <span>Preço Final:</span>
                <strong>R$ {(((15/1000 * configInicial.custoKgFilamento) + (2.5 * configInicial.custoEnergia * configInicial.potenciaImpressora/1000) + (0.5 * configInicial.custoHora)) * (1 + configInicial.margemLucro/100)).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </Modal>

        {/* Seção de planilhas */}
        <div className={styles.planilhasSection}>
          <div className={styles.sectionHeader}>
            <h2>📁 Suas Planilhas ({planilhas.length})</h2>
            {planilhas.length > 0 && (
              <button 
                onClick={iniciarCriacaoPlanilha}
                className={styles.criarButton}
                disabled={criandoPlanilha}
              >
                {criandoPlanilha ? '⏳ Criando...' : '➕ Nova Planilha'}
              </button>
            )}
          </div>

          {planilhas.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyContent}>
                <div className={styles.emptyIcon}>🎯</div>
                <h3>Comece sua primeira precificação</h3>
                <p>Crie planilhas profissionais para calcular custos de impressão 3D com precisão</p>
                
                <div className={styles.featuresPreview}>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>⚡</span>
                    <span>Cálculos automáticos</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>💰</span>
                    <span>Margem de lucro</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>📈</span>
                    <span>Relatórios detalhados</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>🎨</span>
                    <span>Personalizável</span>
                  </div>
                </div>

                <button 
                  onClick={iniciarCriacaoPlanilha}
                  className={styles.criarButtonPrimary}
                  disabled={criandoPlanilha}
                >
                  {criandoPlanilha ? (
                    <>
                      <span className={styles.spinner}></span>
                      Criando...
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      Criar Primeira Planilha
                    </>
                  )}
                </button>

                <div className={styles.helpText}>
                  <p>💡 <strong>Dica:</strong> Uma planilha será criada automaticamente com configurações padrão que você pode personalizar</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.planilhasGrid}>
              {planilhas.map((planilha) => (
                <div key={planilha.id} className={styles.planilhaCard}>
                  <div className={styles.planilhaHeader}>
                    <h3>📄 {planilha.nome}</h3>
                    <div className={styles.planilhaActions}>
                      <button
                        onClick={() => navigate(`/planilha/${planilha.id}`)}
                        className={`${styles.actionButton} ${styles.edit}`}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => excluirPlanilha(planilha.id, planilha.nome)}
                        className={`${styles.actionButton} ${styles.delete}`}
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className={styles.planilhaInfo}>
                    <p><strong>📅 Criada:</strong> {formatarData(planilha.criadaEm)}</p>
                    <p><strong>🔄 Atualizada:</strong> {formatarData(planilha.atualizadaEm)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

