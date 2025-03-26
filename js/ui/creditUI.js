// creditUI.js - Gerencia a interface de usuário relacionada ao crédito
import { creditTypes } from '../config.js';
import { appState } from '../models/dataModels.js';
import { 
  calcularMargemSimulada, 
  calcularRWASimulado,
  calcularProvisaoSimulada,
  calcularCascadaSimulado,
  atualizarInterfaceCascadaTotal
} from '../models/calculationModels.js';
import { formatNumber } from '../utils/formatters.js';
import { atualizarAjustesRealizados } from './adjustmentsUI.js';
// import { loadPLData, loadIndicadoresData } from './plUI.js';

export function initializeDiferencas() {
  if (!appState.diferencas) {
    appState.diferencasCredito = {
      total: {
        diferencaMargem: 0,
        diferencaPDD: 0,
        diferencaRWA: 0
      }
    };
    
    segments.forEach(segment => {
      appState.diferencas[segment] = {
        diferencasCredito: 0,
        diferencaPDD: 0,
        diferencaRWA: 0
      };
    });
  }
}

// Carrega os dados de crédito para exibição na tabela
export function loadCreditData(segment) {
  const creditBody = document.getElementById('credito-body');
  if (!creditBody) {
    console.error("Elemento 'credito-body' não encontrado!");
    return;
  }
  
  creditBody.innerHTML = '';
  
  // Verificar se há tipos de crédito para este segmento
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
    
    // Verificar se é o tipo "Demais"
    const isDemais = tipo === 'Demais';
    
    // Para o tipo "Demais", vamos garantir que os valores simulados sejam iguais aos reais
    // e que os campos sejam desabilitados
    if (isDemais) {
      // Valores simulados iguais aos reais
      const carteiraSimulada = data.carteira;
      const spreadSimulado = data.spread;
      const provisaoSimulada = data.provisao;
      
      // Margem simulada e RWA simulado são iguais aos reais
      const margemSimulada = data.margem;
      const rwaSimulado = data.rwa;
      
      // Criar HTML com campos desabilitados (readonly)
      row.innerHTML = `
        <td>${tipo}</td>
        <td>${formatNumber(data.carteira)}</td>
        <td><input type="number" class="carteira-simulada" value="${carteiraSimulada}" data-tipo="${tipo}" data-campo="carteiraSimulada" readonly disabled style="background-color: #f0f0f0;"></td>
        <td>${spreadSimulado.toFixed(2)}%</td>
        <td><div class="input-with-percent"><input type="number" step="0.01" class="spread-simulado" value="${spreadSimulado.toFixed(2)}" data-tipo="${tipo}" data-campo="spreadSimulado" readonly disabled style="background-color: #f0f0f0;"><span class="percent-sign">%</span></div></td>
        <td>${formatNumber(data.provisao)}</td>
        <td><input type="number" class="provisao-simulada" value="${provisaoSimulada}" data-tipo="${tipo}" data-campo="provisaoSimulada" readonly disabled style="background-color: #f0f0f0;"></td>
        <td>${formatNumber(data.margem)}</td>
        <td><span class="margem-simulada-value">${formatNumber(margemSimulada)}</span></td>
        <td>${formatNumber(data.rwa)}</td>
        <td><span class="rwa-simulado-value">${formatNumber(rwaSimulado)}</span></td>
      `;
    } else {
      // Para outros tipos, manter o comportamento normal
      const spreadReal = data.spread;
      
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
        <td>${spreadReal.toFixed(2)}%</td>
        <td><div class="input-with-percent"><input type="number" step="0.01" class="spread-simulado" value="${spreadSimulado.toFixed(2)}" data-tipo="${tipo}" data-campo="spreadSimulado"><span class="percent-sign">%</span></div></td>
        <td>${formatNumber(data.provisao)}</td>
        <td><input type="number" class="provisao-simulada" value="${provisaoSimulada.toFixed(0)}" data-tipo="${tipo}" data-campo="provisaoSimulada"></td>
        <td>${formatNumber(data.margem)}</td>
        <td><span class="margem-simulada-value">${formatNumber(margemSimulada)}</span></td>
        <td>${formatNumber(data.rwa)}</td>
        <td><span class="rwa-simulado-value">${formatNumber(rwaSimulado)}</span></td>
      `;
    }
    
    creditBody.appendChild(row);
  });
  
  // Adicionar event listeners apenas para linhas que não são "Demais"
  const inputs = creditBody.querySelectorAll('input:not([disabled])');
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
    
    // Salvar o valor no objeto de ajustes
    appState.ajustes[segment].credito[`${tipo}_${campo}`] = valor;
    
    // Obter a linha da tabela
    const row = input.closest('tr');
    if (!row) return;
    
    // Obter os dados reais
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
    
    // Se o valor simulado é igual (ou muito próximo) ao valor original, remover o ajuste. Caso contrário, salvar o ajuste
    if (Math.abs(valor - valorOriginal) < 0.01) {
        delete appState.ajustes[segment].credito[`${tipo}_${campo}`];
    } else {
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
      appState.ajustes[segment].diferencas = provisaoSimulada - provisaoReal;
      
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

    // Amazenar as diferenças nos totais
    diferencaMargem = margemSimulada - data.margem;
    diferencaPDD = provisaoSimulada - data.provisao;
    diferencaRWA = rwaSimulado - data.rwa;

    // Total
    appState.diferencasCredito.total.diferencaMargem += diferencaMargem;
    appState.diferencasCredito.total.diferencaPDD += diferencaPDD;
    appState.diferencasCredito.total.diferencaRWA += diferencaRWA;

    // Segmento
    appState.diferencasCredito[segment].diferencaMargem += diferencaMargem;
    appState.diferencasCredito[segment].diferencaPDD += diferencaPDD;
    appState.diferencasCredito[segment].diferencaRWA += diferencaRWA;

    console.log("Diferenças:", appState.diferencasCredito);
    
    // Atualizar os valores calculados na interface
    const margemSimuladaElement = row.querySelector('.margem-simulada-value');
    const rwaSimuladoElement = row.querySelector('.rwa-simulado-value');
    
    if (margemSimuladaElement) {
      margemSimuladaElement.textContent = formatNumber(margemSimulada);
    }
    
    if (rwaSimuladoElement) {
      rwaSimuladoElement.textContent = formatNumber(rwaSimulado);
    }
  
    atualizarAjustesRealizados();
    calcularCascadaSimulado(segment);
    atualizarInterfaceCascadaTotal();
  }

// Função para chamar o cálculo do cascada e atualizar a interface
// Substitua a função atualizarCascadaEInterface em creditUI.js por esta versão:

// Substitua a função atualizarCascadaEInterface em creditUI.js

// Esta é uma versão simplificada da função atualizarCascadaEInterface para todos os arquivos UI
// (creditUI.js, fundingUI.js, commissionUI.js)

// export function atualizarCascadaEInterface(segment) {
//   calcularCascadaSimulado(segment)
// }