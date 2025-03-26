// plUI.js - Gerencia a interface de usuário relacionada ao P&L e indicadores
import { appState } from '../models/dataModels.js';
import { formatNumber } from '../utils/formatters.js';

export function loadPLData(segment = 'total') {
  console.log(`Carregando dados de P&L para: ${segment}`);
  
  let dataToUse;
  if (segment === 'total') {
    dataToUse = appState.plDataTotal;
    console.log("Dados de P&L Total:", JSON.stringify(dataToUse));
  } else {
    dataToUse = appState.segmentPLData[segment];
    console.log(`Dados de P&L para ${segment}:`, JSON.stringify(dataToUse));
  }
  const plBody = document.getElementById('pl-body');
  plBody.innerHTML = '';
  
  // Atualizar visualização ativa
  if (segment === 'total') {
    dataToUse = appState.plDataTotal;
    
    // Atualizar botão de visualização
    document.getElementById('btn-view-total')?.classList.add('active');
    document.getElementById('btn-view-segment')?.classList.remove('active');
  } else {
    dataToUse = appState.segmentPLData[segment];
    
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
  
  // Acessar dados estáticos pré-processados
  const dadosPath = segment === 'total' ? 'total' : `segmentos.${segment}`;
  const reais = appState.dadosEstaticos.reais[segment === 'total' ? 'total' : 'segmentos'][segment] || {};
  const ppto = appState.dadosEstaticos.ppto[segment === 'total' ? 'total' : 'segmentos'][segment] || {};
  const atingimentos = appState.dadosEstaticos.atingimentos[segment === 'total' ? 'total' : 'segmentos'][segment] || {};
  
  Object.entries(dataToUse).forEach(([key, data]) => {
    const row = document.createElement('tr');
    
    if (key === 'MOL' || key === 'BAI' || key === 'BDI') {
      row.classList.add('highlight');
    }
    
    // Usar valores pré-calculados onde possível
    const pptoValue = ppto[key] || 0;
    const atingimentoReal = atingimentos[key] || 0;
    
    // Calcular atingimento simulado (nesse caso ainda precisamos calcular)
    const atingimentoSimulado = pptoValue !== 0 ? (data.simulado / pptoValue) * 100 : 0;
    
    // Arredondar para inteiros
    const realRounded = Math.round(parseFloat(data.real || 0));
    const simuladoRounded = Math.round(parseFloat(data.simulado || 0));
    
    row.innerHTML = `
      <td>${key}</td>
      <td>${formatNumber(realRounded)}</td>
      <td>${formatNumber(simuladoRounded)}</td>
      <td>${pptoValue === 0 ? "-" : atingimentoReal.toFixed(1) + "%"}</td>
      <td>${pptoValue === 0 ? "-" : atingimentoSimulado.toFixed(1) + "%"}</td>
    `;
    
    plBody.appendChild(row);
  });
}

// Carrega os dados de indicadores para exibição na tabela
export function loadIndicadoresData(segment = 'total') {
  const indicadoresBody = document.getElementById('indicadores-body');
  indicadoresBody.innerHTML = '';
  
  let dataToUse = (segment === 'total') ? appState.indicadoresTotal : appState.segmentIndicadores[segment];
  
  // Acessar valores pré-processados onde possível
  const reais = appState.dadosEstaticos.reais[segment === 'total' ? 'total' : 'segmentos'][segment] || {};
  
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
      const data = dataToUse[key];
      
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
        // Para RORWA, calcular usando valores simulados atualizados
        let rorwaRealValue = data.real || 0;
        let rorwaSimuladoValue = data.simulado || 0;
        
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
  // Código existente sem alterações...
}