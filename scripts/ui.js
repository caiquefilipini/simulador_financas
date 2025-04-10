/**
 * Módulo de interface do usuário
 * Responsável por atualizar a interface e gerenciar interações do usuário
 */

import { obterSegmentos, formatarValor, obterTiposProduto } from './dados.js';
import { 
    obterEstadoSimulador, atualizarSegmento, atualizarVisualizacaoCascada, 
    registrarAjusteCredito, registrarAjusteCaptacao, registrarAjusteComissao,
    temAjustes, limparAjustes, obterListaAjustes, atualizarSomaDiferencas, obterDadosComparativoSegmentos,
    calcularSomaDiferencasSegmento, calcularSomaDiferencasTodosSegmentos 
} from './simulador.js';

// Inicializa a interface do usuário
export function inicializarUI() {
    // Configura os seletores e botões
    configurarSeletorSegmento();
    configurarAbas();
    configurarBotoes();
    configurarEventosInput();
    configurarVisualizacaoCascada();
    
    console.log('Interface do usuário inicializada');
}

// Configura o seletor de segmento
// Configura o seletor de segmento
function configurarSeletorSegmento() {
    const seletorSegmento = document.getElementById('segment');
    const { dados } = obterEstadoSimulador();
    
    if (!seletorSegmento || !dados) return;
    
    // Limpa opções existentes
    seletorSegmento.innerHTML = '';
    
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
    
    // Adiciona opções de segmento
    const segmentos = obterSegmentos(dados);
    segmentos.forEach(segmento => {
        const option = document.createElement('option');
        option.value = segmento;
        
        // Usa o nome formatado se existir, senão capitaliza a primeira letra
        option.textContent = formatacaoSegmentos[segmento.toLowerCase()] || 
                            (segmento.charAt(0).toUpperCase() + segmento.slice(1));
        
        seletorSegmento.appendChild(option);
    });
    
    // Define evento de alteração
    seletorSegmento.addEventListener('change', () => {
        atualizarSegmento(seletorSegmento.value);
    });
}

// Configura o sistema de abas
function configurarAbas() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove a classe ativa de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Adiciona a classe ativa ao botão clicado e ao conteúdo correspondente
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Função para exportar a simulação para Excel
export function exportarSimulacaoParaExcel() {
    // Primeiro, vamos verificar se temos a biblioteca XLSX disponível
    if (typeof XLSX === 'undefined') {
        // Se não tiver, carrega dinamicamente o script
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        script.onload = function() {
            // Quando o script é carregado, chama a função de exportação
            gerarExcel();
        };
        document.head.appendChild(script);
    } else {
        // Se já tiver o XLSX, chama diretamente
        gerarExcel();
    }
}

// Função que gera efetivamente o Excel
function gerarExcel() {
    // Cria um novo workbook
    const wb = XLSX.utils.book_new();
    
    // Adiciona uma planilha com a lista de ajustes
    adicionarPlanilhaAjustes(wb);
    
    // Adiciona uma planilha com o comparativo por segmento
    adicionarPlanilhaComparativo(wb);
    
    // Gera o arquivo Excel e inicia o download
    const dataAtual = new Date().toISOString().slice(0, 10);
    const options = { bookType: 'xlsx', type: 'binary' };
    XLSX.writeFile(wb, `Simulacao_Financeira_${dataAtual}.xlsx`, options);
}

// Função para adicionar a planilha de ajustes
function adicionarPlanilhaAjustes(wb) {
    // Obtém a lista de ajustes
    const ajustes = obterListaAjustes();
    
    // Prepara os dados para a planilha
    const dadosAjustes = [];
    
    // Adiciona cabeçalho
    dadosAjustes.push(['Simulação Financeira - Ajustes Realizados']);
    dadosAjustes.push([]);
    dadosAjustes.push(['Categoria', 'Segmento', 'Produto', 'Campo', 'Valor Real', 'Valor Simulado', 'Ajuste']);
    
    // Adiciona ajustes de crédito
    if (ajustes.credito.length > 0) {
        ajustes.credito.forEach(ajuste => {
            dadosAjustes.push([
                'Crédito',
                formatarNomeProduto(ajuste.segmento),
                formatarNomeProduto(ajuste.tipo),
                obterNomeCampo(ajuste.campo),
                ajuste.valorReal,
                ajuste.valorSimulado,
                ajuste.diferenca
            ]);
        });
    }
    
    // Adiciona ajustes de captações
    if (ajustes.captacoes.length > 0) {
        ajustes.captacoes.forEach(ajuste => {
            dadosAjustes.push([
                'Captações',
                formatarNomeProduto(ajuste.segmento),
                formatarNomeProduto(ajuste.tipo),
                obterNomeCampo(ajuste.campo),
                ajuste.valorReal,
                ajuste.valorSimulado,
                ajuste.diferenca
            ]);
        });
    }
    
    // Adiciona ajustes de comissões
    if (ajustes.comissoes.length > 0) {
        ajustes.comissoes.forEach(ajuste => {
            dadosAjustes.push([
                'Comissões',
                formatarNomeProduto(ajuste.segmento),
                formatarNomeProduto(ajuste.tipo),
                'Valor',
                ajuste.valorReal,
                ajuste.valorSimulado,
                ajuste.diferenca
            ]);
        });
    }
    
    // Se não houver ajustes, adiciona uma mensagem
    if (ajustes.credito.length === 0 && ajustes.captacoes.length === 0 && ajustes.comissoes.length === 0) {
        dadosAjustes.push(['Nenhum ajuste realizado.']);
    }
    
    // Cria a worksheet e adiciona ao workbook
    const ws = XLSX.utils.aoa_to_sheet(dadosAjustes);
    XLSX.utils.book_append_sheet(wb, ws, 'Ajustes');
    
    // Aplica alguns estilos básicos (largura das colunas)
    ws['!cols'] = [
        { wch: 15 }, // Categoria
        { wch: 15 }, // Segmento
        { wch: 20 }, // Produto
        { wch: 15 }, // Campo
        { wch: 12 }, // Valor Real
        { wch: 12 }, // Valor Simulado
        { wch: 12 }  // Ajuste
    ];
}

// Função para adicionar a planilha de comparativo
function adicionarPlanilhaComparativo(wb) {
    // Obtém os dados comparativos
    const dadosComparativos = obterDadosComparativoSegmentos();
    
    // Prepara os dados para a planilha
    const dadosExcel = [];
    
    // Adiciona cabeçalho
    dadosExcel.push(['Simulação Financeira - Comparativo por Segmento']);
    dadosExcel.push([]);
    
    // Cabeçalhos principais
    dadosExcel.push([
        'Segmento', 
        'MOB Real', 'MOB Simulado', 'MOB Δ',
        'MOL Real', 'MOL Simulado', 'MOL Δ',
        'BAI Real', 'BAI Simulado', 'BAI Δ',
        'BDI Real', 'BDI Simulado', 'BDI Δ',
        'RWA Real', 'RWA Simulado', 'RWA Δ',
        'RORWA Real', 'RORWA Simulado', 'RORWA Δ',
        'PDD Real', 'PDD Simulado', 'PDD Δ'
    ]);
    
    // Mapeamento para formatar corretamente os nomes dos segmentos
    const formatacaoSegmentos = {
        "pj": "PJ",
        "scib": "SCIB",
        "private": "Private",
        "select": "Select",
        "especial": "Especial",
        "prospera": "Prospera",
        "consumer": "Consumer",
        "corporate": "Corporate",
        "total": "Total"
    };
    
    // Para cada segmento, obtenha os dados adicionais da cascada
    dadosComparativos.forEach(item => {
        // Obter dados da cascada para este segmento
        const dadosCascada = obterDadosCascadaPorSegmento(item.segmento);
        
        dadosExcel.push([
            // Segmento
            formatarNomeProduto(item.segmento),
            
            // MOB (já existe no dadosComparativos)
            item.mob.real,
            item.mob.simulado,
            item.mob.delta,
            
            // MOL (obtido da cascada)
            dadosCascada.real.mol || 0,
            dadosCascada.simulado.mol || 0,
            (dadosCascada.simulado.mol || 0) - (dadosCascada.real.mol || 0),
            
            // BAI (obtido da cascada)
            dadosCascada.real.bai || 0,
            dadosCascada.simulado.bai || 0,
            (dadosCascada.simulado.bai || 0) - (dadosCascada.real.bai || 0),
            
            // BDI (obtido da cascada)
            dadosCascada.real.bdi || 0,
            dadosCascada.simulado.bdi || 0,
            (dadosCascada.simulado.bdi || 0) - (dadosCascada.real.bdi || 0),
            
            // RWA (obtido da cascada)
            dadosCascada.real.rwa || 0,
            dadosCascada.simulado.rwa || 0,
            (dadosCascada.simulado.rwa || 0) - (dadosCascada.real.rwa || 0),
            
            // RORWA (já existe no dadosComparativos)
            item.rorwa.real,
            item.rorwa.simulado,
            item.rorwa.delta,
            
            // PDD (já existe no dadosComparativos)
            item.pdd.real,
            item.pdd.simulado,
            item.pdd.delta
        ]);
    });
    
    // Cria a worksheet e adiciona ao workbook
    const ws = XLSX.utils.aoa_to_sheet(dadosExcel);
    XLSX.utils.book_append_sheet(wb, ws, 'Comparativo');
    
    // Aplica alguns estilos básicos (largura das colunas)
    ws['!cols'] = Array(23).fill().map(() => ({ wch: 12 }));
    ws['!cols'][0] = { wch: 15 }; // Coluna de Segmento um pouco mais larga
}

