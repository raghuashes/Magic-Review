import React, { useState, useEffect } from 'react';
import {
  Eye,
  Sparkles,
  ExternalLink,
  TrendingUp,
  Loader2,
  Store as StoreIcon,
  CheckCircle2
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { Store, AnalyticsResponse } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(false);

  useEffect(() => {
    async function loadStores() {
      try {
        setIsLoading(true);
        const data = await storeService.listStores();
        setStores(data);
        if (data.length > 0) {
          setSelectedStoreId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load stores', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStores();
  }, []);

  useEffect(() => {
    async function loadAnalytics() {
      if (!selectedStoreId) return;
      try {
        setIsFetchingAnalytics(true);
        const data = await storeService.getStoreAnalytics(selectedStoreId);
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setIsFetchingAnalytics(false);
      }
    }
    loadAnalytics();
  }, [selectedStoreId]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading analytics dashboard...</p>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">No Stores Created Yet</h2>
        <p className="text-sm text-slate-500 mt-1">Please create a store first to track review analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Review Funnel Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time tracking of in-store customer QR scans, draft generation, and Google Review conversions.
          </p>
        </div>

        {/* Store Selector */}
        <div className="flex items-center gap-2">
          <StoreIcon className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isFetchingAnalytics ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      ) : analytics ? (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Page Views */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total QR Visits</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{analytics.pageViews}</p>
              <p className="text-[11px] text-slate-400 mt-1">Unique counter QR page loads</p>
            </div>

            {/* Card 2: Drafts Generated */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Drafts Formulated</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{analytics.draftsGenerated}</p>
              <p className="text-[11px] text-slate-400 mt-1">Reviews drafted in chosen language</p>
            </div>

            {/* Card 3: Google Clicks */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Google Review Clicks</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{analytics.googleClicks}</p>
              <p className="text-[11px] text-slate-400 mt-1">Customers navigated to Google page</p>
            </div>

            {/* Card 4: Conversion Rate */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Funnel Conversion</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {analytics.clickThroughRate}%
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Formulated drafts to Google clicks</p>
            </div>
          </div>

          {/* Interactive Funnel Visualization */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-6">Customer Review Conversion Funnel</h3>

            <div className="space-y-6">
              {/* Step 1 */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">1. QR Standee Scanned (Page Views)</span>
                  <span className="text-slate-900">{analytics.pageViews} visitors (100%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">2. Review Formulated (AI / Demo Draft)</span>
                  <span className="text-slate-900">
                    {analytics.draftsGenerated} drafts ({analytics.generationRate}% of visitors)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, analytics.generationRate || 0)}%` }}
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">3. Proceeded to Google Reviews</span>
                  <span className="text-slate-900">
                    {analytics.googleClicks} clicks ({analytics.clickThroughRate}% of drafts)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, analytics.clickThroughRate || 0)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Compliance & Privacy Note: </span>
                Google does not notify external APIs when a review is published. Magic Review measures the exact high-intent moment when a customer copies their formulated draft and opens your Google review URL.
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
