// main.js - Arquivo principal que inicializa a aplicação
import { segments } from './config.js';
import { appState } from './models/dataModels.js';
import { carregarDadosJSON } from './services/dataService.js';
import { loadCreditData } from './ui/creditUI.js';
import { loadFundingData } from './ui/fundingUI.js';
import { loadCommissionData } from './ui/commissionUI.js';
import { loadPLData, loadIndicadoresData, setupPLViewButtons } from './ui/plUI.js';
import { atualizarAjustesRealizados, setupActionButtons } from './ui/adjustmentsUI.js';
import { setupTabSystem } from './ui/tabsUI.js';

// Função de inicialização do aplicativo
async function initialize() {
  const segmentSelect = document.getElementById('segment');
  // Preencher seletor de segmentos
  segments.forEach(segment => {
    const option = document.createElement('option');
    option.value = segment;
    option.textContent = segment;
    segmentSelect.appendChild(option);
  });

  await carregarDadosJSON();
  
  setupTabSystem(); // Configurar o sistema de abas
  setupActionButtons(); // Configurar botões de ação
  setupPLViewButtons(); // Configurar os botões de visualização do P&L
  
  // Inicializar as visualizações
  const segmentoAtual = segmentSelect.value;
  loadCreditData(segmentoAtual);
  loadFundingData(segmentoAtual);
  loadCommissionData(segmentoAtual);
  loadPLData('total');
  loadIndicadoresData('total');
  atualizarAjustesRealizados();
  
  // Event listener para mudança de segmento
  segmentSelect.addEventListener('change', function() {
    loadCreditData(this.value);
    loadFundingData(this.value);
    loadCommissionData(this.value);
    atualizarAjustesRealizados();
  });
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initialize);