// Função para obter os dados da cascada para um segmento específico
function obterDadosCascadaPorSegmento(segmento) {
    const { dados } = obterEstadoSimulador();
    
    if (!dados || !dados[segmento] || !dados[segmento].cascada) {
        return {
            real: {},
            simulado: {}
        };
    }
    
    const dadosReais = dados[segmento].cascada.cascada;
    
    // Calcular valores simulados
    let somaDiferencas;
    if (segmento === 'total') {
        somaDiferencas = calcularSomaDiferencasTodosSegmentos();
    } else {
        somaDiferencas = calcularSomaDiferencasSegmento(segmento);
    }
    
    // Calcula os valores simulados
    const mobSimulado = dadosReais.mob + somaDiferencas.margem;
    const pddSimulado = dadosReais.pdd + somaDiferencas.provisao;
    const molSimulado = mobSimulado - Math.abs(pddSimulado);
    
    const demaisAtivosSimulado = dadosReais.demais_ativos;
    const orypSimulado = dadosReais.oryp;
    const totalGastosSimulado = dadosReais.total_gastos;
    
    const baiSimulado = molSimulado + demaisAtivosSimulado + orypSimulado + totalGastosSimulado;
    
    // Cálculo de impostos
    const diferencaMob = mobSimulado - dadosReais.mob;
    const pis = diferencaMob * (-0.0465);
    const ir = ((baiSimulado - dadosReais.bai) + pis) * (-0.3);
    const impostoAdicional = pis + ir;
    const impostosSimulado = dadosReais.impostos + impostoAdicional;
    
    const bdiSimulado = baiSimulado + impostosSimulado;
    
    return {
        real: dadosReais,
        simulado: {
            mob: mobSimulado,
            pdd: pddSimulado,
            mol: molSimulado,
            demais_ativos: demaisAtivosSimulado,
            oryp: orypSimulado,
            total_gastos: totalGastosSimulado,
            bai: baiSimulado,
            impostos: impostosSimulado,
            bdi: bdiSimulado
        }
    };
}

// Função auxiliar para obter o nome formatado do campo
function obterNomeCampo(campo) {
    switch (campo) {
        case 'carteira': return 'Carteira';
        case 'spread': return 'Spread';
        case 'provisao': return 'Provisão';
        case 'valor': return 'Valor';
        default: return campo;
    }
}

// Configura botões de ação
function configurarBotoes() {
    // Botão de otimização
    // const btnOtimizar = document.getElementById('btn-otimizar');
    // if (btnOtimizar) {
    //     btnOtimizar.addEventListener('click', otimizarPortfolio);
    // }
    
    // Botão de salvar (não implementado neste MVP)
    const btnSalvar = document.getElementById('btn-salvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', exportarSimulacaoParaExcel);
    }
    // if (btnSalvar) {
    //     btnSalvar.addEventListener('click', () => {
    //         alert('Funcionalidade de salvar simulação a ser implementada!');
    //     });
    // }
    
    // Botão de limpar ajustes
    const btnLimparAjustes = document.getElementById('btn-limpar-ajustes');
    if (btnLimparAjustes) {
        btnLimparAjustes.addEventListener('click', limparAjustes);
    }
}

// Configura a visualização da cascada (total ou segmento)
function configurarVisualizacaoCascada() {
    const btnViewTotal = document.getElementById('btn-view-total');
    const btnViewSegment = document.getElementById('btn-view-segment');
    const { segmentoAtual } = obterEstadoSimulador();
    
    // Define o texto do botão de segmento para o segmento atual
    if (btnViewSegment) {
        btnViewSegment.textContent = formatarNomeProduto(segmentoAtual);
    }
    
    if (btnViewTotal) {
        btnViewTotal.addEventListener('click', () => {
            btnViewTotal.classList.add('active');
            btnViewSegment.classList.remove('active');
            atualizarVisualizacaoCascada('total');
        });
    }
    
    if (btnViewSegment) {
        btnViewSegment.addEventListener('click', () => {
            btnViewSegment.classList.add('active');
            btnViewTotal.classList.remove('active');
            atualizarVisualizacaoCascada('segment');
        });
    }
}

// Configura eventos de input para capturar mudanças nos campos
function configurarEventosInput() {
    // Configura campos de crédito para atualização em tempo real (ERRO 1, ERRO 8)
    configurarCamposCredito();
    
    // Configura campos de captações
    configurarCamposCaptacoes();
    
    // Configura campos de comissões
    configurarCamposComissoes();
}

// Configura campos de input da tabela de crédito
function configurarCamposCredito() {
    document.getElementById('credito-body').addEventListener('input', (event) => {
        // console.log("Evento de input capturado:", event.target, event.target.matches('input')); // Debugging

        if (!event.target.matches('input')) return;
        
        const input = event.target;
        const row = input.closest('tr');
        const tipoProduto = row.getAttribute('data-tipo');
        // console.log("Row:", row); // Debugging

        // Ignora ajustes para o tipo "demais"
        // if (tipoProduto.toLowerCase() === 'demais') {
        //     alert('Não é possível alterar valores do tipo "Demais".');
        //     input.value = '';
        //     return;
        // }

        // console.log(input.name)

        // Para o campo de carteira, tratamos como ajuste
        if (input.name === 'carteira') {
            const valorReal = parseFloat(input.getAttribute('data-carteira-real'));
            const ajuste = isNaN(input.value) || input.value === '' || input.value === '-' ? 0 : parseFloat(input.value);
            console.log("ajuste", ajuste)
            // Calculamos o valor simulado somando o ajuste ao real
            
            // let valorSimulado;
            if (!isNaN(input.value) && input.value !== '') {
                const valorSimulado = valorReal + ajuste;
                registrarAjusteCredito(tipoProduto, input.name, valorReal, valorSimulado);
            }

            if (ajuste === 0 && input.value !== '-') {
                registrarAjusteCredito(tipoProduto, input.name, valorReal, valorReal);
            }
                // } else {
            //     valorSimulado = valorReal; 
            // }
            // console.log("Valor real:", valorReal);
            // console.log("Valor simulado:", valorSimulado);


            // atualizarSomaDiferencas()
            // Registramos normalmente
            // if (ajuste === 0) {
            
            // }
        } 
        // Para o campo de spread, também tratamos como ajuste
        else if (input.name === 'spread') {
            const valorReal = parseFloat(row.getAttribute('data-spread-real'));
            // console.log(typeof valorReal)
            // Converte o valor digitado para número (substitui vírgula por ponto para o JS)
            let ajusteStr = parseFloat(input.value.replace(',', '.'));
            // const ajuste = ajusteStr === '' || ajusteStr === '-' ? 0 : parseFloat(ajusteStr);
            const ajuste = ajusteStr === '' || isNaN(ajusteStr) ? 0 : parseFloat(ajusteStr);
            console.log(ajuste)            
            
            // let valorSimulado;
            if (!isNaN(input.value) && input.value !== '') {
                const valorSimulado = valorReal + ajuste;
                registrarAjusteCredito(tipoProduto, input.name, valorReal, valorSimulado);
            }

            if (ajuste === 0 && input.value !== '-') {
                registrarAjusteCredito(tipoProduto, input.name, valorReal, valorReal);
            }
        }

        else if (input.name === 'provisao') {
            const valorReal = parseFloat(row.getAttribute('data-provisao-real'));
            // console.log(valorReal)
            const ajuste = isNaN(input.value) || input.value === '' ? 0 : parseFloat(input.value);
            console.log(ajuste)
            
            if (ajuste !== 0) {
                const valorSimulado = valorReal + ajuste;
                registrarAjusteCredito(tipoProduto, input.name, valorReal, valorSimulado);
            }

            if (ajuste === 0 && input.value !== '-') {
                registrarAjusteCredito(tipoProduto, input.name, valorReal, valorReal);
            }

        }

        else {
            // Para outros campos (provisão, etc.)
            const valorReal = parseFloat(row.getAttribute(`data-${input.name}-real`));
            
            if (isNaN(valorReal)) {
                // console.error(`Valor real de ${input.name} não encontrado para`, tipoProduto);
                return;
            }
            
            const valorSimulado = input.value === '' ? valorReal : parseFloat(input.value);
            
            registrarAjusteCredito(tipoProduto, input.name, valorReal, valorSimulado);
        }
    });
}

