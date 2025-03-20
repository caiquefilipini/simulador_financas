




// Função para calcular provisão simulada baseada em alteração da carteira
function calcularProvisaoSimulada(provisaoReal, carteiraReal, carteiraSimulada) {
    if (carteiraReal === 0) return 0;
    return (provisaoReal / carteiraReal) * carteiraSimulada;
  }
  
  
  // Função para calcular provisão simulada baseada em alteração da carteira
  function calcularComissaoSimulada(comissaoReal, carteiraReal, carteiraSimulada) {
    if (carteiraReal === 0) return 0;
    return (comissaoReal / carteiraReal) * carteiraSimulada;
  }