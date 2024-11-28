const { PythonShell } = require('python-shell');

const options = {
    pythonPath: path.join(__dirname, 'venv', 'Scripts', 'python.exe'),
};

PythonShell.runString('print("Python executado com sucesso!")', options, (err, results) => {
    console.log("Tentando executar o Python...");

    if (err) {
        console.error("Erro ao executar Python:", err);
        return;
    }

    console.log("Resultados:", results);
});