// Configura campos de input da tabela de captações
function configurarCamposCaptacoes() {
    document.getElementById('captacoes-body').addEventListener('input', (event) => {
        if (!event.target.matches('input')) return;
        
        const input = event.target;
        const row = input.closest('tr');
        const tipoProduto = row.getAttribute('data-tipo');
        
        // Ignora ajustes para o tipo "demais"
        if (tipoProduto.toLowerCase() === 'demais') {
            alert('Não é possível alterar valores do tipo "Demais".');
            input.value = '';
            return;
        }

        // console.log("input name", input.name)
        
        // Para o campo de carteira, tratamos como ajuste
        if (input.name === 'carteira') {
            const valorReal = parseFloat(input.getAttribute('data-carteira-real'));
            const ajuste = isNaN(input.value) || input.value === '' ? 0 : parseFloat(input.value);
            // console.log(ajuste)
            // Calculamos o valor simulado somando o ajuste ao real
            
            // if (ajuste !== 0) {
            //     const valorSimulado = valorReal + ajuste;
            //     registrarAjusteCaptacao(tipoProduto, input.name, valorReal, valorSimulado);
            // }

            
            
            // let valorSimulado;
            if (!isNaN(input.value) && input.value !== '') {
                const valorSimulado = valorReal + ajuste;
                registrarAjusteCaptacao(tipoProduto, input.name, valorReal, valorSimulado);
            }

            if (ajuste === 0 && input.value !== '-') {
                registrarAjusteCaptacao(tipoProduto, input.name, valorReal, valorReal);
            }
            // Registramos normalmente
            // if (ajuste === 0) {
            
            // }
        } 
        // Para o campo de spread, também tratamos como ajuste
        else if (input.name === 'spread') {
            const valorReal = parseFloat(row.getAttribute('data-spread-real'));
            let ajusteStr = parseFloat(input.value.replace(',', '.'));
            const ajuste = ajusteStr === '' || isNaN(ajusteStr) ? 0 : parseFloat(ajusteStr);
            console.log("ajuste", ajuste)

            if (ajuste !== 0) {
                const valorSimulado = valorReal + ajuste;
                registrarAjusteCaptacao(tipoProduto, input.name, valorReal, valorSimulado);
            }

            // let valorSimulado;
            // if (!isNaN(input.value) && input.value !== '') {
            //     const valorSimulado = valorReal + ajuste;
            //     registrarAjusteCaptacao(tipoProduto, input.name, valorReal, valorSimulado);
            // }

            if (ajuste === 0 && input.value !== '-') {
                registrarAjusteCaptacao(tipoProduto, input.name, valorReal, valorReal);
            }

            
        } 
        else {
            // Para outros campos
            const valorReal = parseFloat(row.getAttribute(`data-${input.name}-real`));
            
            if (isNaN(valorReal)) {
                console.error(`Valor real de ${input.name} não encontrado para`, tipoProduto);
                return;
            }
            
            const valorSimulado = input.value === '' ? valorReal : parseFloat(input.value);
            
            registrarAjusteCaptacao(tipoProduto, input.name, valorReal, valorSimulado);
        }
    });
}

function configurarCamposComissoes() {
    document.getElementById('comissoes-body').addEventListener('input', (event) => {
        if (!event.target.matches('input')) return;
        
        const input = event.target;
        const row = input.closest('tr');
        const tipoProduto = row.getAttribute('data-tipo');
        
        // Ignora ajustes para o tipo "demais"
        // if (tipoProduto.toLowerCase() === 'demais') {
        //     alert('Não é possível alterar valores do tipo "Demais".');
        //     input.value = '';
        //     return;
        // }
        
        // Tratamos o valor como ajuste
        const valorReal = parseFloat(input.getAttribute('data-valor-real'));
        const ajuste = isNaN(input.value) || input.value === '' ? 0 : parseFloat(input.value);
        
        if (ajuste !== 0) {
            const valorSimulado = valorReal + ajuste;
            registrarAjusteComissao(tipoProduto, valorReal, valorSimulado);
        }

        // let valorSimulado;
        // if (!isNaN(input.value) && input.value !== '') {
        //     const valorSimulado = valorReal + ajuste;
        //     registrarAjusteComissao(tipoProduto, input.name, valorReal, valorSimulado);
        // }
        // console.log("ajuste", ajuste)
        console.log(ajuste === 0 && input.value !== '-')
        if (ajuste === 0 && input.value !== '-') {
            // console.log(tipoProduto, input.name, valorReal, valorReal)
            registrarAjusteComissao(tipoProduto, valorReal, valorReal);
        }
    });
}

// Helper para formatar nomes de produtos para exibição
export function formatarNomeProduto(nome) {
    // Casos especiais que precisam de formatação específica
    const casosEspeciais = {
        
        // Crédito
        "cp": "CP",
        "cartoes": "Cartões",
        "microcredito": "Microcrédito",
        "internegocios": "Internegócios",
        "capital_de_giro": "Capital de Giro",
        
        // Captações
        "cdb": "CDB",
        "poupanca": "Poupança",
        "dav": "DAV",
        "captacoes_comex": "Captações Comex",
        "lf": "LF",
        "coe": "COE",
        
        // Comissões
        "tarifas_de_credito": "Tarifas de Crédito",
        "mercado_de_capitais": "Mercado de Capitais",
        "cartoes": "Cartões", // Já definido acima
        "fx": "FX",
        "fianca": "Fiança",
        "adquirencia": "Adquirência",
        "capitalizacao": "Capitalização",
        "aaa": "AAA",
        "fidelizacao_inss": "Fidelização INSS"
    };
    
    // Verificar se existe um caso especial para este nome
    if (casosEspeciais[nome.toLowerCase()]) {
        return casosEspeciais[nome.toLowerCase()];
    }
    
    // Caso padrão: substitui underscores por espaços e capitaliza cada palavra
    return nome
        .split('_')
        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
        .join(' ');
}

