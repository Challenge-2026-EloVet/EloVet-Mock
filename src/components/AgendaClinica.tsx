import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import FullCalendar from "@fullcalendar/react";
import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Building2,
  CalendarPlus,
  Check,
  Clock3,
  Loader2,
  MessageSquareText,
  PawPrint,
  RefreshCw,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import {
  alterarStatus,
  atualizarAgendamento,
  criarAgendamento,
  listarAgendamentos,
  listarClinicas,
  listarPets,
  listarResponsaveis,
  listarVeterinarios,
  type Agendamento,
  type ClinicaOpcao,
  type PetOpcao,
  type ResponsavelOpcao,
  type StatusAgendamento,
  type VeterinarioOpcao,
} from "../services/agendamento";
import "./AgendaClinica.css";

const DURACAO_CONSULTA_MIN = 60;

type StatusConfig = {
  label: string;
  color: string;
  textColor: string;
  badge: string;
};

const STATUS: Record<StatusAgendamento, StatusConfig> = {
  AGENDADO: {
    label: "Agendado",
    color: "#edf2ee",
    textColor: "#38584a",
    badge: "bg-[#edf2ee] text-[#567266]",
  },
  CONFIRMADO: {
    label: "Confirmado",
    color: "#185a43",
    textColor: "#ffffff",
    badge: "bg-[#e7f3ee] text-[#39715b]",
  },
  EM_ATENDIMENTO: {
    label: "Em atendimento",
    color: "#dfb461",
    textColor: "#ffffff",
    badge: "bg-[#fff4db] text-[#9a6d20]",
  },
  CONCLUIDO: {
    label: "Concluído",
    color: "#7e9f8e",
    textColor: "#ffffff",
    badge: "bg-[#e7f3ee] text-[#567266]",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "#f1d5cf",
    textColor: "#8a3b2e",
    badge: "bg-[#fbe9e5] text-[#8a3b2e]",
  },
  NAO_COMPARECEU: {
    label: "Não compareceu",
    color: "#d5ddd8",
    textColor: "#56635c",
    badge: "bg-[#edf2ee] text-[#56635c]",
  },
};

const STATUS_FINAIS: StatusAgendamento[] = [
  "CONCLUIDO",
  "CANCELADO",
  "NAO_COMPARECEU",
];

/** Próximas ações possíveis a partir de cada status. */
const ACOES: Record<
  StatusAgendamento,
  { status: StatusAgendamento; label: string; principal?: boolean }[]
> = {
  AGENDADO: [
    { status: "CONFIRMADO", label: "Confirmar consulta", principal: true },
    { status: "CANCELADO", label: "Cancelar" },
  ],
  CONFIRMADO: [
    { status: "EM_ATENDIMENTO", label: "Iniciar consulta", principal: true },
    { status: "NAO_COMPARECEU", label: "Não compareceu" },
    { status: "CANCELADO", label: "Cancelar" },
  ],
  EM_ATENDIMENTO: [
    { status: "CONCLUIDO", label: "Concluir consulta", principal: true },
  ],
  CONCLUIDO: [],
  CANCELADO: [],
  NAO_COMPARECEU: [],
};

type ModalState =
  | { tipo: "detalhes"; agendamento: Agendamento }
  | { tipo: "novo"; dataHora: string }
  | null;

