/**
 * Módulo de simulação financeira
 * Contém a lógica principal para os cálculos e simulações
 */

import { formatarValor, obterTiposProduto } from './dados.js';
import { atualizarTabelaCredito, atualizarTabelaCaptacoes, atualizarTabelaComissoes, 
         atualizarTabelaCascada, atualizarListaAjustes } from './ui.js';

// Estado global do simulador
let estadoSimulador = {
    dados: null,
    segmentoAtual: 'especial',
    visualizacaoCascada: 'total', // 'total' ou 'segment'
    ajustes: {
        credito: {},
        captacoes: {},
        comissoes: {}
    },
    somaDiferencas: {
        margem: 0,
        provisao: 0,
        rwa: 0
    }
};

// Inicializa o simulador com os dados carregados
export function inicializarSimulador(dados) {
    estadoSimulador.dados = dados;
    estadoSimulador.segmentoAtual = 'especial'; // Segmento padrão inicial
    
    // Limpa o estado de ajustes
    limparAjustes();
    
    // Atualiza a interface com os dados iniciais
    atualizarDadosReais();
    atualizarDadosSimulados();
}

// Obtém o estado atual do simulador
export function obterEstadoSimulador() {
    return estadoSimulador;
}

// Atualiza o segmento selecionado
export function atualizarSegmento(segmento) {
  estadoSimulador.segmentoAtual = segmento;
  
  // Atualiza o botão de visualização de cascada para o segmento selecionado
  const btnViewSegment = document.getElementById('btn-view-segment');
  if (btnViewSegment) {
      // Mapeamento para formatar corretamente os nomes dos segmentos
      const formatacaoSegmentos = {
          "pj": "PJ",
          "scib": "SCIB",
          "private": "Private",
          "select": "Select",
          "especial": "Especial",
          "prospera": "Prospera",
          "consumer": "Consumer",
          "corporate": "Corporate"
      };
      
      // Atualiza o texto do botão com o nome formatado do segmento
      btnViewSegment.textContent = formatacaoSegmentos[segmento.toLowerCase()] || 
                                 (segmento.charAt(0).toUpperCase() + segmento.slice(1));
      
      // Se a visualização atual é "segment", atualiza para o novo segmento
      if (estadoSimulador.visualizacaoCascada === 'segment') {
          // Força uma atualização da visualização da cascada
          atualizarVisualizacaoCascada('segment');
      }
  }
  
  // IMPORTANTE: Recalcular as somas de diferenças para o novo segmento
  atualizarSomaDiferencas();
  
  // Atualiza a interface com os novos dados
  atualizarDadosReais();
  atualizarDadosSimulados();
}

// Atualiza a visualização da cascada (total ou segmento)
export function atualizarVisualizacaoCascada(visualizacao) {
    estadoSimulador.visualizacaoCascada = visualizacao;
    
    // Atualiza apenas a tabela de cascada
    atualizarTabelaCascada(
        obterDadosCascadaReais(), 
        obterDadosCascadaSimulados()
    );
}

// Verifica se existem ajustes feitos
export function temAjustes() {
    const { ajustes } = estadoSimulador;
    
    return Object.keys(ajustes.credito).length > 0 || 
           Object.keys(ajustes.captacoes).length > 0 || 
           Object.keys(ajustes.comissoes).length > 0;
}

// Limpa todos os ajustes
export function limparAjustes() {
    estadoSimulador.ajustes = {
        credito: {},
        captacoes: {},
        comissoes: {}
    };
    
    estadoSimulador.somaDiferencas = {
        margem: 0,
        provisao: 0,
        rwa: 0
    };
    
    // Atualiza a interface
    atualizarListaAjustes();
    atualizarDadosReais();  
    atualizarDadosSimulados();

  //   document.querySelectorAll('input.carteira-simulada').forEach(input => {
  //     input.value = ''; // Define como vazio, não como 0
    
  // });
}

