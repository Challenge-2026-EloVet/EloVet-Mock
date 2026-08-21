import { useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  Bell,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  FileText,
  HeartPulse,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageCircle,
  Mic,
  PawPrint,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  calcularRiscoEpidemiologico,
  type RiscoEpidemiologico,
} from "./domain/riscoEpidemiologico";
import { PainelCasosClinicos } from "./components/PainelCasosClinicos";
import { AgendaClinica } from "./components/AgendaClinica";
import { BuscaPacientes } from "./components/BuscaPacientes";
import { EquipeClinica } from "./components/EquipeClinica";

type View = "queue" | "record" | "escriba" | "handoff" | "cases" | "agenda" | "patients" | "team";
type Status = "scheduled" | "check-in" | "consultation" | "finished";
type Pet = {
  id: number;
  name: string;
  breed: string;
  tutor: string;
  time: string;
  status: Status;
  location: "car" | "reception";
  image: string;
  note?: string;
};
type WeightPoint = { month: string; weight: number };
const columns: { id: Status; label: string; icon: typeof CalendarDays }[] = [
  { id: "scheduled", label: "Agendados", icon: CalendarDays },
  { id: "check-in", label: "Aguardando Check-in", icon: CarFront },
  { id: "consultation", label: "Em Consulta", icon: Stethoscope },
  { id: "finished", label: "Finalizados", icon: Check },
];
const initialPets: Pet[] = [
  {
    id: 1,
    name: "Luna",
    breed: "Golden Retriever",
    tutor: "Marina Alves",
    time: "09:30",
    status: "scheduled",
    location: "reception",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: 2,
    name: "Thor",
    breed: "Dachshund",
    tutor: "Rafael Martins",
    time: "10:00",
    status: "scheduled",
    location: "car",
    image:
      "https://images.unsplash.com/photo-1612195583950-b8fd34c87093?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: 3,
    name: "Nina",
    breed: "Shih-tzu",
    tutor: "Camila Rocha",
    time: "10:30",
    status: "scheduled",
    location: "reception",
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: 4,
    name: "Zeca",
    breed: "SRD • 4 anos",
    tutor: "João Pedro",
    time: "10:45",
    status: "check-in",
    location: "car",
    image:
      "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=160&q=80",
    note: "Check-in há 8 min",
  },
  {
    id: 5,
    name: "Mel",
    breed: "Border Collie",
    tutor: "Ana Beatriz",
    time: "11:00",
    status: "check-in",
    location: "reception",
    image:
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=160&q=80",
    note: "Aguardando há 12 min",
  },
  {
    id: 6,
    name: "Bento",
    breed: "Beagle",
    tutor: "Lucas Ferreira",
    time: "09:15",
    status: "consultation",
    location: "reception",
    image:
      "https://images.unsplash.com/photo-1504595403659-9088ce801e29?auto=format&fit=crop&w=160&q=80",
    note: "Dra. Helena • Sala 02",
  },
  {
    id: 7,
    name: "Amora",
    breed: "Poodle",
    tutor: "Paula Nunes",
    time: "08:45",
    status: "finished",
    location: "reception",
    image:
      "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=160&q=80",
  },
];
const nextStatus: Record<Status, Status | null> = {
  scheduled: "check-in",
  "check-in": "consultation",
  consultation: "finished",
  finished: null,
};
const weightHistory: WeightPoint[] = [
  { month: "Jul", weight: 8.1 },
  { month: "Ago", weight: 8.2 },
  { month: "Set", weight: 8.25 },
  { month: "Out", weight: 8.3 },
  { month: "Nov", weight: 8.35 },
  { month: "Dez", weight: 8.5 },
  { month: "Jan", weight: 8.55 },
  { month: "Fev", weight: 8.65 },
  { month: "Mar", weight: 8.7 },
  { month: "Abr", weight: 8.8 },
  { month: "Mai", weight: 8.9 },
  { month: "Jun", weight: 9 },
];
const timeline = [
  {
    date: "03/2026",
    specialty: "Cardiologia",
    clinic: "Clínica VetLife",
    detail: "Avaliação cardíaca preventiva",
    icon: HeartPulse,
    tone: "gold",
  },
  {
    date: "01/2026",
    specialty: "Consulta de Rotina",
    clinic: "Clínica ClinVet",
    detail: "Exame clínico e vacinação anual",
    icon: Stethoscope,
    tone: "mint",
  },
  {
    date: "09/2025",
    specialty: "Ortopedia",
    clinic: "Clínica Vila Verde",
    detail: "Acompanhamento de mobilidade",
    icon: Activity,
    tone: "sage",
  },
];

