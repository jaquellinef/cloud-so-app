async function fetchMetrics() {
  try {
    const response = await fetch('/api/metrics');
    if (!response.ok) throw new Error('Erro na requisição');
    const data = await response.json();

    document.getElementById('envName').innerText = data.environment.name || 'Render';
    document.getElementById('sysStatus').innerText = data.system.status || 'ONLINE';

    const ramPercent = data.memory.usedPercent || 0;
    document.getElementById('ramPercent').innerText = `${ramPercent}%`;
    const ramFill = document.getElementById('ramFill');
    if (ramFill) ramFill.style.width = `${ramPercent}%`;

    document.getElementById('sysUptime').innerText = data.system.uptimeFormatted || '0h 0m 0s';
    document.getElementById('mainIP').innerText = data.network.mainIP || '127.0.0.1';

    document.getElementById('valHostname').innerText = data.system.hostname || 'N/A';
    document.getElementById('valPlatform').innerText = `${data.system.platform} (${data.system.type})`;
    document.getElementById('valKernel').innerText = data.system.release || 'N/A';
    document.getElementById('valArch').innerText = data.system.arch || 'N/A';
    document.getElementById('valNode').innerText = data.system.nodeVersion || 'N/A';
    document.getElementById('valPort').innerText = data.system.port || '3000';

    document.getElementById('valCpuModel').innerText = data.cpu.model || 'N/A';
    document.getElementById('valCpuCores').innerText = data.cpu.cores || '1';
    document.getElementById('valProcessCount').innerText = data.cpu.processCount || 'N/A';
    document.getElementById('valPid').innerText = data.cpu.pid || 'N/A';
    document.getElementById('valHeap').innerText = `${data.cpu.heapUsedMB} MB`;

    document.getElementById('valRamTotal').innerText = `${data.memory.totalGB} GB`;
    document.getElementById('valRamFree').innerText = `${data.memory.freeGB} GB`;
    document.getElementById('valRamUsed').innerText = `${data.memory.usedGB} GB`;
    document.getElementById('valDiskMount').innerText = data.disk.mountPoint || '/';
    document.getElementById('valDiskFree').innerText = `${data.disk.freeGB} GB`;

    document.getElementById('valDisplay').innerText = data.display.status || 'N/A';
    document.getElementById('valResolution').innerText = data.display.resolution || 'N/A';
    document.getElementById('valAudio').innerText = data.audio.device || 'N/A';
    document.getElementById('valPower').innerText = data.power.source || 'N/A';
    document.getElementById('valBattery').innerText = data.power.batteryLevel || 'N/A';
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchMetrics();
  setInterval(fetchMetrics, 5000);

  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      document.body.className = e.target.value;
    });
  }
});