// Registra um ajuste de crédito
export function registrarAjusteCredito(tipoProduto, campo, valorReal, valorSimulado) {
    const { segmentoAtual } = estadoSimulador;
    // Chave composta com segmento e tipo para evitar conflitos entre segmentos (ERRO 7)
    const chaveComposta = `${segmentoAtual}-${tipoProduto}`;
    
    if (!estadoSimulador.ajustes.credito[chaveComposta]) {
        estadoSimulador.ajustes.credito[chaveComposta] = {};
    }
    
    const diferenca = valorSimulado - valorReal;
    
    // Apenas registra ajustes com diferença diferente de zero (ERRO 4)
    if (diferenca !== 0) {
        estadoSimulador.ajustes.credito[chaveComposta][campo] = {
            segmento: segmentoAtual, // Armazena o segmento para exibição (ERRO 3)
            real: valorReal,
            simulado: valorSimulado,
            diferenca: diferenca
        };
    } else {
        // Remove ajustes com diferença zero
        if (estadoSimulador.ajustes.credito[chaveComposta][campo]) {
            delete estadoSimulador.ajustes.credito[chaveComposta][campo];
        }
        
        // Remove o objeto do tipo se estiver vazio
        if (Object.keys(estadoSimulador.ajustes.credito[chaveComposta]).length === 0) {
            delete estadoSimulador.ajustes.credito[chaveComposta];
        }
    }

    if (campo === 'carteira') {
        const dadosCredito = obterDadosCreditoReais();
        const itemCredito = dadosCredito.find(item => item.tipo === tipoProduto);
        
        if (itemCredito && itemCredito.carteira > 0) {
            const novaProvisao = (itemCredito.provisao / itemCredito.carteira) * valorSimulado;
            
            // Atualiza o input de provisão na interface
            const tbody = document.getElementById('credito-body');
            const row = [...tbody.querySelectorAll('tr')].find(r => r.getAttribute('data-tipo') === tipoProduto);
            
            if (row) {
                const inputProvisao = row.querySelector('input[name="provisao"]');
                if (inputProvisao) {
                    // Atualiza o valor do input de provisão com a diferença calculada
                    inputProvisao.value = Math.round(novaProvisao - itemCredito.provisao);
                    // inputProvisao.value = Math.round(novaProvisao);
                    // Dispara um evento de input para atualizar o ajuste de provisão
                    const event = new Event('input', { bubbles: true });
                    inputProvisao.dispatchEvent(event);
                }
            }
        }
    }
    
    // Atualiza somas de diferenças
    atualizarSomaDiferencas();
    
    // Atualiza a interface
    atualizarListaAjustes();
    atualizarDadosSimulados();
}

// Registra um ajuste de captação
export function registrarAjusteCaptacao(tipoProduto, campo, valorReal, valorSimulado) {
    const { segmentoAtual } = estadoSimulador;
    // Chave composta com segmento e tipo para evitar conflitos entre segmentos (ERRO 7)
    const chaveComposta = `${segmentoAtual}-${tipoProduto}`;
    
    if (!estadoSimulador.ajustes.captacoes[chaveComposta]) {
        estadoSimulador.ajustes.captacoes[chaveComposta] = {};
    }
    
    const diferenca = valorSimulado - valorReal;
    
    // Apenas registra ajustes com diferença diferente de zero (ERRO 4)
    if (diferenca !== 0) {
        estadoSimulador.ajustes.captacoes[chaveComposta][campo] = {
            segmento: segmentoAtual, // Armazena o segmento para exibição (ERRO 3)
            real: valorReal,
            simulado: valorSimulado,
            diferenca: diferenca
        };
    } else {
        // Remove ajustes com diferença zero
        if (estadoSimulador.ajustes.captacoes[chaveComposta][campo]) {
            delete estadoSimulador.ajustes.captacoes[chaveComposta][campo];
        }
        
        // Remove o objeto do tipo se estiver vazio
        if (Object.keys(estadoSimulador.ajustes.captacoes[chaveComposta]).length === 0) {
            delete estadoSimulador.ajustes.captacoes[chaveComposta];
        }
    }
    
    // Atualiza somas de diferenças
    atualizarSomaDiferencas();
    
    // Atualiza a interface
    atualizarListaAjustes();
    atualizarDadosSimulados();
}

// Registra um ajuste de comissão
export function registrarAjusteComissao(tipoProduto, valorReal, valorSimulado) {
    const { segmentoAtual } = estadoSimulador;
    // Chave composta com segmento e tipo para evitar conflitos entre segmentos (ERRO 7)
    const chaveComposta = `${segmentoAtual}-${tipoProduto}`;
    
    const diferenca = valorSimulado - valorReal;
    
    // Apenas registra ajustes com diferença diferente de zero (ERRO 4)
    if (diferenca !== 0) {
        estadoSimulador.ajustes.comissoes[chaveComposta] = {
            segmento: segmentoAtual, // Armazena o segmento para exibição (ERRO 3)
            real: valorReal,
            simulado: valorSimulado,
            diferenca: diferenca
        };
    } else {
        // Remove ajustes com diferença zero
        if (estadoSimulador.ajustes.comissoes[chaveComposta]) {
            delete estadoSimulador.ajustes.comissoes[chaveComposta];
        }
    }
    
    // Atualiza somas de diferenças
    atualizarSomaDiferencas();
    
    // Atualiza a interface
    atualizarListaAjustes();
    atualizarDadosSimulados();
}

export function atualizarSomaDiferencas() {
  const { segmentoAtual } = estadoSimulador;
  
  // Calcula as somas apenas para o segmento atual
  const somaDiferencaSegmento = calcularSomaDiferencasSegmento(segmentoAtual);
  
  // Atualiza o estado com as somas calculadas
  estadoSimulador.somaDiferencas = somaDiferencaSegmento;
}

