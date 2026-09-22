import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User as UserIcon,
  Search,
  MapPin,
  ExternalLink,
  Cpu,
  Loader2,
  Minimize2,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOperations } from '../../context/OperationsContext';
import { ChatMessage } from '../../types';
import { db, collection, addDoc, query, orderBy, limit, onSnapshot } from '../../services/firebase';

interface GeminiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiCopilotModal: React.FC<GeminiCopilotModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { routes, buses, incidents, trips } = useOperations();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome_1',
        role: 'model',
        content: `👋 Hello **${currentUser?.name || 'Transit Commuter'}**! I'm RouteSense AI, grounded in real-time transit telemetry, Google Search, and Google Maps.\n\nAsk me about live bus routes, peak-hour bottlenecks, ticketing calculations, stop navigation, or driver safety tips!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash',
      },
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [groundingMode, setGroundingMode] = useState<'none' | 'search' | 'maps'>('maps');
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const quickPromptsByRole: Record<string, string[]> = {
    passenger: [
      'Where is Route 101 bus right now and when will it reach Swargate?',
      'What is the cheapest fare from Pune Station to Hinjewadi Phase 1?',
      'Find nearby bus stops with Google Maps',
    ],
    conductor: [
      'Calculate fare for 4 passengers traveling 6 stops with cash',
      'How to reconcile shift totals with ₹200 discrepancy?',
      'Best practice to issue QR tickets during peak rush crowd',
    ],
    driver: [
      'Route 101 upcoming road obstructions & safest detour',
      'Immediate protocol if hydraulic pressure drops on highway',
      'Current speed limit along Western Express corridor',
    ],
    operations_manager: [
      'Analyze 7-day recurring delay patterns on Route 101 and recommend frequency adjustment',
      'Breakdown incident impact on network on-time performance',
      'Optimize fleet allocation between Route 101 and Route 103 for evening peak',
    ],
  };

  const currentPrompts = quickPromptsByRole[currentUser?.role || 'passenger'] || quickPromptsByRole.passenger;

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputValue).trim();
    if (!queryText || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Gather dynamic context from app state to feed Gemini
      const activeRoute = routes[0];
      const contextData = {
        activeRoute: {
          routeNumber: activeRoute?.routeNumber,
          routeName: activeRoute?.routeName,
          farePerStop: activeRoute?.farePerStop,
          baseFare: activeRoute?.baseFare,
          stops: activeRoute?.scheduledStops?.map(s => s.name),
        },
        activeBuses: buses.slice(0, 3).map(b => ({
          busNumber: b.busNumber,
          routeNumber: b.routeNumber,
          speed: b.currentSpeed,
          status: b.status,
          nextStop: b.nextStop,
          load: `${b.currentLoad}%`,
        })),
        recentIncidents: incidents.slice(0, 2).map(i => ({
          type: i.type,
          routeName: i.routeName,
          description: i.description,
          severity: i.severity,
          status: i.status,
        })),
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          role: currentUser?.role || 'passenger',
          preferredModel: selectedModel,
          grounding: groundingMode,
          contextData,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const reply = await res.json();

      const botMessage: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'model',
        content: reply.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: reply.modelUsed,
        groundingType: reply.groundingType,
        citations: reply.citations,
      };

      setMessages(prev => [...prev, botMessage]);

      // Save turn to Firestore chat_messages for audit
      try {
        if (currentUser?.uid) {
          addDoc(collection(db, 'chat_messages'), {
            userId: currentUser.uid,
            userName: currentUser.name,
            role: currentUser.role,
            query: userMessage.content,
            response: botMessage.content,
            modelUsed: reply.modelUsed,
            timestamp: new Date().toISOString(),
          }).catch(() => {});
        }
      } catch (e) {
        // Silent persistence fallback
      }
    } catch (err: any) {
      console.error('Gemini error:', err);
      const errorMessage: ChatMessage = {
        id: 'bot_err_' + Date.now(),
        role: 'model',
        content: `⚠️ **Unable to connect to Gemini API**: ${err.message || 'Check GEMINI_API_KEY environment configuration.'}\n\nYou can still explore all built-in local route calculations, ticketing, and live telemetry!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-3xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden transition-all duration-300 w-full ${
          isExpanded ? 'max-w-5xl h-[92vh]' : 'max-w-2xl h-[80vh] sm:h-[750px]'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white flex items-center justify-between border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8A1F] flex items-center justify-center text-white shadow-md shadow-orange-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                  RouteSense AI Copilot
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Gemini Grounded
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Tailored for {currentUser?.role?.replace('_', ' ').toUpperCase()} • Fleet Context Aware
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Restore' : 'Expand'}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Model & Grounding Controls Bar */}
        <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Model Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-500 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#FF6B00]" /> Model:
            </span>
            <div className="flex bg-white rounded-xl p-0.5 border border-neutral-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.5-flash')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  selectedModel === 'gemini-3.5-flash'
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Flash (Fast & Maps)
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  selectedModel === 'gemini-3.1-pro-preview'
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Pro (Reasoning)
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Lite
              </button>
            </div>
          </div>

          {/* Grounding Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-500">Grounding:</span>
            <div className="flex bg-white rounded-xl p-0.5 border border-neutral-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setGroundingMode('maps')}
                title="Ground answers with Google Maps places, stops, coordinates and transit points"
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                  groundingMode === 'maps'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>Google Maps</span>
              </button>
              <button
                type="button"
                onClick={() => setGroundingMode('search')}
                title="Ground answers with live Google Web Search"
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                  groundingMode === 'search'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Search className="w-3 h-3" />
                <span>Google Search</span>
              </button>
              <button
                type="button"
                onClick={() => setGroundingMode('none')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  groundingMode === 'none'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Off
              </button>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-neutral-50/50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[88%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-gradient-to-tr from-[#FF6B00] to-[#FF8A1F] text-white'
                }`}
              >
                {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-neutral-900 text-white rounded-tr-none'
                    : 'bg-white border border-neutral-200/80 text-neutral-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans space-y-2">{msg.content}</div>

                {/* Grounding Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block w-full mb-1">
                      Sources & Places Referenced:
                    </span>
                    {msg.citations.map((c, idx) => (
                      <a
                        key={idx}
                        href={c.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-orange-50 text-neutral-700 hover:text-[#FF6B00] text-[11px] font-semibold border border-neutral-200 transition-colors"
                      >
                        {c.source === 'Google Maps' ? (
                          <MapPin className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Search className="w-3 h-3 text-blue-600" />
                        )}
                        <span className="truncate max-w-[180px]">{c.title || 'Source'}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 font-mono flex items-center justify-between ${
                    msg.role === 'user' ? 'text-neutral-400' : 'text-neutral-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.modelUsed && (
                    <span className="text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-mono">
                      {msg.modelUsed}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[80%]">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-none p-4 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6B00] animate-pulse" />
                  <span>Consulting Gemini & transit telemetry...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-neutral-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {currentPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-orange-50 hover:text-[#FF6B00] text-neutral-700 whitespace-nowrap transition-colors border border-neutral-200/60 shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-neutral-200">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={`Ask RouteSense AI as ${currentUser?.role?.replace('_', ' ')}...`}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 outline-hidden transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-3 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-2xl shadow-md shadow-orange-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
