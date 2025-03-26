// dataModels.js - Define as estruturas de dados principais da aplicação
import { segments, DEFAULT_PL_STRUCTURE, DEFAULT_INDICADORES_STRUCTURE } from '../config.js';

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
    
    // NOVO: Estrutura para armazenar as diferenças causadas pelos ajustes
    this.diferencas = {
      total: {
        diferencaMargem: 0,
        diferencaPDD: 0,
        diferencaRWA: 0
      }
    };
    
    // NOVO: Estrutura para armazenar dados estáticos (pré-processados)
    this.dadosEstaticos = {
      reais: {
        segmentos: {},
        total: {}
      },
      ppto: {
        segmentos: {},
        total: {}
      },
      atingimentos: {
        segmentos: {},
        total: {}
      }
    };
    
    this.initializeData();
  }

  // Inicializa as estruturas de dados
  initializeData() {
    // Inicializa ajustes para cada segmento
    segments.forEach(segment => {
      this.ajustes[segment] = { credito: {}, captacoes: {}, comissoes: {} };
      
      // NOVO: Inicializa diferenças para cada segmento
      this.diferencas[segment] = {
        diferencaMargem: 0,
        diferencaPDD: 0,
        diferencaRWA: 0
      };
      
      // NOVO: Inicializa estruturas de dados estáticos para cada segmento
      this.dadosEstaticos.reais.segmentos[segment] = {};
      this.dadosEstaticos.ppto.segmentos[segment] = {};
      this.dadosEstaticos.atingimentos.segmentos[segment] = {};
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
  
  // Recupera o segmento atual selecionado
  getCurrentSegment() {
    const segmentSelect = document.getElementById('segment');
    return segmentSelect ? segmentSelect.value : 'Especial';
  }
}

// Exporta uma instância singleton do estado da aplicação
export const appState = new AppState();