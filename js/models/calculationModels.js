// calculationModels.js - Contém as funções de cálculo utilizadas na aplicação
import { appState } from './dataModels.js';

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

// Calcula spread baseado em Margem/Carteira para itens como "Demais"
export function calcularSpreadBaseadoEmMargem(segment, tipo) {
  const data = appState.dadosPlanilha.credito[segment]?.[tipo] || {
    carteira: 0,
    margem: 0
  };
  
  // Se a carteira for zero, evita divisão por zero
  if (data.carteira === 0 || data.carteira === null || data.carteira === undefined) {
    return 0;
  }
  
  // Calcula o spread como Margem/Carteira * 100 (para ser apresentado como percentual)
  return ((data.margem / data.carteira) * 100).toFixed(2);
}

// Função similar para captações
export function calcularSpreadCaptacoesBaseadoEmMargem(segment, tipo) {
  const data = appState.dadosPlanilha.captacoes[segment]?.[tipo] || {
    carteira: 0,
    margem: 0
  };
  
  if (data.carteira === 0 || data.carteira === null || data.carteira === undefined) {
    return 0;
  }
  
  return ((data.margem / data.carteira) * 100).toFixed(2);
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

// Calcula o cascada simulado com base nos ajustes feitos
let calculandoCascada = false;

// Modifique a função calcularCascadaSimulado no arquivo calculationModels.js
// Substitua a função existente por esta versão corrigida

// Esta é uma versão simplificada e robusta da função calcularCascadaSimulado
// Substitua completamente a função existente por esta

// Substitua a função calcularCascadaSimulado no arquivo calculationModels.js

// Função simplificada seguindo exatamente a lógica explicada
// Versão corrigida da função com foco especial no PDD

export function calcularCascadaSimulado(segment) {
  console.log(`Calculando cascada simulado para ${segment}...`);
  
  try {
    // PARTE 1: Verificações iniciais
    if (!appState.data || !appState.data[segment]) {
      console.error(`Dados não disponíveis para segmento ${segment}`);
      return null;
    }
    
    // Obter referências aos dados
    let plData = (segment === 'total') ? appState.plDataTotal : appState.segmentPLData[segment];
    let indicadoresData = (segment === 'total') ? appState.indicadoresTotal : appState.segmentIndicadores[segment];
    
    
    if (!plData || !indicadoresData) {
      console.error(`Dados de P&L não encontrados para segmento ${segment}`);
      return null;
    }
    
    // PARTE 2: Calcular as diferenças de margem e PDD
    // Para debug detalhado do PDD
    console.log("====== CÁLCULO DETALHADO DO PDD ======");
    
    let somaPDDReais = 0;
    let somaPDDSimuladas = 0;
    let somaMargensCredito = 0;
    let somaMargensSimuladasCredito = 0;
    
    // Obter segmentos a considerar
    const segmentosParaCalcular = segment === 'total' ? 
      Object.keys(appState.segmentPLData) : [segment];
    
    console.log(`Segmentos considerados para cálculo: ${segmentosParaCalcular.join(', ')}`);
    
    // Iterar sobre os segmentos relevantes
    segmentosParaCalcular.forEach(segmento => {
      // Verificar se temos dados de crédito para este segmento
      if (!appState.dadosPlanilha.credito[segmento]) {
        console.log(`Sem dados de crédito para segmento ${segmento}`);
        return;
      }
      
      console.log(`\nAnalisando segmento: ${segmento}`);
      
      // Obter todos os tipos de crédito para este segmento
      const tiposCredito = Object.keys(appState.dadosPlanilha.credito[segmento]);
      
      tiposCredito.forEach(tipo => {
        const data = appState.dadosPlanilha.credito[segmento][tipo] || {};
        const ajustes = appState.ajustes?.[segmento]?.credito || {};
        
        // PDD valores
        const provisaoReal = data.provisao || 0;
        const provisaoSimulada = ajustes[`${tipo}_provisaoSimulada`] !== undefined ? 
          ajustes[`${tipo}_provisaoSimulada`] : provisaoReal;
        
        somaPDDReais += provisaoReal;
        somaPDDSimuladas += provisaoSimulada;
        
        // Para cálculo de margens também
        const carteiraReal = data.carteira || 0;
        const spreadReal = data.spread || 0;
        const margemReal = data.margem || 0;
        
        somaMargensCredito += margemReal;
        
        const carteiraSimulada = ajustes[`${tipo}_carteiraSimulada`] !== undefined ? 
          ajustes[`${tipo}_carteiraSimulada`] : carteiraReal;
        const spreadSimulado = ajustes[`${tipo}_spreadSimulado`] !== undefined ? 
          ajustes[`${tipo}_spreadSimulado`] : spreadReal;
        
        const margemSimulada = calcularMargemSimulada(carteiraSimulada, spreadSimulado);
        somaMargensSimuladasCredito += margemSimulada;
        
        console.log(`- ${tipo}: PDD Real: ${provisaoReal}, PDD Simulado: ${provisaoSimulada}, Diferença: ${provisaoSimulada - provisaoReal}`);
      });
    });
    
    console.log("\nResumo dos cálculos de PDD:");
    console.log(`PDD Reais Total: ${somaPDDReais}`);
    console.log(`PDD Simulados Total: ${somaPDDSimuladas}`);
    console.log(`Diferença Total de PDD: ${somaPDDSimuladas - somaPDDReais}`);
    console.log("=========================================");
    
    // PARTE 3: Calcular os valores simulados do cascada
    // Obter valores reais do cascada
    const cascadaOriginal = appState.data[segment].cascada;
    
    // Calcular diferença entre PDD real e simulado
    const diferencaPDD = somaPDDSimuladas - somaPDDReais;
    
    // Valores para o cascada
    const pddReal = plData.PDD.real;
    const pddSimulado = pddReal + diferencaPDD;
    
    console.log(`PDD real no cascada: ${pddReal}`);
    console.log(`PDD simulado calculado: ${pddSimulado}`);
    
    // Diferença de margens (simplificado)
    const diferencaMargens = somaMargensSimuladasCredito - somaMargensCredito;
    
    // MOB simulado
    const mobReal = plData.MOB.real;
    const mobSimulado = mobReal + diferencaMargens;
    
    // MOL simulado
    const molSimulado = mobSimulado - pddSimulado;
    
    // Valores fixos
    const orypReal = plData.ORYP.real;
    const demaisAtivosReal = plData["Demais Ativos"].real;
    const totalGastosReal = plData["Total Gastos"].real;
    
    // BAI simulado
    const baiSimulado = molSimulado - orypReal - demaisAtivosReal - totalGastosReal;
    
    // Impostos simulados
    const impostosSimulado = baiSimulado * 0.35; // Simplificado
    
    // BDI simulado
    const bdiSimulado = baiSimulado - impostosSimulado;
    
    // PARTE 4: Atualizar os valores no objeto plData
    plData.MOB.simulado = mobSimulado;
    plData.PDD.simulado = pddSimulado;
    plData.MOL.simulado = molSimulado;
    plData.BAI.simulado = baiSimulado;
    plData.Impostos.simulado = impostosSimulado;
    plData.BDI.simulado = bdiSimulado;
    
    // PARTE 5: Atualização manual da interface
    console.log("Valores calculados, atualizando a interface:");
    console.log({
      MOB: mobSimulado,
      PDD: pddSimulado,
      MOL: molSimulado,
      BAI: baiSimulado,
      Impostos: impostosSimulado,
      BDI: bdiSimulado
    });
    
    // Atualizar a tabela do P&L
    atualizarTabelaPL(segment);
    
    return {
      MOB: mobSimulado,
      PDD: pddSimulado,
      MOL: molSimulado,
      BAI: baiSimulado,
      Impostos: impostosSimulado,
      BDI: bdiSimulado
    };
    
  } catch (error) {
    console.error("Erro ao calcular cascada simulado:", error);
    return null;
  }
}

// Função auxiliar para atualizar a tabela de P&L manualmente
function atualizarTabelaPL(segment) {
  try {
    const plBody = document.getElementById('pl-body');
    if (!plBody) {
      console.error("Elemento 'pl-body' não encontrado");
      return;
    }
    
    // Determinar modo de visualização
    const btnViewTotal = document.getElementById('btn-view-total');
    const modoVisualizacao = btnViewTotal && btnViewTotal.classList.contains('active') ? 
      'total' : segment;
    
    // Obter dados corretos
    const plData = modoVisualizacao === 'total' ? 
      appState.plDataTotal : appState.segmentPLData[modoVisualizacao];
    
    if (!plData) {
      console.error(`Dados de P&L não encontrados para ${modoVisualizacao}`);
      return;
    }
    
    // Limpar tabela
    plBody.innerHTML = '';
    
    // Adicionar linhas
    Object.entries(plData).forEach(([key, data]) => {
      const row = document.createElement('tr');
      
      if (key === 'MOL' || key === 'BAI' || key === 'BDI') {
        row.classList.add('highlight');
      }
      
      // Formato para exibir na tabela
      const formatoNumero = (valor) => {
        if (valor === undefined || valor === null) return "0";
        return valor.toLocaleString('pt-BR');
      };
      
      const formatoPorcentagem = (valor) => {
        if (valor === undefined || valor === null || valor === "-") return "-";
        return valor.toLocaleString('pt-BR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }) + '%';
      };
      
      row.innerHTML = `
        <td>${key}</td>
        <td>${formatoNumero(data.real)}</td>
        <td>${formatoNumero(data.simulado)}</td>
        <td>${formatoPorcentagem(data.atingimentoReal)}</td>
        <td>${formatoPorcentagem(data.atingimentoSimulado)}</td>
      `;
      
      plBody.appendChild(row);
    });
    
    console.log(`Tabela P&L atualizada para ${modoVisualizacao}`);
    
  } catch (error) {
    console.error("Erro ao atualizar tabela P&L:", error);
  }
}

// Função para atualizar diretamente a interface
function atualizarInterfaceManualmente(modo) {
  try {
    // Obter as tabelas
    const plBody = document.getElementById('pl-body');
    const indicadoresBody = document.getElementById('indicadores-body');
    
    if (!plBody || !indicadoresBody) {
      console.error("Elementos das tabelas não encontrados");
      return;
    }
    
    // Determinar quais dados usar
    const plData = modo === 'total' ? appState.plDataTotal : appState.segmentPLData[modo];
    const indicadoresData = modo === 'total' ? appState.indicadoresTotal : appState.segmentIndicadores[modo];
    
    if (!plData || !indicadoresData) {
      console.error(`Dados não encontrados para o modo ${modo}`);
      return;
    }
    
    // Atualizar tabela de P&L
    plBody.innerHTML = ''; // Limpar conteúdo atual
    
    // Adicionar linhas para cada item do P&L
    Object.entries(plData).forEach(([key, data]) => {
      const row = document.createElement('tr');
      
      if (key === 'MOL' || key === 'BAI' || key === 'BDI') {
        row.classList.add('highlight');
      }
      
      row.innerHTML = `
        <td>${key}</td>
        <td>${formatNumber(data.real)}</td>
        <td>${formatNumber(data.simulado)}</td>
        <td>${formatPercent(data.atingimentoReal)}</td>
        <td>${formatPercent(data.atingimentoSimulado)}</td>
      `;
      
      plBody.appendChild(row);
    });
    
    // Atualizar tabela de indicadores
    indicadoresBody.innerHTML = ''; // Limpar conteúdo atual
    
    // Definir ordem de exibição dos indicadores
    const ordemIndicadores = ['Taxa Impositiva', 'Eficiência', 'RWA', 'RORWA'];
    
    // Adicionar linhas para cada indicador
    ordemIndicadores.forEach(key => {
      if (indicadoresData[key]) {
        const row = document.createElement('tr');
        const data = indicadoresData[key];
        
        if (key === 'RWA') {
          row.innerHTML = `
            <td>${key}</td>
            <td>${formatNumber(data.real)}</td>
            <td>${formatNumber(data.simulado)}</td>
            <td>-</td>
            <td>-</td>
          `;
        } else {
          row.innerHTML = `
            <td>${key}</td>
            <td>${formatPercent(data.real, 1)}</td>
            <td>${formatPercent(data.simulado, 1)}</td>
            <td>-</td>
            <td>-</td>
          `;
        }
        
        indicadoresBody.appendChild(row);
      }
    });
    
    console.log("Interface atualizada manualmente com sucesso");
    
  } catch (error) {
    console.error("Erro ao atualizar interface manualmente:", error);
  }
}

// Funções auxiliares de formatação
function formatNumber(num) {
  if (num === undefined || num === null) return "0";
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function formatPercent(num, decimals = 1) {
  if (num === undefined || num === null || num === "-") return "-";
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }) + '%';
}

// function calcularSomas(segment) {
//   // Variáveis para armazenar as somas
//   let somaMargensCredito = 0;
//   let somaMargensSimuladasCredito = 0;
//   let somaMargensReaisCaptacao = 0;
//   let somaMargensSimuladasCaptacao = 0;
//   let somaComissoesReais = 0;
//   let somaComissoesSimuladas = 0;
//   let somaPDDReais = 0;
//   let somaPDDSimuladas = 0;
//   let somaRWAReais = 0;
//   let somaRWASimulados = 0;

//   // Obter lista de segmentos e tipos
//   const segmentos = Object.keys(appState.segmentPLData);
//   const { creditTypes, fundingTypes, commissionTypes } = appState;
  
//   // 1. Calcular somas para crédito
//   const tiposCredito = segment === 'total' 
//     ? Object.values(creditTypes).flat() 
//     : creditTypes[segment] || [];
  
//   if (segment === 'total') {
//     // Para total, somamos todos os segmentos
//     segmentos.forEach(segmento => {
//       tiposCredito.forEach(tipo => {
//         // Acesse diretamente os dados e os ajustes, como você faz em outras partes do código
//         const data = appState.dadosPlanilha.credito[segmento]?.[tipo];
//         const ajustes = appState.ajustes[segmento]?.credito;
        
//         if (data && ajustes) {
//           // Margens
//           somaMargensCredito += data.margem || 0;
          
//           // Valores ajustados
//           const carteiraSimulada = ajustes[`${tipo}_carteiraSimulada`] || data.carteira || 0;
//           const spreadSimulado = ajustes[`${tipo}_spreadSimulado`] || data.spread || 0;
//           const margemSimulada = calcularMargemSimulada(carteiraSimulada, spreadSimulado);
//           somaMargensSimuladasCredito += margemSimulada;
          
//           // Provisões
//           somaPDDReais += data.provisao || 0;
//           const provisaoSimulada = ajustes[`${tipo}_provisaoSimulada`] || data.provisao || 0;
//           somaPDDSimuladas += provisaoSimulada;
          
//           // RWA
//           somaRWAReais += data.rwa || 0;
//           const rwaSimulado = calcularRWASimulado(data.rwa, data.carteira, carteiraSimulada);
//           somaRWASimulados += rwaSimulado;
//         }
//       });
//     });
//   } else {
//       // Para um segmento específico
//       tiposCredito.forEach(tipo => {
//         const data = appState.dadosPlanilha.credito[segment]?.[tipo];
//         const ajustes = appState.ajustes[segment]?.credito;
        
//         if (data && ajustes) {

//           // Margens
//           somaMargensCredito += data.margem || 0;
          
//           // Valores ajustados
//           const carteiraSimulada = ajustes[`${tipo}_carteiraSimulada`] || data.carteira || 0;
//           const spreadSimulado = ajustes[`${tipo}_spreadSimulado`] || data.spread || 0;
//           const margemSimulada = calcularMargemSimulada(carteiraSimulada, spreadSimulado);
//           somaMargensSimuladasCredito += margemSimulada;
          
//           // Provisões
//           somaPDDReais += data.provisao || 0;
//           const provisaoSimulada = ajustes[`${tipo}_provisaoSimulada`] || data.provisao || 0;
//           somaPDDSimuladas += provisaoSimulada;
          
//           // RWA
//           somaRWAReais += data.rwa || 0;
//           const rwaSimulado = calcularRWASimulado(data.rwa, data.carteira, carteiraSimulada);
//           somaRWASimulados += rwaSimulado;
//         }
//       });
//     }
    
//     // 2. Calcular somas para captações
//     const tiposCaptacao = segment === 'total'
//       ? Object.values(fundingTypes).flat()
//       : fundingTypes[segment] || [];
    
//     if (segment === 'total') {
//       // Para total, somamos todos os segmentos
//       segmentos.forEach(seg => {
//         tiposCaptacao.forEach(tipo => {
//           const data = dadosPlanilha.captacoes[seg][tipo];
//           const ajustes = appState.ajustes[seg].captacoes;
        
//           if (data && ajustes) {
//             // Margens
//             somaMargensReaisCaptacao += data.margem || 0;
            
//             // Valores ajustados
//             const carteiraSimulada = ajustes[`${tipo}_carteiraSimulada`] || data.carteira || 0;
//             const spreadSimulado = ajustes[`${tipo}_spreadSimulado`] || data.spread || 0;
//             const margemSimulada = calcularMargemSimuladaCaptacoes(carteiraSimulada, spreadSimulado);
//             somaMargensSimuladasCaptacao += margemSimulada;
//           }
//         });
//       });
//     } else {
//       // Para um segmento específico
//       tiposCaptacao.forEach(tipo => {
//         const data = dadosPlanilha.captacoes[segment][tipo];
//         const ajustes = appState.ajustes[segment].captacoes;
      
//         if (data && ajustes) {
        
//           // Margens
//           somaMargensReaisCaptacao += data.margem || 0;
          
//           // Valores ajustados
//           const carteiraSimulada = ajustes[`${tipo}_carteiraSimulada`] || data.carteira || 0;
//           const spreadSimulado = ajustes[`${tipo}_spreadSimulado`] || data.spread || 0;
//           const margemSimulada = calcularMargemSimuladaCaptacoes(carteiraSimulada, spreadSimulado);
//           somaMargensSimuladasCaptacao += margemSimulada;
//         }
//       });
//     }
    
//     // 3. Calcular somas para comissões
//     const tiposComissao = segment === 'total'
//       ? Object.values(commissionTypes).flat()
//       : commissionTypes[segment] || [];
    
//     if (segment === 'total') {
//       // Para total, somamos todos os segmentos
//       segmentos.forEach(seg => {
//         tiposComissao.forEach(tipo => {
//           const data = dadosPlanilha.comissoes[seg][tipo];
//           const ajustes = appState.ajustes[seg].comissoes;
      
//           if (data && ajustes) {
//             // Valores
//             somaComissoesReais += data.valor || 0;
//             const valorSimulado = ajustes[`${tipo}_valorSimulado`] || data.valor || 0;
//             somaComissoesSimuladas += valorSimulado;
//           }
//         });
//       });
//     } else {
//       // Para um segmento específico
//       tiposComissao.forEach(tipo => {
//           const data = dadosPlanilha.comissoes[segment][tipo];
//           const ajustes = appState.ajustes[segment].comissoes;
        
//           if (data && ajustes) {
          
//             // Valores
//             somaComissoesReais += data.valor || 0;
//             const valorSimulado = ajustes[`${tipo}_valorSimulado`] || data.valor || 0;
//             somaComissoesSimuladas += valorSimulado;
//           }
//         });
//       }
    
//     console.log("Somas calculadas:", {
//       credito: { real: somaMargensCredito, simulado: somaMargensSimuladasCredito },
//       captacoes: { real: somaMargensReaisCaptacao, simulado: somaMargensSimuladasCaptacao },
//       comissoes: { real: somaComissoesReais, simulado: somaComissoesSimuladas },
//       pdd: { real: somaPDDReais, simulado: somaPDDSimuladas },
//       rwa: { real: somaRWAReais, simulado: somaRWASimulados }
//     });
    
//     return {
//       somaMargensCredito,
//       somaMargensSimuladasCredito,
//       somaMargensReaisCaptacao,
//       somaMargensSimuladasCaptacao,
//       somaComissoesReais,
//       somaComissoesSimuladas,
//       somaPDDReais,
//       somaPDDSimuladas,
//       somaRWAReais,
//       somaRWASimulados
//     };
//   }

// Função auxiliar para atualizar valores simulados


function atualizarValoresSimulados(plData, indicadoresData, cascadaOriginal, valores) {
  const {
    mobSimulado, pddSimulado, molSimulado, baiSimulado, 
    impostosSimulado, bdiSimulado, rwaSimulado,
    // rorwaSimulado,
    orypReal, demaisAtivosReal, totalGastosReal
  } = valores;
  
  // Atualizar P&L
  plData.MOB.simulado = mobSimulado;
  plData.MOB.atingimentoSimulado = cascadaOriginal.PPTO_MOB ? 
    (mobSimulado / cascadaOriginal.PPTO_MOB) * 100 : 0;
  
  plData.PDD.simulado = pddSimulado;
  plData.PDD.atingimentoSimulado = cascadaOriginal.PPTO_PDD ? 
    (pddSimulado / cascadaOriginal.PPTO_PDD) * 100 : 0;

  console.log('Estado do PDD após atualização:', {
    pddSimulado: pddSimulado,
    plDataPDD: plData.PDD.simulado
  });
  
  plData.MOL.simulado = molSimulado;
  plData.MOL.atingimentoSimulado = cascadaOriginal.PPTO_MOL ? 
    (molSimulado / cascadaOriginal.PPTO_MOL) * 100 : 0;
  
  plData.ORYP.simulado = orypReal; // Mantém o mesmo valor
  plData["Demais Ativos"].simulado = demaisAtivosReal; // Mantém o mesmo valor
  plData["Total Gastos"].simulado = totalGastosReal; // Mantém o mesmo valor
  
  plData.BAI.simulado = baiSimulado;
  plData.BAI.atingimentoSimulado = cascadaOriginal.PPTO_BAI ? 
    (baiSimulado / cascadaOriginal.PPTO_BAI) * 100 : 0;
  
  plData.Impostos.simulado = impostosSimulado;
  plData.Impostos.atingimentoSimulado = cascadaOriginal.PPTO_Impostos ? 
    (impostosSimulado / cascadaOriginal.PPTO_Impostos) * 100 : 0;
  
  plData.BDI.simulado = bdiSimulado;
  plData.BDI.atingimentoSimulado = cascadaOriginal.PPTO_BDI ? 
    (bdiSimulado / cascadaOriginal.PPTO_BDI) * 100 : 0;
  
  // Atualizar indicadores
  indicadoresData.RWA.simulado = rwaSimulado;

  // Sempre calcular RORWA baseado no BDI simulado e RWA simulado
  if (indicadoresData.RWA.simulado > 0) {
    indicadoresData.RORWA.simulado = (plData.BDI.simulado / indicadoresData.RWA.simulado) * 100;
  } else {
    indicadoresData.RORWA.simulado = 0;
  }
  
  // Calcular Taxa Impositiva simulada
  if (baiSimulado !== 0) {
    const taxaImpositiva = Math.abs((impostosSimulado / baiSimulado) * 100);
    indicadoresData["Taxa Impositiva"].simulado = taxaImpositiva;
  }
  
  // Calcular Eficiência simulada
  if (mobSimulado !== 0) {
    const eficiencia = Math.abs((totalGastosReal / mobSimulado) * 100);
    indicadoresData["Eficiência"].simulado = eficiencia;
  }
}

  // Consolida os valores simulados de todos os segmentos no Total
// Substitua a função consolidarValoresTotal em calculationModels.js

// Modifique o calculationModels.js para exportar ambas as funções
// Certifique-se de que a função consolidarValoresTotal seja exportada:

export function consolidarValoresTotal() {
  console.log("Consolidando valores simulados de todos os segmentos para o Total...");
  
  // Inicializar acumuladores para cada valor do cascada
  let mobTotal = 0;
  let pddTotal = 0;
  let molTotal = 0;
  let orypTotal = 0;
  let demaisAtivosTotal = 0;
  let totalGastosTotal = 0;
  let baiTotal = 0;
  let impostosTotal = 0;
  let bdiTotal = 0;
  let rwaTotal = 0;

  // Obter lista de segmentos diretamente dos dados de P&L
  const segmentos = Object.keys(appState.segmentPLData);
  console.log("Segmentos encontrados:", segmentos);
  
  // Log detalhado para ajudar a depurar o problema de PDD
  console.log("====== CONSOLIDAÇÃO DETALHADA DO PDD ======");
  
  // Acumular valores de todos os segmentos
  segmentos.forEach(segmento => {
    if (!appState.segmentPLData[segmento]) {
      console.log(`Segmento ${segmento} não tem dados de P&L`);
      return;
    }
    
    // Capturar o valor de PDD para log
    const pddSegmento = appState.segmentPLData[segmento].PDD?.simulado || 0;
    console.log(`PDD simulado do segmento ${segmento}: ${pddSegmento}`);
    
    // Acumular valores do P&L
    mobTotal += appState.segmentPLData[segmento].MOB?.simulado || 0;
    pddTotal += pddSegmento;
    molTotal += appState.segmentPLData[segmento].MOL?.simulado || 0;
    orypTotal += appState.segmentPLData[segmento].ORYP?.simulado || 0;
    demaisAtivosTotal += appState.segmentPLData[segmento]["Demais Ativos"]?.simulado || 0;
    totalGastosTotal += appState.segmentPLData[segmento]["Total Gastos"]?.simulado || 0;
    baiTotal += appState.segmentPLData[segmento].BAI?.simulado || 0;
    impostosTotal += appState.segmentPLData[segmento].Impostos?.simulado || 0;
    bdiTotal += appState.segmentPLData[segmento].BDI?.simulado || 0;
    
    // Acumular RWA
    if (appState.segmentIndicadores[segmento] && appState.segmentIndicadores[segmento].RWA) {
      rwaTotal += appState.segmentIndicadores[segmento].RWA.simulado || 0;
    }
  });
  
  console.log("PDD Total consolidado:", pddTotal);
  console.log("==========================================");
  
  // Verificar se há valores originais para o Total
  const cascadaOriginalTotal = appState.data?.Total?.cascada || null;
  if (!cascadaOriginalTotal) {
    console.error("Dados de cascada originais não encontrados para Total");
    return;
  }
  
  // Calcular a % PPTO para os valores consolidados
  const calculoPPTO = (valor, valorPPTO) => {
    return valorPPTO && valorPPTO !== 0 ? (valor / valorPPTO) * 100 : 0;
  };
  
  // Atualizar valores no plDataTotal com verificações de segurança
  if (!appState.plDataTotal) {
    console.error("appState.plDataTotal não está definido");
    return;
  }
  
  // Atualizar MOB
  if (appState.plDataTotal.MOB) {
    appState.plDataTotal.MOB.simulado = mobTotal;
    appState.plDataTotal.MOB.atingimentoSimulado = calculoPPTO(mobTotal, cascadaOriginalTotal.PPTO_MOB);
  }
  
  // Atualizar PDD - Este é o valor que precisa ser corrigido!
  if (appState.plDataTotal.PDD) {
    appState.plDataTotal.PDD.simulado = pddTotal;
    appState.plDataTotal.PDD.atingimentoSimulado = calculoPPTO(pddTotal, cascadaOriginalTotal.PPTO_PDD);
    
    console.log("PDD Total atualizado para:", pddTotal);
  }
  
  // Atualizar MOL
  if (appState.plDataTotal.MOL) {
    appState.plDataTotal.MOL.simulado = molTotal;
    appState.plDataTotal.MOL.atingimentoSimulado = calculoPPTO(molTotal, cascadaOriginalTotal.PPTO_MOL);
  }
  
  // Atualizar ORYP
  if (appState.plDataTotal.ORYP) {
    appState.plDataTotal.ORYP.simulado = orypTotal;
    appState.plDataTotal.ORYP.atingimentoSimulado = calculoPPTO(orypTotal, cascadaOriginalTotal.PPTO_Oryp);
  }
  
  // Atualizar Demais Ativos
  if (appState.plDataTotal["Demais Ativos"]) {
    appState.plDataTotal["Demais Ativos"].simulado = demaisAtivosTotal;
    appState.plDataTotal["Demais Ativos"].atingimentoSimulado = calculoPPTO(demaisAtivosTotal, cascadaOriginalTotal["PPTO_Demais Ativos"]);
  }
  
  // Atualizar Total Gastos
  if (appState.plDataTotal["Total Gastos"]) {
    appState.plDataTotal["Total Gastos"].simulado = totalGastosTotal;
    appState.plDataTotal["Total Gastos"].atingimentoSimulado = calculoPPTO(totalGastosTotal, cascadaOriginalTotal["PPTO_Total Gastos"]);
  }
  
  // Atualizar BAI
  if (appState.plDataTotal.BAI) {
    appState.plDataTotal.BAI.simulado = baiTotal;
    appState.plDataTotal.BAI.atingimentoSimulado = calculoPPTO(baiTotal, cascadaOriginalTotal.PPTO_BAI);
  }
  
  // Atualizar Impostos
  if (appState.plDataTotal.Impostos) {
    appState.plDataTotal.Impostos.simulado = impostosTotal;
    appState.plDataTotal.Impostos.atingimentoSimulado = calculoPPTO(impostosTotal, cascadaOriginalTotal.PPTO_Impostos);
  }
  
  // Atualizar BDI
  if (appState.plDataTotal.BDI) {
    appState.plDataTotal.BDI.simulado = bdiTotal;
    appState.plDataTotal.BDI.atingimentoSimulado = calculoPPTO(bdiTotal, cascadaOriginalTotal.PPTO_BDI);
  }
  
  // Atualizar o RWA total e recalcular o RORWA
  if (appState.indicadoresTotal) {
    if (appState.indicadoresTotal.RWA) {
      appState.indicadoresTotal.RWA.simulado = rwaTotal;
    }
    
    // Calcular o RORWA (BDI / RWA * 100)
    if (appState.indicadoresTotal.RORWA) {
      if (rwaTotal > 0) {
        const rorwaTotal = (bdiTotal / rwaTotal) * 100;
        appState.indicadoresTotal.RORWA.simulado = rorwaTotal;
      } else {
        appState.indicadoresTotal.RORWA.simulado = 0;
      }
    }
    
    // Calcular a Taxa Impositiva simulada total
    if (appState.indicadoresTotal["Taxa Impositiva"]) {
      if (baiTotal !== 0) {
        const taxaImpositivaTotal = Math.abs((impostosTotal / baiTotal) * 100);
        appState.indicadoresTotal["Taxa Impositiva"].simulado = taxaImpositivaTotal;
      } else {
        appState.indicadoresTotal["Taxa Impositiva"].simulado = 0;
      }
    }
    
    // Calcular a Eficiência simulada total
    if (appState.indicadoresTotal["Eficiência"]) {
      if (mobTotal !== 0) {
        const eficienciaTotal = Math.abs((totalGastosTotal / mobTotal) * 100);
        appState.indicadoresTotal["Eficiência"].simulado = eficienciaTotal;
      } else {
        appState.indicadoresTotal["Eficiência"].simulado = 0;
      }
    }
  }
  
  console.log("Valores do Total consolidados:", {
    MOB: mobTotal,
    PDD: pddTotal,
    MOL: molTotal,
    BAI: baiTotal,
    Impostos: impostosTotal,
    BDI: bdiTotal,
    RWA: rwaTotal,
    RORWA: appState.indicadoresTotal?.RORWA?.simulado?.toFixed(2) + "%"
  });
}

// Exporte a função atualizarInterfaceCascadaTotal
export function atualizarInterfaceCascadaTotal() {
  try {
    console.log("Atualizando interface para o Cascada Total...");
    
    // Verificar se estamos na visualização Total
    const btnViewTotal = document.getElementById('btn-view-total');
    if (!btnViewTotal) {
      console.error("Elemento 'btn-view-total' não encontrado");
      return;
    }
    
    // Verificar se a tabela existe
    const plBody = document.getElementById('pl-body');
    if (!plBody) {
      console.error("Elemento 'pl-body' não encontrado");
      return;
    }
    
    // Se já estamos na visualização Total, atualizar a tabela diretamente
    if (btnViewTotal.classList.contains('active')) {
      console.log("Já na visualização Total, atualizando tabela...");
      
      // Limpar a tabela
      plBody.innerHTML = '';
      
      // Adicionar linhas para cada item do P&L
      Object.entries(appState.plDataTotal).forEach(([key, data]) => {
        const row = document.createElement('tr');
        
        if (key === 'MOL' || key === 'BAI' || key === 'BDI') {
          row.classList.add('highlight');
        }
        
        // Função auxiliar para formatar números
        const formatNum = (num) => {
          if (num === undefined || num === null) return "0";
          return num.toLocaleString('pt-BR');
        };
        
        // Função auxiliar para formatar porcentagens
        const formatPct = (pct) => {
          if (pct === undefined || pct === null || pct === "-") return "-";
          return pct.toLocaleString('pt-BR', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
          }) + '%';
        };
        
        row.innerHTML = `
          <td>${key}</td>
          <td>${formatNum(data.real)}</td>
          <td>${formatNum(data.simulado)}</td>
          <td>${formatPct(data.atingimentoReal)}</td>
          <td>${formatPct(data.atingimentoSimulado)}</td>
        `;
        
        plBody.appendChild(row);
      });
      
      console.log("Tabela Total atualizada com sucesso");
    } else {
      console.log("Não estamos na visualização Total, interface não atualizada");
    }
    
  } catch (error) {
    console.error("Erro ao atualizar interface do Cascada Total:", error);
  }
}

