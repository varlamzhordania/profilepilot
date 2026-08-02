import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile } from '../types';
import { notifyCoachMessage } from '../lib/notifications';
import { safeFetchJson } from '../utils/apiUtils';
import { Send, Bot, User as UserIcon, Sparkles, Zap, Brain, RefreshCw, Loader2, MessageSquare, ShieldCheck, Bell, Copy, Check } from 'lucide-react';

interface CoachChatProps {
  user: UserProfile;
  firebaseUser?: any;
  initialMessages?: ChatMessage[];
  onOpenCreditModal?: () => void;
  onUpdateCredits?: (credits: number) => void;
  onSaveChatHistory?: (messages: ChatMessage[]) => void;
  onRequireAuth?: (pendingAction: any) => void;
}

export const CoachChat: React.FC<CoachChatProps> = ({
  user,
  firebaseUser,
  initialMessages,
  onOpenCreditModal,
  onUpdateCredits,
  onSaveChatHistory,
  onRequireAuth,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages && initialMessages.length > 0
      ? initialMessages
      : [
          {
            id: 'msg_welcome',
            sender: 'assistant',
            text: "Hey! I'm your ProfilePilot AI Wingman & Dating Coach. Ask me anything about conversation starters, profile revamps, or dating advice!",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: 'gemini-3.6-flash',
          },
        ]
  );
  const [inputText, setInputText] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.6-flash');
  const [enableThinking, setEnableThinking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [outOfCredits, setOutOfCredits] = useState<boolean>(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [copiedTranscriptNotice, setCopiedTranscriptNotice] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const handleCopyTranscript = () => {
    if (messages.length === 0) return;
    const formatted = messages
      .map((m) => `[${m.timestamp}] ${m.sender === 'user' ? 'You' : 'AI Coach'}: ${m.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(`PROFILEPILOT AI COACH CHAT TRANSCRIPT\n\n${formatted}`);
    setCopiedTranscriptNotice(true);
    setTimeout(() => setCopiedTranscriptNotice(false), 2500);
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length > 1 && onSaveChatHistory) {
      onSaveChatHistory(messages);
    }
  }, [messages, onSaveChatHistory]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || isLoading) return;

    if (!firebaseUser) {
      if (onRequireAuth) {
        onRequireAuth({
          type: 'coach_message',
          tab: 'chat',
          data: { text },
        });
      }
      return;
    }

    if (user.credits < 1) {
      setOutOfCredits(true);
      if (onOpenCreditModal) onOpenCreditModal();
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    setOutOfCredits(false);

    try {
      const { ok, data } = await safeFetchJson<{
        error?: string;
        message?: string;
        reply?: string;
        thinkingProcess?: string;
        modelUsed?: string;
        creditsRemaining?: number;
      }>('/api/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ sender: m.sender, text: m.text })),
          model: selectedModel,
          enableThinking: enableThinking && selectedModel === 'gemini-3.1-pro-preview',
        }),
      });

      if (!ok || data.error === 'InsufficientCredits') {
        setOutOfCredits(true);
        if (onOpenCreditModal) onOpenCreditModal();
        const errorMsg: ChatMessage = {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          text: "You are out of credits! Please refill your credit balance to continue chatting with the AI Coach (1 credit per response).",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      if (data.reply) {
        if (onUpdateCredits) {
          if (typeof data.creditsRemaining === 'number') {
            onUpdateCredits(data.creditsRemaining);
          } else if (user.credits > 0) {
            onUpdateCredits(user.credits - 1);
          }
        }
        const assistantMsg: ChatMessage = {
          id: `msg_asst_${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Trigger Web Push alert for new coach reply
        notifyCoachMessage(data.reply);
      }
    } catch (err) {
      console.error('Coach chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: "I ran into a temporary glitch connecting to my wingman engine. Try sending that again!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "How do I ask someone out after 3 days of messaging?",
    "Give me 3 witty openers for someone who loves travel & matcha.",
    "Their reply was 'haha true'. How do I keep the spark alive?",
    "What's a good low-pressure first date idea for a Thursday?",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header & Model Switcher Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                ProfilePilot AI Wingman Chat
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Live Chat
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Multi-turn dating advisor, banter coach & conversation strategist</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyTranscript}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-pink-500 hover:text-white dark:hover:bg-pink-600 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
          >
            {copiedTranscriptNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Transcript Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-pink-500" />
                <span>Copy Full Chat</span>
              </>
            )}
          </button>
        </div>

        {/* Gemini Model Affordance */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs w-full md:w-auto">
          <button
            type="button"
            onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
            className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              selectedModel === 'gemini-3.1-flash-lite'
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Fast (Flash Lite)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedModel('gemini-3.6-flash')}
            className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              selectedModel === 'gemini-3.6-flash'
                ? 'bg-pink-500/20 text-pink-600 dark:text-pink-300 border border-pink-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
            <span>General (3.6 Flash)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
            className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              selectedModel === 'gemini-3.1-pro-preview'
                ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
            <span>Complex Strategy (3.1 Pro)</span>
          </button>

          {selectedModel === 'gemini-3.1-pro-preview' && (
            <button
              type="button"
              onClick={() => setEnableThinking(!enableThinking)}
              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all border cursor-pointer ${
                enableThinking
                  ? 'bg-indigo-500/30 text-indigo-600 dark:text-indigo-300 border-indigo-400'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-300 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              High Thinking Mode {enableThinking ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl h-[460px] flex flex-col justify-between shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-pink-500 to-purple-600'
                    : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-pink-600 dark:text-pink-400'
                }`}
              >
                {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-700 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-100 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 gap-2">
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-purple-600 dark:text-purple-300">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>
                  {msg.sender === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.text, msg.id)}
                      className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-900 hover:bg-pink-500 hover:text-white dark:hover:bg-pink-600 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      {copiedMsgId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-pink-500 dark:text-pink-400" />
                <span>AI Coach is crafting strategic advice ({selectedModel})...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/60 flex gap-2 overflow-x-auto no-scrollbar text-xs">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-pink-500/50 whitespace-nowrap transition-all cursor-pointer text-[11px]"
            >
              💡 {p}
            </button>
          ))}
        </div>

        {/* Out of Credits Alert Banner */}
        {outOfCredits && (
          <div className="p-3 bg-gradient-to-r from-orange-100 dark:from-orange-950/80 via-rose-100 dark:via-rose-950/80 to-purple-100 dark:to-purple-950/80 border-t border-orange-300 dark:border-orange-500/40 flex items-center justify-between gap-3 text-xs">
            <span className="text-orange-900 dark:text-orange-200 font-bold flex items-center gap-1.5">
              ⚠️ Out of Credits! Refill your credits to continue chatting (1 Credit/reply).
            </span>
            <button
              type="button"
              onClick={() => onOpenCreditModal && onOpenCreditModal()}
              className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-[11px] shadow-md shadow-orange-500/30 cursor-pointer shrink-0 uppercase tracking-wide"
            >
              Refill Credits (Razorpay)
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex gap-2 items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question or copy-paste a match's message..."
            disabled={isLoading}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-xs text-white disabled:opacity-50 hover:shadow-lg hover:shadow-pink-500/25 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
