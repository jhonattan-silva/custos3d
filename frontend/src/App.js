/*
 * ROUTES CONFIGURATION
 * 
 * Função: Configuração central de rotas da aplicação
 * Define navegação e proteção de páginas
 * 
 * Rotas disponíveis:
 * - / : Página inicial (redireciona conforme autenticação)
 * - /login : Página de login/cadastro
 * - /dashboard : Dashboard principal (protegido)
 * - /planilha/:id : Edição de planilha (protegido)
 * - /master : Painel administrativo (restrito a admins)
 * 
 * Proteções:
 * - PrivateRoute: Requer autenticação
 * - MasterRoute: Requer role master/admin
 * 
 * Redirecionamentos:
 * - Usuário logado em /login → /dashboard
 * - Usuário não logado em rotas protegidas → /login
 * - Usuário sem permissão em /master → /dashboard
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Páginas
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Planilha from './pages/Planilha/Planilha';
import Master from './pages/Master/Master';

// Componente para rotas protegidas
const PrivateRoute = ({ children }) => {
  const { usuario, carregando } = useAuth();
  
  if (carregando) {
    return <div>Carregando...</div>;
  }
  
  return usuario ? children : <Navigate to="/login" />;
};

// Componente para rotas master
const MasterRoute = ({ children }) => {
  const { usuario, carregando } = useAuth();
  
  if (carregando) {
    return <div>Carregando...</div>;
  }
  
  if (!usuario) {
    return <Navigate to="/login" />;
  }
  
  if (usuario.role !== 'master' && usuario.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Componente para rotas públicas (evita acesso se já logado)
const PublicRoute = ({ children }) => {
  const { usuario, carregando } = useAuth();
  
  if (carregando) {
    return <div>Carregando...</div>;
  }
  
  return usuario ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rota inicial */}
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Navigate to="/dashboard" />
                </PrivateRoute>
              } 
            />
            
            {/* Rota de login */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            {/* Rota de cadastro */}
            <Route 
              path="/cadastro" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            {/* Dashboard principal */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Edição de planilha */}
            <Route 
              path="/planilha/:id" 
              element={
                <PrivateRoute>
                  <Planilha />
                </PrivateRoute>
              } 
            />
            
            {/* Painel Master */}
            <Route 
              path="/master" 
              element={
                <MasterRoute>
                  <Master />
                </MasterRoute>
              } 
            />
            
            {/* Rota 404 */}
            <Route 
              path="*" 
              element={<Navigate to="/dashboard" />} 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
