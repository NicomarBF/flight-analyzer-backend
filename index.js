const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Rota principal para predição
app.post('/predict', (req, res) => {
    console.log(req.body);

    // Criar um objeto de entrada no formato esperado pelo modelo
    // const entradaModelo = {
    //     'Empresa Aérea': empresaAerea,
    //     'Sigla ICAO Aeroporto Origem': origem,
    //     'Sigla ICAO Aeroporto Destino': destino,
    //     'Dia da Semana': diaSemana,
    //     'LATITUDE_ORIGEM': LATITUDE_ORIGEM,
    //     'LONGITUDE_ORIGEM': LONGITUDE_ORIGEM,
    //     'LATITUDE_DESTINO': LATITUDE_DESTINO,
    //     'LONGITUDE_DESTINO': LONGITUDE_DESTINO,
    //     'temp_origem': temp_origem,
    //     'temp_destino': temp_destino,
    //     'pressure_origem': pressure_origem,
    //     'pressure_destino': pressure_destino,
    //     'humidity_origem': humidity_origem,
    //     'humidity_destino': humidity_destino,
    //     'clouds_origem': clouds_origem,
    //     'clouds_destino': clouds_destino,
    //     'Tempo esperado de voo': tempoEsperadoVoo,
    //     'Final de Semana': finalDeSemana,
    //     'Feriado': Feriado
    // };

    // console.log(entradaModelo);

    const options = {
        mode: 'text',
        pythonPath: path.join(__dirname, 'venv', 'Scripts', 'python.exe'),
        pythonOptions: ['-u'], // Desabilitar buffering
        scriptPath: './', // Caminho do arquivo Python
        args: [JSON.stringify(req.body)]
    };

    console.log(options)

    // PythonShell.run('predict_models.py', options, (err, results) => {
    //     console.log("Início do callback PythonShell");
    
    //     if (err) {
    //         console.error("Erro no modelo:", err);
    //         return res.status(500).send("Erro ao processar a predição.");
    //     }
    
    //     console.log("Resultados do modelo:", results);
    
    //     try {
    //         const response = JSON.parse(results[0]);
    //         res.json(response);
    //     } catch (error) {
    //         console.error("Erro ao processar a resposta do modelo:", error);
    //         res.status(500).send("Erro ao processar a resposta do modelo.");
    //     }
    // });

    PythonShell.run('test.py', options, (err, results) => {
        console.log("Tentando executar o script Python...");
        if (err) {
            console.error("Erro no script de teste:", err);
            return;
        }
        console.log("Resultados do script de teste:", results);
    });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
