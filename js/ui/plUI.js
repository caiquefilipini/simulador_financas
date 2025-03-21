// plUI.js - Gerencia a interface de usuário relacionada ao P&L e indicadores
import { appState } from '../models/dataModels.js';
import { formatNumber } from '../utils/formatters.js';

// Carrega os dados de P&L para exibição na tabela
export function loadPLData(segment = 'total') {
  const plBody = document.getElementById('pl-body');
  if (!plBody) {
    console.error("Elemento 'pl-body' não encontrado!");
    return;
  }
  
  plBody.innerHTML = '';
  
  // Determinar quais dados usar
  let dataToUse;
  let pptoData;
  
  if (segment === 'total') {
    dataToUse = appState.plDataTotal;
    
    // Usar o objeto de PPTO para Total do JSON carregado
    if (appState.data && appState.data.Total && appState.data.Total.cascada) {
      pptoData = appState.data.Total.cascada;
    }
    
    // Atualizar botão de visualização
    document.getElementById('btn-view-total')?.classList.add('active');
    document.getElementById('btn-view-segment')?.classList.remove('active');
  } else {
    dataToUse = appState.segmentPLData[segment];
    
    // Usar o objeto de PPTO para o segmento específico
    if (appState.data && appState.data[segment] && appState.data[segment].cascada) {
      pptoData = appState.data[segment].cascada;
    }
    
    // Atualizar botão de visualização
    document.getElementById('btn-view-total')?.classList.remove('active');
    document.getElementById('btn-view-segment')?.classList.add('active');
    // Atualizar o texto do botão de segmento
    if (document.getElementById('btn-view-segment')) {
      document.getElementById('btn-view-segment').textContent = segment;
    }
  }

  // Se não houver dados para o segmento selecionado
  if (!dataToUse) {
    plBody.innerHTML = '<tr><td colspan="5" style="text-align: center">Dados não disponíveis para este segmento</td></tr>';
    return;
  }
  
  // Função para calcular a % PPTO
  function calculatePPTOPercentage(real, ppto) {
    if (!ppto || ppto == 0) return "-";
    return ((real / ppto) * 100).toFixed(1);
  }

  console.log('Dados do P&L sendo carregados:', {
    segment: segment,
    dataToUse: dataToUse,
    pdd: dataToUse.PDD
  });
  
  Object.entries(dataToUse).forEach(([key, data]) => {
    const row = document.createElement('tr');
    
    if (key === 'MOL' || key === 'BAI' || key === 'BDI') {
      row.classList.add('highlight');
    }

    // Durante a iteração, adicione um log específico para o PDD
    if (key === 'PDD') {
        console.log('Renderizando PDD:', {
        real: data.real,
        simulado: data.simulado
        });
    }
    
    // Obter o valor do PPTO para este campo
    let pptoValue = 0;
    if (pptoData) {
      const pptoKey = "PPTO_" + key;
      pptoValue = pptoData[pptoKey] || 0;
    }
    
    // Calcular % PPTO
    const pptoRealPercentage = calculatePPTOPercentage(data.real, pptoValue);
    const pptoSimuladoPercentage = calculatePPTOPercentage(data.simulado, pptoValue);
    
    row.innerHTML = `
      <td>${key}</td>
      <td>${formatNumber(data.real)}</td>
      <td>${formatNumber(data.simulado)}</td>
      <td>${pptoRealPercentage === "-" ? "-" : pptoRealPercentage + "%"}</td>
      <td>${pptoSimuladoPercentage === "-" ? "-" : pptoSimuladoPercentage + "%"}</td>
    `;
    
    plBody.appendChild(row);
  });
}

