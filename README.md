# Simulador Finanças Bancárias

## Arquitetura Modularizada com o Princípio da Responsabilidade Única

### Visão Geral da Arquitetura

A arquitetura proposta segue o princípio da responsabilidade única, que indica que cada módulo ou classe deve ter uma única responsabilidade. Isso torna o código mais manutenível, testável e fácil de entender.

```
/js
|-- main.js                  # Inicialização e controle principal da aplicação
|-- config.js                # Configurações e constantes
|-- models/
|   |-- dataModels.js        # Definições e gerenciamento de estado
|   |-- calculationModels.js # Funções de cálculo e simulação
|-- services/
|   |-- dataService.js       # Carregamento e processamento de dados externos
|-- ui/
|   |-- creditUI.js          # UI relacionada ao crédito
|   |-- fundingUI.js         # UI relacionada às captações
|   |-- commissionUI.js      # UI relacionada às comissões
|   |-- plUI.js              # UI relacionada ao P&L e indicadores
|   |-- adjustmentsUI.js     # UI relacionada aos ajustes
|   |-- tabsUI.js            # Gerenciamento de abas
|-- utils/
    |-- formatters.js        # Funções de formatação
```

### Responsabilidades de Cada Módulo

1. **main.js**
   - Inicialização da aplicação
   - Coordenação entre os diferentes módulos
   - Configuração de eventos globais

2. **config.js**
   - Definição de constantes e configurações
   - Estruturas de dados estáticas (tipos de crédito, captação, comissão por segmento)

3. **models/**
   - **dataModels.js**: Gerencia o estado da aplicação e suas estruturas
   - **calculationModels.js**: Contém todos os cálculos e fórmulas da aplicação

4. **services/**
   - **dataService.js**: Gerencia carregamento e processamento de dados externos

5. **ui/**
   - Cada arquivo gerencia uma parte específica da interface do usuário
   - Handlers de eventos específicos de cada componente

6. **utils/**
   - Funções utilitárias reutilizáveis

### Fluxo de Dados

1. **Dados** → O usuário interage com a interface ou um arquivo é carregado
2. **UI** → Os módulos de UI capturam essas interações e atualizam o estado
3. **Models** → Os cálculos são realizados com base no estado atualizado
4. **UI** → A interface é atualizada para refletir os novos resultados

### Vantagens Desta Arquitetura

1. **Manutenibilidade**: Mudanças em uma área específica afetam apenas os módulos relacionados
2. **Testabilidade**: Cada função tem uma responsabilidade clara, facilitando a escrita de testes
3. **Reusabilidade**: Funções comuns são compartilhadas entre diferentes partes da aplicação
4. **Escalabilidade**: Novas funcionalidades podem ser adicionadas em módulos específicos
5. **Legibilidade**: Código mais organizado e fácil de entender

### Guia de Implementação

Para implementar esta arquitetura, recomenda-se:

1. Criar a estrutura de diretórios e arquivos conforme definido acima
2. Adaptar os códigos fornecidos para cada arquivo
3. Atualizar o HTML para carregar os módulos via ES modules:

```html
<script type="module" src="js/main.js"></script>
```

4. Verificar se todas as dependências entre os módulos estão corretamente importadas
5. Testar cada módulo separadamente antes de integrá-los

### Considerações Adicionais

- **Tratamento de Erros**: Implemente try/catch em operações críticas
- **Logging**: Mantenha logs de ações importantes para depuração
- **Validação de Dados**: Adicione validação para os inputs do usuário
- **Performance**: Para grandes conjuntos de dados, considere otimizações adicionais

Esta arquitetura oferece um equilíbrio entre separação de responsabilidades e praticidade, mantendo o código organizado e manutenível sem adicionar complexidade desnecessária.