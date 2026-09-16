// Textos del ticket que emite la estación de impresión al alcanzar el final.
// Son ejemplos: editables acá, sin tocar el cliente de impresión ni peaje-core.
// La estación no sabe qué dice el ticket — imprime lo que le dan.
//
// Sólo la voz de la máquina: ninguna respuesta del visitante va al papel.
//
// OJO CON EL ANCHO. El papel no tiene margen elástico: si un renglón se pasa,
// la impresora lo parte donde caiga. A 58 mm entran
//
//   encabezado (fuente normal) ····· 32 caracteres
//   pie (letra chica) ·············· 42 caracteres
//
// A 80 mm entran 48 y 64. La regla de abajo es la de 58, que es la angosta.
//   |------------- 32 -------------|
//   |------------------ 42 -------------------|
//
// OJO CON LAS MAYÚSCULAS ACENTUADAS. La PP7 imprime bien á é í ó ú ñ Ñ ¿ ¡,
// pero Á É Í Ó Ú salen como basura (su página de códigos no las tiene). Hasta
// que peaje-core cambie de página, el encabezado va sin tildes.

export const TICKET_ENCABEZADO = `EL PEAJE
VERIFICACION DE IDENTIDAD
COMPROBANTE DE ACCESO A FUENTE`;

// Se compone al emitir, para que la fecha sea la del final alcanzado.
export function piePara(fecha = new Date()) {
  const sello = fecha.toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  return `Emitido ${sello}
Documento sin valor de garantía.
El acceso podrá revocarse sin aviso.
Conserve este comprobante.`;
}
