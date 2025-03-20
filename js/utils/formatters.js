// formatters.js - Utilitários para formatação de dados

// Formata números para exibição
export function formatNumber(num) {
    if (isNaN(num)) return "0";
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
  
  // Formata percentuais
  export function formatPercent(num, decimals = 2) {
    if (isNaN(num)) return "0%";
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + '%';
  }
  
  // Formata valores monetários
  export function formatCurrency(num) {
    if (isNaN(num)) return "R$ 0,00";
    return num.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  // Formata datas (DD/MM/YYYY)
  export function formatDate(date) {
    if (!date) return "";
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleDateString('pt-BR');
  }