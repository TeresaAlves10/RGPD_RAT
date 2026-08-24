/**
 * Despoleta o download de um Blob no browser, sem qualquer pedido de rede
 * (URL local via `URL.createObjectURL`). Único mecanismo de "exportação"
 * de toda a aplicação — nunca envia o ficheiro para lado nenhum.
 */
export function descarregarFicheiro(nome: string, conteudo: Blob): void {
  const url = URL.createObjectURL(conteudo)
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
