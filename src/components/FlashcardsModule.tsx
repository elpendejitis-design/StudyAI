import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Rotate3d,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  Shuffle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Trash2,
  Flame,
  Award,
} from 'lucide-react';
import { AcademicLevel, Flashcard, FlashcardDeck } from '../types/study';
import { generateFlashcardsApi, saveDeckToStorage, updateCardInDeck } from '../services/api';

interface FlashcardsModuleProps {
  decks: FlashcardDeck[];
  onDecksUpdated: (decks: FlashcardDeck[]) => void;
  academicLevel: AcademicLevel;
  demoMode: boolean;
  initialTopic?: string;
  initialTextContext?: string;
  onCardReviewedNotification?: () => void;
}

export const FlashcardsModule: React.FC<FlashcardsModuleProps> = ({
  decks,
  onDecksUpdated,
  academicLevel,
  demoMode,
  initialTopic = '',
  initialTextContext = '',
  onCardReviewedNotification,
}) => {
  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || '');
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [newTopic, setNewTopic] = useState<string>(initialTopic);
  const [newTextContext, setNewTextContext] = useState<string>(initialTextContext);
  const [cardCount, setCardCount] = useState<number>(5);
  const [showNewDeckModal, setShowNewDeckModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentDeck = decks.find((d) => d.id === selectedDeckId) || decks[0];
  const currentCard: Flashcard | undefined = currentDeck?.cards[currentCardIndex];
  const totalCards = currentDeck?.cards.length || 0;

  // Calculate mastery
  const masteredCount = currentDeck?.cards.filter((c) => c.status === 'dominado').length || 0;
  const masteryPercentage = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleRateCard = (status: 'dificil' | 'repaso' | 'dominado') => {
    if (!currentDeck || !currentCard) return;

    updateCardInDeck(currentDeck.id, currentCard.id, status);

    // Update in local state
    const updatedDecks = decks.map((d) => {
      if (d.id === currentDeck.id) {
        return {
          ...d,
          cards: d.cards.map((c) => (c.id === currentCard.id ? { ...c, status, lastReviewed: Date.now() } : c)),
        };
      }
      return d;
    });

    onDecksUpdated(updatedDecks);
    if (onCardReviewedNotification) {
      onCardReviewedNotification();
    }

    // Auto advance if not at end
    if (currentCardIndex < totalCards - 1) {
      setTimeout(() => {
        handleNextCard();
      }, 200);
    }
  };

  const handleShuffle = () => {
    if (!currentDeck) return;
    const shuffled = [...currentDeck.cards].sort(() => Math.random() - 0.5);
    const updatedDecks = decks.map((d) => (d.id === currentDeck.id ? { ...d, cards: shuffled } : d));
    onDecksUpdated(updatedDecks);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const handleResetProgress = () => {
    if (!currentDeck) return;
    const resetCards = currentDeck.cards.map((c) => ({ ...c, status: 'nuevo' as const }));
    const updatedDecks = decks.map((d) => (d.id === currentDeck.id ? { ...d, cards: resetCards } : d));
    onDecksUpdated(updatedDecks);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const handleGenerateDeck = async () => {
    if (!newTopic.trim() && !newTextContext.trim()) {
      setErrorMsg('Ingresa un tema o contenido para generar el mazo.');
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);

    const resp = await generateFlashcardsApi({
      topic: newTopic || 'Conceptos de Estudio',
      textContext: newTextContext || undefined,
      count: cardCount,
      academicLevel,
      forceDemo: demoMode,
    });

    setIsGenerating(false);

    if (resp.success && resp.data) {
      saveDeckToStorage(resp.data);
      const updated = [resp.data, ...decks];
      onDecksUpdated(updated);
      setSelectedDeckId(resp.data.id);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setShowHint(false);
      setShowNewDeckModal(false);
      setNewTopic('');
      setNewTextContext('');
    } else {
      setErrorMsg(resp.error || 'No se pudieron generar las flashcards.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/5 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Flashcards Interactivas de Repaso 3D
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Memorización activa con repetición espaciada. Haz clic en la tarjeta para voltearla.
          </p>
        </div>

        <button
          onClick={() => setShowNewDeckModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generar Nuevo Mazo con IA</span>
        </button>
      </div>

      {/* Deck Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {decks.map((deck) => {
          const isSelected = deck.id === (currentDeck?.id || '');
          const count = deck.cards.length;
          return (
            <button
              key={deck.id}
              onClick={() => {
                setSelectedDeckId(deck.id);
                setCurrentCardIndex(0);
                setIsFlipped(false);
                setShowHint(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-purple-600/20 border-purple-500/80 text-purple-200 shadow-xs'
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{deck.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Flashcard Study Area */}
      {currentDeck && currentCard ? (
        <div className="space-y-4">
          {/* Deck Stats & Action Controls */}
          <div className="bg-slate-900/70 rounded-2xl p-4 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Tarjeta {currentCardIndex + 1} de {totalCards}
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-300 font-medium">
                {currentCard.tag || currentDeck.category}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Mastery bar */}
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>Dominio:</span>
                <span className="font-bold text-emerald-400">{masteryPercentage}%</span>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${masteryPercentage}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleShuffle}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Barajar mazo"
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetProgress}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Reiniciar progreso"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive 3D Card Container */}
          <div className="perspective-1000 w-full min-h-[340px] md:min-h-[380px] select-none">
            <div
              onClick={handleFlip}
              className={`relative w-full min-h-[340px] md:min-h-[380px] rounded-3xl transform-style-preserve-3d transition-transform duration-500 cursor-pointer shadow-2xl ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Card FRONT */}
              <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/80 rounded-3xl p-6 md:p-10 border border-white/10 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold uppercase tracking-wider text-[10px]">
                    Pregunta / Concepto
                  </span>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Rotate3d className="w-3.5 h-3.5" /> Haz clic para ver respuesta
                  </span>
                </div>

                <div className="my-auto py-6 text-center max-w-xl mx-auto space-y-4">
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-relaxed">
                    {currentCard.front}
                  </h3>

                  {currentCard.hint && (
                    <div className="pt-2">
                      {showHint ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="inline-block p-2.5 px-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs animate-fadeIn"
                        >
                          💡 <strong>Pista nemotécnica:</strong> {currentCard.hint}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHint(true);
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                        >
                          Ver pista nemotécnica
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/5">
                  <span className="capitalize text-slate-400">
                    Estado: <strong className="text-purple-300">{currentCard.status || 'nuevo'}</strong>
                  </span>
                  <span className="text-indigo-400 text-xs font-semibold">Voltear tarjeta ➔</span>
                </div>
              </div>

              {/* Card BACK */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/80 rounded-3xl p-6 md:p-10 border border-purple-500/30 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold uppercase tracking-wider text-[10px]">
                    Respuesta & Fundamento
                  </span>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Rotate3d className="w-3.5 h-3.5" /> Volver al frente
                  </span>
                </div>

                <div className="my-auto py-6 text-center max-w-xl mx-auto space-y-3">
                  <p className="text-lg md:text-xl font-medium text-purple-100 leading-relaxed">
                    {currentCard.back}
                  </p>
                  {currentCard.hint && (
                    <p className="text-xs text-slate-400 italic">
                      Clave de recuerdo: {currentCard.hint}
                    </p>
                  )}
                </div>

                <div className="text-center text-xs text-slate-400 pt-3 border-t border-white/5">
                  Evalúa cómo recuerdas este concepto abajo 👇
                </div>
              </div>
            </div>
          </div>

          {/* Spaced Repetition Rating Buttons */}
          <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="text-center text-xs text-slate-300 font-semibold">
              ¿Cómo calificarías tu dominio de esta tarjeta?
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <button
                onClick={() => handleRateCard('dificil')}
                className="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <span>🔴 Difícil</span>
                <span className="text-[10px] text-rose-400 font-normal">Repetir pronto</span>
              </button>

              <button
                onClick={() => handleRateCard('repaso')}
                className="py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <span>🟡 Con duda</span>
                <span className="text-[10px] text-amber-400 font-normal">Repasar luego</span>
              </button>

              <button
                onClick={() => handleRateCard('dominado')}
                className="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <span>🟢 Dominado</span>
                <span className="text-[10px] text-emerald-400 font-normal">¡Memorizado!</span>
              </button>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between max-w-md mx-auto pt-2 border-t border-white/5">
              <button
                onClick={handlePrevCard}
                disabled={currentCardIndex === 0}
                className="text-xs text-slate-400 hover:text-white disabled:opacity-30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                ← Tarjeta Anterior
              </button>

              <button
                onClick={handleNextCard}
                disabled={currentCardIndex === totalCards - 1}
                className="text-xs text-purple-300 hover:text-purple-200 disabled:opacity-30 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Siguiente Tarjeta →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 rounded-2xl p-10 border border-dashed border-white/10 text-center">
          <Layers className="w-10 h-10 text-purple-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No hay tarjetas disponibles</h3>
          <p className="text-xs text-slate-400 mb-4">Crea un nuevo mazo o genera uno con IA.</p>
          <button
            onClick={() => setShowNewDeckModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
          >
            Crear Mazo
          </button>
        </div>
      )}

      {/* Modal: Generate New Deck with AI */}
      {showNewDeckModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-purple-500/30 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Generar Mazo de Flashcards con IA
              </h3>
              <button
                onClick={() => setShowNewDeckModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tema o Título del Mazo
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Ej. Vocabulario Inglés B2, Leyes de Newton, Neurotransmisores..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  (Opcional) Texto base para extraer tarjetas
                </label>
                <textarea
                  value={newTextContext}
                  onChange={(e) => setNewTextContext(e.target.value)}
                  placeholder="Pega un fragmento de tus apuntes si quieres flashcards sobre este texto..."
                  rows={3}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Número de tarjetas a generar
                </label>
                <select
                  value={cardCount}
                  onChange={(e) => setCardCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-purple-500"
                >
                  <option value={4}>4 tarjetas</option>
                  <option value={6}>6 tarjetas</option>
                  <option value={8}>8 tarjetas</option>
                </select>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowNewDeckModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerateDeck}
                disabled={isGenerating || (!newTopic.trim() && !newTextContext.trim())}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generando tarjetas...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Crear Mazo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
