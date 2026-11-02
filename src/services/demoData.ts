import { FlashcardDeck, QuizExam, SummaryResult, TutorMessage } from '../types/study';

export const SAMPLE_TEXTS = [
  {
    title: 'Fotosíntesis y el Ciclo de Calvin',
    category: 'Biología',
    text: `La fotosíntesis es un proceso neuroquímico y metabólico crucial mediante el cual las plantas, algas y ciertas bacterias convierten la energía lumínica en energía química en forma de glucosa. Se divide en dos fases principales: la fase luminosa o dependiente de la luz y la fase oscura o ciclo de Calvin.

En la fase luminosa, que tiene lugar en la membrana de los tilacoides del cloroplasto, los fotones son captados por la clorofila. Esto provoca la fotólisis del agua (H2O), liberando oxígeno molecular (O2) a la atmósfera como subproducto y produciendo moléculas energéticas de ATP y NADPH.

Posteriormente, en el estroma del cloroplasto, ocurre el ciclo de Calvin. En esta fase independiente de la radiación directa, la enzima RuBisCO cataliza la fijación del dióxido de carbono (CO2) atmosférico combinándolo con ribulosa-1,5-bisfosfato. Con la energía aportada por el ATP y el NADPH, se sintetiza gliceraldehído-3-fosfato (G3P), precursor directo de la glucosa y otros glúcidos indispensables para la nutrición vegetal y la cadena trófica global.`
  },
  {
    title: 'La Primera Revolución Industrial y sus Consecuencias',
    category: 'Historia',
    text: `La Primera Revolución Industrial comenzó en Gran Bretaña a mediados del siglo XVIII (hacia 1760-1840) y transformó radicalmente la economía agraria y artesanal en una economía mecanizada e industrializada.

El núcleo impulsor fue la máquina de vapor perfeccionada por James Watt en 1769, alimentada por carbón mineral. Este avance revolucionó el sector textil con telares mecánicos y la siderurgia con altos hornos para la producción masiva de hierro. Pronto, la aplicación del vapor al ferrocarril de George Stephenson aceleró el transporte de mercancías y personas a escalas jamás vistas.

Socialmente, este fenómeno provocó un éxodo rural masivo hacia las ciudades, dando origen al proletariado urbano y a la burguesía industrial. Las jornadas laborales iniciales superaban las 14 horas en condiciones insalubres, propiciando el nacimiento del movimiento obrero, el ludismo y más tarde los primeros sindicatos y legislaciones laborales.`
  },
  {
    title: 'Principios de la Computación Cuántica',
    category: 'Tecnología',
    text: `La computación cuántica es un paradigma de cálculo fundamentalmente diferente a la computación clásica binaria. Mientras que una computadora tradicional utiliza bits que solo pueden valer 0 o 1, una computadora cuántica opera con cúbits (bits cuánticos).

Gracias al principio cuántico de superposición, un cúbit puede existir en una combinación lineal simultánea de 0 y 1 hasta el momento de su medición. Además, el entrelazamiento cuántico permite que múltiples cúbits correlacionen sus estados instantáneamente sin importar la distancia, habilitando un procesamiento paralelo masivo exponencial.

Esto otorga a los algoritmos cuánticos (como el algoritmo de Shor para factorización o el de Grover para búsqueda) una ventaja cuántica exponencial para optimización molecular, simulación de materiales y criptografía avanzada, aunque aún afronta grandes desafíos como la decoherencia cuántica y la corrección de errores.`
  }
];

