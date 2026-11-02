import React, { useState } from 'react';
import {
  BookmarkCheck,
  FileText,
  Trash2,
  Copy,
  Check,
  Download,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SummaryResult, FlashcardDeck } from '../types/study';
import { deleteSummaryFromStorage } from '../services/api';

interface SavedLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaries: SummaryResult[];
  onSummariesUpdated: () => void;
  decks: FlashcardDeck[];
  onOpenSummary: (summary: SummaryResult) => void;
  onOpenDeck: (deckId: string) => void;
}

export const SavedLibraryModal: React.FC<SavedLibraryModalProps> = ({
  isOpen,
  onClose,
  summaries,
  onSummariesUpdated,
  decks,
  onOpenSummary,
  onOpenDeck,
}) => {
  const [activeTab, setActiveTab] = useState<'summaries' | 'decks'>('summaries');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeleteSummary = (id: string) => {
    deleteSummaryFromStorage(id);
    onSummariesUpdated();
  };

  const handleCopyMarkdown = (summary: SummaryResult) => {
    const md = `# ${summary.title}\n\n${summary.executiveSummary}\n\n## Glosario\n${summary.keyConcepts.map((k) => `- ${k.term}: ${k.definition}`).join('\n')}`;
    navigator.clipboard.writeText(md);
    setCopiedId(summary.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      summaries,
      decks,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyAI_Respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl border border-white/10 max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Mi Biblioteca de Estudio</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
              title="Descargar copia de seguridad en JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('summaries')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'summaries'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950/50 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resúmenes Guardados ({summaries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('decks')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'decks'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-950/50 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mazos de Flashcards ({decks.length})</span>
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === 'summaries' && (
            <>
              {summaries.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No tienes resúmenes guardados aún. Genera un resumen y pulsa "Guardar".
                </div>
              ) : (
                summaries.map((summary) => (
                  <div
                    key={summary.id}
                    className="bg-slate-950/60 rounded-xl p-4 border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300">
                          {summary.level}
                        </span>
                        <h4 className="text-sm font-bold text-white">{summary.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {summary.executiveSummary}
                      </p>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(summary.timestamp).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyMarkdown(summary)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                        title="Copiar markdown"
                      >
                        {copiedId === summary.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => {
                          onOpenSummary(summary);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Abrir</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleDeleteSummary(summary.id)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors"
                        title="Eliminar resumen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'decks' && (
            <div className="space-y-3">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  className="bg-slate-950/60 rounded-xl p-4 border border-white/5 hover:border-purple-500/30 transition-all flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        {deck.category}
                      </span>
                      <h4 className="text-sm font-bold text-white">{deck.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{deck.description}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {deck.cards.length} tarjetas de estudio
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onOpenDeck(deck.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <span>Estudiar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
