<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🌿 Dashboard de Sistemas Operacionais</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #F7F4EF;          /* Areia suave */
      --card-bg: #FFFFFF;           /* Branco puro */
      --border-color: #E2D9CC;       /* Bege terroso */
      --text-main: #2C2623;          /* Café escuro (alta legibilidade) */
      --terracotta: #B85B35;         /* Terracota */
      --sage: #6B7A63;               /* Verde Sábia */
      --mustard: #D9A05B;            /* Mostarda / Palha */
      --shadow: 0 4px 12px rgba(44, 38, 35, 0.06);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Poppins', sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      padding: 2rem 1rem;
      line-height: 1.6;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 2.5rem;
      padding: 1.5rem;
      background: var(--card-bg);
      border-radius: 20px;
      border: 2px solid var(--border-color);
      box-shadow: var(--shadow);
    }

    header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--terracotta);
      margin-bottom: 0.5rem;
    }

    header p {
      font-size: 1.1rem;
      color: var(--sage);
      font-weight: 600;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    .card {
      background: var(--card-bg);
      border: 2px solid var(--border-color);
      border-radius: 18px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      transition: transform 0.2s ease;
    }

    .card:hover {
      transform: translateY(-3px);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px dashed var(--border-color);
    }

    .card-header h2 {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--terracotta);
    }

    .icon {
      font-size: 1.6rem;
    }

    .info-group {
      margin-bottom: 0.75rem;
    }

    .info-label {
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--sage);
    }

    .info-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .badge {
      display: inline-block;
      background-color: var(--mustard);
      color: #FFFFFF;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }

    footer {
      text-align: center;
      margin-top: 3rem;
      font-size: 0.9rem;
      color: var(--sage);
      font-weight: 600;
    }
  </style>
</head>
<body>

  <div class="container">
    <header>
      <h1>🌿 Dashboard de Sistemas Operacionais</h1>
      <p>🪵 Monitoramento do Ambiente &amp; Métricas do Kernel 🌾</p>
    </header>

    <div class="grid">
      <!-- Card Sistema Operacional -->
      <div class="card">
        <div class="card-header">
          <span class="icon">💻</span>
          <h2>Sistema Operacional</h2>
        </div>
        <div class="info-group">
          <div class="info-label">Plataforma (SO)</div>
          <div class="info-value" id="so-nome">Carregando...</div>
        </div>
        <div class="info-group">
          <div class="info-label">Arquitetura</div>
          <div class="info-value" id="so-arch">Carregando...</div>
        </div>
      </div>

      <!-- Card Processador -->
      <div class="card">
        <div class="card-header">
          <span class="icon">⚡</span>
          <h2>Processador</h2>
        </div>
        <div class="info-group">
          <div class="info-label">Modelo de CPU</div>
          <div class="info-value" id="cpu-modelo">Carregando...</div>
        </div>
        <div class="info-group">
          <div class="info-label">Núcleos Disponíveis</div>
          <div class="info-value" id="cpu-cores">Carregando...</div>
        </div>
      </div>

      <!-- Card Memória RAM -->
      <div class="card">
        <div class="card-header">
          <span class="icon">🪨</span>
          <h2>Memória RAM</h2>
        </div>
        <div class="info-group">
          <div class="info-label">Total / Livre</div>
          <div class="info-value" id="ram-info">Carregando...</div>
        </div>
        <div class="info-group">
          <div class="info-label">Status</div>
          <div id="ram-badge" class="badge">Analisando</div>
        </div>
      </div>

      <!-- Card Ambiente e Uptime -->
      <div class="card">
        <div class="card-header">
          <span class="icon">🪴</span>
          <h2>Ambiente de Execução</h2>
        </div>
        <div class="info-group">
          <div class="info-label">Tempo Ativo (Uptime)</div>
          <div class="info-value" id="uptime-info">Carregando...</div>
        </div>
        <div class="info-group">
          <div class="info-label">Tipo de Hospedagem</div>
          <div class="info-value" id="ambiente-tipo">Detectando...</div>
        </div>
      </div>
    </div>

    <footer>
      ✨ Relatório Técnico de SO • Desenvolvimento &amp; Nuvem ✨
    </footer>
  </div>

  <script>
    async function carregarMetricas() {
      try {
        const res = await fetch('/api/metricas');
        const data = await res.json();

        document.getElementById('so-nome').textContent = data.platform || 'Desconhecido';
        document.getElementById('so-arch').textContent = data.arch || 'x64';
        document.getElementById('cpu-modelo').textContent = data.cpuModel || 'CPU Virtual/Física';
        document.getElementById('cpu-cores').textContent = (data.cpuCores || '1') + ' núcleo(s)';
        document.getElementById('ram-info').textContent = `${data.freeMem || '0'} MB / ${data.totalMem || '0'} MB`;
        document.getElementById('uptime-info').textContent = (data.uptime || '0') + ' segundos';
        
        const ambiente = data.platform.includes('win') ? 'Local (Windows)' : 'Nuvem PaaS (Linux Container)';
        document.getElementById('ambiente-tipo').textContent = ambiente;
        document.getElementById('ram-badge').textContent = 'Ativo 🌿';
      } catch (err) {
        console.error('Erro ao buscar métricas:', err);
      }
    }

    carregarMetricas();
    setInterval(carregarMetricas, 5000);
  </script>
</body>
</html>