// Função auxiliar para buscar ajustes existentes por segmento/tipo/campo
// Versão alternativa que usa o contexto
function buscarAjuste(segmento, tipo, campo, contexto) {
    const { ajustes } = obterEstadoSimulador();
    
    // Determinar a categoria com base no contexto
    let categoria;
    if (contexto === 'comissoes' || campo === 'valor') {
        categoria = 'comissoes';
    } else if (contexto === 'credito') {
        categoria = 'credito';
    } else if (contexto === 'captacoes') {
        categoria = 'captacoes';
    } else {
        // Se o contexto não for especificado, tenta determinar pela estrutura
        if (campo === 'provisao') {
            categoria = 'credito'; // Apenas crédito tem provisão
        } else {
            // Para carteira e spread, verifica ambos
            const chaveCredito = `${segmento}-${tipo}`;
            if (ajustes.credito[chaveCredito] && ajustes.credito[chaveCredito][campo]) {
                return ajustes.credito[chaveCredito][campo].diferenca;
            }
            
            const chaveCaptacoes = `${segmento}-${tipo}`;
            if (ajustes.captacoes[chaveCaptacoes] && ajustes.captacoes[chaveCaptacoes][campo]) {
                return ajustes.captacoes[chaveCaptacoes][campo].diferenca;
            }
            
            return null;
        }
    }
    
    // Busca o ajuste na categoria determinada
    const chave = `${segmento}-${tipo}`;
    
    if (categoria === 'comissoes') {
        const ajuste = ajustes.comissoes[chave];
        return ajuste ? ajuste.diferenca : null;
    } else {
        const categoriaAjustes = ajustes[categoria][chave];
        return categoriaAjustes && categoriaAjustes[campo] ? categoriaAjustes[campo].diferenca : null;
    }
}

export function atualizarTabelaCredito(dados, isSimulado) {
    const tbody = document.getElementById('credito-body');
    
    if (!tbody) return;
    
    // Se for para exibir dados reais, limpa a tabela primeiro
    if (!isSimulado) {
        tbody.innerHTML = '';
    }
    
    // Percorre os dados e insere ou atualiza as linhas na tabela
    dados.forEach(item => {
        let row;

        const { segmentoAtual } = obterEstadoSimulador();
        
        if (!isSimulado) {
            // Cria uma nova linha para dados reais
            row = document.createElement('tr');
            row.setAttribute('data-tipo', item.tipo);
            row.setAttribute('data-carteira-real', item.carteira);
            row.setAttribute('data-spread-real', item.spread);
            row.setAttribute('data-provisao-real', item.provisao);
            row.setAttribute('data-margem-real', item.margem);
            row.setAttribute('data-rwa-real', item.rwa);

            if (item.tipo.toLowerCase() === 'demais') {
                row.style.backgroundColor = '#f8f8f8'; // Fundo cinza claro
                row.style.fontStyle = 'italic'; // Texto em itálico
                row.classList.add('row-demais');
                // inputCarteira.classList.add('input-demais');
                // inputSpread.classList.add('input-demais');
            }
            
            // Adiciona o nome do tipo de produto
            const cellTipo = document.createElement('td');
            cellTipo.textContent = formatarNomeProduto(item.tipo);
            row.appendChild(cellTipo);
            
            // Adiciona a célula de carteira real
            const cellCarteira = document.createElement('td');
            cellCarteira.textContent = formatarValor(item.carteira, 'inteiro');
            row.appendChild(cellCarteira);
            
            // Adiciona a célula de carteira simulada (input)
            const cellCarteiraSimulada = document.createElement('td');
            const inputCarteira = document.createElement('input');
            inputCarteira.type = 'text';
            inputCarteira.name = 'carteira';
            inputCarteira.className = 'carteira-simulada';
            inputCarteira.placeholder = "0"; // Mostra que é um ajuste
            inputCarteira.value = ""; // Começa com 0 (sem ajuste)
            // inputCarteira.step = "any"; // Permite qualquer incremento, incluindo números negativos
    
            // Obter o segmento atual do estado do simulador
            // const { segmentoAtual } = obterEstadoSimulador();

            // AQUI ESTÁ A MUDANÇA: Verificar se existe um ajuste para este campo
            const ajusteCarteira = buscarAjuste(segmentoAtual, item.tipo, 'carteira', 'credito');
            if (ajusteCarteira !== null) {
                inputCarteira.value = ajusteCarteira;
            } else {
                inputCarteira.value = "";
            }

            // // Armazena o valor real para referência
            inputCarteira.setAttribute('data-carteira-real', item.carteira);
            let previousValueCarteira = inputCarteira.value;
            inputCarteira.addEventListener('input', (e) => {
                const regex = /^-?\d*$/;
                console.log((regex.test(e.target.value)))
                if (!regex.test(e.target.value)) {
                    e.target.value = previousValueCarteira;
                } else {
                    previousValueCarteira = e.target.value;
                }

            });
            
            // Desabilita o input para o tipo "demais"
            if (item.tipo.toLowerCase() === 'demais') {
                inputCarteira.disabled = true;
            }
            
            cellCarteiraSimulada.appendChild(inputCarteira);
            row.appendChild(cellCarteiraSimulada);
            
            // Adiciona a célula de spread real
            const cellSpread = document.createElement('td');
            cellSpread.textContent = formatarValor(item.spread, 'spread');
            row.appendChild(cellSpread);
            
            // Adiciona a célula de spread simulado (input)
            const cellSpreadSimulado = document.createElement('td');
            const inputSpread = document.createElement('input');
            inputSpread.type = 'text'; // Mudando para text em vez de number
            inputSpread.name = 'spread';
            inputSpread.className = 'spread-simulado';
            inputSpread.placeholder = "0"; // Mostra zero como placeholder
            inputSpread.value = ""; // Campo vazio inicialmente

            const ajusteSpread = buscarAjuste(segmentoAtual, item.tipo, 'spread', 'credito');
            if (ajusteSpread !== null) {
                inputSpread.value = Number(ajusteSpread).toFixed(2);;
            } else {
                inputSpread.value = "";
            }

            // let previousValue = inputSpread.value;

            // Adicione o valor real como atributo de dados
            inputSpread.setAttribute('data-spread-real', item.spread);
            // let previousValue = '';
            let previousValue = inputSpread.value;
            // Adicionar validação para aceitar apenas números com sinal
            inputSpread.addEventListener('input', (e) => {
                // Permitir apenas números, vírgula e sinal negativo
                const regex = /^-?\d*([.,]\d*)?$/;
                console.log(regex.test(e.target.value))
                console.log(previousValue)
                if (!regex.test(e.target.value)) {
                    e.target.value = previousValue;
                } else {
                    // Se for válido, armazene o valor atual
                    previousValue = e.target.value;
                }
            });

            // Desabilita o input para o tipo "demais"
            if (item.tipo.toLowerCase() === 'demais') {
                inputSpread.disabled = true;
            }
            
            cellSpreadSimulado.appendChild(inputSpread);
            row.appendChild(cellSpreadSimulado);
            
            // Adiciona a célula de provisão real
            const cellProvisao = document.createElement('td');
            cellProvisao.textContent = formatarValor(item.provisao, 'inteiro');
            row.appendChild(cellProvisao);
            
            // Adiciona a célula de provisão simulada (input)
            const cellProvisaoSimulada = document.createElement('td');
            const inputProvisao = document.createElement('input');
            inputProvisao.type = 'text';
            inputProvisao.name = 'provisao';
            inputProvisao.className = 'provisao-simulada';
            inputProvisao.placeholder = "0"; // Mostra zero como placeholder
            inputProvisao.value = ""; // Campo vazio inicialmente

            const ajusteProvisao = buscarAjuste(segmentoAtual, item.tipo, 'provisao', 'credito');
            if (ajusteProvisao !== null) {
                inputProvisao.value = ajusteProvisao;
            } else {
                inputProvisao.value = "";
            }

            inputProvisao.setAttribute('data-provisao-real', item.provisao);
            // inputSpread.setAttribute('data-spread-real', item.spread);
            let previousValueProvisao = inputProvisao.value;
            // Adicionar validação para aceitar apenas números com sinal
            inputProvisao.addEventListener('input', (e) => {
                const regex = /^-?\d*$/;
                console.log((regex.test(e.target.value)))
                if (!regex.test(e.target.value)) {
                    e.target.value = previousValueProvisao;
                } else {
                    previousValueProvisao = e.target.value;
                }
            });            
            // Desabilita o input para o tipo "demais"
            if (item.tipo.toLowerCase() === 'demais') {
                inputProvisao.disabled = true;
            }
            
            cellProvisaoSimulada.appendChild(inputProvisao);
            row.appendChild(cellProvisaoSimulada);
            
            // Adiciona a célula de margem real
            const cellMargem = document.createElement('td');
            cellMargem.textContent = formatarValor(item.margem, 'inteiro');
            row.appendChild(cellMargem);
            
            // Adiciona a célula de margem simulada (calculada)
            const cellMargemSimulada = document.createElement('td');
            cellMargemSimulada.className = 'margem-simulada';
            cellMargemSimulada.textContent = formatarValor(item.margem, 'inteiro');
            row.appendChild(cellMargemSimulada);
            
            // Adiciona a célula de RWA real
            const cellRWA = document.createElement('td');
            cellRWA.textContent = formatarValor(item.rwa, 'inteiro');
            row.appendChild(cellRWA);
            
            // Adiciona a célula de RWA simulado (calculado)
            const cellRWASimulado = document.createElement('td');
            cellRWASimulado.className = 'rwa-simulado';
            cellRWASimulado.textContent = formatarValor(item.rwa, 'inteiro');
            row.appendChild(cellRWASimulado);
            tbody.appendChild(row);

            



        } else {
            // Para dados simulados, atualiza os valores nas células existentes
            row = [...tbody.querySelectorAll('tr')].find(r => r.getAttribute('data-tipo') === item.tipo);
            
            if (row) {
                // Atualiza os valores simulados
                console.log("diferença margem", Math.round(item.margemSimulada - item.margem))

                const diferencaMargem = item.margemSimulada - item.margem < 0.1 ? 0 : item.margemSimulada - item.margem;
                const diferencaRWA = item.rwaSimulado - item.rwa < 0.1 ? 0 : item.rwaSimulado - item.rwa;

                row.querySelector('.margem-simulada').textContent = formatarValor(diferencaMargem, 'inteiro');
                row.querySelector('.rwa-simulado').textContent = formatarValor(diferencaRWA , 'inteiro');
                
                // Preenche os inputs com os valores simulados
                // const inputCarteira = row.querySelector('input[name="carteira"]');
                // if (inputCarteira && !inputCarteira.value) {
                //     inputCarteira.value = item.carteiraSimulada;
                // }

                // Para o campo de carteira, mostre apenas o ajuste, não o valor total
                const inputCarteira = row.querySelector('input[name="carteira"]');
                if (inputCarteira) {
                    const valorReal = parseFloat(inputCarteira.getAttribute('data-carteira-real'));
                    const ajuste = item.carteiraSimulada - valorReal;
                    // inputCarteira.value = ajuste;
        
                    // Se o ajuste for 0, deixe o campo vazio
                    if (ajuste === 0) {
                        inputCarteira.value = '';
                    }
                }
                
                // Para o campo de spread, mostre apenas o ajuste, não o valor total
                const inputSpread = row.querySelector('input[name="spread"]');
                if (inputSpread) {
                    const valorReal = parseFloat(inputSpread.getAttribute('data-spread-real'));
                    const ajuste = item.spreadSimulado - valorReal;
                    
                    // Se o ajuste for 0, deixe o campo vazio
                    // if (ajuste === 0) {
                    //     inputSpread.value = '';
                    // } 
                    // else {
                    //     inputSpread.value = ajuste.toFixed(2); // Formata o ajuste com 2 casas decimais
                    // }
                }
                
                const inputProvisao = row.querySelector('input[name="provisao"]');
                if (inputProvisao && !inputProvisao.value) {
                    const valorReal = parseFloat(inputProvisao.getAttribute('data-provisao-real'));
                    const ajuste = item.provisaoSimulada - valorReal;
                    
                    if (ajuste === 0) {
                        inputProvisao.value = '';
                    } 
                    // inputProvisao.value = Math.round(ajuste);
                    // inputProvisao.value = Math.round(item.provisaoSimulada);
                }
            }
        }
    });
}

