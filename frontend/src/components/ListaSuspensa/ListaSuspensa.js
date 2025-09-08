/*
 * LISTA SUSPENSA COMPONENT
 * 
 * Função: Componente dropdown/select customizado com navegação por teclado e estilos modernos
 * Substitui o elemento select nativo com melhor UX
 * 
 * Funcionalidades:
 * - Dropdown customizado com animações
 * - Navegação completa por teclado (Arrow keys, Enter, Escape)
 * - Fechamento automático ao clicar fora
 * - Suporte a ícones e textos personalizados
 * - Estados visuais (hover, focus, selected)
 * - Check mark para item selecionado
 * - Scrollbar customizada
 * 
 * Props:
 * - valor (string): Valor atualmente selecionado
 * - onChange (function): Callback quando valor muda
 * - opcoes (array): Lista de opções (string ou {valor, texto})
 * - placeholder (string): Texto quando nada selecionado
 * - className (string): Classes CSS adicionais
 * - desabilitado (boolean): Se componente está desabilitado
 * - tamanho (string): Tamanho do componente ('small', 'medium', 'large')
 * 
 * Navegação por teclado:
 * - Enter/Space: Abre dropdown ou seleciona item destacado
 * - Escape: Fecha dropdown
 * - Arrow Up/Down: Navega entre opções
 * - Tab: Navegação normal de foco
 * 
 * Estados internos:
 * - aberto: Controla visibilidade do dropdown
 * - destacado: Item atualmente destacado para navegação
 */

import React, { useState, useRef, useEffect } from 'react';
import styles from './ListaSuspensa.module.css';

const ListaSuspensa = ({
  valor,
  onChange,
  opcoes = [],
  placeholder = 'Selecione...',
  className = '',
  desabilitado = false,
  tamanho = 'medium' // small, medium, large
}) => {
  const [aberto, setAberto] = useState(false);
  const [destacado, setDestacado] = useState(-1);
  const containerRef = useRef(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegar com teclado
  const handleKeyDown = (e) => {
    if (desabilitado) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!aberto) {
          setAberto(true);
        } else if (destacado >= 0) {
          selecionarOpcao(opcoes[destacado]);
        }
        break;
      case 'Escape':
        setAberto(false);
        setDestacado(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!aberto) {
          setAberto(true);
        } else {
          setDestacado(prev => 
            prev < opcoes.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (aberto) {
          setDestacado(prev => 
            prev > 0 ? prev - 1 : opcoes.length - 1
          );
        }
        break;
    }
  };

  const selecionarOpcao = (opcao) => {
    const valorOpcao = typeof opcao === 'string' ? opcao : opcao.valor;
    onChange(valorOpcao);
    setAberto(false);
    setDestacado(-1);
  };

  const toggleDropdown = () => {
    if (!desabilitado) {
      setAberto(!aberto);
    }
  };

  const obterTextoExibicao = () => {
    if (!valor) return placeholder;
    
    const opcaoSelecionada = opcoes.find(opcao => 
      typeof opcao === 'string' ? opcao === valor : opcao.valor === valor
    );
    
    if (opcaoSelecionada) {
      return typeof opcaoSelecionada === 'string' 
        ? opcaoSelecionada 
        : opcaoSelecionada.texto;
    }
    
    return valor;
  };

  const classesContainer = [
    styles.listaSuspensa,
    styles[tamanho],
    aberto && styles.aberto,
    desabilitado && styles.desabilitado,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      ref={containerRef}
      className={classesContainer}
      onKeyDown={handleKeyDown}
      tabIndex={desabilitado ? -1 : 0}
    >
      <div 
        className={styles.seletor}
        onClick={toggleDropdown}
        role="combobox"
        aria-expanded={aberto}
        aria-haspopup="listbox"
      >
        <span className={styles.textoSelecionado}>
          {obterTextoExibicao()}
        </span>
        <span className={`${styles.seta} ${aberto ? styles.setaAberta : ''}`}>
          ▼
        </span>
      </div>

      {aberto && (
        <div className={styles.dropdown} role="listbox">
          {opcoes.map((opcao, index) => {
            const valorOpcao = typeof opcao === 'string' ? opcao : opcao.valor;
            const textoOpcao = typeof opcao === 'string' ? opcao : opcao.texto;
            const isSelected = valor === valorOpcao;
            const isHighlighted = index === destacado;

            return (
              <div
                key={valorOpcao}
                className={`${styles.opcao} ${
                  isSelected ? styles.selecionada : ''
                } ${isHighlighted ? styles.destacada : ''}`}
                onClick={() => selecionarOpcao(opcao)}
                role="option"
                aria-selected={isSelected}
              >
                {textoOpcao}
                {isSelected && (
                  <span className={styles.checkMark}>✓</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ListaSuspensa;
