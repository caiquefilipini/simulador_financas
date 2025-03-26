import { appState } from '../models/dataModels.js';
import { segments } from '../config.js';

// Em dataService.js
export async function carregarDadosJSON() {
  try {
    console.log("Iniciando carregamento de dados...");
    
    // Carregar o JSON
    const response = await fetch('dict_indicadores.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Dados JSON recebidos:", Object.keys(data));
    
    // Verificar se os dados têm a estrutura esperada
    if (!data || typeof data !== 'object') {
      throw new Error('Formato de dados inválido!');
    }

    // Preencher dados para Total
    Object.keys(appState.plDataTotal).forEach(key => {
      appState.plDataTotal[key].real = data.Total.cascada[key];
      appState.plDataTotal[key].simulado = data.Total.cascada[key];
    });
    
    // Preencher indicadores
    Object.keys(appState.indicadoresTotal).forEach(key => {
      appState.indicadoresTotal[key].real = data.Total.indicadores[key];
      appState.indicadoresTotal[key].simulado = data.Total.indicadores[key];
    });
    
    // Preencher dados para cada segmento
    segments.forEach(segment => {
      // Preencher P&L
      Object.keys(appState.segmentPLData[segment] || {}).forEach(key => {
        appState.segmentPLData[segment][key].real = data[segment].cascada[key];
        appState.segmentPLData[segment][key].simulado = data[segment].cascada[key];
      });
      
      // Preencher indicadores
      Object.keys(appState.segmentIndicadores[segment] || {}).forEach(key => {
        appState.segmentIndicadores[segment][key].real = data[segment].indicadores[key];
        appState.segmentIndicadores[segment][key].simulado = data[segment].indicadores[key];
        });
      });
    
    return true;
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    throw error;
  }
}