// Atualiza os dados reais na interface
export function atualizarDadosReais() {
    // Atualiza a tabela de crédito com dados reais
    const dadosCreditoReal = obterDadosCreditoReais();
    atualizarTabelaCredito(dadosCreditoReal, false);
    
    // Atualiza a tabela de captações com dados reais
    const dadosCaptacoesReal = obterDadosCaptacoesReais();
    atualizarTabelaCaptacoes(dadosCaptacoesReal, false);
    
    // Atualiza a tabela de comissões com dados reais
    const dadosComissoesReal = obterDadosComissoesReais();
    atualizarTabelaComissoes(dadosComissoesReal, false);
    
    // Atualiza a tabela de cascada com dados reais
    const dadosCascadaReal = obterDadosCascadaReais();
    atualizarTabelaCascada(dadosCascadaReal, null);
}

// Atualiza os dados simulados na interface
export function atualizarDadosSimulados() {
    // Atualiza a tabela de crédito com dados simulados
    const dadosCreditoSimulado = obterDadosCreditoSimulados();
    console.log("dadosCreditoSimulado", dadosCreditoSimulado);
    atualizarTabelaCredito(dadosCreditoSimulado, true);
    
    // Atualiza a tabela de captações com dados simulados
    const dadosCaptacoesSimulado = obterDadosCaptacoesSimulados();
    atualizarTabelaCaptacoes(dadosCaptacoesSimulado, true);
    
    // Atualiza a tabela de comissões com dados simulados
    const dadosComissoesSimulado = obterDadosComissoesSimulados();
    atualizarTabelaComissoes(dadosComissoesSimulado, true);
    
    // Atualiza a tabela de cascada com dados simulados
    const dadosCascadaSimulado = obterDadosCascadaSimulados();
    const dadosCascadaReal = obterDadosCascadaReais();
    atualizarTabelaCascada(dadosCascadaReal, dadosCascadaSimulado);
}

// Obtém os dados de crédito reais para o segmento atual
export function obterDadosCreditoReais() {
    const { dados, segmentoAtual } = estadoSimulador;
    
    if (!dados || !dados[segmentoAtual] || !dados[segmentoAtual].credito) {
        return [];
    }
    
    const creditoData = dados[segmentoAtual].credito;
    const tiposProduto = obterTiposProduto(dados, segmentoAtual, 'credito');
    
    // Mapeia os dados e cria um array de objetos
    const dadosCredito = tiposProduto.map(tipo => ({
        tipo,
        carteira: creditoData.carteira[tipo],
        spread: creditoData.spread[tipo],
        provisao: creditoData.provisao[tipo],
        margem: creditoData.margem[tipo],
        rwa: creditoData.rwa[tipo],
        isItemDemais: tipo.toLowerCase() === 'demais' // Adicione esta flag
    }));
    
    // Separa "demais" do resto dos dados
    const itemDemais = dadosCredito.find(item => item.isItemDemais);
    const outrosItens = dadosCredito.filter(item => !item.isItemDemais);
    
    // Ordena os outros itens por carteira real em ordem decrescente
    outrosItens.sort((a, b) => b.carteira - a.carteira);
    
    // Reúne os dados, colocando "demais" por último
    return [...outrosItens, itemDemais].filter(Boolean); // O filter(Boolean) remove undefined se não houver "demais"
}

// Obtém os dados de crédito simulados para o segmento atual
export function obterDadosCreditoSimulados() {
    const { dados, segmentoAtual, ajustes } = estadoSimulador;
    const dadosReais = obterDadosCreditoReais();
    
    // Sempre retorna dados com valores simulados (mesmo sem ajustes)
    // Isso resolve o ERRO 5, preenchendo valores simulados mesmo sem ajustes
    
    return dadosReais.map(item => {
        // Busca ajustes específicos para este segmento e tipo
        const ajusteItemSegmento = ajustes.credito[`${segmentoAtual}-${item.tipo}`] || {};
        
        // Verifica se o item é "demais", que não pode ser alterado
        if (item.tipo.toLowerCase() === 'demais') {
            return {
                ...item,
                carteiraSimulada: item.carteira,
                spreadSimulado: item.spread,
                provisaoSimulada: item.provisao,
                margemSimulada: item.margem,
                rwaSimulado: item.rwa
            };
        }
        
        // Obtém valores ajustados ou mantém os originais (com prefixo de segmento)
        const carteiraSimulada = ajusteItemSegmento.carteira ? ajusteItemSegmento.carteira.simulado : item.carteira;
        // const provisaoSimulada = ajusteItemSegmento.provisao ? ajusteItemSegmento.provisao.simulado : item.provisao;
        const spreadSimulado = ajusteItemSegmento.spread ? ajusteItemSegmento.spread.simulado : item.spread;
        const provisaoOriginal = item.provisao;
        const carteiraOriginal = item.carteira;
        
        // Calcula valores derivados com base nas regras de negócio
        let provisaoSimulada = provisaoOriginal;
        if (carteiraOriginal > 0) {
            provisaoSimulada = (provisaoOriginal / carteiraOriginal) * carteiraSimulada;
        }
        // Se há um ajuste específico de provisão, usa-o em vez do cálculo
        if (ajusteItemSegmento.provisao) {
            provisaoSimulada = ajusteItemSegmento.provisao.simulado;
        }
        
        // Calcula a margem simulada
        const margemSimulada = carteiraSimulada * (spreadSimulado / 100);
        
        // Calcula o RWA simulado
        let rwaSimulado = item.rwa;
        if (carteiraOriginal > 0) {
            rwaSimulado = Math.round(item.rwa / carteiraOriginal * carteiraSimulada);
        }
        
        return {
            ...item,
            carteiraSimulada,
            spreadSimulado,
            provisaoSimulada,
            margemSimulada,
            rwaSimulado
        };
    });
}

