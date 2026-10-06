const express = require('express');
const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Identificação Automática de Ambiente (Local vs Cloud)
function detectEnvironment() {
  if (process.env.RENDER || process.env.RENDER_SERVICE_ID) {
    return { name: 'Render (Cloud PaaS)', isCloud: true, provider: 'Render' };
  } else if (process.env.KOYEB_SERVICE_ID || process.env.KOYEB_APP_ID) {
    return { name: 'Koyeb (Cloud PaaS)', isCloud: true, provider: 'Koyeb' };
  } else if (process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_GIT_COMMIT_SHA) {
    return { name: 'Railway (Cloud PaaS)', isCloud: true, provider: 'Railway' };
  } else if (process.env.VERCEL) {
    return { name: 'Vercel Serverless', isCloud: true, provider: 'Vercel' };
  }
  return { name: 'Ambiente Local (Bare-Metal / VM)', isCloud: false, provider: 'Localhost' };
}

// 2. Formatação de Tempo de Atividade (Uptime)
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hrs = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days > 0 ? days + 'd ' : ''}${hrs}h ${mins}m ${secs}s`;
}

// 3. Informações de Armazenamento (Disco)
function getDiskInfo() {
  const isWin = os.platform() === 'win32';
  try {
    if (isWin) {
      const output = execSync(
        'powershell -command "Get-CimInstance Win32_LogicalDisk -Filter \\"DeviceID=\'C:\'\\" | Select-Object Size,FreeSpace | ConvertTo-Json"',
        { encoding: 'utf-8', timeout: 3000 }
      );
      const data = JSON.parse(output);
      const totalGB = (data.Size / (1024 ** 3)).toFixed(2);
      const freeGB = (data.FreeSpace / (1024 ** 3)).toFixed(2);
      const usedGB = (totalGB - freeGB).toFixed(2);
      const usedPercent = ((usedGB / totalGB) * 100).toFixed(1);
      return { totalGB, freeGB, usedGB, usedPercent, mountPoint: 'C:' };
    } else {
      // Servidor Linux (Render / Koyeb / Railway)
      const stats = fs.statfsSync('/');
      const totalGB = ((stats.blocks * stats.bsize) / (1024 ** 3)).toFixed(2);
      const freeGB = ((stats.bfree * stats.bsize) / (1024 ** 3)).toFixed(2);
      const usedGB = (totalGB - freeGB).toFixed(2);
      const usedPercent = ((usedGB / totalGB) * 100).toFixed(1);
      return { totalGB, freeGB, usedGB, usedPercent, mountPoint: '/' };
    }
  } catch (err) {
    return { totalGB: 'N/A', freeGB: 'N/A', usedGB: 'N/A', usedPercent: '0', mountPoint: 'Desconhecido' };
  }
}

// 4. Quantidade de Processos Ativos
function getProcessCount() {
  const isWin = os.platform() === 'win32';
  try {
    if (isWin) {
      const output = execSync('powershell -command "(Get-Process).Count"', { encoding: 'utf-8', timeout: 3000 });
      return output.trim();
    } else {
      const output = execSync('ps aux | wc -l', { encoding: 'utf-8', timeout: 3000 });
      return (parseInt(output.trim(), 10) - 1).toString();
    }
  } catch (err) {
    return 'N/A';
  }
}

// 5. Informações do Display / Tela
function getDisplayInfo(env) {
  if (env.isCloud) {
    return { status: 'Headless (Sem Display Físico)', resolution: 'N/A (Virtual Container)', refreshRate: 'N/A' };
  }
  if (os.platform() === 'win32') {
    try {
      const output = execSync(
        'powershell -command "Get-CimInstance Win32_VideoController | Select-Object Name, CurrentHorizontalResolution, CurrentVerticalResolution, CurrentRefreshRate | ConvertTo-Json"',
        { encoding: 'utf-8', timeout: 3000 }
      );
      const data = Array.isArray(JSON.parse(output)) ? JSON.parse(output)[0] : JSON.parse(output);
      if (data && data.CurrentHorizontalResolution) {
        return {
          status: 'Ativo',
          name: data.Name || 'Placa de Vídeo Local',
          resolution: `${data.CurrentHorizontalResolution} x ${data.CurrentVerticalResolution}`,
          refreshRate: `${data.CurrentRefreshRate} Hz`
        };
      }
    } catch (e) {}
  }
  return { status: 'Monitor Integrado / Padrão do SO', resolution: '1920 x 1080 (Estimado)', refreshRate: '60 Hz' };
}

// 6. Informações do Sub-sistema de Áudio / Som
function getAudioInfo(env) {
  if (env.isCloud) {
    return { device: 'Dispositivo Virtual (Sem Placa Física)', status: 'Sem Áudio (Servidor Nuvem)' };
  }
  if (os.platform() === 'win32') {
    try {
      const output = execSync(
        'powershell -command "Get-CimInstance Win32_SoundDevice | Select-Object Name, Status | ConvertTo-Json"',
        { encoding: 'utf-8', timeout: 3000 }
      );
      const data = Array.isArray(JSON.parse(output)) ? JSON.parse(output)[0] : JSON.parse(output);
      return { device: data.Name || 'Realtek High Definition Audio', status: data.Status || 'OK' };
    } catch (e) {}
  }
  return { device: 'Controlador de Áudio Padrão', status: 'Ativo' };
}

// 7. Informações de Energia e Bateria
function getPowerBatteryInfo(env) {
  if (env.isCloud) {
    return { source: 'Rede Elétrica do Datacenter (AC)', batteryLevel: 'N/A (Servidor Dedicado/Virtual)', status: 'Energia Ininterrupta (UPS/Gerador)' };
  }
  if (os.platform() === 'win32') {
    try {
      const output = execSync(
        'powershell -command "Get-CimInstance Win32_Battery | Select-Object EstimatedChargeRemaining, BatteryStatus | ConvertTo-Json"',
        { encoding: 'utf-8', timeout: 3000 }
      );
      const data = JSON.parse(output);
      if (data && data.EstimatedChargeRemaining !== undefined) {
        const charging = data.BatteryStatus === 2 ? 'Carregando (AC)' : 'Em Bateria (DC)';
        return { source: charging, batteryLevel: `${data.EstimatedChargeRemaining}%`, status: 'OK' };
      }
    } catch (e) {}
  }
  return { source: 'Rede Elétrica / Bateria Integrada', batteryLevel: '100% (Ou Sem Bateria Física)', status: 'Alimentação Conectada' };
}

// 8. Arquivos na Pasta do Projeto
function getFileCount() {
  try {
    return fs.readdirSync(__dirname).length;
  } catch (err) {
    return 'N/A';
  }
}

// 9. Interfaces de Rede e IP Principal
function getNetworkInfo() {
  const nets = os.networkInterfaces();
  const results = [];
  let mainIP = '127.0.0.1';

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push({ name, address: net.address, netmask: net.netmask });
        if (mainIP === '127.0.0.1') mainIP = net.address;
      }
    }
  }
  return {
    interfaces: results.length > 0 ? results : [{ name: 'Loopback', address: '127.0.0.1', netmask: '255.0.0.0' }],
    mainIP
  };
}

// ROTA PRINCIPAL DO DASHBOARD
app.get('/', (req, res) => {
  const env = detectEnvironment();
  const hostname = os.hostname();
  const osType = os.type();
  const kernelVersion = os.release();
  const platform = os.platform();
  const arch = os.arch();
  const endianness = os.endianness();
  const nodeVersion = process.version;
  const uptime = formatUptime(os.uptime());
  
  // CPUs e Carga
  const cpus = os.cpus();
  const cpuModel = cpus[0] ? cpus[0].model.trim() : 'N/A';
  const cpuCores = cpus.length;
  const loadAvg = os.loadavg(); // Array [1m, 5m, 15m] em sistemas Linux/Unix

  // RAM
  const totalMemGB = (os.totalmem() / (1024 ** 3)).toFixed(2);
  const freeMemGB = (os.freemem() / (1024 ** 3)).toFixed(2);
  const usedMemGB = (totalMemGB - freeMemGB).toFixed(2);
  const ramUsedPercent = parseFloat(((usedMemGB / totalMemGB) * 100).toFixed(1));

  // Memória do Heap do Node.js
  const heapUsedMB = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2);

  // Módulos adicionais
  const disk = getDiskInfo();
  const processCount = getProcessCount();
  const fileCount = getFileCount();
  const network = getNetworkInfo();
  const display = getDisplayInfo(env);
  const audio = getAudioInfo(env);
  const power = getPowerBatteryInfo(env);

  // Status Geral do Sistema
  let systemStatus = 'Excelente';
  let statusBadgeClass = 'badge-success';
  if (ramUsedPercent > 85 || parseFloat(disk.usedPercent) > 90) {
    systemStatus = 'Atenção / Alta Carga';
    statusBadgeClass = 'badge-warning';
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>cloud-so-app | Dashboard Executivo de SO</title>
  <style>
    :root {
      --primary: #2563eb;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --subtext: #475569;
      --border: #e2e8f0;
      --success: #16a34a;
      --warning: #d97706;
    }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background-color: var(--bg); color: var(--text); margin: 0; padding: 20px; }
    .container { max-width: 1100px; margin: 0 auto; }
    header { background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 24px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    header h1 { margin: 0 0 8px 0; font-size: 26px; }
    header p { margin: 0; opacity: 0.85; font-size: 14px; }
    
    .status-bar { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
    .status-item { background: var(--card-bg); border: 1px solid var(--border); padding: 14px 18px; border-radius: 8px; flex: 1; min-width: 180px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .status-item .label { font-size: 12px; color: var(--subtext); font-weight: 600; text-transform: uppercase; }
    .status-item .val { font-size: 20px; font-weight: 700; color: var(--primary); margin-top: 4px; }

    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; }
    .card { background: var(--card-bg); border: 1px solid var(--border); padding: 20px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
    .card h3 { margin-top: 0; color: #1e293b; font-size: 16px; border-bottom: 2px solid var(--border); padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    
    ul { list-style: none; padding: 0; margin: 0; }
    li { padding: 8px 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; font-size: 13.5px; align-items: center; }
    li:last-child { border-bottom: none; }
    
    .label-title { color: var(--subtext); font-weight: 500; }
    .value-title { font-weight: 600; color: var(--text); word-break: break-all; text-align: right; }
    
    .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .badge-cloud { background: #dbeafe; color: #1e40af; }
    .badge-local { background: #fef3c7; color: #92400e; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }

    .progress-bar-bg { background-color: #e2e8f0; border-radius: 8px; height: 10px; width: 100%; margin-top: 6px; overflow: hidden; }
    .progress-bar-fill { background-color: var(--primary); height: 100%; border-radius: 8px; transition: width 0.3s ease; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Dashboard Executivo de Monitoramento de SO</h1>
      <p>Aplicação: <strong>cloud-so-app (Atividade 7)</strong> | Executando em: <span>${env.name}</span></p>
    </header>

    <!-- Indicadores Visuais Rápidos -->
    <div class="status-bar">
      <div class="status-item">
        <div class="label">Status Geral</div>
        <div class="val"><span class="badge ${statusBadgeClass}">${systemStatus}</span></div>
      </div>
      <div class="status-item">
        <div class="label">Uso de Memória RAM</div>
        <div class="val">${ramUsedPercent}%</div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${ramUsedPercent}%"></div></div>
      </div>
      <div class="status-item">
        <div class="label">Tempo Ligado (Uptime)</div>
        <div class="val">${uptime}</div>
      </div>
      <div class="status-item">
        <div class="label">IP Principal</div>
        <div class="val" style="font-size: 16px;">${network.mainIP}</div>
      </div>
    </div>

    <div class="grid">
      <!-- Card 1: Identificação do Ambiente e SO -->
      <div class="card">
        <h3>Sistema Operacional & Ambiente <span class="badge ${env.isCloud ? 'badge-cloud' : 'badge-local'}">${env.provider}</span></h3>
        <ul>
          <li><span class="label-title">Hostname da Máquina:</span> <span class="value-title">${hostname}</span></li>
          <li><span class="label-title">Tipo do Sistema (Tipo SO):</span> <span class="value-title">${osType} (${platform})</span></li>
          <li><span class="label-title">Versão do Kernel:</span> <span class="value-title">${kernelVersion}</span></li>
          <li><span class="label-title">Arquitetura de CPU:</span> <span class="value-title">${arch}</span></li>
          <li><span class="label-title">Endianness (Ordem Bytes):</span> <span class="value-title">${endianness}</span></li>
          <li><span class="label-title">Versão do Node.js:</span> <span class="value-title">${nodeVersion}</span></li>
          <li><span class="label-title">Porta da Aplicação:</span> <span class="value-title">${PORT}</span></li>
        </ul>
      </div>

      <!-- Card 2: Processador e Carga -->
      <div class="card">
        <h3>Processador & Desempenho CPU</h3>
        <ul>
          <li><span class="label-title">Modelo da CPU:</span> <span class="value-title">${cpuModel}</span></li>
          <li><span class="label-title">Núcleos Totais (vCPUs):</span> <span class="value-title">${cpuCores} Núcleo(s)</span></li>
          <li><span class="label-title">Processos Ativos no SO:</span> <span class="value-title">${processCount}</span></li>
          <li><span class="label-title">PID desta Aplicação:</span> <span class="value-title">${process.pid}</span></li>
          <li><span class="label-title">Node Heap Alocado:</span> <span class="value-title">${heapUsedMB} MB</span></li>
          <li><span class="label-title">Carga Média (Load 1m):</span> <span class="value-title">${loadAvg[0] ? loadAvg[0].toFixed(2) : 'N/A'}</span></li>
        </ul>
      </div>

      <!-- Card 3: Memória e Armazenamento -->
      <div class="card">
        <h3>Memória RAM & Armazenamento</h3>
        <ul>
          <li><span class="label-title">Memória RAM Total:</span> <span class="value-title">${totalMemGB} GB</span></li>
          <li><span class="label-title">RAM Em Uso:</span> <span class="value-title">${usedMemGB} GB (${ramUsedPercent}%)</span></li>
          <li><span class="label-title">RAM Livre:</span> <span class="value-title">${freeMemGB} GB</span></li>
          <li><span class="label-title">Ponto de Montagem:</span> <span class="value-title">${disk.mountPoint}</span></li>
          <li><span class="label-title">Capacidade de Disco:</span> <span class="value-title">${disk.totalGB} GB</span></li>
          <li><span class="label-title">Espaço Livre em Disco:</span> <span class="value-title">${disk.freeGB} GB (${disk.usedPercent}% Usado)</span></li>
        </ul>
      </div>

      <!-- Card 4: Hardware Adicional (Tela, Som, Bateria) -->
      <div class="card">
        <h3>Tela, Som & Energia</h3>
        <ul>
          <li><span class="label-title">Status da Tela/Vídeo:</span> <span class="value-title">${display.status}</span></li>
          <li><span class="label-title">Resolução da Tela:</span> <span class="value-title">${display.resolution}</span></li>
          <li><span class="label-title">Dispositivo de Som:</span> <span class="value-title">${audio.device}</span></li>
          <li><span class="label-title">Status do Áudio:</span> <span class="value-title">${audio.status}</span></li>
          <li><span class="label-title">Fonte de Energia:</span> <span class="value-title">${power.source}</span></li>
          <li><span class="label-title">Nível de Bateria:</span> <span class="value-title">${power.batteryLevel}</span></li>
        </ul>
      </div>

      <!-- Card 5: Aplicação e Otimização -->
      <div class="card">
        <h3>Arquivos & Diretivas de Otimização</h3>
        <ul>
          <li><span class="label-title">Arquivos na Pasta do Projeto:</span> <span class="value-title">${fileCount} arquivos</span></li>
          <li><span class="label-title">Gerenciamento de Memória:</span> <span class="value-title">Garbage Collection V8 Ativo</span></li>
          <li><span class="label-title">Modelo de E/S (I/O):</span> <span class="value-title">Assíncrono Não-Bloqueante</span></li>
          <li><span class="label-title">Isolamento de Processos:</span> <span class="value-title">${env.isCloud ? 'Contêiner LXC / Docker' : 'Usuário SO Local'}</span></li>
        </ul>
      </div>

      <!-- Card 6: Interfaces de Rede -->
      <div class="card">
        <h3>Interfaces de Rede Detectadas</h3>
        <ul>
          ${network.interfaces.map(net => `
            <li><span class="label-title">${net.name}:</span> <span class="value-title">${net.address}</span></li>
          `).join('')}
        </ul>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  res.send(htmlContent);
});

app.listen(PORT, () => {
  console.log(`[cloud-so-app] Servidor rodando na porta ${PORT}`);
});