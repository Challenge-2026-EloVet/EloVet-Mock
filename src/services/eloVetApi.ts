// Cliente da elo-vet-api (Spring Boot): autenticação e cadastro de usuários.
// Contrato: POST /auth/login devolve { token, idResponsavel }; POST /auth/register devolve 200 sem corpo.
const ELOVET_API_URL = (
  import.meta.env.VITE_ELOVET_API_URL ?? "https://api-java-seurm-565421.azurewebsites.net"
).replace(/\/+$/, "");
// O App Service pode levar alguns segundos para "acordar" na primeira chamada.
const TIMEOUT_MS = 30_000;

export type TipoUsuario = "VETERINARIO" | "ADMIN" | "RESPONSAVEL";

export type LoginResponse = { token: string; idResponsavel: number | null };

export type CadastroUsuarioRequest = {
  nomeUsuario: string;
  email: string;
  senha: string;
  tipoUsuario: TipoUsuario;
  // Obrigatórios apenas para RESPONSAVEL (tutor)
  nomeCompleto?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  telefone?: string;
};

/** Erro da API com o status HTTP e, em erros de validação (400), a mensagem de cada campo. */
export class ApiError extends Error {
  readonly status: number;
  readonly campos: Record<string, string>;

  constructor(message: string, status: number, campos: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.campos = campos;
  }
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const response = await enviar("/auth/login", { email, senha });
  if (!response.ok) {
    const erro = await lerErro(response);
    // Credenciais inválidas: o Spring Security responde 403 sem mensagem própria.
    if (response.status === 401 || response.status === 403) {
      throw new ApiError("E-mail ou senha inválidos.", response.status);
    }
    throw comMensagemPadrao(erro, response.status, "Não foi possível entrar.");
  }
  return (await response.json()) as LoginResponse;
}

export async function cadastrarUsuario(dados: CadastroUsuarioRequest, token: string): Promise<void> {
  const response = await enviar("/auth/register", dados, token);
  if (response.ok) return;

  const erro = await lerErro(response);
  if (response.status === 400 && erro.vazio) {
    // A API responde 400 sem corpo quando o e-mail já está cadastrado.
    throw new ApiError("Já existe um usuário cadastrado com este e-mail.", 400);
  }
  if (response.status === 401) {
    throw new ApiError("Sua sessão expirou. Entre novamente para continuar.", 401);
  }
  if (response.status === 403 && !erro.mensagem) {
    throw new ApiError("Apenas administradores podem cadastrar usuários da equipe.", 403);
  }
  throw comMensagemPadrao(erro, response.status, "Não foi possível concluir o cadastro.");
}

async function enviar(path: string, corpo: unknown, token?: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${ELOVET_API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(corpo),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("A API da Elo Vet demorou demais para responder. Tente novamente.", 0);
    }
    throw new ApiError("Não foi possível conectar à API da Elo Vet.", 0);
  } finally {
    window.clearTimeout(timeout);
  }
}

type ErroLido = { vazio: boolean; mensagem?: string; campos: Record<string, string> };

// A API devolve erros em formatos diferentes:
//  - 400 de validação: [{ field, message }]
//  - 403 de permissão no cadastro: texto puro
//  - demais erros do Spring: { timestamp, status, error, path }
async function lerErro(response: Response): Promise<ErroLido> {
  const texto = (await response.text()).trim();
  if (!texto) return { vazio: true, campos: {} };

  let corpo: unknown;
  try {
    corpo = JSON.parse(texto);
  } catch {
    return { vazio: false, mensagem: texto, campos: {} };
  }

  if (Array.isArray(corpo)) {
    const campos: Record<string, string> = {};
    for (const item of corpo) {
      if (item && typeof item.field === "string" && typeof item.message === "string") {
        campos[item.field] ??= item.message;
      }
    }
    return { vazio: false, mensagem: "Revise os campos destacados.", campos };
  }

  if (corpo && typeof corpo === "object") {
    const objeto = corpo as Record<string, unknown>;
    const mensagem = [objeto.mensagem, objeto.message].find((valor) => typeof valor === "string");
    return { vazio: false, mensagem: mensagem as string | undefined, campos: {} };
  }
  return { vazio: false, campos: {} };
}

function comMensagemPadrao(erro: ErroLido, status: number, padrao: string): ApiError {
  if (erro.mensagem) return new ApiError(erro.mensagem, status, erro.campos);
  if (status >= 500) return new ApiError("A API da Elo Vet está com instabilidade. Tente novamente em instantes.", status);
  if (status === 400) return new ApiError("Dados inválidos. Revise o formulário.", status);
  return new ApiError(`${padrao} (erro ${status})`, status);
}