// Obtém os dados de captações reais para o segmento atual
export function obterDadosCaptacoesReais() {
    const { dados, segmentoAtual } = estadoSimulador;
    
    if (!dados || !dados[segmentoAtual] || !dados[segmentoAtual].captacoes) {
        return [];
    }
    
    const captacoesData = dados[segmentoAtual].captacoes;
    const tiposProduto = obterTiposProduto(dados, segmentoAtual, 'captacoes');
    
    // Mapeia os dados e cria um array de objetos
    const dadosCaptacoes = tiposProduto.map(tipo => ({
        tipo,
        carteira: captacoesData.carteira[tipo],
        spread: captacoesData.spread[tipo],
        margem: captacoesData.margem[tipo],
        isItemDemais: tipo.toLowerCase() === 'demais' // Adicione esta flag
    }));
    
    // Separa "demais" do resto dos dados
    const itemDemais = dadosCaptacoes.find(item => item.isItemDemais);
    const outrosItens = dadosCaptacoes.filter(item => !item.isItemDemais);
    
    // Ordena os outros itens por carteira real em ordem decrescente
    outrosItens.sort((a, b) => b.carteira - a.carteira);
    
    // Reúne os dados, colocando "demais" por último
    return [...outrosItens, itemDemais].filter(Boolean);
}

// Obtém os dados de captações simulados para o segmento atual
export function obterDadosCaptacoesSimulados() {
    const { dados, segmentoAtual, ajustes } = estadoSimulador;
    const dadosReais = obterDadosCaptacoesReais();
    
    // Sempre retorna dados com valores simulados (mesmo sem ajustes)
    // Isso resolve o ERRO 5, preenchendo valores simulados mesmo sem ajustes
    
    return dadosReais.map(item => {
        // Busca ajustes específicos para este segmento e tipo
        const ajusteItemSegmento = ajustes.captacoes[`${segmentoAtual}-${item.tipo}`] || {};
        
        // Obtém valores ajustados ou mantém os originais
        const carteiraSimulada = ajusteItemSegmento.carteira ? ajusteItemSegmento.carteira.simulado : item.carteira;
        const spreadSimulado = ajusteItemSegmento.spread ? ajusteItemSegmento.spread.simulado : item.spread;
        
        // Calcula a margem simulada
        const margemSimulada = carteiraSimulada * (spreadSimulado / 100);
        
        return {
            ...item,
            carteiraSimulada,
            spreadSimulado,
            margemSimulada
        };
    });
}

// Obtém os dados de comissões reais para o segmento atual
export function obterDadosComissoesReais() {
    const { dados, segmentoAtual } = estadoSimulador;
    
    if (!dados || !dados[segmentoAtual] || !dados[segmentoAtual].comissoes) {
        return [];
    }
    
    const comissoesData = dados[segmentoAtual].comissoes.comissoes;
    
    // Cria um array de objetos
    const dadosComissoes = Object.keys(comissoesData).map(tipo => ({
        tipo,
        valor: comissoesData[tipo],
        isItemDemais: tipo.toLowerCase() === 'demais' // Adicione esta flag
    }));
    
    // Separa "demais" do resto dos dados
    const itemDemais = dadosComissoes.find(item => item.isItemDemais);
    const outrosItens = dadosComissoes.filter(item => !item.isItemDemais);
    
    // Ordena os outros itens por valor em ordem decrescente
    outrosItens.sort((a, b) => b.valor - a.valor);
    
    // Reúne os dados, colocando "demais" por último
    return [...outrosItens, itemDemais].filter(Boolean);
}

// Obtém os dados de comissões simulados para o segmento atual
export function obterDadosComissoesSimulados() {
    const { dados, segmentoAtual, ajustes } = estadoSimulador;
    const dadosReais = obterDadosComissoesReais();
    
    // Sempre retorna dados com valores simulados (mesmo sem ajustes)
    // Isso resolve o ERRO 5, preenchendo valores simulados mesmo sem ajustes
    
    return dadosReais.map(item => {
        // Busca ajustes específicos para este segmento e tipo
        const ajusteItemSegmento = ajustes.comissoes[`${segmentoAtual}-${item.tipo}`];
        
        // Obtém valor ajustado ou mantém o original
        const valorSimulado = ajusteItemSegmento ? ajusteItemSegmento.simulado : item.valor;
        
        return {
            ...item,
            valorSimulado
        };
    });
}

// Obtém os dados de cascada reais
export function obterDadosCascadaReais() {
    const { dados, segmentoAtual, visualizacaoCascada } = estadoSimulador;
    
    // Determina a fonte de dados com base na visualização selecionada
    const fonte = visualizacaoCascada === 'total' ? 'total' : segmentoAtual;
    
    if (!dados || !dados[fonte] || !dados[fonte].cascada) {
        return {};
    }
    
    return {
        cascada: dados[fonte].cascada.cascada,
        ppto: dados[fonte].cascada.ppto,
        atingimento: dados[fonte].cascada.atingimento
    };
}

