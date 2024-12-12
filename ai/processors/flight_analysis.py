import sys
import json
import pandas as pd
import joblib

clf_model = joblib.load('./ai/models/model_classification.pkl')
reg_model = joblib.load('./ai/models/model_regression.pkl')

def process_input(data):
    df = pd.DataFrame([data])
    return df

input_data = json.loads(sys.argv[1])
input_df = process_input(input_data)

pred_class = clf_model.predict(input_df)
pred_prob = clf_model.predict_proba(input_df)[0][1]
pred_delay = reg_model.predict(input_df)

output = {
    "flight_delay": True if pred_class[0] == 1 else False,
    "probability_of_outcome": round(float(pred_prob) * 100, 2),  # Converter para float
    "estimated_flight_time": round(float(pred_delay[0]), 2)    # Converter para float
}

print(json.dumps(output))