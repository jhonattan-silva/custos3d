/*
 * Função: Componente de botão reutilizável com diferentes estilos e estados
 * Padroniza visual e comportamento dos botões na aplicação
 * 
 * Funcionalidades:
 * - Múltiplas variantes de estilo (primary, secondary, success, danger, outline)
 * - Diferentes tamanhos (small, medium, large)
 * - Estados de loading com spinner
 * - Suporte a ícones
 * - Animações e efeitos hover
 * 
 * Props:
 * - children (ReactNode): Conteúdo/texto do botão
 * - variante (string): Estilo do botão ('primary', 'secondary', 'danger', 'success', 'outline')
 * - tamanho (string): Tamanho do botão ('small', 'medium', 'large')
 * - desabilitado (boolean): Se botão está desabilitado
 * - carregando (boolean): Exibe spinner e desabilita
 * - onClick (function): Callback de clique
 * - tipo (string): Tipo HTML do botão ('button', 'submit', 'reset')
 * - className (string): Classes CSS adicionais
 * - icone (ReactNode): Ícone a ser exibido
 * - ...props: Outras props são repassadas ao elemento button
 * 
 * Estados visuais:
 * - Normal, hover, focus, disabled, loading
 * - Gradientes e sombras para feedback visual
 */

import React from 'react';
import styles from './Botao.module.css';

const Botao = ({
  children,
  variante = 'primary', // primary, secondary, danger, success, outline
  tamanho = 'medium', // small, medium, large
  desabilitado = false,
  carregando = false,
  onClick,
  tipo = 'button',
  className = '',
  icone,
  ...props
}) => {
  const classeBotao = [
    styles.botao,
    styles[variante],
    styles[tamanho],
    desabilitado && styles.desabilitado,
    carregando && styles.carregando,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={tipo}
      className={classeBotao}
      onClick={onClick}
      disabled={desabilitado || carregando}
      {...props}
    >
      {carregando ? (
        <>
          <span className={styles.spinner}></span>
          {typeof children === 'string' ? 'Carregando...' : children}
        </>
      ) : (
        <>
          {icone && <span className={styles.icone}>{icone}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Botao;
