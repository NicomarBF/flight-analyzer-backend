import sys
import json
import pandas as pd
import joblib

# Carregar o modelo treinado
air_company_model = joblib.load('./model_air_company.pkl')

# Função para pré-processar a entrada
def process_input(data):
    df = pd.DataFrame([data])
    return df

# Receber entrada do Node.js
try:
    input_data = json.loads(sys.argv[1])
    input_df = process_input(input_data)

    # Fazer a predição
    pred_company = air_company_model.predict(input_df)

    # Garantir que o valor é serializável
    output = {
        "air_company": pred_company[0]
    }

    # Imprimir o resultado como JSON
    print(json.dumps(output))

except Exception as e:
    # Caso ocorra erro, retornar mensagem de erro
    error_output = {
        "error": str(e)
    }
    print(json.dumps(error_output))