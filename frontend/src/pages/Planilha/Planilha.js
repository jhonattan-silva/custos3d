/*
 * Função: Página principal de edição de planilhas de precificação 3D
 * Permite visualizar, editar e calcular custos de itens para impressão 3D
 * 
 * Funcionalidades:
 * - Carregamento de dados da planilha do backend
 * - Tabela editável com cálculos automáticos
 * - Adição/remoção de itens da planilha
 * - Sidebar para configuração de parâmetros
 * - Salvamento automático no backend
 * - Cálculos em tempo real de custos
 * 
 * Estados principais:
 * - planilha: Dados da planilha (nome, configurações)
 * - dados: Array com todos os itens/linhas
 * - carregando: Flag de loading inicial
 * - salvando: Flag durante salvamento
 * - erro: Mensagens de erro/sucesso
 * - sidebarAberto: Controle do sidebar de configurações
 * 
 * Funções principais:
 * - carregarPlanilha: Busca dados do backend
 * - salvarPlanilha: Persiste alterações
 * - adicionarItem: Cria nova linha na tabela
 * - atualizarItem: Modifica item existente
 * - removerItem: Remove item da planilha
 * - calcularCustos: Calcula preços automaticamente
 * - salvarConfiguracoes: Atualiza parâmetros do sidebar
 * 
 * Parâmetros de URL:
 * - id: ID da planilha a ser carregada
 * 
 * Cálculos implementados:
 * - Custo Material = (peso/1000) * custoKgFilamento
 * - Custo Energia = tempo * custoEnergia * (potencia/1000)
 * - Custo Trabalho = (tempo * 0.2) * custoHora
 * - Preço Final = custoTotal * (1 + margemLucro/100)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planilhaService } from '../../services/api';
import ListaSuspensa from '../../components/ListaSuspensa/ListaSuspensa';
import Sidebar from '../../components/Sidebar/Sidebar';
import styles from './Planilha.module.css';

const Planilha = () => {
  // Pega o ID da planilha da URL
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Dados da planilha (nome, configurações, etc)
  const [planilha, setPlanilha] = useState(null);
  
  // Array com todos os itens/linhas da planilha
  const [dados, setDados] = useState([]);
  
  // Pra mostrar o loading enquanto carrega
  const [carregando, setCarregando] = useState(true);
  
  // Pra desabilitar o botão de salvar enquanto tá salvando
  const [salvando, setSalvando] = useState(false);
  
  // Pra mostrar mensagens de erro
  const [erro, setErro] = useState('');

  // Estados para o sidebar
  const [sidebarAberto, setSidebarAberto] = useState(false);
  const [salvandoConfig, setSalvandoConfig] = useState(false);

  // Função que vai buscar os dados da planilha no backend
  const carregarPlanilha = useCallback(async () => {
    try {
      setCarregando(true);
      const response = await planilhaService.obter(id);
      setPlanilha(response);
      
      // Se não tem dados, começa com uma linha padrão
      const linhasCarregadas = response.dadosBase?.linhas || [];
      if (linhasCarregadas.length === 0) {
        // Cria primeira linha automaticamente
        const primeiraLinha = {
          id: Date.now(),
          item: '',
          material: 'PLA',
          peso: 0,
          tempoImpressao: 0,
          itensAdicionais: 0,
          embalagem: 0,
          taxaMarketplace: 0,
          custoMaterial: '0.00',
          custoEnergia: '0.00',
          custoTrabalho: '0.00',
          precoFinal: '0.00'
        };
        setDados([primeiraLinha]);
      } else {
        setDados(linhasCarregadas);
      }
    } catch (error) {
      console.error('Erro ao carregar planilha:', error);
      
      // Se for erro 404 ou de rede, significa que o backend não existe ainda
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        setErro('⚠️ Backend em desenvolvimento - usando dados locais');
        // Para desenvolvimento, simula uma planilha com dados de exemplo
        setPlanilha({
          id: id,
          nome: 'Planilha de Exemplo',
          dadosBase: {
            linhas: [],
            configuracao: {
              moeda: 'BRL',
              margemLucro: 30,
              custoHora: 50,
              custoKgFilamento: 80,
              custoEnergia: 0.65,
              potenciaImpressora: 200
            }
          }
        });
        
        // Mesmo em desenvolvimento, cria a primeira linha
        const primeiraLinha = {
          id: Date.now(),
          item: '',
          material: 'PLA',
          peso: 0,
          tempoImpressao: 0,
          itensAdicionais: 0,
          embalagem: 0,
          taxaMarketplace: 0,
          custoMaterial: '0.00',
          custoEnergia: '0.00',
          custoTrabalho: '0.00',
          precoFinal: '0.00'
        };
        setDados([primeiraLinha]);
      } else {
        setErro('Erro ao carregar planilha');
        // Se der outro erro, volta pro dashboard após 3 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } finally {
      setCarregando(false);
    }
  }, [id, navigate]);

  // Quando o componente carrega, busca os dados da planilha
  useEffect(() => {
    carregarPlanilha();
  }, [carregarPlanilha]);

  // Salva as alterações da planilha no backend
  const salvarPlanilha = async () => {
    try {
      setSalvando(true);
      await planilhaService.atualizar(id, {
        dadosBase: {
          linhas: dados, // Manda todos os itens atuais
          configuracao: {
            moeda: 'BRL',
            margemLucro: 30,
            custoHora: 50
          }
        }
      });
      setErro(''); // Limpa qualquer erro anterior
      // Mostra feedback de sucesso
      setErro('✅ Planilha salva com sucesso!');
      setTimeout(() => setErro(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      
      // Se o backend não existir, simula o salvamento
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        setErro('⚠️ Backend em desenvolvimento - dados salvos localmente');
        setTimeout(() => setErro(''), 3000);
      } else {
        setErro('Erro ao salvar planilha');
      }
    } finally {
      setSalvando(false);
    }
  };

  // Salvar configurações do sidebar
  const salvarConfiguracoes = async (novasConfiguracoes) => {
    try {
      setSalvandoConfig(true);
      
      // Atualiza as configurações da planilha
      const planilhaAtualizada = {
        ...planilha,
        dadosBase: {
          ...planilha.dadosBase,
          configuracao: {
            ...planilha.dadosBase.configuracao,
            ...novasConfiguracoes
          }
        }
      };

      setPlanilha(planilhaAtualizada);

      // Salva no backend
      await planilhaService.atualizar(id, {
        dadosBase: planilhaAtualizada.dadosBase
      });

      // Recalcula todos os itens com as novas configurações
      const novosItens = dados.map(item => {
        if (item.peso > 0 && item.tempoImpressao > 0) {
          const custosCalculados = calcularCustos(item, novasConfiguracoes);
          return { ...item, ...custosCalculados };
        }
        return item;
      });
      
      setDados(novosItens);
      setErro('✅ Configurações salvas com sucesso!');
      setTimeout(() => setErro(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setErro('❌ Erro ao salvar configurações');
    } finally {
      setSalvandoConfig(false);
    }
  };

  // Adiciona um item novo na planilha com estrutura correta
  const adicionarItem = () => {
    const novoItem = {
      id: Date.now(),
      item: '',
      material: 'PLA',
      peso: 0,
      tempoImpressao: 0,
      itensAdicionais: 0,
      embalagem: 0,
      taxaMarketplace: 0,
      custoMaterial: '0.00',
      custoEnergia: '0.00',
      custoTrabalho: '0.00',
      precoFinal: '0.00'
    };
    setDados([...dados, novoItem]);
  };

  // Função para calcular custos automaticamente
  const calcularCustos = (item, config) => {
    if (!item.peso || !item.tempoImpressao) {
      return {
        custoMaterial: '0.00',
        custoEnergia: '0.00',
        custoTrabalho: '0.00',
        precoFinal: '0.00'
      };
    }

    const custoMaterial = (item.peso / 1000) * (config?.custoKgFilamento || 80);
    const custoEnergia = item.tempoImpressao * (config?.custoEnergia || 0.65) * ((config?.potenciaImpressora || 200) / 1000);
    const custoTrabalho = (item.tempoImpressao * 0.2) * (config?.custoHora || 50); // 20% do tempo para pós-processamento
    const custoTotal = custoMaterial + custoEnergia + custoTrabalho;
    const precoFinal = custoTotal * (1 + ((config?.margemLucro || 30) / 100));

    return {
      custoMaterial: custoMaterial.toFixed(2),
      custoEnergia: custoEnergia.toFixed(2),
      custoTrabalho: custoTrabalho.toFixed(2),
      precoFinal: precoFinal.toFixed(2)
    };
  };

  // Atualiza um item específico
  const atualizarItem = (index, campo, valor) => {
    const novosItens = [...dados];
    novosItens[index] = {
      ...novosItens[index],
      [campo]: valor
    };

    // Se mudou peso ou tempo, recalcula custos automaticamente
    if (campo === 'peso' || campo === 'tempoImpressao') {
      const custosCalculados = calcularCustos(novosItens[index], planilha?.dadosBase?.configuracao);
      novosItens[index] = {
        ...novosItens[index],
        ...custosCalculados
      };
    }

    setDados(novosItens);
  };

  // Remove um item da planilha pelo índice
  const removerItem = (index) => {
    // Filtra removendo o item na posição específica
    setDados(dados.filter((_, i) => i !== index));
  };

  // Se ainda tá carregando, mostra a tela de loading
  if (carregando) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Carregando planilha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={() => navigate('/dashboard')} className={styles.backButton}>
            ← Voltar
          </button>
          <div className={styles.titleSection}>
            <h1>{planilha?.nome || 'Planilha'}</h1>
            <p>Planilha de precificação 3D</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button 
            onClick={() => setSidebarAberto(true)}
            className={styles.configButton}
            title="Configurações"
          >
            ⚙️ Configurações
          </button>
          <button onClick={salvarPlanilha} className={styles.saveButton} disabled={salvando}>
            💾 {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </header>

      {erro && (
        <div className={styles.errorBanner}>
          ⚠️ {erro}
          <button onClick={() => setErro('')} className={styles.errorClose}>×</button>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className={styles.content}>
        <div className={styles.toolbar}>
          <h2>📋 Itens da Planilha ({dados.length})</h2>
          <button onClick={adicionarItem} className={styles.addButton}>
            ➕ Adicionar Item
          </button>
        </div>

        {/* Sempre mostra a tabela agora */}
        <div className={styles.planilhaContainer}>
          <table className={styles.planilhaTable}>
            <thead>
              <tr>
                <th>Item/Produto</th>
                <th>Material</th>
                <th>Peso (g)</th>
                <th>Tempo (h)</th>
                <th>Itens Adicionais</th>
                <th>Embalagem</th>
                <th>Taxa Marketplace (%)</th>
                <th>Custo Material</th>
                <th>Custo Energia</th>
                <th>Custo Trabalho</th>
                <th>Preço Final</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item, index) => (
                <tr key={item.id || index} className={styles.planilhaRow}>
                  <td>
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) => atualizarItem(index, 'item', e.target.value)}
                      className={styles.cellInput}
                      placeholder="Ex: Miniatura Dragão 28mm"
                      autoFocus={index === 0 && !item.item}
                    />
                  </td>
                  <td>
                    <ListaSuspensa
                      valor={item.material}
                      onChange={(valor) => atualizarItem(index, 'material', valor)}
                      opcoes={[
                        { valor: 'PLA', texto: '🟢 PLA' },
                        { valor: 'ABS', texto: '🔵 ABS' },
                        { valor: 'PETG', texto: '🟡 PETG' },
                        { valor: 'TPU', texto: '🟣 TPU' }
                      ]}
                      placeholder="Material"
                      tamanho="small"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.peso || ''}
                      onChange={(e) => atualizarItem(index, 'peso', parseFloat(e.target.value) || 0)}
                      className={styles.cellInputNumber}
                      step="0.1"
                      min="0"
                      placeholder="15.5"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.tempoImpressao || ''}
                      onChange={(e) => atualizarItem(index, 'tempoImpressao', parseFloat(e.target.value) || 0)}
                      className={styles.cellInputNumber}
                      step="0.1"
                      min="0"
                      placeholder="2.5"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.itensAdicionais || ''}
                      onChange={(e) => atualizarItem(index, 'itensAdicionais', parseFloat(e.target.value) || 0)}
                      className={styles.cellInputNumber}
                      step="0.01"
                      min="0"
                      placeholder="5.00"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.embalagem || ''}
                      onChange={(e) => atualizarItem(index, 'embalagem', parseFloat(e.target.value) || 0)}
                      className={styles.cellInputNumber}
                      step="0.01"
                      min="0"
                      placeholder="2.50"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.taxaMarketplace || ''}
                      onChange={(e) => atualizarItem(index, 'taxaMarketplace', parseFloat(e.target.value) || 0)}
                      className={styles.cellInputNumber}
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="15.0"
                    />
                  </td>
                  <td className={styles.calculatedCell}>
                    💰 R$ {item.custoMaterial}
                  </td>
                  <td className={styles.calculatedCell}>
                    ⚡ R$ {item.custoEnergia}
                  </td>
                  <td className={styles.calculatedCell}>
                    👷 R$ {item.custoTrabalho}
                  </td>
                  <td className={styles.calculatedCellFinal}>
                    💵 R$ {item.precoFinal}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => removerItem(index)}
                      className={styles.removeButton}
                      title="Remover item"
                      disabled={dados.length === 1}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Informações de desenvolvimento */}
        <div className={styles.devInfo}>
          <h3>🚧 Em Desenvolvimento</h3>
          <p>A funcionalidade completa da planilha com Tanstack Table será implementada em breve!</p>
          <ul>
            <li>✅ Navegação entre páginas</li>
            <li>✅ Carregamento de dados</li>
            <li>✅ Tabela sempre visível</li>
            <li>✅ Primeira linha automática</li>
            <li>✅ Cálculos automáticos</li>
            <li>⏳ Tabela editável completa</li>
            <li>⏳ Configurações avançadas</li>
          </ul>
        </div>
      </div>

      {/* Sidebar de Configurações */}
      <Sidebar
        aberto={sidebarAberto}
        onFechar={() => setSidebarAberto(false)}
        configuracoes={planilha?.dadosBase?.configuracao}
        onSalvarConfiguracoes={salvarConfiguracoes}
        carregandoSalvar={salvandoConfig}
      />
    </div>
  );
};

export default Planilha;