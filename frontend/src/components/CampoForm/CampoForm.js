/*
 * Função: Wrapper para campos de formulário com label, tooltip e validação
 * Padroniza estrutura e visual dos campos na aplicação
 * 
 * Funcionalidades:
 * - Label com indicador de campo obrigatório
 * - Tooltip informativo com ícone de interrogação
 * - Container para qualquer tipo de input/componente
 * - Exibição de mensagens de erro
 * - Estilos consistentes e responsivos
 * 
 * Props:
 * - rotulo (string): Texto do label do campo
 * - children (ReactNode): Input ou componente do campo
 * - tooltip (string): Texto explicativo exibido no hover/focus
 * - obrigatorio (boolean): Adiciona asterisco e marca como required
 * - erro (string): Mensagem de erro a ser exibida
 * - className (string): Classes CSS adicionais
 * 
 * Estrutura renderizada:
 * - Container principal com classe configurável
 * - Header com label, asterisco (se obrigatório) e ícone tooltip
 * - Container do input (children)
 * - Mensagem de erro (se presente)
 * 
 * Estados internos:
 * - mostrarTooltip: Controla visibilidade do tooltip
 * 
 * Comportamentos:
 * - Tooltip aparece no hover/focus do ícone ?
 * - Suporte completo a acessibilidade
 * - Estilos integrados com tema da aplicação
 */

import React, { useState } from 'react';
import styles from './CampoForm.module.css';

const CampoForm = ({
  rotulo,
  children,
  tooltip,
  obrigatorio = false,
  erro,
  className = ''
}) => {
  const [mostrarTooltip, setMostrarTooltip] = useState(false);

  return (
    <div className={`${styles.campoForm} ${className}`}>
      <div className={styles.containerRotulo}>
        <label className={styles.rotulo}>
          {rotulo}
          {obrigatorio && <span className={styles.obrigatorio}>*</span>}
        </label>
        
        {tooltip && (
          <div className={styles.containerTooltip}>
            <button
              type="button"
              className={styles.gatilhoTooltip}
              onMouseEnter={() => setMostrarTooltip(true)}
              onMouseLeave={() => setMostrarTooltip(false)}
              onFocus={() => setMostrarTooltip(true)}
              onBlur={() => setMostrarTooltip(false)}
            >
              ?
            </button>
            
            {mostrarTooltip && (
              <div className={styles.tooltip}>
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className={styles.containerInput}>
        {children}
      </div>
      
      {erro && (
        <div className={styles.erro}>
          {erro}
        </div>
      )}
    </div>
  );
};

export default CampoForm;
