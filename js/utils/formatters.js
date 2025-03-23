// Versão melhorada da função formatNumber em utils/formatters.js

export function formatNumber(num) {
  if (num === undefined || num === null) return "0";
  
  // Garantir que o número é tratado como número
  num = parseFloat(num);
  
  // Arredondar para inteiro quando for um valor maior que 1
  // Isso elimina as casas decimais em valores grandes
  if (Math.abs(num) >= 1) {
    num = Math.round(num);
  }
  
  // Formatar com separadores de milhar segundo padrão brasileiro
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// Versão alternativa com tratamento mais específico
export function formatNumberPrecise(num, type = 'default') {
  if (num === undefined || num === null) return "0";
  
  // Converter para número
  num = parseFloat(num);
  
  // Diferentes tipos de formatação baseados no contexto
  switch (type) {
    case 'currency':
      // Para valores monetários (sempre arredondados)
      return Math.round(num).toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      
    case 'percentage':
      // Para percentuais (1 casa decimal)
      return num.toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }) + '%';
      
    case 'small':
      // Para valores pequenos (pode manter decimais)
      return num.toLocaleString('pt-BR', {
        minimumFractionDigits: Math.abs(num) < 1 ? 2 : 0,
        maximumFractionDigits: Math.abs(num) < 1 ? 2 : 0
      });
      
    default:
      // Padrão para valores grandes (sempre arredondados)
      return Math.round(num).toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
  }
}