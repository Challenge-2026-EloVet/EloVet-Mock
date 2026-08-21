import { useMemo, useState } from 'react'
import { Check, ChevronDown, ClipboardCheck, FileSearch, LockKeyhole, Search, ShieldCheck, Sparkles, X } from 'lucide-react'

type CasoClinico = {
  id: string
  especie: string
  raca: string
  idade: number
  peso: number
  porte: 'Pequeno' | 'Médio' | 'Grande'
  diagnostico: string
  tratamento: 'Conservador' | 'Cirúrgico'
  protocolo: string
  desfecho: 'Recuperação Completa' | 'Melhora Parcial'
  sucesso: number
  periodo: string
}

const casosMock: CasoClinico[] = [
  { id: '#CASE-902A', especie: 'Cão', raca: 'Golden Retriever', idade: 6, peso: 32, porte: 'Grande', diagnostico: 'Instabilidade de joelho por ruptura parcial de ligamento cruzado', tratamento: 'Conservador', protocolo: 'Fisioterapia + anti-inflamatório por 15 dias', desfecho: 'Recuperação Completa', sucesso: 91, periodo: 'últimos 18 meses' },
  { id: '#CASE-881C', especie: 'Cão', raca: 'Dachshund', idade: 4, peso: 9, porte: 'Pequeno', diagnostico: 'Doença do disco intervertebral em região toracolombar', tratamento: 'Conservador', protocolo: 'Repouso estrito + analgesia + controle de peso por 14 dias', desfecho: 'Recuperação Completa', sucesso: 87, periodo: 'últimos 12 meses' },
  { id: '#CASE-846F', especie: 'Cão', raca: 'Border Collie', idade: 5, peso: 19, porte: 'Médio', diagnostico: 'Displasia coxofemoral com dor moderada', tratamento: 'Conservador', protocolo: 'Hidroterapia semanal + condroprotetor por 90 dias', desfecho: 'Melhora Parcial', sucesso: 74, periodo: 'últimos 24 meses' },
  { id: '#CASE-819B', especie: 'Cão', raca: 'Dachshund', idade: 7, peso: 10.2, porte: 'Pequeno', diagnostico: 'Hérnia de disco toracolombar com déficit proprioceptivo', tratamento: 'Cirúrgico', protocolo: 'Hemilaminectomia + fisioterapia assistida por 8 semanas', desfecho: 'Recuperação Completa', sucesso: 94, periodo: 'últimos 24 meses' },
  { id: '#CASE-778D', especie: 'Cão', raca: 'Labrador Retriever', idade: 8, peso: 34, porte: 'Grande', diagnostico: 'Osteoartrite de quadril e rigidez pós-repouso', tratamento: 'Conservador', protocolo: 'Manejo de peso + exercício controlado + laserterapia', desfecho: 'Melhora Parcial', sucesso: 79, periodo: 'últimos 18 meses' },
]

