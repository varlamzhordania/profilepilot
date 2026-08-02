import React, { useState } from 'react';
import {
  AnalysisResult,
  PromptHistoryItem,
  CoachChatHistoryItem,
  PhotoStudioHistoryItem,
} from '../types';
import {
  History,
  Sparkles,
  Calendar,
  ChevronRight,
  MessageSquare,
  Flame,
  Lock,
  FileText,
  Bot,
  Camera,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';

interface HistoryViewProps {
  history: AnalysisResult[];
  promptHistory?: PromptHistoryItem[];
  coachChatHistory?: CoachChatHistoryItem[];
  photoStudioHistory?: PhotoStudioHistoryItem[];
  onSelectResult: (result: AnalysisResult) => void;
  onSelectPromptHistory?: (item: PromptHistoryItem) => void;
  onSelectCoachChatHistory?: (item: CoachChatHistoryItem) => void;
  onSelectPhotoStudioHistory?: (item: PhotoStudioHistoryItem) => void;
  onNewScan: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  promptHistory = [],
  coachChatHistory = [],
  photoStudioHistory = [],
  onSelectResult,
  onSelectPromptHistory,
  onSelectCoachChatHistory,
  onSelectPhotoStudioHistory,
  onNewScan,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'scans' | 'prompts' | 'chat' | 'photos'>('all');

  const totalItemsCount =
    history.length + promptHistory.length + coachChatHistory.length + photoStudioHistory.length;

  if (totalItemsCount === 0) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-4 py-16">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
          <History className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Saved AI History Yet</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Run chat scans, generate profile prompts, chat with the AI Wingman, or create AI photos. All your sessions are automatically saved here for free re-access at $0 cost!
        </p>
        <button
          onClick={onNewScan}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-500/20 cursor-pointer"
        >
          Start First Session
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-1">
            <Lock className="w-3 h-3" />
            Free $0 Re-Access Storage
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Saved AI Tool History ({totalItemsCount})
          </h2>
          <p className="text-xs text-slate-400">
            Revisit past chat scans, prompt packages, coach chat conversations, and generated photos anytime. Click any session to resume!
          </p>
        </div>

        <button
          onClick={onNewScan}
          className="px-4 py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          New Scan (1 Credit)
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          All Sessions ({totalItemsCount})
        </button>

        <button
          onClick={() => setActiveTab('scans')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'scans'
              ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-pink-400" />
          Chat Scans ({history.length})
        </button>

        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'prompts'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          Prompt Packages ({promptHistory.length})
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-indigo-400" />
          Coach Chats ({coachChatHistory.length})
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'photos'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-rose-400" />
          AI Photos ({photoStudioHistory.length})
        </button>
      </div>

      {/* History Items Container */}
      <div className="space-y-3">
        {/* Chat Scans */}
        {(activeTab === 'all' || activeTab === 'scans') &&
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectResult(item)}
              className="bg-slate-900/90 border border-slate-800 hover:border-pink-500/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer group hover:shadow-xl hover:shadow-pink-500/5"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <Flame className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white group-hover:text-pink-300 transition-colors">
                      {item.demoTitle || 'Chat Vibe Analysis'}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-pink-500/20 text-pink-300 rounded-md border border-pink-500/30 uppercase">
                      Chat Scan
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1 italic">
                    "{item.vibeScores.vibeDescription}"
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      {item.vibeScores.tone}
                    </span>
                    <span>•</span>
                    <span>{item.suggestedReplies.length} Replies Ready</span>
                  </div>
                </div>
              </div>

              {/* Right Action Badge */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-pink-400 block">
                    Flirt: {item.vibeScores.flirtMeter}%
                  </span>
                  <span className="text-[10px] text-slate-500">Card: {item.icebreakerCard.title}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-pink-500 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}

        {/* Prompt Packages */}
        {(activeTab === 'all' || activeTab === 'prompts') &&
          promptHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectPromptHistory && onSelectPromptHistory(item)}
              className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer group hover:shadow-xl hover:shadow-purple-500/5"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                      Profile Prompt Package ({item.prompts.length} Prompts)
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-purple-500/20 text-purple-300 rounded-md border border-purple-500/30 uppercase">
                      Prompts
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    Age {item.persona.age} • {item.persona.occupation} • Vibe: {item.persona.vibeType}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="text-purple-300 font-semibold">
                      Goal: {item.persona.datingGoal}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-purple-400 block">
                    Resume Studio
                  </span>
                  <span className="text-[10px] text-slate-500">Click to load</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-purple-500 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}

        {/* Coach Chat Conversations */}
        {(activeTab === 'all' || activeTab === 'chat') &&
          coachChatHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectCoachChatHistory && onSelectCoachChatHistory(item)}
              className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer group hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                      AI Coach Chat ({item.messages.length} Messages)
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30 uppercase">
                      Coach Chat
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1 italic">
                    "{item.title || item.messages[item.messages.length - 1]?.text || 'Active chat'}"
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-indigo-400 block">
                    Continue Chat
                  </span>
                  <span className="text-[10px] text-slate-500">Click to resume</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-indigo-500 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}

        {/* Photo Studio Generations */}
        {(activeTab === 'all' || activeTab === 'photos') &&
          photoStudioHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectPhotoStudioHistory && onSelectPhotoStudioHistory(item)}
              className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer group hover:shadow-xl hover:shadow-rose-500/5"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-rose-500/30 shrink-0 bg-slate-950">
                  <img
                    src={item.photo.generatedImageUrl}
                    alt={item.photo.promptTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white group-hover:text-rose-300 transition-colors">
                      AI Dating Photo ({item.photo.promptTitle})
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-500/20 text-rose-300 rounded-md border border-rose-500/30 uppercase">
                      AI Photo
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1 italic">
                    "{item.photo.photographerAdvice}"
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      {item.photo.vibeMatchScore}% Vibe Match
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-rose-400 block">
                    View & Download
                  </span>
                  <span className="text-[10px] text-slate-500">Click to open</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-rose-500 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