// Obtém os dados de cascada simulados
export function obterDadosCascadaSimulados() {
  const { dados, segmentoAtual, visualizacaoCascada } = estadoSimulador;
  
  // Fonte correta de dados
  const fonte = visualizacaoCascada === 'total' ? 'total' : segmentoAtual;
  
  if (!dados || !dados[fonte] || !dados[fonte].cascada) {
      return {};
  }
  
  const dadosReais = dados[fonte].cascada.cascada;
  const dadosPpto = dados[fonte].cascada.ppto;
  
  // Calcular somas de diferenças considerando todos os segmentos para o "total"
  // ou apenas o segmento atual para visualizações de segmento
  let somaDiferencas;
  
  if (visualizacaoCascada === 'total') {
      // Para o total, calcular o impacto de todos os ajustes em todos os segmentos
      somaDiferencas = calcularSomaDiferencasTodosSegmentos();
  } else {
      // Para visualização de segmento, usar apenas os ajustes do segmento atual
      somaDiferencas = calcularSomaDiferencasSegmento(segmentoAtual);
  }
  
  // console.log(`Calculando cascada simulada para fonte: ${fonte}, visualização: ${visualizacaoCascada}`);
  // console.log("Diferenças usadas no cálculo:", somaDiferencas);
  
  // Calcula os valores simulados conforme as regras de negócio
  const mobSimulado = dadosReais.mob + somaDiferencas.margem;
  const pddSimulado = dadosReais.pdd + somaDiferencas.provisao;
  
  // Aqui está o cálculo do MOL - verificar que está correto
  const molSimulado = mobSimulado - Math.abs(pddSimulado);
  // console.log(`MOL: MOB(${mobSimulado}) - PDD(${Math.abs(pddSimulado)}) = ${molSimulado}`);
    
    const demaisAtivosSimulado = dadosReais.demais_ativos; // Sempre igual ao real
    const orypSimulado = dadosReais.oryp; // Sempre igual ao real
    const totalGastosSimulado = dadosReais.total_gastos; // Sempre igual ao real
    
    const baiSimulado = molSimulado + demaisAtivosSimulado + orypSimulado + totalGastosSimulado;
    
    // Cálculo de impostos
    const diferencaMob = mobSimulado - dadosReais.mob;
    const pis = diferencaMob * (-0.0465);
    const ir = ((baiSimulado - dadosReais.bai) + pis) * (-0.3);
    const impostoAdicional = pis + ir;
    const impostosSimulado = dadosReais.impostos + impostoAdicional;
    
    const bdiSimulado = baiSimulado + impostosSimulado;
    
    // Cálculo de indicadores
    const taxaImpositivaSimulada = baiSimulado !== 0 
        ? Math.round((impostosSimulado / baiSimulado) * -1000) / 10 // Arredonda para 1 casa decimal
        : 0;

    const eficienciaSimulada = mobSimulado !== 0 
        ? Math.round((totalGastosSimulado / mobSimulado) * -1000) / 10 // Arredonda para 1 casa decimal
        : 0;

    const rwaSimulado = dadosReais.rwa + somaDiferencas.rwa;

    const rorwaSimulado = rwaSimulado !== 0 
        ? Math.round((bdiSimulado / rwaSimulado) * 10000) / 100 // Arredonda para 2 casas decimais
        : 0;
    
    // Cálculo dos atingimentos
    const calcularAtingimento = (simulado, ppto) => {
        if (ppto === 0) return 0;
        return (simulado / ppto) * 100;
    };

    // console.log("diferenças", somaDiferencas)
    
    return {
        mob: mobSimulado,
        pdd: pddSimulado,
        mol: molSimulado,
        demais_ativos: demaisAtivosSimulado,
        oryp: orypSimulado,
        total_gastos: totalGastosSimulado,
        bai: baiSimulado,
        impostos: impostosSimulado,
        bdi: bdiSimulado,
        taxa_impositiva: taxaImpositivaSimulada,
        eficiencia: eficienciaSimulada,
        rwa: rwaSimulado,
        rorwa: rorwaSimulado,
        atingimento: {
            atingimento_mob: calcularAtingimento(mobSimulado, dadosPpto.ppto_mob),
            atingimento_pdd: calcularAtingimento(pddSimulado, dadosPpto.ppto_pdd),
            atingimento_mol: calcularAtingimento(molSimulado, dadosPpto.ppto_mol),
            atingimento_demais_ativos: calcularAtingimento(demaisAtivosSimulado, dadosPpto.ppto_demais_ativos),
            atingimento_oryp: calcularAtingimento(orypSimulado, dadosPpto.ppto_oryp),
            atingimento_total_gastos: calcularAtingimento(totalGastosSimulado, dadosPpto.ppto_total_gastos),
            atingimento_bai: calcularAtingimento(baiSimulado, dadosPpto.ppto_bai),
            atingimento_impostos: calcularAtingimento(impostosSimulado, dadosPpto.ppto_impostos),
            atingimento_bdi: calcularAtingimento(bdiSimulado, dadosPpto.ppto_bdi)
        }
    };
}

