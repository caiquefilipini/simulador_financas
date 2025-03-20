// config.js - Constantes e configurações da aplicação

export const segments = ['Especial', 'Prospera', 'Select', 'PJ', 'Corporate', 'SCIB', 'Private', 'Consumer'];

// Tipos de crédito por segmento
export const creditTypes = {
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
export const fundingTypes = {
  Especial: ['DAV', 'Contamax', 'CDB', 'Poupança', 'Demais'],
  Prospera: ['DAV', 'Contamax', 'CDB', 'Poupança', 'Demais'],
  Select: ['DAV', 'Contamax', 'CDB', 'Poupança', 'Demais'],
  PJ: ['DAV', 'Contamax', 'CDB', 'Poupança', 'Time Deposit', 'Demais'],
  Corporate: ['DAV', 'Contamax', 'CDB', 'Time Deposit', 'Demais'],
  SCIB: ['DAV', 'Contamax', 'CDB', 'Time Deposit', 'LF', 'Demais'],
  Private: ['DAV', 'Contamax', 'CDB', 'COE', 'Demais'],
  Consumer: []
};

// Tipos de comissão por segmento
export const commissionTypes = {
  Especial: ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas C/C', 'Capitalização', 'Fidelização INSS', 'Esfera', 'Fundos', 'Previdência', 'Demais'],
  Prospera: ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas C/C', 'Capitalização', 'Tecban', 'Esfera', 'Fundos', 'Mercado de Capitais', 'Demais'],
  Select: ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas C/C', 'Capitalização', 'Esfera', 'AAA', 'Fundos', 'Previdência', 'Demais'],
  PJ: ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas C/C', 'Tarifas de Crédito', 'Cash', 'FX', 'Comex', 'Mercado de Capitais', 'Fiança', 'Demais'],
  Corporate: ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas de Crédito', 'FX', 'Comex', 'Mercado de Capitais', 'Fiança', 'Adquirência', 'Demais'],
  SCIB: ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas de Crédito', 'Comex', 'Mercado de Capitais', 'Adquirência', 'Fundos', 'Demais'],
  Private: ['Cartões', 'Seguros Open', 'Seguros Related', 'FX', 'Fiança', 'Fundos', 'Demais'],
  Consumer: ['Seguros Open', 'Seguros Related', 'Mercado de Capitais', 'Fundos', 'Demais']
};

// Estrutura dos objetos de dados P&L
export const DEFAULT_PL_STRUCTURE = {
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

// Estrutura dos indicadores
export const DEFAULT_INDICADORES_STRUCTURE = {
  "Taxa Impositiva": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
  "Eficiência": { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
  RWA: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 },
  RORWA: { real: 0, simulado: 0, atingimentoReal: 0, atingimentoSimulado: 0 }
};