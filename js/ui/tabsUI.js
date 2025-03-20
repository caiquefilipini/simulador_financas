// tabsUI.js - Gerencia a interface de usuário relacionada às abas
export function setupTabSystem() {
    const tabCredito = document.querySelector('[data-tab="credito"]');
    const tabCaptacoes = document.querySelector('[data-tab="captacoes"]');
    const tabComissoes = document.querySelector('[data-tab="comissoes"]');
    
    if (!tabCredito || !tabCaptacoes || !tabComissoes) {
      console.error("Botões de abas não encontrados!");
      return;
    }
    
    tabCredito.addEventListener('click', function() {
      switchTab('credito');
    });
    
    tabCaptacoes.addEventListener('click', function() {
      switchTab('captacoes');
    });
    
    tabComissoes.addEventListener('click', function() {
      switchTab('comissoes');
    });
  }
  
  // Função para alternar entre abas
  export function switchTab(tabId) {
    // Esconder todas as abas
    const tabContents = document.querySelectorAll('.tab-content');
    if (tabContents) {
      tabContents.forEach(tab => {
        tab.classList.remove('active');
      });
    }
    
    // Remover classe active de todos os botões
    const tabButtons = document.querySelectorAll('.tab-button');
    if (tabButtons) {
      tabButtons.forEach(button => {
        button.classList.remove('active');
      });
    }
    
    // Mostrar a aba selecionada
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
      activeTab.classList.add('active');
    }
    
    // Adicionar classe active ao botão clicado
    const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }