import sys
import json
import pandas as pd
import joblib

# Carregar os modelos treinados
clf_model = joblib.load('./model_classification.pkl')
reg_model = joblib.load('./model_regression.pkl')

# Função para pré-processar entrada
def process_input(data):
    df = pd.DataFrame([data])
    return df

# Receber entrada do Node.js
input_data = json.loads(sys.argv[1])
input_df = process_input(input_data)

# Fazer predições
pred_class = clf_model.predict(input_df)
pred_prob = clf_model.predict_proba(input_df)[0][1]
pred_delay = reg_model.predict(input_df)

# Garantir que os valores são serializáveis
output = {
    "flight_delay": True if pred_class[0] == 1 else False,
    "probability_of_outcome": round(float(pred_prob) * 100, 2),  # Converter para float
    "estimated_flight_time": round(float(pred_delay[0]), 2)    # Converter para float
}

# Imprimir o resultado como JSON
print(json.dumps(output))