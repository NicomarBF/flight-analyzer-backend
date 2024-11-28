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
    "atraso": "Sim" if pred_class[0] == 1 else "Não",
    "probabilidade_atraso": round(float(pred_prob) * 100, 2),  # Converter para float
    "tempo_estimado_de_voo": round(float(pred_delay[0]), 2)    # Converter para float
}

# Imprimir o resultado como JSON
print(json.dumps(output))