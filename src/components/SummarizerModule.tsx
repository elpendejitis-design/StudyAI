import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Layers,
  GraduationCap,
  AlertCircle,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Download,
  Info,
} from 'lucide-react';
import { AcademicLevel, SummaryResult } from '../types/study';
import { SAMPLE_TEXTS } from '../services/demoData';
import { generateSummaryApi, saveSummaryToStorage } from '../services/api';

interface SummarizerModuleProps {
  academicLevel: AcademicLevel;
  demoMode: boolean;
  initialText?: string;
  initialTopic?: string;
  onNavigateToQuizWithText: (text: string, topic: string) => void;
  onNavigateToFlashcardsWithText: (text: string, topic: string) => void;
  onSummarySavedNotification: () => void;
}

export const SummarizerModule: React.FC<SummarizerModuleProps> = ({
  academicLevel,
  demoMode,
  initialText = '',
  initialTopic = '',
  onNavigateToQuizWithText,
  onNavigateToFlashcardsWithText,
  onSummarySavedNotification,
}) => {
  const [inputText, setInputText] = useState<string>(initialText);
  const [summaryLevel, setSummaryLevel] = useState<'sintetico' | 'intermedio' | 'detallado'>('intermedio');
  const [focusArea, setFocusArea] = useState<string>('Conceptos clave y aplicaciones');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const MAX_CHARS = 15000;
  const currentChars = inputText.length;
  const isOverLimit = currentChars > MAX_CHARS;

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setErrorMsg('Por favor ingresa o pega un texto para resumir.');
      return;
    }
    if (isOverLimit) {
      setErrorMsg(`El texto excede el límite máximo de ${MAX_CHARS.toLocaleString()} caracteres.`);
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    setSaved(false);

    const resp = await generateSummaryApi({
      text: inputText,
      level: summaryLevel,
      focus: focusArea,
      academicLevel,
      forceDemo: demoMode,
    });

    setIsLoading(false);

    if (resp.success && resp.data) {
      setResult(resp.data);
      // Automatically open all sections
      const sectionsMap: Record<number, boolean> = {};
      resp.data.structuredSections.forEach((_, idx) => {
        sectionsMap[idx] = true;
      });
      setOpenSections(sectionsMap);
    } else {
      setErrorMsg(resp.error || 'No se pudo generar el resumen estructurado.');
    }
  };

  const handleCopyMarkdown = () => {
    if (!result) return;
    const md = `# ${result.title}
*Resumen estructurado por StudyAI - Nivel: ${academicLevel}*

## Resumen Ejecutivo
${result.executiveSummary}

## Glosario de Conceptos Clave
${result.keyConcepts.map((k) => `- **${k.term}** (${k.importance}): ${k.definition}`).join('\n')}

## Puntos Estructurados
${result.structuredSections
  .map((s) => `### ${s.heading}\n${s.points.map((p) => `- ${p}`).join('\n')}`)
  .join('\n\n')}

## Conclusiones
${result.conclusions.map((c) => `- ${c}`).join('\n')}

