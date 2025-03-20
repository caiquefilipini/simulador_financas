// creditUI.js - Gerencia a interface de usuário relacionada ao crédito
import { creditTypes } from '../config.js';
import { appState } from '../models/dataModels.js';
import { 
  calcularSpreadBaseadoEmMargem, 
  calcularMargemSimulada, 
  calcularRWASimulado,
  calcularProvisaoSimulada,
  calcularCascadaSimulado,
  consolidarValoresTotal,
  atualizarInterfaceCascadaTotal
} from '../models/calculationModels.js';
import { formatNumber } from '../utils/formatters.js';
import { atualizarAjustesRealizados } from './adjustmentsUI.js';
import { loadPLData, loadIndicadoresData } from './plUI.js';


// Carrega os dados de crédito para exibição na tabela
export function loadCreditData(segment) {
  const creditBody = document.getElementById('credito-body');
  if (!creditBody) {
    console.error("Elemento 'credito-body' não encontrado!");
    return;
  }
  
  creditBody.innerHTML = '';
  
  // Verificar se os tipos de crédito para o segmento existem
  const tiposCredito = creditTypes[segment] || [];
  if (tiposCredito.length === 0) {
    creditBody.innerHTML = '<tr><td colspan="11" style="text-align: center">Não há dados de crédito para este segmento</td></tr>';
    return;
  }
  
  // Percorrer os tipos de crédito para o segmento
  tiposCredito.forEach(tipo => {
    const row = document.createElement('tr');
    
    // Obter dados da planilha para este tipo (ou usar padrão)
    const data = appState.dadosPlanilha.credito[segment][tipo] || {
      carteira: 0,
      spread: 0,
      provisao: 0,
      margem: 0,
      rwa: 0
    };
    
    // Verificar se é o tipo "Demais" ou similar para calcular o spread baseado na margem
    let spreadReal = data.spread;
    if (tipo === 'Demais') {
      spreadReal = calcularSpreadBaseadoEmMargem(segment, tipo);
    }
    
    // Recuperar valores simulados (ou usar valores reais como padrão)
    const carteiraSimulada = appState.ajustes[segment].credito[`${tipo}_carteiraSimulada`] || data.carteira;
    const spreadSimulado = appState.ajustes[segment].credito[`${tipo}_spreadSimulado`] || spreadReal;
    const provisaoSimulada = appState.ajustes[segment].credito[`${tipo}_provisaoSimulada`] || data.provisao;
    
    // Calcular margem simulada e RWA simulado baseado nas fórmulas
    const margemSimulada = calcularMargemSimulada(carteiraSimulada, spreadSimulado);
    const rwaSimulado = calcularRWASimulado(data.rwa, data.carteira, carteiraSimulada);
    
    row.innerHTML = `
      <td>${tipo}</td>
      <td>${formatNumber(data.carteira)}</td>
      <td><input type="number" class="carteira-simulada" value="${carteiraSimulada}" data-tipo="${tipo}" data-campo="carteiraSimulada"></td>
      <td>${spreadReal}%</td>
      <td><div class="input-with-percent"><input type="number" step="0.01" class="spread-simulado" value="${spreadSimulado}" data-tipo="${tipo}" data-campo="spreadSimulado"><span class="percent-sign">%</span></div></td>
      <td>${formatNumber(data.provisao)}</td>
      <td><input type="number" class="provisao-simulada" value="${provisaoSimulada}" data-tipo="${tipo}" data-campo="provisaoSimulada"></td>
      <td>${formatNumber(data.margem)}</td>
      <td><span class="margem-simulada-value">${formatNumber(margemSimulada)}</span></td>
      <td>${formatNumber(data.rwa)}</td>
      <td><span class="rwa-simulado-value">${formatNumber(rwaSimulado)}</span></td>
    `;
    
    creditBody.appendChild(row);
  });
  
  // Adicionar event listeners
  const inputs = creditBody.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', function(event) {
      updateCreditSimulatedValues(event, segment);
    });
  });
}

// Atualiza os valores simulados quando o usuário altera um input
// Substitua a função updateCreditSimulatedValues no arquivo creditUI.js

