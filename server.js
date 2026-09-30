// Importamos o servidor web (express) e o módulo nativo do Node que conversa com o Sistema Operacional (os)
const express = require('express');
const os = require('os');

const app = express();
// O Render define a porta automaticamente através de process.env.PORT. Se for local, usa a 3000.
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    // Coletando informações do Sistema Operacional usando o módulo 'os'
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    const cpus = os.cpus();
    const totalMemory = (os.totalmem() / (1024 ** 3)).toFixed(2); // Convertendo Bytes para Gigabytes
    const freeMemory = (os.freemem() / (1024 ** 3)).toFixed(2);   // Convertendo Bytes para Gigabytes
    const uptimeHours = (os.uptime() / 3600).toFixed(2);         // Convertendo Segundos para Horas

    // Montando a página HTML que será mostrada no navegador
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Painel do Sistema Operacional</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
            .container { max-width: 700px; margin: 0 auto; background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; }
            .metric { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
            .metric:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #555; }
            .value { color: #007bff; font-family: monospace; font-size: 1.1em; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Métricas do Sistema Operacional</h1>
            <div class="metric"><span class="label">Nome do Host (Hostname):</span> <span class="value">${hostname}</span></div>
            <div class="metric"><span class="label">Plataforma (SO):</span> <span class="value">${platform}</span></div>
            <div class="metric"><span class="label">Arquitetura:</span> <span class="value">${arch}</span></div>
            <div class="metric"><span class="label">Núcleos de CPU:</span> <span class="value">${cpus.length} x ${cpus[0]?.model || 'Desconhecido'}</span></div>
            <div class="metric"><span class="label">Memória RAM Total:</span> <span class="value">${totalMemory} GB</span></div>
            <div class="metric"><span class="label">Memória RAM Livre:</span> <span class="value">${freeMemory} GB</span></div>
            <div class="metric"><span class="label">Tempo de Atividade (Uptime):</span> <span class="value">${uptimeHours} horas</span></div>
        </div>
    </body>
    </html>
    `;

    res.send(htmlContent);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});