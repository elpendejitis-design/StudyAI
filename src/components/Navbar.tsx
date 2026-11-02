import React from 'react';
import { Menu, Zap, Sparkles, BookOpen, Flame, Sliders } from 'lucide-react';
import { AcademicLevel, ActiveModule } from '../types/study';

interface NavbarProps {
  activeModule: ActiveModule;
  academicLevel: AcademicLevel;
  onOpenLevelModal: () => void;
  demoMode: boolean;
  onToggleDemoMode: () => void;
  streakDays: number;
  studiedToday: number;
  dailyGoal: number;
  onOpenMobileSidebar: () => void;
}

const moduleTitles: Record<ActiveModule, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Panel de Estudio',
    subtitle: 'Bienvenido de nuevo a tu espacio de aprendizaje con IA',
  },
  summarizer: {
    title: 'Resumidor Estructurado',
    subtitle: 'Transforma lecturas densas en esquemas analíticos claros',
  },
  tutor: {
    title: 'Tutor IA Paso a Paso',
    subtitle: 'Aprende con método socrático, desgloses y analogías',
  },
  quiz: {
    title: 'Generador de Exámenes',
    subtitle: 'Pruebas tipo test con corrección didáctica y retroalimentación',
  },
  flashcards: {
    title: 'Flashcards de Repaso',
    subtitle: 'Memorización activa con tarjetas interactivas 3D',
  },
  library: {
    title: 'Mi Biblioteca de Estudio',
    subtitle: 'Historial de resúmenes, exámenes y mazos guardados',
  },
};

const levelLabels: Record<AcademicLevel, string> = {
  secundaria: 'Secundaria',
  bachillerato: 'Bachillerato',
  universidad: 'Universidad',
  autodidacta: 'Autodidacta',
};

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  academicLevel,
  onOpenLevelModal,
  demoMode,
  onToggleDemoMode,
  streakDays,
  studiedToday,
  dailyGoal,
  onOpenMobileSidebar,
}) => {
  const current = moduleTitles[activeModule];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-indigo-950/40 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile menu button & Module title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800/80 border border-white/5"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              {current.title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick actions & status badges */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Daily cards progress */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Meta diaria:</span>
          <span className="font-semibold text-white">
            {studiedToday}/{dailyGoal}
          </span>
          <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              style={{
                width: `${Math.min(100, Math.round((studiedToday / Math.max(1, dailyGoal)) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Academic Level button */}
        <button
          onClick={onOpenLevelModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-xs font-medium text-slate-200 transition-all hover:border-indigo-500/40"
          title="Cambiar nivel académico"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline text-slate-400">Nivel:</span>
          <span className="font-semibold text-indigo-200">{levelLabels[academicLevel]}</span>
        </button>

        {/* Demo Mode Badge / Switch */}
        <button
          onClick={onToggleDemoMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            demoMode
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
              : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20'
          }`}
          title={
            demoMode
              ? 'Modo Demo activado. Haz clic para conectar con Gemini API'
              : 'Modo IA Activo con Gemini Flash gratuito. Haz clic para activar Modo Demo'
          }
        >
          <Zap
            className={`w-3.5 h-3.5 ${
              demoMode ? 'text-amber-400 fill-amber-400' : 'text-emerald-400 fill-emerald-400'
            }`}
          />
          <span className="hidden xs:inline">
            {demoMode ? 'Modo Demo' : 'IA Conectada'}
          </span>
        </button>
      </div>
    </header>
  );
};
