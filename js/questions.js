/**
 * Base de Preguntas Históricas - Combate Naval de Iquique y Punta Gruesa (21 de mayo de 1879)
 * Con Validación Criptográfica y Estructural de Seguridad
 */

const DEFAULT_QUESTIONS = {
  // ESCENARIO 1: Combate de Punta Gruesa (Covadonga vs Independencia)
  punta_gruesa: [
    {
      id: "pg_1",
      scenario: "punta_gruesa",
      title: "Mando en la Goleta Covadonga",
      question: "¿Quién era el comandante al mando de la goleta chilena Covadonga en la mañana del 21 de mayo de 1879?",
      options: [
        "Capitán de Corbeta Carlos Condell de la Haza",
        "Capitán de Fragata Arturo Prat Chacón",
        "Teniente 1° Ignacio Serrano Montaner",
        "Guardiamarina Ernesto Riquelme"
      ],
      correctIndex: 0,
      explanation: "Carlos Condell de la Haza (35 años) comandaba la goleta Covadonga y con su audacia y conocimiento costero logró una de las mayores hazañas navales chilenas.",
      actionText: "¡Covadonga mantiene rumbo firme esquivando las salvas peruanas!"
    },
    {
      id: "pg_2",
      scenario: "punta_gruesa",
      title: "El Gigante Adversario",
      question: "¿Quién estaba al mando de la fragata blindada peruana Independencia y qué características tenía esta nave?",
      options: [
        "Capitán Juan Guillermo Moore; era el buque de mayor tonelaje y poder artillero de la escuadra peruana",
        "Capitán Miguel Grau; comandaba el monitor artillero de torre giratoria",
        "Capitán Lizardo Montero; lideraba una flota de corbetas de madera",
        "Almirante Aurelio García y García; estaba al mando de la cañonera Pilcomayo"
      ],
      correctIndex: 0,
      explanation: "Juan Guillermo Moore comandaba la poderosa fragata blindada Independencia (2.000 toneladas y blindaje de 4.5 pulgadas), el navío insignia del poder de fuego peruano.",
      actionText: "¡La enorme Independencia abre fuego con sus baterías pesadas pero sus tiros quedan largos!"
    },
    {
      id: "pg_3",
      scenario: "punta_gruesa",
      title: "Estrategia de Condell",
      question: "¿Cuál fue la genial maniobra táctica de Carlos Condell para anular la enorme ventaja de la Independencia?",
      options: [
        "Navegar pegado a la costa sobre bajos fondos rocosos aprovechando el menor calado de la Covadonga",
        "Huir a toda máquina hacia mar abierto buscando la protección de la escuadra británica",
        "Lanzar botes con torpedos de espiga contra las calderas del blindado peruano",
        "Frenar en seco y abordar la fragata peruana con ganchos de asalto"
      ],
      correctIndex: 0,
      explanation: "La Covadonga tenía apenas 11 pies de calado frente a los 21 pies de la pesada Independencia. Condell navegó deliberadamente a metros de los arrecifes costeros.",
      actionText: "¡Covadonga roza las rompientes costeras mientras la Independencia la persigue cegada por la presa!"
    },
    {
      id: "pg_4",
      scenario: "punta_gruesa",
      title: "Artillería de la Covadonga",
      question: "¿Con qué cañón principal respondía la Covadonga los disparos de la fragata peruana?",
      options: [
        "Un cañón de retrocarga Armstrong de 70 libras montado en colisa giratoria a popa",
        "Dos cañones Rodman de 500 libras en torre acorazada",
        "Baterías de ametralladoras Gatling en las cofas de los mástiles",
        "Cuatro cañones franceses de ánima lisa de 100 libras"
      ],
      correctIndex: 0,
      explanation: "La Covadonga contaba con un cañón de 70 libras en colisa en popa y dos pequeños cañones de 9 libras en las bandas, con los que hostigaba con precisión al gigante peruano.",
      actionText: "¡Impacto certero del 70 libras de la Covadonga sobre la cubierta de la Independencia!"
    },
    {
      id: "pg_5",
      scenario: "punta_gruesa",
      title: "El Intento de Espolonazo",
      question: "¿Qué maniobra ordenó Moore en la Independencia al frustrarse por no poder hundir a cañonazos a la Covadonga?",
      options: [
        "Espolonear a la Covadonga a toda velocidad para partirla en dos",
        "Retirarse a Iquique para reunirse con el monitor Huáscar",
        "Lanzar buzos con minas magnéticas contra el timón de Condell",
        "Bombardear la costa de Tarapacá para cortar su paso"
      ],
      correctIndex: 0,
      explanation: "Tras dos intentos fallidos de espolonear por la poca profundidad, Moore ordenó un tercer intento de embestida con su espolón de proa creyendo que el agua era suficientemente honda.",
      actionText: "¡La proa blindada de la Independencia se abalanza a toda máquina contra la Covadonga!"
    },
    {
      id: "pg_6",
      scenario: "punta_gruesa",
      title: "El Encallamiento Histórico",
      question: "¿Qué ocurrió exactamente en los arrecifes de Punta Gruesa durante el ataque de la Independencia?",
      options: [
        "La Independencia encalló violentamente en una roca submarina no cartografiada, rompiendo su quilla y varando",
        "La Covadonga chocó contra las rocas y sus tripulantes fueron tomados prisioneros",
        "Ambos buques colisionaron de frente y quedaron inmovilizados en la bahía",
        "Un remolino marino desvió la trayectoria de ambos navíos hacia alta mar"
      ],
      correctIndex: 0,
      explanation: "A las 11:45 AM, la quilla de la Independencia colisionó a toda fuerza contra el arrecife submarino de Punta Gruesa, destrozando su fondo y escorando gravemente a estribor.",
      actionText: "¡¡ESTRUENDO COLOSAL!! ¡La Independencia queda encallada y destrozada sobre la roca!"
    },
    {
      id: "pg_7",
      scenario: "punta_gruesa",
      title: "Desenlace del Combate",
      question: "¿Qué hizo la Covadonga al ver que la temible fragata enemiga yacía varada e indefensa?",
      options: [
        "Viró en redondo, se colocó por la aleta ciega de la Independencia y la cañoneó hasta que arrió su bandera",
        "Huyó inmediatamente hacia el sur antes de que la tripulación peruana pudiera saltar al agua",
        "Envió un destacamento de abordaje para incendiar las bodegas de carbón",
        "Solicitó ayuda telegráfica a los puertos de Antofagasta"
      ],
      correctIndex: 0,
      explanation: "Condell dio la vuelta con maestría, situó a la Covadonga donde los cañones de la escorada fragata no podían apuntarle y abrió fuego de artillería hasta obligar la rendición.",
      actionText: "¡Victoria táctica chilena! El buque más poderoso de Perú queda fuera de combate para siempre."
    }
  ],

  // ESCENARIO 2: Combate Naval de Iquique (Esmeralda vs Huáscar)
  iquique: [
    {
      id: "iq_1",
      scenario: "iquique",
      title: "La Arenga de Prat",
      question: "¿Cuáles fueron las inmortales palabras de Arturo Prat a su tripulación antes de entrar en combate?",
      options: [
        "¡Muchachos: la contienda es desigual, pero ánimo y valor! ¡Nunca se ha arriado nuestra bandera ante el enemigo y espero que no sea ésta la ocasión de hacerlo!",
        "¡Soldados de la patria: venceremos o moriremos, pero jamás retrocederemos ante las armas peruanas!",
        "¡Chilenos: el mar nos pertenece y hoy escribiremos con sangre la gloria eterna de nuestra nación!",
        "¡A las armas muchachos, disparen a voluntad y que la providencia decida el vencedor!"
      ],
      correctIndex: 0,
      explanation: "Arturo Prat pronunció esta histórica arenga a las 8:30 AM sobre el alcázar de la Esmeralda, culminando con la orden: '¡Mientras yo viva, esa bandera flameará en su lugar!'.",
      actionText: "¡Viva Chile! La tripulación de la Esmeralda prorrumpe en un grito unánime y ocupa sus puestos de combate."
    },
    {
      id: "iq_2",
      scenario: "iquique",
      title: "El Poder del Huáscar",
      question: "¿Qué características de diseño hacían al monitor Huáscar una nave formidable y casi invulnerable?",
      options: [
        "Casco de hierro de bajo francobordo con blindaje de 4.5 pulgadas y torre giratoria con 2 cañones Armstrong de 300 lbs",
        "Tres cubiertas de madera reforzada con 40 cañones de bronce y sistema de propulsión a remos",
        "Blindaje de acero templado Krupp con misiles autopropulsados y motor diésel de alta velocidad",
        "Doble casco de madera de roble con cañones navales de tiro rápido Gatling"
      ],
      correctIndex: 0,
      explanation: "Construido en astilleros Laird de Inglaterra (1865), el Huáscar era un monitor blindado con torre Coles giratoria capaz de pulverizar naves de madera como la Esmeralda.",
      actionText: "¡La torre blindada del Huáscar gira lentamente apuntando sus cañones colosales de 300 libras!"
    },
    {
      id: "iq_3",
      scenario: "iquique",
      title: "La Falla de la Esmeralda",
      question: "¿Por qué la corbeta Esmeralda quedó prácticamente inmovilizada al comienzo del combate en la bahía?",
      options: [
        "Estallaron dos de sus calderas viejas y gastadas, reduciendo su velocidad a escasos 2 nudos",
        "La tripulación se amotinó en la sala de máquinas y detuvo el flujo de vapor",
        "Se atascó el timón por una cadena enemiga colocada bajo el agua en el fondeadero",
        "Se agotó por completo el carbón durante la noche anterior al combate"
      ],
      correctIndex: 0,
      explanation: "La Esmeralda era un viejo buque de madera (1854) con máquinas en pésimo estado. El reventón de calderas la condenó a librar el combate prácticamente anclada.",
      actionText: "¡Batería de 40 libras de la Esmeralda dispara salva cerrada! Las balas rebotan en el blindaje del Huáscar."
    },
    {
      id: "iq_4",
      scenario: "iquique",
      title: "El Primer Espolonazo y el Abordaje",
      question: "¿Qué audaz acción realizó Arturo Prat cuando el Huáscar embistió con su espolón por primera vez a la Esmeralda?",
      options: [
        "Gritó '¡Al abordaje, muchachos!' y saltó valerosamente a la cubierta del Huáscar con espada y revólver",
        "Ordenó arriar la bandera chilena para evitar más derramamiento de sangre",
        "Se lanzó al agua con un barril de pólvora para volar el timón del monitor",
        "Ordenó el abandono general del buque y la rendición incondicional"
      ],
      correctIndex: 0,
      explanation: "Al chocar el espolón del Huáscar contra la aleta de babor de la Esmeralda a las 11:30 AM, Prat exclamó '¡Al abordaje, muchachos!' y saltó a la cubierta del Huáscar.",
      actionText: "¡¡AL ABORDAJE MUCHACHOS!! ¡Prat pisa la cubierta enemiga en un acto supremo de heroísmo!"
    },
    {
      id: "iq_5",
      scenario: "iquique",
      title: "Los Héroes del Abordaje",
      question: "¿Quién acompañó a Arturo Prat en su salto a la cubierta enemiga durante el primer espolonazo?",
      options: [
        "El Sargento 2° Juan de Dios Aldea y un marinero",
        "El Teniente Carlos Condell y dos guardiamarinas",
        "El médico cirujano Cornelio Guzmán",
        "El Almirante Patricio Lynch y diez soldados"
      ],
      correctIndex: 0,
      explanation: "Debido al estruendo ensordecedor de los cañones y el rápido desprendimiento de los buques, solo el sargento Juan de Dios Aldea pudo seguir a Prat al abordaje.",
      actionText: "¡Prat y Aldea combaten en la cubierta del monitor frente a la torreta de mando enemiga!"
    },
    {
      id: "iq_6",
      scenario: "iquique",
      title: "El Segundo Abordaje",
      question: "¿Quién asumió el mando de la Esmeralda y encabezó un segundo abordaje en la siguiente embestida del Huáscar?",
      options: [
        "El Teniente 1° Ignacio Serrano Montaner, saltando con doce valientes tripulantes",
        "El Capitán Juan José Latorre con la infantería de marina",
        "El Comandante Manuel Thomson con los artilleros de proa",
        "El Ingeniero Juan Eduardo O'Ryan con los maquinistas"
      ],
      correctIndex: 0,
      explanation: "Ignacio Serrano (23 años) tomó el mando de la moribunda corbeta y en el segundo espolonazo saltó con 12 marinos e intentó abrir la escotilla de la torre del Huáscar.",
      actionText: "¡Segundo abordaje! Serrano y sus hombres asaltan la cubierta del Huáscar con fiereza infinita."
    },
    {
      id: "iq_7",
      scenario: "iquique",
      title: "El Último Cañonazo",
      question: "¿Qué joven guardiamarina de 21 años disparó el último cañonazo de la Esmeralda antes de que el mar la sepultara?",
      options: [
        "Guardiamarina Ernesto Riquelme Venegas",
        "Guardiamarina Arturo Wilson Navarrete",
        "Guardiamarina Vicente Zegers Recasens",
        "Guardiamarina Carlos Krug"
      ],
      correctIndex: 0,
      explanation: "Ernesto Riquelme disparó heroicamente el último proyectil de la batería de proa cuando el agua ya inundaba la cubierta, hundiéndose junto a su cañón.",
      actionText: "¡FUEGO! Riquelme dispara el último cañonazo mientras las aguas cubren la cubierta de la corbeta."
    },
    {
      id: "iq_8",
      scenario: "iquique",
      title: "El Hundimiento Glorioso",
      question: "¿A qué hora y en qué condición se hundió finalmente la Esmeralda en las aguas de la bahía de Iquique?",
      options: [
        "A las 12:10 horas, sumergiéndose con su pabellón chileno al tope sin haberse rendido jamás",
        "A las 15:30 horas, tras haber quemado su bandera para que no cayera en manos peruanas",
        "A las 9:00 horas, tras ser remolcada a la playa por botes de pescadores",
        "A la medianoche, debido al fuego de los cañones de costa de Iquique"
      ],
      correctIndex: 0,
      explanation: "A las 12:10 PM, tras el tercer espolonazo del Huáscar y más de 3 horas y media de combate desigual, la Esmeralda se hundió con su bandera al tope y disparando hasta el final.",
      actionText: "¡La Esmeralda se sumerge en la eternidad con su pabellón al viento intacto e invicto!"
    },
    {
      id: "iq_9",
      scenario: "iquique",
      title: "El Caballero de los Mares",
      question: "¿Por qué el almirante peruano Miguel Grau Seminario fue llamado con justicia 'El Caballero de los Mares'?",
      options: [
        "Rescató con vida a los 57 náufragos de la Esmeralda, elogió a Prat y envió una emotiva carta a su viuda Carmela Carvajal junto a sus pertenencias",
        "Aceptó firmar un armisticio inmediato para detener la guerra naval en el Pacífico",
        "Canoeó hasta Valparaíso para entregar personalmente los restos mortales de Arturo Prat",
        "Renunció a su cargo militar al día siguiente por negarse a combatir contra Chile"
      ],
      correctIndex: 0,
      explanation: "Grau ordenó salvar a los náufragos ('¡Salvad a los valientes chilenos!') y escribió una célebre carta a la viuda de Prat devolviendo su espada, reloj y escapulario.",
      actionText: "¡Honor a los valientes! Las aguas de Iquique atestiguan el respeto entre gigantes del mar."
    }
  ]
};

