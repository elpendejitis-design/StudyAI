import React from 'react';
import { AcademicLevel } from '../types/study';
import { GraduationCap, BookOpen, Sparkles, Check } from 'lucide-react';

interface LevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: AcademicLevel;
  onSelectLevel: (level: AcademicLevel) => void;
}

const levels: Array<{
  id: AcademicLevel;
  title: string;
  tagline: string;
  description: string;
}> = [
  {
    id: 'secundaria',
    title: 'Educación Secundaria (ESO)',
    tagline: 'Explicaciones visuales, directas y amenas',
    description: 'Enfocado en claridad conceptual, vocabulario accesible y analogías fáciles para asentar las bases.',
  },
  {
    id: 'bachillerato',
    title: 'Bachillerato & Selectividad / EvAU',
    tagline: 'Rigor académico y preparación de pruebas oficiales',
    description: 'Definiciones precisas, estructura argumentativa para exámenes de acceso y resolución formal.',
  },
  {
    id: 'universidad',
    title: 'Universidad & Educación Superior',
    tagline: 'Profundidad técnica, papers y pensamiento crítico',
    description: 'Terminología especializada, deducciones paso a paso, análisis crítico y fuentes teóricas.',
  },
  {
    id: 'autodidacta',
    title: 'Autodidacta & Oposiciones',
    tagline: 'Eficiencia y memorización estratégica',
    description: 'Enfoque práctico para profesionales y opositores: síntesis ejecutiva, nemotecnia y preguntas trampa.',
  },
];

export const LevelModal: React.FC<LevelModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onSelectLevel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl border border-white/10 max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Selecciona tu Nivel Académico</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          StudyAI ajustará automáticamente el vocabulario, la profundidad de los resúmenes y el nivel de dificultad de los exámenes según tu elección.
        </p>

        <div className="space-y-2.5">
          {levels.map((lvl) => {
            const isSelected = currentLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => {
                  onSelectLevel(lvl.id);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-sm'
                    : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{lvl.title}</span>
                    {isSelected && (
                      <span className="text-[10px] bg-indigo-500 text-white font-semibold px-2 py-0.2 rounded-full">
                        Activo
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-indigo-300">{lvl.tagline}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{lvl.description}</p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                    isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Confirmar y Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
