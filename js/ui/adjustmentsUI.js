// adjustmentsUI.js - Gerencia a interface de usuário relacionada aos ajustes
import { segments, creditTypes, fundingTypes, commissionTypes } from '../config.js';
import { appState } from '../models/dataModels.js';
import { formatNumber } from '../utils/formatters.js';
import { loadCreditData } from './creditUI.js';
import { loadFundingData } from './fundingUI.js';
import { loadCommissionData } from './commissionUI.js';
import { loadPLData, loadIndicadoresData } from './plUI.js';

// Atualiza as listas de ajustes realizados
export function atualizarAjustesRealizados() {
  const listaAjustesCredito = document.getElementById('lista-ajustes-credito');
  const listaAjustesCaptacoes = document.getElementById('lista-ajustes-captacoes');
  const listaAjustesComissoes = document.getElementById('lista-ajustes-comissoes');
  
  // Limpar as listas existentes
  listaAjustesCredito.innerHTML = '';
  listaAjustesCaptacoes.innerHTML = '';
  listaAjustesComissoes.innerHTML = '';
  
  // Variáveis para verificar se há ajustes em cada categoria
  let temAjusteCredito = false;
  let temAjusteCaptacoes = false;
  let temAjusteComissoes = false;
  
  try {
    // Percorrer todos os segmentos
    segments.forEach(segment => {
      // Verificar se o objeto de ajustes para este segmento existe
      if (!appState.ajustes[segment]) return;
      
      // Ajustes de Crédito
      if (appState.ajustes[segment].credito && creditTypes[segment]) {
        creditTypes[segment].forEach(tipo => {
          // Verificar carteira simulada
          const carteiraSimulada = parseFloat(appState.ajustes[segment].credito[`${tipo}_carteiraSimulada`] || 0);
          const carteiraReal = appState.dadosPlanilha.credito[segment][tipo]?.carteira || 0;
          if (carteiraSimulada !== 0 && carteiraSimulada.toFixed(0) !== carteiraReal.toFixed(0)) {
            temAjusteCredito = true;
            const diferenca = carteiraSimulada - carteiraReal;
            adicionarItemAjuste('credito', tipo, segment, 'Carteira', diferenca, false, `${formatNumber(carteiraReal)} → ${formatNumber(carteiraSimulada)}`);
          }
          
          // Verificar spread simulado
          const spreadSimulado = parseFloat(appState.ajustes[segment].credito[`${tipo}_spreadSimulado`] || 0);
          const spreadReal = appState.dadosPlanilha.credito[segment][tipo]?.spread || 0;
          if (spreadSimulado !== 0 && spreadSimulado.toFixed(2) !== spreadReal.toFixed(2)) {
            temAjusteCredito = true;
            const diferenca = spreadSimulado - spreadReal;
            adicionarItemAjuste('credito', tipo, segment, 'Spread', diferenca, true, `${spreadReal.toFixed(2)}% → ${spreadSimulado.toFixed(2)}%`);
          }
          
          // Verificar provisão simulada
          const provisaoSimulada = parseFloat(appState.ajustes[segment].credito[`${tipo}_provisaoSimulada`] || 0);
          const provisaoReal = appState.dadosPlanilha.credito[segment][tipo]?.provisao || 0;
          if (provisaoSimulada !== 0 && provisaoSimulada.toFixed(0) !== provisaoReal.toFixed(0)) {
            temAjusteCredito = true;
            const diferenca = provisaoSimulada - provisaoReal;
            adicionarItemAjuste('credito', tipo, segment, 'Provisão', diferenca, false, `${formatNumber(provisaoReal)} → ${formatNumber(provisaoSimulada)}`);
          }
        });
      }
      
      // Ajustes de Captações
      if (appState.ajustes[segment].captacoes && fundingTypes[segment]) {
        fundingTypes[segment].forEach(tipo => {
          // Verificar carteira simulada
          const carteiraSimulada = parseFloat(appState.ajustes[segment].captacoes[`${tipo}_carteiraSimulada`] || 0);
          const carteiraReal = appState.dadosPlanilha.captacoes[segment][tipo]?.carteira || 0;
          if (carteiraSimulada !== 0 && carteiraSimulada.toFixed(0) !== carteiraReal.toFixed(0)) {
            temAjusteCaptacoes = true;
            const diferenca = carteiraSimulada - carteiraReal;
            adicionarItemAjuste('captacoes', tipo, segment, 'Carteira', diferenca, false, `${formatNumber(carteiraReal)} → ${formatNumber(carteiraSimulada)}`);
          }
          
          // Verificar spread simulado
          const spreadSimulado = parseFloat(appState.ajustes[segment].captacoes[`${tipo}_spreadSimulado`] || 0);
          const spreadReal = appState.dadosPlanilha.captacoes[segment][tipo]?.spread || 0;
          if (spreadSimulado !== 0 && spreadSimulado.toFixed(2) !== spreadReal.toFixed(2)) {
            temAjusteCaptacoes = true;
            const diferenca = spreadSimulado - spreadReal;
            adicionarItemAjuste('captacoes', tipo, segment, 'Spread', diferenca, true, `${spreadReal.toFixed(2)}% → ${spreadSimulado.toFixed(2)}%`);
          }
        });
      }
      
      // Ajustes de Comissões
      if (appState.ajustes[segment].comissoes && commissionTypes[segment]) {
        commissionTypes[segment].forEach(tipo => {
          // Verificar valor simulado
          const valorSimulado = parseFloat(appState.ajustes[segment].comissoes[`${tipo}_valorSimulado`] || 0);
          const valorReal = appState.dadosPlanilha.comissoes[segment][tipo]?.valor || 0;
          if (valorSimulado !== 0 && valorSimulado.toFixed(0) !== valorReal.toFixed(0)) {
            temAjusteComissoes = true;
            const diferenca = valorSimulado - valorReal;
            adicionarItemAjuste('comissoes', tipo, segment, 'Valor', diferenca, false, `${formatNumber(valorReal)} → ${formatNumber(valorSimulado)}`);
          }
        });
      }
    });
  } catch (error) {
    console.error("Erro ao atualizar ajustes realizados:", error);
  }
  
  // Adicionar mensagens "nenhum ajuste" se necessário
  if (!temAjusteCredito) {
    const item = document.createElement('li');
    item.className = 'no-ajustes';
    item.textContent = 'Nenhum ajuste realizado para Crédito';
    listaAjustesCredito.appendChild(item);
  }
  
  if (!temAjusteCaptacoes) {
    const item = document.createElement('li');
    item.className = 'no-ajustes';
    item.textContent = 'Nenhum ajuste realizado para Captações';
    listaAjustesCaptacoes.appendChild(item);
  }
  
  if (!temAjusteComissoes) {
    const item = document.createElement('li');
    item.className = 'no-ajustes';
    item.textContent = 'Nenhum ajuste realizado para Comissões';
    listaAjustesComissoes.appendChild(item);
  }
}