// Nova função para calcular a soma das diferenças para todos os segmentos
function calcularSomaDiferencasTodosSegmentos() {
  const { ajustes, dados } = estadoSimulador;
  let somaMargemCredito = 0;
  let somaMargemCaptacao = 0;
  let somaComissoes = 0;
  let somaProvisao = 0;
  let somaRWA = 0;
  
  // console.log("Calculando somas de diferenças para TODOS os segmentos");
  
  // Processa todos os ajustes de crédito em todos os segmentos
  Object.keys(ajustes.credito).forEach(chaveComposta => {
      const [segmento, tipo] = chaveComposta.split('-');
      const ajusteCredito = ajustes.credito[chaveComposta];
      
      // Calcular as diferenças de margem para este ajuste
      if (ajusteCredito.carteira || ajusteCredito.spread) {
          // Obter os dados reais do crédito para este segmento
          const dadosSegmento = dados[segmento];
          if (dadosSegmento && dadosSegmento.credito) {
              const carteiraOriginal = dadosSegmento.credito.carteira[tipo] || 0;
              const spreadOriginal = dadosSegmento.credito.spread[tipo] || 0;
              
              // Valores ajustados
              const carteiraAjustada = ajusteCredito.carteira ? ajusteCredito.carteira.simulado : carteiraOriginal;
              const spreadAjustado = ajusteCredito.spread ? ajusteCredito.spread.simulado : spreadOriginal;
              
              // Calcular margens
              const margemOriginal = carteiraOriginal * (spreadOriginal / 100);
              const margemAjustada = carteiraAjustada * (spreadAjustado / 100);
              
              // Diferença de margem
              const diferencaMargem = margemAjustada - margemOriginal;
              somaMargemCredito += diferencaMargem;
              // console.log(`[Total] Crédito ${segmento}-${tipo}: Diferença margem=${diferencaMargem}`);
          }
      }
      
      // Adicionar diferenças de provisão
      if (ajusteCredito.provisao) {
          somaProvisao += ajusteCredito.provisao.diferenca;
          // console.log(`[Total] Crédito ${segmento}-${tipo}: Diferença provisão=${ajusteCredito.provisao.diferenca}`);
      }
      
      // Calcular as diferenças de RWA
      if (ajusteCredito.carteira) {
          const dadosSegmento = dados[segmento];
          if (dadosSegmento && dadosSegmento.credito) {
              const carteiraOriginal = dadosSegmento.credito.carteira[tipo] || 0;
              const rwaOriginal = dadosSegmento.credito.rwa[tipo] || 0;
              
              if (carteiraOriginal > 0) {
                  // Valores ajustados
                  const carteiraAjustada = ajusteCredito.carteira.simulado;
                  
                  // Calcular RWA ajustado
                  const rwaAjustado = (rwaOriginal / carteiraOriginal) * carteiraAjustada;
                  
                  // Diferença de RWA
                  const diferencaRWA = rwaAjustado - rwaOriginal;
                  somaRWA += diferencaRWA;
                  // console.log(`[Total] Crédito ${segmento}-${tipo}: Diferença RWA=${diferencaRWA}`);
              }
          }
      }
  });
  
  // Processa todos os ajustes de captações em todos os segmentos
  Object.keys(ajustes.captacoes).forEach(chaveComposta => {
      const [segmento, tipo] = chaveComposta.split('-');
      const ajusteCaptacao = ajustes.captacoes[chaveComposta];
      
      // Calcular as diferenças de margem para este ajuste
      if (ajusteCaptacao.carteira || ajusteCaptacao.spread) {
          // Obter os dados reais de captação para este segmento
          const dadosSegmento = dados[segmento];
          if (dadosSegmento && dadosSegmento.captacoes) {
              const carteiraOriginal = dadosSegmento.captacoes.carteira[tipo] || 0;
              const spreadOriginal = dadosSegmento.captacoes.spread[tipo] || 0;
              
              // Valores ajustados
              const carteiraAjustada = ajusteCaptacao.carteira ? ajusteCaptacao.carteira.simulado : carteiraOriginal;
              const spreadAjustado = ajusteCaptacao.spread ? ajusteCaptacao.spread.simulado : spreadOriginal;
              
              // Calcular margens
              const margemOriginal = carteiraOriginal * (spreadOriginal / 100);
              const margemAjustada = carteiraAjustada * (spreadAjustado / 100);
              
              // Diferença de margem
              const diferencaMargem = margemAjustada - margemOriginal;
              somaMargemCaptacao += diferencaMargem;
              // console.log(`[Total] Captação ${segmento}-${tipo}: Diferença margem=${diferencaMargem}`);
          }
      }
  });
  
  // Processa todos os ajustes de comissões em todos os segmentos
  Object.keys(ajustes.comissoes).forEach(chaveComposta => {
      const [segmento, tipo] = chaveComposta.split('-');
      const ajusteComissao = ajustes.comissoes[chaveComposta];
      
      somaComissoes += ajusteComissao.diferenca;
      // console.log(`[Total] Comissão ${segmento}-${tipo}: Diferença=${ajusteComissao.diferenca}`);
  });
  
  // Retorna o objeto com as somas
  const resultado = {
      margem: somaMargemCredito + somaMargemCaptacao + somaComissoes,
      provisao: somaProvisao,
      rwa: somaRWA
  };
  
  // console.log("[Total] Somas das diferenças de todos os segmentos:", resultado);
  return resultado;
}

