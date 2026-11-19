import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  Copy,
  ExternalLink,
  Store,
  ChevronDown,
  Building2,
  UtensilsCrossed,
  Gem,
  Scissors
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { LanguageStyle } from '../types';

export const LandingPage: React.FC = () => {
  // Live Simulator State on Landing Page
  const [selectedCategory, setSelectedCategory] = useState('Bridal Jewellery');
  const [selectedLang, setSelectedLang] = useState<LanguageStyle>('TELUGU_ENGLISH_MIX');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Helpful Staff', 'Fair Pricing']);
  const [demoDraft, setDemoDraft] = useState(
    'Sri Sai Jewellers lo bridal jewellery experience chala bagundhi. Mukhya ga Helpful Staff, Fair Pricing chala impress chesindi. Definitely malli visit chesthamu!'
  );
  const [copied, setCopied] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSimulate = () => {
    const tagsStr = selectedTags.length > 0 ? selectedTags.join(', ') : 'service';
    if (selectedLang === 'TELUGU_ENGLISH_MIX') {
      setDemoDraft(
        `Sri Sai Jewellers lo ${selectedCategory} experience chala bagundhi. Mukhya ga ${tagsStr} chala impress chesindi. Definitely malli visit chesthamu!`
      );
    } else if (selectedLang === 'HINGLISH') {
      setDemoDraft(
        `Sri Sai Jewellers mein ${selectedCategory} ka experience sach mein bahut badhiya tha. Khas karke ${tagsStr} humein sabse zyada pasand aaya. Highly recommended!`
      );
    } else {
      setDemoDraft(
        `Visited Sri Sai Jewellers for ${selectedCategory.toLowerCase()} and had a wonderful experience. Particularly loved the ${tagsStr}. Highly recommend their service!`
      );
    }
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(demoDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const businessTypes = [
    { name: 'Jewellers', icon: Gem },
    { name: 'Restaurants & Cafes', icon: UtensilsCrossed },
    { name: 'Salons & Spas', icon: Scissors },
    { name: 'Retail & Boutiques', icon: Store },
    { name: 'Clinics & Hospitals', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),theme(colors.slate.50))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Built Specifically for Indian Local Businesses</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-tight">
            Turn Happy Counter Walk-ins Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
              5-Star Google Reviews
            </span>{' '}
            in 15 Seconds
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Customers want to praise your shop, but get stuck with writer's block. Magic Review lets them scan a counter QR, pick tags, and formulate natural reviews in{' '}
            <span className="font-semibold text-slate-900">Telugu + English, Hinglish, or English</span> with one-tap Google posting.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5"
            >
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200 shadow-sm transition-all"
            >
              Try Interactive Demo
            </a>
          </div>

          {/* Social proof icons */}
          <div className="mt-14 pt-10 border-t border-slate-200/60 max-w-4xl mx-auto">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-6">
              Empowering top retail & service categories across India
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              {businessTypes.map((b) => (
                <div key={b.name} className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                  <b.icon className="w-4 h-4 text-indigo-500" />
                  <span>{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Section */}
      <section id="demo" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Simulator
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Experience How Easy It Is for Customers</h2>
            <p className="mt-2 text-slate-600">Simulate what a customer sees after scanning your store's QR code standee.</p>
          </div>

          {/* Phone Mockup Simulator */}
          <div className="max-w-md mx-auto bg-slate-900 p-3 sm:p-4 rounded-[2.5rem] shadow-2xl border-4 border-slate-800">
            <div className="bg-white rounded-[2rem] p-5 sm:p-6 overflow-hidden text-left relative">
              {/* Store mini header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    💎
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">Sri Sai Jewellers</h3>
                    <p className="text-[11px] text-slate-500">Panjagutta, Hyderabad</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                  Demo
                </span>
              </div>

              {/* Step 1: Category */}
              <div className="mt-4">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">1. What did you explore today?</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Bridal Jewellery', 'Gold Coins', 'Daily Wear Rings', 'Custom Design'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-2.5 py-2 rounded-lg text-left font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Attribute Chips */}
              <div className="mt-4">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">2. Highlights of your visit</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Helpful Staff', 'Fair Pricing', 'Quick Billing', 'Clean Ambience', 'Huge Variety'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300 font-semibold'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {selectedTags.includes(tag) ? '✓ ' : '+ '}{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Language Choice */}
              <div className="mt-4">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">3. Preferred Language Style</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedLang('TELUGU_ENGLISH_MIX')}
                    className={`text-[11px] p-2 rounded-lg text-center font-bold leading-tight transition-all ${
                      selectedLang === 'TELUGU_ENGLISH_MIX'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Telugu + English
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLang('HINGLISH')}
                    className={`text-[11px] p-2 rounded-lg text-center font-bold leading-tight transition-all ${
                      selectedLang === 'HINGLISH'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Hinglish (Hindi+Eng)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLang('ENGLISH')}
                    className={`text-[11px] p-2 rounded-lg text-center font-bold leading-tight transition-all ${
                      selectedLang === 'ENGLISH'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleSimulate}
                className="mt-4 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Review Draft
              </button>

              {/* Review Output */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Formulated Draft</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">100% Editable</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed italic font-medium">"{demoDraft}"</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors border border-indigo-200"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? 'Copied!' : 'Copy Review'}
                  </button>
                  <button
                    onClick={() => alert("In live mode, this opens the store's verified Google Review page where the customer pastes the copied draft!")}
                    className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Post to Google
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">How It Works in 3 Simple Steps</h2>
            <p className="mt-2 text-slate-600">Zero tech complexity for you, seamless 15-second experience for your customers.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Place Custom Standee</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Download your branded high-resolution QR standee from the dashboard and display it on your checkout counter or billing desk.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Customer Taps & Formulates</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Customer scans with their mobile camera, taps their service, tags their highlights, and picks English, Telugu+English, or Hinglish.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">1-Tap Google Post</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                The drafted text is copied with one tap, opening Google Reviews directly in a new tab where the customer pastes it manually.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strict Ethics Guarantee */}
      <section className="py-14 bg-indigo-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-indigo-800 text-cyan-400 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">100% Ethical & Google Policy Compliant</h3>
              <p className="text-indigo-200 text-sm mt-1 max-w-xl">
                We never fake reviews, never gate or filter negative feedback, and never auto-submit via API. The customer maintains full editing control and posts manually.
              </p>
            </div>
          </div>
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-indigo-950 font-bold text-sm shadow-md shrink-0 transition-colors"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Fair, Transparent Pricing for Indian Retailers</h2>
            <p className="mt-2 text-slate-600">No long-term lock-in. Cancel anytime. Choose the plan that fits your footprint.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 flex flex-col">
              <h3 className="text-xl font-bold text-slate-900">Starter Plan</h3>
              <p className="text-sm text-slate-500 mt-1">Perfect for single local stores & boutique shops</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">₹299</span>
                <span className="text-sm font-semibold text-slate-500">/ month</span>
              </div>
              <ul className="mt-8 space-y-3.5 text-sm text-slate-700 flex-1">
                {[
                  '1 Store Location',
                  'Unlimited Customer QR Scans',
                  'All 3 Language Styles (Eng, Telugu+Eng, Hinglish)',
                  'Basic Conversion Analytics',
                  'Printable Standee Generator',
                  'Built-in Demo AI Engine Fallback',
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-8 w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm border border-slate-300 shadow-sm text-center transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-indigo-50 to-white rounded-3xl p-8 border-2 border-indigo-600 shadow-xl relative flex flex-col">
              <div className="absolute -top-3.5 right-8 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-slate-900">Pro Merchant</h3>
              <p className="text-sm text-slate-500 mt-1">For multi-outlet businesses & growing brands</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">₹699</span>
                <span className="text-sm font-semibold text-slate-500">/ month</span>
              </div>
              <ul className="mt-8 space-y-3.5 text-sm text-slate-700 flex-1">
                {[
                  'Up to 5 Store Locations',
                  'Custom Brand Colors & Logo Integration',
                  'Custom Categories & Review Tags Manager',
                  'Priority Gemini 1.5 Flash AI Engine',
                  'Advanced Funnel Analytics & Conversion Rates',
                  'High-Resolution QR Standee Download Center',
                  'Priority Email & WhatsApp Support',
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-medium text-slate-900">{feat}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-8 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 text-center transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="mt-2 text-slate-600">Everything you need to know about Magic Review</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Does Magic Review violate Google’s review guidelines?',
                a: 'Not at all. Unlike prohibited review gating systems that trap negative feedback, Magic Review provides 100% neutral drafting assistance. Customers can edit any word, and every customer can proceed to post on Google regardless of what they formulate.',
              },
              {
                q: 'Why are native Telugu or Hindi scripts not used?',
                a: 'Local Indian shoppers overwhelmingly type and read on mobile using Roman/English alphabet (like "Chala bagundhi" or "Bahut achha tha"). Using Roman script ensures the review looks 100% human, spontaneous, and easily searchable.',
              },
              {
                q: 'What if I do not have a Gemini API key yet?',
                a: 'Magic Review has a built-in deterministic DemoReviewGenerator engine. You can test and operate the entire system locally or on free servers without needing a paid API key.',
              },
              {
                q: 'How does the customer actually post the review?',
                a: 'The customer clicks "Copy Review" which saves the drafted text to their clipboard. Then they tap "Continue to Google Reviews", which opens your verified Google Review listing directly. They simply paste and tap Submit.',
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-2xl border border-slate-200 p-6 transition-all">
                <summary className="font-bold text-slate-900 text-base cursor-pointer list-none flex items-center justify-between">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Magic Review ✨</span>
          </div>
          <p>© {new Date().getFullYear()} Magic Review. Built for local Indian merchants. Strictly ethical review generation.</p>
          <div className="flex items-center gap-4">
            <a href="#how-it-works" className="hover:text-indigo-600">How It Works</a>
            <a href="#pricing" className="hover:text-indigo-600">Pricing</a>
            <Link to="/login" className="hover:text-indigo-600">Merchant Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