// Atualiza a tabela de captações com os dados fornecidos
export function atualizarTabelaCaptacoes(dados, isSimulado) {
    const tbody = document.getElementById('captacoes-body');
    
    if (!tbody) return;
    
    // Se for para exibir dados reais, limpa a tabela primeiro
    if (!isSimulado) {
        tbody.innerHTML = '';
    }
    
    // Percorre os dados e insere ou atualiza as linhas na tabela
    dados.forEach(item => {
        let row;
        
        const { segmentoAtual } = obterEstadoSimulador();

        if (!isSimulado) {
            // Cria uma nova linha para dados reais
            row = document.createElement('tr');
            row.setAttribute('data-tipo', item.tipo);
            row.setAttribute('data-carteira-real', item.carteira);
            row.setAttribute('data-spread-real', item.spread);
            row.setAttribute('data-margem-real', item.margem);
    
            // Adicione este bloco para estilizar a linha "demais"
            if (item.tipo.toLowerCase() === 'demais') {
                row.style.backgroundColor = '#f8f8f8'; // Fundo cinza claro
                row.style.fontStyle = 'italic'; // Texto em itálico
                row.classList.add('row-demais');
                // inputCarteira.classList.add('input-demais');
                // inputSpread.classList.add('input-demais');
            }
            
            // Adiciona o nome do tipo de produto
            const cellTipo = document.createElement('td');
            cellTipo.textContent = formatarNomeProduto(item.tipo);
            row.appendChild(cellTipo);
            
            // Adiciona a célula de carteira real
            const cellCarteira = document.createElement('td');
            cellCarteira.textContent = formatarValor(item.carteira, 'inteiro');
            row.appendChild(cellCarteira);
            
            // Adiciona a célula de carteira simulada (input)
            const cellCarteiraSimulada = document.createElement('td');
            const inputCarteira = document.createElement('input');
            inputCarteira.type = 'text'; // Use text em vez de number
            inputCarteira.name = 'carteira';
            inputCarteira.className = 'carteira-simulada';
            inputCarteira.placeholder = "0"; // Mostra zero como placeholder
            inputCarteira.value = ""; // Campo vazio para permitir digitar sinal negativo

            const ajusteCarteira = buscarAjuste(segmentoAtual, item.tipo, 'carteira', 'captacoes');
            if (ajusteCarteira !== null) {
                inputCarteira.value = ajusteCarteira;
            } else {
                inputCarteira.value = "";
            }

            // Adicione o valor real como atributo de dados
    
            // // Armazena o valor real para referência
            inputCarteira.setAttribute('data-carteira-real', item.carteira);
            let previousValueCarteira = inputCarteira.value;
            // Adicionar validação para aceitar apenas números com sinal
            inputCarteira.addEventListener('input', (e) => {
                // Permitir apenas dígitos, sinal de menos e vírgula/ponto
                // console.log(e)
                const regex = /^-?\d*$/;
                // if (e.key === '-' && this.selectionStart === 0) {
                //     // console.log(this.selectionStart)
                //     return true;
                // } else
                // console.log((!regex.test(e.target.value) && e.target.value !== ''))
                
                console.log((regex.test(e.target.value)))
                if (!regex.test(e.target.value)) {
                    // Se não for válido, limpe caracteres inválidos
                    // e.target.value = e.target.value.replace(/[^\d]/g, '');
                    e.target.value = previousValueCarteira;
                } else {
                    // Se for válido, armazene o valor atual
                    previousValueCarteira = e.target.value;
                }
                console.log("previous", previousValueCarteira)

            });

            // Desabilita o input para o tipo "demais"
            if (item.tipo.toLowerCase() === 'demais') {
                inputCarteira.disabled = true;
            }
            
            cellCarteiraSimulada.appendChild(inputCarteira);
            row.appendChild(cellCarteiraSimulada);
            
            // Adiciona a célula de spread real
            const cellSpread = document.createElement('td');
            cellSpread.textContent = formatarValor(item.spread, 'spread');
            row.appendChild(cellSpread);
            
            // Adiciona a célula de spread simulado (input)
            // Na parte onde cria os inputs de spread
            const cellSpreadSimulado = document.createElement('td');
            const inputSpread = document.createElement('input');
            inputSpread.type = 'text'; // Mudando para text em vez de number
            inputSpread.name = 'spread';
            inputSpread.className = 'spread-simulado';
            inputSpread.placeholder = "0"; // Mostra zero como placeholder
            inputSpread.value = ""; // Campo vazio inicialmente

            const ajusteSpread = buscarAjuste(segmentoAtual, item.tipo, 'spread', 'captacoes');
            if (ajusteSpread !== null) {
                inputSpread.value = Number(ajusteSpread).toFixed(2);;
            } else {
                inputSpread.value = "";
            }

            // let previousValue = inputSpread.value;

            // Adicione o valor real como atributo de dados
            inputSpread.setAttribute('data-spread-real', item.spread);
            // let previousValue = '';
            let previousValue = inputSpread.value;

            // Adicionar validação para aceitar apenas números com sinal
            inputSpread.addEventListener('input', (e) => {
                // Permitir apenas números, vírgula e sinal negativo
                const regex = /^-?\d*([.,]\d*)?$/;
                console.log(regex.test(e.target.value))
                // console.log(e.target.value !== '-')
                // console.log(e.target.value !== '')
                // console.log(e.target.value)
                if (!regex.test(e.target.value)) {
                    // Se não for válido, limpe caracteres inválidos
                    // e.target.value = e.target.value.replace(/[^\d]/g, '');
                    e.target.value = previousValue;
                } else {
                    // Se for válido, armazene o valor atual
                    previousValue = e.target.value;
                }
                console.log("previous", previousValue)
            });

            // Desabilita o input para o tipo "demais"
            if (item.tipo.toLowerCase() === 'demais') {
                inputSpread.disabled = true;
            }

            cellSpreadSimulado.appendChild(inputSpread);
            row.appendChild(cellSpreadSimulado);
            
            // Adiciona a célula de margem real
            const cellMargem = document.createElement('td');
            cellMargem.textContent = formatarValor(item.margem, 'inteiro');
            row.appendChild(cellMargem);
            
            // Adiciona a célula de margem simulada (calculada)
            const cellMargemSimulada = document.createElement('td');
            cellMargemSimulada.className = 'margem-simulada';
            cellMargemSimulada.textContent = formatarValor(item.margem, 'inteiro'); // Valor inicial igual ao real (ERRO 5)
            row.appendChild(cellMargemSimulada);
            
            tbody.appendChild(row);
        } else {
            // Para dados simulados, atualiza os valores nas células existentes
            row = [...tbody.querySelectorAll('tr')].find(r => r.getAttribute('data-tipo') === item.tipo);
            
            if (row) {
                // Atualiza os valores simulados
                const diferencaMargem = item.margemSimulada - item.margem < 0.1 ? 0 : item.margemSimulada - item.margem;
                row.querySelector('.margem-simulada').textContent = formatarValor(diferencaMargem, 'inteiro');
                
                // Preenche os inputs com os valores simulados
                // Para o campo de carteira, mostre apenas o ajuste, não o valor total
                const inputCarteira = row.querySelector('input[name="carteira"]');
                if (inputCarteira) {
                    const valorReal = parseFloat(inputCarteira.getAttribute('data-carteira-real'));
                    const ajuste = item.carteiraSimulada - valorReal;
                    
                    // Se o ajuste for 0, deixe o campo vazio
                    if (ajuste === 0) {
                        inputCarteira.value = '';
                    } 
                    // else {
                    //     inputCarteira.value = ajuste;
                    // }
                }

                const inputSpread = row.querySelector('input[name="spread"]');
                if (inputSpread) {
                    const valorReal = parseFloat(inputSpread.getAttribute('data-spread-real'));
                    const ajuste = item.spreadSimulado - valorReal;
                    
                    // Se o ajuste for 0, deixe o campo vazio
                    // if (ajuste === 0) {
                    //     inputSpread.value = '';
                    // } 
                    // else {
                    //     inputSpread.value = ajuste.toFixed(2); // Formata o ajuste com 2 casas decimais
                    // }
                }
            }
        }
    });
}