// Função para calcular a soma das diferenças apenas para um segmento específico
function calcularSomaDiferencasSegmento(segmento) {
  const { ajustes, dados } = estadoSimulador;
  let somaMargemCredito = 0;
  let somaMargemCaptacao = 0;
  let somaComissoes = 0;
  let somaProvisao = 0;
  let somaRWA = 0;
  
  // console.log(`Calculando somas de diferenças para o segmento: ${segmento}`);
  
  // Soma diferenças de crédito (apenas do segmento especificado)
  Object.keys(ajustes.credito).forEach(chave => {
      // Verifica se o ajuste pertence ao segmento especificado
      if (chave.startsWith(`${segmento}-`)) {
          // console.log(`Processando ajuste de crédito: ${chave}`);
          
          // Verifica se há diferenças para carteira ou spread
          const ajusteCredito = ajustes.credito[chave];
          
          // Calcular as diferenças de margem através de carteira e spread
          if (ajusteCredito.carteira || ajusteCredito.spread) {
              // Obter os dados reais do crédito
              const dadosSegmento = dados[segmento];
              if (dadosSegmento && dadosSegmento.credito) {
                  const [, tipo] = chave.split('-'); // Extrair o tipo do produto da chave
                  const carteiraOriginal = dadosSegmento.credito.carteira[tipo] || 0;
                  const spreadOriginal = dadosSegmento.credito.spread[tipo] || 0;
                  
                  // Valores ajustados
                  const carteiraAjustada = ajusteCredito.carteira ? ajusteCredito.carteira.simulado : carteiraOriginal;
                  const spreadAjustado = ajusteCredito.spread ? ajusteCredito.spread.simulado : spreadOriginal;
                  
                  // Calcular margens
                  const margemOriginal = carteiraOriginal * (spreadOriginal / 100);
                  const margemAjustada = carteiraAjustada * (spreadAjustado / 100);
                  
                  // Diferença de margem
                  const diferencaMargem = margemAjustada - margemOriginal;
                  // console.log(`Crédito ${tipo}: Margem original=${margemOriginal}, Margem ajustada=${margemAjustada}, Diferença=${diferencaMargem}`);
                  somaMargemCredito += diferencaMargem;
              }
          }
          
          // Adicionar diferenças de provisão
          if (ajusteCredito.provisao) {
              somaProvisao += ajusteCredito.provisao.diferenca;
              // console.log(`Crédito ${chave}: Diferença provisão=${ajusteCredito.provisao.diferenca}`);
          }
          
          // Calcular as diferenças de RWA através de carteira
          if (ajusteCredito.carteira) {
              const dadosSegmento = dados[segmento];
              if (dadosSegmento && dadosSegmento.credito) {
                  const [, tipo] = chave.split('-'); // Extrair o tipo do produto da chave
                  const carteiraOriginal = dadosSegmento.credito.carteira[tipo] || 0;
                  const rwaOriginal = dadosSegmento.credito.rwa[tipo] || 0;
                  
                  if (carteiraOriginal > 0) {
                      // Valores ajustados
                      const carteiraAjustada = ajusteCredito.carteira.simulado;
                      
                      // Calcular RWA ajustado
                      const rwaAjustado = (rwaOriginal / carteiraOriginal) * carteiraAjustada;
                      
                      // Diferença de RWA
                      const diferencaRWA = rwaAjustado - rwaOriginal;
                      // console.log(`Crédito ${tipo}: RWA original=${rwaOriginal}, RWA ajustado=${rwaAjustado}, Diferença=${diferencaRWA}`);
                      somaRWA += diferencaRWA;
                  }
              }
          }
      }
  });
  
  // Soma diferenças de margem de captação (apenas do segmento especificado)
  Object.keys(ajustes.captacoes).forEach(chave => {
      // Verifica se o ajuste pertence ao segmento especificado
      if (chave.startsWith(`${segmento}-`)) {
          // console.log(`Processando ajuste de captação: ${chave}`);
          
          // Verifica se há diferenças para carteira ou spread
          const ajusteCaptacao = ajustes.captacoes[chave];
          
          // Calcular as diferenças de margem através de carteira e spread
          if (ajusteCaptacao.carteira || ajusteCaptacao.spread) {
              const dadosSegmento = dados[segmento];
              if (dadosSegmento && dadosSegmento.captacoes) {
                  const [, tipo] = chave.split('-'); // Extrair o tipo do produto da chave
                  const carteiraOriginal = dadosSegmento.captacoes.carteira[tipo] || 0;
                  const spreadOriginal = dadosSegmento.captacoes.spread[tipo] || 0;
                  
                  // Valores ajustados
                  const carteiraAjustada = ajusteCaptacao.carteira ? ajusteCaptacao.carteira.simulado : carteiraOriginal;
                  const spreadAjustado = ajusteCaptacao.spread ? ajusteCaptacao.spread.simulado : spreadOriginal;
                  
                  // Calcular margens
                  const margemOriginal = carteiraOriginal * (spreadOriginal / 100);
                  const margemAjustada = carteiraAjustada * (spreadAjustado / 100);
                  
                  // Diferença de margem
                  const diferencaMargem = margemAjustada - margemOriginal;
                  // console.log(`Captação ${tipo}: Margem original=${margemOriginal}, Margem ajustada=${margemAjustada}, Diferença=${diferencaMargem}`);
                  somaMargemCaptacao += diferencaMargem;
              }
          }
      }
  });
  
  // Soma diferenças de comissões (apenas do segmento especificado)
  Object.keys(ajustes.comissoes).forEach(chave => {
      // Verifica se o ajuste pertence ao segmento especificado
      if (chave.startsWith(`${segmento}-`)) {
          // console.log(`Processando ajuste de comissão: ${chave}`);
          const ajusteComissao = ajustes.comissoes[chave];
          somaComissoes += ajusteComissao.diferenca;
          // console.log(`Comissão ${chave}: Diferença=${ajusteComissao.diferenca}`);
      }
  });
  
  // Retorna o objeto com as somas
  const resultado = {
      margem: somaMargemCredito + somaMargemCaptacao + somaComissoes,
      provisao: somaProvisao,
      rwa: somaRWA
  };
  
  // console.log(`[${segmento}] Somas das diferenças do segmento:`, resultado);
  return resultado;
}