class QuestionManager {
  constructor() {
    this.storageKey = 'combate_naval_iquique_questions_v2_secure';
    this.questions = this.loadQuestions();
  }

  loadQuestions() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (window.Security && typeof window.Security.validateQuestionsDatabase === 'function') {
          const validated = window.Security.validateQuestionsDatabase(parsed);
          if (validated) {
            return validated;
          }
        }
      }
    } catch (e) {
      console.warn('Alerta de seguridad: Datos de localStorage inválidos o corruptos. Reestableciendo a base segura:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
  }

  saveQuestions() {
    try {
      if (window.Security && typeof window.Security.validateQuestionsDatabase === 'function') {
        const clean = window.Security.validateQuestionsDatabase(this.questions);
        if (clean) {
          localStorage.setItem(this.storageKey, JSON.stringify(clean));
          return true;
        }
      }
    } catch (e) {
      console.error('Error guardando preguntas de forma segura:', e);
    }
    return false;
  }

  resetToDefault() {
    this.questions = JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
    this.saveQuestions();
    return this.questions;
  }

  getScenarioQuestions(scenarioKey) {
    const list = this.questions[scenarioKey] || [];
    return list.map(q => {
      const optionsWithIndices = q.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === q.correctIndex
      }));
      // Barajado Fisher-Yates seguro
      for (let i = optionsWithIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsWithIndices[i], optionsWithIndices[j]] = [optionsWithIndices[j], optionsWithIndices[i]];
      }

      return {
        id: q.id,
        scenario: q.scenario,
        title: q.title,
        question: q.question,
        options: optionsWithIndices.map(o => o.text),
        correctIndex: optionsWithIndices.findIndex(o => o.isCorrect),
        originalCorrectText: q.options[q.correctIndex],
        explanation: q.explanation,
        actionText: q.actionText || '¡Maniobra naval ejecutada!'
      };
    });
  }

  getAllQuestions() {
    return this.questions;
  }

  addQuestion(scenarioKey, newQ) {
    if (!this.questions[scenarioKey]) {
      this.questions[scenarioKey] = [];
    }

    if (window.Security && typeof window.Security.validateQuestion === 'function') {
      const validated = window.Security.validateQuestion({
        ...newQ,
        scenario: scenarioKey,
        id: `${scenarioKey}_${Date.now()}`
      });

      if (!validated) {
        throw new Error('Los datos de la pregunta no superaron la validación de seguridad.');
      }

      this.questions[scenarioKey].push(validated);
      this.saveQuestions();
      return validated;
    }
    return null;
  }

  deleteQuestion(scenarioKey, id) {
    if (this.questions[scenarioKey]) {
      const sanitizedId = String(id).replace(/[^a-zA-Z0-9_-]/g, '');
      this.questions[scenarioKey] = this.questions[scenarioKey].filter(q => q.id !== sanitizedId);
      this.saveQuestions();
    }
  }
}

window.QuestionManager = QuestionManager;
window.DEFAULT_QUESTIONS = DEFAULT_QUESTIONS;
