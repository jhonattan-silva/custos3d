import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { planilhaService } from '../../services/api';
import './Dashboard.module.css';

const Dashboard = () => {
  const [planilhas, setPlanilhas] = useState([]);
  const [limites, setLimites] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [criandoPlanilha, setCriandoPlanilha] = useState(false);
  
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [planilhasData, limitesData] = await Promise.all([
        planilhaService.listar(),
        planilhaService.obterLimites()
      ]);
      
      setPlanilhas(planilhasData);
      setLimites(limitesData);
    } catch (error) {
      setErro('Erro ao carregar dados');
      console.error('Erro:', error);
    } finally {
      setCarregando(false);
    }
  };

  const criarNovaPlanilha = async () => {
    try {
      setCriandoPlanilha(true);
      const novaPlanilha = await planilhaService.criar({
        nome: 'Nova Planilha',
        dadosBase: {
          linhas: [],
          configuracao: {
            moeda: 'BRL',
            margemLucro: 30,
            custoHora: 50
          }
        },
        colunasPersonalizadas: {
          colunas: []
        }
      });

      // Navegar para a nova planilha
      navigate(`/planilha/${novaPlanilha.planilha.id}`);
    } catch (error) {
      const mensagem = error.response?.data?.erro || 'Erro ao criar planilha';
      setErro(mensagem);
    } finally {
      setCriandoPlanilha(false);
    }
  };

  const excluirPlanilha = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir a planilha "${nome}"?`)) {
      return;
    }

    try {
      await planilhaService.excluir(id);
      setPlanilhas(planilhas.filter(p => p.id !== id));
    } catch (error) {
      setErro('Erro ao excluir planilha');
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (carregando) {
    return (
      <div className="dashboard-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Precificação 3D</h1>
            <p>Bem-vindo, {usuario?.email}</p>
          </div>
          <div className="header-right">
            <div className="plano-info">
              <span className="plano-badge plano-{limites?.tipoPlano}">
                {limites?.tipoPlano?.toUpperCase()}
              </span>
            </div>
            <button onClick={logout} className="logout-button">
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="dashboard-main">
        {erro && (
          <div className="error-banner">
            {erro}
            <button onClick={() => setErro('')} className="error-close">×</button>
          </div>
        )}

        {/* Informações do plano */}
        {limites && (
          <div className="plano-card">
            <h3>Seu Plano: {limites.tipoPlano.charAt(0).toUpperCase() + limites.tipoPlano.slice(1)}</h3>
            <div className="limites-info">
              <div className="limite-item">
                <span>Linhas por planilha:</span>
                <strong>
                  {limites.limites.maxLinhas === -1 ? 'Ilimitado' : limites.limites.maxLinhas}
                </strong>
              </div>
              <div className="limite-item">
                <span>Colunas personalizadas:</span>
                <strong>
                  {limites.limites.maxColunasPersonalizadas === -1 ? 'Ilimitado' : limites.limites.maxColunasPersonalizadas}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Seção de planilhas */}
        <div className="planilhas-section">
          <div className="section-header">
            <h2>Suas Planilhas ({planilhas.length})</h2>
            <button 
              onClick={criarNovaPlanilha}
              className="criar-button"
              disabled={criandoPlanilha}
            >
              {criandoPlanilha ? 'Criando...' : '+ Nova Planilha'}
            </button>
          </div>

          {planilhas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>Nenhuma planilha ainda</h3>
              <p>Crie sua primeira planilha de precificação para começar</p>
              <button 
                onClick={criarNovaPlanilha}
                className="criar-button-primary"
                disabled={criandoPlanilha}
              >
                {criandoPlanilha ? 'Criando...' : 'Criar Primeira Planilha'}
              </button>
            </div>
          ) : (
            <div className="planilhas-grid">
              {planilhas.map((planilha) => (
                <div key={planilha.id} className="planilha-card">
                  <div className="planilha-header">
                    <h3>{planilha.nome}</h3>
                    <div className="planilha-actions">
                      <button
                        onClick={() => navigate(`/planilha/${planilha.id}`)}
                        className="action-button edit"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => excluirPlanilha(planilha.id, planilha.nome)}
                        className="action-button delete"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="planilha-info">
                    <p><strong>Criada:</strong> {formatarData(planilha.criadaEm)}</p>
                    <p><strong>Atualizada:</strong> {formatarData(planilha.atualizadaEm)}</p>
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

