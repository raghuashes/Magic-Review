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
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Heart,
  Edit3,
  ThumbsUp
} from 'lucide-react';
import { publicService } from '../services/publicService';
import { PublicStore, LanguageStyle, ReviewTone, GenerateReviewResponse, EventType } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { Toast } from '../components/Toast';
import { getErrorMessage } from '../services/api';
import { RatingSelector } from '../components/RatingSelector';
import { SocialMediaLinks } from '../components/SocialMediaLinks';

const TONES: { id: ReviewTone; label: string; desc: string }[] = [
  { id: 'FRIENDLY', label: 'Warm & Friendly', desc: 'Approachable, warm tone' },
  { id: 'ENTHUSIASTIC', label: 'Excited & Delighted', desc: 'Super happy, high energy' },
  { id: 'PROFESSIONAL', label: 'Polite & Professional', desc: 'Balanced, respectful' },
  { id: 'SHORT', label: 'Crisp & Short', desc: '1-2 punchy sentences' },
];

export const PublicReviewPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [store, setStore] = useState<PublicStore | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [storeError, setStoreError] = useState<string | null>(null);

  // Review Form State
  const [starRating, setStarRating] = useState<number>(5);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [customerNote, setCustomerNote] = useState<string>('');
  const [languageStyle, setLanguageStyle] = useState<LanguageStyle>('TELUGU_ENGLISH_MIX');
  const [tone, setTone] = useState<ReviewTone>('FRIENDLY');

  // Generation & Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReview, setGeneratedReview] = useState<GenerateReviewResponse | null>(null);
  const [editableReviewText, setEditableReviewText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // History of generated drafts in this session (to strictly prevent repetition & allow cycling)
  const [reviewHistory, setReviewHistory] = useState<string[]>([]);
  const [activeVariationIndex, setActiveVariationIndex] = useState<number>(0);

  // Read optional campaign tag from QR code scan URL query (e.g. ?campaign=counter)
  const campaignTag = new URLSearchParams(window.location.search).get('campaign') || undefined;

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
        } else if (data.businessCategory) {
          setSelectedCategory(data.businessCategory);
        }
        // Pre-select up to 2 active attributes if available
        if (data.attributes && data.attributes.length > 0) {
          const activeAttrs = data.attributes.filter((a) => a.active);
          if (activeAttrs.length > 0) {
            setSelectedAttributes(activeAttrs.slice(0, 2).map((a) => a.label));
          }
        }
        // Record PAGE_VIEW analytics event with campaign attribution
        publicService.recordEvent(slug, 'PAGE_VIEW', campaignTag);
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
    const categoryToUse = selectedCategory || store?.businessCategory || 'Customer Experience';
    if (!slug) return;
    setIsGenerating(true);
    setHasCopied(false);

    // Pass the accumulated history so backend generator strictly avoids repeating any previous text
    const excludedList = isRegenerate ? reviewHistory : [];

    try {
      const response = await publicService.generateReview(slug, {
        category: categoryToUse,
        attributes: selectedAttributes,
        customerNote: customerNote.trim() || undefined,
        languageStyle,
        previousReviews: excludedList,
        starRating,
        tone,
      });

      setGeneratedReview(response);
      setEditableReviewText(response.reviewText);

      // Append new variation to local history
      const updatedHistory = [...reviewHistory, response.reviewText];
      setReviewHistory(updatedHistory);
      setActiveVariationIndex(updatedHistory.length - 1);

      // Record DRAFT_GENERATED analytics event
      publicService.recordEvent(slug, 'DRAFT_GENERATED', campaignTag);

      // Subtle celebration
      if (response.reviewText) {
        try {
          confetti({
            particleCount: 25,
            spread: 45,
            origin: { y: 0.75 },
          });
        } catch {
          // Ignore if canvas-confetti unsupported
        }
      }
    } catch (err) {
      setToastMessage(getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVariation = (index: number) => {
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
      setToastMessage('Review draft copied to clipboard!');
      try {
        confetti({
          particleCount: 50,
          spread: 60,
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
    publicService.recordEvent(slug, 'GOOGLE_LINK_CLICKED', campaignTag);
    // Open Google Review page in a new tab safely
    window.open(store.googleReviewUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSocialClick = (platform: 'whatsapp' | 'instagram' | 'facebook' | 'website') => {
    if (!slug) return;
    const eventMap: Record<string, EventType> = {
      whatsapp: 'WHATSAPP_CLICKED',
      instagram: 'INSTAGRAM_CLICKED',
      facebook: 'FACEBOOK_CLICKED',
      website: 'WEBSITE_CLICKED',
    };
    const eventType = eventMap[platform];
    if (eventType) {
      publicService.recordEvent(slug, eventType, campaignTag);
    }
  };

  if (isLoadingStore) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-700">Loading store experience...</p>
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
    <div className="min-h-screen bg-slate-100/70 pb-20 font-sans selection:bg-indigo-500 selection:text-white">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} duration={3500} />
      )}

      {/* SECTION A: Merchant Header with Cover Image & Branding */}
      <header
        className="w-full text-white pt-10 pb-16 px-4 shadow-md transition-all relative overflow-hidden"
        style={{
          background: store.posterUrl
            ? `linear-gradient(rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.90)), url(${store.posterUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="max-w-lg mx-auto flex flex-col items-center text-center relative z-10 space-y-3">
          {/* Logo */}
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.name}
              className="w-20 h-20 rounded-2xl object-contain bg-white p-1.5 shadow-xl ring-2 ring-white/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black text-white shadow-xl border border-white/30">
              {store.name.charAt(0)}
            </div>
          )}

          {/* Business Name & Tagline */}
          <div>
            {store.businessCategory && (
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-indigo-200 bg-white/10 px-3 py-0.5 rounded-full mb-1 border border-white/20">
                {store.businessCategory}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{store.name}</h1>
            {store.description && (
              <p className="text-xs text-white/90 mt-1 max-w-sm font-medium leading-relaxed mx-auto">
                {store.description}
              </p>
            )}
          </div>

          {/* Star rating highlight */}
          <div className="flex items-center gap-1 text-amber-300 bg-black/25 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-300" />
            ))}
            <span className="text-xs font-bold text-white ml-1">5.0 Star Feedback</span>
          </div>

          {/* Physical Address & Phone */}
          {(store.address || store.phone || store.businessEmail) && (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-white/80 font-medium pt-1">
              {store.address && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-300 shrink-0" />
                  {store.address}
                </span>
              )}
              {store.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-300 shrink-0" />
                  {store.phone}
                </span>
              )}
              {store.businessEmail && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3 text-cyan-300 shrink-0" />
                  {store.businessEmail}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Review Form Card */}
      <main className="max-w-lg mx-auto px-4 -mt-8 space-y-6">
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200/80 space-y-6">
          {/* SECTION B: Customer Experience */}
          
          {/* Welcome Message */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 text-center space-y-1">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 mb-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              {store.welcomeMessage || `Welcome to ${store.name}! We'd love your genuine feedback.`}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Formulate a natural, personalized review draft in seconds.
            </p>
          </div>

          {/* Interactive Star Rating */}
          <RatingSelector rating={starRating} onChange={setStarRating} primaryColor={primaryColor} />

          {/* Step 1: Category Selection */}
          {store.categories && store.categories.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                1. What did you visit for?
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

          {/* Step 2: Customer Experience Tags */}
          {store.attributes && store.attributes.filter((a) => a.active).length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                2. What did you appreciate most?
              </label>
              <p className="text-[11px] text-slate-500 mb-2.5">Tap all that apply to highlight in your review draft.</p>
              <div className="flex flex-wrap gap-2">
                {store.attributes.filter((a) => a.active).map((attr) => {
                  const isSelected = selectedAttributes.includes(attr.label);
                  return (
                    <button
                      key={attr.id}
                      type="button"
                      onClick={() => toggleAttribute(attr.label)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all inline-flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                      )}
                      {attr.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Optional Customer Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              3. Specific details or mentions (Optional)
            </label>
            <input
              type="text"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="e.g. Loved the antique gold necklace / food was piping hot"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* SECTION C: AI Review Generator Settings */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            {/* Language Style Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Review Language Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('TELUGU_ENGLISH_MIX')}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all border text-center ${
                    languageStyle === 'TELUGU_ENGLISH_MIX'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="leading-tight">Telugu Mix</p>
                  <p className={`text-[10px] mt-0.5 ${languageStyle === 'TELUGU_ENGLISH_MIX' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    English Letters
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageChange('HINGLISH')}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all border text-center ${
                    languageStyle === 'HINGLISH'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="leading-tight">Hinglish</p>
                  <p className={`text-[10px] mt-0.5 ${languageStyle === 'HINGLISH' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    English Letters
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageChange('ENGLISH')}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all border text-center ${
                    languageStyle === 'ENGLISH'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="leading-tight">English</p>
                  <p className={`text-[10px] mt-0.5 ${languageStyle === 'ENGLISH' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    Standard
                  </p>
                </button>
              </div>
            </div>

            {/* Review Tone Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Draft Tone & Feel
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`px-3 py-2 rounded-xl text-left border transition-all ${
                      tone === t.id
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold leading-tight">{t.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Review Button */}
            <button
              type="button"
              onClick={() => handleGenerate(false)}
              disabled={isGenerating || !selectedCategory}
              className="w-full py-3.5 px-4 rounded-2xl text-sm font-black text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:brightness-105 active:scale-[0.99]"
              style={{
                backgroundColor: primaryColor,
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Formulating Your Review...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {reviewHistory.length > 0 ? 'Generate New Variation' : 'Generate Review Draft'}
                </>
              )}
            </button>
          </div>

          {/* Generated Review Output Card */}
          {editableReviewText && (
            <div className="pt-3 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                    Review Draft
                  </span>
                  {generatedReview?.mode === 'demo' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Standard Engine
                    </span>
                  )}
                </div>

                {/* Variation Navigator (< 1 / 3 >) */}
                {reviewHistory.length > 1 && (
                  <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl text-xs font-bold text-slate-700">
                    <button
                      type="button"
                      disabled={activeVariationIndex === 0}
                      onClick={() => handleSelectVariation(activeVariationIndex - 1)}
                      className="p-0.5 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-1 text-[11px]">
                      {activeVariationIndex + 1} / {reviewHistory.length}
                    </span>
                    <button
                      type="button"
                      disabled={activeVariationIndex === reviewHistory.length - 1}
                      onClick={() => handleSelectVariation(activeVariationIndex + 1)}
                      className="p-0.5 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Editable Text Area */}
              <div className="relative">
                <textarea
                  rows={4}
                  value={editableReviewText}
                  onChange={(e) => setEditableReviewText(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-indigo-200 bg-indigo-50/20 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-y"
                  placeholder="Your review draft appears here. You can freely edit before copying."
                />
                <span className="absolute right-3 bottom-3 text-[10px] text-slate-400 font-mono">
                  {editableReviewText.length} chars
                </span>
              </div>

              {/* Action Buttons: Copy & Regenerate */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyReview}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-sm ${
                    hasCopied
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {hasCopied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-indigo-600" />
                      Copy Review
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerate(true)}
                  disabled={isGenerating}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  Try Another
                </button>
              </div>

              {/* SECTION D: Google Review Section */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <ThumbsUp className="w-4 h-4 text-amber-600" />
                    Final Step: Post to Google Reviews
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    1. Tap <strong>"Copy Review"</strong> above to save your drafted words.<br />
                    2. Tap the button below to open Google Reviews.<br />
                    3. Paste your draft and share your genuine star rating!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToGoogle}
                  className="w-full py-4 px-4 rounded-2xl text-sm font-black text-white shadow-xl transition-all flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.99]"
                  style={{
                    backgroundColor: secondaryColor || '#06B6D4',
                  }}
                >
                  <span>Continue to Google Reviews</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION E: Social Media Section ("CONNECT WITH US") */}
        <SocialMediaLinks
          whatsapp={store.whatsapp}
          instagramUrl={store.instagramUrl}
          facebookUrl={store.facebookUrl}
          websiteUrl={store.websiteUrl}
          storeName={store.name}
          onLinkClick={handleSocialClick}
        />

        {/* SECTION F: Thank You Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs border border-rose-100">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-900">
            {store.thankYouMessage || `Thank you for visiting ${store.name}!`}
          </h4>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
            Your authentic review helps our local team grow and serves our community better every day.
          </p>

          <div className="pt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Verified Local Merchant Review Flow</span>
          </div>
        </div>
      </main>
    </div>
  );
};
