// calculationModels.js - Contém as funções de cálculo utilizadas na aplicação
import { appState } from './dataModels.js';
import { segments } from '../config.js';
import { loadPLData, loadIndicadoresData } from '../ui/plUI.js';

// Função para normalizar valores numéricos
export function normalizarValorNumerico(valor) {
  if (valor === undefined || valor === null) return 0;
  if (typeof valor === 'number') return valor;
  if (typeof valor === 'string') {
    // Remover caracteres não numéricos exceto ponto e vírgula
    const valorLimpo = valor.replace(/[^\d.,\-]/g, '').replace(',', '.');
    return parseFloat(valorLimpo) || 0;
  }
  return 0;
}

// Calcula a margem simulada para crédito
export function calcularMargemSimulada(carteiraSimulada, spreadSimulado) {
  return carteiraSimulada * (spreadSimulado / 100);
}

// Calcula o RWA simulado
export function calcularRWASimulado(rwaReal, carteiraReal, carteiraSimulada) {
  if (carteiraReal === 0) return 0;
  return (rwaReal / carteiraReal) * carteiraSimulada;
}

// Calcula provisão simulada baseada em alteração da carteira
export function calcularProvisaoSimulada(provisaoReal, carteiraReal, carteiraSimulada) {
  if (carteiraReal === 0) return 0;
  return (provisaoReal / carteiraReal) * carteiraSimulada;
}

// Calcula a margem simulada para captações
export function calcularMargemSimuladaCaptacoes(carteiraSimulada, spreadSimulado) {
  return carteiraSimulada * (spreadSimulado / 100);
}

