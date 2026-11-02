/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AcademicLevel, ActiveModule, FlashcardDeck, SummaryResult, UserPreferences } from './types/study';
import {
  checkServerHealth,
  getSavedDecks,
  getSavedSummaries,
  loadUserPreferences,
  saveDeckToStorage,
  saveUserPreferences,
} from './services/api';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SummarizerModule } from './components/SummarizerModule';
import { TutorModule } from './components/TutorModule';
import { QuizModule } from './components/QuizModule';
import { FlashcardsModule } from './components/FlashcardsModule';
import { SavedLibraryModal } from './components/SavedLibraryModal';
import { LevelModal } from './components/LevelModal';
import { CheckCircle2, Zap, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [preferences, setPreferences] = useState<UserPreferences>(loadUserPreferences);
  const [savedSummaries, setSavedSummaries] = useState<SummaryResult[]>(getSavedSummaries);
  const [savedDecks, setSavedDecks] = useState<FlashcardDeck[]>(getSavedDecks);

  // Cross-module states
  const [sharedText, setSharedText] = useState<string>('');
  const [sharedTopic, setSharedTopic] = useState<string>('');

  // Modals & Drawers
  const [isLevelModalOpen, setIsLevelModalOpen] = useState<boolean>(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Initial server health & API key check
  useEffect(() => {
    async function verify() {
      const health = await checkServerHealth();
      if (!health.hasApiKey && !preferences.demoMode) {
        // Automatically default to demo mode if server has no key configured so user gets seamless instant experience
        const updated = { ...preferences, demoMode: true };
        setPreferences(updated);
        saveUserPreferences(updated);
        showToast('Modo Demostración activado automáticamente para prueba inmediata.');
      }
    }
    verify();
  }, []);

  // Update preferences helper
  const handleUpdatePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    saveUserPreferences(updated);
  };

  const handleToggleDemoMode = () => {
    const newDemoMode = !preferences.demoMode;
    handleUpdatePreferences({ demoMode: newDemoMode });
    showToast(
      newDemoMode
        ? 'Modo Demostración activado (sin llamadas de API externas)'
        : 'Modo IA Activo con Gemini 3.8 Flash (Gratuito)'
    );
  };

  const handleSelectAcademicLevel = (level: AcademicLevel) => {
    handleUpdatePreferences({ academicLevel: level });
    showToast(`Nivel actualizado a ${level.toUpperCase()}`);
  };

  const handleCardReviewed = () => {
    const newStudied = preferences.studiedToday + 1;
    handleUpdatePreferences({ studiedToday: newStudied });
  };

  const handleQuizCompleted = (scorePercent: number) => {
    showToast(`Examen completado con ${scorePercent}% de aciertos.`);
  };

  // Navigation helpers for cross-module handoffs
  const handleNavigateToQuizWithText = (text: string, topic: string) => {
    setSharedText(text);
    setSharedTopic(topic);
    setActiveModule('quiz');
  };

  const handleNavigateToFlashcardsWithText = (text: string, topic: string) => {
    setSharedText(text);
    setSharedTopic(topic);
    setActiveModule('flashcards');
  };

  const handleSelectQuickTopic = (topic: string, sampleText?: string, targetModule: ActiveModule = 'summarizer') => {
    setSharedTopic(topic);
    setSharedText(sampleText || '');
    setActiveModule(targetModule);
  };

  // Calculate total cards
  const totalCardsCount = savedDecks.reduce((acc, d) => acc + d.cards.length, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 border border-indigo-500/40 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-4 duration-300">
          <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Responsive Sidebar */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={(m) => {
          if (m === 'library') {
            setIsLibraryModalOpen(true);
          } else {
            setActiveModule(m);
          }
        }}
        academicLevel={preferences.academicLevel}
        onOpenLevelModal={() => setIsLevelModalOpen(true)}
        demoMode={preferences.demoMode}
        onToggleDemoMode={handleToggleDemoMode}
        streakDays={preferences.studyStreakDays}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-72 min-h-screen">
        <Navbar
          activeModule={activeModule}
          academicLevel={preferences.academicLevel}
          onOpenLevelModal={() => setIsLevelModalOpen(true)}
          demoMode={preferences.demoMode}
          onToggleDemoMode={handleToggleDemoMode}
          streakDays={preferences.studyStreakDays}
          studiedToday={preferences.studiedToday}
          dailyGoal={preferences.dailyGoalCards}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8">
          {activeModule === 'dashboard' && (
            <Dashboard
              onNavigate={(mod) => {
                if (mod === 'library') {
                  setIsLibraryModalOpen(true);
                } else {
                  setActiveModule(mod);
                }
              }}
              academicLevel={preferences.academicLevel}
              onOpenLevelModal={() => setIsLevelModalOpen(true)}
              recentSummaries={savedSummaries}
              decksCount={savedDecks.length}
              totalCards={totalCardsCount}
              onSelectQuickTopic={handleSelectQuickTopic}
              demoMode={preferences.demoMode}
            />
          )}

          {activeModule === 'summarizer' && (
            <SummarizerModule
              academicLevel={preferences.academicLevel}
              demoMode={preferences.demoMode}
              initialText={sharedText}
              initialTopic={sharedTopic}
              onNavigateToQuizWithText={handleNavigateToQuizWithText}
              onNavigateToFlashcardsWithText={handleNavigateToFlashcardsWithText}
              onSummarySavedNotification={() => {
                setSavedSummaries(getSavedSummaries());
                showToast('Resumen guardado en Mi Biblioteca');
              }}
            />
          )}

          {activeModule === 'tutor' && (
            <TutorModule
              academicLevel={preferences.academicLevel}
              demoMode={preferences.demoMode}
            />
          )}

          {activeModule === 'quiz' && (
            <QuizModule
              academicLevel={preferences.academicLevel}
              demoMode={preferences.demoMode}
              initialTopic={sharedTopic}
              initialTextContext={sharedText}
              onNavigateToFlashcardsWithText={handleNavigateToFlashcardsWithText}
              onQuizCompletedNotification={handleQuizCompleted}
            />
          )}

          {activeModule === 'flashcards' && (
            <FlashcardsModule
              decks={savedDecks}
              onDecksUpdated={(newDecks) => {
                setSavedDecks(newDecks);
                newDecks.forEach(saveDeckToStorage);
              }}
              academicLevel={preferences.academicLevel}
              demoMode={preferences.demoMode}
              initialTopic={sharedTopic}
              initialTextContext={sharedText}
              onCardReviewedNotification={handleCardReviewed}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <LevelModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        currentLevel={preferences.academicLevel}
        onSelectLevel={handleSelectAcademicLevel}
      />

      <SavedLibraryModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        summaries={savedSummaries}
        onSummariesUpdated={() => setSavedSummaries(getSavedSummaries())}
        decks={savedDecks}
        onOpenSummary={(summary) => {
          setSharedText(summary.originalTextSnippet || summary.executiveSummary);
          setSharedTopic(summary.title);
          setActiveModule('summarizer');
        }}
        onOpenDeck={(deckId) => {
          setActiveModule('flashcards');
        }}
      />
    </div>
  );
}
