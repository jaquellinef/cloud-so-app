# 📠 CLOUD-SO-APP // Painel Vintage de Monitoramento de SO & Nuvem

[![Node.js Version](https://img.shields.io/badge/node.js-v18%2B-15803d?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js Framework](https://img.shields.io/badge/express.js-v5.2.1-78350f?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![License MIT](https://img.shields.io/badge/license-MIT-d97706?style=for-the-badge)](LICENSE)
[![Deployment Cloud](https://img.shields.io/badge/deploy-Render%20%7C%20Railway-2563eb?style=for-the-badge&logo=render&logoColor=white)](https://cloud-so-app-jaque.onrender.com)

O **`cloud-so-app`** é uma aplicação web completa desenvolvida para diagnóstico, telemetria e análise em tempo real dos recursos de hardware e do **Sistema Operacional (SO)**, operando de forma transparente tanto em ambientes de desenvolvimento local (Bare-Metal / Máquina Virtual) quanto em plataformas de Nuvem como Serviço (**PaaS** - Render, Railway, Koyeb).

Inspirado em consoles retrô e teletipos clássicos dos anos 80, o sistema apresenta uma **interface visual víntage com ícones embutidos**, alternância de temas CRT (Fósforo Verde / Âmbar / Papel Antigo) e disponibiliza APIs JSON nativas para consumo automatizado.

---

## 🎯 1. Objetivo e Problema a Resolver

### 1.1 Objetivo
Prover uma solução leve, independente e visualmente atrativa para inspecionar parâmetros de baixo nível do Sistema Operacional (uso de CPU, memória RAM, capacidade de disco, uptime do kernel, processos ativos, interfaces de rede e identificação de conteinerização) sem a necessidade de instalar agentes pesados de terceiros.

### 1.2 Problema que Pretende Resolver
1. **Opacidade em Ambientes PaaS:** Em plataformas como Render e Railway, o desenvolvedor frequentemente não tem acesso direto aos dados do hardware hospedeiro nem às variáveis de isolamento do contêiner.
2. **Dependência de Agentes de Monitoramento Complexos:** Ferramentas tradicionais de APM podem exigir configurações invasivas e consumo elevado de memória. O `cloud-so-app` executa via chamadas diretas ao Kernel utilizando módulos nativos do Node.js (`os`, `fs`, `child_process`).
3. **Análise Comparativa Bare-Metal vs. Nuvem:** Facilita a compreensão prática dos conceitos de Sistemas Operacionais, demonstrando visualmente como a virtualização e a conteinerização abstraem o hardware real.

---

## 🔭 2. Escopo do Projeto

### O que está no escopo:
- ✅ Coleta em tempo real de dados de CPU, RAM, Disco, Rede e Uptime do SO.
- ✅ Detecção automática do ambiente de execução (Local vs. Render / Railway / Koyeb).
- ✅ Painel de controle web responsivo com estilo visual vintage e ícones SVG integrados.
- ✅ Alternância de temas retrô em tempo real (Modo Teletipo / CRT Fósforo Verde / CRT Fósforo Âmbar).
- ✅ Endpoints REST JSON para integrações de telemetria (`/api/metrics`) e verificação de integridade (`/health`).
- ✅ Execução multiplataforma garantida (Windows e Linux).

### O que está fora do escopo:
- ❌ Persistência de dados históricos de telemetria em banco de dados relacional.
- ❌ Modificação ou encerramento forçado de processos do sistema operacional.

---

## 📋 3. Requisitos do Sistema

### 3.1 Requisitos Funcionais (RF)

| Código | Descrição do Requisito Funcional |
| :--- | :--- |
| **RF-01** | O sistema deve coletar e exibir o *hostname*, plataforma (win32/linux), versão do kernel e arquitetura de CPU. |
| **RF-02** | O sistema deve calcular o uso de memória RAM em gigabytes ($GB$) e a porcentagem de uso: $RAM_{USADA} = RAM_{TOTAL} - RAM_{LIVRE}$. |
| **RF-03** | O sistema deve identificar o ambiente de hospedagem (Localhost, Render, Railway) inspecionando variáveis de ambiente. |
| **RF-04** | O sistema deve exibir o tempo de atividade acumulado do sistema (*uptime*) em dias, horas, minutos e segundos. |
| **RF-05** | O sistema deve fornecer uma API REST pública no endpoint `/api/metrics` retornando todas as métricas em formato JSON. |
| **RF-06** | O sistema deve disponibilizar um endpoint de healthcheck em `/health`. |
| **RF-07** | A interface visual deve ter estilo vintage com ícones SVG e suporte para comutação de temas CRT. |

### 3.2 Requisitos Não-Funcionais (RNF)

| Código | Descrição do Requisito Não-Funcional |
| :--- | :--- |
| **RNF-01** | **Desempenho:** O tempo de resposta das requisições deve ser inferior a 200 ms. |
| **RNF-02** | **Portabilidade:** A aplicação deve funcionar perfeitamente em sistemas Windows e Linux sem alteração do código. |
| **RNF-03** | **Segurança e Isolamento:** Não deve permitir execução de comandos shell arbitrários via entrada do usuário. |
| **RNF-04** | **Consumo de Recursos:** O consumo de memória RAM do processo Node.js não deve exceder 50 MB de Heap. |

---

## 🛠️ 4. Tecnologias Utilizadas

- **Runtime Backend:** [Node.js](https://nodejs.org/) (v18.x / v20.x / v24.x)
- **Framework Web:** [Express.js](https://expressjs.com/) (v5.2.1)
- **Módulos Nativos do Node.js:**
  - `os`: Consulta de dados de hardware, CPU, RAM e Uptime.
  - `fs`: Leitura de estatísticas de disco via `statfsSync`.
  - `child_process`: Execução pontual de comandos para coleta de processos e periferia.
- **Frontend / Interface:** HTML5 semântico, CSS3 com variáveis personalizadas, Google Fonts (*VT323* e *Courier Prime*) e SVGs inline.
- **Versionamento & Deploy:** Git, GitHub, Render, Railway.

---

## 🏗️ 5. Arquitetura da Aplicação e Organização do Sistema

### 5.1 Visão da Arquitetura

```
 +-----------------------------------------------------------------------+
 |                         CLIENTE / NAVEGADOR                           |
 |          (Interface Web Vintage CRT ou Consumidor da API REST)        |
 +-----------------------------------+-----------------------------------+
                                     |
                                     | Requisições HTTP
                                     |(GET / ou /api/metrics)
                                     |     v
 +-----------------------------------------------------------------------+
 |                          EXPRESS.JS SERVER                            |
 |                           (Porta 3000 / $PORT)                        |
 +-------------------+-------------------------------+-------------------+
                     |                               |
                     v                               v
    +---------------------------------+  +-------------------------------+
    |    ROTAS DA APLICAÇÃO           |  | ENGINE DE RENDERIZAÇÃO VINTAGE|
    |  - GET / (Dashboard HTML)       |  |  - HTML5 + CSS3 Variables     |
    |  - GET /api/metrics (JSON API)  |  |  - Ícones SVG Inline          |
    |  - GET /health (Healthcheck)    |  |  - CRT Scanlines & Retro Font |
    +----------------+----------------+  +-------------------------------+
                     |
                     v
 +-----------------------------------------------------------------------+
 |                     CAMADA DE COLETA DE MÉTRICAS                      |
 +-------------------+-----------------------+---------------------------+
                     |                       |
                     v                       v
    +---------------------------------+  +-------------------------------+
    |   MÓDULOS NATIVOS NODE.JS       |  |  SUBSISTEMA SHELL (SEGURO)    |
    |   - os.hostname(), os.cpus()    |  |  - powershell (Windows)       |
    |   - os.totalmem(), os.freemem() |  |  - ps aux / statfs (Linux)    |
    |   - os.uptime(), os.loadavg()   |  |                               |
    +----------------+----------------+  +-------------------------------+
                     |                               |
                     +---------------+---------------+
                                     |
                                     v
 +-----------------------------------------------------------------------+
 |                    SISTEMA OPERACIONAL & KERNEL                       |
 |             (Windows 11 Bare-Metal ou Linux LXC Container)            |
 +-----------------------------------------------------------------------+
```

### 5.2 Organização dos Arquivos no Repositório

```text
cloud-so-app/
├── server.js                 # Servidor Express, coleta de métricas e interface vintage
├── package.json              # Dependências e scripts npm
├── package-lock.json         # Mapeamento exato de versões
├── README.md                 # Documentação principal do repositório
├── MANUAL.md                 # Manual detalhado de SO e experimentos
├── relat_rio_de_monitoramento_cloud.md  # Relatório de implantação em nuvem
└── .gitignore                # Regras para ignorar o node_modules
```

---

## 🚀 6. Guia de Instalação, Configuração e Execução

### 6.1 Pré-requisitos
Certifique-se de possuir instalado em sua máquina:
- **Node.js:** Versão 18.0.0 ou superior (`node -v`)
- **Git:** Para clonar o repositório (`git --version`)

### 6.2 Passos de Instalação Local

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/jaquellinef/cloud-so-app.git
   cd cloud-so-app
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Iniciar o servidor:**
   ```bash
   npm start
   ```

4. **Acessar no navegador:**
   Abra o endereço `http://localhost:3000` para visualizar o painel vintage ou `http://localhost:3000/api/metrics` para a API JSON.

---

## ⚙️ 7. Variáveis de Ambiente

A aplicação utiliza as seguintes variáveis de ambiente (configuradas automaticamente pelos provedores de nuvem ou declaradas manualmente):

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `PORT` | `3000` | Porta TCP na qual o servidor Express atenderá as requisições. |
| `RENDER` | N/A | Definida automaticamente no Render para sinalizar ambiente PaaS Cloud. |
| `RAILWAY_STATIC_URL` | N/A | Definida no Railway para mapeamento da URL pública. |

---

## 🔌 8. Documentação das APIs (Endpoints REST)

### 8.1 `GET /`
- **Descrição:** Retorna o dashboard executivo em formato HTML com o estilo vintage CRT e ícones SVG.
- **Resposta:** Documento `text/html`.

### 8.2 `GET /api/metrics`
- **Descrição:** Retorna a telemetria completa do sistema operacional e hardware em formato JSON.
- **Resposta Exemplo (`application/json`):**
  ```json
  {
    "timestamp": "2026-10-31T14:30:00.000Z",
    "environment": {
      "name": "Render (Cloud PaaS)",
      "isCloud": true,
      "provider": "Render"
    },
    "system": {
      "hostname": "srv-db2ff9jtqb8s73d7hp70",
      "type": "Linux",
      "platform": "linux",
      "architecture": "x64",
      "release": "7.0.0-1009-aws",
      "uptimeFormatted": "53d 5h 10m 12s"
    },
    "cpu": {
      "model": "AMD EPYC 7R13 Processor",
      "cores": 8,
      "loadAverage": [0.15, 0.08, 0.02]
    },
    "memory": {
      "totalGB": "30.65",
      "usedGB": "21.24",
      "freeGB": "9.41",
      "usedPercent": 69.3
    }
  }
  ```

### 8.3 `GET /health`
- **Descrição:** Endpoint de sondagem para balanceadores de carga e healthcheck de contêineres.
- **Resposta (`application/json`):**
  ```json
  {
    "status": "UP",
    "service": "cloud-so-app",
    "timestamp": "2026-10-31T14:30:00.000Z"
  }
  ```

---

## 🧪 9. Procedimentos de Teste e Deploy

### 9.1 Testes Locais
Para testar a integridade da aplicação e o tempo de resposta da API de métricas, execute no terminal:

```bash
# Teste de conexão e sintaxe do servidor
node -e "require('./server.js')"

# Teste HTTP via cURL
curl -I http://localhost:3000/
curl -s http://localhost:3000/api/metrics | jq .
```

### 9.2 Deploy em Nuvem (Render / Railway)

#### Implantação no Render:
1. Conecte sua conta do GitHub ao **Render**.
2. Crie um novo **Web Service** e escolha o repositório `cloud-so-app`.
3. Configure:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Clique em **Deploy**.

---

## 🐛 10. Gerenciamento de Issues no GitHub

O repositório utiliza o sistema de **GitHub Issues** para o rastreamento de tarefas, bugs e melhorias.

### 10.1 Workflow de Triagem e Labels
As issues devem ser categorizadas utilizando as seguintes etiquetas (*labels*):
- 🐛 `bug`: Falhas na coleta de métricas ou erros no servidor.
- ✨ `enhancement`: Solicitações de novas funcionalidades.
- 🎨 `vintage-ui`: Ajustes estilísticos na interface retrô e ícones SVG.
- 📚 `documentation`: Atualizações no README ou manuais.

### 10.2 Modelos de Issues (Templates)

#### Modelo para Relato de Bug:
```markdown
**Descrição do Erro:**
Uma explicação clara e concisa do problema identificado.

**Ambiente de Execução:**
- SO: [ex: Windows 11 / Linux Ubuntu 22.04]
- Plataforma: [ex: Localhost / Render / Railway]
- Versão do Node.js: [ex: v20.10.0]

**Passos para Reproduzir:**
1. Acessar a rota '...'
2. Observar o comportamento '...'

**Comportamento Esperado:**
O projeto ser executado em ambiente virtual e local.
```

---

## 📚 11. Estrutura e Organização da Wiki do Projeto

A **Wiki do repositório** no GitHub foi estruturada em seções para aprofundamento teórico e prático:

### Páginas da Wiki:
1. **`Home`**: Apresentação da Wiki e guia rápido de navegação.
2. **`Conceitos-de-SO-e-Kernel`**: Explicação teórica sobre chamadas de sistema (*system calls*), gerenciamento de processos (PCB) e algoritmos de escalonamento.
3. **`Virtualização Bare‐Metal x Conteinerização em Nuvem`**: Estudo comparativo detalhado das diferenças entre os resultados obtidos em execuções *Bare-Metal* no Windows e contêineres Linux PaaS.
4. **`Guia de Estilização: Vintage`**: Especificações de design, variáveis CSS3 e conjunto de ícones SVG utilizados no tema retrô CRT.
5. **`Troubleshooting e FAQ`**: Soluções para problemas comuns de permissão de acesso a métricas do sistema e portas em uso.

---

## 📜 Licença

Este projeto está licenciado sob a Licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
