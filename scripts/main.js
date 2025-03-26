// Importação dos módulos
import { inicializarUI } from './ui.js';
import { carregarIndicadores } from './dados.js';
import { inicializarSimulador } from './simulador.js';

// Função principal para inicializar a aplicação
async function inicializar() {
    try {
        // Carrega os dados do JSON
        const indicadores = await carregarIndicadores();
        
        // Inicializa o simulador com os dados carregados
        inicializarSimulador(indicadores);
        
        // Inicializa a interface do usuário
        inicializarUI();
        
        console.log('Simulador inicializado com sucesso!');
    } catch (erro) {
        console.error('Erro ao inicializar o simulador:', erro);
        alert('Ocorreu um erro ao carregar o simulador. Por favor, tente novamente.');
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializar);