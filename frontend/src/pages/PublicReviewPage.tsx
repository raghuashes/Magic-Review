import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Copy,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Star,
  Check,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { publicService } from '../services/publicService';
import { PublicStore, LanguageStyle, GenerateReviewResponse } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { Toast } from '../components/Toast';
import { getErrorMessage } from '../services/api';

export const PublicReviewPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [store, setStore] = useState<PublicStore | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [storeError, setStoreError] = useState<string | null>(null);

  // Review Form State
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [customerNote, setCustomerNote] = useState<string>('');
  const [languageStyle, setLanguageStyle] = useState<LanguageStyle>('TELUGU_ENGLISH_MIX');

  // Generation & Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReview, setGeneratedReview] = useState<GenerateReviewResponse | null>(null);
  const [editableReviewText, setEditableReviewText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // History of generated drafts in this session (to prevent repetition and allow cycling)
  const [reviewHistory, setReviewHistory] = useState<string[]>([]);
  const [activeVariationIndex, setActiveVariationIndex] = useState<number>(0);

  // Reset history if language changes
  const handleLanguageChange = (newLang: LanguageStyle) => {
    setLanguageStyle(newLang);
    setReviewHistory([]);
    setActiveVariationIndex(0);
    setGeneratedReview(null);
    setEditableReviewText('');
  };

  // Initial Load: Fetch Store & record PAGE_VIEW
  useEffect(() => {
    async function init() {
      if (!slug) return;
      try {
        setIsLoadingStore(true);
        const data = await publicService.getPublicStore(slug);
        setStore(data);
        if (data.categories && data.categories.length > 0) {
          setSelectedCategory(data.categories[0].name);
        }
        // Pre-select 2 attributes if available
        if (data.attributes && data.attributes.length > 0) {
          setSelectedAttributes(data.attributes.slice(0, 2).map((a) => a.label));
        }
        // Record PAGE_VIEW analytics event
        publicService.recordEvent(slug, 'PAGE_VIEW');
      } catch (err) {
        setStoreError(getErrorMessage(err));
      } finally {
        setIsLoadingStore(false);
      }
    }
    init();
  }, [slug]);

  const toggleAttribute = (label: string) => {
    setSelectedAttributes((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  };

  const handleGenerate = async (isRegenerate = false) => {
    if (!slug || !selectedCategory) return;
    setIsGenerating(true);
    setHasCopied(false);

    // Pass the accumulated history so backend generator strictly avoids repeating any previous text
    const excludedList = isRegenerate ? reviewHistory : [];

    try {
      const response = await publicService.generateReview(slug, {
        category: selectedCategory,
        attributes: selectedAttributes,
        customerNote: customerNote.trim() || undefined,
        languageStyle,
        previousReviews: excludedList,
      });

      setGeneratedReview(response);
      setEditableReviewText(response.reviewText);

      // Append to history
      setReviewHistory((prev) => {
        const next = prev.includes(response.reviewText) ? prev : [...prev, response.reviewText];
        setActiveVariationIndex(next.length - 1);
        return next;
      });

      // Track DRAFT_GENERATED analytics event
      publicService.recordEvent(slug, 'DRAFT_GENERATED');

      // Scroll smoothly to generated review card
      setTimeout(() => {
        document.getElementById('review-output-card')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const switchVariation = (index: number) => {
    if (index >= 0 && index < reviewHistory.length) {
      setActiveVariationIndex(index);
      setEditableReviewText(reviewHistory[index]);
      setHasCopied(false);
    }
  };

  const handleCopyReview = async () => {
    if (!editableReviewText) return;
    const ok = await copyToClipboard(editableReviewText);
    if (ok) {
      setHasCopied(true);
      setToastMessage('Review copied to clipboard! Now tap "Continue to Google Reviews" below.');
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.8 },
        });
      } catch {
        // ignore if canvas-confetti unsupported
      }
    }
  };

  const handleProceedToGoogle = () => {
    if (!store?.googleReviewUrl || !slug) return;
    // Record GOOGLE_LINK_CLICKED event
    publicService.recordEvent(slug, 'GOOGLE_LINK_CLICKED');
    // Open Google Review page in a new tab
    window.open(store.googleReviewUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoadingStore) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading store experience...</p>
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-lg border border-slate-200">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Store Unavailable</h2>
          <p className="text-xs text-slate-500 mt-1">{storeError || 'This store link is inactive or invalid.'}</p>
        </div>
      </div>
    );
  }

  const primaryColor = store.primaryColor || '#4F46E5';
  const secondaryColor = store.secondaryColor || '#06B6D4';

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} duration={4000} />
      )}

      {/* Top Mobile-First Branded Banner */}
      <div
        className="w-full text-white pt-8 pb-12 px-4 shadow-md transition-all relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="max-w-lg mx-auto flex flex-col items-center text-center relative z-10">
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.name}
              className="w-16 h-16 rounded-2xl object-cover bg-white p-1 shadow-lg mb-3"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black text-white shadow-lg mb-3 border border-white/30">
              {store.name.charAt(0)}
            </div>
          )}

          <h1 className="text-2xl font-extrabold tracking-tight leading-snug">{store.name}</h1>
          {store.description && (
            <p className="text-xs text-white/90 mt-1 max-w-xs font-medium leading-relaxed">{store.description}</p>
          )}

          <div className="flex items-center gap-1 text-amber-300 mt-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-300" />
            ))}
            <span className="text-xs font-bold text-white ml-1">5.0 Star Feedback</span>
          </div>
        </div>
      </div>

      {/* Main Review Form Card */}
      <div className="max-w-lg mx-auto px-4 -mt-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/80 space-y-6">
          {/* Step 1: Category Selection */}
          {store.categories && store.categories.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                1. Select what you visited for
              </label>
              <div className="flex flex-wrap gap-2">
                {store.categories.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all ${
                        isSelected
                          ? 'text-white shadow-sm scale-[1.02]'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      style={{
                        backgroundColor: isSelected ? primaryColor : undefined,
                      }}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Attribute Highlights */}
          {store.attributes && store.attributes.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                2. Tap what you loved
              </label>
              <div className="flex flex-wrap gap-2">
                {store.attributes.map((attr) => {
                  const isSelected = selectedAttributes.includes(attr.label);
                  return (
                    <button
                      key={attr.id}
                      type="button"
                      onClick={() => toggleAttribute(attr.label)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{attr.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Customer Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              3. Any specific mention? (Optional)
            </label>
            <input
              type="text"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="e.g. Special thanks to Suresh at the counter"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Step 4: Language Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                4. Review Language Style
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">Roman letters only</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'TELUGU_ENGLISH_MIX' as LanguageStyle,
                  title: 'Telugu + English',
                  hint: 'e.g. Collection chala bagundhi',
                },
                {
                  id: 'HINGLISH' as LanguageStyle,
                  title: 'Hindi + English',
                  hint: 'e.g. Service bahut badhiya hai',
                },
                {
                  id: 'ENGLISH' as LanguageStyle,
                  title: 'English',
                  hint: 'Conversational English',
                },
              ].map((lang) => {
                const isSelected = languageStyle === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`p-2.5 rounded-2xl text-left border flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isSelected ? 'text-indigo-700' : 'text-slate-800'
                        }`}
                      >
                        {lang.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{lang.hint}</p>
                    </div>
                    {isSelected && (
                      <span className="self-end mt-2 text-indigo-600">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={() => handleGenerate(false)}
            disabled={isGenerating || !selectedCategory}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50"
            style={{
              backgroundColor: primaryColor,
              boxShadow: `0 10px 20px -5px ${primaryColor}40`,
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Formulating Your Review...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate My Review
              </>
            )}
          </button>
        </div>

        {/* Review Output Card */}
        {generatedReview && (
          <div
            id="review-output-card"
            className="mt-6 bg-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-indigo-200 animate-in fade-in slide-in-from-bottom-3 duration-300 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Your Review Draft
                </span>
                {generatedReview.mode === 'demo' && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                    Demo Mode
                  </span>
                )}
              </div>

              {/* History Variation Navigator */}
              {reviewHistory.length > 1 && (
                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-xl text-xs font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => switchVariation(activeVariationIndex - 1)}
                    disabled={activeVariationIndex === 0}
                    className="p-0.5 hover:bg-white rounded transition-colors disabled:opacity-30"
                    title="Previous variation"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold px-1">
                    {activeVariationIndex + 1} / {reviewHistory.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => switchVariation(activeVariationIndex + 1)}
                    disabled={activeVariationIndex === reviewHistory.length - 1}
                    className="p-0.5 hover:bg-white rounded transition-colors disabled:opacity-30"
                    title="Next variation"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Editable Text Area */}
            <div>
              <textarea
                rows={4}
                value={editableReviewText}
                onChange={(e) => setEditableReviewText(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all leading-relaxed"
                placeholder="Your drafted review appears here..."
              />
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <span className="italic">* Tap inside to edit any word before copying</span>
                {reviewHistory.length > 1 && (
                  <span className="text-indigo-600 font-medium">Unique variation preserved</span>
                )}
              </div>
            </div>

            {/* Regenerate Action Pill */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                Regenerate New Review (Never Repeats)
              </button>
            </div>

            {/* Clear 2-Step Guidance */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/60 text-xs text-indigo-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-indigo-900">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                Two Easy Steps to Publish:
              </p>
              <p className="pl-5 text-indigo-900">
                <strong>Step 1:</strong> Tap <strong>"Copy Review"</strong> below.
              </p>
              <p className="pl-5 text-indigo-900">
                <strong>Step 2:</strong> Tap <strong>"Continue to Google Reviews"</strong> to open Google and paste your review.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopyReview}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  hasCopied
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                }`}
              >
                <Copy className="w-4 h-4" />
                {hasCopied ? '✓ Review Copied to Clipboard!' : 'Step 1: Copy Review'}
              </button>

              <button
                type="button"
                onClick={handleProceedToGoogle}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                Step 2: Continue to Google Reviews
              </button>
            </div>
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="mt-8 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pb-8">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Strictly genuine feedback assistance. Never automated.</span>
        </div>
      </div>
    </div>
  );
};
