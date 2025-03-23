// fundingUI.js - Gerencia a interface de usuário relacionada às captações
import { fundingTypes } from '../config.js';
import { appState } from '../models/dataModels.js';
import { 
  calcularMargemSimuladaCaptacoes,
  calcularCascadaSimulado
} from '../models/calculationModels.js';
import { formatNumber } from '../utils/formatters.js';
import { atualizarAjustesRealizados } from './adjustmentsUI.js';
import { loadPLData, loadIndicadoresData } from './plUI.js';

// Carrega os dados de captações para exibição na tabela
export function loadFundingData(segment) {
  const captacoesBody = document.getElementById('captacoes-body');
  if (!captacoesBody) {
    console.error("Elemento 'captacoes-body' não encontrado!");
    return;
  }
  
  captacoesBody.innerHTML = '';

  // Verificar se há tipos de captação para este segmento
  const tiposCaptacao = fundingTypes[segment] || [];
  if (tiposCaptacao.length === 0) {
    captacoesBody.innerHTML = '<tr><td colspan="7" style="text-align: center">Não há dados de captação para este segmento</td></tr>';
    return;
  }
  
  // Percorrer os tipos de captação
  tiposCaptacao.forEach(tipo => {
    const row = document.createElement('tr');
    
    // Obter dados da planilha para este tipo (ou usar padrão)
    const data = appState.dadosPlanilha.captacoes[segment][tipo] || {
      carteira: 0,
      spread: 0,
      margem: 0,
    };
    
    // Verificar se é o tipo "Demais"
    const isDemais = tipo === 'Demais';
    
    // Para o tipo "Demais", vamos garantir que os valores simulados sejam iguais aos reais
    // e que os campos sejam desabilitados
    if (isDemais) {
      // Valores simulados iguais aos reais
      const carteiraSimulada = data.carteira;
      const spreadSimulado = data.spread;
      
      // Margem simulada igual à real
      const margemSimulada = data.margem;
      
      // Criar HTML com campos desabilitados (readonly)
      row.innerHTML = `
        <td>${tipo}</td>
        <td>${formatNumber(data.carteira)}</td>
        <td><input type="number" class="carteira-simulada" value="${carteiraSimulada}" data-tipo="${tipo}" data-campo="carteiraSimulada" readonly disabled style="background-color: #f0f0f0;"></td>
        <td>${spreadSimulado.toFixed(2)}%</td>
        <td><div class="input-with-percent"><input type="number" step="0.01" class="spread-simulado" value="${spreadSimulado.toFixed(2)}" data-tipo="${tipo}" data-campo="spreadSimulado" readonly disabled style="background-color: #f0f0f0;"><span class="percent-sign">%</span></div></td>
        <td>${formatNumber(data.margem)}</td>
        <td><span class="margem-simulada-value campo-calculado">${formatNumber(margemSimulada)}</span></td>
      `;
    } else {
      // Para outros tipos, manter o comportamento normal
      let spreadReal = data.spread;
      
      // Recuperar valores simulados
      const carteiraSimulada = appState.ajustes[segment].captacoes[`${tipo}_carteiraSimulada`] || data.carteira;
      const spreadSimulado = appState.ajustes[segment].captacoes[`${tipo}_spreadSimulado`] || spreadReal;
      
      // Calcular margem simulada baseada na fórmula
      const margemSimulada = calcularMargemSimuladaCaptacoes(carteiraSimulada, spreadSimulado);
      
      row.innerHTML = `
        <td>${tipo}</td>
        <td>${formatNumber(data.carteira)}</td>
        <td><input type="number" class="carteira-simulada" value="${carteiraSimulada}" data-tipo="${tipo}" data-campo="carteiraSimulada"></td>
        <td>${spreadReal.toFixed(2)}%</td>
        <td><div class="input-with-percent"><input type="number" step="0.01" class="spread-simulado" value="${spreadSimulado.toFixed(2)}" data-tipo="${tipo}" data-campo="spreadSimulado"><span class="percent-sign">%</span></div></td>
        <td>${formatNumber(data.margem)}</td>
        <td><span class="margem-simulada-value campo-calculado">${formatNumber(margemSimulada)}</span></td>
      `;
    }
    
    captacoesBody.appendChild(row);
  });
  
  // Adicionar event listeners apenas para linhas que não são "Demais"
  const inputs = captacoesBody.querySelectorAll('input:not([disabled])');
  inputs.forEach(input => {
    input.addEventListener('input', function(event) {
      updateFundingSimulatedValues(event, segment);
    });
  });
}

// Função para atualizar valores simulados de captação
export function updateFundingSimulatedValues(event, segment) {
  const input = event.target;
  const tipo = input.getAttribute('data-tipo');
  const campo = input.getAttribute('data-campo');
  const valor = parseFloat(input.value) || 0;
  
  // Salvar o valor no objeto de ajustes
  appState.ajustes[segment].captacoes[`${tipo}_${campo}`] = valor;
  
  // Obter a linha da tabela
  const row = input.closest('tr');
  if (!row) return;
  
  // Obter os dados reais
  const data = appState.dadosPlanilha.captacoes[segment][tipo] || {
    carteira: 0,
    spread: 0,
    margem: 0
  };
  
  // Recuperar valores atuais
  const carteiraSimulada = parseFloat(appState.ajustes[segment].captacoes[`${tipo}_carteiraSimulada`] || data.carteira);
  const spreadSimulado = parseFloat(appState.ajustes[segment].captacoes[`${tipo}_spreadSimulado`] || data.spread);
  
  // Calcular nova margem simulada
  const margemSimulada = calcularMargemSimuladaCaptacoes(carteiraSimulada, spreadSimulado);
  
  // Atualizar o valor calculado na interface
  const margemSimuladaElement = row.querySelector('.margem-simulada-value');
  
  if (margemSimuladaElement) {
    margemSimuladaElement.textContent = formatNumber(margemSimulada);
  }
  
  // Atualizar a lista de ajustes realizados
  atualizarAjustesRealizados();
  
  // Atualizar o cascada simulado e a interface
  atualizarCascadaEInterface(segment);
}

// Função para chamar o cálculo do cascada e atualizar a interface
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