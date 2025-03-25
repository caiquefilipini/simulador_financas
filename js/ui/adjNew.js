// adjustmentsUI.js - Adição das funcionalidades de diferenças acumuladas
import { segments, creditTypes, fundingTypes, commissionTypes } from '../config.js';
import { appState } from '../models/dataModels.js';
import { formatNumber } from '../utils/formatters.js';
import { loadCreditData } from './creditUI.js';
import { loadFundingData } from './fundingUI.js';
import { loadCommissionData } from './commissionUI.js';

// Inicializar diferenças acumuladas
export function initializeDiferencas() {
  // Criar estrutura de diferenças
  appState.diferencas = {
    total: {
      diferencaMargem: 0,
      diferencaPDD: 0,
      diferencaRWA: 0
    }
  };
  
  // Inicializar para cada segmento
  segments.forEach(segment => {
    appState.diferencas[segment] = {
      diferencaMargem: 0,
      diferencaPDD: 0,
      diferencaRWA: 0
    };
  });
  
  console.log("Diferenças inicializadas:", appState.diferencas);
}

// Garantir que as diferenças estejam inicializadas quando o módulo for carregado
initializeDiferencas();

// Resto do código existente...

// Modificar a função adicionarItemAjuste para acumular diferenças
function adicionarItemAjuste(categoria, tipo, segmento, campo, valor, isPercentual = false, valorCompleto = null) {
  const lista = document.getElementById(`lista-ajustes-${categoria}`);
  if (!lista) return;
  
  // Código UI existente
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
  
  // NOVO: Atualizar diferenças acumuladas com base no tipo de ajuste
  if (campo === 'Provisão') {
    // Atualizar diferença PDD para o segmento
    appState.diferencas[segmento].diferencaPDD += valor;
  } else if (campo === 'RWA') {
    // Atualizar diferença RWA para o segmento
    appState.diferencas[segmento].diferencaRWA += valor;
  } else {
    // Todos os outros ajustes (Carteira, Spread, Valor) afetam a margem
    appState.diferencas[segmento].diferencaMargem += valor;
  }
  
  // Recalcular total
  atualizarDiferencasTotal();
  
  console.log(`Ajuste ${segmento}.${campo}: ${valor}, Diferenças acumuladas:`, appState.diferencas);
}

// NOVA função para recalcular diferenças totais
function atualizarDiferencasTotal() {
  // Zerar totais
  appState.diferencas.total.diferencaMargem = 0;
  appState.diferencas.total.diferencaPDD = 0;
  appState.diferencas.total.diferencaRWA = 0;
  
  // Somar diferenças de todos os segmentos
  segments.forEach(segment => {
    if (appState.diferencas[segment]) {
      appState.diferencas.total.diferencaMargem += appState.diferencas[segment].diferencaMargem || 0;
      appState.diferencas.total.diferencaPDD += appState.diferencas[segment].diferencaPDD || 0;
      appState.diferencas.total.diferencaRWA += appState.diferencas[segment].diferencaRWA || 0;
    }
  });
}

// Modificar a função setupActionButtons para zerar as diferenças
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
          
          // NOVO: Zerar diferenças acumuladas
          appState.diferencas[segment] = {
            diferencaMargem: 0,
            diferencaPDD: 0,
            diferencaRWA: 0
          };
        });
        
        // NOVO: Zerar totais
        appState.diferencas.total = {
          diferencaMargem: 0,
          diferencaPDD: 0,
          diferencaRWA: 0
        };
        
        // Código existente...
        // Recarregar os dados do segmento atual
        const segmentoAtual = document.getElementById('segment').value;
        loadCreditData(segmentoAtual);
        loadFundingData(segmentoAtual);
        loadCommissionData(segmentoAtual);
        
        // Resto do código permanece inalterado...
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