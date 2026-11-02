import React from 'react';
import {
  LayoutDashboard,
  FileText,
  BotMessageSquare,
  GraduationCap,
  Layers,
  BookmarkCheck,
  Sparkles,
  Zap,
  Flame,
  CheckCircle2,
  Sliders,
  X,
} from 'lucide-react';
import { AcademicLevel, ActiveModule } from '../types/study';

interface SidebarProps {
  activeModule: ActiveModule;
  setActiveModule: (m: ActiveModule) => void;
  academicLevel: AcademicLevel;
  onOpenLevelModal: () => void;
  demoMode: boolean;
  onToggleDemoMode: () => void;
  streakDays: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const levelLabels: Record<AcademicLevel, string> = {
  secundaria: 'Secundaria',
  bachillerato: 'Bachillerato',
  universidad: 'Universidad',
  autodidacta: 'Autodidacta',
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  academicLevel,
  onOpenLevelModal,
  demoMode,
  onToggleDemoMode,
  streakDays,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveModule,
      label: 'Panel Principal',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'summarizer' as ActiveModule,
      label: 'Resumidor IA',
      icon: FileText,
      badge: 'Estructurado',
    },
    {
      id: 'tutor' as ActiveModule,
      label: 'Tutor Paso a Paso',
      icon: BotMessageSquare,
      badge: 'Socrático',
    },
    {
      id: 'quiz' as ActiveModule,
      label: 'Exámenes & Tests',
      icon: GraduationCap,
      badge: 'Corrección',
    },
    {
      id: 'flashcards' as ActiveModule,
      label: 'Flashcards',
      icon: Layers,
      badge: 'Repaso 3D',
    },
    {
      id: 'library' as ActiveModule,
      label: 'Mi Biblioteca',
      icon: BookmarkCheck,
      badge: undefined,
    },
  ];

  const handleNavClick = (id: ActiveModule) => {
    setActiveModule(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900/95 border-r border-indigo-950/50 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-violet-400 rounded-full animate-ping opacity-75" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                  StudyAI
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Edu
                </span>
              </div>
              <p className="text-xs text-slate-400">Plataforma Inteligente</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Academic Level & Streak Banner */}
        <div className="px-4 pt-4 pb-2">
          <div className="bg-slate-950/60 rounded-xl p-3 border border-white/5 flex items-center justify-between">
            <button
              onClick={onOpenLevelModal}
              className="flex items-center gap-2 text-left group transition-all"
              title="Cambiar nivel de estudio"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/25">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Nivel actual</span>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {levelLabels[academicLevel]}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold" title="Racha de estudio diario">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>{streakDays}d</span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Módulos de Estudio
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Demo Mode Toggle & Footer */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {/* Demo Mode Card */}
          <div className="bg-slate-950/70 rounded-xl p-3 border border-indigo-900/30">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Zap
                  className={`w-4 h-4 ${demoMode ? 'text-amber-400 fill-amber-400' : 'text-emerald-400'}`}
                />
                <span className="text-xs font-semibold text-slate-200">
                  {demoMode ? 'Modo Demostración' : 'Modo IA Activo'}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={demoMode}
                onClick={onToggleDemoMode}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  demoMode ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    demoMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {demoMode
                ? 'Probando interfaz sin consumir cuota de API con datos didácticos simulados.'
                : 'Conectado a Gemini Flash (Gratuito). No requiere facturación.'}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>StudyAI v1.0</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Privado & Seguro
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
