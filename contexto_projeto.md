# Elo Vet — Contexto do Projeto e Guia do Ecossistema
> **Slogan oficial:** *"Cuidar de quem amamos: é isso que nos une."*

Este documento consolida a visão estratégica, arquitetura de funcionalidades, modelo de negócios e o design system do **Elo Vet**, uma solução **B2B2C Asset-Light** integrada ao ecossistema da **Clyvo**. O projeto foi concebido para resolver o maior gargalo das clínicas veterinárias e da plataforma Clyvo: o **Churn de 90 dias** e a baixa adesão dos tutores aos cuidados continuados pós-consulta.

---

## 🎯 Proposta de Valor e Modelo de Negócios

Em vez de focar em hardware ou dispositivos vestíveis (wearables) de alto custo de desenvolvimento e manutenção, o **Elo Vet** foca em **Inteligência de Dados e Experiência Conversacional**. 
*   **Para a Clínica (B2B):** Reduz o tempo de documentação clínica, otimiza o fluxo de atendimento presencial e aumenta o *Lifetime Value* (LTV) através de visitas preventivas recorrentes.
*   **Para o Tutor (B2C):** Traduz o diagnóstico complexo em uma jornada clara, acolhedora e empática de cuidados no WhatsApp, garantindo que o pet receba o tratamento correto.

---

## ⚙️ Arquitetura de Funcionalidades do MVP

O ecossistema está dividido em quatro frentes funcionais que se alimentam mutuamente:

### 1. Aplicativo do Tutor (B2C) & Assistente Conversacional (WhatsApp)
*   **Health Hub (Score de Risco Epidemiológico):** Interface dinâmica que indica o nível de atenção à saúde do pet (Verde/Amarelo/Vermelho) com base no histórico de consultas e logs de comportamento.
*   **Diário de Saúde Conversacional (WhatsApp):** O tutor relata via texto ou áudio comportamentos simples do pet (apetite, fezes, energia). A IA analisa esses inputs de forma contínua e sem atrito.
*   **Checklist Terapêutico e Preventivo (To-Do List):** Agenda automática com lembretes didáticos de medicamentos, vacinas e retornos, enviada diretamente ao WhatsApp.
*   **Agente de Follow-up e Tradução Clínica:** A IA acompanha o tutor pós-consulta, explicando os diagnósticos de forma leiga, acolhedora e empática.
*   **Agendamento Inteligente e Check-in Digital (Virtual Waiting Room):** Permite o agendamento em 2 cliques. Ao chegar à clínica, o tutor realiza o check-in pelo WhatsApp e aguarda no carro ou em área aberta, evitando o estresse do pet na sala de espera.

### 2. Painel do Veterinário e Gestão de Clínicas (Web/B2B)
*   **Recepção de Notas SOAP (Integração Clyvo Escriba IA):** Transcrição automática em tempo real da consulta clínica no padrão SOAP (Subjetivo, Objetivo, Avaliação, Plano), consumida diretamente da tecnologia Clyvo.
*   **Handoff Automatizado para o Tutor:** O veterinário valida o prontuário e, com um único clique, o sistema gera o plano de cuidados simplificado e envia para o WhatsApp do tutor.
*   **Visualização de Tendências Clínicas:** Gráficos longitudinais de evolução de peso, exames laboratoriais e logs de comportamento voluntário para suporte diagnóstico.
*   **Kanban de Gestão de Fila em Tempo Real:** Painel que organiza o fluxo físico dos pacientes (Agendados $\rightarrow$ Aguardando Check-in $\rightarrow$ Em Consulta $\rightarrow$ Finalizados).

### 3. Motor Preditivo de Risco (Back-end)
*   **Modelagem Epidemiológica:** Algoritmos que cruzam raça, peso, idade e predisposições genéticas para identificar riscos proativos (ex: a alta probabilidade de problemas na coluna em Dachshunds com ganho de peso).
*   **Alertas de Anomalias:** Gatilhos automáticos baseados nos logs do Diário de Saúde Conversacional (ex: alertas de apatia contínua por 3 dias).
*   **Disparos Proativos:** O sistema aciona o WhatsApp do tutor indicando a necessidade de exames preventivos ou agendamento de retorno, gerando novas consultas para as clínicas credenciadas.

### 4. Marketplace & Prontuário Descentralizado
*   **Prontuário Unificado na Nuvem:** Histórico portátil de saúde do pet protegido por LGPD. Ao ser encaminhado para um especialista parceiro da rede, o histórico clínico e exames são compartilhados instantaneamente.
*   **Busca Inteligente por Geolocalização:** Mapeamento de clínicas e especialistas credenciados para direcionamento rápido baseado em risco ou indicação de retornos.

---