// Retorna a lista de ajustes para exibição na UI
export function obterListaAjustes() {
    const { ajustes } = estadoSimulador;
    const listaAjustes = {
        credito: [],
        captacoes: [],
        comissoes: []
    };
    
    // Processa ajustes de crédito
    Object.keys(ajustes.credito).forEach(chaveComposta => {
        // A chave composta é "segmento-tipo"
        const [segmento, ...tipoPartes] = chaveComposta.split('-');
        const tipo = tipoPartes.join('-'); // Reconstrói o tipo caso tenha hífen
        
        Object.keys(ajustes.credito[chaveComposta]).forEach(campo => {
            const ajuste = ajustes.credito[chaveComposta][campo];
            // Adiciona apenas ajustes com diferenças diferentes de zero (ERRO 4)
            if (ajuste.diferenca !== 0) {
                listaAjustes.credito.push({
                    segmento,  // Inclui o segmento para exibição (ERRO 3)
                    tipo,
                    campo,
                    valorReal: ajuste.real,
                    valorSimulado: ajuste.simulado,
                    diferenca: ajuste.diferenca
                });
            }
        });
    });
    
    // Processa ajustes de captações
    Object.keys(ajustes.captacoes).forEach(chaveComposta => {
        // A chave composta é "segmento-tipo"
        const [segmento, ...tipoPartes] = chaveComposta.split('-');
        const tipo = tipoPartes.join('-'); // Reconstrói o tipo caso tenha hífen
        
        Object.keys(ajustes.captacoes[chaveComposta]).forEach(campo => {
            const ajuste = ajustes.captacoes[chaveComposta][campo];
            // Adiciona apenas ajustes com diferenças diferentes de zero (ERRO 4)
            if (ajuste.diferenca !== 0) {
                listaAjustes.captacoes.push({
                    segmento,  // Inclui o segmento para exibição (ERRO 3)
                    tipo,
                    campo,
                    valorReal: ajuste.real,
                    valorSimulado: ajuste.simulado,
                    diferenca: ajuste.diferenca
                });
            }
        });
    });
    
    // Processa ajustes de comissões
    Object.keys(ajustes.comissoes).forEach(chaveComposta => {
        // A chave composta é "segmento-tipo"
        const [segmento, ...tipoPartes] = chaveComposta.split('-');
        const tipo = tipoPartes.join('-'); // Reconstrói o tipo caso tenha hífen
        
        const ajuste = ajustes.comissoes[chaveComposta];
        // Adiciona apenas ajustes com diferenças diferentes de zero (ERRO 4)
        if (ajuste.diferenca !== 0) {
            listaAjustes.comissoes.push({
                segmento,  // Inclui o segmento para exibição (ERRO 3)
                tipo,
                campo: 'valor',
                valorReal: ajuste.real,
                valorSimulado: ajuste.simulado,
                diferenca: ajuste.diferenca
            });
        }
    });
    
    return listaAjustes;
}

// Otimiza o portfólio automaticamente (função exemplo)
// export function otimizarPortfolio() {
//     // Lógica de otimização específica a ser implementada
//     alert('Funcionalidade de otimização a ser implementada!');
// }