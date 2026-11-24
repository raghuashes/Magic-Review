import React, { useState, useEffect } from 'react';
import {
  Eye,
  Sparkles,
  ExternalLink,
  TrendingUp,
  Loader2,
  Store as StoreIcon,
  Calendar,
  MessageCircle,
  Instagram,
  Facebook,
  Globe,
  ShieldAlert,
  Tag
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { Store, AnalyticsResponse } from '../types';

type DateFilterRange = 'all' | 'today' | '7d' | '30d' | 'custom';

const DATE_FILTERS: { label: string; value: DateFilterRange }[] = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Custom Range', value: 'custom' },
];

export const AnalyticsPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateFilterRange>('all');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');
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
      // If custom is selected without dates, don't trigger until dates provided
      if (dateRange === 'custom' && (!customFrom || !customTo)) {
        return;
      }
      try {
        setIsFetchingAnalytics(true);
        const fromIso = customFrom ? new Date(customFrom).toISOString() : undefined;
        const toIso = customTo ? new Date(customTo + 'T23:59:59').toISOString() : undefined;
        const data = await storeService.getStoreAnalytics(selectedStoreId, dateRange, fromIso, toIso);
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setIsFetchingAnalytics(false);
      }
    }
    loadAnalytics();
  }, [selectedStoreId, dateRange, customFrom, customTo]);

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

  const totalSocialClicks = analytics
    ? (analytics.whatsappClicks || 0) +
      (analytics.instagramClicks || 0) +
      (analytics.facebookClicks || 0) +
      (analytics.websiteClicks || 0)
    : 0;

  const campaignEntries = analytics?.campaignBreakdown
    ? Object.entries(analytics.campaignBreakdown)
    : [];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Review & Campaign Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time tracking of customer QR scans, draft formulations, Google Review handoffs, and QR campaign tags.
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

      {/* Date Range Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Time Period:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {DATE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setDateRange(filter.value)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  dateRange === filter.value
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Pickers */}
        {dateRange === 'custom' && (
          <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 flex flex-wrap items-center gap-4 text-xs font-semibold text-indigo-950">
            <div className="flex items-center gap-2">
              <label>From:</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label>To:</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {(!customFrom || !customTo) && (
              <span className="text-[11px] text-indigo-600 italic">Select both start and end dates to apply custom filter</span>
            )}
          </div>
        )}
      </div>

      {isFetchingAnalytics ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Updating metrics...</p>
        </div>
      ) : analytics ? (
        <>
          {/* Section 1: Core Review Funnel KPI Cards */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Google Review Funnel Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Page Views */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">QR Code Scans</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900">{analytics.pageViews}</p>
                <p className="text-[11px] text-slate-400 mt-1">Total in-store QR scans</p>
              </div>

              {/* Card 2: Drafts Formulated */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Drafts Formulated</span>
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900">{analytics.draftsGenerated}</p>
                <p className="text-[11px] text-slate-400 mt-1">Personalized reviews generated</p>
              </div>

              {/* Card 3: Google Clicks */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Google Review Clicks</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900">{analytics.googleClicks}</p>
                <p className="text-[11px] text-slate-400 mt-1">High-intent handoffs to Google page</p>
              </div>

              {/* Card 4: Conversion Rate */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Handoff Conversion</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900">
                  {analytics.clickThroughRate}%
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Draft formulations to Google clicks</p>
              </div>
            </div>
          </div>

          {/* Section 2: Social Media & Direct Engagement KPIs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Social Media & Customer Engagement Clicks
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                Total Social Interactions: <strong className="text-slate-900">{totalSocialClicks}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* WhatsApp */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">WhatsApp</p>
                  <p className="text-xl font-extrabold text-slate-900">{analytics.whatsappClicks || 0}</p>
                  <p className="text-[10px] text-slate-400">Direct chats</p>
                </div>
              </div>

              {/* Instagram */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Instagram</p>
                  <p className="text-xl font-extrabold text-slate-900">{analytics.instagramClicks || 0}</p>
                  <p className="text-[10px] text-slate-400">Profile visits</p>
                </div>
              </div>

              {/* Facebook */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Facebook className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Facebook</p>
                  <p className="text-xl font-extrabold text-slate-900">{analytics.facebookClicks || 0}</p>
                  <p className="text-[10px] text-slate-400">Page visits</p>
                </div>
              </div>

              {/* Website */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Website</p>
                  <p className="text-xl font-extrabold text-slate-900">{analytics.websiteClicks || 0}</p>
                  <p className="text-[10px] text-slate-400">Outbound visits</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: QR Campaign Breakdown */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-600" />
                  QR Placement & Campaign Performance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Performance across your billing counters, dining tables, standees, and custom campaign tags.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                {campaignEntries.length} Active Placements
              </span>
            </div>

            {campaignEntries.length > 0 ? (
              <div className="space-y-3 pt-2">
                {campaignEntries.map(([campaignName, count]) => {
                  const percent = analytics.pageViews > 0
                    ? Math.round((count / analytics.pageViews) * 100)
                    : 0;
                  return (
                    <div key={campaignName} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          <code className="text-indigo-900 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {campaignName}
                          </code>
                        </span>
                        <span className="text-slate-700">
                          {count} scans ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                <Tag className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No Specific Campaign Tags Tracked Yet</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  When you download QR standees from the <strong>QR Standee Studio</strong>, select presets like <em>Billing Counter</em> or <em>Dining Table</em>. Customer scans will automatically appear here.
                </p>
              </div>
            )}
          </div>

          {/* Section 4: Visual Conversion Funnel */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-6">In-Store Customer Conversion Funnel</h3>

            <div className="space-y-6">
              {/* Step 1 */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">1. QR Standee Scanned (Page Views)</span>
                  <span className="text-slate-900">{analytics.pageViews} scans (100%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">2. Review Formulated (AI / Personal Draft)</span>
                  <span className="text-slate-900">
                    {analytics.draftsGenerated} drafts ({analytics.generationRate}% of scans)
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
                    {analytics.googleClicks} handoffs ({analytics.clickThroughRate}% of drafts)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, analytics.clickThroughRate || 0)}%` }}
                  />
                </div>
              </div>

              {/* Step 4 */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">4. Social Channel Engagement (WhatsApp, Instagram, etc.)</span>
                  <span className="text-slate-900">
                    {totalSocialClicks} social taps
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${analytics.pageViews > 0 ? Math.min(100, Math.round((totalSocialClicks / analytics.pageViews) * 100)) : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Mandatory Compliance and Distinction Box */}
            <div className="mt-8 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold text-amber-950">Draft Generation vs. Published Google Reviews: </span>
                Magic Review tracks customer review formulations and the high-intent moment when a customer copies their draft and opens your Google review URL. Due to Google Maps policy and privacy standards, third-party platforms cannot directly detect private user submission completion without an enterprise Google Business Profile OAuth connection. We strictly guarantee that no reviews are gated or artificially filtered.
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};