// Função para calcular a cascada simulada
export function calcularCascadaSimulado(segment) {
  console.log(`Calculando cascada simulado para segmento: ${segment}`);

  // Obter referências aos dados
  let plData = (segment === 'total') ? appState.plDataTotal : appState.segmentPLData[segment];
  let indicadoresData = (segment === 'total') ? appState.indicadoresTotal : appState.segmentIndicadores[segment];
  
  // Inicializar somas para valores reais e simulados
  let somaPDDReais = 0;
  let somaPDDSimuladas = 0;
  let somaMargensCredito = 0;
  let somaMargensSimuladasCredito = 0;
  let somaMargensCaptacoes = 0;
  let somaMargensSimuladasCaptacoes = 0;
  let somaComissoes = 0;
  let somaComissoesSimuladas = 0;
  let somaRWAReais = 0;
  let somaRWASimulados = 0;
  
  // Determinar quais segmentos considerar
  const segmentosParaCalcular = segment === 'total' ? segments : [segment];
  
  // Iterar sobre os segmentos relevantes
  segmentosParaCalcular.forEach(segmento => {      
    // CRÉDITO: somar valores de todos os tipos
    const tiposCredito = Object.keys(appState.dadosPlanilha.credito[segmento] || {});
    tiposCredito.forEach(tipo => {
      const data = appState.dadosPlanilha.credito[segmento][tipo] || {};
      const ajustes = appState.ajustes?.[segmento]?.credito || {};
      
      // Valores reais (das tabelas)
      const carteiraReal = data.carteira || 0;
      const spreadReal = data.spread || 0;
      const provisaoReal = data.provisao || 0;
      const margemReal = data.margem || 0;
      const rwaReal = data.rwa || 0;
      
      // Valores base (das tabelas)
      const margemBase = appState.valoresBase.segmentos[segmento].margensCreditoBase[tipo] || 0;
      
      // Valores simulados
      const carteiraSimulada = ajustes[`${tipo}_carteiraSimulada`] !== undefined ? 
        parseFloat(ajustes[`${tipo}_carteiraSimulada`]) : carteiraReal;
      const spreadSimulado = ajustes[`${tipo}_spreadSimulado`] !== undefined ? 
        parseFloat(ajustes[`${tipo}_spreadSimulado`]) : spreadReal;
      const provisaoSimulada = ajustes[`${tipo}_provisaoSimulada`] !== undefined ? 
        parseFloat(ajustes[`${tipo}_provisaoSimulada`]) : provisaoReal;
      
      // Calcular margem e RWA simulados
      const margemSimulada = calcularMargemSimulada(carteiraSimulada, spreadSimulado);
      const rwaSimulado = calcularRWASimulado(rwaReal, carteiraReal, carteiraSimulada);
      
      // Acumular somas usando os valores reais das tabelas
      somaPDDReais += provisaoReal;
      somaPDDSimuladas += provisaoSimulada;
      somaMargensCredito += margemBase; // Usar margemBase em vez de margemReal
      somaMargensSimuladasCredito += margemSimulada;
      somaRWAReais += rwaReal;
      somaRWASimulados += rwaSimulado;
    });
    
    // CAPTAÇÕES: somar valores de todos os tipos
    const tiposCaptacao = Object.keys(appState.dadosPlanilha.captacoes[segmento] || {});
    tiposCaptacao.forEach(tipo => {
      const data = appState.dadosPlanilha.captacoes[segmento][tipo] || {};
      const ajustes = appState.ajustes?.[segmento]?.captacoes || {};
      
      // Valores reais
      const carteiraReal = data.carteira || 0;
      const spreadReal = data.spread || 0;
      
      // Valores base
      const margemBase = appState.valoresBase.segmentos[segmento].margensCaptacoesBase[tipo] || 0;
      
      // Valores simulados
      const carteiraSimulada = ajustes[`${tipo}_carteiraSimulada`] !== undefined ? 
        parseFloat(ajustes[`${tipo}_carteiraSimulada`]) : carteiraReal;
      const spreadSimulado = ajustes[`${tipo}_spreadSimulado`] !== undefined ? 
        parseFloat(ajustes[`${tipo}_spreadSimulado`]) : spreadReal;
      
      // Calcular margem simulada
      const margemSimulada = calcularMargemSimuladaCaptacoes(carteiraSimulada, spreadSimulado);
      
      // Acumular somas
      somaMargensCaptacoes += margemBase; // Usar margemBase em vez de data.margem
      somaMargensSimuladasCaptacoes += margemSimulada;
    });
    
    // COMISSÕES: somar valores de todos os tipos
    const tiposComissao = Object.keys(appState.dadosPlanilha.comissoes[segmento] || {});
    tiposComissao.forEach(tipo => {
      const data = appState.dadosPlanilha.comissoes[segmento][tipo] || {};
      const ajustes = appState.ajustes?.[segmento]?.comissoes || {};
      
      // Valores base
      const valorBase = appState.valoresBase.segmentos[segmento].comissoesBase[tipo] || 0;
      
      // Valores simulados
      const valorSimulado = ajustes[`${tipo}_valorSimulado`] !== undefined ? 
        parseFloat(ajustes[`${tipo}_valorSimulado`]) : data.valor || 0;
      
      // Acumular somas
      somaComissoes += valorBase; // Usar valorBase em vez de data.valor
      somaComissoesSimuladas += valorSimulado;
    });
  });

  // Usar valores base em vez de valores do cascada
  let valoresBase;
  if (segment === 'total') {
    valoresBase = appState.valoresBase.total;
  } else {
    valoresBase = appState.valoresBase.segmentos[segment];
  }
  
  // Calcular diferenças em relação aos valores base
  const diferencaRWA = somaRWASimulados - somaRWAReais;
  const diferencaPDD = somaPDDSimuladas - somaPDDReais;
  const diferencaMargensCredito = somaMargensSimuladasCredito - somaMargensCredito;
  const diferencaMargensCaptacoes = somaMargensSimuladasCaptacoes - somaMargensCaptacoes;
  const diferencaComissoes = somaComissoesSimuladas - somaComissoes;
  
  // Calcular valores simulados com base nos valores base e nas diferenças
  const rwaSimulado = valoresBase.rwaBase + diferencaRWA;
  const pddSimulado = valoresBase.pddBase + diferencaPDD;
  
  const diferencaMargem = diferencaMargensCredito + diferencaMargensCaptacoes + diferencaComissoes;
  const mobSimulado = valoresBase.mobBase + diferencaMargem;
  
  const molSimulado = mobSimulado + pddSimulado;
  
  // Manter valores reais do cascada para estes
  const orypReal = plData.ORYP.real || 0;
  const demaisAtivosReal = plData["Demais Ativos"].real || 0;
  const totalGastosReal = plData["Total Gastos"].real || 0;
  
  const baiSimulado = molSimulado + orypReal + demaisAtivosReal + totalGastosReal;
  
  // Cálculo de impostos simulados
  // Aqui ainda usamos o cascada real como referência para os cálculos de impostos
  const mobReal = plData.MOB.real || 0;
  const difMob = mobSimulado - mobReal;
  const pisSimuladoDif = difMob * 0.0465;
  const irSimuladoDif = difMob * 0.3;
  const impostosReal = plData.Impostos.real || 0;
  const impostosSimulado = impostosReal - irSimuladoDif - pisSimuladoDif;
  
  // BDI
  const bdiSimulado = baiSimulado + impostosSimulado;
  
  // Cálculo de indicadores
  const taxaImpositivaSimulada = baiSimulado !== 0 ? Math.abs((impostosSimulado / baiSimulado) * 100) : 0;
  const eficienciaSimulada = mobSimulado !== 0 ? Math.abs((totalGastosReal / mobSimulado) * 100) : 0;
  const rorwaSimulado = rwaSimulado !== 0 ? (bdiSimulado / rwaSimulado) * 100 : 0;
  
  // Cálculo de % PPTO
  const mobPPTO = appState.data?.[segment]?.cascada_ppto?.PPTO_MOB || 
                 appState.data?.Total?.cascada_ppto?.PPTO_MOB || 0;
  const pddPPTO = appState.data?.[segment]?.cascada_ppto?.PPTO_PDD || 
                 appState.data?.Total?.cascada_ppto?.PPTO_PDD || 0;
  const molPPTO = appState.data?.[segment]?.cascada_ppto?.PPTO_MOL || 
                 appState.data?.Total?.cascada_ppto?.PPTO_MOL || 0;
  const baiPPTO = appState.data?.[segment]?.cascada_ppto?.PPTO_BAI || 
                 appState.data?.Total?.cascada_ppto?.PPTO_BAI || 0;
  const impostosPPTO = appState.data?.[segment]?.cascada_ppto?.PPTO_Impostos || 
                      appState.data?.Total?.cascada_ppto?.PPTO_Impostos || 0;
  const bdiPPTO = appState.data?.[segment]?.cascada_ppto?.PPTO_BDI || 
                 appState.data?.Total?.cascada_ppto?.PPTO_BDI || 0;
  
  // Calcular atingimentos (%)
  const mobAtingimento = mobPPTO !== 0 ? (mobSimulado / mobPPTO) * 100 : 0;
  const pddAtingimento = pddPPTO !== 0 ? (pddSimulado / pddPPTO) * 100 : 0;
  const molAtingimento = molPPTO !== 0 ? (molSimulado / molPPTO) * 100 : 0;
  const baiAtingimento = baiPPTO !== 0 ? (baiSimulado / baiPPTO) * 100 : 0;
  const impostosAtingimento = impostosPPTO !== 0 ? (impostosSimulado / impostosPPTO) * 100 : 0;
  const bdiAtingimento = bdiPPTO !== 0 ? (bdiSimulado / bdiPPTO) * 100 : 0;
  
  // Atualizar os valores no objeto plData
  plData.MOB.simulado = Math.round(mobSimulado);
  plData.MOB.atingimentoSimulado = mobAtingimento;
  
  plData.PDD.simulado = Math.round(pddSimulado);
  plData.PDD.atingimentoSimulado = pddAtingimento;
  
  plData.MOL.simulado = Math.round(molSimulado);
  plData.MOL.atingimentoSimulado = molAtingimento;
  
  plData.ORYP.simulado = Math.round(orypReal);
  plData["Demais Ativos"].simulado = Math.round(demaisAtivosReal);
  plData["Total Gastos"].simulado = Math.round(totalGastosReal);
  
  plData.BAI.simulado = Math.round(baiSimulado);
  plData.BAI.atingimentoSimulado = baiAtingimento;
  
  plData.Impostos.simulado = Math.round(impostosSimulado);
  plData.Impostos.atingimentoSimulado = impostosAtingimento;
  
  plData.BDI.simulado = Math.round(bdiSimulado);
  plData.BDI.atingimentoSimulado = bdiAtingimento;
  
  // Atualizar indicadores
  indicadoresData.RWA.simulado = Math.round(rwaSimulado);
  indicadoresData.RORWA.simulado = parseFloat(rorwaSimulado.toFixed(2));
  indicadoresData["Taxa Impositiva"].simulado = parseFloat(taxaImpositivaSimulada.toFixed(1));
  indicadoresData["Eficiência"].simulado = parseFloat(eficienciaSimulada.toFixed(1));
  
  // Atualizar ORYP, Demais Ativos e Total Gastos atingimentos
  const orypPPTO = appState.data?.[segment]?.cascada_ppto?.PPTO_Oryp || 
                  appState.data?.Total?.cascada_ppto?.PPTO_Oryp || 0;
  const demaisAtivosPPTO = appState.data?.[segment]?.cascada_ppto?.["PPTO_Demais Ativos"] || 
                          appState.data?.Total?.cascada_ppto?.["PPTO_Demais Ativos"] || 0;
  const totalGastosPPTO = appState.data?.[segment]?.cascada_ppto?.["PPTO_Total Gastos"] || 
                         appState.data?.Total?.cascada_ppto?.["PPTO_Total Gastos"] || 0;
  
  const orypAtingimento = orypPPTO !== 0 ? (orypReal / orypPPTO) * 100 : 0;
  const demaisAtivosAtingimento = demaisAtivosPPTO !== 0 ? (demaisAtivosReal / demaisAtivosPPTO) * 100 : 0;
  const totalGastosAtingimento = totalGastosPPTO !== 0 ? (totalGastosReal / totalGastosPPTO) * 100 : 0;
  
  plData.ORYP.atingimentoSimulado = orypAtingimento;
  plData["Demais Ativos"].atingimentoSimulado = demaisAtivosAtingimento;
  plData["Total Gastos"].atingimentoSimulado = totalGastosAtingimento;
  
  // Atualizar a interface (chamar diretamente as funções de UI)
  try {
    const modoVisualizacao = document.getElementById('btn-view-total').classList.contains('active') ? 
      'total' : segment;
    
    loadPLData(modoVisualizacao);
    loadIndicadoresData(modoVisualizacao);
    
    console.log(`Cascada calculado e interface atualizada para ${modoVisualizacao}`);
  } catch (error) {
    console.error("Erro ao atualizar interface:", error);
  }
  
  // Log para depuração
  console.log("Cálculos baseados em valores base:", {
    valoresBase: valoresBase,
    diferencas: {
      PDD: diferencaPDD,
      MOB: diferencaMargem,
      RWA: diferencaRWA
    },
    resultados: {
      PDD: pddSimulado,
      MOB: mobSimulado,
      MOL: molSimulado
    }
  });
  
  return {
    MOB: mobSimulado,
    PDD: pddSimulado,
    MOL: molSimulado,
    BAI: baiSimulado,
    Impostos: impostosSimulado,
    BDI: bdiSimulado,
    RWA: rwaSimulado,
    RORWA: rorwaSimulado
  };
}


