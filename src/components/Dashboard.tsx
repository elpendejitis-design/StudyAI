import React from 'react';
import {
  FileText,
  BotMessageSquare,
  GraduationCap,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  CheckCircle,
  Clock,
  BookOpen,
  Zap,
} from 'lucide-react';
import { AcademicLevel, ActiveModule, SummaryResult } from '../types/study';
import { SAMPLE_TEXTS } from '../services/demoData';

interface DashboardProps {
  onNavigate: (module: ActiveModule) => void;
  academicLevel: AcademicLevel;
  onOpenLevelModal: () => void;
  recentSummaries: SummaryResult[];
  decksCount: number;
  totalCards: number;
  onSelectQuickTopic: (topic: string, sampleText?: string, targetModule?: ActiveModule) => void;
  demoMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  academicLevel,
  onOpenLevelModal,
  recentSummaries,
  decksCount,
  totalCards,
  onSelectQuickTopic,
  demoMode,
}) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/20 p-6 md:p-8 shadow-2xl shadow-indigo-950/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-64 h-64 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Plataforma de Alto Rendimiento para Estudiantes</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Aprende de forma estructurada, retén mejor y supera tus exámenes con IA.
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              StudyAI sintetiza lecturas densas, te explica dudas con pedagogía paso a paso, evalúa tu comprensión con exámenes personalizados y refuerza tu memoria con flashcards.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => onNavigate('summarizer')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:from-indigo-400 hover:to-violet-500 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Resumir un texto ahora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('tutor')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-white/10 font-semibold text-sm transition-all cursor-pointer"
            >
              <BotMessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Preguntar duda al Tutor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 rounded-2xl p-4 md:p-5 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Resúmenes Creados</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {recentSummaries.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">100%</span> estructurados
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-2xl p-4 md:p-5 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Flashcards en Mazos</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {totalCards}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>En {decksCount} mazos activos</span>
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-2xl p-4 md:p-5 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Precisión de Examen</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">85%</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Promedio Notable
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-2xl p-4 md:p-5 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">IA & Nivel Gratuito</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-white tracking-tight truncate">
            {demoMode ? 'Modo Demo' : 'Gemini Flash'}
          </div>
          <div className="text-[11px] text-indigo-300 mt-1 flex items-center gap-1">
            <span>Sin coste de uso</span>
          </div>
        </div>
      </div>

      {/* 4 Main Module Feature Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            Módulos de Aprendizaje
          </h3>
          <span className="text-xs text-slate-400">Selecciona una herramienta</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Resumidor */}
          <div
            onClick={() => onNavigate('summarizer')}
            className="group relative bg-slate-900/70 hover:bg-slate-800/80 rounded-2xl p-6 border border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer shadow-lg hover:shadow-indigo-950/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Módulo 1
                </span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                Resumidor de Textos Estructurado
              </h4>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                Pega apuntes, capítulos o papers. Genera un resumen ejecutivo, glosario de términos clave, secciones jerárquicas y preguntas de reflexión listas para estudiar.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
              <span>Entrar al Resumidor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Tutor IA */}
          <div
            onClick={() => onNavigate('tutor')}
            className="group relative bg-slate-900/70 hover:bg-slate-800/80 rounded-2xl p-6 border border-white/5 hover:border-violet-500/40 transition-all cursor-pointer shadow-lg hover:shadow-violet-950/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                  <BotMessageSquare className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  Módulo 2
                </span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors mb-2">
                Tutor con IA Paso a Paso
              </h4>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                Aprende conceptos difíciles con metodología socrática guiada, desgloses analíticos paso a paso, analogías didácticas y resolución asistida de ejercicios.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-violet-400 group-hover:text-violet-300">
              <span>Iniciar Sesión de Tutoría</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Exámenes */}
          <div
            onClick={() => onNavigate('quiz')}
            className="group relative bg-slate-900/70 hover:bg-slate-800/80 rounded-2xl p-6 border border-white/5 hover:border-blue-500/40 transition-all cursor-pointer shadow-lg hover:shadow-blue-950/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Módulo 3
                </span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors mb-2">
                Generador de Exámenes de Opción Múltiple
              </h4>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                Evalúa tu nivel con tests interactivos de 4 opciones. Incluye corrección instantánea, retroalimentación exhaustiva de cada respuesta y puntuación académica.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
              <span>Crear Simulacro de Examen</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Flashcards */}
          <div
            onClick={() => onNavigate('flashcards')}
            className="group relative bg-slate-900/70 hover:bg-slate-800/80 rounded-2xl p-6 border border-white/5 hover:border-purple-500/40 transition-all cursor-pointer shadow-lg hover:shadow-purple-950/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Módulo 4
                </span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
                Flashcards Interactivas 3D
              </h4>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                Repaso espaciado con tarjetas giratorias en 3D. Clasifica conceptos en Difícil, Duda o Dominado para afianzar datos y definiciones clave a largo plazo.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300">
              <span>Practicar Flashcards</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Study Samples */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Temas de Prueba Rápida
            </h3>
            <p className="text-xs text-slate-400">
              Prueba al instante cualquier módulo con textos académicos de muestra listos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_TEXTS.map((sample, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 rounded-xl p-4 border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-medium">
                    {sample.category}
                  </span>
                  <span className="text-slate-400 text-[11px]">~800 palabras</span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1.5">{sample.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {sample.text}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                <button
                  onClick={() => onSelectQuickTopic(sample.title, sample.text, 'summarizer')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-medium text-center transition-colors cursor-pointer"
                >
                  Resumir
                </button>
                <button
                  onClick={() => onSelectQuickTopic(sample.title, sample.text, 'quiz')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-xs font-medium text-center transition-colors cursor-pointer"
                >
                  Hacer Test
                </button>
                <button
                  onClick={() => onSelectQuickTopic(sample.title, sample.text, 'flashcards')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-medium text-center transition-colors cursor-pointer"
                >
                  Tarjetas
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