## Preguntas de Autoevaluación
${result.reflectionQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSummary = () => {
    if (!result) return;
    saveSummaryToStorage(result);
    setSaved(true);
    onSummarySavedNotification();
  };

  const toggleSection = (idx: number) => {
    setOpenSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleLoadSample = (sample: typeof SAMPLE_TEXTS[0]) => {
    setInputText(sample.text);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/5 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Resumidor de Textos Estructurado
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Convierte lecturas extensas en síntesis analíticas con glosario, jerarquía y preguntas de examen.
          </p>
        </div>

        {/* Quick sample chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium">Cargar muestra:</span>
          {SAMPLE_TEXTS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadSample(s)}
              className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-colors"
            >
              {s.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input Form vs Output Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/70 rounded-2xl p-5 border border-white/5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Texto de estudio o apuntes
                </label>
                <div
                  className={`text-[11px] font-mono ${
                    isOverLimit ? 'text-rose-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {currentChars.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pega aquí el contenido de un artículo, tema de examen, transcripción de clase o libro para analizarlo y estructurarlo..."
                rows={9}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3.5 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none font-sans"
              />
            </div>

            {/* Depth Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Nivel de Profundidad
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'sintetico', label: 'Sintético', desc: 'Directo al grano' },
                    { id: 'intermedio', label: 'Equilibrado', desc: 'Balance ideal' },
                    { id: 'detallado', label: 'Detallado', desc: 'Profundo' },
                  ] as const
                ).map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSummaryLevel(lvl.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      summaryLevel === lvl.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-xs'
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-semibold">{lvl.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Area */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Enfoque Analítico
              </label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Conceptos clave y aplicaciones">Conceptos clave y aplicaciones prácticas</option>
                <option value="Causa, desarrollo y consecuencias">Relación causa-efecto y cronología</option>
                <option value="Preparación de examen tipo test">Enfoque para examen y memorización</option>
                <option value="Fórmulas y resolución teórica">Teoría profunda y principios</option>
              </select>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSummarize}
                disabled={isLoading || !inputText.trim() || isOverLimit}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Estructurando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generar Resumen Estructurado</span>
                  </>
                )}
              </button>

              {inputText && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setResult(null);
                    setErrorMsg(null);
                  }}
                  className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-white/5 transition-colors"
                  title="Limpiar texto"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>Límite seguro: 15,000 caracteres</span>
              {demoMode && (
                <span className="text-amber-400 font-medium">Modo Demo (Sin API)</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Structured Output (7 cols on desktop) */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-slate-900/70 rounded-2xl p-6 border border-white/5 space-y-6">
              {/* Header Title & Actions */}
              <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Resumen Académico ({result.level})
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1.5">{result.title}</h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleCopyMarkdown}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 text-xs flex items-center gap-1.5 transition-colors"
                    title="Copiar en formato Markdown"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={handleSaveSummary}
                    disabled={saved}
                    className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                      saved
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/30 text-indigo-300'
                    }`}
                    title="Guardar en Mi Biblioteca"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{saved ? 'Guardado' : 'Guardar'}</span>
                  </button>
                </div>
              </div>

              {/* 1. Executive Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  Síntesis Ejecutiva
                </h4>
                <div className="bg-slate-950/60 rounded-xl p-4 border border-white/5 text-sm text-slate-200 leading-relaxed">
                  {result.executiveSummary}
                </div>
              </div>

              {/* 2. Key Concepts Glossary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Glosario de Conceptos Clave
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {result.keyConcepts.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/50 rounded-xl p-3 border border-white/5 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{item.term}</span>
                        <span
                          className={`text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                            item.importance === 'alta'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {item.importance}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Structured Sections */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
                  Desglose Jerárquico de Temas
                </h4>
                <div className="space-y-2.5">
                  {result.structuredSections.map((sec, idx) => {
                    const isOpen = Boolean(openSections[idx]);
                    return (
                      <div
                        key={idx}
                        className="bg-slate-950/50 rounded-xl border border-white/5 overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSection(idx)}
                          className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                          <span className="text-xs font-bold text-slate-200">{sec.heading}</span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-3.5 pt-1 space-y-1.5 border-t border-white/5">
                            {sec.points.map((point, pIdx) => (
                              <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                                <span className="leading-relaxed">{point}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Reflection Questions */}
              {result.reflectionQuestions && result.reflectionQuestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                    Preguntas de Reflexión y Autoevaluación
                  </h4>
                  <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
                    {result.reflectionQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="flex items-start gap-2 text-xs text-emerald-200">
                        <span className="font-bold text-emerald-400">{qIdx + 1}.</span>
                        <span className="leading-relaxed">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cross-Module Integration Actions */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/40 -mx-6 -mb-6 p-4 rounded-b-2xl">
                <span className="text-xs text-slate-400">¿Qué deseas hacer con este contenido?</span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() =>
                      onNavigateToQuizWithText(result.executiveSummary, result.title)
                    }
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Crear Examen</span>
                  </button>

                  <button
                    onClick={() =>
                      onNavigateToFlashcardsWithText(result.executiveSummary, result.title)
                    }
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Crear Flashcards</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-slate-900/40 rounded-2xl p-10 border border-dashed border-white/10 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Ningún resumen generado todavía
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
                Pega tu texto a la izquierda o selecciona uno de los ejemplos predefinidos para generar un desglose pedagógico estructurado con IA.
              </p>
              <button
                onClick={() => handleLoadSample(SAMPLE_TEXTS[0])}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 border border-indigo-500/20 transition-colors"
              >
                Cargar texto de muestra: Biología
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
