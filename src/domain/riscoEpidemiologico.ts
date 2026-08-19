export type PetEpidemiologico = {
  raca: string
  idade: number
  peso: number
  especie: string
  data_ultimo_checkup: string
}

export type RiscoEpidemiologico = {
  nivel: 'verde' | 'amarelo' | 'vermelho'
  mensagem: string
}

const DATA_REFERENCIA_RISCO = '2026-08-18'

export function calcularRiscoEpidemiologico(pet: PetEpidemiologico): RiscoEpidemiologico {
  const raca = pet.raca.trim().toLowerCase()
  const especie = pet.especie.trim().toLowerCase()
  const checkup = Date.parse(pet.data_ultimo_checkup)
  const referencia = Date.parse(DATA_REFERENCIA_RISCO)
  const checkupVencido = Number.isNaN(checkup) || checkup > referencia || referencia - checkup > 365 * 24 * 60 * 60 * 1000

  if (especie !== 'cão' && especie !== 'cao' && especie !== 'cachorro') {
    return { nivel: 'verde', mensagem: 'Nenhuma regra epidemiológica canina foi acionada. Mantenha o acompanhamento preventivo conforme a espécie.' }
  }
  if (raca === 'dachshund' && pet.peso > 8.5) {
    return { nivel: 'vermelho', mensagem: 'Risco alto de sobrecarga de coluna. Recomenda-se avaliação ortopédica preventiva, controle de peso e restrição de saltos.' }
  }
  if (raca === 'golden retriever' && pet.idade > 7) {
    return { nivel: 'amarelo', mensagem: 'Risco moderado de alterações articulares. Recomenda-se avaliação de mobilidade e acompanhamento de peso.' }
  }
  if (checkupVencido) {
    return { nivel: 'amarelo', mensagem: 'Check-up preventivo vencido ou inválido. Recomenda-se agendar uma avaliação clínica de rotina.' }
  }
  return { nivel: 'verde', mensagem: 'Risco epidemiológico controlado. Mantenha check-ups, vacinação e hábitos preventivos em dia.' }
}