export function PainelCasosClinicos({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState('')
  const [breed, setBreed] = useState('Todas')
  const [size, setSize] = useState('Todos')
  const [treatment, setTreatment] = useState('Todos')
  const [toastVisible, setToastVisible] = useState(false)
  const breeds = [...new Set(casosMock.map((caso) => caso.raca))]
  const filteredCases = useMemo(() => casosMock.filter((caso) => {
    const terms = `${caso.id} ${caso.raca} ${caso.diagnostico} ${caso.protocolo}`.toLowerCase()
    return terms.includes(search.toLowerCase()) && (breed === 'Todas' || caso.raca === breed) && (size === 'Todos' || caso.porte === size) && (treatment === 'Todos' || caso.tratamento === treatment)
  }), [breed, search, size, treatment])
  const importCase = (caso: CasoClinico) => { setToastVisible(true); window.setTimeout(() => setToastVisible(false), 4200); void caso }

  return <div className="relative px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#7e9f8e] transition hover:text-[#185a43]"><span aria-hidden="true">←</span> Voltar para fila</button><div className="flex items-center gap-3"><h2 className="text-3xl font-semibold tracking-tight text-[#185a43]">Casos clínicos similares</h2><span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f3ee] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#39715b]"><Sparkles size={12} /> Peer-to-peer insights</span></div><p className="mt-2 max-w-2xl text-sm text-[#71847b]">Aprendizados anonimizados da rede para apoiar decisões clínicas durante o atendimento.</p></div><div className="flex items-center gap-2 rounded-xl border border-[#b9ddd1] bg-[#e7f3ee] px-3 py-2.5 text-xs font-semibold text-[#39715b]"><LockKeyhole size={15} /> 100% anonimizado • LGPD</div></div>
    <section className="mb-7 rounded-2xl border border-[#dfe8e1] bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3 xl:flex-row"><label className="relative min-w-0 flex-1"><span className="sr-only">Buscar casos clínicos</span><Search size={18} className="absolute left-3.5 top-3.5 text-[#8aa197]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por condição, raça ou protocolo..." className="h-11 w-full rounded-xl border border-[#dfe8e1] bg-[#fbfcfa] pl-10 pr-4 text-sm text-[#38584a] outline-none placeholder:text-[#a1b2a9] focus:border-[#7e9f8e]" /></label><FilterSelect label="Raça" value={breed} onChange={setBreed} options={['Todas', ...breeds]} /><FilterSelect label="Porte" value={size} onChange={setSize} options={['Todos', 'Pequeno', 'Médio', 'Grande']} /><FilterSelect label="Tratamento" value={treatment} onChange={setTreatment} options={['Todos', 'Conservador', 'Cirúrgico']} /></div><div className="mt-4 flex items-center justify-between border-t border-[#edf2ee] pt-3 text-xs text-[#8aa197]"><span><strong className="text-[#567266]">{filteredCases.length}</strong> casos encontrados na rede</span>{(search || breed !== 'Todas' || size !== 'Todos' || treatment !== 'Todos') && <button onClick={() => { setSearch(''); setBreed('Todas'); setSize('Todos'); setTreatment('Todos') }} className="font-semibold text-[#185a43] hover:text-[#c0913e]">Limpar filtros</button>}</div></section>
    <div className="mb-4 flex items-center justify-between"><div><h3 className="text-lg font-semibold text-[#185a43]">Casos similares encontrados</h3><p className="mt-1 text-xs text-[#8aa197]">Ordenados pela combinação biológica e clínica mais próxima.</p></div><span className="hidden items-center gap-1.5 text-xs text-[#7e9f8e] sm:flex"><ShieldCheck size={14} /> Dados agregados da rede</span></div>
    <section className="grid gap-4 xl:grid-cols-2">{filteredCases.map((caso) => <CaseCard key={caso.id} caso={caso} onImport={importCase} />)}</section>
    {filteredCases.length === 0 && <div className="rounded-2xl border border-dashed border-[#b9cfc3] bg-white p-12 text-center"><FileSearch size={32} className="mx-auto text-[#7e9f8e]" /><h3 className="mt-3 font-semibold text-[#38584a]">Nenhum caso encontrado</h3><p className="mt-1 text-sm text-[#8aa197]">Tente outro termo ou remova algum filtro.</p></div>}
    {toastVisible && <div role="status" className="fixed bottom-6 right-5 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-[#8bc8af] bg-white p-4 shadow-xl shadow-[#185a43]/15"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#d9f1e4] text-[#218c61]"><Check size={19} /></span><div><p className="text-sm font-bold text-[#185a43]">Protocolo importado</p><p className="mt-0.5 text-xs leading-5 text-[#567266]">O protocolo foi copiado para a área de rascunho (SOAP) do paciente atual.</p></div><button onClick={() => setToastVisible(false)} className="ml-2 text-[#8aa197]" aria-label="Fechar aviso"><X size={16} /></button></div>}
  </div>
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="relative flex h-11 min-w-[148px] items-center rounded-xl border border-[#dfe8e1] bg-[#fbfcfa] px-3"><span className="mr-2 text-[10px] font-semibold uppercase tracking-wide text-[#8aa197]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 appearance-none bg-transparent pr-5 text-xs font-semibold text-[#567266] outline-none"><option disabled>{label}</option>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 text-[#8aa197]" /></label>
}

function CaseCard({ caso, onImport }: { caso: CasoClinico; onImport: (caso: CasoClinico) => void }) {
  return <article className="rounded-2xl border border-[#dfe8e1] bg-white p-5 shadow-sm shadow-[#185a43]/[0.03] transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"><div className="flex items-start justify-between gap-3"><div><span className="font-mono text-xs font-bold tracking-wide text-[#7e9f8e]">{caso.id}</span><h4 className="mt-1.5 text-lg font-semibold text-[#38584a]">{caso.diagnostico}</h4></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${caso.desfecho === 'Recuperação Completa' ? 'bg-[#e7f3ee] text-[#39715b]' : 'bg-[#edf2ee] text-[#567266]'}`}>{caso.desfecho}</span></div><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-lg bg-[#f5f7f3] px-2.5 py-1.5 text-xs font-medium text-[#567266]">{caso.especie}</span><span className="rounded-lg bg-[#f5f7f3] px-2.5 py-1.5 text-xs font-medium text-[#567266]">{caso.raca}</span><span className="rounded-lg bg-[#f5f7f3] px-2.5 py-1.5 text-xs font-medium text-[#567266]">{caso.idade} anos</span><span className="rounded-lg bg-[#f5f7f3] px-2.5 py-1.5 text-xs font-medium text-[#567266]">{caso.peso} kg</span></div><div className="mt-5 grid gap-4 border-t border-[#edf2ee] pt-4 sm:grid-cols-[1fr_auto]"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8aa197]">Protocolo utilizado</p><p className="mt-1 text-sm leading-5 text-[#567266]">{caso.protocolo}</p><p className="mt-2 text-[11px] text-[#a1b2a9]">Tratamento {caso.tratamento.toLowerCase()} • {caso.periodo}</p></div><div className="rounded-xl bg-[#fff8e8] px-4 py-3 text-center sm:min-w-[115px]"><p className="text-[10px] font-bold uppercase tracking-wide text-[#a67525]">Eficácia estimada</p><p className="mt-1 text-2xl font-bold text-[#185a43]">{caso.sucesso}%</p><p className="text-[10px] text-[#a67525]">na rede</p></div></div><button onClick={() => onImport(caso)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#b9ddd1] bg-[#f4fbf7] px-4 py-3 text-xs font-bold text-[#185a43] transition hover:bg-[#e7f3ee]"><ClipboardCheck size={16} /> Importar para o meu Prontuário</button></article>
}