export function updateCreditSimulatedValues(event, segment) {
    const input = event.target;
    const tipo = input.getAttribute('data-tipo');
    const campo = input.getAttribute('data-campo');
    const valor = parseFloat(input.value) || 0;
    
    console.log(`Alteração em ${tipo}, campo ${campo}, novo valor: ${valor}`);
    
    // Salvar o valor no objeto de ajustes
    appState.ajustes[segment].credito[`${tipo}_${campo}`] = valor;
    
    // Obter a linha da tabela
    const row = input.closest('tr');
    if (!row) return;
    
    // Obter os dados reais
    // Quando o valor digitado é igual ao original, remova o ajuste
    const data = appState.dadosPlanilha.credito[segment][tipo] || {
        carteira: 0,
        spread: 0,
        provisao: 0,
        margem: 0,
        rwa: 0
    };
    
    // Verificar se o valor é igual ao original (dentro de uma margem de erro)
    const valorOriginal = campo === 'carteiraSimulada' ? data.carteira :
                        campo === 'spreadSimulado' ? data.spread :
                        campo === 'provisaoSimulada' ? data.provisao : 0;
    
    // Se o valor simulado é igual (ou muito próximo) ao valor original, remover o ajuste
    if (Math.abs(valor - valorOriginal) < 0.01) {
        console.log(`Valor igual ao original para ${tipo}, campo ${campo} - Removendo ajuste`);
        delete appState.ajustes[segment].credito[`${tipo}_${campo}`];
    } else {
        // Caso contrário, salvar o ajuste
        appState.ajustes[segment].credito[`${tipo}_${campo}`] = valor;
    }
  
    // Se o campo alterado foi a Carteira Simulada, atualizar automaticamente a Provisão Simulada
    if (campo === 'carteiraSimulada') {
      const provisaoReal = data.provisao;
      const carteiraReal = data.carteira;
      const carteiraSimulada = valor;
      
      // Calcular nova provisão simulada proporcional à alteração da carteira
      const provisaoSimulada = calcularProvisaoSimulada(provisaoReal, carteiraReal, carteiraSimulada);
      
      // Atualizar o valor no objeto de ajustes
      appState.ajustes[segment].credito[`${tipo}_provisaoSimulada`] = provisaoSimulada;
      
      // Atualizar o input de provisão simulada na interface
      const provisaoSimuladaInput = row.querySelector('.provisao-simulada');
      if (provisaoSimuladaInput) {
        provisaoSimuladaInput.value = provisaoSimulada.toFixed(0);
      }
    }
    
    // Recuperar valores atuais
    const carteiraSimulada = parseFloat(appState.ajustes[segment].credito[`${tipo}_carteiraSimulada`] || data.carteira);
    const spreadSimulado = parseFloat(appState.ajustes[segment].credito[`${tipo}_spreadSimulado`] || data.spread);
    
    // Calcular novos valores
    const margemSimulada = calcularMargemSimulada(carteiraSimulada, spreadSimulado);
    const rwaSimulado = calcularRWASimulado(data.rwa, data.carteira, carteiraSimulada);
    
    // Atualizar os valores calculados na interface
    const margemSimuladaElement = row.querySelector('.margem-simulada-value');
    const rwaSimuladoElement = row.querySelector('.rwa-simulado-value');
    
    if (margemSimuladaElement) {
      margemSimuladaElement.textContent = formatNumber(margemSimulada);
    }
    
    if (rwaSimuladoElement) {
      rwaSimuladoElement.textContent = formatNumber(rwaSimulado);
    }
    
    // Se o campo alterado for provisão, registrar o ajuste
    if (campo === 'provisaoSimulada') {
      console.log(`DIAGNÓSTICO DE PDD - Ajuste em ${tipo}:`, {
        valorOriginal: data.provisao,
        valorSimulado: valor,
        diferenca: valor - data.provisao
      });
      
      // Verificar se o ajuste está sendo registrado corretamente
      console.log(`Ajuste registrado:`, appState.ajustes[segment].credito[`${tipo}_provisaoSimulada`]);
    }
  
    // Atualizar a lista de ajustes realizados
    atualizarAjustesRealizados();
    
    // Atualizar o cascada para o segmento atual
    atualizarCascadaEInterface(segment);
    
    // ADICIONADO: Também atualizar o cascada total para refletir as mudanças
    console.log("Consolidando valores para o Total após atualização no segmento", segment);
    try {
      // Chamar a função importada
      consolidarValoresTotal();
      
      // Verificar se estamos na visualização Total
      const btnViewTotal = document.getElementById('btn-view-total');
      if (btnViewTotal && btnViewTotal.classList.contains('active')) {
        console.log("Em visualização Total, atualizando interface...");
        atualizarInterfaceCascadaTotal();
      }
    } catch (err) {
      console.error("Erro ao consolidar valores para Total:", err);
    }
  }

// Função para chamar o cálculo do cascada e atualizar a interface
// Substitua a função atualizarCascadaEInterface em creditUI.js por esta versão:

// Substitua a função atualizarCascadaEInterface em creditUI.js

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