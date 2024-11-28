const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn } = require('child_process');
const { DefaultDeserializer } = require('v8');
const path = require('path');
const csvtojson = require('csvtojson');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Rota principal para predição
app.post('/predict', (req, res) => {
    console.log("Dados recebidos:", req.body);

    // Converter os dados do request para uma string JSON
    const input = JSON.stringify(req.body);

    // Executar o script Python com `spawn`
    const python = spawn('python', ['predict_models.py', input]);

    let output = '';
    let errorOutput = '';

    // Coletar saída do script Python
    python.stdout.on('data', (data) => {
        output += data.toString();
    });

    // Coletar erros do script Python
    python.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    // Quando o processo Python termina
    python.on('close', (code) => {
        console.log(`Processo Python finalizado com código: ${code}`);
        if (code !== 0) {
            console.error("Erro ao executar o script Python:", errorOutput);
            res.status(500).send("Erro ao processar a predição.");
            return;
        }

        try {
            // Parse da saída JSON do script Python
            const result = JSON.parse(output);
            console.log("Resultados do modelo:", result);
            res.json(result);
        } catch (error) {
            console.error("Erro ao processar a resposta do modelo:", error);
            res.status(500).send("Erro ao processar a resposta do modelo.");
        }
    });
});

app.get('/aerodromos', async (req, res) => {


    console.log("TESTE 1")
    try {
        console.log("TESTE 2")
        const csvFilePath = path.join(__dirname, 'aerodromos.csv');

        console.log(csvFilePath)
        console.log("TESTE 3")
        const jsonArray = await csvtojson({ delimiter: ',' }).fromFile(csvFilePath);
        console.log("TESTE 4")
        console.log(jsonArray)

        res.json(jsonArray);
    } catch (error) {
        console.log("TESTE ERRO")
        res.status(500).send('Erro ao carregar os aeródromos');
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});