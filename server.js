const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir ficheiros estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ambiente de Execução (Local vs Cloud PaaS)
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

// Formatação de Uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hrs = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days > 0 ? days + 'd ' : ''}${hrs}h ${mins}m ${secs}s`;
}

// Métricas do Disco / Armazenamento
function getDiskInfo() {
  const isWin = os.platform() === 'win32';
  try {
    if (isWin) {
      const psCmd = 'powershell -command "Get-CimInstance Win32_LogicalDisk -Filter \\"DeviceID=\'C:\'\\" | Select-Object Size,FreeSpace | ConvertTo-Json"';
      const output = execSync(psCmd, { encoding: 'utf-8', timeout: 3000 });
      const data = JSON.parse(output);
      const totalGB = (data.Size / (1024 ** 3)).toFixed(2);
      const freeGB = (data.FreeSpace / (1024 ** 3)).toFixed(2);
      const usedGB = (totalGB - freeGB).toFixed(2);
      const usedPercent = ((usedGB / totalGB) * 100).toFixed(1);
      return { totalGB, freeGB, usedGB, usedPercent, mountPoint: 'C:' };
    } else {
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

// Contagem de Processos Ativos
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

// Informações de Vídeo e Tela
function getDisplayInfo(env) {
  if (env.isCloud) {
    return { status: 'Headless (Virtual Container)', resolution: 'N/A', refreshRate: 'N/A' };
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
          name: data.Name || 'Placa Gráfica Local',
          resolution: `${data.CurrentHorizontalResolution} x ${data.CurrentVerticalResolution}`,
          refreshRate: `${data.CurrentRefreshRate} Hz`
        };
      }
    } catch (e) {}
  }
  return { status: 'Monitor Integrado', resolution: '1920 x 1080', refreshRate: '60 Hz' };
}

// Áudio
function getAudioInfo(env) {
  if (env.isCloud) {
    return { device: 'Dispositivo Virtual', status: 'Sem Áudio (Servidor Nuvem)' };
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

// Bateria e Energia
function getPowerBatteryInfo(env) {
  if (env.isCloud) {
    return { source: 'Rede Elétrica Datacenter (AC)', batteryLevel: 'N/A', status: 'Energia Ininterrupta' };
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
  return { source: 'Rede Elétrica / Bateria Integrada', batteryLevel: '100%', status: 'Alimentação Conectada' };
}

// Interfaces de Rede
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

// ENDPOINT API REST: Servidor de Métricas
app.get('/api/metrics', (req, res) => {
  const env = detectEnvironment();
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const ramUsedPercent = parseFloat(((usedMem / totalMem) * 100).toFixed(1));
  const disk = getDiskInfo();

  let systemStatus = 'Excelente';
  let statusBadgeClass = 'badge-success';
  if (ramUsedPercent > 85 || parseFloat(disk.usedPercent) > 90) {
    systemStatus = 'Atenção / Alta Carga';
    statusBadgeClass = 'badge-warning';
  }

  res.json({
    environment: env,
    system: {
      hostname: os.hostname(),
      type: os.type(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      endianness: os.endianness(),
      nodeVersion: process.version,
      port: PORT,
      uptimeRaw: os.uptime(),
      uptimeFormatted: formatUptime(os.uptime()),
      status: systemStatus,
      statusClass: statusBadgeClass
    },
    cpu: {
      model: cpus[0] ? cpus[0].model.trim() : 'N/A',
      cores: cpus.length,
      processCount: getProcessCount(),
      pid: process.pid,
      heapUsedMB: (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2),
      loadAvg: os.loadavg()
    },
    memory: {
      totalGB: (totalMem / (1024 ** 3)).toFixed(2),
      freeGB: (freeMem / (1024 ** 3)).toFixed(2),
      usedGB: (usedMem / (1024 ** 3)).toFixed(2),
      usedPercent: ramUsedPercent
    },
    disk,
    display: getDisplayInfo(env),
    audio: getAudioInfo(env),
    power: getPowerBatteryInfo(env),
    network: getNetworkInfo(),
    fileCount: (() => { try { return fs.readdirSync(__dirname).length; } catch(e) { return 'N/A'; } })()
  });
});

// Fallback para o Dashboard (Front-end)
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.redirect('/api/metrics');
});

app.listen(PORT, () => {
  console.log(`[cloud-so-app] Servidor do Dashboard Executivo ativo na porta ${PORT}`);
});
