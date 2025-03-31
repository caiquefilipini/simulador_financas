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

// Adicione este código ao seu arquivo principal (main.js)
window.addEventListener('beforeunload', function(event) {
    // Limpar recursos e finalizar processos pendentes
    
    // Se você estiver usando Web Workers, por exemplo:
    if (window.worker) {
        window.worker.terminate();
    }
    
    // Se você tiver timers ou intervalos ativos:
    clearAllIntervals();
    clearAllTimeouts();
    
    // Se você tiver conexões abertas com servidores:
    closeAllConnections();
    
    // Opcional: mostrar uma mensagem de confirmação
    // (A maioria dos navegadores modernos ignora o texto personalizado por razões de segurança)
    event.preventDefault();
    event.returnValue = '';
});

// Função auxiliar para limpar todos os intervalos
function clearAllIntervals() {
    // Se você estiver rastreando seus intervalos:
    if (window.myIntervals && Array.isArray(window.myIntervals)) {
        window.myIntervals.forEach(id => clearInterval(id));
    }
}

// Função auxiliar para limpar todos os timeouts
function clearAllTimeouts() {
    // Se você estiver rastreando seus timeouts:
    if (window.myTimeouts && Array.isArray(window.myTimeouts)) {
        window.myTimeouts.forEach(id => clearTimeout(id));
    }
}

// Função auxiliar para fechar conexões
function closeAllConnections() {
    // Feche quaisquer conexões de WebSocket:
    if (window.socket && window.socket.readyState === WebSocket.OPEN) {
        window.socket.close();
    }
    
    // Abortar solicitações fetch pendentes:
    if (window.abortControllers && Array.isArray(window.abortControllers)) {
        window.abortControllers.forEach(controller => controller.abort());
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializar);

