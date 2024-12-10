
# Flight Analyzer Backend

## 🚀 Motivação do Projeto

O **Flight Analyzer Backend** foi desenvolvido como parte de uma solução para análise de voos, fornecendo previsões sobre atrasos, estimativas de tempo de voo e recomendações de companhias aéreas baseadas em inteligência artificial. O objetivo principal é auxiliar tanto viajantes quanto empresas aéreas a tomarem decisões mais informadas sobre trajetos.

Este projeto também foi criado com foco em modularidade e escalabilidade, utilizando práticas modernas de engenharia de software, como divisão em camadas (controllers, services, utils) e integração com modelos de aprendizado de máquina.

---

## 🛠️ Arquitetura do Projeto

A arquitetura do projeto segue o padrão **MVC (Model-View-Controller)** adaptado, com camadas adicionais para serviços, utilitários e processadores de modelos de IA.

### Estrutura de Pastas

```plaintext
flight-analyzer-backend/
│
├── ai/                    # Gerencia os modelos e scripts de IA
│   ├── models/            # Modelos treinados em formato .pkl
│   └── processors/        # Scripts Python que processam os modelos
│       ├── air_company_recomendation.py
│       └── flight_analysis.py
│
├── controllers/           # Controladores das rotas
│   ├── airportsController.js
│   └── flightController.js
│
├── data/                  # Dados CSV utilizados pelo projeto
│   ├── aerodromos.csv
│   └── registros_temp_voos.csv
│
├── loaders/               # Módulo responsável por carregar dados
│   └── dataLoaders.js
│
├── notebooks/             # Processamento de dados e preparação dos CSVs
│   ├── flight_analyser.ipynb  # Notebook responsável por tratar os dados crus.
│   └── content/                # Contém os CSVs necessários para executar o notebook.
│       ├── aerodromos.csv
│       ├── registros_temp_voos.csv
│       └── vra/               # Dados crus baixados da ANAC.
│           ├── ...            # Subdiretórios e arquivos originais.
│
├── routes/                # Rotas da aplicação
│   ├── airportsRoutes.js
│   └── flightRoutes.js
│
├── services/              # Lógica de negócios e consumo de APIs externas
│   ├── aiService.js
│   ├── flightService.js
│   └── weatherDataService.js
│
├── test/                  # Testes unitários e de integração
│   └── api.test.js
│
└── utils/                 # Funções utilitárias
    └── flightUtils.js
```

---

## 📊 Modelagem dos Dados (`/data`)
OBS: A aplicação não possui(Por não necessidade) uma estrutura de armazenamento de dados em SGBD(Software de Gerenciamento de Banco de Dados), os principais dados consumidos pelo frontend são fixos/não variáveis e por isso são aramzenados e consumidos de arquivos '.csv'
### Dados dos Aeroportos (`aerodromos.csv`)
- **SIGLA ICAO AERÓDROMO**: Código ICAO do aeroporto.
- **SIGLA IATA AERÓDROMO**: Código IATA do aeroporto.
- **NOME AERÓDROMO**: Nome oficial do aeroporto.
- **MUNICÍPIO AERÓDROMO**: Cidade onde o aeroporto está localizado.
- **LATITUDE**: Coordenada geográfica.
- **LONGITUDE**: Coordenada geográfica.

### Dados dos Voos (`registros_temp_voos.csv`)
- **Nº Voo**: Número do voo.
- **Equip.**: Tipo de aeronave utilizada.
- **Cód. Origem**: Código ICAO do aeroporto de origem.
- **Cód. Destino**: Código ICAO do aeroporto de destino.
- **Tempo esperado de voo**: Estimativa em minutos.

---

## 🔧 Configurações e Dependências

### Dependências Principais
- **Node.js**: Plataforma JavaScript para execução no lado do servidor.
- **Express.js**: Framework para criação de APIs.
- **csvtojson**: Biblioteca para converter arquivos CSV para JSON.
- **dotenv**: Gerenciamento de variáveis de ambiente.
- **Jest**: Framework para testes.
- **Python**: Para processar os modelos de IA.

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes configurações:
```env
PORT=3001
WEATHER_DATA_API_KEY=YOUR_API_KEY_HERE
```

---

## 🖥️ Como Executar o Projeto

### Requisitos
- Node.js 16+
- Python 3.9+
- Instale as dependências do projeto com o comando:
  ```bash
  npm install
  pip install -r requirements.txt
  ```

