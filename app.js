document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('themeSelect');
  
  // Alteração dinâmica do tema visual vintage
  themeSelect.addEventListener('change', (e) => {
    document.body.className = e.target.value;
  });

  async function fetchMetrics() {
    try {
      const response = await fetch('/api/metrics');
      if (!response.ok) throw new Error('Falha no carregamento dos dados');
      const data = await response.json();

      // Atualização dos indicadores superiores
      document.getElementById('envName').textContent = data.environment.name;
      document.getElementById('sysStatus').textContent = data.system.status;
      document.getElementById('ramPercent').textContent = `${data.memory.usedPercent}%`;
      document.getElementById('ramFill').style.width = `${data.memory.usedPercent}%`;
      document.getElementById('sysUptime').textContent = data.system.uptimeFormatted;
      document.getElementById('mainIP').textContent = data.network.mainIP;

      // Dados de SO & Ambiente
      document.getElementById('valHostname').textContent = data.system.hostname;
      document.getElementById('valPlatform').textContent = `${data.system.type} (${data.system.platform})`;
      document.getElementById('valKernel').textContent = data.system.release;
      document.getElementById('valArch').textContent = data.system.arch;
      document.getElementById('valNode').textContent = data.system.nodeVersion;
      document.getElementById('valPort').textContent = data.system.port;

      // Dados de CPU
      document.getElementById('valCpuModel').textContent = data.cpu.model;
      document.getElementById('valCpuCores').textContent = `${data.cpu.cores} núcleo(s)`;
      document.getElementById('valProcessCount').textContent = data.cpu.processCount;
      document.getElementById('valPid').textContent = data.cpu.pid;
      document.getElementById('valHeap').textContent = `${data.cpu.heapUsedMB} MB`;

      // Dados de Memória & Disco
      document.getElementById('valRamTotal').textContent = `${data.memory.totalGB} GB`;
      document.getElementById('valRamFree').textContent = `${data.memory.freeGB} GB`;
      document.getElementById('valRamUsed').textContent = `${data.memory.usedGB} GB`;
      document.getElementById('valDiskMount').textContent = data.disk.mountPoint;
      document.getElementById('valDiskFree').textContent = `${data.disk.freeGB} GB (${data.disk.usedPercent}% usado)`;

      // Periféricos e Energia
      document.getElementById('valDisplay').textContent = data.display.status;
      document.getElementById('valResolution').textContent = data.display.resolution;
      document.getElementById('valAudio').textContent = data.audio.device;
      document.getElementById('valPower').textContent = data.power.source;
      document.getElementById('valBattery').textContent = data.power.batteryLevel;

    } catch (err) {
      console.error('Erro na atualização do painel:', err);
    }
  }

  // Execução inicial e sincronização contínua de 5 em 5 segundos
  fetchMetrics();
  setInterval(fetchMetrics, 5000);
});