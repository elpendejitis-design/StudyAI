import React, { useState, useRef, useEffect } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Compass,
  Calculator,
  RotateCcw,
  AlertCircle,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';
import { AcademicLevel, TutorMessage, TutorPedagogyMode } from '../types/study';
import { DEMO_TUTOR_STARTERS } from '../services/demoData';
import { sendTutorMessageApi } from '../services/api';

interface TutorModuleProps {
  academicLevel: AcademicLevel;
  demoMode: boolean;
}

const subjectsList = [
  'General',
  'Matemáticas & Cálculo',
  'Física & Química',
  'Biología & Ciencias de la Salud',
  'Historia & Filosofía',
  'Programación & Algoritmos',
  'Lengua & Literatura',
  'Economía & Empresa',
];

const pedagogyModes: Array<{
  id: TutorPedagogyMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    id: 'paso-a-paso',
    label: 'Paso a paso',
    icon: Compass,
    description: 'Desglose ordenado con pasos lógicos y ejemplos',
  },
  {
    id: 'socratico',
    label: 'Método Socrático',
    icon: HelpCircle,
    description: 'Preguntas guía para que tú mismo descubras la respuesta',
  },
  {
    id: 'analogia',
    label: 'Analogía',
    icon: Lightbulb,
    description: 'Metáforas de la vida cotidiana para entender lo abstracto',
  },
  {
    id: 'ejercicio',
    label: 'Resolución Guiada',
    icon: Calculator,
    description: 'Fórmula, datos, desarrollo y verificación de problemas',
  },
];

export const TutorModule: React.FC<TutorModuleProps> = ({ academicLevel, demoMode }) => {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      content: `¡Hola! Soy tu **Tutor IA en StudyAI**. Estoy aquí para ayudarte a comprender a fondo cualquier concepto académico para nivel **${academicLevel}**.

¿Hay algún tema complejo que quieras desglosar hoy? Puedes elegir una de las sugerencias inferiores o escribir directamente tu duda.`,
      timestamp: Date.now(),
      suggestedFollowUps: [
        '¿Cómo funciona el Teorema de Bayes?',
        'Explícame la diferencia entre Mitosis y Meiosis.',
        '¿Por qué se produce la inflación económica?',
      ],
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('General');
  const [selectedMode, setSelectedMode] = useState<TutorPedagogyMode>('paso-a-paso');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MAX_CHARS = 3000;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || inputQuestion).trim();
    if (!question || isLoading) return;

    if (question.length > MAX_CHARS) {
      setErrorMsg(`La consulta excede los ${MAX_CHARS} caracteres.`);
      return;
    }

    setErrorMsg(null);
    setInputQuestion('');
    setLastUserPrompt(question);

    const userMessage: TutorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: Date.now(),
      mode: selectedMode,
      subject: selectedSubject,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendTutorMessageApi({
        messages: apiPayload,
        mode: selectedMode,
        subject: selectedSubject,
        academicLevel,
        model: selectedModel,
        forceDemo: demoMode,
      });

      if (response.success && response.data) {
        setMessages((prev) => [...prev, response.data!]);
      } else {
        setErrorMsg(response.error || 'Ocurrió un error al contactar al tutor.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error de conexión con el Tutor IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `Sesión de tutoría reiniciada. ¿Qué concepto o duda te gustaría explorar ahora?`,
        timestamp: Date.now(),
        suggestedFollowUps: [
          'Explícame la Ley de Ohm con un ejemplo.',
          '¿Cuál es la diferencia entre ADN y ARN?',
          '¿Qué fue la Guerra de los Cien Años?',
        ],
      },
    ]);
    setErrorMsg(null);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Top Pedagogical Controls */}
      <div className="bg-slate-900/70 rounded-2xl p-4 md:p-5 border border-white/5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BotMessageSquare className="w-5 h-5 text-indigo-400" />
              Tutor Pedagógico con IA
            </h2>
            <p className="text-xs text-slate-400">
              Respuestas fundamentadas que fomentan la deducción y la comprensión profunda.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Model Selector */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-indigo-200 focus:outline-hidden focus:border-indigo-500 font-medium"
              title="Modelo oficial de IA"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Recomendado)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Alta disp.)</option>
            </select>

            {/* Subject Selector */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
            >
              {subjectsList.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>

            {/* Clear Chat */}
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/5 transition-colors"
              title="Nueva conversación"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pedagogical Modes Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/5">
          {pedagogyModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`p-2 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-xs'
                    : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
                title={mode.description}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold truncate">{mode.label}</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">{mode.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Window */}
      <div className="bg-slate-900/60 rounded-2xl border border-white/5 p-4 md:p-6 flex flex-col min-h-[460px] max-h-[600px] overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-5 pr-2">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[80%] space-y-2`}>
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-xs shadow-md shadow-indigo-600/20'
                        : 'bg-slate-950/80 text-slate-200 rounded-bl-xs border border-white/10 shadow-sm'
                    }`}
                  >
                    {/* Render content */}
                    <div className="whitespace-pre-wrap font-sans text-sm space-y-2">
                      {msg.content}
                    </div>

                    {!isUser && (
                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-indigo-300 font-medium">Tutor StudyAI</span>
                        <button
                          onClick={() => copyToClipboard(msg.id, msg.content)}
                          className="hover:text-white flex items-center gap-1 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === msg.id ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Suggested Follow-Ups */}
                  {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="space-y-1.5 pl-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Preguntas sugeridas:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSendMessage(prompt)}
                            disabled={isLoading}
                            className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-left transition-colors cursor-pointer"
                          >
                            💡 {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                    <span className="text-xs font-bold">Tú</span>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950/80 rounded-2xl rounded-bl-xs p-4 border border-white/10 text-xs text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce delay-200" />
                <span className="ml-1 text-slate-300">
                  El tutor está razonando la explicación paso a paso...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error notification with manual retry */}
        {errorMsg && (
          <div className="mt-3 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-xs text-rose-400 hover:text-white px-1"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {lastUserPrompt && (
                <button
                  type="button"
                  onClick={() => handleSendMessage(lastUserPrompt)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/30 hover:bg-rose-500/40 text-rose-100 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reintentar mensaje</span>
                </button>
              )}
              {selectedModel === 'gemini-3.8-flash' && lastUserPrompt && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModel('gemini-3.1-flash-lite');
                    setTimeout(() => handleSendMessage(lastUserPrompt), 50);
                  }}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/40 text-indigo-200 font-semibold transition-colors cursor-pointer"
                >
                  Probar con Flash Lite
                </button>
              )}
            </div>
          </div>
        )}

        {/* Starters Row (if conversation is short) */}
        {messages.length <= 2 && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Temas populares para consultar:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_TUTOR_STARTERS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.question)}
                  className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-950 border border-white/5 text-left text-xs transition-colors group"
                >
                  <span className="font-semibold text-indigo-300 block mb-0.5">
                    {item.subject}: {item.preview}
                  </span>
                  <span className="text-slate-400 line-clamp-1">{item.question}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder={`Pregunta cualquier duda sobre ${selectedSubject} (${selectedMode})...`}
              maxLength={MAX_CHARS}
              className="flex-1 bg-slate-950/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            <button
              type="submit"
              disabled={isLoading || !inputQuestion.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-md shadow-indigo-600/30 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
              aria-label="Enviar pregunta"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>
              Modo pedagógico activo:{' '}
              <strong className="text-indigo-300 capitalize">{selectedMode.replace('-', ' ')}</strong>
            </span>
            <span>{inputQuestion.length}/{MAX_CHARS} car.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
