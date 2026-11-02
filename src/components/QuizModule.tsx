import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Award,
  ChevronRight,
  HelpCircle,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { AcademicLevel, QuizExam, QuizQuestion } from '../types/study';
import { DEMO_PREBUILT_QUIZZES } from '../services/demoData';
import { generateQuizApi } from '../services/api';

interface QuizModuleProps {
  academicLevel: AcademicLevel;
  demoMode: boolean;
  initialTopic?: string;
  initialTextContext?: string;
  onNavigateToFlashcardsWithText?: (text: string, topic: string) => void;
  onQuizCompletedNotification?: (scorePercent: number) => void;
}

export const QuizModule: React.FC<QuizModuleProps> = ({
  academicLevel,
  demoMode,
  initialTopic = '',
  initialTextContext = '',
  onNavigateToFlashcardsWithText,
  onQuizCompletedNotification,
}) => {
  const [topic, setTopic] = useState<string>(initialTopic);
  const [textContext, setTextContext] = useState<string>(initialTextContext);
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active exam state
  const [activeExam, setActiveExam] = useState<QuizExam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const optionLetters = ['A', 'B', 'C', 'D'];

  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');

  const handleGenerateExam = async () => {
    if (!topic.trim() && !textContext.trim()) {
      setErrorMsg('Por favor especifica un tema o pega un texto de estudio.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const resp = await generateQuizApi({
        topic: topic || 'Conceptos de Estudio',
        textContext: textContext || undefined,
        questionCount,
        difficulty,
        academicLevel,
        model: selectedModel,
        forceDemo: demoMode,
      });

      if (resp.success && resp.data) {
        setActiveExam(resp.data);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setRevealedAnswers({});
        setIsCompleted(false);
      } else {
        setErrorMsg(resp.error || 'No se pudo generar el examen.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error inesperado al generar el examen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPrebuilt = () => {
    const demo = DEMO_PREBUILT_QUIZZES[0];
    setActiveExam(demo);
    setTopic(demo.topic);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setRevealedAnswers({});
    setIsCompleted(false);
    setErrorMsg(null);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isCompleted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleCheckCurrentAnswer = () => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: true,
    }));
  };

  const handleNextQuestion = () => {
    if (!activeExam) return;
    if (currentQuestionIndex < activeExam.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finishExam();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const finishExam = () => {
    if (!activeExam) return;
    // Reveal all explanations
    const allRevealed: Record<number, boolean> = {};
    activeExam.questions.forEach((_, idx) => {
      allRevealed[idx] = true;
    });
    setRevealedAnswers(allRevealed);
    setIsCompleted(true);

    const correctCount = calculateCorrectCount();
    const scorePct = Math.round((correctCount / activeExam.questions.length) * 100);
    if (onQuizCompletedNotification) {
      onQuizCompletedNotification(scorePct);
    }
  };

  const calculateCorrectCount = () => {
    if (!activeExam) return 0;
    return activeExam.questions.reduce((acc, q, idx) => {
      const userAns = selectedAnswers[idx];
      return userAns === q.correctAnswerIndex ? acc + 1 : acc;
    }, 0);
  };

  const handleReset = () => {
    setActiveExam(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setRevealedAnswers({});
    setIsCompleted(false);
    setErrorMsg(null);
  };

  const currentQ: QuizQuestion | undefined = activeExam?.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
  const isCurrentRevealed = revealedAnswers[currentQuestionIndex];
  const correctCount = calculateCorrectCount();
  const totalQuestions = activeExam?.questions.length || 0;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/5 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            Generador de Exámenes de Opción Múltiple
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pon a prueba tu retención con evaluaciones objetivas de 4 alternativas y corrección razonada.
          </p>
        </div>

        {!activeExam && (
          <button
            onClick={handleLoadPrebuilt}
            className="text-xs px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-colors font-medium self-start md:self-auto cursor-pointer"
          >
            Cargar examen demo de Biología
          </button>
        )}
      </div>

      {/* 1. Exam Configuration Screen */}
      {!activeExam && (
        <div className="bg-slate-900/70 rounded-2xl p-6 border border-white/5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Tema del Examen o Asignatura
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej. Termodinámica, Guerra Fría, Reacciones redox, Genética..."
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Número de Preguntas
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-blue-500"
                >
                  <option value={3}>3 preguntas (Rápido)</option>
                  <option value={4}>4 preguntas (Estándar)</option>
                  <option value={6}>6 preguntas (Completo)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Dificultad
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="facil">Fácil (Conceptos clave)</option>
                  <option value="medio">Intermedio (Aplicación)</option>
                  <option value="dificil">Difícil (Análisis fino)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Modelo IA (Nivel Gratuito)
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-blue-500 font-medium"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Recomendado)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Alta disp.)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              (Opcional) Texto o apuntes específicos para basar las preguntas
            </label>
            <textarea
              value={textContext}
              onChange={(e) => setTextContext(e.target.value)}
              placeholder="Si dejas este campo vacío, la IA generará preguntas sobre el tema indicado arriba con su base de conocimiento pedagógico..."
              rows={4}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 resize-none"
            />
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed flex-1">{errorMsg}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGenerateExam}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/30 hover:bg-rose-500/40 text-rose-100 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reintentar ahora</span>
                </button>
                {selectedModel === 'gemini-3.8-flash' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModel('gemini-3.1-flash-lite');
                      setTimeout(() => handleGenerateExam(), 50);
                    }}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 font-semibold transition-colors cursor-pointer"
                  >
                    Probar con Flash Lite
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Evaluación para nivel <strong className="text-slate-200 capitalize">{academicLevel}</strong>
            </span>

            <button
              onClick={handleGenerateExam}
              disabled={isLoading || (!topic.trim() && !textContext.trim())}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generando Examen con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Comenzar Examen</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 2. Active Exam Screen (While taking or reviewing) */}
      {activeExam && !isCompleted && currentQ && (
        <div className="space-y-4">
          {/* Progress Header */}
          <div className="bg-slate-900/70 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Pregunta {currentQuestionIndex + 1} de {totalQuestions}
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-300 font-medium truncate max-w-xs">
                {activeExam.topic}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
              style={{
                width: `${Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%`,
              }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-slate-900/80 rounded-2xl p-6 border border-white/5 space-y-6">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-semibold uppercase tracking-wider mb-2">
                Concepto: {currentQ.concept}
              </div>
              <h3 className="text-base md:text-lg font-bold text-white leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                const isCorrect = currentQ.correctAnswerIndex === optIdx;

                let cardStyle = 'bg-slate-950/60 border-white/10 hover:border-blue-500/40 text-slate-200';
                let letterBadge = 'bg-slate-800 text-slate-300 border-white/10';

                if (isCurrentRevealed) {
                  if (isCorrect) {
                    cardStyle = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-100';
                    letterBadge = 'bg-emerald-500 text-white border-emerald-400';
                  } else if (isSelected && !isCorrect) {
                    cardStyle = 'bg-rose-950/40 border-rose-500/60 text-rose-100';
                    letterBadge = 'bg-rose-500 text-white border-rose-400';
                  } else {
                    cardStyle = 'opacity-50 bg-slate-950/40 border-white/5 text-slate-400';
                  }
                } else if (isSelected) {
                  cardStyle = 'bg-blue-600/20 border-blue-500 text-white shadow-xs';
                  letterBadge = 'bg-blue-500 text-white border-blue-400';
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isCurrentRevealed}
                    className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${cardStyle}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${letterBadge}`}
                    >
                      {optionLetters[optIdx]}
                    </div>
                    <span className="text-sm leading-relaxed flex-1">{option}</span>
                    {isCurrentRevealed && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {isCurrentRevealed && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Real-time Pedagogical Explanation (when checked) */}
            {isCurrentRevealed && (
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                  selectedAnswers[currentQuestionIndex] === currentQ.correctAnswerIndex
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-950/20 border-rose-500/30 text-slate-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>Explicación didáctica y justificación:</span>
                </div>
                <p className="text-slate-300">{currentQ.explanation}</p>
              </div>
            )}

            {/* Bottom Question Controls */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 text-xs font-semibold transition-colors"
              >
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {!isCurrentRevealed && isAnswered && (
                  <button
                    type="button"
                    onClick={handleCheckCurrentAnswer}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Verificar respuesta
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={!isAnswered}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>
                    {currentQuestionIndex === totalQuestions - 1
                      ? 'Finalizar Examen'
                      : 'Siguiente'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Final Results & Review Screen */}
      {activeExam && isCompleted && (
        <div className="bg-slate-900/80 rounded-2xl p-6 md:p-8 border border-white/5 space-y-6">
          {/* Top Score Badge */}
          <div className="text-center max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-600/30">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Resultado de la Evaluación
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                {scorePercent >= 90
                  ? '¡Sobresaliente! 🏆'
                  : scorePercent >= 70
                  ? '¡Notable progreso! 🌟'
                  : scorePercent >= 50
                  ? 'Aprobado con margen de mejora 📘'
                  : 'Requiere repaso activo 💡'}
              </h3>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-white/10">
                <span className="text-xs text-slate-400 block">Puntuación</span>
                <span className="text-xl font-bold text-white">
                  {scorePercent}%
                </span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-white/10">
                <span className="text-xs text-slate-400 block">Aciertos</span>
                <span className="text-xl font-bold text-emerald-400">
                  {correctCount} / {totalQuestions}
                </span>
              </div>
            </div>
          </div>

          {/* Question-by-Question Review */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Revisión Detallada de Preguntas y Explicaciones
            </h4>

            <div className="space-y-4">
              {activeExam.questions.map((q, idx) => {
                const userChoice = selectedAnswers[idx];
                const isCorrect = userChoice === q.correctAnswerIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border ${
                      isCorrect
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-bold text-white">
                        {idx + 1}. {q.question}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isCorrect ? 'Correcta' : 'Incorrecta'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1 my-2">
                      <div>
                        <strong className="text-slate-400">Tu respuesta:</strong>{' '}
                        {userChoice !== undefined ? (
                          <span className={isCorrect ? 'text-emerald-300 font-semibold' : 'text-rose-300 font-semibold'}>
                            {optionLetters[userChoice]}) {q.options[userChoice]}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No respondida</span>
                        )}
                      </div>
                      {!isCorrect && (
                        <div>
                          <strong className="text-slate-400">Respuesta correcta:</strong>{' '}
                          <span className="text-emerald-300 font-semibold">
                            {optionLetters[q.correctAnswerIndex]}) {q.options[q.correctAnswerIndex]}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg">
                      <strong className="text-blue-300 block mb-0.5">¿Por qué es así?</strong>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Hacer otro examen</span>
            </button>

            {onNavigateToFlashcardsWithText && (
              <button
                onClick={() =>
                  onNavigateToFlashcardsWithText(
                    `Conceptos clave del examen sobre ${activeExam.topic}: ${activeExam.questions.map((q) => q.concept).join(', ')}`,
                    activeExam.topic
                  )
                }
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Reforzar conceptos con Flashcards</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
