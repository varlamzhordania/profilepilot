import React, { useState, useRef } from 'react';
import { SAMPLE_CHATS, SampleChat } from '../data/sampleChats';
import { UserProfile } from '../types';
import { safeFetchJson } from '../utils/apiUtils';
import { Upload, FileText, Image as ImageIcon, Sparkles, Coins, AlertCircle, ArrowRight, CheckCircle2, ShieldAlert, Mic, MicOff, Loader2 } from 'lucide-react';

interface ChatScannerProps {
  user: UserProfile;
  firebaseUser?: any;
  isAnalyzing: boolean;
  onAnalyze: (data: { chatSnippet?: string; imageBase64?: string; mimeType?: string; chatType: 'screenshot' | 'text' | 'demo'; demoTitle?: string }) => void;
  onOpenCreditModal: () => void;
  onOpenLegalModal: () => void;
  onRequireAuth?: (pendingAction: any) => void;
}

export const ChatScanner: React.FC<ChatScannerProps> = ({
  user,
  firebaseUser,
  isAnalyzing,
  onAnalyze,
  onOpenCreditModal,
  onOpenLegalModal,
  onRequireAuth,
}) => {
  const [activeInputType, setActiveInputType] = useState<'screenshot' | 'text' | 'demo'>('screenshot');
  const [selectedDemo, setSelectedDemo] = useState<SampleChat | null>(SAMPLE_CHATS[0]);
  const [pastedText, setPastedText] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<{ base64: string; mimeType: string; fileName: string } | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setIsTranscribing(true);
          try {
            const { data } = await safeFetchJson<{ transcript?: string }>('/api/transcribe-audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/webm' }),
            });
            if (data.transcript) {
              setPastedText((prev) => (prev ? `${prev}\n\n[Voice Note]: ${data.transcript}` : data.transcript));
              setActiveInputType('text');
            }
          } catch (e) {
            console.error('Audio transcription error:', e);
          } finally {
            setIsTranscribing(false);
          }
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone permission or recording error:', err);
      alert('Unable to access microphone for voice recording.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setUploadedImage({
          base64: result,
          mimeType: file.type,
          fileName: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRunAnalysis = () => {
    if (!firebaseUser) {
      if (onRequireAuth) {
        onRequireAuth({
          type: 'analyze_profile',
          tab: 'scanner',
          data: {
            activeInputType,
            uploadedImage,
            pastedText,
            selectedDemoTitle: selectedDemo?.title,
          },
        });
      }
      return;
    }

    if (!user.hasAcceptedTerms) {
      onOpenLegalModal();
      return;
    }
    if (user.credits < 30) {
      onOpenCreditModal();
      return;
    }

    if (activeInputType === 'screenshot' && uploadedImage) {
      onAnalyze({
        imageBase64: uploadedImage.base64,
        mimeType: uploadedImage.mimeType,
        chatType: 'screenshot',
      });
    } else if (activeInputType === 'text' && pastedText.trim()) {
      onAnalyze({
        chatSnippet: pastedText,
        chatType: 'text',
      });
    } else if (activeInputType === 'demo' && selectedDemo) {
      onAnalyze({
        chatSnippet: selectedDemo.snippet,
        chatType: 'demo',
        demoTitle: selectedDemo.title,
      });
    }
  };

  const canSubmit = (
    (activeInputType === 'screenshot' && uploadedImage !== null) ||
    (activeInputType === 'text' && pastedText.trim().length > 5) ||
    (activeInputType === 'demo' && selectedDemo !== null)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Hero Header Banner */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Multimodal AI Dating Coach & Wingman
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
          <span className="text-slate-900 dark:text-white">Turn Awkward Chats Into</span> <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 dark:from-pink-400 dark:via-rose-400 dark:to-purple-400">
            Unstoppable Chemistry
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Upload a dating app chat screenshot or paste text. Profilepilot analyzes the vibe, reveals hidden interest signals, crafts 5 witty replies, and generates a visual icebreaker card.
        </p>
      </div>

      {/* Input Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex items-center justify-center gap-2 max-w-md mx-auto shadow-xl">
        <button
          onClick={() => setActiveInputType('screenshot')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeInputType === 'screenshot'
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Upload Screenshot
        </button>

        <button
          onClick={() => setActiveInputType('demo')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeInputType === 'demo'
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Try Sample Chats
        </button>

        <button
          onClick={() => setActiveInputType('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeInputType === 'text'
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste Text
        </button>
      </div>

      {/* Input Container */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        
        {/* MODE 1: Upload Screenshot */}
        {activeInputType === 'screenshot' && (
          <div className="space-y-4">
            {!uploadedImage ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-pink-500/70 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-950/80 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-500 dark:text-pink-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                  Drag & Drop Dating App Screenshot
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-sm mx-auto mb-4">
                  Supports Tinder, Hinge, Bumble, iMessage, Instagram DMs, or WhatsApp screenshots (.png, .jpg)
                </p>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:bg-pink-500 group-hover:text-white group-hover:border-pink-400 transition-colors">
                  Browse Files
                </span>
              </div>
            ) : (
              <div className="relative bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-48 h-48 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center relative group">
                  <img
                    src={uploadedImage.base64}
                    alt="Chat Screenshot Preview"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Screenshot Ready for AI Analysis
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">{uploadedImage.fileName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Multimodal OCR will parse message bubbles, timestamps, and emotional cues.
                  </p>
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                  >
                    Remove & Upload Different Screenshot
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: Try Sample Chats */}
        {activeInputType === 'demo' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Select a Preset Scenario to Test Instantly
              </label>
              <span className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold">Zero Upload Required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_CHATS.map((demo) => {
                const isSelected = selectedDemo?.id === demo.id;
                return (
                  <div
                    key={demo.id}
                    onClick={() => setSelectedDemo(demo)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-500/10 via-slate-50 to-purple-500/10 dark:from-pink-950/40 dark:via-slate-900 dark:to-purple-950/40 border-pink-500 shadow-md shadow-pink-500/10'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{demo.title}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${demo.avatarBg}`}>
                        {demo.app} • {demo.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{demo.tagline}</p>
                    <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg text-[11px] font-mono text-slate-800 dark:text-slate-300 line-clamp-2 border border-slate-200 dark:border-slate-800/80">
                      {demo.snippet}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE 3: Paste Text & Voice Note */}
        {activeInputType === 'text' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Paste Recent Messages or Transcribe Voice Note
              </label>

              {/* Voice Note Recorder Button */}
              <button
                type="button"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={isTranscribing}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/50 animate-pulse'
                    : isTranscribing
                    ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white hover:border-pink-500'
                }`}
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500 dark:text-purple-400" />
                    <span>Transcribing Voice...</span>
                  </>
                ) : isRecording ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                    <span>Stop Voice Rec</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
                    <span>Record Voice Note</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder={`Example:\nThem: "Haha true, what are you up to this weekend?"\nMe: "Heading to the farmers market! You?"\nThem: "Nice"\n\n(Or click 'Record Voice Note' above to transcribe spoken conversation)`}
              rows={6}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
            />
          </div>
        )}

        {/* Action Panel Footer */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Credit Cost Badge */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-200">30 Credits Per Profile Analysis</span>
              <p className="text-[10px] text-slate-500">Includes vibe score, up to 10 photos, 5 replies & visual card</p>
            </div>
          </div>

          {/* Submit / Trigger Button */}
          <div className="w-full sm:w-auto">
            {!user.hasAcceptedTerms ? (
              <button
                onClick={onOpenLegalModal}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                Sign Mandatory Legal Disclaimer First
              </button>
            ) : user.credits < 30 ? (
              <button
                onClick={onOpenCreditModal}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Coins className="w-4 h-4" />
                Top Up Credits ({user.credits} / 30 Required)
              </button>
            ) : (
              <button
                onClick={handleRunAnalysis}
                disabled={!canSubmit || isAnalyzing}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer ${
                  canSubmit && !isAnalyzing
                    ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-pink-500/25 active:scale-[0.99]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing Chat Vibe & Generating Card...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5 text-pink-200" />
                    Run AI Profile Analysis (30 Credits)
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
