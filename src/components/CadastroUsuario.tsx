import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, CircleCheck, LoaderCircle, ShieldCheck, Stethoscope, TriangleAlert, UserPlus, UserRound } from "lucide-react";
import { ApiError, cadastrarUsuario, type CadastroUsuarioRequest, type TipoUsuario } from "../services/eloVetApi";

const TIPOS: { valor: TipoUsuario; titulo: string; descricao: string; icone: ReactNode }[] = [
  { valor: "VETERINARIO", titulo: "Veterinário", descricao: "Atende, registra prontuários e cria planos de cuidado.", icone: <Stethoscope size={18} /> },
  { valor: "ADMIN", titulo: "Administrador", descricao: "Gerencia a clínica e cadastra a equipe.", icone: <ShieldCheck size={18} /> },
  { valor: "RESPONSAVEL", titulo: "Tutor", descricao: "Acompanha o pet e o checklist pelo app Elo Vet.", icone: <UserRound size={18} /> },
];

const ROTULO_TIPO: Record<TipoUsuario, string> = { VETERINARIO: "veterinário", ADMIN: "administrador", RESPONSAVEL: "tutor" };

type Formulario = {
  nomeUsuario: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
  nomeCompleto: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  telefone: string;
};

const FORMULARIO_VAZIO: Formulario = {
  nomeUsuario: "",
  email: "",
  senha: "",
  confirmacaoSenha: "",
  nomeCompleto: "",
  cpf: "",
  rg: "",
  dataNascimento: "",
  telefone: "",
};

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mesmas regras do RegisterDTO da elo-vet-api, para avisar antes de enviar.
function validar(tipo: TipoUsuario, form: Formulario): Record<string, string> {
  const erros: Record<string, string> = {};
  if (!form.nomeUsuario.trim()) erros.nomeUsuario = "Informe o nome de usuário.";
  if (!EMAIL_VALIDO.test(form.email.trim())) erros.email = "Informe um e-mail válido.";
  if (form.senha.length < 6) erros.senha = "A senha deve ter no mínimo 6 caracteres.";
  if (form.confirmacaoSenha !== form.senha) erros.confirmacaoSenha = "As senhas não conferem.";
  if (tipo === "RESPONSAVEL") {
    if (!form.nomeCompleto.trim()) erros.nomeCompleto = "Informe o nome completo do tutor.";
    if (form.cpf.replace(/\D/g, "").length !== 11) erros.cpf = "O CPF deve ter 11 dígitos.";
    if (form.dataNascimento && new Date(form.dataNascimento) >= new Date()) erros.dataNascimento = "A data de nascimento deve ser passada.";
  }
  return erros;
}

function montarRequisicao(tipo: TipoUsuario, form: Formulario): CadastroUsuarioRequest {
  const base = { nomeUsuario: form.nomeUsuario.trim(), email: form.email.trim(), senha: form.senha, tipoUsuario: tipo };
  if (tipo !== "RESPONSAVEL") return base;
  return {
    ...base,
    nomeCompleto: form.nomeCompleto.trim(),
    cpf: form.cpf.replace(/\D/g, ""),
    rg: form.rg.trim() || undefined,
    dataNascimento: form.dataNascimento || undefined,
    telefone: form.telefone.replace(/\D/g, "") || undefined,
  };
}

