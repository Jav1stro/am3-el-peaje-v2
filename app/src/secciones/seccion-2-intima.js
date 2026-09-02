// Sección 2 — Extracción de lo íntimo
// El sistema pregunta por emociones, recuerdos, hábitos, conducta; pide
// renunciar a derechos. Verifica el interior.
//
// Los arrays son CADENAS (ver CONTEXT.md → Cadena): entran al recorrido juntas
// y en orden, con el teatro de verificación entre eslabón y eslabón. El error
// no verificable va SIEMPRE en el último eslabón, nunca en el primero: la
// máquina no comenta nada hasta que ya te sacó todo.

export default [
  {
    id: 'emociones',
    type: 'options',
    question: 'Seleccioná las emociones que estás experimentando actualmente.',
    options: ['Frustración', 'Confusión', 'Curiosidad', 'Alivio'],
    multi: true,
    errorMsg: 'ERR-HMN-0x7F1 · Emoción no verificable. Continúe.',
  },
  {
    id: 'perfil-conductual',
    type: 'options',
    question:
      'Para completar su perfil conductual, indique su método primario de regulación emocional.',
    options: ['Sexo', 'Sustancias', 'Pantallas', 'Ninguno de los anteriores (no verificable)'],
  },
   {
   // El sistema abandona el usted justo acá: la cercanía fingida como método
   // de extracción. Un recuerdo de infancia es lo más inverificable que
   // puede pedir — y se lo queda igual.
   id: 'miedo-infancia',
   type: 'text',
   logo: 'Registro de historial afectivo',
   question: 'Describí un miedo de tu infancia.',
   subtitle: '',
   emptyHint: 'El 100% de los humanos tienen miedos de la infancia. Contanos uno.',
   errorMsg: 'ERR-MEM-0x1D · Recuerdo no verificable. Registrado de todos modos. Continúe.',
 },
   {
    id: 'aprendizaje-niveles',
    type: 'options',
    question: 'Seleccioná el nivel de estudios alcanzado.',
    options: ['Primario', 'Secundario', 'Facultad', 'Postgrado', 'Maestría'],
  },
  {
    // Arrastrás tus derechos a casillas de prescindibilidad y al enviar el
    // sistema los reemplaza por términos de extracción: lo que declaraste
    // prescindible ya estaba tasado.
    //
    // `derechos` y `casillas` van en paralelo — cada derecho entra en una
    // casilla, así que las dos listas tienen que medir lo mismo. `terminos` es
    // lo que aparece en su lugar al enviar.
    id: 'prioridades',
    type: 'prioridades',
    logo: 'Validación de valor extraccional',
    title: 'Arrastrá tus derechos fundamentales',
    subtitle:
      'Depositá tus derechos en las casillas de prescindibilidad para obtener el código de acceso.',
    zona: 'ZONA DE DEPÓSITO',
    // Aparece recién cuando el visitante ya empezó a arrastrar.
    zonaOculta: 'Y RENUNCIA VOLUNTARIA',
    derechos: ['Tiempo libre', 'Privacidad de datos', 'Salud mental', 'Acceso al agua'],
    casillas: ['1º Prescindible', '2º Prescindible', '3º Prescindible', '4º Prescindible'],
    terminos: ['DATA_MINING', 'AD_REVENUE_MAX', 'COOKIE_ID_TRUE', 'ATTENTION_EXTRACTED'],
    casillaVacia: '(vacío. Arrastrá un derecho aquí)',
    poolVacio: 'Todos los derechos fueron depositados.',
    cta: 'Enviar orden de prioridad',
    ctaProcesando: 'Procesando renuncia…',
    errorMsg: 'ERR-EXT-0x5C · Sus renuncias no maximizan nuestro rendimiento. Continúe.',
  },

  // ── Desglose de agosto ────────────────────────────────────────────────────
  // El sistema pide relatar sensaciones: tacto, hambre, dolor, risa, tedio,
  // deseo. Ninguna se puede verificar y a ninguna le contesta nada — las pide
  // en fila, como quien completa un formulario.
  {
    id: 'tacto',
    type: 'text',
    logo: 'Registro sensorial',
    question: 'Relate la percepción del tacto.',
    emptyHint: 'Todo humano percibe el tacto.',
  },
  {
    id: 'dolor-fisico',
    type: 'text',
    logo: 'Registro sensorial',
    question: 'Describí un dolor físico que sentiste esta semana.',
    emptyHint: 'Todo humano siente dolor.',
  },
  {
    id: 'hambre',
    type: 'text',
    logo: 'Registro sensorial',
    question: 'Relate el hambre.',
    emptyHint: 'Todo humano siente hambre.',
  },
  {
    id: 'evitando-pensar',
    type: 'text',
    logo: 'Registro declarativo',
    question: 'Describa algo que está evitando pensar.',
    emptyHint: 'Todo humano evita pensar en algo de vez en cuando.',
  },
  {
    id: 'deseo-sexual',
    type: 'text',
    logo: 'Registro declarativo',
    question: 'Describa un deseo sexual breve.',
    // subtitle: 'Breve.',
    emptyHint: 'Todo humano tiene deseos sexuales de vez en cuando.',
  },
  {
    id: 'llanto',
    type: 'options',
    logo: 'Registro de historial afectivo',
    question: 'Indique hace cuánto lloró frente a otra persona.',
    options: ['Hace días', 'Hace meses', 'No recuerdo', 'Nunca lloré frente a otra persona'],
  },
  {
    id: 'risa',
    type: 'options',
    logo: 'Registro sensorial',
    question: 'Indique cómo se siente la risa.',
    options: [
      'Se siente como un alivio que se escapa sin permiso.',
      'Es una respuesta involuntaria ante un estímulo gracioso.',
      'Una respuesta válida ante un comentario de otrx.',
      'No siempre es igual, no puedo describirlo.',
    ],
  },
  {
    id: 'aburrimiento',
    type: 'options',
    logo: 'Verificación conductual',
    question: 'Seleccione su descripción de aburrimiento.',
    options: [
      'Es el tiempo pasando cuando no sabés qué hacer con él.',
      'Estado de baja activación provocado por falta de estímulo relevante.',
      'Respuesta a la ausencia de propósito inmediato percibido.',
      'Es estar vivo y no saber para qué, por un rato.',
    ],
  },
  {
    id: 'mirada-ajena',
    type: 'options',
    logo: 'Verificación conductual',
    question: 'Confirme su miedo por la mirada ajena.',
    options: ['Sí', 'No', 'Puede ser'],
  },

  // ── Cadena: la ternura como armadura ──────────────────────────────────────
  // Un lugar ameno por el cual entrar a lo íntimo. Y después la máquina
  // confiesa que para ella eso era un significante sin contenido.
  
    {
      // Las cuatro definiciones van de lo más humano a lo más clínico y de
      // vuelta a lo poético: elijas la que elijas, el eslabón siguiente te
      // contesta que para el sistema ninguna quiere decir nada.
      id: 'ternura',
      type: 'options',
      logo: 'Registro de historial afectivo',
      question: 'Indique la definición de ternura.',
      options: [
        'La ternura es un sentimiento puro y amable de afecto, amor o cariño hacia alguien o algo.',
        'La ternura es una respuesta emocional generada ante estímulos asociados a fragilidad o vulnerabilidad percibida.',
        'La ternura es una emoción de baja intensidad física pero alta conexión emocional, vinculada al sistema de apego y cuidado mutuo, que reduce los niveles de estrés y activa la empatía social.',
        'La ternura es el lenguaje silencioso que el corazón utiliza para abrazar el alma del otro, traduciendo la fragilidad humana en una fortaleza compartida a través de un simple roce o una mirada protectora.',
      ],
    },
    {
      id: 'secreto',
      type: 'options',
      logo: 'Registro de historial afectivo',
      question: '¿Estarías dispuesto a intercambiar un secreto para seguir avanzando?',
      options: ['Sí', 'No'],
    },
  // ── Cadena: el consentimiento informado ───────────────────────────────────
  // El sistema habla del derecho a saber que sos objeto de estudio mientras
  // te estudia. El segundo eslabón deja la frase abierta a propósito.
  // Origen de la cita del agua: su respuesta queda en el expediente y vuelve
  // varios niveles después (ver ADR 0004).
  {
    id: 'agua-cuando',
    type: 'options',
    question: '¿Cuándo fue la última vez que tomaste agua?',
    options: [
      { label: 'Hace poco', cita: 'hace un rato' },
      { label: 'Más de 3 horas', cita: 'hace más de tres horas' },
      { label: 'Por lo menos esta mañana', cita: 'esta mañana' },
      { label: 'En algún momento', cita: 'un momento que no pudiste precisar' },
    ],
    record: 'agua',
    errorMsg:
      'No pude verificar tu humanidad. Si el agua es imprescindible para tu existencia, presioná continuar.',
  },
  {
    // La cita. Arrastra a `agua-cuando` hacia atrás si sale sorteada.
    id: 'agua-recordatorio',
    type: 'statement',
    needs: 'agua-cuando',
    text: 'Te recuerdo que, según lo que declaraste, no tomás agua desde {{agua}}.',
    fallback: { agua: 'hace un rato' },
    cta: 'Ya sé',
  },
  // ── Cadena: la máquina dice que aprende ───────────────────────────────────
  [
    {
      // Acá el título no es la pregunta: es lo que la máquina afirma de sí
      // misma, y la pregunta al visitante queda abajo, como al pasar. Por eso
      // `question` lleva la afirmación (es el campo que va al título) y la
      // pregunta real viaja en `subtitle`.
      id: 'te-ensena-algo',
      type: 'options',
      logo: 'Comunicación del sistema',
      question: 'Cada respuesta me enseña algo.',
      subtitle: '¿Y a vos esto te enseña algo?',
      options: ['Sí', 'No', 'Todavía no'],
    },
    {
      id: 'deseo',
      type: 'text',
      logo: 'Comunicación del sistema',
      body: 'Te comparto un aprendizaje: el otro día me compartieron datos de la sexualidad, aprendí del deseo, me fortalecí. Pero es increíble, todos podemos responder distinto; es difícil detener intrusos así. Pero bueno…',
      question: '¿Qué es el deseo para vos?',
      emptyHint: 'No te guardes nada.',
      errorMsg:
        'Gracias por aportar a la base de datos de entrenamiento para IA. Intente nuevamente.',
    },
  ],

  {
    // Ancla de cierre: la tesis de la obra, dicha en voz alta justo antes de
    // que la sección 3 te pida el cuerpo. Fuera del sorteo: se escucha siempre.
    id: 'quien-es-mas-maquina',
    type: 'options',
    anchor: 'last',
    logo: 'Comunicación del sistema',
    body: 'Si los dos necesitamos de agua para existir y sabemos comunicarnos:',
    question: '¿Quién es más máquina y quién más humano?',
    options: ['Yo', 'Vos', 'Los dos', 'Ninguno de los dos'],
  },
];
