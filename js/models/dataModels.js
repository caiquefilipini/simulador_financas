// dataModels.js - Define as estruturas de dados principais da aplicação
import { segments, creditTypes, fundingTypes, commissionTypes, DEFAULT_PL_STRUCTURE, DEFAULT_INDICADORES_STRUCTURE } from '../config.js';

// Classe para gerenciar o estado global da aplicação
class AppState {
  constructor() {
    // Dados de P&L (gerais e por segmento)
    this.plDataTotal = { ...DEFAULT_PL_STRUCTURE };
    this.plDataTotalPPTO = {}; 
    this.indicadoresTotal = { ...DEFAULT_INDICADORES_STRUCTURE };
    this.segmentPLData = {};
    this.segmentPLDataPPTO = {};
    this.segmentIndicadores = {};
    this.data = null;

    // Dados de carteiras, spreads etc.
    this.dadosPlanilha = {
      credito: {},
      captacoes: {},
      comissoes: {}
    };

    // Armazenar os ajustes feitos por segmento
    this.ajustes = {};
    
    this.initializeData();
  }

  // Inicializa as estruturas de dados
  initializeData() {
    // Inicializa ajustes para cada segmento
    segments.forEach(segment => {
      this.ajustes[segment] = { credito: {}, captacoes: {}, comissoes: {} };
    });
    
    // Inicializa estruturas para cada segmento
    segments.forEach(segment => {
      this.segmentPLData[segment] = { ...DEFAULT_PL_STRUCTURE };
      this.segmentPLDataPPTO[segment] = {};
      this.segmentIndicadores[segment] = { ...DEFAULT_INDICADORES_STRUCTURE };
      
      // Inicializa dados para as abas
      this.dadosPlanilha.credito[segment] = {};
      this.dadosPlanilha.captacoes[segment] = {};
      this.dadosPlanilha.comissoes[segment] = {};
    });
  }

  // Preenche com dados padrão
  preencherDadosPadrao() {
    console.log("Preenchendo com dados padrão...");
    
    // Preencher dados de crédito, captação e comissão para todos os segmentos
    segments.forEach(segment => {
      // Crédito
      creditTypes[segment].forEach(tipo => {
        if (!this.dadosPlanilha.credito[segment]) this.dadosPlanilha.credito[segment] = {};
        this.dadosPlanilha.credito[segment][tipo] = {
          carteira: 0,
          spread: (0).toFixed(2),
          provisao: 0
        };
      });
      
      // Captações
      fundingTypes[segment].forEach(tipo => {
        if (!this.dadosPlanilha.captacoes[segment]) this.dadosPlanilha.captacoes[segment] = {};
        this.dadosPlanilha.captacoes[segment][tipo] = {
          carteira: 0,
          spread: (0).toFixed(2)
        };
      });
      
      // Comissões
      commissionTypes[segment].forEach(tipo => {
        if (!this.dadosPlanilha.comissoes[segment]) this.dadosPlanilha.comissoes[segment] = {};
        this.dadosPlanilha.comissoes[segment][tipo] = {
          valor: 0
        };
      });
    });
    
    // Atualiza o P&L Total e indicadores
    this.plDataTotal = { ...DEFAULT_PL_STRUCTURE };
    this.indicadoresTotal = { ...DEFAULT_INDICADORES_STRUCTURE };
    
    console.log("Dados padrão preenchidos com sucesso.");
  }
  
  // Recupera o segmento atual selecionado
  getCurrentSegment() {
    const segmentSelect = document.getElementById('segment');
    return segmentSelect ? segmentSelect.value : 'Especial';
  }
}

// Exporta uma instância singleton do estado da aplicação
export const appState = new AppState();