export function AgendaClinica({ onBack }: { onBack: () => void }) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [aviso, setAviso] = useState<{ texto: string; erro?: boolean } | null>(
    null,
  );

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErroCarga(null);
    try {
      setAgendamentos(await listarAgendamentos());
    } catch (error) {
      setErroCarga(mensagem(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    if (!aviso) return;
    const timer = window.setTimeout(() => setAviso(null), 4500);
    return () => window.clearTimeout(timer);
  }, [aviso]);

  const substituir = (atualizado: Agendamento) =>
    setAgendamentos((lista) => {
      const existe = lista.some(
        (item) => item.idAgendamento === atualizado.idAgendamento,
      );
      return existe
        ? lista.map((item) =>
            item.idAgendamento === atualizado.idAgendamento ? atualizado : item,
          )
        : [...lista, atualizado];
    });

  const consultasHoje = useMemo(() => {
    const hoje = paraDataLocal(new Date());
    return agendamentos.filter(
      (item) =>
        item.dataHora.slice(0, 10) === hoje && item.status !== "CANCELADO",
    ).length;
  }, [agendamentos]);

  const eventos = useMemo(
    () =>
      agendamentos.map((item) => {
        const config = STATUS[item.status];
        return {
          id: String(item.idAgendamento),
          title: `${item.nomePet ?? `Pet ${item.idPet}`} • ${item.nomeVeterinario ?? "Veterinário"}`,
          start: item.dataHora,
          end: somarMinutos(item.dataHora, DURACAO_CONSULTA_MIN),
          backgroundColor: config.color,
          borderColor: config.color,
          textColor: config.textColor,
          editable: !STATUS_FINAIS.includes(item.status),
        };
      }),
    [agendamentos],
  );

  const handleEventClick = (info: EventClickArg) => {
    const agendamento = agendamentos.find(
      (item) => String(item.idAgendamento) === info.event.id,
    );
    if (agendamento) setModal({ tipo: "detalhes", agendamento });
  };

  const handleSelect = (selection: DateSelectArg) => {
    const inicio = new Date(selection.start);
    if (selection.allDay) inicio.setHours(9, 0, 0, 0);
    setModal({ tipo: "novo", dataHora: paraDataHoraLocal(inicio) });
  };

  // Arrastar um evento remarca a consulta (PUT /agendamentos/{id})
  const handleEventDrop = async (info: EventDropArg) => {
    const agendamento = agendamentos.find(
      (item) => String(item.idAgendamento) === info.event.id,
    );
    if (!agendamento || !info.event.start) {
      info.revert();
      return;
    }
    try {
      const atualizado = await atualizarAgendamento(agendamento.idAgendamento, {
        idPet: agendamento.idPet,
        idResponsavel: agendamento.idResponsavel,
        idVeterinario: agendamento.idVeterinario,
        idClinica: agendamento.idClinica,
        dataHora: `${paraDataHoraLocal(info.event.start)}:00`,
        observacao: agendamento.observacao,
      });
      substituir(atualizado);
      setAviso({ texto: `Consulta de ${atualizado.nomePet} remarcada.` });
    } catch (error) {
      info.revert();
      setAviso({ texto: mensagem(error), erro: true });
    }
  };

  return (
    <div className="agenda-calendar px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#7e9f8e] hover:text-[#185a43]"
          >
            <span aria-hidden="true">←</span> Voltar para fila
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-[#185a43]">
              Agenda clínica
            </h2>
            <span className="rounded-full bg-[#e7f3ee] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#39715b]">
              Hoje • {consultasHoje}{" "}
              {consultasHoje === 1 ? "consulta" : "consultas"}
            </span>
          </div>
          <p className="mt-2 text-sm text-[#71847b]">
            Organize a rotina da clínica e mantenha cada cuidado no tempo certo.
          </p>
        </div>
        <button
          onClick={() =>
            setModal({ tipo: "novo", dataHora: proximaHoraCheia() })
          }
          className="flex w-fit items-center gap-2 rounded-xl bg-[#185a43] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#185a43]/15 hover:bg-[#124936]"
        >
          <CalendarPlus size={17} /> Nova consulta
        </button>
      </div>

      <section className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-[#dfe8e1] bg-white p-3">
        <span className="mr-2 text-xs font-semibold text-[#567266]">
          Status:
        </span>
        {(Object.keys(STATUS) as StatusAgendamento[]).map((status) => (
          <Legend
            key={status}
            color={STATUS[status].color}
            label={STATUS[status].label}
          />
        ))}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-[#8aa197]">
          {carregando ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Sincronizando
              agenda...
            </>
          ) : (
            <>
              <PawPrint size={14} /> Agenda da rede Elo Vet •{" "}
              {agendamentos.length} agendamentos
            </>
          )}
        </span>
      </section>

      {erroCarga && (
        <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f1d5cf] bg-[#fbe9e5] px-4 py-3 text-sm text-[#8a3b2e]">
          <span>{erroCarga}</span>
          <button
            onClick={() => void carregar()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#8a3b2e] hover:bg-[#fff7f5]"
          >
            <RefreshCw size={14} /> Tentar novamente
          </button>
        </section>
      )}

      <section className="rounded-2xl border border-[#dfe8e1] bg-white p-3 shadow-sm sm:p-5">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
          }}
          locale="pt-br"
          firstDay={1}
          height="auto"
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="19:00:00"
          slotDuration="00:30:00"
          selectable
          selectMirror
          eventDurationEditable={false}
          select={handleSelect}
          eventClick={handleEventClick}
          eventDrop={(info) => void handleEventDrop(info)}
          events={eventos}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
        />
      </section>

      {modal?.tipo === "detalhes" && (
        <DetalhesModal
          agendamento={modal.agendamento}
          onClose={() => setModal(null)}
          onAtualizado={(atualizado, texto) => {
            substituir(atualizado);
            setModal(null);
            setAviso({ texto });
          }}
        />
      )}
      {modal?.tipo === "novo" && (
        <NovoAgendamentoModal
          dataHoraInicial={modal.dataHora}
          onClose={() => setModal(null)}
          onCriado={(criado) => {
            substituir(criado);
            setModal(null);
            setAviso({
              texto: `Consulta de ${criado.nomePet} agendada para ${formatarDataHora(criado.dataHora)}.`,
            });
          }}
        />
      )}

      {aviso && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[60] max-w-sm rounded-xl px-4 py-3 text-sm font-medium shadow-xl ${aviso.erro ? "bg-[#8a3b2e] text-white" : "bg-[#185a43] text-white"}`}
        >
          {aviso.texto}
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8faf7] px-2.5 py-1.5 text-[11px] font-medium text-[#567266]">
      <span
        className="h-2 w-2 rounded-full border border-black/5"
        style={{ backgroundColor: color }}
      />{" "}
      {label}
    </span>
  );
}

function ModalShell({
  eyebrow,
  title,
  onClose,
  children,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#123d2e]/35 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#dfe8e1] bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e9f8e]">
              {eyebrow}
            </p>
            <h3
              id="appointment-title"
              className="mt-1 text-xl font-semibold text-[#185a43]"
            >
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#8aa197] hover:bg-[#f5f7f3]"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DetalhesModal({
  agendamento,
  onClose,
  onAtualizado,
}: {
  agendamento: Agendamento;
  onClose: () => void;
  onAtualizado: (atualizado: Agendamento, texto: string) => void;
}) {
  const [salvando, setSalvando] = useState<StatusAgendamento | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const config = STATUS[agendamento.status];
  const acoes = ACOES[agendamento.status];

  const executar = async (status: StatusAgendamento) => {
    setSalvando(status);
    setErro(null);
    try {
      const atualizado = await alterarStatus(agendamento.idAgendamento, status);
      onAtualizado(
        atualizado,
        `Consulta de ${atualizado.nomePet}: ${STATUS[status].label.toLowerCase()}.`,
      );
    } catch (error) {
      setErro(mensagem(error));
      setSalvando(null);
    }
  };

  return (
    <ModalShell
      eyebrow={`Detalhes da consulta • #${agendamento.idAgendamento}`}
      title={agendamento.nomePet ?? `Pet ${agendamento.idPet}`}
      onClose={onClose}
    >
      <div className="space-y-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${config.badge}`}
        >
          {config.label}
        </span>
        <Detail
          icon={<PawPrint size={16} />}
          label="Paciente"
          value={[agendamento.nomePet, agendamento.especiePet]
            .filter(Boolean)
            .join(" • ")}
        />
        <Detail
          icon={<UserRound size={16} />}
          label="Tutor"
          value={agendamento.nomeResponsavel ?? "—"}
        />
        <Detail
          icon={<Clock3 size={16} />}
          label="Horário"
          value={formatarDataHora(agendamento.dataHora)}
        />
        <Detail
          icon={<Stethoscope size={16} />}
          label="Veterinário"
          value={agendamento.nomeVeterinario ?? "—"}
        />
        <Detail
          icon={<Building2 size={16} />}
          label="Clínica"
          value={agendamento.nomeClinica ?? "—"}
        />
        {agendamento.observacao && (
          <Detail
            icon={<MessageSquareText size={16} />}
            label="Observação"
            value={agendamento.observacao}
          />
        )}

        {erro && <ErroInline texto={erro} />}

        {acoes.length > 0 ? (
          <div className="mt-4 space-y-2">
            {acoes.map((acao) => (
              <button
                key={acao.status}
                disabled={salvando !== null}
                onClick={() => void executar(acao.status)}
                className={
                  acao.principal
                    ? "flex w-full items-center justify-center gap-2 rounded-xl bg-[#185a43] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#124936] disabled:opacity-60"
                    : "flex w-full items-center justify-center gap-2 rounded-xl border border-[#dfe8e1] px-4 py-3 text-sm font-semibold text-[#567266] hover:bg-[#f8faf7] disabled:opacity-60"
                }
              >
                {salvando === acao.status ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  acao.principal && <Check size={17} />
                )}
                {acao.label}
              </button>
            ))}
            <p className="pt-1 text-center text-[11px] text-[#8aa197]">
              Para remarcar, arraste a consulta no calendário.
            </p>
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-[#f8faf7] px-3 py-3 text-center text-xs text-[#71847b]">
            Agendamento finalizado: não pode mais ser alterado.
          </p>
        )}
      </div>
    </ModalShell>
  );
}

function NovoAgendamentoModal({
  dataHoraInicial,
  onClose,
  onCriado,
}: {
  dataHoraInicial: string;
  onClose: () => void;
  onCriado: (criado: Agendamento) => void;
}) {
  const [dataHora, setDataHora] = useState(dataHoraInicial);
  const [clinicas, setClinicas] = useState<ClinicaOpcao[]>([]);
  const [veterinarios, setVeterinarios] = useState<VeterinarioOpcao[]>([]);
  const [responsaveis, setResponsaveis] = useState<ResponsavelOpcao[]>([]);
  const [pets, setPets] = useState<PetOpcao[]>([]);
  const [idClinica, setIdClinica] = useState("");
  const [idVeterinario, setIdVeterinario] = useState("");
  const [idResponsavel, setIdResponsavel] = useState("");
  const [idPet, setIdPet] = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listarClinicas(), listarResponsaveis()])
      .then(([listaClinicas, listaResponsaveis]) => {
        setClinicas(listaClinicas);
        setResponsaveis(listaResponsaveis);
      })
      .catch((error: unknown) => setErro(mensagem(error)));
  }, []);

  useEffect(() => {
    setIdVeterinario("");
    setVeterinarios([]);
    if (!idClinica) return;
    listarVeterinarios(Number(idClinica))
      .then(setVeterinarios)
      .catch((error: unknown) => setErro(mensagem(error)));
  }, [idClinica]);

  useEffect(() => {
    setIdPet("");
    setPets([]);
    if (!idResponsavel) return;
    listarPets(Number(idResponsavel))
      .then(setPets)
      .catch((error: unknown) => setErro(mensagem(error)));
  }, [idResponsavel]);

  const completo =
    dataHora && idClinica && idVeterinario && idResponsavel && idPet;

  const salvar = async () => {
    if (!completo) return;
    setSalvando(true);
    setErro(null);
    try {
      const criado = await criarAgendamento({
        idPet: Number(idPet),
        idResponsavel: Number(idResponsavel),
        idVeterinario: Number(idVeterinario),
        idClinica: Number(idClinica),
        dataHora: `${dataHora}:00`,
        observacao: observacao.trim() || null,
      });
      onCriado(criado);
    } catch (error) {
      setErro(mensagem(error));
      setSalvando(false);
    }
  };

  return (
    <ModalShell
      eyebrow="Agenda rápida"
      title="Agendar nova consulta"
      onClose={onClose}
    >
      <div className="space-y-4">
        <Campo label="Data e hora">
          <input
            type="datetime-local"
            value={dataHora}
            onChange={(event) => setDataHora(event.target.value)}
            className={inputClass}
          />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Clínica">
            <select
              value={idClinica}
              onChange={(event) => setIdClinica(event.target.value)}
              className={inputClass}
            >
              <option value="">Selecione</option>
              {clinicas.map((clinica) => (
                <option key={clinica.id} value={clinica.id}>
                  {clinica.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Veterinário">
            <select
              value={idVeterinario}
              onChange={(event) => setIdVeterinario(event.target.value)}
              disabled={!idClinica}
              className={inputClass}
            >
              <option value="">
                {idClinica ? "Selecione" : "Escolha a clínica"}
              </option>
              {veterinarios.map((veterinario) => (
                <option key={veterinario.id} value={veterinario.id}>
                  {veterinario.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Tutor">
            <select
              value={idResponsavel}
              onChange={(event) => setIdResponsavel(event.target.value)}
              className={inputClass}
            >
              <option value="">Selecione</option>
              {responsaveis.map((responsavel) => (
                <option key={responsavel.id} value={responsavel.id}>
                  {responsavel.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Pet">
            <select
              value={idPet}
              onChange={(event) => setIdPet(event.target.value)}
              disabled={!idResponsavel}
              className={inputClass}
            >
              <option value="">
                {idResponsavel ? "Selecione" : "Escolha o tutor"}
              </option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.nome} ({pet.especie})
                </option>
              ))}
            </select>
          </Campo>
        </div>
        <Campo label="Observação (opcional)">
          <textarea
            value={observacao}
            onChange={(event) => setObservacao(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Ex.: retorno da consulta de rotina"
            className="mt-1.5 w-full rounded-xl border border-[#dfe8e1] px-3 py-2.5 text-sm outline-none focus:border-[#7e9f8e]"
          />
        </Campo>

        {erro && <ErroInline texto={erro} />}

        <button
          onClick={() => void salvar()}
          disabled={!completo || salvando}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#185a43] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#124936] disabled:opacity-50"
        >
          {salvando ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <CalendarPlus size={17} />
          )}
          Salvar agendamento
        </button>
      </div>
    </ModalShell>
  );
}

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-[#dfe8e1] bg-white px-3 text-sm outline-none focus:border-[#7e9f8e] disabled:bg-[#f8faf7] disabled:text-[#8aa197]";

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-[#567266]">
      {label}
      {children}
    </label>
  );
}

function ErroInline({ texto }: { texto: string }) {
  return (
    <p className="rounded-xl bg-[#fbe9e5] px-3 py-2.5 text-xs font-medium text-[#8a3b2e]">
      {texto}
    </p>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#f8faf7] px-3 py-2.5">
      <span className="text-[#7e9f8e]">{icon}</span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8aa197]">
          {label}
        </p>
        <p className="text-sm font-medium text-[#38584a]">{value}</p>
      </div>
    </div>
  );
}

function mensagem(error: unknown): string {
  return error instanceof Error ? error.message : "Erro inesperado.";
}

const doisDigitos = (valor: number) => String(valor).padStart(2, "0");

function paraDataLocal(data: Date): string {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

/** Formato aceito pelo input datetime-local e pela API (sem fuso): 2026-12-10T14:30 */
function paraDataHoraLocal(data: Date): string {
  return `${paraDataLocal(data)}T${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

function proximaHoraCheia(): string {
  const data = new Date();
  data.setHours(data.getHours() + 1, 0, 0, 0);
  return paraDataHoraLocal(data);
}

function somarMinutos(dataHora: string, minutos: number): string {
  const data = new Date(dataHora);
  data.setMinutes(data.getMinutes() + minutos);
  return `${paraDataHoraLocal(data)}:00`;
}

function formatarDataHora(dataHora: string): string {
  const data = new Date(dataHora);
  return `${data.toLocaleDateString("pt-BR")} • ${data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}
