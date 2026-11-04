
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn, ShieldCheck, TriangleAlert } from "lucide-react";
import logo from "../imgs/logo.png";
import { ApiError, login } from "../services/eloVetApi";
import { criarSessao, salvarSessao, type Sessao } from "../services/sessao";

export function Login({ onEntrar }: { onEntrar: (sessao: Sessao) => void }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({});

  const entrar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);
    setErrosCampos({});
    setEnviando(true);

    try {
      const resposta = await login(email.trim(), senha);

      // O portal é exclusivo da equipe da clínica: tutores (RESPONSAVEL) acessam pelo app mobile.
      if (resposta.idResponsavel != null) {
        setErro("Este acesso é exclusivo da equipe da clínica. Tutores devem usar o app Elo Vet.");
        return;
      }

      const sessao = criarSessao(resposta.token);
      salvarSessao(sessao);
      onEntrar(sessao);
    } catch (error) {
      if (error instanceof ApiError) {
        setErro(error.message);
        setErrosCampos(error.campos);
      } else {
        setErro("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#f5f7f3] text-[#20352d] lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#185a43] p-12 text-white lg:flex">
        <img src={logo} alt="Elo Vet" className="h-12 w-auto max-w-[180px] object-contain object-left" />
        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#dfb461]">Portal do Veterinário</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
            Do consultório à casa do tutor, sem perder nenhum cuidado.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Agenda, prontuário, Bira IA e checklist de cuidado em um só lugar para a equipe da clínica.
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs text-white/55">
          <ShieldCheck size={15} /> Acesso protegido por token JWT da Elo Vet API
        </p>
        <span className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/5" />
        <span className="pointer-events-none absolute -bottom-10 right-24 h-40 w-40 rounded-full bg-[#dfb461]/10" />
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center rounded-2xl bg-[#185a43] p-4 lg:hidden">
            <img src={logo} alt="Elo Vet" className="h-10 w-auto object-contain" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7e9f8e]">Bem-vindo de volta</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[#185a43]">Entrar no portal</h2>
          <p className="mt-2 text-sm text-[#71847b]">Use o e-mail e a senha cadastrados pela administração da clínica.</p>

          <form onSubmit={entrar} noValidate className="mt-8 space-y-4">
            <label htmlFor="email" className="block text-xs font-semibold text-[#567266]">
              E-mail
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@elovet.com"
                aria-invalid={Boolean(errosCampos.email)}
                className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-sm font-normal text-[#38584a] outline-none focus:border-[#185a43] ${errosCampos.email ? "border-[#c9604f]" : "border-[#dfe8e1]"}`}
              />
              {errosCampos.email && <span className="mt-1 block font-normal text-[#b5513f]">{errosCampos.email}</span>}
            </label>

            <label htmlFor="senha" className="block text-xs font-semibold text-[#567266]">
              Senha
              <span className="relative mt-1.5 block">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="Sua senha"
                  aria-invalid={Boolean(errosCampos.senha)}
                  className={`h-11 w-full rounded-xl border bg-white pl-3 pr-11 text-sm font-normal text-[#38584a] outline-none focus:border-[#185a43] ${errosCampos.senha ? "border-[#c9604f]" : "border-[#dfe8e1]"}`}
                />
                <button
                  id="toggle-senha"
                  type="button"
                  onClick={() => setMostrarSenha((atual) => !atual)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#8aa197] hover:text-[#185a43]"
                >
                  {mostrarSenha ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
              {errosCampos.senha && <span className="mt-1 block font-normal text-[#b5513f]">{errosCampos.senha}</span>}
            </label>

            {erro && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border border-[#f0d4cc] bg-[#fdf3f0] px-3 py-2.5 text-sm text-[#a2483a]">
                <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {erro}
              </p>
            )}

            <button
              id="btn-entrar"
              type="submit"
              disabled={enviando}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#185a43] text-sm font-bold text-white shadow-lg shadow-[#185a43]/15 transition hover:bg-[#124936] disabled:cursor-wait disabled:opacity-70"
            >
              {enviando ? <LoaderCircle size={17} className="animate-spin" /> : <LogIn size={17} />}
              {enviando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#8aa197]">
            Ainda não tem acesso? Peça ao administrador da clínica para criar o seu usuário.
          </p>
        </div>
      </section>
    </div>
  );
}