### Passo a Passo
1. Inicie o backend:
   ```bash
   node server.js
   ```
2. Execute os testes unitários:
   ```bash
   npm test
   ```

---


## 📚 Dados, Recursos e Documentação

### Dados abertos ANAC
A principal fonte de dados da aplicação são os dados abertos sobre voos/registros aeronáuticos da ANAC(Agência Nacional de Aviação Civil), disponíveis em [Dados ANAC](https://openweathermap.org/api).


### API Externa para dados climáticos
A aplicação utiliza dados meteorológicos da API [OpenWeather](https://siros.anac.gov.br/siros/registros/diversos/vra/2023/).

### Notebooks (`notebooks/`)
Os dados `notebooks/content/` são usandos dentro dos notebooks para tratamento de tais dados e formulação da engenharia de features para a aplicação dos algoritmos de aprendizagem para recomendação de companhia aérea e análise preditiva do voo. Veja mais detalhes sobre o treinametos dos modelos no tópico seguinte ("Notebook de Tratamento de Dados e Geração de Modelos")

### Processadores de IA
Após a execução do notebook de treinamento dos modelos, os mesmos serão gerados em arquivos `.pkl` e processados dentro do backend por scripts python específicos para tais funções.Os modelos de IA estão localizados na pasta `ai/models`. Os scripts de processamento Python estão em `ai/processors`.

---

## ✈️📊 Notebook de Tratamento de Dados e Geração de Modelos

O notebook principal da aplicação está localizado em **`notebooks/flight_analyser.ipynb`** e desempenha um papel essencial na preparação e organização dos dados utilizados para o treinamento dos modelos de IA. Abaixo estão os principais pontos:

### 1. **Objetivo**
- O notebook é responsável por **tratar os dados crus** fornecidos pela ANAC e outras fontes para garantir que estejam formatados de maneira apropriada para o uso nos algoritmos de aprendizado de máquina.
- Ele também **realiza a engenharia de features**, transformando os dados originais em variáveis úteis para os modelos.

### 2. **Estrutura do Notebook**
- **Carregamento dos Dados**: Importa os arquivos brutos do diretório `notebooks/content/vra/`.
- **Limpeza de Dados**: Remove inconsistências, valores nulos e realiza normalizações necessárias.
- **Feature Engineering**: Adiciona colunas com novas variáveis calculadas ou derivadas, como categorias de dias (fim de semana, feriado, etc.).
- **Divisão de Dados**: Os dados são divididos em conjuntos de treino e teste para validação.
- **Treinamento**: Algoritmos de aprendizado de máquina são treinados para dois propósitos:
  1. **Classificação**: Prever a ocorrência de atraso em voos.
  2. **Regressão**: Estimar o tempo de voo.
- **Exportação**: Os modelos treinados são exportados como arquivos `.pkl` para o diretório `ai/models`.

### 3. **Fontes dos Dados**
- Os dados utilizados pelo notebook são originados da ANAC e armazenados no diretório `notebooks/content/vra/`.
- Após o processamento, os arquivos gerados são salvos no diretório `notebooks/content/` e consumidos pela aplicação.

### 4. **Treinamento dos Modelos**
- **Modelos Utilizados**:
  - Modelo de Classificação: Para prever atrasos em voos.
  - Modelo de Regressão: Para estimar tempos de voo com base em variáveis climáticas e características do trajeto.
- **Técnicas Aplicadas**:
  - Uso de bibliotecas como `scikit-learn` para algoritmos de aprendizado supervisionado.
  - Validação cruzada para avaliar a performance dos modelos.

### 5. **Exportação dos Modelos**
- Os modelos são exportados no formato `.pkl` para o diretório `ai/models`.
- Eles são posteriormente consumidos pelos scripts Python localizados em `ai/processors` para integração com a aplicação backend.

Esse notebook é um ponto central no pipeline de processamento de dados e aprendizado de máquina da aplicação, garantindo que as análises e recomendações sejam baseadas em dados confiáveis e bem estruturados.

---

## ✍️ Conclusão

O **Flight Analyzer Backend** é uma aplicação robusta que integra dados meteorológicos, informações de voos e modelos de IA para entregar uma análise avançada e eficiente. Ele é modular, escalável e fácil de contribuir, garantindo flexibilidade para futuras expansões.

Agradecemos por contribuir ou utilizar nosso projeto!
