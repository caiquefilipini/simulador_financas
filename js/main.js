// main.js - Arquivo principal que inicializa a aplicação
import { segments } from './config.js';
import { appState } from './models/dataModels.js';
import { carregarDadosJSON, processarDadosJSON } from './services/dataService.js';
import { loadCreditData } from './ui/creditUI.js';
import { loadFundingData } from './ui/fundingUI.js';
import { loadCommissionData } from './ui/commissionUI.js';
import { loadPLData, loadIndicadoresData, setupPLViewButtons } from './ui/plUI.js';
import { atualizarAjustesRealizados, setupActionButtons } from './ui/adjustmentsUI.js';
import { setupTabSystem } from './ui/tabsUI.js';

// Função de inicialização do aplicativo

async function initialize() {
  const segmentSelect = document.getElementById('segment');

  // Preencher seletor de segmentos
  segments.forEach(segment => {
    const option = document.createElement('option');
    option.value = segment;
    option.textContent = segment;
    segmentSelect.appendChild(option);
  });
  
  // Inicializar estruturas mínimas necessárias
  // Isso garante que mesmo se o carregamento falhar, teremos estruturas básicas
  // Não acho que é necessário, mas não parece estar atrapalhando muito
  // if (!appState.data) {
  //   appState.data = { 
  //     Total: { cascada: {} }
  //   };
    
  //   // Garantir que todos os segmentos existam
  //   segments.forEach(segment => {
  //     appState.data[segment] = { 
  //       cascada: {},
  //       credito: {},
  //       captacoes: {},
  //       comissoes: {}
  //     };
  //   });
  // }
  
  // Carregar dados do JSON
  // console.log("Tentando carregar dados do JSON...");
  // const carregamentoOk = await carregarDadosJSON();
  await carregarDadosJSON();
  
  // if (!carregamentoOk) {
  //   console.warn("Carregamento de dados falhou, usando dados padrão");
  //   // Se o carregamento falhou, garantir novamente as estruturas mínimas
  //   appState.preencherDadosPadrao();
  // }
  
  // Verificar novamente se os dados estão ok após o carregamento
  // if (!appState.data) {
  //   console.error("appState.data ainda está undefined após carregamento!");
  //   appState.data = {}; // Fornecer um objeto vazio como fallback mínimo
  // }
  
  // if (!appState.data.Especial) {
  //   console.error("Segmento 'Especial' não encontrado nos dados carregados!");
  //   // Criar uma estrutura mínima para o segmento Especial
  //   appState.data.Especial = { 
  //     cascada: {
  //       MOB: 0, PDD: 0, MOL: 0, BAI: 0, BDI: 0, Impostos: 0, 
  //       RWA: 0, RORWA: 0, "Total Gastos": 0, "Demais Ativos": 0, Oryp: 0
  //     }
  //   };
  //   }
    
    // Configurar o sistema de abas
    setupTabSystem();
    
    // Configurar botões de ação
    setupActionButtons();
    
    // Configurar os botões de visualização do P&L
    setupPLViewButtons();
    
    // Inicializar as visualizações
    const segmentoAtual = segmentSelect.value;
    loadCreditData(segmentoAtual);
    loadFundingData(segmentoAtual);
    loadCommissionData(segmentoAtual);
    loadPLData('total');
    loadIndicadoresData('total');
    atualizarAjustesRealizados();
    
    // Event listener para mudança de segmento
    segmentSelect.addEventListener('change', function() {
      loadCreditData(this.value);
      loadFundingData(this.value);
      loadCommissionData(this.value);
      atualizarAjustesRealizados();
    });
    
    // Configurar o upload de arquivo
    // setupFileUpload();
      
      // console.log("Aplicativo inicializado com sucesso!");
    // } catch (error) {
    //   console.error("Erro ao inicializar o aplicativo:", error);
    //   alert("Ocorreu um erro ao inicializar o aplicativo. Consulte o console para mais detalhes.");
    // }
  }

// Configuração do upload de arquivo
// function setupFileUpload() {
//   const fileInput = document.getElementById('fileInput');
//   const statusElement = document.getElementById('upload-status');
//   const btnProcessar = document.getElementById('btn-processar-arquivo');

//   if (fileInput && statusElement && btnProcessar) {
//     fileInput.addEventListener('change', function(e) {
//       const fileName = e.target.files[0]?.name;
//       if (fileName) {
//         statusElement.textContent = `Arquivo selecionado: ${fileName}`;
//         statusElement.className = 'upload-status';
//         btnProcessar.disabled = false;
//       } else {
//         statusElement.textContent = 'Nenhum arquivo selecionado';
//         statusElement.className = 'upload-status';
//         btnProcessar.disabled = true;
//       }
//     });
    
//     btnProcessar.addEventListener('click', function() {
//       const file = fileInput.files[0];
//       if (!file) {
//         statusElement.textContent = 'Por favor, selecione um arquivo primeiro.';
//         statusElement.className = 'upload-status error';
//         return;
//       }
      
//       statusElement.textContent = 'Processando arquivo...';
//       statusElement.className = 'upload-status';
      
//       // Leitura e processamento do arquivo
//       const reader = new FileReader();
//       reader.onload = function(e) {
//         try {
//           console.log("Arquivo lido com sucesso, iniciando processamento");
//           const jsonString = e.target.result;
//           const data = JSON.parse(jsonString);
          
//           // Recarregar os dados da aplicação com o novo JSON
//           const segmentoAtual = document.getElementById('segment').value;
          
//           // Processar o JSON
//           processarDadosJSON(data);
          
//           // Recarregar visualizações
//           loadCreditData(segmentoAtual);
//           loadFundingData(segmentoAtual);
//           loadCommissionData(segmentoAtual);
//           atualizarAjustesRealizados();
//           loadPLData('total');
//           loadIndicadoresData('total');
          
//           statusElement.textContent = 'Arquivo processado com sucesso!';
//           statusElement.className = 'upload-status success';
//         } catch (error) {
//           console.error("Erro ao processar o arquivo:", error);
//           statusElement.textContent = 'Erro ao processar o arquivo. Verifique se é um JSON válido.';
//           statusElement.className = 'upload-status error';
//         }
//       };
      
//       reader.onerror = function() {
//         statusElement.textContent = 'Erro ao ler o arquivo.';
//         statusElement.className = 'upload-status error';
//       };
      
//       // Ler como texto para JSON
//       reader.readAsText(file);
//     });
//   }
// }

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initialize);