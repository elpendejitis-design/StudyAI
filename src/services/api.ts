import {
  AcademicLevel,
  ApiResponse,
  FlashcardDeck,
  QuizExam,
  SummaryResult,
  TutorMessage,
  UserPreferences,
} from '../types/study';
import {
  DEMO_PREBUILT_DECKS,
  DEMO_PREBUILT_QUIZZES,
  DEMO_SUMMARY_RESULT,
} from './demoData';

const PREFERENCES_STORAGE_KEY = 'studyai_preferences_v1';
const SAVED_SUMMARIES_KEY = 'studyai_saved_summaries_v1';
const SAVED_DECKS_KEY = 'studyai_saved_decks_v1';
const QUIZ_HISTORY_KEY = 'studyai_quiz_history_v1';

// Default user preferences
export function loadUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading preferences from localStorage', e);
  }

  const todayStr = new Date().toISOString().split('T')[0];
  return {
    academicLevel: 'universidad',
    demoMode: false,
    dailyGoalCards: 15,
    studiedToday: 8,
    studyStreakDays: 3,
    lastStudyDate: todayStr,
  };
}

export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Error saving preferences to localStorage', e);
  }
}

// Saved Summaries
export function getSavedSummaries(): SummaryResult[] {
  try {
    const raw = localStorage.getItem(SAVED_SUMMARIES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading summaries', e);
  }
  return [DEMO_SUMMARY_RESULT];
}

export function saveSummaryToStorage(summary: SummaryResult): void {
  const existing = getSavedSummaries();
  const updated = [summary, ...existing.filter((s) => s.id !== summary.id)];
  localStorage.setItem(SAVED_SUMMARIES_KEY, JSON.stringify(updated.slice(0, 30)));
}

export function deleteSummaryFromStorage(id: string): void {
  const existing = getSavedSummaries();
  const updated = existing.filter((s) => s.id !== id);
  localStorage.setItem(SAVED_SUMMARIES_KEY, JSON.stringify(updated));
}

// Saved Decks
export function getSavedDecks(): FlashcardDeck[] {
  try {
    const raw = localStorage.getItem(SAVED_DECKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading decks', e);
  }
  return DEMO_PREBUILT_DECKS;
}

export function saveDeckToStorage(deck: FlashcardDeck): void {
  const existing = getSavedDecks();
  const updated = [deck, ...existing.filter((d) => d.id !== deck.id)];
  localStorage.setItem(SAVED_DECKS_KEY, JSON.stringify(updated.slice(0, 20)));
}

export function updateCardInDeck(deckId: string, cardId: string, status: 'nuevo' | 'dificil' | 'repaso' | 'dominado'): void {
  const decks = getSavedDecks();
  const deck = decks.find((d) => d.id === deckId);
  if (!deck) return;

  deck.cards = deck.cards.map((c) => (c.id === cardId ? { ...c, status, lastReviewed: Date.now() } : c));
  localStorage.setItem(SAVED_DECKS_KEY, JSON.stringify(decks));
}

// Server Health Check
export async function checkServerHealth(): Promise<{ hasApiKey: boolean; model: string }> {
  try {
    const res = await fetch('/api/study/health');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend server not responding or offline, fallback to demo mode enabled', e);
  }
  return { hasApiKey: false, model: 'demo-mode' };
}

// Summarizer API Request
export async function generateSummaryApi(params: {
  text: string;
  level: 'sintetico' | 'intermedio' | 'detallado';
  focus: string;
  academicLevel: AcademicLevel;
  forceDemo?: boolean;
}): Promise<ApiResponse<SummaryResult>> {
  if (params.forceDemo) {
    await new Promise((r) => setTimeout(r, 900));
    return {
      success: true,
      data: {
        ...DEMO_SUMMARY_RESULT,
        id: `summary-demo-${Date.now()}`,
        level: params.level,
        title: `Resumen Demo: ${params.text.slice(0, 35)}...`,
        originalTextSnippet: params.text.slice(0, 140) + '...',
        sourceLength: params.text.length,
      },
      isDemoFallback: true,
    };
  }

  try {
    const res = await fetch('/api/study/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json.error || 'Error en el servidor al generar el resumen',
        code: json.code,
        retryAfter: json.retryAfter,
      };
    }
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: 'No se pudo conectar con el servidor de IA. Puedes usar el Modo Demostración.',
      code: 'NETWORK_ERROR',
    };
  }
}