export const DEMO_SUMMARY_RESULT: SummaryResult = {
  id: 'demo-summary-1',
  timestamp: Date.now(),
  title: 'Fotosíntesis y el Ciclo de Calvin',
  originalTextSnippet: 'La fotosíntesis es un proceso neuroquímico y metabólico crucial mediante el cual las plantas...',
  executiveSummary: 'La fotosíntesis es el mecanismo biológico primordial que sustenta la biosfera, transformando energía solar y CO2 en biomasa (glucosa) y oxígeno mediante dos fases acopladas: fotodependiente en tilacoides y ciclo de Calvin en el estroma.',
  level: 'intermedio',
  sourceLength: 850,
  keyConcepts: [
    {
      term: 'Fase Luminosa',
      definition: 'Etapa que ocurre en tilacoides; aprovecha la luz para disociar agua (fotólisis), emitiendo O2 y generando ATP + NADPH.',
      importance: 'alta'
    },
    {
      term: 'Ciclo de Calvin',
      definition: 'Fase bioquímica en el estroma donde el CO2 es fijado para sintetizar moléculas de glucosa utilizando ATP y NADPH.',
      importance: 'alta'
    },
    {
      term: 'RuBisCO',
      definition: 'Enzima clave que cataliza la fijación inicial de dióxido de carbono a la ribulosa bisfosfato.',
      importance: 'media'
    },
    {
      term: 'Fotólisis del Agua',
      definition: 'Ruptura de la molécula de H2O por acción lumínica, liberando electrones, protones y oxígeno.',
      importance: 'media'
    }
  ],
  structuredSections: [
    {
      heading: '1. Arquitectura y Fases Celulares',
      points: [
        'Tiene lugar en el cloroplasto, compartimentado en tilacoides y estroma.',
        'La fase dependiente de luz captura fotones en complejos antena de clorofila.',
        'Produce los intermediarios de alta energía requeridos para la fase de biosíntesis.'
      ]
    },
    {
      heading: '2. Síntesis y Fijación de Carbono',
      points: [
        'El ciclo de Calvin no requiere luz directa, pero depende del ATP y NADPH producidos previamente.',
        'El producto directo es G3P, que se convertirá en glucosa, almidón y celulosa.',
        'Garantiza la entrada de carbono inorgánico a las cadenas tróficas del planeta.'
      ]
    }
  ],
  conclusions: [
    'Sin la fotólisis luminosa no existiría la atmósfera oxigenada terrestre moderna.',
    'El ciclo de Calvin representa el puente primordial entre el mundo mineral inorgánico y la vida orgánica.'
  ],
  reflectionQuestions: [
    '¿Qué consecuencias tendría para el ciclo de Calvin si se inhibe la producción de ATP en la fase luminosa?',
    '¿Por qué se considera a la enzima RuBisCO una de las proteínas más abundantes e importantes de la Tierra?'
  ]
};

export const DEMO_PREBUILT_DECKS: FlashcardDeck[] = [
  {
    id: 'deck-biologia',
    title: 'Biología Celular & Molecular',
    description: 'Estructuras celulares, organelos, transporte de membrana y metabolismo.',
    category: 'Biología',
    createdAt: Date.now() - 86400000 * 3,
    cards: [
      {
        id: 'bio-1',
        front: '¿Cuál es la función principal de la Mitocondria?',
        back: 'Generar la mayor parte de la energía química de la célula (ATP) mediante la respiración celular aeróbica y el ciclo de Krebs.',
        hint: 'Es la central energética celular.',
        tag: 'Organelos',
        status: 'dominado'
      },
      {
        id: 'bio-2',
        front: '¿Qué diferencia el Retículo Endoplasmático Rugoso (RER) del Liso (REL)?',
        back: 'El RER tiene ribosomas adheridos y sintetiza proteínas de membrana/secreción. El REL carece de ribosomas y sintetiza lípidos además de detoxificar.',
        hint: 'Observa los ribosomas en su superficie.',
        tag: 'Estructura',
        status: 'repaso'
      },
      {
        id: 'bio-3',
        front: '¿Qué es el transporte pasivo por Difusión Facilitada?',
        back: 'El paso de solutos a favor de su gradiente electroquímico a través de proteínas transportadoras o canales, sin gasto metabólico de ATP.',
        hint: 'No consume ATP celular.',
        tag: 'Membrana',
        status: 'dificil'
      },
      {
        id: 'bio-4',
        front: '¿Qué función cumple el Aparato de Golgi?',
        back: 'Modifica, clasifica, empaqueta y distribuye proteínas y lípidos provenientes del RER en vesículas hacia su destino final.',
        hint: 'Es el centro de logística y paquetería celular.',
        tag: 'Organelos',
        status: 'nuevo'
      }
    ]
  },
  {
    id: 'deck-historia',
    title: 'Historia Contemporánea',
    description: 'Revoluciones, guerras mundiales, geopolítica y tratados clave del siglo XX.',
    category: 'Historia',
    createdAt: Date.now() - 86400000 * 2,
    cards: [
      {
        id: 'hist-1',
        front: '¿En qué año se firmó el Tratado de Versalles y cuál fue su objetivo?',
        back: 'Firmado en 1919 tras la Primera Guerra Mundial, impuso duras sanciones económicas, territoriales y militares a Alemania.',
        hint: 'Finaliza oficialmente la Gran Guerra.',
        tag: 'Siglo XX',
        status: 'dominado'
      },
      {
        id: 'hist-2',
        front: '¿Qué acontecimiento marcó el inicio de la Gran Depresión económica?',
        back: 'El Crack del 29 en la Bolsa de Wall Street (Nueva York) en octubre de 1929, desatando una crisis financiera internacional.',
        hint: 'Martes Negro en la bolsa estadounidense.',
        tag: 'Economía',
        status: 'repaso'
      },
      {
        id: 'hist-3',
        front: '¿Qué fue la Doctrina Truman y qué política inauguró?',
        back: 'Estrategia estadounidense de 1947 para contener la expansión del comunismo soviético, inaugurando la Guerra Fría.',
        hint: 'Política de contención.',
        tag: 'Guerra Fría',
        status: 'nuevo'
      }
    ]
  },
  {
    id: 'deck-filosofia',
    title: 'Filosofía Clásica y Epistemología',
    description: 'Platón, Aristóteles, Descartes, Kant y las corrientes fundamentales del conocimiento.',
    category: 'Filosofía',
    createdAt: Date.now() - 86400000,
    cards: [
      {
        id: 'fil-1',
        front: '¿Qué ilustra el Mito de la Caverna de Platón?',
        back: 'Diferencia el mundo sensible (sombras/apariencias) del mundo inteligible de las Ideas (la Verdad iluminada por el Bien).',
        hint: 'Prisioneros atados viendo sombras proyectadas.',
        tag: 'Ontología',
        status: 'dominado'
      },
      {
        id: 'fil-2',
        front: '¿Cuál es la premisa del Método Cartesiano de Descartes?',
        back: 'Dudar sistemáticamente de todo lo que no sea evidente por sí mismo hasta hallar una certeza indubitable: "Cogito, ergo sum" (Pienso, luego existo).',
        hint: 'La duda metódica.',
        tag: 'Epistemología',
        status: 'repaso'
      },
      {
        id: 'fil-3',
        front: '¿Qué postula el Imperativo Categórico de Kant?',
        back: 'Actúa solo según aquella máxima por la cual puedas querer que al mismo tiempo se convierta en ley universal (ética deontológica).',
        hint: 'Universalidad del deber moral.',
        tag: 'Ética',
        status: 'dificil'
      }
    ]
  }
];

