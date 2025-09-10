import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import style from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const { login, cadastrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detectar se é página de cadastro
  const isCadastro = location.pathname === '/cadastro';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    // Validações básicas
    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos');
      setCarregando(false);
      return;
    }

    if (isCadastro && !nome) {
      setErro('Por favor, preencha o nome');
      setCarregando(false);
      return;
    }

    try {
      let resultado;
      
      if (isCadastro) {
        resultado = await cadastrar(nome, email, senha);
      } else {
        resultado = await login(email, senha);
      }
      
      if (resultado.sucesso) {
        navigate('/dashboard');
      } else {
        setErro(resultado.erro);
      }
    } catch (error) {
      setErro('Erro inesperado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={style['auth-container']}>
      <div className={style['auth-card']}>
        <div className={style['auth-header']}>
          <h1>Precificação 3D</h1>
          <h2>{isCadastro ? 'Criar conta' : 'Entrar na sua conta'}</h2>
          <p>{isCadastro ? 'Crie sua conta para começar' : 'Gerencie suas planilhas de precificação'}</p>
        </div>

        <form onSubmit={handleSubmit} className={style['auth-form']}>
          {erro && (
            <div className={style['error-message']}>
              {erro}
            </div>
          )}

          {isCadastro && (
            <div className={style['form-group']}>
              <label htmlFor="nome">Nome completo</label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>
          )}

          <div className={style['form-group']}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className={style['form-group']}>
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              required
            />
          </div>

          <button 
            type="submit" 
            className={style['auth-button']}
            disabled={carregando}
          >
            {carregando ? 
              (isCadastro ? 'Criando conta...' : 'Entrando...') : 
              (isCadastro ? 'Criar conta' : 'Entrar')
            }
          </button>
        </form>

        <div className={style['auth-footer']}>
          <p>
            {isCadastro ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
            <Link to={isCadastro ? '/login' : '/cadastro'} className={style['auth-link']}>
              {isCadastro ? 'Faça login aqui' : 'Registre-se aqui'}
            </Link>
          </p>
        </div>

        {/* Botões sociais apenas no cadastro */}
        {isCadastro && (
          <div className={style['social-login']}>
            <button
              className={style['google-button']}
              onClick={(e) => {
                e.preventDefault();
                alert('Login com Google ainda não implementado.');
              }}
              type="button"
            >
              <span style={{ marginRight: 8 }}>🔵</span>
              Entrar com Google
            </button>
            <button
              className={style['facebook-button']}
              onClick={(e) => {
                e.preventDefault();
                alert('Login com Facebook ainda não implementado.');
              }}
              type="button"
            >
              <span style={{ marginRight: 8 }}>📘</span>
              Entrar com Facebook
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

