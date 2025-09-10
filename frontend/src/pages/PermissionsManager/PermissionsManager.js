/*
 * PERMISSIONS MANAGER COMPONENT
 * 
 * Função: Página para gerenciamento completo do sistema de permissões
 * Permite administrar roles, permissões e acessos de forma visual
 * 
 * Funcionalidades:
 * - Listagem de todos os roles do sistema
 * - Criação/edição de roles personalizados
 * - Associação de permissões a roles
 * - Visualização de permissões por módulo
 * - Atribuição de roles a usuários
 * - Preview de permissões em tempo real
 * 
 * Estados principais:
 * - roles: Lista de todos os roles
 * - permissoes: Lista de todas as permissões
 * - roleEditando: Role sendo editado/criado
 * - permissoesRole: Permissões do role atual
 * - modalRole: Controle do modal de edição
 * 
 * Módulos de permissão:
 * - spreadsheets: Planilhas (read, write, delete, admin)
 * - users: Usuários (read, write, admin)
 * - system: Sistema (read, write, admin)
 * - reports: Relatórios (read, admin)
 * 
 * Acesso restrito:
 * - Apenas usuários com permissão 'system.admin'
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { permissionsService } from '../../services/permissionsApi';
import Modal from '../../components/Modal/Modal';
import Botao from '../../components/Botao/Botao';
import CampoForm from '../../components/CampoForm/CampoForm';
import styles from './PermissionsManager.module.css';

const PermissionsManager = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // Estados principais
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Estados de dados
  const [roles, setRoles] = useState([]);
  const [permissoes, setPermissoes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Estados de modais
  const [modalRole, setModalRole] = useState(false);
  const [modalUsuario, setModalUsuario] = useState(false);
  const [roleEditando, setRoleEditando] = useState(null);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  // Estados do formulário
  const [nomeRole, setNomeRole] = useState('');
  const [descricaoRole, setDescricaoRole] = useState('');
  const [permissoesRole, setPermissoesRole] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      
      const [rolesData, permissoesData, usuariosData] = await Promise.all([
        permissionsService.getAllRoles(),
        permissionsService.getAllPermissions(),
        permissionsService.getAllUsers()
      ]);

      setRoles(rolesData);
      setPermissoes(permissoesData);
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados de permissões');
    } finally {
      setCarregando(false);
    }
  };

  const abrirModalRole = (role = null) => {
    setRoleEditando(role);
    setNomeRole(role?.nome || '');
    setDescricaoRole(role?.descricao || '');
    setPermissoesRole(role?.permissoes?.map(p => p.id) || []);
    setModalRole(true);
  };

  const salvarRole = async () => {
    try {
      setSalvando(true);
      
      const dados = {
        nome: nomeRole,
        descricao: descricaoRole,
        permissoes: permissoesRole
      };

      if (roleEditando) {
        await permissionsService.updateRole(roleEditando.id, dados);
      } else {
        await permissionsService.createRole(dados);
      }

      await carregarDados();
      setModalRole(false);
      setErro('✅ Role salvo com sucesso!');
      setTimeout(() => setErro(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar role:', error);
      setErro('❌ Erro ao salvar role');
    } finally {
      setSalvando(false);
    }
  };

  const atualizarUsuarioRole = async (usuarioId, roleId) => {
    try {
      await permissionsService.updateUserRole(usuarioId, roleId);
      await carregarDados();
      setErro('✅ Role do usuário atualizado!');
      setTimeout(() => setErro(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar role do usuário:', error);
      setErro('❌ Erro ao atualizar role');
    }
  };

  const togglePermissao = (permissaoId) => {
    setPermissoesRole(prev => 
      prev.includes(permissaoId)
        ? prev.filter(id => id !== permissaoId)
        : [...prev, permissaoId]
    );
  };

  // Agrupar permissões por módulo
  const permissoesPorModulo = permissoes.reduce((acc, perm) => {
    if (!acc[perm.modulo]) acc[perm.modulo] = [];
    acc[perm.modulo].push(perm);
    return acc;
  }, {});

  const getModuleIcon = (module) => {
    const icons = {
      spreadsheets: '📊',
      users: '👥',
      system: '⚙️',
      reports: '📈'
    };
    return icons[module] || '📁';
  };

  if (carregando) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Carregando sistema de permissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>🔐 Gerenciamento de Permissões</h1>
          <p>Configure roles e permissões do sistema</p>
        </div>
        <div className={styles.headerRight}>
          <Botao onClick={() => navigate('/master')} variante="secondary">
            ← Voltar ao Master
          </Botao>
        </div>
      </header>

      {erro && (
        <div className={styles.errorBanner}>
          {erro}
          <button onClick={() => setErro('')} className={styles.errorClose}>×</button>
        </div>
      )}

      {/* Conteúdo */}
      <div className={styles.content}>
        {/* Seção Roles */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>👑 Roles do Sistema</h2>
            <Botao onClick={() => abrirModalRole()}>
              ➕ Novo Role
            </Botao>
          </div>

          <div className={styles.rolesGrid}>
            {roles.map(role => (
              <div key={role.id} className={styles.roleCard}>
                <h3>{role.nome}</h3>
                <p>{role.descricao}</p>
                <div className={styles.permissionsCount}>
                  {role.permissoes?.length || 0} permissões
                </div>
                <div className={styles.roleActions}>
                  <button onClick={() => abrirModalRole(role)}>
                    ✏️ Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção Usuários */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>👥 Atribuição de Roles</h2>
          </div>

          <div className={styles.usersTable}>
            <table>
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Email</th>
                  <th>Role Atual</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(user => (
                  <tr key={user.id}>
                    <td>{user.nome}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[user.role?.nome]}`}>
                        {user.role?.nome}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={user.role?.id || ''}
                        onChange={(e) => atualizarUsuarioRole(user.id, e.target.value)}
                      >
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.nome}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Role */}
      <Modal
        isOpen={modalRole}
        onClose={() => setModalRole(false)}
        title={roleEditando ? 'Editar Role' : 'Novo Role'}
        size="large"
      >
        <div className={styles.roleForm}>
          <CampoForm rotulo="Nome do Role" obrigatorio>
            <input
              type="text"
              value={nomeRole}
              onChange={(e) => setNomeRole(e.target.value)}
              placeholder="Ex: editor, moderator"
            />
          </CampoForm>

          <CampoForm rotulo="Descrição">
            <textarea
              value={descricaoRole}
              onChange={(e) => setDescricaoRole(e.target.value)}
              placeholder="Descreva as responsabilidades deste role"
              rows={3}
            />
          </CampoForm>

          <div className={styles.permissionsSection}>
            <h3>Permissões</h3>
            
            {Object.entries(permissoesPorModulo).map(([modulo, perms]) => (
              <div key={modulo} className={styles.moduleGroup}>
                <h4>
                  {getModuleIcon(modulo)} {modulo.charAt(0).toUpperCase() + modulo.slice(1)}
                </h4>
                <div className={styles.permissionsList}>
                  {perms.map(perm => (
                    <label key={perm.id} className={styles.permissionItem}>
                      <input
                        type="checkbox"
                        checked={permissoesRole.includes(perm.id)}
                        onChange={() => togglePermissao(perm.id)}
                      />
                      <span>{perm.acao}</span>
                      <small>{perm.descricao}</small>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <Botao onClick={() => setModalRole(false)} variante="secondary">
            Cancelar
          </Botao>
          <Botao 
            onClick={salvarRole} 
            carregando={salvando}
            variante="success"
          >
            💾 Salvar Role
          </Botao>
        </div>
      </Modal>
    </div>
  );
};

export default PermissionsManager;