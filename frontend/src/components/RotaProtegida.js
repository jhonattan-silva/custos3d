import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RotaProtegida = ({ children }) => {
  const { estaLogado, carregando } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (carregando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#4a5568'
      }}>
        Verificando autenticação...
      </div>
    );
  }

  // Redirecionar para login se não estiver logado
  if (!estaLogado()) {
    return <Navigate to="/login" replace />;
  }

  // Renderizar componente se estiver logado
  return children;
};

export default RotaProtegida;