function App() {
  const [view, setView] = useState<View>("queue");
  const [pets, setPets] = useState(initialPets);
  const [menuOpen, setMenuOpen] = useState(false);
  const [handoffPlan, setHandoffPlan] = useState("");
  const advanceStatus = (id: number) =>
    setPets((current) =>
      current.map((pet) =>
        pet.id === id && nextStatus[pet.status]
          ? { ...pet, status: nextStatus[pet.status]! }
          : pet,
      ),
    );
  const openRecord = () => {
    setView("record");
    setMenuOpen(false);
  };
  const openQueue = () => {
    setView("queue");
    setMenuOpen(false);
  };
  const openEscriba = () => {
    setView("escriba");
    setMenuOpen(false);
  };
  const openHandoff = (plan: string) => {
    setHandoffPlan(plan);
    setView("handoff");
    setMenuOpen(false);
  };
  const openCases = () => {
    setView("cases");
    setMenuOpen(false);
  };
  const openAgenda = () => {
    setView("agenda");
    setMenuOpen(false);
  };
  const openPatients = () => {
    setView("patients");
    setMenuOpen(false);
  };
  const openTeam = () => {
    setView("team");
    setMenuOpen(false);
  };
  const thorRisk = calcularRiscoEpidemiologico({
    raca: "Dachshund",
    idade: 4,
    peso: 9,
    especie: "cão",
    data_ultimo_checkup: "2026-03-12",
  });
  return (
    <div className="min-h-screen bg-[#f5f7f3] text-[#20352d]">
      <Sidebar
        view={view}
        onQueue={openQueue}
        onRecord={openRecord}
        onEscriba={openEscriba}
        onHandoff={() => openHandoff(handoffPlan)}
        onCases={openCases}
        onAgenda={openAgenda}
        onPatients={openPatients}
        onTeam={openTeam}
        menuOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <main className="lg:pl-64">
        <Header view={view} onMenu={() => setMenuOpen(true)} />
        {view === "queue" ? (
          <Queue
            pets={pets}
            onAdvance={advanceStatus}
            onOpenRecord={openRecord}
          />
        ) : view === "record" ? (
          <>
            <RiskAlert risk={thorRisk} />
            <Record onBack={openQueue} />
          </>
        ) : view === "escriba" ? (
          <Escriba onBack={openQueue} onHandoff={openHandoff} />
        ) : view === "handoff" ? (
          <Handoff plan={handoffPlan} onBack={openEscriba} />
        ) : view === "cases" ? (
          <PainelCasosClinicos onBack={openQueue} />
        ) : view === "agenda" ? (
          <AgendaClinica onBack={openAgenda} />
        ) : view === "patients" ? (
          <BuscaPacientes onBack={openQueue} onOpenRecord={openRecord} />
        ) : view === "team" ? (
          <EquipeClinica onBack={openQueue} />
        ) : null}
      </main>
    </div>
  );
}

