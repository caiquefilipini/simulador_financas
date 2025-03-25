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

    // Valores base calculados a partir das tabelas
    // this.valoresBase = {
    //   segmentos: {},
    //   total: {
    //     mobBase: 0,
    //     pddBase: 0,
    //     rwaBase: 0,
    //   }
    // };

    // NOVO: Valores reais para acesso rápido
    // this.valoresReais = {
    //   segmentos: {},
    //   total: {
    //     mobReal: 0,
    //     pddReal: 0,
    //     rwaReal: 0,
    //     baiReal: 0,
    //     impostosReal: 0,
    //     bdiReal: 0,
    //     orypReal: 0,
    //     demaisAtivosReal: 0,
    //     totalGastosReal: 0
    //   }
    // };

    // Armazenar os ajustes feitos por segmento
    this.ajustes = {};
    
    // NOVO: Flag para indicar se existem ajustes ativos
    // this.temAjustesAtivos = false;
    
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
      
      // NOVO: Inicializa a estrutura de valores reais
      // this.valoresReais.segmentos[segment] = {
      //   mobReal: 0,
      //   pddReal: 0,
      //   rwaReal: 0,
      //   baiReal: 0,
      //   impostosReal: 0,
      //   bdiReal: 0,
      //   orypReal: 0,
      //   demaisAtivosReal: 0,
      //   totalGastosReal: 0
      // };
    });
  }

  // Método para inicializar valores base
  // initializeInitialValues() {
    // segments.forEach(segment => {
    //   this.valoresBase.segmentos[segment] = {
    //     mobBase: 0,
    //     pddBase: 0,
    //     rwaBase: 0,
    //   };
    // });
    
    // Chamar a função de cálculo para preencher os valores
    // this.calcularValoresBase();
    
    // NOVO: Também calcular valores reais
    // this.calcularValoresReais();
  // }

  // Método para calcular valores base
  // calcularValoresBase() {
    
  //   // Valores acumulados para o total
  //   let totalMOBBase = 0;
  //   let totalPDDBase = 0;
  //   let totalRWABase = 0;
    
  //   // Para cada segmento, calcular valores base
  //   segments.forEach(segment => {
  //     let segmentoMOBBase = 0;
  //     let segmentoPDDBase = 0;
  //     let segmentoRWABase = 0;
      
  //     // 1. Calcular base para CRÉDITO
  //     const tiposCredito = Object.keys(this.dadosPlanilha.credito[segment] || {});
  //     tiposCredito.forEach(tipo => {
  //       const data = this.dadosPlanilha.credito[segment][tipo] || {};
        
  //       // Somar à base do segmento
  //       segmentoMOBBase += data.margem || 0;
  //       segmentoPDDBase += data.provisao || 0;
  //       segmentoRWABase += data.rwa || 0;
  //     });
      
  //     // 2. Calcular base para CAPTAÇÕES
  //     const tiposCaptacao = Object.keys(this.dadosPlanilha.captacoes[segment] || {});
  //     tiposCaptacao.forEach(tipo => {
  //       const data = this.dadosPlanilha.captacoes[segment][tipo] || {};
        
  //       // Somar ao MOB base do segmento
  //       segmentoMOBBase += data.margem || 0;
  //     });
      
  //     // 3. Calcular base para COMISSÕES
  //     const tiposComissao = Object.keys(this.dadosPlanilha.comissoes[segment] || {});
  //     tiposComissao.forEach(tipo => {
  //       const data = this.dadosPlanilha.comissoes[segment][tipo] || {};
        
  //       // Somar ao MOB base do segmento
  //       segmentoMOBBase += data.valor || 0;
  //     });
      
  //     // Armazenar os valores base do segmento
  //     this.valoresBase.segmentos[segment].mobBase = segmentoMOBBase;
  //     this.valoresBase.segmentos[segment].pddBase = segmentoPDDBase;
  //     this.valoresBase.segmentos[segment].rwaBase = segmentoRWABase;
      
  //     // Acumular para o total
  //     totalMOBBase += segmentoMOBBase;
  //     totalPDDBase += segmentoPDDBase;
  //     totalRWABase += segmentoRWABase;
  //   });
    
  //   // Armazenar os valores base do total
  //   this.valoresBase.total.mobBase = totalMOBBase;
  //   this.valoresBase.total.pddBase = totalPDDBase;
  //   this.valoresBase.total.rwaBase = totalRWABase;
    
  //   console.log("Valores base calculados:", this.valoresBase);
  // }

  // NOVO: Método para calcular valores reais
  // calcularValoresReais() {
  //   console.log("Calculando valores reais de todos os segmentos e total...");
    
  //   // Para cada segmento, obter valores reais dos objetos PL e Indicadores
  //   segments.forEach(segment => {
  //     if (!this.segmentPLData[segment]) return;
      
  //     // Armazenar os valores reais do segmento diretamente do PL e Indicadores
  //     this.valoresReais.segmentos[segment] = {
  //       mobReal: this.segmentPLData[segment].MOB?.real || 0,
  //       pddReal: this.segmentPLData[segment].PDD?.real || 0,
  //       rwaReal: this.segmentIndicadores[segment]?.RWA?.real || 0,
  //       baiReal: this.segmentPLData[segment].BAI?.real || 0,
  //       impostosReal: this.segmentPLData[segment].Impostos?.real || 0,
  //       bdiReal: this.segmentPLData[segment].BDI?.real || 0,
  //       orypReal: this.segmentPLData[segment].ORYP?.real || 0,
  //       demaisAtivosReal: this.segmentPLData[segment]["Demais Ativos"]?.real || 0,
  //       totalGastosReal: this.segmentPLData[segment]["Total Gastos"]?.real || 0
  //     };
  //   });
    
  //   // Armazenar os valores reais do total diretamente do plDataTotal e indicadoresTotal
  //   this.valoresReais.total = {
  //     mobReal: this.plDataTotal.MOB?.real || 0,
  //     pddReal: this.plDataTotal.PDD?.real || 0,
  //     rwaReal: this.indicadoresTotal.RWA?.real || 0,
  //     baiReal: this.plDataTotal.BAI?.real || 0,
  //     impostosReal: this.plDataTotal.Impostos?.real || 0,
  //     bdiReal: this.plDataTotal.BDI?.real || 0,
  //     orypReal: this.plDataTotal.ORYP?.real || 0,
  //     demaisAtivosReal: this.plDataTotal["Demais Ativos"]?.real || 0,
  //     totalGastosReal: this.plDataTotal["Total Gastos"]?.real || 0
  //   };
    
  //   console.log("Valores reais calculados:", this.valoresReais);
  // }
  
  // Recupera o segmento atual selecionado
  getCurrentSegment() {
    const segmentSelect = document.getElementById('segment');
    return segmentSelect ? segmentSelect.value : 'Especial';
  }
}

// Exporta uma instância singleton do estado da aplicação
export const appState = new AppState();