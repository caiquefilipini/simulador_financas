/**
 * Módulo de gerenciamento de dados
 * Responsável por carregar e preparar os dados do simulador
 */

// Função para carregar os dados do arquivo JSON
export async function carregarIndicadores() {
    try {
        const resposta = await fetch('dict_indicadores.json');
        
        if (!resposta.ok) {
            throw new Error(`Erro ao carregar dados: ${resposta.status}`);
        }
        
        const dados = await resposta.json();
        console.log('Dados carregados com sucesso!');
        return dados;
    } catch (erro) {
        console.error('Erro ao carregar indicadores:', erro);
        throw erro;
    }
}

// Função para obter a lista de segmentos disponíveis
export function obterSegmentos(dados) {
    return Object.keys(dados).filter(segmento => segmento !== 'total');
}

// Função para formatar valores numéricos conforme as regras específicas
export function formatarValor(valor, tipo) {
    if (valor === undefined || valor === null) return '-';
    
    switch (tipo) {
        case 'spread':
            // Spread: decimal com 2 casas
            return valor.toFixed(2);
        
        case 'percentual':
            // Taxa impositiva, rorwa, eficiência e atingimentos: decimal com 1 casa
            return valor.toFixed(1);
            
        case 'inteiro':
        default:
            // Demais números: inteiros com ponto como separador de milhar
            return Math.round(valor).toLocaleString('pt-BR');
    }
}

// Função para obter os tipos de produto para cada categoria
export function obterTiposProduto(dados, segmento, categoria) {
    if (!dados || !dados[segmento] || !dados[segmento][categoria]) {
        return [];
    }
    
    // Obtém os tipos de produtos disponíveis para a categoria selecionada
    const dadosCategoria = dados[segmento][categoria];
    const primeiraPropriedade = Object.keys(dadosCategoria)[0]; // Ex: "carteira", "spread", "comissoes"
    
    if (!dadosCategoria[primeiraPropriedade]) {
        return [];
    }
    
    return Object.keys(dadosCategoria[primeiraPropriedade]);
}