// Atualiza a tabela de comissões com os dados fornecidos
export function atualizarTabelaComissoes(dados, isSimulado) {
    const tbody = document.getElementById('comissoes-body');
    
    if (!tbody) return;
    
    // Se for para exibir dados reais, limpa a tabela primeiro
    if (!isSimulado) {
        tbody.innerHTML = '';
    }
    
    // Percorre os dados e insere ou atualiza as linhas na tabela
    dados.forEach(item => {
        let row;

        const { segmentoAtual } = obterEstadoSimulador();
        
        if (!isSimulado) {
            // Cria uma nova linha para dados reais
            row = document.createElement('tr');
            row.setAttribute('data-tipo', item.tipo);
            row.setAttribute('data-valor-real', item.valor);

            // Adiciona este bloco para estilizar a linha "demais"
            if (item.tipo.toLowerCase() === 'demais') {
                row.style.backgroundColor = '#f8f8f8'; // Fundo cinza claro
                row.style.fontStyle = 'italic'; // Texto em itálico
                row.classList.add('row-demais');
            }

            // Adiciona o nome do tipo de comissão
            const cellTipo = document.createElement('td');
            cellTipo.textContent = formatarNomeProduto(item.tipo);
            row.appendChild(cellTipo);

            // Adiciona a célula de valor real
            const cellValor = document.createElement('td');
            cellValor.textContent = formatarValor(item.valor, 'inteiro');
            row.appendChild(cellValor);

            // Adiciona a célula de valor simulado (input)
            const cellValorSimulado = document.createElement('td');
            const inputValor = document.createElement('input');
            inputValor.type = 'text'; // Use text em vez de number
            inputValor.name = 'valor';
            inputValor.className = 'valor-simulado-input';
            inputValor.placeholder = "0"; // Mostra zero como placeholder
            inputValor.value = ""; // Campo vazio para permitir digitar sinal negativo

            // AQUI ESTÁ A MUDANÇA: Verificar se existe um ajuste para este campo
            const ajusteValor = buscarAjuste(segmentoAtual, item.tipo, 'valor', 'comissoes');
            if (ajusteValor !== null) {
                inputValor.value = ajusteValor;
            } else {
                inputValor.value = "";
            }

            // // Armazena o valor real para referência
            inputValor.setAttribute('data-valor-real', item.valor);
            let previousValueValor = inputValor.value;

            // Adicione o valor real como atributo de dados
            // inputValor.setAttribute('data-valor-real', item.valor);
            // let previousValueCarteira = '';
            // Adicionar validação para aceitar apenas números com sinal
            inputValor.addEventListener('input', (e) => {
                // Permitir apenas dígitos, sinal de menos e vírgula/ponto
                // console.log(e)
                const regex = /^-?\d*$/;
                // if (e.key === '-' && this.selectionStart === 0) {
                //     // console.log(this.selectionStart)
                //     return true;
                // } else
                // console.log((!regex.test(e.target.value) && e.target.value !== ''))
                
                console.log((regex.test(e.target.value)))
                if (!regex.test(e.target.value)) {
                    // Se não for válido, limpe caracteres inválidos
                    // e.target.value = e.target.value.replace(/[^\d]/g, '');
                    e.target.value = previousValueValor;
                } else {
                    // Se for válido, armazene o valor atual
                    previousValueValor = e.target.value;
                }
                console.log("previous", previousValueValor)
            
            });

            // Desabilita o input para o tipo "demais"
            if (item.tipo.toLowerCase() === 'demais') {
                inputValor.disabled = true;
            }

            cellValorSimulado.appendChild(inputValor);
            row.appendChild(cellValorSimulado);

            // Adiciona a linha à tabela
            tbody.appendChild(row);
        } else {
            // Para dados simulados, atualiza os valores nas células existentes
            row = [...tbody.querySelectorAll('tr')].find(r => r.getAttribute('data-tipo') === item.tipo);
            
            if (row) {
                // Para o campo de valor, mostre apenas o ajuste, não o valor total
                const inputValor = row.querySelector('input[name="valor"]');
                if (inputValor) {
                    const valorReal = parseFloat(inputValor.getAttribute('data-valor-real'));
                    const ajuste = item.valorSimulado - valorReal;
                    
                    // Se o ajuste for 0, deixe o campo vazio
                    if (ajuste === 0) {
                        inputValor.value = '';
                    } else {
                        inputValor.value = ajuste;
                    }
                }
            }
        }
    });
}

