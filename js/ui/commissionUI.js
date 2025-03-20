// commissionUI.js - Gerencia a interface de usuário relacionada às comissões
import { commissionTypes } from '../config.js';
import { appState } from '../models/dataModels.js';
import { calcularCascadaSimulado } from '../models/calculationModels.js';
import { formatNumber } from '../utils/formatters.js';
import { atualizarAjustesRealizados } from './adjustmentsUI.js';
import { loadPLData, loadIndicadoresData } from './plUI.js';

// Carrega os dados de comissões para exibição na tabela
export function loadCommissionData(segment) {
  const comissoesBody = document.getElementById('comissoes-body');
  if (!comissoesBody) {
    console.error("Elemento 'comissoes-body' não encontrado!");
    return;
  }
  
  comissoesBody.innerHTML = '';
  
  // Verificar se há tipos de comissão para este segmento
  const tiposComissao = commissionTypes[segment] || [];
  if (tiposComissao.length === 0) {
    comissoesBody.innerHTML = '<tr><td colspan="3" style="text-align: center">Não há dados de comissão para este segmento</td></tr>';
    return;
  }
  
  // Percorrer os tipos de comissão
  tiposComissao.forEach(tipo => {
    const row = document.createElement('tr');
    
    // Obter dados da planilha para este tipo (ou usar padrão)
    const data = appState.dadosPlanilha.comissoes[segment][tipo] || {
      valor: 0
    };
    
    // Recuperar valor simulado
    const valorSimulado = appState.ajustes[segment].comissoes[`${tipo}_valorSimulado`] || data.valor;
    
    row.innerHTML = `
      <td>${tipo}</td>
      <td>${formatNumber(data.valor)}</td>
      <td><input type="number" class="valor-simulado-input" value="${valorSimulado}" data-tipo="${tipo}" data-campo="valorSimulado"></td>
    `;
    
    comissoesBody.appendChild(row);
  });
  
  // Adicionar event listeners
  const inputs = comissoesBody.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', function(event) {
      updateCommissionSimulatedValues(event, segment);
    });
  });
}

// Função para atualizar valores simulados de comissão
export function updateCommissionSimulatedValues(event, segment) {
  const input = event.target;
  const tipo = input.getAttribute('data-tipo');
  const campo = input.getAttribute('data-campo');
  const valor = parseFloat(input.value) || 0;
  
  // Salvar o valor simulado
  appState.ajustes[segment].comissoes[`${tipo}_${campo}`] = valor;
  
  // Atualizar a lista de ajustes realizados
  atualizarAjustesRealizados();
  
  // Atualizar o cascada simulado e a interface
  atualizarCascadaEInterface(segment);
}

// Função para chamar o cálculo do cascada e atualizar a interface
// Modifique a função atualizarCascadaEInterface no arquivo commissionUI.js

// Esta é uma versão simplificada da função atualizarCascadaEInterface para todos os arquivos UI
// (creditUI.js, fundingUI.js, commissionUI.js)

export function atualizarCascadaEInterface(segment) {
    try {
      console.log(`Iniciando atualização do cascada para segmento: ${segment}`);
      
      // Verificação básica
      if (!segment || !appState || !appState.data) {
        console.error("Dados básicos não disponíveis para atualização");
        return;
      }
      
      // Chamar diretamente calcularCascadaSimulado - a atualização da interface é feita lá dentro
      try {
        calcularCascadaSimulado(segment);
        console.log("Cascada calculado e interface atualizada com sucesso");
      } catch (error) {
        console.error("Erro ao calcular cascada:", error);
      }
      
    } catch (generalError) {
      console.error("Erro geral em atualizarCascadaEInterface:", generalError);
    }
  }