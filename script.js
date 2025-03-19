document.addEventListener('DOMContentLoaded', function() {
  // Definições de dados
  const segments = ['Especial', 'Prospera', 'Select', 'PJ', 'Corporate', 'SCIB', 'Private', 'Consumer'];
  
  // Tipos de crédito por segmento
  const creditTypes = {
      Especial: ['Cheque Especial', 'Cartões', 'CP', 'Consignado', 'Hipotecas', 'Autos', 'Demais'],
      Prospera: ['Cheque Especial', 'Cartões', 'CP', 'Consignado', 'Hipotecas', 'Autos', 'Microcrédito', 'Demais'],
      Select: ['Cheque Especial', 'Cartões', 'CP', 'Consignado', 'Hipotecas', 'Autos', 'Agro', 'Comex', 'Demais'],
      PJ: ['Cheque Emp/ADP', 'Cartões', 'Hipotecas', 'Autos', 'Agro', 'Capital de Giro', 'Comex', 'Conta Garantida', 'Confirming', 'Internegócios', 'Demais'],
      Corporate: ['Hipotecas', 'Autos', 'Agro', 'Capital de Giro', 'Comex', 'Conta Garantida', 'Confirming', 'Internegócios', 'Demais'],
      SCIB: ['Cartões', 'Hipotecas', 'Autos', 'Agro', 'Capital de Giro', 'Comex', 'Confirming', 'Internegócios', 'Demais'],
      Private: ['Cartões', 'CP', 'Hipotecas', 'Autos', 'Agro', 'Capital de Giro', 'Comex', 'Internegócios', 'Demais'],
      Consumer: ['CP', 'Autos', 'Demais']
  };

  // Tipos de captação por segmento
  const fundingTypes = {
      Especial: ['DAV', 'Contamax', 'CDB', 'Poupança', 'Demais'],
      Prospera: ['DAV', 'Contamax', 'CDB', 'Poupança', 'Demais'],
      Select: ['DAV', 'Contamax', 'CDB', 'Poupança', 'Demais'],
      PJ: ['DAV', 'Contamax', 'CDB', 'Poupança', 'Time Deposit', 'Demais'],
      Corporate: ['DAV', 'Contamax', 'CDB', 'Time Deposit', 'Demais'],
      SCIB: ['DAV', 'Contamax', 'CDB', 'Time Deposit', 'LF', 'Demais'],
      Private: ['DAV', 'Contamax', 'CDB', 'COE', 'Demais'],
      Consumer: ['Demais']
  };

  // Tipos de comissão por segmento
  const commissionTypes = {
      Especial: ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas C/C', 'Capitalização', 'Fidelização INSS', 'Esfera', 'Fundos', 'Previdência', 'Demais'],
      Prospera: ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas C/C', 'Capitalização', 'Tecban', 'Esfera', 'Fundos', 'Mercado de Capitais', 'Demais'],
      Select: ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas C/C', 'Capitalização', 'Esfera', 'AAA', 'Fundos', 'Previdência', 'Demais'],
      PJ: ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas C/C', 'Tarifas de Crédito', 'Cash', 'FX', 'Comex', 'Mercado de Capitais', 'Fiança', 'Demais'],
      Corporate: ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas de Crédito', 'FX', 'Comex', 'Mercado de Capitais', 'Fiança', 'Adquirência', 'Demais'],
      SCIB: ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas de Crédito', 'Comex', 'Mercado de Capitais', 'Adquirência', 'Fundos', 'Demais'],
      Private: ['Cartões', 'Seguros Open', 'Seguros Related', 'FX', 'Fiança', 'Fundos', 'Demais'],
      Consumer: ['Seguros Open', 'Seguros Related', 'Mercado de Capitais', 'Fundos', 'Demais']
  };

  // Estruturas de dados para armazenar informações
  // Dados de P&L (gerais e por segmento)
  let plDataTotal = {};
  let indicadoresTotal = {};
  const segmentPLData = {};
  const segmentIndicadores = {};

  let plDataTotalPPTO = {}; // Adicionar esta linha
  const segmentPLDataPPTO = {}; // Adicionar esta linha
  

  // Dados de carteiras, spreads etc.
  let dadosPlanilha = {
    credito: {},
    captacoes: {},
    comissoes: {}
  };

  // Armazenar os ajustes feitos por segmento
  const ajustes = {};
  segments.forEach(segment => {
    ajustes[segment] = { credito: {}, captacoes: {}, comissoes: {} };
  });

  // Função para normalizar valores numéricos
  function normalizarValorNumerico(valor) {
    if (valor === undefined || valor === null) return 0;
    if (typeof valor === 'number') return valor;
    if (typeof valor === 'string') {
      // Remover caracteres não numéricos exceto ponto e vírgula
      const valorLimpo = valor.replace(/[^\d.,\-]/g, '').replace(',', '.');
      return parseFloat(valorLimpo) || 0;
    }
    return 0;
  }

  // Função para preencher com dados padrão
  function preencherDadosPadrao() {
    console.log("Preenchendo com dados padrão...");
    
    // Preencher dados de crédito, captação e comissão para todos os segmentos
    segments.forEach(segment => {
      // Crédito
      creditTypes[segment].forEach(tipo => {
        if (!dadosPlanilha.credito[segment]) dadosPlanilha.credito[segment] = {};
        dadosPlanilha.credito[segment][tipo] = {
          carteira: 0,
          spread: (0).toFixed(2),
          provisao: 0
        };
      });
      
      // Captações
      fundingTypes[segment].forEach(tipo => {
        if (!dadosPlanilha.captacoes[segment]) dadosPlanilha.captacoes[segment] = {};
        dadosPlanilha.captacoes[segment][tipo] = {
          carteira: 0,
          spread: (0).toFixed(2)
        };
      });
      
      // Comissões
      commissionTypes[segment].forEach(tipo => {
        if (!dadosPlanilha.comissoes[segment]) dadosPlanilha.comissoes[segment] = {};
        dadosPlanilha.comissoes[segment][tipo] = {
          valor: 0
        };
      });
    });
    
    // Preencher dados de P&L
    plDataTotal = {
      MOB: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
      PDD: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
      MOL: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
      ORYP: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
      "Demais Ativos": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
      "Total Gastos": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
      BAI: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
      Impostos: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
      BDI: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 }
    };
    
    // Preencher indicadores
    indicadoresTotal = {
      "Taxa Impositiva": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
      "Eficiência": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
      RWA: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
      RORWA: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 }
    };
    
    // Preencher dados segmentados
    // segments.forEach(segment => {
    //   // Inicializar objetos se não existirem
    //   if (!segmentPLData[segment]) segmentPLData[segment] = {};
    //   if (!segmentIndicadores[segment]) segmentIndicadores[segment] = {};
      
    //   const factor = segment === 'Especial' ? 0.25 : 
    //                 segment === 'Prospera' ? 0.15 : 
    //                 segment === 'Select' ? 0.2 : 
    //                 segment === 'PJ' ? 0.15 : 
    //                 segment === 'Corporate' ? 0.1 : 
    //                 segment === 'SCIB' ? 0.05 : 
    //                 segment === 'Private' ? 0.07 : 0.03;
      
    //   Object.keys(plDataTotal).forEach(key => {
    //     segmentPLData[segment][key] = {
    //       real: plDataTotal[key].real * factor,
    //       simulado: plDataTotal[key].simulado * factor,
    //       atingimentoReal: plDataTotal[key].atingimentoReal * 0.98,
    //       atingimentoSimulado: plDataTotal[key].atingimentoSimulado * 0.98
    //     };
    //   });
      
    //   Object.keys(indicadoresTotal).forEach(key => {
    //     segmentIndicadores[segment][key] = {
    //       real: indicadoresTotal[key].real,
    //       simulado: indicadoresTotal[key].simulado,
    //       atingimentoReal: indicadoresTotal[key].atingimentoReal * 0.98,
    //       atingimentoSimulado: indicadoresTotal[key].atingimentoSimulado * 0.98
    //     };
    //   });
    // });
    
    console.log("Dados padrão preenchidos com sucesso.");
  }

  async function carregarDadosJSON() {
    try {
      console.log("Carregando dados do JSON...");
      
      // Carregar o JSON pré-processado
      const response = await fetch('dict_indicadores.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Dados JSON carregados com sucesso:", data);
      
      // Inicializar estruturas para cada segmento
      segments.forEach(segment => {
        segmentPLData[segment] = {
          MOB: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          PDD: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          MOL: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          ORYP: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          "Demais Ativos": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          "Total Gastos": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          BAI: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          Impostos: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          BDI: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        };
        
        segmentIndicadores[segment] = {
          "Taxa Impositiva": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          "Eficiência": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          RWA: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          "RORWA": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 }
        };
        
        // Inicializar dados para as abas
        dadosPlanilha.credito[segment] = {};
        dadosPlanilha.captacoes[segment] = {};
        dadosPlanilha.comissoes[segment] = {};
      });
      
      // Total para P&L e indicadores
      plDataTotal = {
        MOB: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        PDD: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        MOL: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        ORYP: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        "Demais Ativos": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        "Total Gastos": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        BAI: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        Impostos: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        BDI: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 }
      };
      
      indicadoresTotal = {
        "Taxa Impositiva": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        "Eficiência": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        RWA: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        RORWA: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 }
      };
      
      // Processar dados do JSON para as estruturas da aplicação
      segments.forEach(segment => {
        if (data[segment]) {
          // Processar dados de crédito
          if (data[segment].credito) {
            const creditData = data[segment].credito;
            
            // Para cada tipo de crédito no JSON, mapear para nossas estruturas
            Object.keys(creditData.carteira || {}).forEach(tipoCredito => {
              dadosPlanilha.credito[segment][tipoCredito] = {
                carteira: creditData.carteira[tipoCredito] || 0,
                spread: creditData.spread[tipoCredito] || 0,
                provisao: creditData.provisao[tipoCredito] || 0,
                margem: creditData.margem[tipoCredito] || 0,
                rwa: creditData.rwa[tipoCredito] || 0
              };
            });
          }
          
          // Processar dados de captações
          if (data[segment].captacoes) {
            const captacaoData = data[segment].captacoes;
            
            // Para cada tipo de captação no JSON, mapear para nossas estruturas
            Object.keys(captacaoData.carteira || {}).forEach(tipoCaptacao => {
              dadosPlanilha.captacoes[segment][tipoCaptacao] = {
                carteira: captacaoData.carteira[tipoCaptacao] || 0,
                spread: captacaoData.spread[tipoCaptacao] || 0,
                margem: captacaoData.margem[tipoCaptacao] || 0,
              };
            });
          }
          
          // Processar dados de comissões
          if (data[segment].comissoes) {
            // Para cada tipo de comissão no JSON, mapear para nossas estruturas
            Object.keys(data[segment].comissoes).forEach(tipoComissao => {
              dadosPlanilha.comissoes[segment][tipoComissao] = {
                valor: data[segment].comissoes[tipoComissao] || 0
              };
            });
          }
          
          // Processar dados da cascata (P&L)
          if (data[segment].cascada) {
            const cascadaData = data[segment].cascada;
            
            // Mapear para a estrutura de P&L
            if (cascadaData["MOB"] !== undefined) {
              segmentPLData[segment].MOB = {
                real: cascadaData["MOB"],
                simulado: cascadaData["MOB"],
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData.PDD !== undefined) {
              segmentPLData[segment].PDD = {
                real: cascadaData.PDD,
                simulado: cascadaData.PDD,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData.MOL !== undefined) {
              segmentPLData[segment].MOL = {
                real: cascadaData.MOL,
                simulado: cascadaData.MOL,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData.Oryp !== undefined) {
              segmentPLData[segment].ORYP = {
                real: cascadaData.Oryp,
                simulado: cascadaData.Oryp,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData["Demais Ativos"] !== undefined) {
              segmentPLData[segment]["Demais Ativos"] = {
                real: cascadaData["Demais Ativos"],
                simulado: cascadaData["Demais Ativos"],
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData["Total Gastos"] !== undefined) {
              segmentPLData[segment]["Total Gastos"] = {
                real: cascadaData["Total Gastos"],
                simulado: cascadaData["Total Gastos"],
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData.BAI !== undefined) {
              segmentPLData[segment].BAI = {
                real: cascadaData.BAI,
                simulado: cascadaData.BAI,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData.Impostos !== undefined) {
              segmentPLData[segment].Impostos = {
                real: cascadaData.Impostos,
                simulado: cascadaData.Impostos,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData.BDI !== undefined) {
              segmentPLData[segment].BDI = {
                real: cascadaData.BDI,
                simulado: cascadaData.BDI,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
          }
          
          // Calcular alguns indicadores básicos
          if (segmentPLData[segment].BAI && segmentPLData[segment].Impostos) {
            const bai = segmentPLData[segment].BAI.real;
            const impostos = segmentPLData[segment].Impostos.real;
            
            if (bai !== 0) {
              const taxaImpositiva = Math.abs((impostos / bai) * 100);
              segmentIndicadores[segment]["Taxa Impositiva"] = {
                real: taxaImpositiva,
                simulado: taxaImpositiva,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
          }
          
          if (segmentPLData[segment]["Total Gastos"] && segmentPLData[segment].MOB) {
            const gastos = Math.abs(segmentPLData[segment]["Total Gastos"].real);
            const mob = segmentPLData[segment].MOB.real;
            
            if (mob !== 0) {
              const eficiencia = (gastos / mob) * 100;
              segmentIndicadores[segment]["Eficiência"] = {
                real: eficiencia,
                simulado: eficiencia,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
          }
        }
      });
      
      // Processar dados consolidados (Total)
      if (data.Total && data.Total.cascada) {
        const cascadaTotal = data.Total.cascada;
        
        // Mapear para a estrutura de P&L Total
        Object.keys(cascadaTotal).forEach(key => {
          let plKey = key;
          
          // Mapeamento especial para alguns campos
          if (key === "MOB") plKey = "MOB";
          if (key === "Oryp") plKey = "ORYP";
          
          if (plDataTotal[plKey] !== undefined) {
            plDataTotal[plKey] = {
              real: cascadaTotal[key],
              simulado: cascadaTotal[key],
              atingimentoReal: 100,
              atingimentoSimulado: 100
            };
          }
        });
        
        // Calcular indicadores consolidados
        if (plDataTotal.BAI && plDataTotal.Impostos) {
          const baiTotal = plDataTotal.BAI.real;
          const impostosTotal = plDataTotal.Impostos.real;
          
          if (baiTotal !== 0) {
            const taxaImpositiva = Math.abs((impostosTotal / baiTotal) * 100);
            indicadoresTotal["Taxa Impositiva"] = {
              real: taxaImpositiva,
              simulado: taxaImpositiva,
              atingimentoReal: 100,
              atingimentoSimulado: 100
            };
          }
        }
        
        if (plDataTotal["Total Gastos"] && plDataTotal.MOB) {
          const gastosTotal = Math.abs(plDataTotal["Total Gastos"].real);
          const mobTotal = plDataTotal.MOB.real;
          
          if (mobTotal !== 0) {
            const eficiencia = (gastosTotal / mobTotal) * 100;
            indicadoresTotal["Eficiência"] = {
              real: eficiencia,
              simulado: eficiencia,
              atingimentoReal: 100,
              atingimentoSimulado: 100
            };
          }
        }
      }
      
      // Garantir que temos valores para todos os tipos necessários
      segments.forEach(segment => {
        // Para crédito
        creditTypes[segment].forEach(tipo => {
          if (!dadosPlanilha.credito[segment][tipo]) {
            dadosPlanilha.credito[segment][tipo] = {
              carteira: 1000,
              spread: 2.00,
              provisao: 100,
              margem: 100,
              rwa: 100
            };
          }
        });
        
        // Para captações
        fundingTypes[segment].forEach(tipo => {
          if (!dadosPlanilha.captacoes[segment][tipo]) {
            dadosPlanilha.captacoes[segment][tipo] = {
              carteira: 2000,
              spread: 1.00,
              margem: 100,
            };
          }
        });
        
        // Para comissões
        commissionTypes[segment].forEach(tipo => {
          if (!dadosPlanilha.comissoes[segment][tipo]) {
            dadosPlanilha.comissoes[segment][tipo] = {
              valor: 500
            };
          }
        });
      });
      
      console.log("Dados processados com sucesso:", {
        plDataTotal,
        indicadoresTotal,
        segmentPLData,
        segmentIndicadores,
        dadosPlanilha
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao carregar ou processar dados JSON:", error);
      preencherDadosPadrao();
      return false;
    }
  }

  // Função para formatar números
  function formatNumber(num) {
    if (isNaN(num)) return "0";
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

 // Modificação para a função loadCreditData
 function loadCreditData(segment) {
  const creditBody = document.getElementById('credito-body');
  if (!creditBody) {
    console.error("Elemento 'credito-body' não encontrado!");
    return;
  }
  
  creditBody.innerHTML = '';
  
  // Verificar se os tipos de crédito para o segmento existem
  const tiposCredito = creditTypes[segment] || [];
  if (tiposCredito.length === 0) {
    creditBody.innerHTML = '<tr><td colspan="6" style="text-align: center">Não há dados de crédito para este segmento</td></tr>';
    return;
  }
  
  // Percorrer os tipos de crédito para o segmento
  tiposCredito.forEach(tipo => {
    const row = document.createElement('tr');
    
    // Obter dados da planilha para este tipo (ou usar padrão)
    const data = dadosPlanilha.credito[segment][tipo] || {
      carteira: 0,
      spread: 0,
      provisao: 0,
      margem: 0,
      rwa: 0
    };
    
    // Recuperar valores simulados (ou usar valores reais como padrão)
    const carteiraSimulada = ajustes[segment].credito[`${tipo}_carteiraSimulada`] || data.carteira;
    const spreadSimulado = ajustes[segment].credito[`${tipo}_spreadSimulado`] || data.spread;
    const provisaoSimulada = ajustes[segment].credito[`${tipo}_provisaoSimulada`] || data.provisao;

    const margemSimulada = ajustes[segment].credito[`${tipo}_margemSimulada`] || data.margem;
    const rwaSimulado = ajustes[segment].credito[`${tipo}_rwaSimulado`] || data.rwa;

    
    row.innerHTML = `
      <td>${tipo}</td>
      <td>${formatNumber(data.carteira)}</td>
      <td><input type="number" class="carteira-simulada" value="${carteiraSimulada}" data-tipo="${tipo}" data-campo="carteiraSimulada"></td>
      <td>${data.spread}%</td>
      <td><div class="input-with-percent"><input type="number" step="0.01" class="spread-simulado" value="${spreadSimulado}" data-tipo="${tipo}" data-campo="spreadSimulado"><span class="percent-sign">%</span></div></td>
      <td>${formatNumber(data.provisao)}</td>
      <td><input type="number" class="provisao-simulada" value="${provisaoSimulada}" data-tipo="${tipo}" data-campo="provisaoSimulada"></td>
      <td>${formatNumber(data.margem)}</td>
      <td><input type="number" class="margem-simulada" value="${margemSimulada}" data-tipo="${tipo}" data-campo="margemSimulada"></td>
      <td>${formatNumber(data.rwa)}</td>
      <td><input type="number" class="rwa-simulado" value="${rwaSimulado}" data-tipo="${tipo}" data-campo="rwaSimulado"></td>
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

function updateCreditSimulatedValues(event, segment) {
  const input = event.target;
  const tipo = input.getAttribute('data-tipo');
  const campo = input.getAttribute('data-campo');
  const valor = parseFloat(input.value) || 0;
  
  // Salvar o valor no objeto de ajustes
  ajustes[segment].credito[`${tipo}_${campo}`] = valor;
  
  // Atualizar a lista de ajustes realizados
  atualizarAjustesRealizados();
  
  // Aqui você poderia adicionar lógica para atualizar cálculos derivados
  // se necessário, mas NÃO para atualizar o próprio campo de input
}

// Modificação para updateCreditSimulatedValues - remova a chave de fechamento extra
// function updateCreditSimulatedValues(event, segment) {
//   const input = event.target;
//   const row = input.closest('tr');
//   if (!row) return;
  
//   const tipo = input.getAttribute('data-tipo');
//   const campo = input.getAttribute('data-campo');
//   const valor = parseFloat(input.value) || 0;
  
//   // Salvar o ajuste no nosso objeto de ajustes
//   ajustes[segment].credito[`${tipo}_${campo}`] = valor;
  
//   try {
//     // Obter os elementos relevantes e atualizar
//     if (campo === 'carteira') {
//       const realValueCell = row.cells[1];
//       const simulatedValueCell = row.cells[3];
      
//       if (realValueCell && simulatedValueCell) {
//         const realValueText = realValueCell.textContent || '0';
//         const realValue = parseFloat(realValueText.replace(/\./g, '').replace(',', '.')) || 0;
//         const simulatedValue = realValue + valor;
//         simulatedValueCell.textContent = formatNumber(simulatedValue);
//       }
//     } 
//     else if (campo === 'spreadSimulado') {
//       // Aqui não precisamos calcular nada, apenas usar o valor diretamente
//       const simulatedValueCell = row.cells[6];
      
//       if (simulatedValueCell) {
//         simulatedValueCell.textContent = valor.toFixed(2) + '%';
//       }
//     }
//     else if (campo === 'provisao') {
//       const realValueCell = row.cells[7];
//       const simulatedValueCell = row.cells[9];
      
//       if (realValueCell && simulatedValueCell) {
//         const realValueText = realValueCell.textContent || '0';
//         const realValue = parseFloat(realValueText.replace(/\./g, '').replace(',', '.')) || 0;
//         const simulatedValue = realValue + valor;
//         simulatedValueCell.textContent = formatNumber(simulatedValue);
//       }
//     }
//   } catch (error) {
//     console.error("Erro ao atualizar valores simulados:", error);
//   }
  
//   // Atualizar a lista de ajustes realizados
//   atualizarAjustesRealizados();
// }
    
    // TODO: Atualizar o P&L com base nos novos valores
    // updatePL();


  
  // Função para atualizar valores simulados de captação
  // function updateFundingSimulatedValues(event, segment) {
  //   const input = event.target;
  //   const row = input.closest('tr');
  //   if (!row) return;
    
  //   const tipo = input.getAttribute('data-tipo');
  //   const campo = input.getAttribute('data-campo');
  //   const valor = parseFloat(input.value) || 0;
    
  //   // Salvar o ajuste
  //   ajustes[segment].captacoes[`${tipo}_${campo}`] = valor;
    
  //   try {
  //     if (campo === 'carteira') {
  //       const realValueCell = row.cells[1];
  //       const simulatedValueCell = row.cells[3];
        
  //       if (realValueCell && simulatedValueCell) {
  //         const realValueText = realValueCell.textContent || '0';
  //         const realValue = parseFloat(realValueText.replace(/\./g, '').replace(',', '.')) || 0;
  //         const simulatedValue = realValue + valor;
  //         simulatedValueCell.textContent = formatNumber(simulatedValue);
  //       }
  //     } 
  //     else if (campo === 'spread') {
  //       const realValueCell = row.cells[4];
  //       const simulatedValueCell = row.cells[6];
        
  //       if (realValueCell && simulatedValueCell) {
  //         const realValueText = realValueCell.textContent || '0%';
  //         const realValue = parseFloat(realValueText.replace('%', '')) || 0;
  //         const simulatedValue = realValue + valor;
  //         simulatedValueCell.textContent = simulatedValue.toFixed(2) + '%';
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Erro ao atualizar valores simulados de captação:", error);
  //   }
    
  //   // Atualizar a lista de ajustes realizados
  //   atualizarAjustesRealizados();
    
  //   // TODO: Atualizar o P&L
  //   // updatePL();
  // }

  // Função para carregar dados de comissão
  function loadCommissionData(segment) {
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
      const data = dadosPlanilha.comissoes[segment][tipo] || {
        valor: 0
      };
      
      // Recuperar valor simulado
      const valorSimulado = ajustes[segment].comissoes[`${tipo}_valorSimulado`] || data.valor;
      
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
  
  function updateCommissionSimulatedValues(event, segment) {
    const input = event.target;
    const tipo = input.getAttribute('data-tipo');
    const campo = input.getAttribute('data-campo');
    const valor = parseFloat(input.value) || 0;
    
    // Salvar o valor simulado
    ajustes[segment].comissoes[`${tipo}_${campo}`] = valor;
    
    // Atualizar a lista de ajustes realizados
    atualizarAjustesRealizados();
  }

  // Função para atualizar valores simulados de comissão
  function updateCommissionSimulatedValues(event, segment) {
    const input = event.target;
    const row = input.closest('tr');
    if (!row) return;
    
    const tipo = input.getAttribute('data-tipo');
    const campo = input.getAttribute('data-campo');
    const valor = parseFloat(input.value) || 0;
    
    // Salvar o ajuste
    ajustes[segment].comissoes[`${tipo}_valor`] = valor;
    
    try {
      const realValueCell = row.cells[1];
      const simulatedValueCell = row.cells[3];
      
      if (realValueCell && simulatedValueCell) {
        const realValueText = realValueCell.textContent || '0';
        const realValue = parseFloat(realValueText.replace(/\./g, '').replace(',', '.')) || 0;
        const simulatedValue = realValue + valor;
        simulatedValueCell.textContent = formatNumber(simulatedValue);
      }
    } catch (error) {
      console.error("Erro ao atualizar valores simulados de comissão:", error);
    }
    
    // Atualizar a lista de ajustes realizados
    atualizarAjustesRealizados();
    
    // TODO: Atualizar o P&L
    // updatePL();
  }

  // Função para atualizar as listas de ajustes realizados
  function atualizarAjustesRealizados() {
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
        if (!ajustes[segment]) return;
        
        // Ajustes de Crédito
        if (ajustes[segment].credito && creditTypes[segment]) {
          creditTypes[segment].forEach(tipo => {
            // Verificar carteira simulada
            const carteiraSimulada = parseFloat(ajustes[segment].credito[`${tipo}_carteiraSimulada`] || 0);
            const carteiraReal = dadosPlanilha.credito[segment][tipo]?.carteira || 0;
            if (carteiraSimulada !== 0 && carteiraSimulada !== carteiraReal) {
              temAjusteCredito = true;
              const diferenca = carteiraSimulada - carteiraReal;
              adicionarItemAjuste('credito', tipo, segment, 'Carteira', diferenca, false, `${formatNumber(carteiraReal)} → ${formatNumber(carteiraSimulada)}`);
            }
            
            // Verificar spread simulado
            const spreadSimulado = parseFloat(ajustes[segment].credito[`${tipo}_spreadSimulado`] || 0);
            const spreadReal = dadosPlanilha.credito[segment][tipo]?.spread || 0;
            if (spreadSimulado !== 0 && spreadSimulado !== spreadReal) {
              temAjusteCredito = true;
              const diferenca = spreadSimulado - spreadReal;
              adicionarItemAjuste('credito', tipo, segment, 'Spread', diferenca, true, `${spreadReal}% → ${spreadSimulado}%`);
            }
            
            // Verificar provisão simulada
            const provisaoSimulada = parseFloat(ajustes[segment].credito[`${tipo}_provisaoSimulada`] || 0);
            const provisaoReal = dadosPlanilha.credito[segment][tipo]?.provisao || 0;
            if (provisaoSimulada !== 0 && provisaoSimulada !== provisaoReal) {
              temAjusteCredito = true;
              const diferenca = provisaoSimulada - provisaoReal;
              adicionarItemAjuste('credito', tipo, segment, 'Provisão', diferenca, false, `${formatNumber(provisaoReal)} → ${formatNumber(provisaoSimulada)}`);
            }
          });
        }
        
        // Ajustes de Captações
        if (ajustes[segment].captacoes && fundingTypes[segment]) {
          fundingTypes[segment].forEach(tipo => {
            // Verificar carteira simulada
            const carteiraSimulada = parseFloat(ajustes[segment].captacoes[`${tipo}_carteiraSimulada`] || 0);
            const carteiraReal = dadosPlanilha.captacoes[segment][tipo]?.carteira || 0;
            if (carteiraSimulada !== 0 && carteiraSimulada !== carteiraReal) {
              temAjusteCaptacoes = true;
              const diferenca = carteiraSimulada - carteiraReal;
              adicionarItemAjuste('captacoes', tipo, segment, 'Carteira', diferenca, false, `${formatNumber(carteiraReal)} → ${formatNumber(carteiraSimulada)}`);
            }
            
            // Verificar spread simulado
            const spreadSimulado = parseFloat(ajustes[segment].captacoes[`${tipo}_spreadSimulado`] || 0);
            const spreadReal = dadosPlanilha.captacoes[segment][tipo]?.spread || 0;
            if (spreadSimulado !== 0 && spreadSimulado !== spreadReal) {
              temAjusteCaptacoes = true;
              const diferenca = spreadSimulado - spreadReal;
              adicionarItemAjuste('captacoes', tipo, segment, 'Spread', diferenca, true, `${spreadReal}% → ${spreadSimulado}%`);
            }
          });
        }
        
        // Ajustes de Comissões
        if (ajustes[segment].comissoes && commissionTypes[segment]) {
          commissionTypes[segment].forEach(tipo => {
            // Verificar valor simulado
            const valorSimulado = parseFloat(ajustes[segment].comissoes[`${tipo}_valorSimulado`] || 0);
            const valorReal = dadosPlanilha.comissoes[segment][tipo]?.valor || 0;
            if (valorSimulado !== 0 && valorSimulado !== valorReal) {
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

  // Função para carregar dados de P&L
  function loadPLData(segment = 'total') {
    const plBody = document.getElementById('pl-body');
    if (!plBody) {
      console.error("Elemento 'pl-body' não encontrado!");
      return;
    }
    
    plBody.innerHTML = '';
    
    // Determinar quais dados usar
    let dataToUse;
    if (segment === 'total') {
      dataToUse = plDataTotal;
      // Atualizar botão de visualização
      document.getElementById('btn-view-total')?.classList.add('active');
      document.getElementById('btn-view-segment')?.classList.remove('active');
    } else {
      dataToUse = segmentPLData[segment];
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
    
    Object.entries(dataToUse).forEach(([key, data]) => {
      const row = document.createElement('tr');
      
      if (key === 'MOL' || key === 'BAI' || key === 'BDI') {
        row.classList.add('highlight');
      }
      
      row.innerHTML = `
        <td>${key}</td>
        <td>${formatNumber(data.real)}</td>
        <td>${formatNumber(data.simulado)}</td>
        <td>${data.atingimentoReal.toFixed(1)}%</td>
        <td>${data.atingimentoSimulado.toFixed(1)}%</td>
      `;
      
      plBody.appendChild(row);
    });
  }

  // Função para carregar dados de Indicadores
  function loadIndicadoresData(segment = 'total') {
    const indicadoresBody = document.getElementById('indicadores-body');
    if (!indicadoresBody) {
      console.error("Elemento 'indicadores-body' não encontrado!");
      return;
    }
    
    indicadoresBody.innerHTML = '';
    
    // Determinar quais dados usar
    let dataToUse = (segment === 'total') ? indicadoresTotal : segmentIndicadores[segment];
    
    // Se não houver dados para o segmento selecionado
    if (!dataToUse) {
      indicadoresBody.innerHTML = '<tr><td colspan="5" style="text-align: center">Indicadores não disponíveis para este segmento</td></tr>';
      return;
    }
    
    Object.entries(dataToUse).forEach(([key, data]) => {
      const row = document.createElement('tr');
      
      // Verificar se é RWA ou RORWA
      if (key === 'RWA' || key === 'RORWA') {
        // Para RWA e RORWA, tratamento especial
        const realValue = key === 'RWA' ? formatNumber(data.real) : data.real.toFixed(1) + '%';
        const simuladoValue = key === 'RWA' ? formatNumber(data.simulado) : data.simulado.toFixed(1) + '%';
        
        row.innerHTML = `
          <td>${key}</td>
          <td>${realValue}</td>
          <td>${simuladoValue}</td>
          <td>-</td>
          <td>-</td>
        `;
      } else {
        // Para outros indicadores, tratamento normal
        row.innerHTML = `
          <td>${key}</td>
          <td>${data.real.toFixed(1)}%</td>
          <td>${data.simulado.toFixed(1)}%</td>
          <td>${data.atingimentoReal.toFixed(1)}%</td>
          <td>${data.atingimentoSimulado.toFixed(1)}%</td>
        `;
      }
      
      indicadoresBody.appendChild(row);
    });
  }

  // Função para configurar os botões de visualização do P&L
  function setupPLViewButtons() {
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

  // Configurar o sistema de abas
  function setupTabSystem() {
    const tabCredito = document.querySelector('[data-tab="credito"]');
    const tabCaptacoes = document.querySelector('[data-tab="captacoes"]');
    const tabComissoes = document.querySelector('[data-tab="comissoes"]');
    
    if (!tabCredito || !tabCaptacoes || !tabComissoes) {
      console.error("Botões de abas não encontrados!");
      return;
    }
    
    tabCredito.addEventListener('click', function() {
      switchTab('credito');
    });
    
    tabCaptacoes.addEventListener('click', function() {
      switchTab('captacoes');
    });
    
    tabComissoes.addEventListener('click', function() {
      switchTab('comissoes');
    });
  }

  // Função para alternar entre abas
  function switchTab(tabId) {
    // Esconder todas as abas
    const tabContents = document.querySelectorAll('.tab-content');
    if (tabContents) {
      tabContents.forEach(tab => {
        tab.classList.remove('active');
      });
    }
    
    // Remover classe active de todos os botões
    const tabButtons = document.querySelectorAll('.tab-button');
    if (tabButtons) {
      tabButtons.forEach(button => {
        button.classList.remove('active');
      });
    }
    
    // Mostrar a aba selecionada
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
      activeTab.classList.add('active');
    }
    
    // Adicionar classe active ao botão clicado
    const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  function loadFundingData(segment) {
    const captacoesBody = document.getElementById('captacoes-body');
    if (!captacoesBody) {
      console.error("Elemento 'captacoes-body' não encontrado!");
      return;
    }
    
    captacoesBody.innerHTML = '';
    
    // Verificar se há tipos de captação para este segmento
    const tiposCaptacao = fundingTypes[segment] || [];
    if (tiposCaptacao.length === 0) {
      captacoesBody.innerHTML = '<tr><td colspan="4" style="text-align: center">Não há dados de captação para este segmento</td></tr>';
      return;
    }
    
    // Percorrer os tipos de captação
    tiposCaptacao.forEach(tipo => {
      const row = document.createElement('tr');
      
      // Obter dados da planilha para este tipo (ou usar padrão)
      const data = dadosPlanilha.captacoes[segment][tipo] || {
        carteira: 0,
        spread: 0,
        margem: 0,
      };
      
      // Recuperar valores simulados
      const carteiraSimulada = ajustes[segment].captacoes[`${tipo}_carteiraSimulada`] || data.carteira;
      const spreadSimulado = ajustes[segment].captacoes[`${tipo}_spreadSimulado`] || data.spread;
      const margemSimulada = ajustes[segment].captacoes[`${tipo}_margemSimulada`] || data.margem;
      
      row.innerHTML = `
        <td>${tipo}</td>
        <td>${formatNumber(data.carteira)}</td>
        <td><input type="number" class="carteira-simulada" value="${carteiraSimulada}" data-tipo="${tipo}" data-campo="carteiraSimulada"></td>
        <td>${data.spread}%</td>
        <td><div class="input-with-percent"><input type="number" step="0.01" class="spread-simulado" value="${spreadSimulado}" data-tipo="${tipo}" data-campo="spreadSimulado"><span class="percent-sign">%</span></div></td>
        <td>${formatNumber(data.margem)}</td>
        <td><input type="number" class="margem-simulada" value="${margemSimulada}" data-tipo="${tipo}" data-campo="margemSimulada"></td>
      `;
      
      captacoesBody.appendChild(row);
    });
    
    // Adicionar event listeners
    const inputs = captacoesBody.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', function(event) {
        updateFundingSimulatedValues(event, segment);
      });
    });
  }
  
  // function updateFundingSimulatedValues(event, segment) {
  //   const input = event.target;
  //   const row = input.closest('tr');
  //   if (!row) return;
    
  //   const tipo = input.getAttribute('data-tipo');
  //   const campo = input.getAttribute('data-campo');
  //   const valor = parseFloat(input.value) || 0;
    
  //   // Salvar o valor simulado
  //   ajustes[segment].captacoes[`${tipo}_${campo}`] = valor;
    
  //   // Atualizar a lista de ajustes realizados
  //   atualizarAjustesRealizados();
  // }
  
  // E a função de atualização:
  function updateFundingSimulatedValues(event, segment) {
    const input = event.target;
    const row = input.closest('tr');
    if (!row) return;
    
    const tipo = input.getAttribute('data-tipo');
    const campo = input.getAttribute('data-campo');
    const valor = parseFloat(input.value) || 0;
    
    // Salvar o ajuste
    ajustes[segment].captacoes[`${tipo}_${campo}`] = valor;
    
    try {
      if (campo === 'carteira') {
        const realValueCell = row.cells[1];
        const simulatedValueCell = row.cells[3];
        
        if (realValueCell && simulatedValueCell) {
          const realValueText = realValueCell.textContent || '0';
          const realValue = parseFloat(realValueText.replace(/\./g, '').replace(',', '.')) || 0;
          const simulatedValue = realValue + valor;
          simulatedValueCell.textContent = formatNumber(simulatedValue);
        }
      } 
      else if (campo === 'spreadSimulado') {
        // O div com a classe input-with-percent está na célula 4
        const simulatedValueCell = row.cells[4].querySelector('.input-with-percent');
        
        if (simulatedValueCell) {
          // Atualiza o valor do input dentro do div
          simulatedValueCell.querySelector('input').value = valor.toFixed(2);
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar valores simulados de captação:", error);
    }
    
    // Atualizar a lista de ajustes realizados
    atualizarAjustesRealizados();
  }

  // Função para inicializar os botões de ação
  function setupActionButtons() {
    const btnOtimizar = document.getElementById('btn-otimizar');
    const btnLimparAjustes = document.getElementById('btn-limpar-ajustes');
    
    // Verificar se o botão Limpar Ajustes existe
    if (btnLimparAjustes) {
      btnLimparAjustes.addEventListener('click', function() {
        // Confirmar antes de limpar
        if (confirm('Tem certeza que deseja limpar todos os ajustes realizados?')) {
          const segmentoAtual = document.getElementById('segment').value;
          
          // Limpar objeto de ajustes para TODOS os segmentos
          segments.forEach(segment => {
            ajustes[segment] = { 
              credito: {}, 
              captacoes: {}, 
              comissoes: {} 
            };
          });
          
          // Recarregar os dados do segmento atual (que está sendo visualizado)
          loadCreditData(segmentoAtual);
          loadFundingData(segmentoAtual);
          loadCommissionData(segmentoAtual);
          
          // Atualizar a lista de ajustes realizados
          atualizarAjustesRealizados();
          
          // Feedback ao usuário
          alert('Todos os ajustes foram removidos de todos os segmentos!');
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

  async function initialize() {
    console.log("Inicializando o aplicativo...");
    
    try {
      const segmentSelect = document.getElementById('segment');
      if (!segmentSelect) {
        console.error("Elemento 'segment' não encontrado!");
        return;
      }
      
      // Preencher seletor de segmentos
      segments.forEach(segment => {
        const option = document.createElement('option');
        option.value = segment;
        option.textContent = segment;
        segmentSelect.appendChild(option);
      });
      
      // Carregar dados do JSON
      console.log("Tentando carregar dados do JSON...");
      await carregarDadosJSON();
      
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
      
      // CONFIGURAÇÃO DO UPLOAD DE ARQUIVO
      const fileInput = document.getElementById('fileInput');
      const statusElement = document.getElementById('upload-status');
      const btnProcessar = document.getElementById('btn-processar-arquivo');
  
      if (fileInput && statusElement && btnProcessar) {
        fileInput.addEventListener('change', function(e) {
          const fileName = e.target.files[0]?.name;
          if (fileName) {
            statusElement.textContent = `Arquivo selecionado: ${fileName}`;
            statusElement.className = 'upload-status';
            btnProcessar.disabled = false;
          } else {
            statusElement.textContent = 'Nenhum arquivo selecionado';
            statusElement.className = 'upload-status';
            btnProcessar.disabled = true;
          }
        });
        
        btnProcessar.addEventListener('click', function() {
          const file = fileInput.files[0];
          if (!file) {
            statusElement.textContent = 'Por favor, selecione um arquivo primeiro.';
            statusElement.className = 'upload-status error';
            return;
          }
          
          statusElement.textContent = 'Processando arquivo...';
          statusElement.className = 'upload-status';
          
          // Leitura e processamento do arquivo
          const reader = new FileReader();
          reader.onload = function(e) {
            try {
              console.log("Arquivo lido com sucesso, iniciando processamento");
              const jsonString = e.target.result;
              const data = JSON.parse(jsonString);
              
              // Recarregar os dados da aplicação com o novo JSON
              const segmentoAtual = document.getElementById('segment').value;
              
              // Processar o JSON
              processarDadosJSON(data);
              
              // Recarregar visualizações
              loadCreditData(segmentoAtual);
              loadFundingData(segmentoAtual);
              loadCommissionData(segmentoAtual);
              loadPLData('total');
              loadIndicadoresData('total');
              atualizarAjustesRealizados();
              
              statusElement.textContent = 'Arquivo processado com sucesso!';
              statusElement.className = 'upload-status success';
            } catch (error) {
              console.error("Erro ao processar o arquivo:", error);
              statusElement.textContent = 'Erro ao processar o arquivo. Verifique se é um JSON válido.';
              statusElement.className = 'upload-status error';
            }
          };
          
          reader.onerror = function() {
            statusElement.textContent = 'Erro ao ler o arquivo.';
            statusElement.className = 'upload-status error';
          };
          
          // Ler como texto para JSON
          reader.readAsText(file);
        });
      }
      
      console.log("Aplicativo inicializado com sucesso!");
    } catch (error) {
      console.error("Erro ao inicializar o aplicativo:", error);
    }
  }
  
  // Função para processar dados JSON carregados
  function processarDadosJSON(data) {
    try {
      console.log("Processando dados JSON...");
      
      // Inicializar estruturas para cada segmento
      segments.forEach(segment => {
        segmentPLData[segment] = {
          MOB: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          PDD: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          MOL: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          ORYP: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          "Demais Ativos": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          "Total Gastos": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          BAI: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          Impostos: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          BDI: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 }
        };

        segmentPLDataPPTO[segment] = {
            MOB_ppto: 0,
            PDD_ppto: 0,
            MOL_ppto: 0,
            ORYP_ppto: 0,
            "Demais Ativos_ppto": 0,
            "Total Gastos_ppto": 0,
            BAI_ppto: 0,
            Impostos_ppto: 0,
            BDI_ppto: 0,
            "Taxa Impositiva": 0,
            "Eficiência": 0
        };
        
        segmentIndicadores[segment] = {
          "Taxa Impositiva": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          "Eficiência": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          RWA: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
          RORWA: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 }
        };
        
        // Inicializar dados para as abas
        dadosPlanilha.credito[segment] = {};
        dadosPlanilha.captacoes[segment] = {};
        dadosPlanilha.comissoes[segment] = {};
      });
      
      // Inicializar totais
      plDataTotal = {
        MOB: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        PDD: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        MOL: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        ORYP: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        "Demais Ativos": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        "Total Gastos": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        BAI: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        Impostos: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        BDI: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 }
      };

      plDataTotalPPTO = {
          MOB_ppto: 0,
          PDD_ppto: 0,
          MOL_ppto: 0,
          ORYP_ppto: 0,
          "Demais Ativos_ppto": 0,
          "Total Gastos_ppto": 0,
          BAI_ppto: 0,
          Impostos_ppto: 0,
          BDI_ppto: 0,
          "Taxa Impositiva": 0,
          "Eficiência": 0
      };
      
      indicadoresTotal = {
        "Taxa Impositiva": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        "Eficiência": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        RWA: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
        RORWA: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 }
      };
      
      // Processar dados do JSON para as estruturas da aplicação
      segments.forEach(segment => {
        if (data[segment]) {
          // Processar dados de crédito
          if (data[segment].credito) {
            const creditData = data[segment].credito;
            
            // Para cada tipo de crédito no JSON, mapear para nossas estruturas
            Object.keys(creditData.carteira || {}).forEach(tipoCredito => {
              dadosPlanilha.credito[segment][tipoCredito] = {
                carteira: creditData.carteira[tipoCredito] || 0,
                spread: creditData.spread[tipoCredito] || 0,
                provisao: creditData.margem[tipoCredito] || 0

                


              };
            });
          }
          
          // Processar dados de captações
          if (data[segment].captacoes) {
            const captacaoData = data[segment].captacoes;
            
            // Para cada tipo de captação no JSON, mapear para nossas estruturas
            Object.keys(captacaoData.carteira || {}).forEach(tipoCaptacao => {
              dadosPlanilha.captacoes[segment][tipoCaptacao] = {
                carteira: captacaoData.carteira[tipoCaptacao] || 0,
                spread: captacaoData.spread[tipoCaptacao] || 0
              };
            });
          }
          
          // Processar dados de comissões
          if (data[segment].comissoes) {
            // Para cada tipo de comissão no JSON, mapear para nossas estruturas
            Object.keys(data[segment].comissoes).forEach(tipoComissao => {
              dadosPlanilha.comissoes[segment][tipoComissao] = {
                valor: data[segment].comissoes[tipoComissao] || 0
              };
            });
          }
          
          // Processar dados da cascata (P&L)
          if (data[segment].cascada) {
            const cascadaData = data[segment].cascada;
            
            // Mapear para a estrutura de P&L
            if (cascadaData["MOB"] !== undefined) {
              segmentPLData[segment].MOB = {
                real: cascadaData["MOB"],
                simulado: cascadaData["MOB"],
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData.PDD !== undefined) {
              segmentPLData[segment].PDD = {
                real: cascadaData.PDD,
                simulado: cascadaData.PDD,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData.MOL !== undefined) {
              segmentPLData[segment].MOL = {
                real: cascadaData.MOL,
                simulado: cascadaData.MOL,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData.Oryp !== undefined) {
              segmentPLData[segment].ORYP = {
                real: cascadaData.Oryp,
                simulado: cascadaData.Oryp,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData["Demais Ativos"] !== undefined) {
              segmentPLData[segment]["Demais Ativos"] = {
                real: cascadaData["Demais Ativos"],
                simulado: cascadaData["Demais Ativos"],
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData["Total Gastos"] !== undefined) {
              segmentPLData[segment]["Total Gastos"] = {
                real: cascadaData["Total Gastos"],
                simulado: cascadaData["Total Gastos"],
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData.BAI !== undefined) {
              segmentPLData[segment].BAI = {
                real: cascadaData.BAI,
                simulado: cascadaData.BAI,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData.Impostos !== undefined) {
              segmentPLData[segment].Impostos = {
                real: cascadaData.Impostos,
                simulado: cascadaData.Impostos,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
            
            if (cascadaData.BDI !== undefined) {
              segmentPLData[segment].BDI = {
                real: cascadaData.BDI,
                simulado: cascadaData.BDI,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
          }
          
          // Calcular alguns indicadores básicos
          if (segmentPLData[segment].BAI && segmentPLData[segment].Impostos) {
            const bai = segmentPLData[segment].BAI.real;
            const impostos = segmentPLData[segment].Impostos.real;
            
            if (bai !== 0) {
              const taxaImpositiva = Math.abs((impostos / bai) * 100);
              segmentIndicadores[segment]["Taxa Impositiva"] = {
                real: taxaImpositiva,
                simulado: taxaImpositiva,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
          }
          
          if (segmentPLData[segment]["Total Gastos"] && segmentPLData[segment].MOB) {
            const gastos = Math.abs(segmentPLData[segment]["Total Gastos"].real);
            const mob = segmentPLData[segment].MOB.real;
            
            if (mob !== 0) {
              const eficiencia = (gastos / mob) * 100;
              segmentIndicadores[segment]["Eficiência"] = {
                real: eficiencia,
                simulado: eficiencia,
                atingimentoReal: 100,
                atingimentoSimulado: 100
              };
            }
          }
        }
      });
      
      // Processar dados consolidados (Total)
      if (data.Total && data.Total.cascada) {
        const cascadaTotal = data.Total.cascada;
        
        // Mapear para a estrutura de P&L Total
        Object.keys(cascadaTotal).forEach(key => {
          let plKey = key;
          
          // Mapeamento especial para alguns campos
          if (key === "MOB") plKey = "MOB";
          if (key === "Oryp") plKey = "ORYP";
          
          if (plDataTotal[plKey] !== undefined) {
            plDataTotal[plKey] = {
              real: cascadaTotal[key],
              simulado: cascadaTotal[key],
              atingimentoReal: 100,
              atingimentoSimulado: 100
            };
          }
        });
        
        // Calcular indicadores consolidados
        if (plDataTotal.BAI && plDataTotal.Impostos) {
          const baiTotal = plDataTotal.BAI.real;
          const impostosTotal = plDataTotal.Impostos.real;
          
          if (baiTotal !== 0) {
            const taxaImpositiva = Math.abs((impostosTotal / baiTotal) * 100);
            indicadoresTotal["Taxa Impositiva"] = {
              real: taxaImpositiva,
              simulado: taxaImpositiva,
              atingimentoReal: 100,
              atingimentoSimulado: 100
            };
          }
        }
        
        if (plDataTotal["Total Gastos"] && plDataTotal.MOB) {
          const gastosTotal = Math.abs(plDataTotal["Total Gastos"].real);
          const mobTotal = plDataTotal.MOB.real;
          
          if (mobTotal !== 0) {
            const eficiencia = (gastosTotal / mobTotal) * 100;
            indicadoresTotal["Eficiência"] = {
              real: eficiencia,
              simulado: eficiencia,
              atingimentoReal: 100,
              atingimentoSimulado: 100
            };
          }
        }
      }
      
      // Garantir que temos valores para todos os tipos necessários
      segments.forEach(segment => {
        // Para crédito
        creditTypes[segment].forEach(tipo => {
          if (!dadosPlanilha.credito[segment][tipo]) {
            dadosPlanilha.credito[segment][tipo] = {
              carteira: 1000,
              spread: 2.00,
              provisao: 100
            };
          }
        });
        
        // Para captações
        fundingTypes[segment].forEach(tipo => {
          if (!dadosPlanilha.captacoes[segment][tipo]) {
            dadosPlanilha.captacoes[segment][tipo] = {
              carteira: 2000,
              spread: 1.00
            };
          }
        });
        
        // Para comissões
        commissionTypes[segment].forEach(tipo => {
          if (!dadosPlanilha.comissoes[segment][tipo]) {
            dadosPlanilha.comissoes[segment][tipo] = {
              valor: 500
            };
          }
        });
      });
      
      console.log("Dados processados com sucesso!");
    } catch (error) {
      console.error("Erro ao processar dados JSON:", error);
    }
  }
  
  // Iniciar o app
  initialize();
 });