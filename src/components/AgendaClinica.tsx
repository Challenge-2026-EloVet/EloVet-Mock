import { useState, type ReactNode } from "react";
import FullCalendar from "@fullcalendar/react";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  CalendarPlus,
  Check,
  Clock3,
  PawPrint,
  UserRound,
  X,
} from "lucide-react";
import "./AgendaClinica.css";

type Status = "Confirmado" | "Pendente" | "Retorno Urgente";
type Appointment = {
  id: string;
  pet: string;
  tutor: string;
  type: string;
  veterinarian: string;
  status: Status;
  start: string;
  end: string;
  color: string;
};

const appointments: Appointment[] = [
  {
    id: "agenda-1",
    pet: "Thor",
    tutor: "Rafael Martins",
    type: "Ortopedia",
    veterinarian: "Dr. Carlos Silva",
    status: "Retorno Urgente",
    start: "2026-08-18T09:00:00",
    end: "2026-08-18T10:00:00",
    color: "#dfb461",
  },
  {
    id: "agenda-2",
    pet: "Mel",
    tutor: "Ana Beatriz",
    type: "Cardiologia",
    veterinarian: "Dra. Helena Costa",
    status: "Confirmado",
    start: "2026-08-18T10:30:00",
    end: "2026-08-18T11:30:00",
    color: "#185a43",
  },
  {
    id: "agenda-3",
    pet: "Luna",
    tutor: "Marina Alves",
    type: "Check-up de Rotina",
    veterinarian: "Dr. Carlos Silva",
    status: "Confirmado",
    start: "2026-08-19T08:00:00",
    end: "2026-08-19T08:45:00",
    color: "#7e9f8e",
  },
  {
    id: "agenda-4",
    pet: "Bento",
    tutor: "Lucas Ferreira",
    type: "Ortopedia",
    veterinarian: "Dra. Helena Costa",
    status: "Pendente",
    start: "2026-08-20T14:00:00",
    end: "2026-08-20T15:00:00",
    color: "#a3d9c9",
  },
  {
    id: "agenda-5",
    pet: "Nina",
    tutor: "Camila Rocha",
    type: "Check-up de Rotina",
    veterinarian: "Dr. Carlos Silva",
    status: "Confirmado",
    start: "2026-08-21T10:00:00",
    end: "2026-08-21T10:45:00",
    color: "#7e9f8e",
  },
  {
    id: "agenda-6",
    pet: "Zeca",
    tutor: "João Pedro",
    type: "Ortopedia",
    veterinarian: "Dra. Helena Costa",
    status: "Pendente",
    start: "2026-08-22T09:30:00",
    end: "2026-08-22T10:30:00",
    color: "#185a43",
  },
  {
    id: "agenda-7",
    pet: "Amora",
    tutor: "Paula Nunes",
    type: "Cardiologia",
    veterinarian: "Dr. Carlos Silva",
    status: "Confirmado",
    start: "2026-08-24T11:00:00",
    end: "2026-08-24T12:00:00",
    color: "#185a43",
  },
];

