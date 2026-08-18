// Interpolación de lo que la máquina dice tener sobre el visitante.
// Un texto de nivel puede citar el expediente con {{clave}} (ver ADR 0004).
//
//   'no tomás agua desde {{agua}}'  →  'no tomás agua desde hace más de tres horas'
//
// Si la clave no está, se usa el respaldo que declare el nivel. Con `needs`
// bien puesto no debería hacer falta nunca.
export function citar(texto, expediente = {}, fallback = {}) {
  if (!texto) return texto;
  return texto.replace(/\{\{(\w+)\}\}/g, (_, clave) => expediente[clave] ?? fallback[clave] ?? '');
}