// Atualiza a tabela de cascada com os dados fornecidos
// Atualiza a tabela de cascada com os dados fornecidos
export function atualizarTabelaCascada(dadosReais, dadosSimulados) {
    const tbody = document.getElementById('pl-body');
    const tbodyIndicadores = document.getElementById('indicadores-body');
    
    if (!tbody || !tbodyIndicadores || !dadosReais) return;
    
    // Limpa as tabelas
    tbody.innerHTML = '';
    tbodyIndicadores.innerHTML = '';
    
    // Estrutura dos dados para a cascada
    const estruturaCascada = [
        { campo: 'mob', nome: 'MOB' },
        { campo: 'pdd', nome: 'PDD' },
        { campo: 'mol', nome: 'MOL' },
        { campo: 'demais_ativos', nome: 'Demais Ativos' },
        { campo: 'oryp', nome: 'ORYP' },
        { campo: 'total_gastos', nome: 'Total Gastos' },
        { campo: 'bai', nome: 'BAI' },
        { campo: 'impostos', nome: 'Impostos' },
        { campo: 'bdi', nome: 'BDI' }
    ];
    
    // Estrutura dos dados para os indicadores
    const estruturaIndicadores = [
        { campo: 'taxa_impositiva', nome: 'Taxa Impositiva (%)', formato: 'percentual' },
        { campo: 'eficiencia', nome: 'Eficiência (%)', formato: 'percentual' },
        { campo: 'rwa', nome: 'RWA', formato: 'inteiro' },
        { campo: 'rorwa', nome: 'RORWA (%)', formato: 'rorwa' }
    ];
    
    // Adiciona cabeçalho com a nova coluna de diferença (Δ)
    // const headerRow = document.createElement('tr');
    // headerRow.innerHTML = `
    //     <th>Indicador</th>
    //     <th>Real</th>
    //     <th>Simulado</th>
    //     <th>Δ</th>
    //     <th>% PPTO Real</th>
    //     <th>% PPTO Simulado</th>
    // `;
    // tbody.appendChild(headerRow);
    
    // Adiciona as linhas da cascada
    estruturaCascada.forEach(item => {
        const row = document.createElement('tr');
        
        // Adiciona classe especial para linhas de resultado
        if (item.campo === 'mol' || item.campo === 'bai' || item.campo === 'bdi' ) {
            row.classList.add('linha-resultado');
        }
        
        // Célula de nome do indicador
        const cellNome = document.createElement('td');
        cellNome.textContent = item.nome;
        row.appendChild(cellNome);
        
        // Célula do valor real
        const cellReal = document.createElement('td');
        cellReal.textContent = formatarValor(dadosReais.cascada[item.campo], 'inteiro');
        row.appendChild(cellReal);
        
        // Célula do valor simulado
        const cellSimulado = document.createElement('td');
        const valorReal = dadosReais.cascada[item.campo];
        let valorSimulado;
        
        if (dadosSimulados) {
            valorSimulado = dadosSimulados[item.campo];
            cellSimulado.textContent = formatarValor(valorSimulado, 'inteiro');
            
            // Adiciona classe para destacar mudanças (vermelho para negativo, verde para positivo)
            const diferenca = valorSimulado - valorReal;
            const epsilon = 0.01; // Tolerância para considerar valores iguais
            
            if (Math.abs(diferenca) > epsilon) { // Apenas aplica cores se a diferença for significativa
                if (diferenca > 0) {
                    cellSimulado.classList.add('positivo');
                } else if (diferenca < 0) {
                    cellSimulado.classList.add('negativo');
                }
            }
        } else {
            valorSimulado = valorReal;
            cellSimulado.textContent = formatarValor(valorReal, 'inteiro');
        }
        row.appendChild(cellSimulado);
        
        // Nova célula para a diferença
        const cellDiferenca = document.createElement('td');
        const diferenca = valorSimulado - valorReal;
        cellDiferenca.textContent = formatarValor(diferenca, 'inteiro');
        
        // Adiciona classe para destacar mudanças (vermelho para negativo, verde para positivo)
        if (Math.abs(diferenca) > 0.01) { // Apenas aplica cores se a diferença for significativa
            if (diferenca > 0) {
                cellDiferenca.classList.add('positivo');
            } else if (diferenca < 0) {
                cellDiferenca.classList.add('negativo');
            }
        }
        row.appendChild(cellDiferenca);
        
        // Célula de % PPTO Real
        const cellPptoReal = document.createElement('td');
        const campoAtingimento = `atingimento_${item.campo}`;
        cellPptoReal.textContent = formatarValor(dadosReais.atingimento[campoAtingimento], 'percentual');
        row.appendChild(cellPptoReal);
        
        // Célula de % PPTO Simulado
        const cellPptoSimulado = document.createElement('td');
        if (dadosSimulados && dadosSimulados.atingimento) {
            cellPptoSimulado.textContent = formatarValor(dadosSimulados.atingimento[campoAtingimento], 'percentual');
        } else {
            cellPptoSimulado.textContent = formatarValor(dadosReais.atingimento[campoAtingimento], 'percentual');
        }
        row.appendChild(cellPptoSimulado);
        
        tbody.appendChild(row);
    });
    
    // Agora faça o mesmo para a tabela de indicadores
    // const headerRowIndicadores = document.createElement('tr');
    // headerRowIndicadores.innerHTML = `
    //     <th>Indicador</th>
    //     <th>Real</th>
    //     <th>Simulado</th>
    //     <th>Δ</th>
    //     <th>% PPTO Real</th>
    //     <th>% PPTO Simulado</th>
    // `;
    // tbodyIndicadores.appendChild(headerRowIndicadores);
    
    // Adiciona as linhas dos indicadores
    estruturaIndicadores.forEach(item => {
        const row = document.createElement('tr');
        
        // Célula de nome do indicador
        const cellNome = document.createElement('td');
        cellNome.textContent = item.nome;
        row.appendChild(cellNome);
        
        // Célula do valor real
        const cellReal = document.createElement('td');
        cellReal.textContent = formatarValor(dadosReais.cascada[item.campo], item.formato);
        row.appendChild(cellReal);
        
        // Célula do valor simulado
        const cellSimulado = document.createElement('td');
        const valorReal = dadosReais.cascada[item.campo];
        let valorSimulado;
        
        if (dadosSimulados) {
            valorSimulado = dadosSimulados[item.campo];
            cellSimulado.textContent = formatarValor(valorSimulado, item.formato);
            
            // Adiciona classe para destacar mudanças
            const diferenca = valorSimulado - valorReal;
            const epsilon = item.formato === 'percentual' || item.formato === 'rorwa' ? 0.01 : 0.1;
            
            if (Math.abs(diferenca) > epsilon) {
                if ((item.campo === 'rwa') && diferenca < 0) {
                    cellSimulado.classList.add('positivo');
                } else if ((item.campo === 'rwa') && diferenca > 0) {
                    cellSimulado.classList.add('negativo');
                } else if ((item.campo === 'rorwa') && diferenca > 0) {
                    cellSimulado.classList.add('positivo');
                } else if ((item.campo === 'rorwa') && diferenca < 0) {
                    cellSimulado.classList.add('negativo');
                } else if ((item.campo === 'taxa_impositiva' || item.campo === 'eficiencia') && diferenca < 0) {
                    cellSimulado.classList.add('positivo');
                } else if ((item.campo === 'taxa_impositiva' || item.campo === 'eficiencia') && diferenca > 0) {
                    cellSimulado.classList.add('negativo');
                }
            }
        } else {
            valorSimulado = valorReal;
            cellSimulado.textContent = formatarValor(valorReal, item.formato);
        }
        row.appendChild(cellSimulado);
        
        // Nova célula para a diferença
        const cellDiferenca = document.createElement('td');
        const diferenca = valorSimulado - valorReal;
        cellDiferenca.textContent = formatarValor(diferenca, item.formato);
        
        // Adiciona classe para destacar mudanças
        const epsilon = item.formato === 'percentual' || item.formato === 'rorwa' ? 0.01 : 0.1;
        if (Math.abs(diferenca) > epsilon) {
            if ((item.campo === 'rwa') && diferenca < 0) {
                cellDiferenca.classList.add('positivo');
            } else if ((item.campo === 'rwa') && diferenca > 0) {
                cellDiferenca.classList.add('negativo');
            } else if ((item.campo === 'rorwa') && diferenca > 0) {
                cellDiferenca.classList.add('positivo');
            } else if ((item.campo === 'rorwa') && diferenca < 0) {
                cellDiferenca.classList.add('negativo');
            } else if ((item.campo === 'taxa_impositiva' || item.campo === 'eficiencia') && diferenca < 0) {
                cellDiferenca.classList.add('positivo');
            } else if ((item.campo === 'taxa_impositiva' || item.campo === 'eficiencia') && diferenca > 0) {
                cellDiferenca.classList.add('negativo');
            }
        }
        row.appendChild(cellDiferenca);
        
        // Células de atingimento (não aplicável para indicadores)
        const cellPptoReal = document.createElement('td');
        cellPptoReal.textContent = '-';
        row.appendChild(cellPptoReal);
        
        const cellPptoSimulado = document.createElement('td');
        cellPptoSimulado.textContent = '-';
        row.appendChild(cellPptoSimulado);
        
        tbodyIndicadores.appendChild(row);
    });
}

