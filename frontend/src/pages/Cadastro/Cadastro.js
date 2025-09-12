import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import style from './Cadastro.module.css';

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    // Validações básicas
    if (!nome || !email || !senha || !confirmarSenha) {
      setErro('Por favor, preencha todos os campos');
      setCarregando(false);
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      setCarregando(false);
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      setCarregando(false);
      return;
    }

    try {
      const resultado = await cadastrar(nome, email, senha);

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

  // Handlers para login social (apenas front, sem integração real)
  const handleGoogle = (e) => {
    e.preventDefault();
    alert('Login com Google ainda não implementado.');
  };

  const handleFacebook = (e) => {
    e.preventDefault();
    alert('Login com Facebook ainda não implementado.');
  };

  return (
    <div className={style['auth-container']}>
      <div className={style['auth-card']}>
        <div className={style['auth-header']}>
          <h1>Precificação 3D</h1>
          <h2>Criar sua conta</h2>
          <p>Comece a gerenciar suas planilhas gratuitamente</p>
        </div>

        <form onSubmit={handleSubmit} className={style['auth-form']}>
          {erro && (
            <div className={style['error-message']}>
              {erro}
            </div>
          )}

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
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className={style['form-group']}>
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Digite a senha novamente"
              required
            />
          </div>

          <button
            type="submit"
            className={style['auth-button']}
            disabled={carregando}
          >
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <div className={style['auth-footer']}>
          <p>
            Já tem uma conta?{' '}
            <Link to="/login" className={style['auth-link']}>
              Entre aqui
            </Link>
          </p>
        </div>

        <div className={style['social-login']}>
          <button
            className={style['google-button']}
            onClick={handleGoogle}
            type="button"
          >
            <span style={{ marginRight: 8 }}>🔵</span>
            Entrar com Google
          </button>
          <button
            className={style['facebook-button']}
            onClick={handleFacebook}
            type="button"
          >
            <span style={{ marginRight: 8 }}>📘</span>
            Entrar com Facebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;

