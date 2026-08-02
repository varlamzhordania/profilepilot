import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { PhotoPrompt, GeneratedPhoto, UserProfile } from '../types';
import { PHOTO_PROMPTS_LIBRARY } from '../data/photoPrompts';
import { downloadImageDataUrl } from '../utils/downloadUtils';
import { notifyPhotoStudioReady } from '../lib/notifications';
import { safeFetchJson } from '../utils/apiUtils';
import { Image as ImageIcon, Upload, Sparkles, Download, RefreshCw, Wand2, Check, Camera, Layers, ArrowRight, Shield, Info, Bell, Coins } from 'lucide-react';

interface PhotoStudioProps {
  user: UserProfile;
  firebaseUser?: any;
  initialPhoto?: GeneratedPhoto | null;
  initialReferenceImage?: string | null;
  onUpdateCredits: (newCredits: number) => void;
  onOpenCreditModal: () => void;
  onSavePhotoHistory?: (photo: GeneratedPhoto, referenceImage?: string) => void;
  onRequireAuth?: (pendingAction: any) => void;
}

export const PhotoStudio: React.FC<PhotoStudioProps> = ({
  user,
  firebaseUser,
  initialPhoto,
  initialReferenceImage,
  onUpdateCredits,
  onOpenCreditModal,
  onSavePhotoHistory,
  onRequireAuth,
}) => {
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(initialReferenceImage || null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [selectedPrompt, setSelectedPrompt] = useState<PhotoPrompt>(PHOTO_PROMPTS_LIBRARY[0]);
  const [customPromptText, setCustomPromptText] = useState<string>('');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [resolution] = useState<'1K' | '2K' | '4K'>('2K');
  const [aspectRatio] = useState<string>('9:16');

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(PHOTO_PROMPTS_LIBRARY.map((item) => item.category)))];

  const filteredPrompts = PHOTO_PROMPTS_LIBRARY.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.promptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const [generatedPhoto, setGeneratedPhoto] = useState<GeneratedPhoto | null>(initialPhoto || null);
  const [photoHistory, setPhotoHistory] = useState<GeneratedPhoto[]>(initialPhoto ? [initialPhoto] : []);

  React.useEffect(() => {
    if (initialPhoto) {
      setGeneratedPhoto(initialPhoto);
      setPhotoHistory((prev) => (prev.some((p) => p.id === initialPhoto.id) ? prev : [initialPhoto, ...prev]));
    }
    if (initialReferenceImage) {
      setUploadedImageBase64(initialReferenceImage);
    }
  }, [initialPhoto, initialReferenceImage]);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [generationStep, setGenerationStep] = useState<string>('Analyzing image & features...');
  const [queueProgress, setQueueProgress] = useState<number>(10);

  const handleDownloadImage = async () => {
    if (!generatedPhoto?.generatedImageUrl) return;
    const ok = await downloadImageDataUrl(generatedPhoto.generatedImageUrl, 'profilepilot_ai_photo');
    if (ok) {
      setDownloadNotice(true);
      setTimeout(() => setDownloadNotice(false), 3000);
    } else {
      setErrorMessage('Failed to trigger download. Please right-click or press and hold the image to save.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File size exceeds 20MB limit. Please upload a smaller photo.');
      return;
    }

    setMimeType('image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Downscale image to max 800x800 for rapid base64 transmission
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setUploadedImageBase64(compressedDataUrl);
          setErrorMessage(null);
        } else {
          setUploadedImageBase64(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleGeneratePhoto = async () => {
    if (!firebaseUser) {
      if (onRequireAuth) {
        onRequireAuth({
          type: 'generate_photo',
          tab: 'photos',
          data: {
            selectedPromptId: selectedPrompt.id,
            customPromptText,
            uploadedImageBase64,
          },
        });
      }
      return;
    }

    if (user.credits < 10) {
      onOpenCreditModal();
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGenerationStep('1/3 Extracting facial traits & lighting...');
    setQueueProgress(15);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev.includes('1/3')) {
          setQueueProgress(45);
          return '2/3 Synthesizing Gemini AI portrait...';
        }
        if (prev.includes('2/3')) {
          setQueueProgress(85);
          return '3/3 Finalizing high-converting photo...';
        }
        return prev;
      });
    }, 2500);

    const activePromptText = customPromptText.trim() || selectedPrompt.promptText;

    // Set client-side timeout controller (45s max wait for multimodal diffusion model)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const { ok, data } = await safeFetchJson<{
        error?: string;
        message?: string;
        credits?: number;
        creditsRemaining?: number;
        photo?: GeneratedPhoto;
      }>('/api/photos/generate-ai-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          imageBase64: uploadedImageBase64,
          mimeType: 'image/jpeg',
          photoPromptTitle: selectedPrompt.title,
          photoPromptText: activePromptText,
          customInstructions,
          resolution,
          aspectRatio,
        }),
      });

      clearTimeout(timeoutId);
      clearInterval(stepInterval);

      if (!ok) {
        if (typeof data.credits === 'number') {
          onUpdateCredits(data.credits);
        }
        if (data.error === 'InsufficientCredits') {
          onOpenCreditModal();
        } else {
          setErrorMessage(data.message || 'Failed to generate AI photo.');
        }
        return;
      }

      if (data.photo) {
        setQueueProgress(100);
        setGeneratedPhoto(data.photo);
        setPhotoHistory((prev) => [data.photo, ...prev]);
        if (onSavePhotoHistory) {
          onSavePhotoHistory(data.photo, uploadedImageBase64 || undefined);
        }
        onUpdateCredits(data.creditsRemaining);

        // Dispatch Web Push Notification alert
        notifyPhotoStudioReady(selectedPrompt.title);

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#ec4899', '#a855f7', '#38bdf8', '#fbbf24'],
            disableForReducedMotion: true,
          });
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      clearInterval(stepInterval);
      console.error(err);
      if (err.name === 'AbortError') {
        setErrorMessage('AI Photo process timed out. Please try generating again.');
      } else {
        setErrorMessage('Network error occurred during AI photo generation.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(selectedPrompt.promptText);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Studio Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
          Gemini Multimodal AI Dating Photo Studio
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Transform Your Photos into High-Converting Dating Pics
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Upload a picture of yourself, select a curated photo prompt, and let Gemini AI craft stunning, photorealistic portraits designed to maximize match rates.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-200 text-xs font-semibold text-center">
          ⚠ {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload Picture & Settings */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Picture Upload Container */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                1. Upload Your Reference Picture
              </h3>
              <span className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                Facial Feature Extraction
              </span>
            </div>

            {uploadedImageBase64 ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-pink-500/40 group aspect-square bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                <img
                  src={uploadedImageBase64}
                  alt="Uploaded reference"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <label className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs cursor-pointer shadow-lg transition-all">
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => setUploadedImageBase64(null)}
                    className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-pink-500/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/50 group text-center">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-500 dark:text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">Click or drag picture to upload</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Supports PNG, JPG, WebP (Max 15MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
              Privacy: Uploaded photos are processed securely in memory by Gemini AI and never made public.
            </p>
          </div>

          {/* Photo Generation Prompt Settings */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              2. Customization & Extra Directives
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Selected Prompt Baseline:
              </label>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200">
                <span className="font-bold text-pink-600 dark:text-pink-400 block mb-1">{selectedPrompt.title}</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{selectedPrompt.promptText}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <span>📱</span>
                <span>Optimized Format:</span>
              </span>
              <span className="px-2.5 py-1 bg-pink-500/10 border border-pink-500/30 text-pink-600 dark:text-pink-300 rounded-lg font-bold text-[11px] font-mono">
                9:16 Phone Portrait (HD)
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Custom Styling Directives (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g., Wearing black jacket, smiling warmly, holding latte..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
            </div>

            <button
              onClick={handleGeneratePhoto}
              disabled={isGenerating}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-all ${
                isGenerating
                  ? 'bg-slate-800 text-pink-300 cursor-not-allowed border border-pink-500/30'
                  : 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white shadow-pink-500/20 hover:scale-[1.01]'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-pink-300 shrink-0" />
                  <span>{generationStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-pink-300" />
                  Generate AI Dating Photo ({user.credits} Credits Left)
                </>
              )}
            </button>

            {user.credits < 10 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-200">
                <span>Insufficient credits ({user.credits} / 10 required).</span>
                <button
                  type="button"
                  onClick={onOpenCreditModal}
                  className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-extrabold rounded-lg text-xs cursor-pointer shadow-md shadow-orange-500/20"
                >
                  <Coins className="w-3.5 h-3.5 inline-block mr-1" />
                  Refill Credits
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Prompts Library & Generated Result */}
        <div className="lg:col-span-7 space-y-6">

          {/* ACTIVE QUEUE SKELETON UI (Shown when generating) */}
          {isGenerating && (
            <div className="bg-slate-900 border-2 border-pink-500/50 rounded-3xl p-6 space-y-6 shadow-2xl animate-fadeIn">
              
              {/* Queue Status Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      Queue Job #PP-IMG-{Math.floor(1000 + Math.random() * 9000)}
                    </h3>
                    <p className="text-[10px] text-pink-300 font-semibold">{generationStep}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-[11px] font-mono font-bold animate-pulse">
                  {queueProgress}% Complete
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className="bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-pink-500/50"
                    style={{ width: `${queueProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Gemini Diffusion Pipeline Active</span>
                  <span>Est. remaining ~3-5s</span>
                </div>
              </div>

              {/* Skeleton Side-by-Side Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {uploadedImageBase64 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      Reference Photo
                    </span>
                    <div className="aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img src={uploadedImageBase64} alt="Original" className="w-full h-full object-cover opacity-60" />
                    </div>
                  </div>
                )}

                <div className={`space-y-1.5 ${uploadedImageBase64 ? '' : 'sm:col-span-2'}`}>
                  <span className="text-[10px] font-bold text-pink-400 block uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    Generating AI Portrait Skeleton...
                  </span>
                  
                  {/* Shimmer Image Box */}
                  <div className="aspect-square rounded-2xl border-2 border-dashed border-pink-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent animate-pulse" />
                    <RefreshCw className="w-10 h-10 text-pink-400 animate-spin mb-3 stroke-[1.5]" />
                    <div className="space-y-1 z-10 max-w-xs">
                      <div className="h-3.5 bg-pink-500/20 rounded-md w-3/4 mx-auto animate-pulse" />
                      <div className="h-2.5 bg-slate-800 rounded-md w-1/2 mx-auto animate-pulse mt-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skeleton Recommendation Bar */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 animate-pulse">
                <div className="h-3 bg-slate-800 rounded w-1/3" />
                <div className="h-2.5 bg-slate-800/60 rounded w-full" />
                <div className="h-2.5 bg-slate-800/60 rounded w-4/5" />
              </div>

            </div>
          )}

          {/* GENERATED RESULT DISPLAY */}
          {generatedPhoto && !isGenerating && (
            <div className="bg-slate-900 border-2 border-pink-500/40 rounded-3xl p-6 space-y-6 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-500 animate-ping" />
                  <h3 className="font-black text-lg text-white">AI Dating Photo Output</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  {generatedPhoto.vibeMatchScore}% Match Vibe Score
                </span>
              </div>

              {/* Side-by-Side or Large Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {uploadedImageBase64 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                      Original Reference Photo
                    </span>
                    <div className="aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img src={uploadedImageBase64} alt="Original" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                <div className={`space-y-1.5 ${uploadedImageBase64 ? '' : 'sm:col-span-2'}`}>
                  <span className="text-[11px] font-bold text-pink-400 block uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gemini AI Generated Photo
                  </span>
                  <div className="aspect-square rounded-2xl overflow-hidden border-2 border-pink-500/50 bg-slate-950 shadow-xl relative group">
                    <img src={generatedPhoto.generatedImageUrl} alt="Generated AI Photo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={handleDownloadImage}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Download High-Res
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photographer Advice Note */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <Info className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-white">Dating Coach Recommendation:</h4>
                  <p className="text-slate-300 leading-relaxed">{generatedPhoto.photographerAdvice}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleDownloadImage}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 cursor-pointer transition-all"
                >
                  {downloadNotice ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
                  {downloadNotice ? 'Downloaded Image to Gallery!' : 'Save Image to Gallery'}
                </button>
                <button
                  onClick={handleGeneratePhoto}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-pink-500 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-pink-400" />
                  Regenerate
                </button>
              </div>

            </div>
          )}

          {/* Queue History Thumbnail Bar */}
          {photoHistory.length > 0 && !isGenerating && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-xs font-extrabold text-slate-300 block">
                Generated Photos Pipeline ({photoHistory.length}):
              </span>
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
                {photoHistory.map((ph, idx) => (
                  <button
                    key={ph.id || idx}
                    onClick={() => setGeneratedPhoto(ph)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      generatedPhoto?.generatedImageUrl === ph.generatedImageUrl
                        ? 'border-pink-500 scale-105 shadow-md shadow-pink-500/20'
                        : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={ph.generatedImageUrl} alt="History thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Prompt Selection Grid & Category Filtering */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    Dating Photo Prompts Library ({PHOTO_PROMPTS_LIBRARY.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Proven prompts for Paris Balcony, Rome Colosseum, Alpine Snow, Beach Lounges, and more.
                  </p>
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-pink-500 text-xs text-slate-300 font-bold flex items-center gap-1.5 cursor-pointer transition-all self-start sm:self-auto"
                >
                  {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5 text-pink-400" />}
                  {copiedNotice ? 'Copied Prompt' : 'Copy Active Prompt'}
                </button>
              </div>

              {/* Search & Category Bar */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="🔍 Search prompts by location, vibe, or keywords (e.g. Paris, Colosseum, Boat, Night)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                />

                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20'
                          : 'bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Selected Prompt Editor / Preview Box */}
              <div className="p-4 bg-slate-950/90 border border-pink-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1">
                    <Wand2 className="w-3.5 h-3.5" />
                    Selected Target Prompt ({selectedPrompt.title}):
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{selectedPrompt.category}</span>
                </div>
                <textarea
                  value={customPromptText !== '' ? customPromptText : selectedPrompt.promptText}
                  onChange={(e) => setCustomPromptText(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-pink-500 leading-relaxed font-sans"
                  placeholder="You can edit or paste any custom prompt here..."
                />
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>💡 Tip: You can directly edit this prompt or type your own custom scenario above before generating.</span>
                  {customPromptText !== '' && (
                    <button
                      onClick={() => setCustomPromptText('')}
                      className="text-pink-400 hover:underline cursor-pointer font-bold"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {filteredPrompts.length > 0 ? (
                  filteredPrompts.map((item) => {
                    const isSelected = selectedPrompt.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedPrompt(item);
                          setCustomPromptText('');
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-pink-950/40 border-pink-500 shadow-lg shadow-pink-500/10'
                            : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/80'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r ${item.bgGradient} text-white`}>
                              {item.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{item.styleBadge}</span>
                          </div>
                          <h4 className="font-bold text-sm text-white pt-1">{item.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.promptText}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate max-w-[200px]">🎯 {item.bestFor}</span>
                          <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-pink-400' : 'text-slate-600'}`} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-8 text-center text-xs text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
                    No photo prompts found matching "{searchQuery}". Try selecting "All" or a different category.
                  </div>
                )}
              </div>

            </div>

        </div>

      </div>

    </div>
  );
};
