import React, { createContext, useContext, useState, useEffect } from 'react';
import { usuarioService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Verificar se há usuário logado ao inicializar
  useEffect(() => {
    const verificarUsuarioLogado = async () => {
      const tokenSalvo = localStorage.getItem('token');
      const usuarioSalvo = localStorage.getItem('usuario');

      if (tokenSalvo && usuarioSalvo) {
        try {
          // Verificar se o token ainda é válido
          const perfilAtualizado = await usuarioService.obterPerfil();
          setUsuario(perfilAtualizado);
          setToken(tokenSalvo);
        } catch (error) {
          // Token inválido, limpar dados
          logout();
        }
      }
      setCarregando(false);
    };

    verificarUsuarioLogado();
  }, []);

  // Login
  const login = async (email, senha) => {
    try {
      const resposta = await usuarioService.login({ email, senha });
      
      // Salvar dados no localStorage
      localStorage.setItem('token', resposta.token);
      localStorage.setItem('usuario', JSON.stringify(resposta.usuario));
      
      // Atualizar estado
      setToken(resposta.token);
      setUsuario(resposta.usuario);
      
      return { sucesso: true, usuario: resposta.usuario };
    } catch (error) {
      const mensagem = error.response?.data?.erro || 'Erro ao fazer login';
      return { sucesso: false, erro: mensagem };
    }
  };

  // Registro
  const registrar = async (email, senha) => {
    try {
      const resposta = await usuarioService.registrar({ email, senha });
      
      // Salvar dados no localStorage
      localStorage.setItem('token', resposta.token);
      localStorage.setItem('usuario', JSON.stringify(resposta.usuario));
      
      // Atualizar estado
      setToken(resposta.token);
      setUsuario(resposta.usuario);
      
      return { sucesso: true, usuario: resposta.usuario };
    } catch (error) {
      const mensagem = error.response?.data?.erro || 'Erro ao registrar usuário';
      return { sucesso: false, erro: mensagem };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  };

  // Atualizar perfil
  const atualizarPerfil = async (dados) => {
    try {
      const resposta = await usuarioService.atualizarPerfil(dados);
      
      // Atualizar dados no localStorage
      localStorage.setItem('usuario', JSON.stringify(resposta.usuario));
      
      // Atualizar estado
      setUsuario(resposta.usuario);
      
      return { sucesso: true, usuario: resposta.usuario };
    } catch (error) {
      const mensagem = error.response?.data?.erro || 'Erro ao atualizar perfil';
      return { sucesso: false, erro: mensagem };
    }
  };

  // Verificar se usuário está logado
  const estaLogado = () => {
    return !!token && !!usuario;
  };

  const valor = {
    usuario,
    token,
    carregando,
    login,
    registrar,
    logout,
    atualizarPerfil,
    estaLogado,
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
};

