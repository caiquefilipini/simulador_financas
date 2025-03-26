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


export function calculosCascada(mob, pdd, rwa, segmento) {
  // Criando variáveis para armazenar os valores
  let oryp = 0;
  let demaisAtivos = 0;
  let totalGastos = 0;
  let impostosAtual = 0;

  let plData = (segmento === 'total') ? appState.plDataTotal : appState.segmentPLData[segmento];
  let pptoData = (segmento === 'total') ? appState.data.Total.cascada_ppto : appState.data[segmento].cascada_ppto;
  let indicadoresData = (segmento === 'total') ? appState.indicadoresTotal : appState.segmentIndicadores[segmento];

  if (segmento === 'total') {
    oryp = plData.ORYP.real;
    demaisAtivos = appState.plDataTotal["Demais Ativos"].real;
    totalGastos = appState.plDataTotal["Total Gastos"].real;
    impostosAtual = appState.plDataTotal.Impostos.real;
  }
  else {
    oryp = appState.segmentPLData[segmento].ORYP.real;
    demaisAtivos = appState.segmentPLData[segmento]["Demais Ativos"].real;
    totalGastos = appState.segmentPLData[segmento]["Total Gastos"].real;
    impostosAtual = appState.segmentPLData[segmento].Impostos.real;
  }

  // Cálculo de valores
  const mol = mob + pdd;
  const bai = mol + oryp + demaisAtivos + totalGastos;
  const pisDif = -dif_mob * 0.0465;
  const irDif = -(bai + pisDif) * 0.3;
  const impostos = impostosAtual + irDif + pisDif;
  const bdi = bai + impostos;
  
  // Cálculo de indicadores
  const taxaImpositivaSimulada = bai !== 0 ? Math.abs((impostos / bai) * 100) : 0;
  const eficienciaSimulada = mob !== 0 ? Math.abs((totalGastos / mob) * 100) : 0;
  const rorwaSimulado = rwa !== 0 ? (bdi / rwa) * 100 : 0;
  
  // Calcular atingimentos (%)
  plData.MOB.atingimentoSimulado = pptpptoDatao.PPTO_MOB !== 0 ? (mob / pptoData.PPTO_MOB) * 100 : 0;
  plData.PDD.atingimentoSimulado = pptoData.PPTO_PDD !== 0 ? (pdd / pptoData.PPTO_PDD) * 100 : 0;
  plData.MOL.atingimentoSimulado = pptoData.PPTO_MOL !== 0 ? (mol / pptoData.PPTO_MOL) * 100 : 0;
  plData.BAI.atingimentoSimulado = pptoData.PPTO_BAI !== 0 ? (bai / pptoData.PPTO_BAI) * 100 : 0;
  plData.Impostos.atingimentoSimulado = pptoData.PPTO_Impostos !== 0 ? (impostos / pptoData.PPTO_Impostos) * 100 : 0;
  plData.BDI.atingimentoSimulado = pptoData.PPTO_BDI !== 0 ? (bdi / pptoData.PPTO_BDI) * 100 : 0;
  
  // Atualizar indicadores
  indicadoresData.RWA.simulado = Math.round(rwa);
  indicadoresData.RORWA.simulado = parseFloat(rorwaSimulado.toFixed(2));
  indicadoresData["Taxa Impositiva"].simulado = parseFloat(taxaImpositivaSimulada.toFixed(1));
  indicadoresData["Eficiência"].simulado = parseFloat(eficienciaSimulada.toFixed(1));
}



// Função para calcular a cascada simulada
export function calcularCascadaSimulado(segmento) {

  let ajustes = (segmento === 'total') ? appState.ajustes.total : appState.ajustes.segmentos[segmento];
  let plData = (segmento === 'total') ? appState.plDataTotal : appState.segmentPLData[segmento];
  let indicadoresData = (segmento === 'total') ? appState.indicadoresTotal : appState.segmentIndicadores[segmento];

  const rwaReal = indicadoresData.RWA.real || 0;
  const mobReal = plData.MOB.real || 0;
  const pddReal = plData.PDD.real || 0;

  // Obter valores de ajuste
  const diferencaMargem = ajustes.margem || 0;
  const diferencaPDD = ajustes.pdd || 0;
  const diferencaRWA = ajustes.rwa || 0;

  // Calcular valores simulados
  const mobSimulado = mobReal + diferencaMargem;
  const pddSimulado = pddReal + diferencaPDD;
  const rwaSimulado = rwaReal + diferencaRWA;

  calculosCascada(mobSimulado, pddSimulado, rwaSimulado, segmento);

  const modoVisualizacao = document.getElementById('btn-view-total').classList.contains('active') ? 'total' : segmento;
  
  loadPLData(modoVisualizacao);
  loadIndicadoresData(modoVisualizacao);
  
  return {
    MOB: mobSimulado,
    PDD: pddSimulado,
    MOL: molSimulado,
    ORYP: orypReal,
    "Demais Ativos": demaisAtivosReal,
    "Total Gastos": totalGastosReal,
    BAI: baiSimulado,
    Impostos: impostosSimulado,
    BDI: bdiSimulado,
    "Taxa Impositiva": taxaImpositivaSimulada,
    "Eficiência": eficienciaSimulada,
    RWA: rwaSimulado,
    RORWA: rorwaSimulado
  };
}

// Função simplificada para atualizar a interface do Cascada Total
export function atualizarInterfaceCascadaTotal() {
  const btnViewTotal = document.getElementById('btn-view-total');
  if (btnViewTotal && btnViewTotal.classList.contains('active')) {
    loadPLData('total');
    loadIndicadoresData('total');
  }
}