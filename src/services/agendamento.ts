const AGENDAMENTO_URL =
  import.meta.env.VITE_AGENDAMENTO_URL ?? "http://localhost:8081";
const TIMEOUT_MS = 15_000;

export type StatusAgendamento =
  | "AGENDADO"
  | "CONFIRMADO"
  | "EM_ATENDIMENTO"
  | "CONCLUIDO"
  | "CANCELADO"
  | "NAO_COMPARECEU";

export type Agendamento = {
  idAgendamento: number;
  idPet: number;
  nomePet: string | null;
  especiePet: string | null;
  idResponsavel: number;
  nomeResponsavel: string | null;
  idVeterinario: number;
  nomeVeterinario: string | null;
  idClinica: number;
  nomeClinica: string | null;
  dataHora: string;
  status: StatusAgendamento;
  observacao: string | null;
};

export type AgendamentoRequest = {
  idPet: number;
  idResponsavel: number;
  idVeterinario: number;
  idClinica: number;
  /** Data e hora local no formato ISO, ex.: 2026-12-10T14:30:00 */
  dataHora: string;
  status?: StatusAgendamento;
  observacao?: string | null;
};

export type ClinicaOpcao = { id: number; nome: string };
export type VeterinarioOpcao = { id: number; nome: string; crmv: string };
export type ResponsavelOpcao = { id: number; nome: string };
export type PetOpcao = {
  id: number;
  nome: string;
  especie: string;
  raca: string | null;
};

type ErrorResponse = { mensagem?: string; detalhes?: string[] };

export function listarAgendamentos(): Promise<Agendamento[]> {
  return request<Agendamento[]>("/agendamentos");
}

export function criarAgendamento(dados: AgendamentoRequest): Promise<Agendamento> {
  return request<Agendamento>("/agendamentos", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function atualizarAgendamento(
  id: number,
  dados: AgendamentoRequest,
): Promise<Agendamento> {
  return request<Agendamento>(`/agendamentos/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export function alterarStatus(
  id: number,
  status: StatusAgendamento,
): Promise<Agendamento> {
  return request<Agendamento>(`/agendamentos/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function listarClinicas(): Promise<ClinicaOpcao[]> {
  return request<ClinicaOpcao[]>("/catalogo/clinicas");
}

export function listarVeterinarios(idClinica: number): Promise<VeterinarioOpcao[]> {
  return request<VeterinarioOpcao[]>(`/catalogo/clinicas/${idClinica}/veterinarios`);
}

export function listarResponsaveis(): Promise<ResponsavelOpcao[]> {
  return request<ResponsavelOpcao[]>("/catalogo/responsaveis");
}

export function listarPets(idResponsavel: number): Promise<PetOpcao[]> {
  return request<PetOpcao[]>(`/catalogo/responsaveis/${idResponsavel}/pets`);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${AGENDAMENTO_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(await mensagemDeErro(response));
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("O serviço de agendamento demorou demais para responder.");
    }
    if (error instanceof TypeError) {
      throw new Error("Não foi possível conectar ao serviço de agendamento.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function mensagemDeErro(response: Response): Promise<string> {
  try {
    const corpo = (await response.json()) as ErrorResponse;
    const detalhes = corpo.detalhes?.length ? ` (${corpo.detalhes.join("; ")})` : "";
    if (corpo.mensagem) return `${corpo.mensagem}${detalhes}`;
  } catch {
    // corpo vazio ou não JSON: usa a mensagem genérica abaixo
  }
  return `O serviço de agendamento respondeu com erro ${response.status}.`;
}