// Carrega os dados de indicadores para exibição na tabela
export function loadIndicadoresData(segment = 'total') {
  const indicadoresBody = document.getElementById('indicadores-body');
  if (!indicadoresBody) {
    console.error("Elemento 'indicadores-body' não encontrado!");
    return;
  }
  
  indicadoresBody.innerHTML = '';
  
  // Determinar quais dados usar para os indicadores
  let dataToUse = (segment === 'total') ? appState.indicadoresTotal : appState.segmentIndicadores[segment];
  
  // Obter dados de cascada diretamente (contém RWA)
  let cascadaData = null;
  let plData = null;
  
  if (segment === 'total') {
    cascadaData = appState.data?.Total?.cascada || null;
    plData = appState.plDataTotal;
  } else {
    cascadaData = appState.data?.[segment]?.cascada || null;
    plData = appState.segmentPLData[segment];
  }
  
  // Se não houver dados para o segmento selecionado
  if (!dataToUse) {
    indicadoresBody.innerHTML = '<tr><td colspan="5" style="text-align: center">Indicadores não disponíveis para este segmento</td></tr>';
    return;
  }

  const ordemIndicadores = [
    'Taxa Impositiva',
    'Eficiência',
    'RWA',
    'RORWA'
  ];
  
  
// Criação das linhas da tabela para cada indicador
ordemIndicadores.forEach(key => {
    if (dataToUse[key]) {
      const row = document.createElement('tr');
      const data = dataToUse[key]; // Definir a variável data aqui
      
      // Verificar se é RWA ou RORWA para formatação adequada
      if (key === 'RWA') {
        // Para RWA, formatação numérica
        row.innerHTML = `
          <td>${key}</td>
          <td>${formatNumber(data.real)}</td>
          <td>${formatNumber(data.simulado)}</td>
          <td>-</td>
          <td>-</td>
        `;
      } 
      else if (key === 'RORWA') {
        // Para RORWA, recalcular como BDI/RWA (em vez de usar o valor armazenado)
        let rorwaRealValue = 0;
        let rorwaSimuladoValue = 0;
        
        // Acessar os dados do P&L para obter o BDI
        const plDataToUse = (segment === 'total') ? appState.plDataTotal : appState.segmentPLData[segment];
        
        // Calcular RORWA com base no BDI e RWA atuais (real e simulado)
        if (dataToUse.RWA.real > 0 && plDataToUse.BDI) {
          rorwaRealValue = (plDataToUse.BDI.real / dataToUse.RWA.real) * 100;
        }
        
        if (dataToUse.RWA.simulado > 0 && plDataToUse.BDI) {
          rorwaSimuladoValue = (plDataToUse.BDI.simulado / dataToUse.RWA.simulado) * 100;
        }
        
        row.innerHTML = `
          <td>${key}</td>
          <td>${rorwaRealValue.toFixed(2)}%</td>
          <td>${rorwaSimuladoValue.toFixed(2)}%</td>
          <td>-</td>
          <td>-</td>
        `;
      }
      else if (key === 'Taxa Impositiva' || key === 'Eficiência') {
        // Para Taxa Impositiva e Eficiência, sempre mostrar "-" para PPTO
        row.innerHTML = `
          <td>${key}</td>
          <td>${data.real.toFixed(1)}%</td>
          <td>${data.simulado.toFixed(1)}%</td>
          <td>-</td>
          <td>-</td>
        `;
      }
      else {
        // Para outros indicadores, formato padrão
        row.innerHTML = `
          <td>${key}</td>
          <td>${data.real.toFixed(1)}%</td>
          <td>${data.simulado.toFixed(1)}%</td>
          <td>${data.atingimentoReal === "-" ? "-" : data.atingimentoReal + "%"}</td>
          <td>${data.atingimentoSimulado === "-" ? "-" : data.atingimentoSimulado + "%"}</td>
        `;
      }
      
      indicadoresBody.appendChild(row);
    }
  });
}

// Configurar os botões de visualização do P&L
export function setupPLViewButtons() {
  const btnViewTotal = document.getElementById('btn-view-total');
  const btnViewSegment = document.getElementById('btn-view-segment');
  
  if (!btnViewTotal || !btnViewSegment) {
    console.error("Botões de visualização do P&L não encontrados!");
    return;
  }
  
  // Atualizar texto do botão de segmento quando mudar a seleção
  const segmentSelect = document.getElementById('segment');
  if (segmentSelect) {
    segmentSelect.addEventListener('change', function() {
      btnViewSegment.textContent = this.value;
      
      // Se o botão de segmento estiver ativo, recarregar dados
      if (btnViewSegment.classList.contains('active')) {
        loadPLData(this.value);
        loadIndicadoresData(this.value);
      }
    });
  }
  
  // Botão de visualização total
  btnViewTotal.addEventListener('click', function() {
    btnViewTotal.classList.add('active');
    btnViewSegment.classList.remove('active');
    loadPLData('total');
    loadIndicadoresData('total');
  });
  
  // Botão de visualização de segmento
  btnViewSegment.addEventListener('click', function() {
    btnViewTotal.classList.remove('active');
    btnViewSegment.classList.add('active');
    const segmentoAtual = document.getElementById('segment').value;
    loadPLData(segmentoAtual);
    loadIndicadoresData(segmentoAtual);
  });
}