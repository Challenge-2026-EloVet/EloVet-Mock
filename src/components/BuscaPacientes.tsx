import { useState } from 'react'
import { ArrowLeft, Check, ClipboardList, Phone, Search, ShieldCheck, UserRound, X } from 'lucide-react'

type PetRede = {
  codigo: string
  nome: string
  especie: 'Cão' | 'Gato'
  raca: string
  idade: string
  tutor: string
  telefone: string
  imagem: string
  vacinacaoEmDia: boolean
}

const petsMock: PetRede[] = [
  { codigo: 'ELO-1234', nome: 'Thor', especie: 'Cão', raca: 'Dachshund', idade: '4 anos', tutor: 'Rafael Martins', telefone: '(11) 98888-1234', imagem: 'https://images.unsplash.com/photo-1612195583950-b8fd34c87093?auto=format&fit=crop&w=240&q=85', vacinacaoEmDia: true },
  { codigo: 'ELO-5678', nome: 'Luna', especie: 'Cão', raca: 'Golden Retriever', idade: '6 anos', tutor: 'Marina Alves', telefone: '(21) 97777-5678', imagem: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=240&q=85', vacinacaoEmDia: true },
  { codigo: 'ELO-9012', nome: 'Mimi', especie: 'Gato', raca: 'SRD', idade: '3 anos', tutor: 'Beatriz Nunes', telefone: '(31) 96666-9012', imagem: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=240&q=85', vacinacaoEmDia: false },
]

const codigoValido = /^ELO-\d{4}$/

export function BuscaPacientes({ onBack, onOpenRecord }: { onBack: () => void; onOpenRecord: () => void }) {
  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState<PetRede | null>(null)
  const [buscou, setBuscou] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const formatoInvalido = codigo.length > 0 && !codigoValido.test(codigo)

  const buscarRegistro = () => {
    const normalized = codigo.toUpperCase()
    setCodigo(normalized)
    setBuscou(true)
    setResultado(codigoValido.test(normalized) ? petsMock.find((pet) => pet.codigo === normalized) ?? null : null)
  }

  return <div className="relative px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#7e9f8e] transition hover:text-[#185a43]"><ArrowLeft size={16} /> Voltar para fila</button><div className="flex items-center gap-3"><h2 className="text-3xl font-semibold tracking-tight text-[#185a43]">Busca de pacientes</h2><span className="rounded-full bg-[#e7f3ee] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#39715b]">Rede Elo Vet</span></div><p className="mt-2 max-w-2xl text-sm text-[#71847b]">Encontre o histórico clínico unificado de qualquer pet pelo RG do Pet.</p></div><div className="flex items-center gap-2 rounded-xl border border-[#b9ddd1] bg-[#e7f3ee] px-3 py-2.5 text-xs font-semibold text-[#39715b]"><ShieldCheck size={15} /> Rede descentralizada protegida</div></div>
    <section className="rounded-2xl border border-[#dfe8e1] bg-white p-5 shadow-sm sm:p-7"><div className="max-w-3xl"><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7e9f8e]"><Search size={15} /> Registro único do animal</div><h3 className="text-xl font-semibold text-[#185a43]">Qual pet você quer localizar?</h3><p className="mt-1 text-sm text-[#71847b]">Digite o RG do Pet para acessar os dados compartilhados pela rede.</p><div className="mt-5 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><span className="sr-only">RG do Pet</span><ClipboardList size={18} className="absolute left-3.5 top-3.5 text-[#8aa197]" /><input value={codigo} onChange={(event) => { setCodigo(event.target.value.toUpperCase()); setBuscou(false) }} onKeyDown={(event) => { if (event.key === 'Enter') buscarRegistro() }} placeholder="ELO-1234" maxLength={8} className={`h-12 w-full rounded-xl border bg-[#fbfcfa] pl-10 pr-4 font-mono text-sm font-semibold tracking-wider text-[#185a43] outline-none transition placeholder:font-sans placeholder:font-normal placeholder:tracking-normal ${formatoInvalido ? 'border-[#d95f4f] focus:border-[#d95f4f]' : 'border-[#dfe8e1] focus:border-[#185a43]'}`} /></label><button onClick={buscarRegistro} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#185a43] px-5 text-sm font-bold text-white shadow-lg shadow-[#185a43]/15 transition hover:bg-[#124936]"><Search size={17} /> Buscar Registro</button></div>{formatoInvalido && <p className="mt-2 text-xs text-[#b34f42]">Use o formato ELO-1234: três letras, hífen e quatro números.</p>}{!formatoInvalido && <p className="mt-2 text-xs text-[#8aa197]">Exemplos de registros disponíveis: ELO-1234, ELO-5678 ou ELO-9012.</p>}</div></section>
    <section className="mt-8"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-lg font-semibold text-[#185a43]">Resultado da busca</h3><p className="mt-1 text-xs text-[#8aa197]">Dados pessoais exibidos somente para profissionais autorizados.</p></div>{resultado && <span className="rounded-full bg-[#e7f3ee] px-2.5 py-1.5 text-xs font-bold text-[#39715b]">1 registro localizado</span>}</div>{!buscou && <EmptyState />}{buscou && !resultado && <div className="rounded-2xl border border-dashed border-[#b9cfc3] bg-white p-10 text-center"><Search size={30} className="mx-auto text-[#7e9f8e]" /><h3 className="mt-3 font-semibold text-[#38584a]">Registro não encontrado</h3><p className="mt-1 text-sm text-[#8aa197]">Confira o código digitado ou solicite o cadastro do pet na rede.</p></div>}{resultado && <PetResult pet={resultado} onOpenRecord={onOpenRecord} />}</section>
    {toastVisible && <div role="status" className="fixed bottom-6 right-5 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-[#8bc8af] bg-white p-4 shadow-xl shadow-[#185a43]/15"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#d9f1e4] text-[#218c61]"><Check size={19} /></span><div><p className="text-sm font-bold text-[#185a43]">Prontuário localizado</p><p className="mt-0.5 text-xs leading-5 text-[#567266]">Abrindo o histórico clínico unificado do pet.</p></div><button onClick={() => setToastVisible(false)} aria-label="Fechar aviso" className="ml-2 text-[#8aa197]"><X size={16} /></button></div>}
  </div>
}

function EmptyState() { return <div className="rounded-2xl border border-dashed border-[#b9cfc3] bg-[#fbfcfa] px-6 py-14 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e7f3ee] text-[#39715b]"><Search size={24} /></span><h3 className="mt-4 font-semibold text-[#38584a]">Digite o código Elo do pet para carregar seu histórico de rede</h3><p className="mx-auto mt-2 max-w-md text-sm text-[#8aa197]">A busca conecta você ao prontuário compartilhado sem expor informações de outros pacientes.</p></div> }

function PetResult({ pet, onOpenRecord }: { pet: PetRede; onOpenRecord: () => void }) { return <article className="overflow-hidden rounded-2xl border border-[#b9ddd1] bg-white shadow-sm"><div className="bg-[#e7f3ee] px-5 py-3 text-xs font-semibold text-[#39715b] sm:px-7"><span className="font-mono">{pet.codigo}</span><span className="mx-2 text-[#8aa197]">•</span>Registro localizado na rede nacional Elo Vet</div><div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[auto_1fr_auto] lg:items-center"><img className="h-24 w-24 rounded-2xl object-cover" src={pet.imagem} alt={`Foto de ${pet.nome}`} /><div><div className="flex flex-wrap items-center gap-3"><h3 className="text-2xl font-semibold text-[#185a43]">{pet.nome}</h3><span className="rounded-full bg-[#e7f3ee] px-2.5 py-1 text-[10px] font-bold text-[#39715b]">Prontuário Ativo</span>{pet.vacinacaoEmDia ? <span className="rounded-full bg-[#e7f3ee] px-2.5 py-1 text-[10px] font-bold text-[#39715b]">Vacinação em Dia</span> : <span className="rounded-full bg-[#fff4db] px-2.5 py-1 text-[10px] font-bold text-[#9a6d20]">Vacina pendente</span>}</div><p className="mt-2 text-sm text-[#567266]">{pet.especie} • {pet.raca} • {pet.idade}</p><div className="mt-4 grid gap-3 text-xs text-[#71847b] sm:grid-cols-2"><div className="flex items-center gap-2"><UserRound size={15} className="text-[#7e9f8e]" /> Tutor: <strong className="text-[#38584a]">{pet.tutor}</strong></div><div className="flex items-center gap-2"><Phone size={15} className="text-[#7e9f8e]" /> {pet.telefone}</div></div></div><button onClick={onOpenRecord} className="flex items-center justify-center gap-2 rounded-xl bg-[#185a43] px-4 py-3 text-xs font-bold text-white shadow-lg shadow-[#185a43]/15 transition hover:bg-[#124936]"><ClipboardList size={16} /> Acessar Prontuário Longitudinal</button></div></article> }
