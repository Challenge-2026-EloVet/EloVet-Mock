# Requisitos da Disciplina: Disruptive Architectures (IoT, IoB & Generative IA)
## FIAP Challenge 2026 — Parceria Clyvo Vet (2º Semestre: Sprint 3 e Sprint 4)

Este documento consolida as diretrizes, critérios de avaliação, especificações técnicas e entregáveis da disciplina de **Disruptive Architectures: IoT, IoB & Generative IA** para as **Sprints 3 e 4** do Challenge 2026.

---

## 📌 1. Visão Geral e Diretrizes do Challenge

O Challenge 2026 propõe a transformação da medicina veterinária digital de um modelo episódico e reativo para uma experiência contínua, preventiva e integrada.

* **Estrutura no 2º Semestre:** Duas entregas distintas e incrementais (**Sprint 3** e **Sprint 4**), demonstrando a evolução técnica contínua da solução.
* **Formatos Tecnológicos Permitidos:** Interfaces digitais (aplicativos, assistentes conversacionais, WhatsApp), hardware/sensores (IoB/wearables), inteligência de dados (score preditivo de risco, recomendação de próximos passos e histórico longitudinal).
* **Critérios Macro da Clyvo Vet:** Clareza do problema, aplicabilidade real, diferencial competitivo, geração de retenção (LTV) e uso inteligente de IA e dados.

---

## 🚀 2. Sprint 3 — Definição da Solução, Arquitetura e Modelagem de IA

Na **Sprint 3**, o foco é a concepção técnica, especificação da arquitetura de integração, modelagem de dados e a justificativa da escolha da Inteligência Artificial. A demonstração funcional pode ser real ou simulada.

### 📋 Requisitos e Conteúdos Obrigatórios
1. **Definição do Problema de Negócio:**
   * Contextualização da dor na jornada de saúde do pet (ex.: descontinuidade do tratamento pós-consulta, esquecimento de medicação, desengajamento da clínica).
   * Justificativa do papel da IA como motor de inteligência e personalização (evitando lembretes genéricos).

2. **Abordagem de IA Escolhida e Justificativa Técnica:**
   * Apresentação da abordagem tecnológica adotada: IA Generativa (LLM), Modelos Preditivos de Risco e/ou RAG (*Retrieval-Augmented Generation*).
   * Justificativa do uso de contratos estritos de dados (ex.: Structured Outputs via Pydantic) para garantir previsibilidade e evitar alucinações médicas.
   * Definição da base de conhecimento (regras epidemiológicas, diretrizes de raça, peso e idade).

3. **Origem, Estrutura e Fluxo dos Dados:**
   * Mapeamento das fontes de entrada de dados (ex.: prontuário SOAP, dados cadastrais do pet, inputs do tutor).
   * Definição dos contratos de entrada (payloads JSON) e de saída (recomendações clínicas, checklists e alertas).

4. **Aplicação de Conceitos de IoB (*Internet of Behaviors*):**
   * Estruturação de como a solução captura o comportamento do tutor e do animal para gerar inteligência preventiva e retroalimentar o ecossistema.

5. **Desenho da Arquitetura de Integração:**
   * Mapeamento do microsserviço de IA (ex.: Python / FastAPI).
   * Definição das integrações com bancos de dados relacionais (PostgreSQL/Oracle) e NoSQL (MongoDB para documentos e logs de IoB).
   * Orquestração de mensageria assíncrona (RabbitMQ) e canais de saída (WhatsApp API / Webhooks).

### 📦 Entregáveis da Sprint 3
* **Repositório GitHub:** Código-fonte do microsserviço e documentação técnica completa no `README.md` (com instruções de execução local via `venv` e Docker).
* **Vídeo Pitch (YouTube - Modo Não Listado):** Vídeo de até 5 minutos com locução por voz clara, cobrindo o problema, a abordagem de IA, a demonstração do fluxo (real ou simulada via Swagger/Postman) e a arquitetura de integração.
* **Arquivo `.zip` no Portal FIAP:** Contendo o link do repositório no GitHub e o link do vídeo não listado no YouTube.

