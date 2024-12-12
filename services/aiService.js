const { spawn } = require('child_process');

exports.getAirCompanyRecomendation = async (input) => {
    input = JSON.stringify(input);

    const python = spawn('python', ['./ai/processors/air_company_recomendation.py', input]);

    return new Promise((resolve, reject) => {
        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        python.on('close', (code) => {
            console.log(`Recomendação de companhia aérea finalizada com código: ${code}`);
            if (code !== 0) {
                console.error("Erro ao executar o script Python:", errorOutput);
                reject(new Error("Erro ao executar o script Python"));
            }

            try {
                const result = JSON.parse(output);
                resolve(result);
            } catch (error) {
                console.error("Erro ao processar a resposta do modelo:", error);
                reject(new Error("Erro ao processar a resposta do modelo"));
            }
        });
    });
}

exports.getFlightAnalysis = async (input) => {
    input = JSON.stringify(input);

    const python = spawn('python', ['./ai/processors/flight_analysis.py', input]);

    return new Promise((resolve, reject) => {
        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        python.on('close', (code) => {
            console.log(`Análise de voo finalizada com código: ${code}`);
            if (code !== 0) {
                console.error("Erro ao executar o script Python:", errorOutput);
                reject(new Error("Erro ao executar o script Python"));
            }

            try {
                const result = JSON.parse(output);
                resolve(result);
            } catch (error) {
                console.error("Erro ao processar a resposta do modelo:", error);
                reject(new Error("Erro ao processar a resposta do modelo"));
            }
        });
    });
}
