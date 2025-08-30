import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import style from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

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

    try {
      const resultado = await login(email, senha);
      
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
          <h2>Entrar na sua conta</h2>
          <p>Gerencie suas planilhas de precificação</p>
        </div>

        <form onSubmit={handleSubmit} className={style['auth-form']}>
          {erro && (
            <div className={style['error-message']}>
              {erro}
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
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className={style['auth-footer']}>
          <p>
            Não tem uma conta?{' '}
            <Link to="/registro" className={style['auth-link']}>
              Registre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