### 📊 Grade de Avaliação da Sprint 3 (Total: 100 pontos)
* **Aplicação Técnica de Conceitos de IA (Até 60 pontos):** Adequação da abordagem (LLM, RAG, IoB), rigor dos schemas e relevância clínica da modelagem.
* **Clareza e Didática do Vídeo Pitch (Até 20 pontos):** Qualidade da explicação, objetividade, sincronia entre fala e telas apresentadas.
* **Organização do Repositório e Documentação (Até 20 pontos):** Qualidade do `README.md`, facilidade de reprodução do ambiente e estrutura limpa de código.

---

## ⚡ 3. Sprint 4 — Desenvolvimento, Integração Funcional e Implementação Real

Na **Sprint 4**, o foco migra da concepção para a **execução técnica funcional**. É a etapa em que o que foi desenhado na Sprint 3 deve estar obrigatoriamente implementado, conectado e operacional de ponta a ponta.

### 📋 Requisitos e Conteúdos Obrigatórios
1. **Implementação Real e Conexão de Ponta a Ponta:**
   * O microsserviço de IA deve estar plenamente integrado e comunicando-se com as demais camadas do sistema (APIs backend centrais, banco de dados persistente e interfaces de usuário).
   * Chamadas reais ao modelo de IA ou motor preditivo (eliminação de mocks estáticos na inferência principal).

2. **Persistência de Dados e Rastreabilidade:**
   * Armazenamento efetivo do histórico de consultas, diagnósticos e planos de cuidado no banco de dados.
   * Integração funcional do banco NoSQL para logs de comportamento e histórico de interações (IoB).

3. **Orquestração Assíncrona e Handoff Operacional:**
   * Processamento de eventos via fila de mensageria (RabbitMQ) em ambiente de teste ou produção.
   * Acionamento funcional do canal de comunicação (disparo de notificações e planos de cuidados via API de mensageria/WhatsApp).

4. **Tratamento de Erros, Resiliência e Desempenho:**
   * Validação de payloads de entrada com tratamento de exceções amigável.
   * Logs estruturados de requisições, tempo de resposta da inferência e fallback para indisponibilidade de serviços externos.

5. **Deploy e Containerização Completa:**
   * Configuração de orquestração via Docker Compose para execução conjunta dos serviços (API de IA + Banco NoSQL + Mensageria).

### 📦 Entregáveis da Sprint 4
* **Repositório GitHub Atualizado:** Implementação completa do microsserviço com histórico de commits que demonstre a evolução em relação à Sprint 3.
* **Documentação Atualizada:** Instruções de execução atualizadas, diagrama da arquitetura final implementada e exemplos de testes funcionais executados.
* **Vídeo Demonstrativo da Solução Integrada:** Demonstração do ecossistema operando de forma integrada: entrada do atendimento $\rightarrow$ inferência real da IA $\rightarrow$ persistência em banco $\rightarrow$ entrega final ao usuário.
* **Arquivo `.zip` no Portal FIAP:** Contendo o link do repositório no GitHub e o link do vídeo da entrega final.

### 📊 Critérios de Avaliação da Sprint 4
* **Nível de Integração Funcional:** Avaliação da conectividade real entre frontend, backend, banco de dados e motor de IA.
* **Qualidade e Robustez do Código:** Boas práticas de programação, separação de responsabilidades e tratamento de erros.
* **Evolução em Relação à Sprint 3:** Cumprimento do planejamento técnico apresentado na entrega anterior.
* **Alinhamento com o Desafio Clyvo:** Capacidade da solução de gerar retenção, valor preventivo e diferencial competitivo real.

---

## 🔄 Quadro Comparativo: Sprint 3 vs. Sprint 4

| Dimensão | Sprint 3 (Concepção & Arquitetura) | Sprint 4 (Implementação & Integração) |
| :--- | :--- | :--- |
| **Objetivo Principal** | Desenho da solução, contratos de dados e RAG | Implementação funcional e integração completa |
| **Motor de IA** | Definição da LLM/RAG (inferência real ou mockada) | Chamadas reais integradas ao pipeline de dados |
| **Conexão com Sistema** | APIs documentadas e schemas validados | Conexão operacional com backend, banco e mensageria |
| **Banco de Dados** | Modelagem conceitual e schemas NoSQL/SQL | Persistência e leitura reais de dados |
| **Demonstração** | Vídeo pitch explicativo do fluxo e arquitetura | Vídeo demonstrando a solução operando de ponta a ponta |
