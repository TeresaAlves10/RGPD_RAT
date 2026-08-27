/**
 * Uma ocorrência ancora-se a um campo do schema (ex.: "gestorProjeto.nome");
 * uma secção do wizard lista os seus campos de topo (ex.: "gestorProjeto").
 * Uma ocorrência pertence à secção quando o campo bate certo ou é um dos
 * seus subcampos.
 */
export function campoPertenceAoPasso(campoOcorrencia: string, camposPasso: readonly string[]): boolean {
  return camposPasso.some((campo) => campoOcorrencia === campo || campoOcorrencia.startsWith(`${campo}.`))
}