export function AgendaClinica({ onBack }: { onBack: () => void }) {
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEventClick = (info: EventClickArg) => {
    const event = appointments.find(
      (appointment) => appointment.id === info.event.id,
    );
    if (event) {
      setSelectedEvent(event);
      setSelectedDate(null);
      setModalOpen(true);
    }
  };
  const handleSelect = (selection: DateSelectArg) => {
    setSelectedEvent(null);
    setSelectedDate(selection.startStr);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

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
              Hoje • 7 consultas
            </span>
          </div>
          <p className="mt-2 text-sm text-[#71847b]">
            Organize a rotina da clínica e mantenha cada cuidado no tempo certo.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedEvent(null);
            setSelectedDate(new Date().toISOString().slice(0, 10));
            setModalOpen(true);
          }}
          className="flex w-fit items-center gap-2 rounded-xl bg-[#185a43] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#185a43]/15 hover:bg-[#124936]"
        >
          <CalendarPlus size={17} /> Nova consulta
        </button>
      </div>
      <section className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-[#dfe8e1] bg-white p-3">
        <span className="mr-2 text-xs font-semibold text-[#567266]">
          Status:
        </span>
        <Legend color="bg-[#a3d9c9]" label="Confirmado" />
        <Legend color="bg-[#dfb461]" label="Retorno urgente" />
        <Legend color="bg-[#edf2ee]" label="Pendente" />
        <span className="ml-auto flex items-center gap-1.5 text-xs text-[#8aa197]">
          <PawPrint size={14} /> Agenda da rede Elo Vet
        </span>
      </section>
      <section className="rounded-2xl border border-[#dfe8e1] bg-white p-3 shadow-sm sm:p-5">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          initialDate="2026-08-18"
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
          select={handleSelect}
          eventClick={handleEventClick}
          events={appointments.map((event) => ({
            ...event,
            title: `${event.pet} • ${event.type}`,
            backgroundColor: event.color,
            borderColor: event.color,
            textColor: event.status === "Pendente" ? "#38584a" : "#fff",
          }))}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
        />
      </section>
      {modalOpen && (
        <AppointmentModal
          appointment={selectedEvent}
          selectedDate={selectedDate}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8faf7] px-2.5 py-1.5 text-[11px] font-medium text-[#567266]">
      <span className={`h-2 w-2 rounded-full ${color}`} /> {label}
    </span>
  );
}

function AppointmentModal({
  appointment,
  selectedDate,
  onClose,
}: {
  appointment: Appointment | null;
  selectedDate: string | null;
  onClose: () => void;
}) {
  const dateLabel = selectedDate
    ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    : null;
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
        className="w-full max-w-md rounded-2xl border border-[#dfe8e1] bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e9f8e]">
              {appointment ? "Detalhes da consulta" : "Agenda rápida"}
            </p>
            <h3
              id="appointment-title"
              className="mt-1 text-xl font-semibold text-[#185a43]"
            >
              {appointment ? appointment.pet : "Pré-agendar Nova Consulta"}
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
        {appointment ? (
          <div className="space-y-3">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${appointment.status === "Retorno Urgente" ? "bg-[#fff4db] text-[#9a6d20]" : appointment.status === "Confirmado" ? "bg-[#e7f3ee] text-[#39715b]" : "bg-[#edf2ee] text-[#567266]"}`}
            >
              {appointment.status}
            </span>
            <Detail
              icon={<PawPrint size={16} />}
              label="Paciente"
              value={`${appointment.pet} • ${appointment.type}`}
            />
            <Detail
              icon={<UserRound size={16} />}
              label="Tutor"
              value={appointment.tutor}
            />
            <Detail
              icon={<Clock3 size={16} />}
              label="Horário"
              value={`${new Date(appointment.start).toLocaleDateString("pt-BR")} • ${new Date(appointment.start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
            />
            <Detail
              icon={<UserRound size={16} />}
              label="Veterinário"
              value={appointment.veterinarian}
            />
            <button
              onClick={onClose}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#185a43] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#124936]"
            >
              <Check size={17} /> Iniciar Consulta
            </button>
          </div>
        ) : (
          <div>
            <div className="rounded-xl bg-[#e7f3ee] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7e9f8e]">
                Data selecionada
              </p>
              <p className="mt-1 text-sm font-semibold capitalize text-[#185a43]">
                {dateLabel || "Selecione um horário"}
              </p>
            </div>
            <label className="mt-4 block text-xs font-semibold text-[#567266]">
              Nome do pet
              <input
                placeholder="Ex: Thor"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe8e1] px-3 text-sm outline-none focus:border-[#7e9f8e]"
              />
            </label>
            <button
              onClick={onClose}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#185a43] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#124936]"
            >
              <CalendarPlus size={17} /> Salvar pré-agendamento
            </button>
          </div>
        )}
      </div>
    </div>
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
