import sys
import json
import pandas as pd
import joblib

air_company_model = joblib.load('./ai/models/model_air_company.pkl')

def process_input(data):
    df = pd.DataFrame([data])
    return df

try:
    input_data = json.loads(sys.argv[1])
    input_df = process_input(input_data)

    pred_company = air_company_model.predict(input_df)

    output = {
        "air_company": pred_company[0]
    }

    print(json.dumps(output))

except Exception as e:
    error_output = {
        "error": str(e)
    }
    print(json.dumps(error_output))