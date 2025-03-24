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

    this.valoresBase = {
      segmentos: {},
      total: {
        mobBase: 0,
        pddBase: 0,
        molBase: 0,
        rwaBase: 0,
        margensCreditoBase: {},
        margensCaptacoesBase: {},
        comissoesBase: {}
      }
    };

    initializeBaseValues() {
      console.log("Inicializando valores base...");
      
      // Inicializar estrutura para cada segmento
      segments.forEach(segment => {
        this.valoresBase.segmentos[segment] = {
          mobBase: 0,
          pddBase: 0,
          molBase: 0,
          rwaBase: 0,
          margensCreditoBase: {},
          margensCaptacoesBase: {},
          comissoesBase: {}
        };
      });
      
      // Chamar a função de cálculo para preencher os valores
      this.calcularValoresBase();
    }

    calcularValoresBase() {
      console.log("Calculando valores base de todos os segmentos...");
      
      // Valores acumulados para o total
      let totalMOBBase = 0;
      let totalPDDBase = 0;
      let totalRWABase = 0;
      
      // Para cada segmento, calcular valores base
      segments.forEach(segment => {
        let segmentoMOBBase = 0;
        let segmentoPDDBase = 0;
        let segmentoRWABase = 0;
        
        // 1. Calcular base para CRÉDITO
        const tiposCredito = Object.keys(this.dadosPlanilha.credito[segment] || {});
        tiposCredito.forEach(tipo => {
          const data = this.dadosPlanilha.credito[segment][tipo] || {};
          
          // Armazenar margens base para cada tipo
          this.valoresBase.segmentos[segment].margensCreditoBase[tipo] = data.margem || 0;
          
          // Somar ao MOB base do segmento
          segmentoMOBBase += data.margem || 0;
          
          // Somar ao PDD base do segmento
          segmentoPDDBase += data.provisao || 0;
          
          // Somar ao RWA base do segmento
          segmentoRWABase += data.rwa || 0;
        });
        
        // 2. Calcular base para CAPTAÇÕES
        const tiposCaptacao = Object.keys(this.dadosPlanilha.captacoes[segment] || {});
        tiposCaptacao.forEach(tipo => {
          const data = this.dadosPlanilha.captacoes[segment][tipo] || {};
          
          // Armazenar margens base para cada tipo
          this.valoresBase.segmentos[segment].margensCaptacoesBase[tipo] = data.margem || 0;
          
          // Somar ao MOB base do segmento
          segmentoMOBBase += data.margem || 0;
        });
        
        // 3. Calcular base para COMISSÕES
        const tiposComissao = Object.keys(this.dadosPlanilha.comissoes[segment] || {});
        tiposComissao.forEach(tipo => {
          const data = this.dadosPlanilha.comissoes[segment][tipo] || {};
          
          // Armazenar valores base para cada tipo
          this.valoresBase.segmentos[segment].comissoesBase[tipo] = data.valor || 0;
          
          // Somar ao MOB base do segmento
          segmentoMOBBase += data.valor || 0;
        });
        
        // Armazenar os valores base do segmento
        this.valoresBase.segmentos[segment].mobBase = segmentoMOBBase;
        this.valoresBase.segmentos[segment].pddBase = segmentoPDDBase;
        this.valoresBase.segmentos[segment].rwaBase = segmentoRWABase;
        this.valoresBase.segmentos[segment].molBase = segmentoMOBBase + segmentoPDDBase;
        
        // Acumular para o total
        totalMOBBase += segmentoMOBBase;
        totalPDDBase += segmentoPDDBase;
        totalRWABase += segmentoRWABase;
      });
      
      // Armazenar os valores base do total
      this.valoresBase.total.mobBase = totalMOBBase;
      this.valoresBase.total.pddBase = totalPDDBase;
      this.valoresBase.total.rwaBase = totalRWABase;
      this.valoresBase.total.molBase = totalMOBBase + totalPDDBase;
      
      console.log("Valores base calculados:", this.valoresBase);
    }

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