// Adicione esta função ao arquivo calculationModels.js

// Função para atualizar a interface do Cascada Total
// function atualizarInterfaceCascadaTotal() {
//   try {
//     console.log("Atualizando interface para o Cascada Total...");
    
//     // Verificar se estamos na visualização Total
//     const btnViewTotal = document.getElementById('btn-view-total');
//     if (!btnViewTotal) {
//       console.error("Elemento 'btn-view-total' não encontrado");
//       return;
//     }
    
//     // Verificar se a tabela existe
//     const plBody = document.getElementById('pl-body');
//     if (!plBody) {
//       console.error("Elemento 'pl-body' não encontrado");
//       return;
//     }
    
//     // Se já estamos na visualização Total, atualizar a tabela diretamente
//     if (btnViewTotal.classList.contains('active')) {
//       console.log("Já na visualização Total, atualizando tabela...");
      
//       // Limpar a tabela
//       plBody.innerHTML = '';
      
//       // Adicionar linhas para cada item do P&L
//       Object.entries(appState.plDataTotal).forEach(([key, data]) => {
//         const row = document.createElement('tr');
        
//         if (key === 'MOL' || key === 'BAI' || key === 'BDI') {
//           row.classList.add('highlight');
//         }
        
//         // Função auxiliar para formatar números
//         const formatNum = (num) => {
//           if (num === undefined || num === null) return "0";
//           return num.toLocaleString('pt-BR');
//         };
        