// Consolida os valores simulados de todos os segmentos no Total
export function consolidarValoresTotal() {
  console.log("Consolidando valores para o Total...");
  
  // Inicializar acumuladores para somar valores simulados de todos os segmentos
  let mobTotal = 0;
  let pddTotal = 0;
  let molTotal = 0;
  // let orypTotal = 0;
  // let demaisAtivosTotal = 0;
  // let totalGastosTotal = 0;
  let baiTotal = 0;
  let impostosTotal = 0;
  let bdiTotal = 0;
  let rwaTotal = 0;
  
  // Acumular valores SIMULADOS de cada segmento
  segments.forEach(segmento => {
    if (!appState.segmentPLData[segmento]) return;
    
    // Acumular valores com verificação de segurança
    mobTotal += appState.segmentPLData[segmento].MOB?.simulado || 0;
    pddTotal += appState.segmentPLData[segmento].PDD?.simulado || 0;
    rwaTotal += appState.segmentIndicadores[segmento].RWA.simulado || 0;
    
  });
  
  // Atualizar valores consolidados com arredondamento
  appState.plDataTotal.MOB.simulado = Math.round(mobTotal);
  appState.plDataTotal.PDD.simulado = Math.round(pddTotal);
  appState.indicadoresTotal.RWA.simulado = Math.round(rwaTotal);
  // appState.plDataTotal.MOL.simulado = Math.round(molTotal);
  // appState.plDataTotal.ORYP.simulado = Math.round(orypTotal);
  // appState.plDataTotal["Demais Ativos"].simulado = Math.round(demaisAtivosTotal);
  // appState.plDataTotal["Total Gastos"].simulado = Math.round(totalGastosTotal);
  // appState.plDataTotal.BAI.simulado = Math.round(baiTotal);
  // appState.plDataTotal.Impostos.simulado = Math.round(impostosTotal);
  // appState.plDataTotal.BDI.simulado = Math.round(bdiTotal);
  
  // Atualizar indicadores
  // if (appState.indicadoresTotal) {
  //   appState.indicadoresTotal.RWA.simulado = Math.round(rwaTotal);
    
  // Cascada Total
  const cascadaPPTO = appState.data?.Total?.cascada_ppto;
  const cascadaReal = appState.data?.Total?.cascada;

  appState.plDataTotal.MOB.simulado = mobTotal;
  appState.plDataTotal.PDD.simulado = pddTotal;
  appState.plDataTotal.MOL.simulado = mobTotal - pddTotal;

  appState.plDataTotal.ORYP.simulado = cascadaReal.Oryp;
  appState.plDataTotal["Demais Ativos"].simulado = cascadaReal["Demais Ativos"];
  appState.plDataTotal["Total Gastos"].simulado = cascadaReal["Total Gastos"];

  appState.plDataTotal.Impostos.simulado = 


  appState.plDataTotal.BAI.simulado = appState.plDataTotal.MOL.simulado + appState.plDataTotal.ORYP.simulado + appState.plDataTotal["Demais Ativos"].simulado + appState.plDataTotal["Total Gastos"].simulado;

  // Indicadores

  appState.plDataTotal.RWA.simulado = rwaTotal;

  // Calcular RORWA
  if (rwaTotal > 0) {
    appState.indicadoresTotal.RORWA.simulado = (bdiTotal / rwaTotal) * 100;
  }
  
  // Taxa Impositiva e Eficiência
  if (baiTotal > 0) {
    appState.indicadoresTotal["Taxa Impositiva"].simulado = 
      (impostosTotal / baiTotal) * 100;
  }
  
  if (mobTotal > 0) {
    appState.indicadoresTotal["Eficiência"].simulado = 
      (appState.plDataTotal["Total Gastos"].simulado / mobTotal) * 100;
  }


  
  
  // Calcular % PPTO para o Total
  if (cascadaPPTO) {
    const cascadaReal = appState.data?.Total?.cascada;
    if (cascadaReal) {

      
      // Recalcular BAI e BDI para manter consistência

        
      appState.plDataTotal.BDI.simulado = 
        appState.plDataTotal.BAI.simulado + 
        appState.plDataTotal.Impostos.simulado;

    if (cascadaPPTO.PPTO_MOB) 
      appState.plDataTotal.MOB.atingimentoSimulado = (appState.plDataTotal.MOB.simulado / cascadaPPTO.PPTO_MOB) * 100;
    
    if (cascadaPPTO.PPTO_PDD) 
      appState.plDataTotal.PDD.atingimentoSimulado = (appState.plDataTotal.PDD.simulado / cascadaPPTO.PPTO_PDD) * 100;
    
    if (cascadaPPTO.PPTO_MOL) 
      appState.plDataTotal.MOL.atingimentoSimulado = (appState.plDataTotal.MOL.simulado / cascadaPPTO.PPTO_MOL) * 100;
    
    if (cascadaPPTO.PPTO_BAI) 
      appState.plDataTotal.BAI.atingimentoSimulado = (appState.plDataTotal.BAI.simulado / cascadaPPTO.PPTO_BAI) * 100;
    
    if (cascadaPPTO.PPTO_Impostos) 
      appState.plDataTotal.Impostos.atingimentoSimulado = (appState.plDataTotal.Impostos.simulado / cascadaPPTO.PPTO_Impostos) * 100;
    
    if (cascadaPPTO.PPTO_BDI) 
      appState.plDataTotal.BDI.atingimentoSimulado = (appState.plDataTotal.BDI.simulado / cascadaPPTO.PPTO_BDI) * 100;

    if (cascadaPPTO.PPTO_BAI) 
      appState.plDataTotal.BAI.atingimentoSimulado = (appState.plDataTotal.BAI.simulado / cascadaPPTO.PPTO_BAI) * 100;
    
    if (cascadaPPTO.PPTO_BDI) 
      appState.plDataTotal.BDI.atingimentoSimulado = (appState.plDataTotal.BDI.simulado / cascadaPPTO.PPTO_BDI) * 100;
    }
  }
  
  console.log("Valores do Total consolidados com sucesso", {
    PDD: appState.plDataTotal.PDD.simulado,
    MOB: appState.plDataTotal.MOB.simulado
  });
  
  // Atualizar a interface se estiver na visualização Total
  const btnViewTotal = document.getElementById('btn-view-total');
  if (btnViewTotal && btnViewTotal.classList.contains('active')) {
    loadPLData('total');
    loadIndicadoresData('total');
  }
}

// Função simplificada para atualizar a interface do Cascada Total
export function atualizarInterfaceCascadaTotal() {
  const btnViewTotal = document.getElementById('btn-view-total');
  if (btnViewTotal && btnViewTotal.classList.contains('active')) {
    loadPLData('total');
    loadIndicadoresData('total');
  }
}