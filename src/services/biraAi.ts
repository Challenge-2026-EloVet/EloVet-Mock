const BIRA_AI_URL = import.meta.env.VITE_BIRA_AI_URL ?? "http://localhost:8000";
const TIMEOUT_MS = 45_000;

export type BiraPet = {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  idade_anos: number;
  peso_kg: number;
};

export type BiraSoap = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};

export type BiraAnalysisRequest = {
  pet: BiraPet;
  soap: BiraSoap;
  veterinario?: string;
};

export type BiraAnalysis = {
  diagnostico_provavel: string;
  risco_epidemiologico: "BAIXO" | "MÉDIO" | "ALTO";
  sugestoes_exames: string[];
  mensagem_acolhimento_tutor: string;
  checklist_tratamento: { tarefa: string; horario: string }[];
  checklist_prevencao: string[];
  origem: "gemini" | "mock" | "fallback";
};

export async function analisarConsulta(
  request: BiraAnalysisRequest,
): Promise<BiraAnalysis> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${BIRA_AI_URL}/api/ai/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`O Bira IA respondeu com erro ${response.status}.`);
    }
    return (await response.json()) as BiraAnalysis;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("O Bira IA demorou demais para responder.");
    }
    if (error instanceof TypeError) {
      throw new Error("Não foi possível conectar ao Bira IA.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