export function CadastroUsuario({ token, onBack, onSessaoExpirada }: { token: string; onBack: () => void; onSessaoExpirada: () => void }) {
  const [tipo, setTipo] = useState<TipoUsuario>("VETERINARIO");
  const [form, setForm] = useState<Formulario>(FORMULARIO_VAZIO);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo: keyof Formulario) => (valor: string) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => {
      if (!atual[campo]) return atual;
      const resto = { ...atual };
      delete resto[campo];
      return resto;
    });
  };

  const cadastrar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);
    setSucesso(null);
    const errosLocais = validar(tipo, form);
    setErros(errosLocais);
    if (Object.keys(errosLocais).length) return;

    setEnviando(true);
    try {
      await cadastrarUsuario(montarRequisicao(tipo, form), token);
      setSucesso(`${form.nomeUsuario.trim()} foi cadastrado como ${ROTULO_TIPO[tipo]}. O acesso já pode ser feito com ${form.email.trim()}.`);
      setForm(FORMULARIO_VAZIO);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          onSessaoExpirada();
          return;
        }
        setErro(error.message);
        setErros(error.campos);
      } else {
        setErro("Não foi possível concluir o cadastro. Tente novamente.");
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mb-8">
        <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#7e9f8e] hover:text-[#185a43]">
          <ArrowLeft size={16} /> Voltar para fila
        </button>
        <h2 className="text-3xl font-semibold tracking-tight text-[#185a43]">Cadastro de usuários</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#71847b]">
          Crie o acesso de veterinários, administradores e tutores. Veterinários e administradores só podem ser cadastrados por um administrador.
        </p>
      </div>

      <form onSubmit={cadastrar} noValidate className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-[#dfe8e1] bg-white p-5 shadow-sm sm:p-6">
          <h3 className="font-semibold text-[#185a43]">Tipo de usuário</h3>
          <div role="radiogroup" aria-label="Tipo de usuário" className="mt-4 grid gap-3 sm:grid-cols-3">
            {TIPOS.map((opcao) => {
              const ativo = tipo === opcao.valor;
              return (
                <button
                  key={opcao.valor}
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  onClick={() => {
                    setTipo(opcao.valor);
                    setErro(null);
                  }}
                  className={`rounded-xl border p-4 text-left transition ${ativo ? "border-[#185a43] bg-[#f4fbf7] ring-1 ring-[#185a43]" : "border-[#dfe8e1] hover:border-[#b9ddd1]"}`}
                >
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${ativo ? "bg-[#185a43] text-white" : "bg-[#e7f3ee] text-[#39715b]"}`}>{opcao.icone}</span>
                  <span className="mt-3 block text-sm font-semibold text-[#38584a]">{opcao.titulo}</span>
                  <span className="mt-1 block text-xs text-[#8aa197]">{opcao.descricao}</span>
                </button>
              );
            })}
          </div>

          <h3 className="mt-8 font-semibold text-[#185a43]">Dados de acesso</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo label="Nome de usuário" valor={form.nomeUsuario} onChange={alterar("nomeUsuario")} erro={erros.nomeUsuario} placeholder="Ex: paula.nunes" autoComplete="off" />
            <Campo label="E-mail" tipo="email" valor={form.email} onChange={alterar("email")} erro={erros.email} placeholder="profissional@elovet.com" autoComplete="off" />
            <Campo label="Senha" tipo="password" valor={form.senha} onChange={alterar("senha")} erro={erros.senha} placeholder="Mínimo de 6 caracteres" autoComplete="new-password" />
            <Campo label="Confirmar senha" tipo="password" valor={form.confirmacaoSenha} onChange={alterar("confirmacaoSenha")} erro={erros.confirmacaoSenha} placeholder="Repita a senha" autoComplete="new-password" />
          </div>

          {tipo === "RESPONSAVEL" && (
            <>
              <h3 className="mt-8 font-semibold text-[#185a43]">Dados do tutor</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Campo label="Nome completo" valor={form.nomeCompleto} onChange={alterar("nomeCompleto")} erro={erros.nomeCompleto} placeholder="Ex: Rafael Martins" className="sm:col-span-2" />
                <Campo label="CPF" valor={form.cpf} onChange={alterar("cpf")} erro={erros.cpf} placeholder="Somente números" inputMode="numeric" maxLength={14} />
                <Campo label="RG (opcional)" valor={form.rg} onChange={alterar("rg")} erro={erros.rg} placeholder="Ex: 12.345.678-9" />
                <Campo label="Data de nascimento (opcional)" tipo="date" valor={form.dataNascimento} onChange={alterar("dataNascimento")} erro={erros.dataNascimento} />
                <Campo label="Telefone (opcional)" tipo="tel" valor={form.telefone} onChange={alterar("telefone")} erro={erros.telefone} placeholder="(11) 98888-7777" />
              </div>
            </>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#dfe8e1] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e9f8e]">Resumo</p>
            <p className="mt-2 text-sm text-[#567266]">
              Novo <strong className="text-[#185a43]">{ROTULO_TIPO[tipo]}</strong>
              {form.email.trim() ? <> com acesso por <strong className="break-all text-[#185a43]">{form.email.trim()}</strong></> : null}.
            </p>
            <p className="mt-3 text-xs text-[#8aa197]">
              {tipo === "RESPONSAVEL"
                ? "O tutor recebe login e cadastro de responsável na mesma operação."
                : "Exige que você esteja conectado como administrador."}
            </p>
            <button
              type="submit"
              disabled={enviando}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#185a43] text-sm font-bold text-white shadow-lg shadow-[#185a43]/15 transition hover:bg-[#124936] disabled:cursor-wait disabled:opacity-70"
            >
              {enviando ? <LoaderCircle size={17} className="animate-spin" /> : <UserPlus size={17} />}
              {enviando ? "Cadastrando..." : "Cadastrar usuário"}
            </button>
          </div>

          {erro && (
            <p role="alert" className="flex items-start gap-2 rounded-xl border border-[#f0d4cc] bg-[#fdf3f0] px-4 py-3 text-sm text-[#a2483a]">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {erro}
            </p>
          )}
          {sucesso && (
            <p role="status" className="flex items-start gap-2 rounded-xl border border-[#cfe6db] bg-[#eef8f3] px-4 py-3 text-sm text-[#2f6a52]">
              <CircleCheck size={16} className="mt-0.5 shrink-0" /> {sucesso}
            </p>
          )}
        </aside>
      </form>
    </div>
  );
}

function Campo({
  label,
  valor,
  onChange,
  erro,
  tipo = "text",
  placeholder,
  className = "",
  autoComplete,
  inputMode,
  maxLength,
}: {
  label: string;
  valor: string;
  onChange: (valor: string) => void;
  erro?: string;
  tipo?: string;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text";
  maxLength?: number;
}) {
  return (
    <label className={`block text-xs font-semibold text-[#567266] ${className}`}>
      {label}
      <input
        type={tipo}
        value={valor}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={Boolean(erro)}
        className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-sm font-normal text-[#38584a] outline-none focus:border-[#185a43] ${erro ? "border-[#c9604f]" : "border-[#dfe8e1]"}`}
      />
      {erro && <span className="mt-1 block font-normal text-[#b5513f]">{erro}</span>}
    </label>
  );
}