// Função auxiliar para adicionar um item de ajuste à lista correspondente
function adicionarItemAjuste(categoria, tipo, segmento, campo, valor, isPercentual = false, valorCompleto = null) {
  const lista = document.getElementById(`lista-ajustes-${categoria}`);
  if (!lista) return;
  
  const item = document.createElement('li');
  
  // Determinar classe para estilização baseada no valor
  const classeValor = valor > 0 ? 'positivo' : (valor < 0 ? 'negativo' : '');
  
  // Formato do valor
  let valorFormatado;
  if (valorCompleto) {
    valorFormatado = valorCompleto;
  } else if (isPercentual) {
    valorFormatado = (valor > 0 ? '+' : '') + valor.toFixed(2) + '%';
  } else {
    valorFormatado = (valor > 0 ? '+' : '') + formatNumber(valor);
  }
  
  item.innerHTML = `
    <span class="ajuste-info">${tipo} (${segmento}) - ${campo}</span>
    <span class="ajuste-valor ${classeValor}">${valorFormatado}</span>
  `;
  
  lista.appendChild(item);
}

// Configura os botões de ação (Limpar Ajustes, Otimizar, etc.)
// Modifique apenas a função setupActionButtons em adjustmentsUI.js

// Correção para adjustmentsUI.js - função setupActionButtons

export function setupActionButtons() {
  const btnOtimizar = document.getElementById('btn-otimizar');
  const btnLimparAjustes = document.getElementById('btn-limpar-ajustes');
  
  // Verificar se o botão Limpar Ajustes existe
  if (btnLimparAjustes) {
    btnLimparAjustes.addEventListener('click', function() {
      // Confirmar antes de limpar
      if (confirm('Tem certeza que deseja limpar todos os ajustes realizados?')) {
        // Limpar objeto de ajustes para TODOS os segmentos
        segments.forEach(segment => {
          appState.ajustes[segment] = { 
            credito: {}, 
            captacoes: {}, 
            comissoes: {} 
          };
        });
        
        // Recarregar os dados do segmento atual
        const segmentoAtual = document.getElementById('segment').value;
        loadCreditData(segmentoAtual);
        loadFundingData(segmentoAtual);
        loadCommissionData(segmentoAtual);
        
        // Forçar recálculo do cascada para o segmento e para o total
        try {
          // Importar diretamente a função do módulo para garantir que está disponível
          import('../models/calculationModels.js').then(module => {
            const { calcularCascadaSimulado, consolidarValoresTotal } = module;
            
            // Calcular cascada para o segmento atual
            calcularCascadaSimulado(segmentoAtual);
            
            // Recalcular para o total também
            calcularCascadaSimulado('total');
            
            // Consolidar os valores totais
            consolidarValoresTotal();
            
            // Atualizar a interface
            const modoVisualizacao = document.getElementById('btn-view-total').classList.contains('active') ? 
              'total' : segmentoAtual;
            
            // Importar as funções necessárias para atualizar a interface
            import('./plUI.js').then(plModule => {
              const { loadPLData, loadIndicadoresData } = plModule;
              loadPLData(modoVisualizacao);
              loadIndicadoresData(modoVisualizacao);
              
              // Atualizar a lista de ajustes realizados
              atualizarAjustesRealizados();
              
              // Feedback ao usuário
              alert('Todos os ajustes foram removidos com sucesso!');
            });
          });
        } catch (error) {
          console.error("Erro ao recalcular cascada após limpar ajustes:", error);
          alert('Ajustes foram removidos, mas ocorreu um erro ao atualizar os cálculos.');
        }
      }
    });
  }

  // Botão Otimizar Portfolio (placeholder para implementação futura)
  if (btnOtimizar) {
    btnOtimizar.addEventListener('click', function() {
      alert('Funcionalidade em desenvolvimento');
    });
  }
}