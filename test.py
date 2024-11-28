import sys
import json
import pickle
import numpy as np

# Carregar os modelos
with open('./model_regression.pkl', 'rb') as f:
    regression_model = pickle.load(f)

# Função principal
def main():
    # Ler argumentos do Node.js
    data = json.loads(sys.argv[1])

    print("TESTEEEEEEEEEEEEEEE")

    inputs = np.array(data['inputs']).reshape(1, -1)
    
    # Fazer a previsão
    prediction = regression_model.predict(inputs)
    
    # Retornar o resultado como JSON
    result = {'prediction': prediction.tolist()}
    print(json.dumps(result))

if __name__ == '__main__':
    main()