export const DEMO_PREBUILT_QUIZZES: QuizExam[] = [
  {
    id: 'exam-demo-ciencias',
    topic: 'Fundamentos de Biología y Bioquímica',
    difficulty: 'medio',
    createdAt: Date.now(),
    questions: [
      {
        id: 'q-1',
        question: '¿Qué organelo es responsable directo de la síntesis de proteínas en la célula?',
        options: [
          'Ribosoma',
          'Aparato de Golgi',
          'Lisosoma',
          'Centríolo'
        ],
        correctAnswerIndex: 0,
        explanation: 'Los ribosomas traducen el ARNm para ensamblar aminoácidos en cadenas polipeptídicas. El Golgi empaqueta, los lisosomas degradan desechos y los centríolos intervienen en la división celular.',
        concept: 'Organelos celulares y síntesis'
      },
      {
        id: 'q-2',
        question: 'Durante la fotosíntesis, ¿en qué fase se libera el oxígeno gaseoso (O2)?',
        options: [
          'En el ciclo de Calvin',
          'En la fase luminosa por fotólisis del agua',
          'Durante la fijación del CO2 por RuBisCO',
          'En la respiración mitocondrial nocturna'
        ],
        correctAnswerIndex: 1,
        explanation: 'En la fase luminosa, los complejos fotosintéticos disocian la molécula de agua (H2O) para extraer electrones, liberando O2 libre al medio.',
        concept: 'Fotólisis fotosintética'
      },
      {
        id: 'q-3',
        question: '¿Cuál de las siguientes biomoléculas almacena la información genética hereditaria?',
        options: [
          'Lípidos saturados',
          'Polisacáridos',
          'Ácido Desoxirribonucleico (ADN)',
          'Hemoglobina'
        ],
        correctAnswerIndex: 2,
        explanation: 'El ADN contiene las secuencias de nucleótidos que codifican las instrucciones genéticas de los organismos vivos.',
        concept: 'Genética molecular'
      },
      {
        id: 'q-4',
        question: '¿Qué proceso celular produce mayor cantidad neta de moléculas de ATP por cada glucosa degradada?',
        options: [
          'Glucólisis anaerobia',
          'Fermentación láctica',
          'Fosforilación oxidativa (Cadena transportadora de electrones)',
          'Fermentación alcohólica'
        ],
        correctAnswerIndex: 2,
        explanation: 'La fosforilación oxidativa en la membrana mitocondrial interna genera aproximadamente 26-28 ATP de los 30-32 ATP totales por glucosa en condiciones aeróbicas.',
        concept: 'Bioenergética celular'
      }
    ]
  }
];

export const DEMO_TUTOR_STARTERS = [
  {
    subject: 'Matemáticas',
    question: '¿Cómo funciona la regla de la cadena en derivadas y por qué se aplica?',
    preview: 'Cálculo y derivadas compuestas'
  },
  {
    subject: 'Física',
    question: 'Explícame la Ley de la Conservación de la Energía con un ejemplo de montaña rusa.',
    preview: 'Energía cinética y potencial'
  },
  {
    subject: 'Historia',
    question: '¿Cuáles fueron los detonantes reales de la Primera Guerra Mundial más allá del atentado de Sarajevo?',
    preview: 'Alianzas, imperialismo y armamentismo'
  },
  {
    subject: 'Programación',
    question: '¿Cuál es la diferencia entre Programación Orientada a Objetos y Programación Funcional?',
    preview: 'Paradigmas y abstracción'
  }
];