function Sidebar({
  view,
  onQueue,
  onRecord,
  onEscriba,
  onHandoff,
  onCases,
  onAgenda,
  onPatients,
  onTeam,
  menuOpen,
  onClose,
}: {
  view: View;
  onQueue: () => void;
  onRecord: () => void;
  onEscriba: () => void;
  onHandoff: () => void;
  onCases: () => void;
  onAgenda: () => void;
  onPatients: () => void;
  onTeam: () => void;
  menuOpen: boolean;
  onClose: () => void;
}) {
  return (
    <aside
      className={`${menuOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#185a43] px-5 py-6 text-white transition-transform lg:translate-x-0`}
    >
      <div className="mb-12 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#a3d9c9] text-[#185a43]">
            <PawPrint size={22} />
          </span>
          <span className="text-xl font-semibold tracking-tight">
            elo<span className="font-light">vet</span>
          </span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>
      <nav className="space-y-2 text-sm font-medium">
        <button
          onClick={onRecord}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${view === "record" ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10"}`}
        >
          <FileText size={19} /> Prontuário
        </button>
        <button
          onClick={onEscriba}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${view === "escriba" ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10"}`}
        >
          <Mic size={19} /> Escriba de IA
        </button>
        <button
          onClick={onHandoff}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${view === "handoff" ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10"}`}
        >
          <ListChecks size={19} /> Handoff de cuidado
        </button>
        <button
          onClick={onCases}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${view === "cases" ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10"}`}
        >
          <ClipboardList size={19} /> Casos similares
        </button>
        <button
          onClick={onQueue}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${view === "queue" ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10"}`}
        >
          <LayoutDashboard size={19} /> Visão geral
        </button>
        <button
          onClick={onAgenda}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${view === "agenda" ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10"}`}
        >
          <CalendarDays size={19} /> Agenda
        </button>
        <button
          onClick={onPatients}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${view === "patients" ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10"}`}
        >
          <PawPrint size={19} /> Pacientes
        </button>
        <button
          onClick={onTeam}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${view === "team" ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10"}`}
        >
          <Users size={19} /> Equipe
        </button>
      </nav>
      <div className="mt-auto space-y-2 text-sm font-medium">
        <a
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/65 hover:bg-white/10"
          href="#settings"
        >
          <Settings size={19} /> Configurações
        </a>
        <a
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/65 hover:bg-white/10"
          href="#help"
        >
          <CircleHelp size={19} /> Central de ajuda
        </a>
        <div className="my-4 border-t border-white/15" />
        <div className="flex items-center gap-3 rounded-xl px-3 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#dfb461] text-sm font-bold text-[#185a43]">
            HC
          </span>
          <div>
            <p className="text-sm">Helena Costa</p>
            <p className="text-xs text-white/55">Administradora</p>
          </div>
          <LogOut size={16} className="ml-auto text-white/50" />
        </div>
      </div>
    </aside>
  );
}

function Header({ view, onMenu }: { view: View; onMenu: () => void }) {
  const eyebrow =
    view === "queue"
      ? "Operação clínica"
      : view === "record"
        ? "Prontuário longitudinal"
        : view === "escriba"
          ? "Documentação clínica inteligente"
          : view === "agenda"
            ? "Agenda da clínica"
            : view === "patients"
              ? "Busca na rede nacional"
              : view === "team"
                ? "Gestão da equipe clínica"
            : view === "handoff"
              ? "Continuidade do cuidado"
            : view === "cases"
              ? "Inteligência clínica da rede"
              : "";
            
  const title =
    view === "queue"
      ? "Gestão de atendimentos"
      : view === "record"
        ? "Histórico de saúde"
        : view === "escriba"
          ? "Escriba de IA"
          : view === "agenda"
            ? "Visualização dos agendametos marcados"
            : view === "patients"
              ? "Busca de pacientes"
              : view === "team"
                ? "Equipe clínica"
            : view === "handoff"
              ? "Handoff de Cuidado"
              : view === "cases"
                ? "Casos clínicos similares"
                : "";
  return (
    <header className="flex h-20 items-center justify-between border-b border-[#dfe8e1] bg-[#fbfcfa] px-5 sm:px-8 lg:px-12">
      <div className="flex items-center gap-3">
        <button
          className="text-[#185a43] lg:hidden"
          onClick={onMenu}
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7e9f8e]">
            {eyebrow}
          </p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-[#185a43] sm:text-2xl">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="hidden rounded-xl border border-[#dfe8e1] bg-white p-2.5 text-[#567266] sm:block"
          aria-label="Pesquisar"
        >
          <Search size={18} />
        </button>
        <button
          className="relative rounded-xl border border-[#dfe8e1] bg-white p-2.5 text-[#567266]"
          aria-label="Notificações"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#dfb461]" />
        </button>
        <span className="hidden h-9 w-px bg-[#dfe8e1] sm:block" />
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#d8ebe4] text-sm font-bold text-[#185a43]">
          HC
        </div>
      </div>
    </header>
  );
}

function Queue({
  pets,
  onAdvance,
  onOpenRecord,
}: {
  pets: Pet[];
  onAdvance: (id: number) => void;
  onOpenRecord: () => void;
}) {
  return (
    <div className="px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#7e9f8e]">
            <span className="h-2 w-2 rounded-full bg-[#dfb461]" /> Clínica Vila
            Verde
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#185a43]">
            Fluxo de atendimentos
          </h2>
          <p className="mt-2 text-sm text-[#71847b]">
            Acompanhe a jornada dos pacientes em tempo real.
          </p>
        </div>
        <button className="flex w-fit items-center gap-2 rounded-xl bg-[#185a43] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#185a43]/15">
          <CalendarDays size={17} /> Ver agenda completa
        </button>
      </section>
      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Stat
          label="Na fila hoje"
          value={pets.filter((pet) => pet.status !== "finished").length}
          suffix="pacientes"
          icon={<ClipboardList size={17} />}
        />
        <Stat
          label="Check-ins virtuais"
          value={pets.filter((pet) => pet.status === "check-in").length}
          suffix="aguardando"
          icon={<CarFront size={17} />}
          accent
        />
        <Stat
          label="Em consulta"
          value={pets.filter((pet) => pet.status === "consultation").length}
          suffix="agora"
          icon={<Stethoscope size={17} />}
        />
        <Stat
          label="Atendidos"
          value={pets.filter((pet) => pet.status === "finished").length}
          suffix="hoje"
          icon={<ShieldCheck size={17} />}
          green
        />
      </section>
      <section className="overflow-x-auto pb-4">
        <div className="grid min-w-[1040px] grid-cols-4 gap-4">
          {columns.map((column) => {
            const ColumnIcon = column.icon;
            const columnPets = pets.filter((pet) => pet.status === column.id);
            return (
              <div
                key={column.id}
                className="min-h-[480px] rounded-2xl bg-[#edf2ee] p-3"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <ColumnIcon
                      size={16}
                      className={
                        column.id === "check-in"
                          ? "text-[#c0913e]"
                          : "text-[#567266]"
                      }
                    />
                    <h3 className="text-sm font-semibold text-[#38584a]">
                      {column.label}
                    </h3>
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1.5 text-[11px] font-bold text-[#7e9f8e]">
                      {columnPets.length}
                    </span>
                  </div>
                  <span className="text-lg leading-none text-[#8aa197]">
                    •••
                  </span>
                </div>
                <div className="space-y-3">
                  {columnPets.map((pet) => (
                    <PetCard
                      key={pet.id}
                      pet={pet}
                      onAdvance={onAdvance}
                      onOpenRecord={onOpenRecord}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <footer className="mt-5 flex items-center gap-2 text-xs text-[#8aa197]">
        <Clock3 size={14} /> Última atualização há menos de 1 minuto{" "}
        <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[#79b49e]" />
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  icon,
  accent,
  green,
}: {
  label: string;
  value: number;
  suffix: string;
  icon: ReactNode;
  accent?: boolean;
  green?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#dfe8e1] p-4 ${green ? "bg-[#e7f3ee]" : "bg-white"}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-[#71847b]">{label}</span>
        <span className={accent ? "text-[#c0913e]" : "text-[#7e9f8e]"}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-semibold text-[#185a43]">
        {value}
        <span className="ml-1 text-sm font-normal text-[#8aa197]">
          {suffix}
        </span>
      </p>
    </div>
  );
}
function PetCard({
  pet,
  onAdvance,
  onOpenRecord,
}: {
  pet: Pet;
  onAdvance: (id: number) => void;
  onOpenRecord: () => void;
}) {
  const next = nextStatus[pet.status];
  return (
    <article
      onClick={pet.name === "Thor" ? onOpenRecord : undefined}
      className={`rounded-xl border border-[#dfe8e1] bg-white p-3.5 shadow-sm shadow-[#185a43]/[0.03] transition hover:shadow-md ${pet.name === "Thor" ? "cursor-pointer hover:-translate-y-0.5" : ""}`}
    >
      <div className="flex gap-3">
        <img
          className="h-12 w-12 shrink-0 rounded-xl object-cover"
          src={pet.image}
          alt={`Foto de ${pet.name}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-[#25483a]">{pet.name}</h4>
              <p className="truncate text-xs text-[#8aa197]">{pet.breed}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#567266]">
              <Clock3 size={12} /> {pet.time}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#71847b]">
            <UserRound size={13} className="text-[#a1b6ac]" /> {pet.tutor}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-[#edf2ee] pt-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ${pet.location === "car" ? "bg-[#fff4db] text-[#9a6d20]" : "bg-[#e7f3ee] text-[#39715b]"}`}
        >
          {pet.location === "car" ? <CarFront size={12} /> : <Home size={12} />}
          {pet.location === "car" ? "Aguardando no carro" : "Na recepção"}
        </span>
        {next ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onAdvance(pet.id);
            }}
            className="group flex items-center gap-1 text-[11px] font-bold text-[#185a43] hover:text-[#c0913e]"
          >
            Avançar Status <ChevronRight size={14} />
          </button>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#79a58f]">
            <Check size={13} /> Concluído
          </span>
        )}
      </div>
      {pet.note && (
        <p className="mt-2 text-[10px] text-[#9a6d20]">{pet.note}</p>
      )}
    </article>
  );
}

function Record({ onBack }: { onBack: () => void }) {
  const [period, setPeriod] = useState("12 meses");
  const initialWeight = weightHistory[0].weight;
  const currentWeight = weightHistory[weightHistory.length - 1].weight;
  const variation = ((currentWeight - initialWeight) / initialWeight) * 100;
  return (
    <div className="px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#7e9f8e] hover:text-[#185a43]"
          >
            <ArrowLeft size={16} /> Voltar para fila de atendimentos
          </button>
          <h2 className="text-3xl font-semibold tracking-tight text-[#185a43]">
            Prontuário de Thor
          </h2>
          <p className="mt-2 text-sm text-[#71847b]">
            Histórico compartilhado com segurança pela rede Elo Vet.
          </p>
        </div>
        <button className="flex w-fit items-center gap-2 rounded-xl border border-[#d1dfd7] bg-white px-4 py-3 text-sm font-semibold text-[#185a43] shadow-sm">
          <FileText size={17} /> Exportar prontuário
        </button>
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(280px,0.78fr)_minmax(500px,1.5fr)]">
        <section className="space-y-5">
          <div className="rounded-2xl border border-[#dfe8e1] bg-white p-5">
            <div className="flex items-center gap-4">
              <img
                className="h-20 w-20 rounded-2xl object-cover"
                src="https://images.unsplash.com/photo-1612195583950-b8fd34c87093?auto=format&fit=crop&w=240&q=85"
                alt="Thor, um Dachshund"
              />
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-2xl font-semibold text-[#185a43]">
                    Thor
                  </h3>
                  <span className="rounded-full bg-[#e7f3ee] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#39715b]">
                    Ativo
                  </span>
                </div>
                <p className="text-sm text-[#71847b]">Dachshund</p>
                <p className="mt-1 text-xs text-[#8aa197]">
                  Paciente desde março de 2024
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 divide-x divide-[#e5eee8] border-t border-[#edf2ee] pt-4">
              <Metric label="Idade" value="4 anos" />
              <Metric label="Peso atual" value="9 kg" />
              <Metric label="Sexo" value="Macho" />
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f8faf7] px-3 py-2.5 text-xs text-[#567266]">
              <UserRound size={15} className="text-[#7e9f8e]" /> Tutor:{" "}
              <strong className="text-[#38584a]">Rafael Martins</strong>
            </div>
          </div>
          <div className="rounded-2xl border border-[#dfe8e1] bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e9f8e]">
                  Rede Elo Vet
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[#185a43]">
                  Linha do tempo
                </h3>
              </div>
              <span className="rounded-lg bg-[#f5f7f3] px-2.5 py-1.5 text-xs font-semibold text-[#7e9f8e]">
                3 registros
              </span>
            </div>
            <div className="relative ml-1 space-y-6 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-[#dfe8e1]">
              {timeline.map((event) => (
                <TimelineItem
                  key={`${event.date}-${event.specialty}`}
                  {...event}
                />
              ))}
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-[#dfe8e1] bg-white p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7e9f8e]">
                <Activity size={15} /> Indicador clínico
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-[#185a43]">
                Evolução de peso
              </h3>
              <p className="mt-1 text-sm text-[#71847b]">
                Acompanhamento dos últimos 12 meses
              </p>
            </div>
            <div className="relative">
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="appearance-none rounded-xl border border-[#dfe8e1] bg-[#fbfcfa] py-2.5 pl-3 pr-9 text-xs font-semibold text-[#567266] outline-none focus:border-[#7e9f8e]"
              >
                <option>12 meses</option>
                <option>6 meses</option>
                <option>3 meses</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-3 text-[#7e9f8e]"
              />
            </div>
          </div>
          <div className="mt-7 flex items-end gap-3">
            <p className="text-4xl font-semibold tracking-tight text-[#185a43]">
              {currentWeight.toFixed(1)}
              <span className="ml-1 text-lg font-medium text-[#7e9f8e]">
                kg
              </span>
            </p>
            <span className="mb-1.5 rounded-full bg-[#fff4db] px-2.5 py-1 text-xs font-bold text-[#a67525]">
              +{variation.toFixed(1)}%
            </span>
          </div>
          <WeightChart />
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#edf2ee] pt-5">
            <Metric
              label="Peso inicial"
              value={`${initialWeight.toFixed(1)} kg`}
            />
            <Metric
              label="Variação"
              value={`+${(currentWeight - initialWeight).toFixed(1)} kg`}
            />
            <Metric label="Período" value={period} />
          </div>
          <div className="mt-5 flex gap-3 rounded-xl border border-[#efd89e] bg-[#fff8e8] p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#dfb461] text-[#185a43]">
              <ShieldCheck size={17} />
            </span>
            <div>
              <h4 className="text-sm font-bold text-[#765719]">
                Atenção: possível risco ortopédico
              </h4>
              <p className="mt-1 text-xs leading-5 text-[#896f37]">
                O peso de Thor aumentou mais de 10% no período. Considere uma
                avaliação preventiva e revisão do plano nutricional.
              </p>
            </div>
          </div>
        </section>
      </div>
      <footer className="mt-6 flex items-center gap-2 text-xs text-[#8aa197]">
        <ShieldCheck size={14} /> Dados protegidos conforme a LGPD{" "}
        <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[#79b49e]" />
      </footer>
    </div>
  );
}

function RiskAlert({ risk }: { risk: RiscoEpidemiologico }) {
  const styles =
    risk.nivel === "vermelho"
      ? {
          box: "border-[#e6b7ad] bg-[#fff1ee]",
          icon: "bg-[#d95f4f] text-white",
          label: "Risco alto",
          text: "text-[#934136]",
        }
      : risk.nivel === "amarelo"
        ? {
            box: "border-[#efd89e] bg-[#fff8e8]",
            icon: "bg-[#dfb461] text-[#185a43]",
            label: "Atenção preventiva",
            text: "text-[#765719]",
          }
        : {
            box: "border-[#b9ddd1] bg-[#e7f3ee]",
            icon: "bg-[#79b49e] text-white",
            label: "Risco controlado",
            text: "text-[#39715b]",
          };
  return (
    <section
      className={`mx-5 mt-6 flex items-start gap-3 rounded-2xl border p-4 sm:mx-8 lg:mx-12 ${styles.box}`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${styles.icon}`}
      >
        <ShieldCheck size={18} />
      </span>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`text-sm font-bold ${styles.text}`}>
            Score de risco epidemiológico
          </h3>
          <span
            className={`rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles.text}`}
          >
            {styles.label}
          </span>
        </div>
        <p className={`mt-1 text-xs leading-5 ${styles.text}`}>
          {risk.mensagem}
        </p>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 text-center first:text-left last:text-right">
      <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[#8aa197]">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-[#38584a]">
        {value}
      </p>
    </div>
  );
}
function TimelineItem({
  date,
  specialty,
  clinic,
  detail,
  icon: Icon,
  tone,
}: {
  date: string;
  specialty: string;
  clinic: string;
  detail: string;
  icon: typeof HeartPulse;
  tone: string;
}) {
  const toneClass =
    tone === "gold"
      ? "bg-[#fff4db] text-[#a67525]"
      : tone === "mint"
        ? "bg-[#e7f3ee] text-[#39715b]"
        : "bg-[#edf2ee] text-[#567266]";
  return (
    <div className="relative flex gap-3">
      <span
        className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${toneClass}`}
      >
        <Icon size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <time className="text-xs font-bold text-[#185a43]">{date}</time>
          <span className="h-1 w-1 rounded-full bg-[#b6c8bd]" />
          <h4 className="text-sm font-semibold text-[#38584a]">{specialty}</h4>
        </div>
        <p className="mt-1 text-xs font-medium text-[#71847b]">{clinic}</p>
        <p className="mt-1 text-[11px] text-[#9aaba2]">{detail}</p>
      </div>
    </div>
  );
}
function WeightChart() {
  const width = 720;
  const height = 250;
  const padding = { top: 20, right: 22, bottom: 38, left: 40 };
  const min = 7.8;
  const max = 9.3;
  const x = (index: number) =>
    padding.left +
    (index * (width - padding.left - padding.right)) /
      (weightHistory.length - 1);
  const y = (weight: number) =>
    padding.top +
    ((max - weight) * (height - padding.top - padding.bottom)) / (max - min);
  const line = weightHistory
    .map((point, index) => `${x(index)},${y(point.weight)}`)
    .join(" ");
  const area = `${padding.left},${height - padding.bottom} ${line} ${x(weightHistory.length - 1)},${height - padding.bottom}`;
  return (
    <div className="mt-5 overflow-hidden rounded-xl bg-[#fbfcfa] px-2 pt-4 sm:px-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Gráfico de evolução do peso de Thor nos últimos 12 meses"
      >
        <defs>
          <linearGradient id="weightArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#a3d9c9" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#a3d9c9" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[8, 8.5, 9].map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="#e3ebe5"
              strokeDasharray="3 5"
            />
            <text
              x={padding.left - 10}
              y={y(tick) + 4}
              textAnchor="end"
              fill="#8aa197"
              fontSize="11"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        ))}
        <polygon points={area} fill="url(#weightArea)" />
        <polyline
          points={line}
          fill="none"
          stroke="#185a43"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        {weightHistory.map((point, index) => (
          <g key={point.month}>
            <circle
              cx={x(index)}
              cy={y(point.weight)}
              r={index === weightHistory.length - 1 ? 6 : 3.5}
              fill={index === weightHistory.length - 1 ? "#dfb461" : "#185a43"}
              stroke="#fbfcfa"
              strokeWidth="2"
            />
            <text
              x={x(index)}
              y={height - 14}
              textAnchor="middle"
              fill="#8aa197"
              fontSize="10"
            >
              {point.month}
            </text>
          </g>
        ))}
        <text
          x={x(weightHistory.length - 1) - 4}
          y={y(weightHistory[weightHistory.length - 1].weight) - 14}
          textAnchor="end"
          fill="#a67525"
          fontSize="11"
          fontWeight="700"
        >
          9,0 kg
        </text>
      </svg>
    </div>
  );
}

type SoapNote = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};
const simulatedSoap: SoapNote = {
  subjective:
    "Tutor relata que Thor apresenta dor ao subir escadas e evita pular no sofá há cerca de três dias. Notou também tremores leves nas patas traseiras e menor disposição para passeios.",
  objective:
    "Dachshund, 4 anos, 9 kg. Dor à palpação da região toracolombar, postura encurvada e relutância à extensão da coluna. Reflexos patelares preservados, sem déficit proprioceptivo evidente no exame.",
  assessment:
    "Suspeita de doença do disco intervertebral (hérnia de disco) em região toracolombar. Quadro compatível com dor espinhal aguda, sem sinais neurológicos graves neste momento.",
  plan: "Repouso estrito e restrição de escadas por 14 dias. Iniciar analgesia conforme prescrição. Solicitar radiografia da coluna e considerar ressonância magnética se houver progressão neurológica. Retorno em 48 horas.",
};

function Escriba({
  onBack,
  onHandoff,
}: {
  onBack: () => void;
  onHandoff: (plan: string) => void;
}) {
  const [isCapturing, setIsCapturing] = useState(true);
  const [soap, setSoap] = useState<SoapNote>({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });
  const simulateEnd = () => {
    setSoap(simulatedSoap);
    setIsCapturing(false);
  };
  const blocks: {
    key: keyof SoapNote;
    title: string;
    subtitle: string;
    color: string;
  }[] = [
    {
      key: "subjective",
      title: "Subjetivo",
      subtitle: "Relato do tutor",
      color: "bg-[#a3d9c9]",
    },
    {
      key: "objective",
      title: "Objetivo",
      subtitle: "Exame físico",
      color: "bg-[#7e9f8e]",
    },
    {
      key: "assessment",
      title: "Avaliação",
      subtitle: "Diagnóstico suspeito",
      color: "bg-[#dfb461]",
    },
    {
      key: "plan",
      title: "Plano",
      subtitle: "Tratamento e exames",
      color: "bg-[#185a43]",
    },
  ];
  return (
    <div className="px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#7e9f8e] hover:text-[#185a43]"
          >
            <ArrowLeft size={16} /> Voltar para fila de atendimentos
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-[#185a43]">
              Escriba de IA
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f3ee] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#39715b]">
              <Sparkles size={12} /> Beta
            </span>
          </div>
          <p className="mt-2 text-sm text-[#71847b]">
            A documentação clínica acontece enquanto você cuida do paciente.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#dfe8e1] bg-white px-3 py-2.5">
            <img
              className="h-8 w-8 rounded-lg object-cover"
              src="https://images.unsplash.com/photo-1612195583950-b8fd34c87093?auto=format&fit=crop&w=100&q=80"
              alt="Thor"
            />
            <div>
              <p className="text-xs font-bold text-[#38584a]">Thor</p>
              <p className="text-[10px] text-[#8aa197]">Dachshund • 4 anos</p>
            </div>
          </div>
          <button
            onClick={simulateEnd}
            className="rounded-xl bg-[#185a43] px-4 py-3 text-xs font-bold text-white shadow-lg shadow-[#185a43]/15 transition hover:bg-[#124936]"
          >
            Simular Fim de Consulta
          </button>
        </div>
      </div>
      <section className="mb-6 overflow-hidden rounded-2xl border border-[#b9ddd1] bg-[#e7f3ee]">
        <div className="flex flex-col items-center justify-between gap-5 px-5 py-6 sm:flex-row sm:px-8">
          <div className="flex items-center gap-4">
            <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-[#185a43] text-white">
              <span
                className={`${isCapturing ? "animate-ping" : ""} absolute inset-0 rounded-2xl bg-[#5eb59c]/40`}
              />
              <Mic size={24} className="relative" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${isCapturing ? "animate-pulse bg-[#38a581]" : "bg-[#7e9f8e]"}`}
                />
                <h3 className="font-semibold text-[#185a43]">
                  {isCapturing
                    ? "Capturando Áudio da Consulta..."
                    : "Áudio da consulta processado"}
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#567266]">
                {isCapturing
                  ? "O Escriba está ouvindo e organizando as informações clínicas."
                  : "A transcrição foi organizada no padrão SOAP."}
              </p>
            </div>
          </div>
          <div
            className="flex h-10 items-center gap-1.5"
            aria-label={
              isCapturing ? "Ondas sonoras ativas" : "Captura finalizada"
            }
          >
            {[12, 22, 34, 18, 28, 42, 24, 36, 15, 29, 20, 32].map(
              (height, index) => (
                <span
                  key={index}
                  className={`w-1 rounded-full bg-[#3d9f81] ${isCapturing ? "animate-pulse" : ""}`}
                  style={{
                    height: `${height}px`,
                    animationDelay: `${index * 90}ms`,
                  }}
                />
              ),
            )}
          </div>
        </div>
        <div className="border-t border-[#b9ddd1] bg-[#d9eee7] px-5 py-3 text-center text-[11px] font-medium text-[#39715b] sm:text-left sm:px-8">
          Consulta em andamento • Sala 02 • Dra. Helena Costa
        </div>
      </section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#185a43]">
            Nota clínica em tempo real
          </h3>
          <p className="mt-1 text-xs text-[#8aa197]">
            Estrutura SOAP gerada a partir da conversa
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#7e9f8e]">
          <span className="h-2 w-2 rounded-full bg-[#3d9f81]" /> Salvamento
          automático
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {blocks.map((block) => {
          const { key, ...blockProps } = block;
          return <SoapBlock key={key} {...blockProps} value={soap[key]} />;
        })}
      </div>
      {soap.plan && (
        <button
          onClick={() => onHandoff(soap.plan)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#185a43] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#185a43]/15 transition hover:bg-[#124936]"
        >
          <ListChecks size={18} /> Gerar Handoff de Cuidado para o tutor{" "}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

function Handoff({ plan, onBack }: { plan: string; onBack: () => void }) {
  const [toastVisible, setToastVisible] = useState(false);
  const tasks = plan
    ? plan.split(/\.\s+/).filter(Boolean)
    : ["Simule o fim da consulta no Escriba para importar o Plano clínico."];
  const sendToWhatsApp = () => {
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 4200);
  };
  return (
    <div className="relative px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#7e9f8e] hover:text-[#185a43]"
          >
            <ArrowLeft size={16} /> Voltar para o Escriba de IA
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-[#185a43]">
              Handoff de Cuidado
            </h2>
            <span className="rounded-full bg-[#e7f3ee] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#39715b]">
              Plano pronto
            </span>
          </div>
          <p className="mt-2 text-sm text-[#71847b]">
            Transforme o plano clínico em uma rotina simples para Rafael
            acompanhar em casa.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#dfe8e1] bg-white px-3 py-2.5">
          <img
            className="h-9 w-9 rounded-lg object-cover"
            src="https://images.unsplash.com/photo-1612195583950-b8fd34c87093?auto=format&fit=crop&w=100&q=80"
            alt="Thor"
          />
          <div>
            <p className="text-xs font-bold text-[#38584a]">Thor</p>
            <p className="text-[10px] text-[#8aa197]">Tutor: Rafael Martins</p>
          </div>
        </div>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <section className="rounded-2xl border border-[#dfe8e1] bg-white p-5 sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7e9f8e]">
                <ListChecks size={15} /> Tradução para o tutor
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-[#185a43]">
                Plano de cuidados do Thor
              </h3>
              <p className="mt-1 text-sm text-[#71847b]">
                Uma rotina clara para continuar o cuidado depois da consulta.
              </p>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#a3d9c9] text-[#185a43]">
              <PawPrint size={21} />
            </span>
          </div>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div
                key={`${task}-${index}`}
                className="flex gap-4 rounded-xl border border-[#e2ebe5] bg-[#fbfcfa] p-4"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#185a43] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <p className="pt-0.5 text-sm leading-6 text-[#38584a]">
                  {task.replace(/[.]$/, "")}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={sendToWhatsApp}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#218c61] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#218c61]/20 transition hover:bg-[#18734e]"
          >
            <MessageCircle size={20} /> Enviar para o WhatsApp do Tutor
          </button>
          <p className="mt-3 text-center text-[11px] text-[#9aaba2]">
            O tutor receberá o plano em uma mensagem didática e acolhedora.
          </p>
        </section>
        <aside className="space-y-5">
          <div className="rounded-2xl border border-[#dfe8e1] bg-[#e7f3ee] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#185a43]">
              <ShieldCheck size={17} /> Handoff revisado pela clínica
            </div>
            <p className="text-sm leading-6 text-[#567266]">
              O conteúdo abaixo foi extraído do Plano SOAP e convertido para uma
              linguagem de acompanhamento diário.
            </p>
            <div className="mt-5 border-t border-[#c7e2d8] pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#7e9f8e]">
                Origem
              </p>
              <p className="mt-1 text-xs text-[#567266]">
                Escriba de IA • Consulta de hoje
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#dfe8e1] bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#38584a]">
              <FileText size={16} className="text-[#7e9f8e]" /> Plano SOAP
              original
            </div>
            <p className="text-xs leading-5 text-[#71847b]">
              {plan ||
                "Nenhum Plano gerado ainda. Volte ao Escriba e simule o fim da consulta."}
            </p>
          </div>
        </aside>
      </div>
      {toastVisible && (
        <div
          role="status"
          className="fixed bottom-6 right-5 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-[#8bc8af] bg-white p-4 shadow-xl shadow-[#185a43]/15"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#d9f1e4] text-[#218c61]">
            <Check size={19} />
          </span>
          <div>
            <p className="text-sm font-bold text-[#185a43]">Sucesso!</p>
            <p className="mt-0.5 text-xs leading-5 text-[#567266]">
              Plano de cuidados convertido e enviado para o WhatsApp de Rafael
              Martins
            </p>
          </div>
          <button
            onClick={() => setToastVisible(false)}
            className="ml-2 text-[#8aa197]"
            aria-label="Fechar aviso"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function SoapBlock({
  title,
  subtitle,
  value,
  color,
}: {
  title: string;
  subtitle: string;
  value: string;
  color: string;
}) {
  return (
    <article className="rounded-2xl border border-[#dfe8e1] bg-white p-5 shadow-sm shadow-[#185a43]/[0.03]">
      <div className="mb-4 flex items-start gap-3">
        <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
        <div>
          <h4 className="font-semibold text-[#38584a]">{title}</h4>
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-[#9aaba2]">
            {subtitle}
          </p>
        </div>
      </div>
      <p
        className={`min-h-[106px] text-sm leading-6 ${value ? "text-[#567266]" : "italic text-[#b2c0b8]"}`}
      >
        {value || "Aguardando informações da consulta..."}
      </p>
    </article>
  );
}

export default App;