// Atualiza a lista de ajustes realizados
export function atualizarListaAjustes() {
    const listaAjustesCredito = document.getElementById('lista-ajustes-credito');
    const listaAjustesCaptacoes = document.getElementById('lista-ajustes-captacoes');
    const listaAjustesComissoes = document.getElementById('lista-ajustes-comissoes');
    
    if (!listaAjustesCredito || !listaAjustesCaptacoes || !listaAjustesComissoes) return;
    
    // Limpa as listas
    listaAjustesCredito.innerHTML = '';
    listaAjustesCaptacoes.innerHTML = '';
    listaAjustesComissoes.innerHTML = '';
    
    // Obtém a lista de ajustes
    const ajustes = obterListaAjustes();
    
    // Verifica se existem ajustes
    if (!temAjustes() || ajustes.credito.length === 0 && ajustes.captacoes.length === 0 && ajustes.comissoes.length === 0) {
        // Mensagem de nenhum ajuste para cada categoria
        const msgCredito = document.createElement('li');
        msgCredito.className = 'no-ajustes';
        msgCredito.textContent = 'Nenhum ajuste realizado.';
        listaAjustesCredito.appendChild(msgCredito);
        
        const msgCaptacoes = document.createElement('li');
        msgCaptacoes.className = 'no-ajustes';
        msgCaptacoes.textContent = 'Nenhum ajuste realizado.';
        listaAjustesCaptacoes.appendChild(msgCaptacoes);
        
        const msgComissoes = document.createElement('li');
        msgComissoes.className = 'no-ajustes';
        msgComissoes.textContent = 'Nenhum ajuste realizado.';
        listaAjustesComissoes.appendChild(msgComissoes);
        
        return;
    }
    
    // Adiciona ajustes de crédito
    if (ajustes.credito.length === 0) {
        const msgCredito = document.createElement('li');
        msgCredito.className = 'no-ajustes';
        msgCredito.textContent = 'Nenhum ajuste realizado.';
        listaAjustesCredito.appendChild(msgCredito);
    } else {
        ajustes.credito.forEach(ajuste => {
            const item = document.createElement('li');
            
            const info = document.createElement('span');
            info.className = 'ajuste-info';
            
            let nomeCampo = '';
            switch (ajuste.campo) {
                case 'carteira': nomeCampo = 'Carteira'; break;
                case 'spread': nomeCampo = 'Spread'; break;
                case 'provisao': nomeCampo = 'Provisão'; break;
                default: nomeCampo = ajuste.campo;
            }
            
            // Incluir o segmento no texto do ajuste (ERRO 3)
            info.textContent = `${formatarNomeProduto(ajuste.segmento)} - ${formatarNomeProduto(ajuste.tipo)} - ${nomeCampo}`;
            item.appendChild(info);
            
            const valor = document.createElement('span');
            valor.className = ajuste.diferenca > 0 ? 'ajuste-valor positivo' : 'ajuste-valor negativo';
            
            // Formatar o valor conforme o campo
            let valorFormatado = '';
            if (ajuste.campo === 'spread') {
                valorFormatado = `${ajuste.diferenca > 0 ? '+' : ''}${formatarValor(ajuste.diferenca, 'spread')}%`;
            } else {
                valorFormatado = `${ajuste.diferenca > 0 ? '+' : ''}${formatarValor(ajuste.diferenca, 'inteiro')}`;
            }
            
            valor.textContent = valorFormatado;
            item.appendChild(valor);
            
            listaAjustesCredito.appendChild(item);
        });
    }
    
    // Adiciona ajustes de captações
    if (ajustes.captacoes.length === 0) {
        const msgCaptacoes = document.createElement('li');
        msgCaptacoes.className = 'no-ajustes';
        msgCaptacoes.textContent = 'Nenhum ajuste realizado.';
        listaAjustesCaptacoes.appendChild(msgCaptacoes);
    } else {
        ajustes.captacoes.forEach(ajuste => {
            const item = document.createElement('li');
            
            const info = document.createElement('span');
            info.className = 'ajuste-info';
            
            let nomeCampo = '';
            switch (ajuste.campo) {
                case 'carteira': nomeCampo = 'Carteira'; break;
                case 'spread': nomeCampo = 'Spread'; break;
                default: nomeCampo = ajuste.campo;
            }
            
            // Incluir o segmento no texto do ajuste (ERRO 3)
            info.textContent = `${formatarNomeProduto(ajuste.segmento)} - ${formatarNomeProduto(ajuste.tipo)} - ${nomeCampo}`;
            item.appendChild(info);
            
            const valor = document.createElement('span');
            valor.className = ajuste.diferenca > 0 ? 'ajuste-valor positivo' : 'ajuste-valor negativo';
            
            // Formatar o valor conforme o campo
            let valorFormatado = '';
            if (ajuste.campo === 'spread') {
                valorFormatado = `${ajuste.diferenca > 0 ? '+' : ''}${formatarValor(ajuste.diferenca, 'spread')}%`;
            } else {
                valorFormatado = `${ajuste.diferenca > 0 ? '+' : ''}${formatarValor(ajuste.diferenca, 'inteiro')}`;
            }
            
            valor.textContent = valorFormatado;
            item.appendChild(valor);
            
            listaAjustesCaptacoes.appendChild(item);
        });
    }
    
    // Adiciona ajustes de comissões
    if (ajustes.comissoes.length === 0) {
        const msgComissoes = document.createElement('li');
        msgComissoes.className = 'no-ajustes';
        msgComissoes.textContent = 'Nenhum ajuste realizado.';
        listaAjustesComissoes.appendChild(msgComissoes);
    } else {
        ajustes.comissoes.forEach(ajuste => {
            const item = document.createElement('li');
            
            const info = document.createElement('span');
            info.className = 'ajuste-info';
            // Corrigindo para incluir o segmento
            info.textContent = `${formatarNomeProduto(ajuste.segmento)} - ${formatarNomeProduto(ajuste.tipo)}`;
            item.appendChild(info);
            
            const valor = document.createElement('span');
            valor.className = ajuste.diferenca > 0 ? 'ajuste-valor positivo' : 'ajuste-valor negativo';
            valor.textContent = `${ajuste.diferenca > 0 ? '+' : ''}${formatarValor(ajuste.diferenca, 'inteiro')}`;
            item.appendChild(valor);
            
            listaAjustesComissoes.appendChild(item);
        });
    }
}