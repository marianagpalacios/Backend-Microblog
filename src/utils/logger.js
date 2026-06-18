const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'errors.log');

function logError(contexto, erro) {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR);
    }

    const data = new Date().toISOString();
    const mensagem = erro.message ? erro.message : erro;

    const texto =
        '[' + data + '] ' +
        contexto + ' - ' +
        mensagem + '\n';

    fs.appendFile(LOG_FILE, texto, function (err) {
        if (err) {
            console.log('Erro ao gravar arquivo de log:');
            console.log(err);
        }
    });
}

module.exports = { logError };