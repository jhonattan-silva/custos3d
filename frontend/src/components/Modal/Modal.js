/*
 * Função: Componente modal reutilizável para exibir conteúdo sobreposto à página
 * Suporte a diferentes tamanhos e footer customizável
 * 
 * Funcionalidades:
 * - Overlay com backdrop blur
 * - Animação de entrada suave
 * - Fechamento ao clicar no overlay ou botão X
 * - Header com título e botão fechar
 * - Footer customizável para botões de ação
 * - Diferentes tamanhos (small, medium, large)
 * 
 * Props:
 * - isOpen (boolean): Controla visibilidade do modal
 * - onClose (function): Callback para fechar modal
 * - title (string): Título exibido no header
 * - children (ReactNode): Conteúdo principal do modal
 * - footer (ReactNode): Conteúdo do footer (botões)
 * - size (string): Tamanho do modal ('small', 'medium', 'large')
 * 
 * Comportamentos:
 * - Retorna null quando isOpen é false
 * - Chama onClose ao clicar no overlay
 * - Header e footer opcionais baseados nas props
 * - Acessibilidade com aria-label
 */

import React from 'react';
import styles from './Modal.module.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'medium' // small, medium, large
}) => {
  if (!isOpen) return null;

  // Fecha modal clicando no overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={`${styles.modalContainer} ${styles[size]}`}>
        {/* Header do Modal */}
        {title && (
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{title}</h2>
            <button 
              onClick={onClose}
              className={styles.modalCloseButton}
              aria-label="Fechar modal"
            >
              ×
            </button>
          </div>
        )}

        {/* Conteúdo do Modal */}
        <div className={styles.modalContent}>
          {children}
        </div>

        {/* Footer do Modal */}
        {footer && (
          <div className={styles.modalFooter}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