//         // Função auxiliar para formatar porcentagens
//         const formatPct = (pct) => {
//           if (pct === undefined || pct === null || pct === "-") return "-";
//           return pct.toLocaleString('pt-BR', {
//             minimumFractionDigits: 1,
//             maximumFractionDigits: 1
//           }) + '%';
//         };
        
//         row.innerHTML = `
//           <td>${key}</td>
//           <td>${formatNum(data.real)}</td>
//           <td>${formatNum(data.simulado)}</td>
//           <td>${formatPct(data.atingimentoReal)}</td>
//           <td>${formatPct(data.atingimentoSimulado)}</td>
//         `;
        
//         plBody.appendChild(row);
//       });
      
//       console.log("Tabela Total atualizada com sucesso");
//     } else {
//       console.log("Não estamos na visualização Total, interface não atualizada");
//     }
    
//   } catch (error) {
//     console.error("Erro ao atualizar interface do Cascada Total:", error);
//   }
// }

// Função para atualizar o RORWA quando os valores de BDI simulado mudam
export function atualizarRORWASimulado(segment) {
    // Obter referências aos dados
    let dataToUse = (segment === 'total') ? appState.indicadoresTotal : appState.segmentIndicadores[segment];
    let plData = (segment === 'total') ? appState.plDataTotal : appState.segmentPLData[segment];
    
    // Verificar se temos RWA e BDI simulado
    if (dataToUse.RWA && dataToUse.RWA.simulado > 0 && plData.BDI && plData.BDI.simulado > 0) {
        // Calcular novo RORWA simulado
        const rorwaSimulado = (plData.BDI.simulado / dataToUse.RWA.simulado) * 100;
        
        // Atualizar o valor
        dataToUse.RORWA.simulado = rorwaSimulado;
        
        console.log(`RORWA simulado atualizado para ${segment}:`, rorwaSimulado.toFixed(2) + '%');
    }
}