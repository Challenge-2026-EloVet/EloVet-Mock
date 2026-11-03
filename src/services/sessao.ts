// Sessão do usuário do portal: guarda o JWT da elo-vet-api e lê o e-mail (sub) e a expiração (exp).
const CHAVE = "elovet.sessao";

export type Sessao = { token: string; email: string; expiraEm: number };

export function criarSessao(token: string): Sessao {
  const payload = lerPayload(token);
  const email = typeof payload?.sub === "string" ? payload.sub : "";
  // Sem "exp" legível, assume a validade padrão da API (2 horas).
  const expiraEm = typeof payload?.exp === "number" ? payload.exp * 1000 : Date.now() + 2 * 60 * 60 * 1000;
  return { token, email, expiraEm };
}

export function salvarSessao(sessao: Sessao): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(sessao));
  } catch {
    // Armazenamento indisponível (ex.: navegação privada): a sessão vale só enquanto a página estiver aberta.
  }
}

export function carregarSessao(): Sessao | null {
  try {
    const salva = localStorage.getItem(CHAVE);
    if (!salva) return null;
    const sessao = JSON.parse(salva) as Sessao;
    if (!sessao.token || sessao.expiraEm <= Date.now()) {
      localStorage.removeItem(CHAVE);
      return null;
    }
    return sessao;
  } catch {
    return null;
  }
}

export function encerrarSessao(): void {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // nada a remover
  }
}

/** "helena.costa@elovet.com" -> "HC" */
export function iniciais(email: string): string {
  const partes = email.split("@")[0].split(/[._-]+/).filter(Boolean);
  const letras = partes.length > 1 ? partes[0][0] + partes[1][0] : (partes[0] ?? "?").slice(0, 2);
  return letras.toUpperCase();
}

function lerPayload(token: string): Record<string, unknown> | null {
  try {
    const parte = token.split(".")[1];
    const base64 = parte.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(parte.length / 4) * 4, "=");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}
