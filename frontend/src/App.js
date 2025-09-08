import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RotaProtegida from './components/RotaProtegida';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Dashboard from './pages/Dashboard/Dashboard';
import Planilha from './pages/Planilha/Planilha';
import { AuthProvider } from './contexts/AuthContext'; 
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rota raiz redireciona para dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            
            {/* Rotas protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <RotaProtegida>
                  <Dashboard />
                </RotaProtegida>
              } 
            />
            
            {/* Rota para planilha específica */}
            <Route 
              path="/planilha/:id" 
              element={
                <RotaProtegida>
                  <Planilha />
                </RotaProtegida>
              } 
            />
            
            {/* Rota 404 */}
            <Route 
              path="*" 
              element={
                <div style={{ 
                  padding: '50px', 
                  textAlign: 'center',
                  minHeight: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <h1>404 - Página não encontrada</h1>
                  <p>A página que você está procurando não existe.</p>
                  <a href="/dashboard" style={{ 
                    color: '#667eea', 
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}>
                    Voltar ao Dashboard
                  </a>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
