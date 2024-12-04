# Flight Analyzer Backend

## Descrição Geral
O **Flight Analyzer Backend** é responsável pelo processamento dos dados de voo, integração com APIs externas e execução dos modelos de machine learning para fornecer análises detalhadas, como a melhor companhia aérea recomendada, probabilidade de atraso e tempo estimado de voo.

Este componente da aplicação lida com toda a lógica do lado do servidor, recebendo as requisições do front-end, processando as informações e retornando resultados baseados em análise preditiva. Ele também faz integração com fontes externas, como APIs de clima, para obter dados adicionais e melhorar a qualidade das análises.

---

## Tecnologias Utilizadas
- **Node.js** e **Express**: Para construir a API RESTful.
- **Python** e **Scikit-learn**: Para treinar e executar modelos de machine learning.
- **Axios**: Para consumo de APIs externas (como a API OpenWeatherMap).
- **Jest** e **Supertest**: Para testes automatizados do backend.
- **CSVtoJSON**: Para manipulação de dados de arquivos CSV.

---

## Endpoints da API

### **/api/analysis [GET]**
Recebe os dados do voo e retorna uma análise detalhada com base nos modelos preditivos treinados.

#### Parâmetros
| Nome           | Tipo    | Descrição                                      |
|----------------|---------|----------------------------------------------|
| `origin`        | String  | Sigla ICAO do aeroporto de origem.           |
| `destination`   | String  | Sigla ICAO do aeroporto de destino.          |
| `datetime`      | String  | Data e hora do voo (formato `DD/MM/YYYY HH:mm:ss`). |

#### Exemplo de Resposta
```json
{
  "success": true,
  "message": "Flight analysis completed successfully.",
  "data": {
    "flight_delay": false,
    "probability_of_outcome": 33.68,
    "estimated_flight_time": 79.82,
    "air_company": "GOL LINHAS AÉREAS S.A. (EX- VRG LINHAS AÉREAS S.A.)",
    "normal_flight_time": 80
  }
}
```

---

## Instalação e Configuração

### Requisitos
- **Node.js** (>= 16.x)
- **Python** (>= 3.8) com bibliotecas necessárias (`Scikit-learn`, `Pandas`, `Joblib`)
- Chave de API do **OpenWeatherMap**

### Passos para Executar o Backend

1. Navegue até o diretório `flight-analyzer-backend`:
   ```bash
   cd flight-analyzer-backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Certifique-se de que os modelos treinados estão no diretório `models`:
   - `model_air_company.pkl` (Recomendação de companhias aéreas)
   - `model_delay_analysis.pkl` (Análise de atrasos)

4. Inicie o servidor:
   ```bash
   npm start
   ```

5. Acesse o backend em:
   ```
   http://localhost:3001
   ```

---

## Estrutura do Projeto

```
flight-analyzer-backend/
├── models/                # Modelos de machine learning treinados
├── scripts/               # Scripts Python para predições
├── data/                  # Arquivos CSV utilizados
├── test/                  # Testes automatizados
├── app.js                 # Arquivo principal da aplicação
├── package.json           # Configurações do projeto e dependências
└── README.md              # Documentação do back-end
```

---

## Testes

### Descrição dos Testes

Os testes do backend utilizam **Jest** e **Supertest** para garantir que todos os endpoints e funções estejam funcionando corretamente. Os testes incluem:

- **Testes de Integração**: Testam os endpoints da API para garantir que as respostas estejam corretas para várias entradas.
- **Testes Unitários**: Focados nas funções críticas, como cálculo de recomendações e análise de atrasos.

### Como Executar os Testes

Para rodar os testes:
```bash
npm test
```

---

## Exemplos de Uso

Após iniciar o backend, você pode usar ferramentas como **Postman** ou **cURL** para testar os endpoints. Por exemplo, para realizar uma análise de voo, envie uma requisição GET para `/api/analysis` com os parâmetros necessários:

```bash
curl "http://localhost:3001/api/analysis?origin=SBGR&destination=SBGL&datetime=05/12/2024 00:00:00"
```

---

