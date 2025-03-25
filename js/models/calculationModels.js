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


export function calculosCascada( mob, pdd, rwa, segmento) {

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
export function calcularCascadaSimulado(segment) {

  // console.log(`Calculando cascada simulado para segmento: ${segment}`);

  // Obter referências aos dados
  let ajustes = appState.ajustes?.[segment] || {};
  
  // Obter valores base e reais diretamente
  // const valoresBase = (segment === 'total') ? 
  //   appState.valoresBase.total : appState.valoresBase.segmentos[segment];
  
  // const valoresReais = (segment === 'total') ? 
  //   appState.valoresReais.total : appState.valoresReais.segmentos[segment];

  // console.log(`Calculando cascada simulado para segmento: ${segment}`);

  // Obter referências aos dados
  // let plData = (segment === 'total') ? appState.plDataTotal : appState.segmentPLData[segment];
  // let indicadoresData = (segment === 'total') ? appState.indicadoresTotal : appState.segmentIndicadores[segment];
  
  // Inicializar somas
  // let somaPDDSimuladas = 0;
  // let somaMargensSimuladasCredito = 0;
  // let somaMargensSimuladasCaptacoes = 0;
  // let somaComissoesSimuladas = 0;
  // let somaRWASimulados = 0;
  
  // Obter segmentos a considerar
  // const segmentosParaCalcular = segment === 'total' ? 
  //   segments : [segment];
  
  // // Iterar sobre os segmentos relevantes
  // segmentosParaCalcular.forEach(segmento => {
  //   // Atualizar valores base
  //   // mobBase += appState.valoresBase.segmentos[segmento].mobBase || 0;
  //   // pddBase += appState.valoresBase.segmentos[segmento].pddBase || 0;
  //   // rwaBase += appState.valoresBase.segmentos[segmento].rwaBase || 0;
      
  //   // CRÉDITO: somar valores de todos os tipos
  //   const tiposCredito = Object.keys(appState.dadosPlanilha.credito[segmento] || {});
  //   tiposCredito.forEach(tipo => {
  //     // Obter dados reais e ajustes
  //     const data = appState.dadosPlanilha.credito[segmento][tipo] || {};
  //     const ajustes = appState.ajustes?.[segmento]?.credito || {};
      
  //     // Valores reais
  //     const margemReal = data.margem || 0;
  //     const provisaoReal = data.provisao || 0;
  //     const rwaReal = data.rwa || 0;

  //     // Valores simulados
  //     const provisaoSimulada = ajustes[`${tipo}_provisaoSimulada`] !== undefined ? 
  //       parseFloat(ajustes[`${tipo}_provisaoSimulada`]) : provisaoReal;

  //     const margemSimulada = ajustes[`${tipo}_margemSimulada`] !== undefined ?
  //       parseFloat(ajustes[`${tipo}_margemSimulada`]) : margemReal;

  //     const rwaSimulado = ajustes[`${tipo}_rwaSimulado`] !== undefined ?
  //       parseFloat(ajustes[`${tipo}_rwaSimulado`]) : rwaReal;
      
  //     // Acumular somas
  //     somaPDDSimuladas += provisaoSimulada;
  //     somaMargensSimuladasCredito += margemSimulada;
  //     somaRWASimulados += rwaSimulado;
  //   });
    
  //   // CAPTAÇÕES: somar valores de todos os tipos
  //   const tiposCaptacao = Object.keys(appState.dadosPlanilha.captacoes[segmento] || {});
  //   tiposCaptacao.forEach(tipo => {
  //     const data = appState.dadosPlanilha.captacoes[segmento][tipo] || {};
  //     const ajustes = appState.ajustes?.[segmento]?.captacoes || {};
  //     const margemReal = data.margem || 0;
  //     const margemSimulada = ajustes[`${tipo}_margemSimulada`] !== undefined ?
  //       parseFloat(ajustes[`${tipo}_margemSimulada`]) : margemReal;
      
  //     // Acumular somas
  //     somaMargensCaptacoes += margemReal;
  //     somaMargensSimuladasCaptacoes += margemSimulada;
  //   });
    
  //   // COMISSÕES: somar valores de todos os tipos
  //   const tiposComissao = Object.keys(appState.dadosPlanilha.comissoes[segmento] || {});
  //   tiposComissao.forEach(tipo => {
  //     const data = appState.dadosPlanilha.comissoes[segmento][tipo] || {};
  //     const ajustes = appState.ajustes?.[segmento]?.comissoes || {};
      
  //     // Valores reais e simulados
  //     const valorReal = data.valor || 0;
  //     const valorSimulado = ajustes[`${tipo}_valorSimulado`] !== undefined ? 
  //       parseFloat(ajustes[`${tipo}_valorSimulado`]) : valorReal;
      
  //     // Acumular somas
  //     somaComissoes += valorReal;
  //     somaComissoesSimuladas += valorSimulado;
  //   });
  // });


  // mobBase = appState.valoresBase.total.mobBase || 0;
  // pddBase = appState.valoresBase.total.pddBase || 0;
  // rwaBase = appState.valoresBase.total.rwaBase || 0;

  // Calcular diferenças
  // const diferencaRWA = somaRWASimulados - rwaBase;
  // const diferencaPDD = somaPDDSimuladas - pddBase;
  // const somaMargensSimuladas = somaMargensSimuladasCredito + somaMargensSimuladasCaptacoes + somaComissoesSimuladas;
  // const diferencaMOB = somaMargensSimuladas - mobBase;
  
  // Resgatando as diferenças calculadas nos ajustes
  // ...

  // Calcular valores simulados
  const rwaReal = indicadoresData.RWA.real || 0;
  const rwaSimulado = rwaReal + diferencaRWA;
  
  const pddReal = plData.PDD.real || 0;
  const pddSimulado = pddReal + diferencaPDD;
  
  const mobReal = plData.MOB.real || 0;
  const mobSimulado = mobReal + diferencaMOB;
  
  // Como ORYP, Demais Ativos e Total Gastos não são ajustados, a diferença no MOL será igual à soma da diferença do MOB e PDD
  const molReal = plData.MOL.real || 0;
  const molSimulado = molReal + diferencaMOB + diferencaPDD;

  // console.log(`MOB real: ${mobReal}, MOB simulado: ${mobSimulado}, Diferença: ${diferencaMOB}`);
  // console.log(appState.ajustes);
  
  // Supondo que PDD é negativo, logo molSimulado = mobSimulado + pddSimulado (onde pddSimulado é negativo)
  // Verificar se essa lógica está correta no contexto do sistema

  
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

// function verificarSeExistemAjustes() {
//   // Se não existe o objeto ajustes, não há ajustes
//   if (!appState.ajustes) return false;
  
//   // Percorrer todos os segmentos
//   for (const segmento in appState.ajustes) {
//     const segObj = appState.ajustes[segmento];
    
//     // Percorrer as três categorias (credito, captacoes, comissoes)
//     for (const categoria in segObj) {
//       const catObj = segObj[categoria];
      
//       // Se esta categoria tiver pelo menos um ajuste, há ajustes ativos
//       if (Object.keys(catObj).length > 0) {
//         console.log(`Ajuste encontrado em ${segmento}.${categoria}:`, catObj);
//         return true;
//       }
//     }
//   }
  
//   // Se percorreu tudo e não encontrou nenhum ajuste, não há ajustes ativos
//   return false;
// }

// Consolida os valores simulados de todos os segmentos no Total
export function consolidarValoresTotal() {
  console.log("Consolidando valores para o Total...");

  // Verificar se existem ajustes ativos
  const temAjustes = appState.temAjusteCredito || appState.temAjusteCaptacoes || appState.temAjusteComissoes;
  // console.log("Existem ajustes ativos:", temAjustes);
  // console.log("appState.ajustes:", appState.ajustes); 
  
  // Obter o cascada original do Total
  const cascadaOriginalTotal = appState.data?.Total?.cascada;
  
  // if (!cascadaOriginalTotal) {
  //   console.error("Dados de cascada originais não encontrados para Total");
  //   return;
  // }

  // Nem precisa dessa parte... se o cálculo funciona quando há ajustes, deve funcionar sem eles
  
  if (!temAjustes) {
    // Usar valores originais
    appState.plDataTotal.MOB.simulado = cascadaOriginalTotal.MOB;
    appState.plDataTotal.PDD.simulado = cascadaOriginalTotal.PDD;
    appState.plDataTotal.MOL.simulado = cascadaOriginalTotal.MOL;
    appState.plDataTotal.ORYP.simulado = cascadaOriginalTotal.Oryp;
    appState.plDataTotal["Demais Ativos"].simulado = cascadaOriginalTotal["Demais Ativos"];
    appState.plDataTotal["Total Gastos"].simulado = cascadaOriginalTotal["Total Gastos"];
    appState.plDataTotal.BAI.simulado = cascadaOriginalTotal.BAI;
    appState.plDataTotal.Impostos.simulado = cascadaOriginalTotal.Impostos;
    appState.plDataTotal.BDI.simulado = cascadaOriginalTotal.BDI;
    
    // Atribuir indicadores
    if (appState.indicadoresTotal) {
      appState.indicadoresTotal.RWA.simulado = cascadaOriginalTotal.RWA;
      appState.indicadoresTotal.RORWA.simulado = cascadaOriginalTotal.RORWA;
      
      // Taxa Impositiva e Eficiência
      const baiValue = cascadaOriginalTotal.BAI || 0;
      const impostos = cascadaOriginalTotal.Impostos || 0;
      const mobValue = cascadaOriginalTotal.MOB || 0;
      const totalGastos = cascadaOriginalTotal["Total Gastos"] || 0;
      
      appState.indicadoresTotal["Taxa Impositiva"].simulado = 
        baiValue !== 0 ? (impostos / baiValue) * 100 : 0;
      
      appState.indicadoresTotal["Eficiência"].simulado = 
        mobValue !== 0 ? (totalGastos / mobValue) * 100 : 0;
    }
  } else {
    // console.log("Ajustes detectados, calculando valores consolidados para o Total");
    
    // Inicializar acumuladores
    let mobTotal = 0;
    let pddTotal = 0;
    let molTotal = 0;
    let orypTotal = 0;
    let demaisAtivosTotal = 0;
    let totalGastosTotal = 0;
    let baiTotal = 0;
    let pisTotal = 0;
    let irTotal = 0;
    let impostosTotal = 0;
    let bdiTotal = 0;
    let rwaTotal = 0;
    
    // Acumular valores SIMULADOS de cada segmento
    segments.forEach(segmento => {
      if (!appState.segmentPLData[segmento]) return;
      
      // Acumular valores com verificação de segurança
      mobTotal += appState.segmentPLData[segmento].MOB?.simulado || 0;
      pddTotal += appState.segmentPLData[segmento].PDD?.simulado || 0;
      // molTotal += appState.segmentPLData[segmento].MOL?.simulado || 0;
      // orypTotal += appState.segmentPLData[segmento].ORYP?.simulado || 0;
      // demaisAtivosTotal += appState.segmentPLData[segmento]["Demais Ativos"]?.simulado || 0;
      // totalGastosTotal += appState.segmentPLData[segmento]["Total Gastos"]?.simulado || 0;
      // baiTotal += appState.segmentPLData[segmento].BAI?.simulado || 0;
      // impostosTotal += appState.segmentPLData[segmento].Impostos?.simulado || 0;
      // bdiTotal += appState.segmentPLData[segmento].BDI?.simulado || 0;
      rwaTotal += appState.segmentIndicadores[segmento]?.RWA?.simulado || 0;

    });

    molTotal = mobTotal + pddTotal;
    orypTotal = cascadaOriginalTotal["ORYP"] || 0;
    demaisAtivosTotal = cascadaOriginalTotal["Demais Ativos"] || 0;
    totalGastosTotal = cascadaOriginalTotal["Total Gastos"] || 0;
    baiTotal = molTotal + orypTotal + demaisAtivosTotal + totalGastosTotal;
    pisTotal = -mobTotal * 0.0465;
    irTotal = -(baiTotal + pisTotal) * 0.3;    
    impostosTotal = pisTotal + irTotal;
    bdiTotal = baiTotal + impostosTotal;
    
    // Atualizar valores consolidados com arredondamento
    appState.plDataTotal.MOB.simulado = Math.round(mobTotal);
    appState.plDataTotal.PDD.simulado = Math.round(pddTotal);
    appState.plDataTotal.MOL.simulado = Math.round(molTotal);
    appState.plDataTotal.ORYP.simulado = Math.round(orypTotal);
    appState.plDataTotal["Demais Ativos"].simulado = Math.round(demaisAtivosTotal);
    appState.plDataTotal["Total Gastos"].simulado = Math.round(totalGastosTotal);
    appState.plDataTotal.BAI.simulado = Math.round(baiTotal);
    appState.plDataTotal.Impostos.simulado = Math.round(impostosTotal);
    appState.plDataTotal.BDI.simulado = Math.round(bdiTotal);
    
    // Atualizar indicadores
    if (appState.indicadoresTotal) {
      appState.indicadoresTotal.RWA.simulado = Math.round(rwaTotal);
      
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
          (totalGastosTotal / mobTotal) * 100;
      }
    }
  }
  
  // Calcular % PPTO (mesmo para ambos os casos)
  const cascadaPPTO = appState.data?.Total?.cascada_ppto;
  if (cascadaPPTO) {
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

    // ORYP, Demais Ativos e Total Gastos são iguais aos valores reais
    appState.plDataTotal.ORYP.atingimentoSimulado = appState.plDataTotal.ORYP.atingimentoReal;
    appState.plDataTotal["Demais Ativos"].atingimentoSimulado = appState.plDataTotal["Demais Ativos"].atingimentoReal;
    appState.plDataTotal["Total Gastos"].atingimentoSimulado = appState.plDataTotal["Total Gastos"].atingimentoReal;
  }
  
  // console.log("Valores do Total atualizados com sucesso");
  
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