// Tutor API Request
export async function sendTutorMessageApi(params: {
  messages: Array<{ role: 'user' | 'model'; content: string }>;
  mode: string;
  subject: string;
  academicLevel: AcademicLevel;
  forceDemo?: boolean;
}): Promise<ApiResponse<TutorMessage>> {
  const lastUserMsg = params.messages[params.messages.length - 1]?.content || '';

  if (params.forceDemo) {
    await new Promise((r) => setTimeout(r, 800));
    let simulatedMarkdown = '';
    let followUps = [
      '¿Podrías darme un contraejemplo o caso límite?',
      '¿Cómo se aplica esto en un examen práctico?',
      '¿Qué relación tiene con el tema anterior?',
    ];

    if (params.mode === 'socratico') {
      simulatedMarkdown = `### 💡 Guía Socrática de Reflexión\n\n¡Excelente planteamiento sobre **"${lastUserMsg.slice(0, 40)}"**!\n\nAntes de revelarte la respuesta completa, permíteme hacerte una pregunta clave:\n\n1. **¿Qué variable o factor inicial crees que cambiaría primero** si aumentamos la fuerza o la magnitud en este escenario?\n2. Observa la relación causa-efecto: ¿sucede de forma proporcional o inversa?\n\n*Piénsalo un instante y dime qué intuyes; a partir de tu idea construiremos la demostración.*`;
    } else if (params.mode === 'analogia') {
      simulatedMarkdown = `### 🌟 Analogía Intuitiva\n\nImagina que **"${lastUserMsg.slice(0, 35)}"** es como un **sistema de correos postales de una ciudad concurrida**:\n\n- Cada mensaje representa un paquete que viaja por carreteras con un límite de velocidad fijo.\n- Si la oficina central (el núcleo) no organiza las rutas, se satura el tráfico.\n- Por eso, la naturaleza utiliza mecanismos de compresión y canales prioritarios.\n\n> **En resumen:** La regla fundamental es minimizar el gasto de energía manteniendo la señal intacta. ¿Tiene sentido esta comparación?`;
    } else {
      simulatedMarkdown = `### 📘 Explicación Didáctica Paso a Paso\n\nAbordemos **"${lastUserMsg.slice(0, 40)}"** de manera estructurada:\n\n#### Paso 1: Definición Fundamental\nIdentificamos las propiedades iniciales y el marco teórico que rige este fenómeno.\n\n#### Paso 2: Análisis del Proceso\nCuando interactúan los elementos, la transferencia de energía o información se produce siguiendo leyes de conservación bien delimitadas.\n\n#### Paso 3: Aplicación Práctica\nEn situaciones reales de examen o investigación, se suele calcular despejando la incógnita principal y comprobando las unidades.\n\n✅ **Punto clave a recordar:** Nunca olvides verificar las condiciones de contorno antes de dar por válido el resultado.`;
    }

    return {
      success: true,
      data: {
        id: `tutor-sim-${Date.now()}`,
        role: 'model',
        content: simulatedMarkdown,
        timestamp: Date.now(),
        suggestedFollowUps: followUps,
      },
      isDemoFallback: true,
    };
  }

  try {
    const res = await fetch('/api/study/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json.error || 'Error en el servidor del Tutor IA',
        code: json.code,
        retryAfter: json.retryAfter,
      };
    }
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: 'No se pudo conectar con el Tutor IA. Puedes activar el Modo Demostración.',
      code: 'NETWORK_ERROR',
    };
  }
}

// Quiz API Request
export async function generateQuizApi(params: {
  topic: string;
  textContext?: string;
  questionCount: number;
  difficulty: 'facil' | 'medio' | 'dificil';
  academicLevel: AcademicLevel;
  forceDemo?: boolean;
}): Promise<ApiResponse<QuizExam>> {
  if (params.forceDemo) {
    await new Promise((r) => setTimeout(r, 900));
    return {
      success: true,
      data: {
        ...DEMO_PREBUILT_QUIZZES[0],
        id: `exam-demo-${Date.now()}`,
        topic: params.topic || 'Examen de Demostración',
        difficulty: params.difficulty,
        createdAt: Date.now(),
      },
      isDemoFallback: true,
    };
  }

  try {
    const res = await fetch('/api/study/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json.error || 'Error al generar el examen',
        code: json.code,
        retryAfter: json.retryAfter,
      };
    }
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: 'Error de conexión con el generador de exámenes. Prueba en Modo Demostración.',
      code: 'NETWORK_ERROR',
    };
  }
}

// Flashcards API Request
export async function generateFlashcardsApi(params: {
  topic: string;
  textContext?: string;
  count: number;
  academicLevel: AcademicLevel;
  forceDemo?: boolean;
}): Promise<ApiResponse<FlashcardDeck>> {
  if (params.forceDemo) {
    await new Promise((r) => setTimeout(r, 900));
    const sampleCards = DEMO_PREBUILT_DECKS[0].cards.slice(0, params.count);
    return {
      success: true,
      data: {
        id: `deck-demo-${Date.now()}`,
        title: `Mazo Demo: ${params.topic || 'Biología y Métodos'}`,
        description: `Mazo interactivo de demostración con ${sampleCards.length} tarjetas.`,
        category: 'Ciencias y Metodología',
        cards: sampleCards,
        createdAt: Date.now(),
      },
      isDemoFallback: true,
    };
  }

  try {
    const res = await fetch('/api/study/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json.error || 'Error al generar las flashcards',
        code: json.code,
        retryAfter: json.retryAfter,
      };
    }
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: 'Error de conexión al generar flashcards. Prueba en Modo Demostración.',
      code: 'NETWORK_ERROR',
    };
  }
}
