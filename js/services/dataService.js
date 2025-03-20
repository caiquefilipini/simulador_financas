// dataService.js - Serviços para carregar e processar dados
import { segments, creditTypes, fundingTypes, commissionTypes } from '../config.js';
import { appState } from '../models/dataModels.js';
import { normalizarValorNumerico } from '../models/calculationModels.js';
import { formatNumber } from '../utils/formatters.js';

// Carrega os dados JSON da API ou arquivo
// Modifique a função carregarDadosJSON no arquivo dataService.js
// para garantir que os dados são carregados corretamente

export async function carregarDadosJSON() {
    try {
      console.log("Carregando dados do JSON...");
      
      // Carregar o JSON pré-processado
      const response = await fetch('dict_indicadores.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Dados JSON carregados com sucesso:", data);
      
      // Verificar se os dados têm a estrutura esperada
      if (!data || typeof data !== 'object') {
        throw new Error('Formato de dados inválido!');
      }
      
      // Armazenar dados originais
      appState.data = data;
      
      // Processar dados para nossas estruturas
      processarDadosCarregados(data);
      
      // Verificar se temos os segmentos mínimos necessários
      const segmentosNecessarios = ['Especial', 'Total'];
      for (const seg of segmentosNecessarios) {
        if (!data[seg]) {
          console.warn(`Aviso: Segmento '${seg}' não encontrado nos dados carregados`);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao carregar ou processar dados JSON:", error);
      
      // Mesmo em caso de erro, garantimos que appState.data não seja undefined
      if (!appState.data) {
        appState.data = {
          Total: { 
            cascada: { 
              MOB: 0, PDD: 0, MOL: 0, BAI: 0, BDI: 0, Impostos: 0, 
              RWA: 0, RORWA: 0, "Total Gastos": 0, "Demais Ativos": 0, Oryp: 0
            } 
          }
        };
        
        // Para cada segmento, criar uma estrutura mínima
        segments.forEach(segment => {
          appState.data[segment] = { 
            cascada: { 
              MOB: 0, PDD: 0, MOL: 0, BAI: 0, BDI: 0, Impostos: 0, 
              RWA: 0, RORWA: 0, "Total Gastos": 0, "Demais Ativos": 0, Oryp: 0
            }
          };
        });
      }
      
      appState.preencherDadosPadrao();
      return false;
    }
  }

// Processa os dados JSON para as estruturas da aplicação
export function processarDadosJSON(data) {
  try {
    console.log("Processando dados JSON...");
    
    // Armazenar dados originais
    appState.data = data;
    
    // Processar dados para nossas estruturas
    processarDadosCarregados(data);
    
    console.log("Dados processados com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao processar dados JSON:", error);
    appState.preencherDadosPadrao();
    return false;
  }
}

// Função interna para processar dados
function processarDadosCarregados(data) {
  // Inicializar estruturas para cada segmento
  segments.forEach(segment => {
    appState.segmentPLData[segment] = { ...appState.DEFAULT_PL_STRUCTURE };
    appState.segmentIndicadores[segment] = { ...appState.DEFAULT_INDICADORES_STRUCTURE };
    
    // Inicializar dados para as abas
    appState.dadosPlanilha.credito[segment] = {};
    appState.dadosPlanilha.captacoes[segment] = {};
    appState.dadosPlanilha.comissoes[segment] = {};
  });
  
  // Processar dados do JSON para as estruturas da aplicação
  segments.forEach(segment => {
    if (data[segment]) {
      // Processar dados de crédito
      if (data[segment].credito) {
        const creditData = data[segment].credito;
        
        // Para cada tipo de crédito no JSON, mapear para nossas estruturas
        Object.keys(creditData.carteira || {}).forEach(tipoCredito => {
          appState.dadosPlanilha.credito[segment][tipoCredito] = {
            carteira: creditData.carteira && creditData.carteira[tipoCredito] !== undefined 
              ? creditData.carteira[tipoCredito] : 0,
            spread: creditData.spread && creditData.spread[tipoCredito] !== undefined 
              ? creditData.spread[tipoCredito] : 0,
            provisao: creditData.provisao && creditData.provisao[tipoCredito] !== undefined 
              ? creditData.provisao[tipoCredito] : 0,
            margem: creditData.margem && creditData.margem[tipoCredito] !== undefined 
              ? creditData.margem[tipoCredito] : 0,
            rwa: creditData.rwa && creditData.rwa[tipoCredito] !== undefined 
              ? creditData.rwa[tipoCredito] : 0
          };
        });
      }
      
      // Processar dados de captações
      if (data[segment].captacoes) {
        const captacaoData = data[segment].captacoes;
        
        // Para cada tipo de captação no JSON, mapear para nossas estruturas
        Object.keys(captacaoData.carteira || {}).forEach(tipoCaptacao => {
          appState.dadosPlanilha.captacoes[segment][tipoCaptacao] = {
            carteira: captacaoData.carteira[tipoCaptacao] || 0,
            spread: captacaoData.spread[tipoCaptacao] || 0,
            margem: captacaoData.margem[tipoCaptacao] || 0,
          };
        });
      }
      
      // Processar dados de comissões
      if (data[segment].comissoes) {
        // Para cada tipo de comissão no JSON, mapear para nossas estruturas
        Object.keys(data[segment].comissoes).forEach(tipoComissao => {
          appState.dadosPlanilha.comissoes[segment][tipoComissao] = {
            valor: data[segment].comissoes[tipoComissao] || 0
          };
        });
      }
      
      // Processar dados da cascata (P&L)
      if (data[segment].cascada) {
        processarDadosCascadaSegmento(segment, data[segment].cascada);
      }
    }
  });
  
  // Processar dados consolidados (Total)
  if (data.Total && data.Total.cascada) {
    processarDadosCascadaTotal(data.Total.cascada);
  }
  
  // Garantir que temos valores para todos os tipos necessários
  preencherTiposFaltantes();
  
  console.log("Dados processados com sucesso:", {
    plDataTotal: appState.plDataTotal,
    indicadoresTotal: appState.indicadoresTotal,
    segmentPLData: appState.segmentPLData,
    segmentIndicadores: appState.segmentIndicadores,
    dadosPlanilha: appState.dadosPlanilha
  });
}

// Processa os dados de cascada para um segmento específico
function processarDadosCascadaSegmento(segment, cascadaData) {
  // Processar RWA e RORWA
  if (cascadaData.RWA !== undefined) {
    appState.segmentIndicadores[segment].RWA = {
      real: cascadaData.RWA,
      simulado: cascadaData.RWA,
      atingimentoReal: "-",
      atingimentoSimulado: "-"
    };
  }
  
  if (cascadaData.RORWA !== undefined) {
    appState.segmentIndicadores[segment].RORWA = {
      real: cascadaData.RORWA,
      simulado: cascadaData.RORWA,
      atingimentoReal: "-",
      atingimentoSimulado: "-"
    };
  }
  
  // Mapear para a estrutura de P&L
  if (cascadaData["MOB"] !== undefined) {
    appState.segmentPLData[segment].MOB = {
      real: cascadaData["MOB"],
      simulado: cascadaData["MOB"],
      atingimentoReal: 100,
      atingimentoSimulado: 100
    };
  }
  
  if (cascadaData.PDD !== undefined) {
    appState.segmentPLData[segment].PDD = {
      real: cascadaData.PDD,
      simulado: cascadaData.PDD,
      atingimentoReal: 100,
      atingimentoSimulado: 100
    };
  }
  
  if (cascadaData.MOL !== undefined) {
    appState.segmentPLData[segment].MOL = {
      real: cascadaData.MOL,
      simulado: cascadaData.MOL,
      atingimentoReal: 100,
      atingimentoSimulado: 100
    };
  }
  
  if (cascadaData.Oryp !== undefined) {
    appState.segmentPLData[segment].ORYP = {
      real: cascadaData.Oryp,
      simulado: cascadaData.Oryp,
      atingimentoReal: 100,
      atingimentoSimulado: 100
    };
  }
  
  if (cascadaData["Demais Ativos"] !== undefined) {
    appState.segmentPLData[segment]["Demais Ativos"] = {
      real: cascadaData["Demais Ativos"],
      simulado: cascadaData["Demais Ativos"],
      atingimentoReal: 100,
      atingimentoSimulado: 100
    };
  }
  
  if (cascadaData["Total Gastos"] !== undefined) {
    appState.segmentPLData[segment]["Total Gastos"] = {
      real: cascadaData["Total Gastos"],
      simulado: cascadaData["Total Gastos"],
      atingimentoReal: 100,
      atingimentoSimulado: 100
    };
  }
  
  if (cascadaData.BAI !== undefined) {
    appState.segmentPLData[segment].BAI = {
      real: cascadaData.BAI,
      simulado: cascadaData.BAI,
      atingimentoReal: 100,
      atingimentoSimulado: 100
    };
  }
  
  if (cascadaData.Impostos !== undefined) {
    appState.segmentPLData[segment].Impostos = {
      real: cascadaData.Impostos,
      simulado: cascadaData.Impostos,
      atingimentoReal: 100,
      atingimentoSimulado: 100
    };
  }
  
  if (cascadaData.BDI !== undefined) {
    appState.segmentPLData[segment].BDI = {
      real: cascadaData.BDI,
      simulado: cascadaData.BDI,
      atingimentoReal: 100,
      atingimentoSimulado: 100
    };
  }

  // Calcular alguns indicadores básicos
  calcularIndicadoresBasicos(segment);
}

// Calcula indicadores básicos para um segmento
function calcularIndicadoresBasicos(segment) {
  // Taxa Impositiva
  if (appState.segmentPLData[segment].BAI && appState.segmentPLData[segment].Impostos) {
    const bai = appState.segmentPLData[segment].BAI.real;
    const impostos = appState.segmentPLData[segment].Impostos.real;
    
    if (bai !== 0) {
      const taxaImpositiva = Math.abs((impostos / bai) * 100);
      appState.segmentIndicadores[segment]["Taxa Impositiva"] = {
        real: taxaImpositiva,
        simulado: taxaImpositiva,
        atingimentoReal: 100,
        atingimentoSimulado: 100
      };
    }
  }
  
  // Eficiência
  if (appState.segmentPLData[segment]["Total Gastos"] && appState.segmentPLData[segment].MOB) {
    const gastos = Math.abs(appState.segmentPLData[segment]["Total Gastos"].real);
    const mob = appState.segmentPLData[segment].MOB.real;
    
    if (mob !== 0) {
      const eficiencia = (gastos / mob) * 100;
      appState.segmentIndicadores[segment]["Eficiência"] = {
        real: eficiencia,
        simulado: eficiencia,
        atingimentoReal: 100,
        atingimentoSimulado: 100
      };
    }
  }
}

// Processa os dados de cascada para o Total
function processarDadosCascadaTotal(cascadaTotal) {
  // Processar RWA e RORWA para o Total
  if (cascadaTotal.RWA !== undefined) {
    appState.indicadoresTotal.RWA = {
      real: cascadaTotal.RWA,
      simulado: cascadaTotal.RWA,
      atingimentoReal: "-",
      atingimentoSimulado: "-"
    };
  }
  
  if (cascadaTotal.RORWA !== undefined) {
    appState.indicadoresTotal.RORWA = {
      real: cascadaTotal.RORWA,
      simulado: cascadaTotal.RORWA,
      atingimentoReal: "-",
      atingimentoSimulado: "-"
    };
  }
  
  // Mapear para a estrutura de P&L Total
  Object.keys(cascadaTotal).forEach(key => {
    let plKey = key;
    
    // Mapeamento especial para alguns campos
    if (key === "MOB") plKey = "MOB";
    if (key === "Oryp") plKey = "ORYP";
    
    if (appState.plDataTotal[plKey] !== undefined) {
      appState.plDataTotal[plKey] = {
        real: cascadaTotal[key],
        simulado: cascadaTotal[key],
        atingimentoReal: 100,
        atingimentoSimulado: 100
      };
    }
  });
  
  // Calcular indicadores consolidados
  if (appState.plDataTotal.BAI && appState.plDataTotal.Impostos) {
    const baiTotal = appState.plDataTotal.BAI.real;
    const impostosTotal = appState.plDataTotal.Impostos.real;
    
    if (baiTotal !== 0) {
      const taxaImpositiva = Math.abs((impostosTotal / baiTotal) * 100);
      appState.indicadoresTotal["Taxa Impositiva"] = {
        real: taxaImpositiva,
        simulado: taxaImpositiva,
        atingimentoReal: 100,
        atingimentoSimulado: 100
      };
    }
  }
  
  if (appState.plDataTotal["Total Gastos"] && appState.plDataTotal.MOB) {
    const gastosTotal = Math.abs(appState.plDataTotal["Total Gastos"].real);
    const mobTotal = appState.plDataTotal.MOB.real;
    
    if (mobTotal !== 0) {
      const eficiencia = (gastosTotal / mobTotal) * 100;
      appState.indicadoresTotal["Eficiência"] = {
        real: eficiencia,
        simulado: eficiencia,
        atingimentoReal: 100,
        atingimentoSimulado: 100
      };
    }
  }
}

// Garante que temos valores para todos os tipos necessários
function preencherTiposFaltantes() {
  segments.forEach(segment => {
    // Para crédito
    creditTypes[segment].forEach(tipo => {
      if (!appState.dadosPlanilha.credito[segment][tipo]) {
        appState.dadosPlanilha.credito[segment][tipo] = {
          carteira: 1000,
          spread: 2.00,
          provisao: 100,
          margem: 100,
          rwa: 100
        };
      }
    });
    
    // Para captações
    fundingTypes[segment].forEach(tipo => {
      if (!appState.dadosPlanilha.captacoes[segment][tipo]) {
        appState.dadosPlanilha.captacoes[segment][tipo] = {
          carteira: 2000,
          spread: 1.00,
          margem: 100,
        };
      }
    });
    
    // Para comissões
    commissionTypes[segment].forEach(tipo => {
      if (!appState.dadosPlanilha.comissoes[segment][tipo]) {
        appState.dadosPlanilha.comissoes[segment][tipo] = {
          valor: 500
        };
      }
    });
  });
}