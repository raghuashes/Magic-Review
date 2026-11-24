import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  Copy,
  ExternalLink,
  Star,
  Printer,
  Sparkles,
  Loader2,
  Store as StoreIcon,
  Tag,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  FileDown
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { Store } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { Toast } from '../components/Toast';
import { getErrorMessage } from '../services/api';

const CAMPAIGN_PRESETS = [
  { label: 'General Standee', value: '' },
  { label: 'Billing Counter', value: 'counter' },
  { label: 'Dining Table', value: 'table-1' },
  { label: 'Entrance Standee', value: 'entrance' },
  { label: 'Takeaway Pickup', value: 'takeaway' },
  { label: 'Custom Campaign', value: 'custom' },
];

export const QRCodePage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // QR Customization States
  const [selectedCampaignPreset, setSelectedCampaignPreset] = useState<string>('');
  const [customCampaignName, setCustomCampaignName] = useState<string>('');
  const [qrFgColor, setQrFgColor] = useState<string>('#0F172A');
  const [qrBgColor, setQrBgColor] = useState<string>('#FFFFFF');
  const [embedLogo, setEmbedLogo] = useState<boolean>(true);

  const standeeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadStores() {
      try {
        setIsLoading(true);
        const data = await storeService.listStores();
        setStores(data);
        if (data.length > 0) {
          const first = data[0];
          setSelectedStore(first);
          if (first.primaryColor) {
            setQrFgColor(first.primaryColor);
          }
        }
      } catch (err) {
        alert(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    loadStores();
  }, []);

  // Update QR color default when switching stores
  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
    if (store.primaryColor) {
      setQrFgColor(store.primaryColor);
    }
  };

  // Determine active campaign tag
  const activeCampaignTag =
    selectedCampaignPreset === 'custom'
      ? customCampaignName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
      : selectedCampaignPreset;

  // Build target URL
  const baseReviewUrl = selectedStore ? `${window.location.origin}/s/${selectedStore.slug}` : '';
  const targetUrl = activeCampaignTag
    ? `${baseReviewUrl}?campaign=${encodeURIComponent(activeCampaignTag)}`
    : baseReviewUrl;

  const handleCopy = async () => {
    if (!targetUrl) return;
    const ok = await copyToClipboard(targetUrl);
    if (ok) setToastMessage('Public review URL copied to clipboard!');
  };

  // 1. Download Standalone QR Code as PNG (high-res 1000x1000)
  const handleDownloadQrPng = () => {
    if (!selectedStore) return;
    const svg = document.getElementById('main-qr-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1200;
    canvas.height = 1200;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = qrBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 1000, 1000);

        const a = document.createElement('a');
        const campSuffix = activeCampaignTag ? `-${activeCampaignTag}` : '';
        a.download = `${selectedStore.slug}-qr${campSuffix}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        setToastMessage('High-resolution QR Code downloaded!');
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // 2. Download Complete Standee Card as PNG
  const handleDownloadStandeePng = () => {
    if (!selectedStore) return;
    const svg = document.getElementById('main-qr-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const qrImg = new Image();

    // 4:6 Aspect Ratio canvas (1200 x 1800 px) for high quality print
    canvas.width = 1200;
    canvas.height = 1800;

    qrImg.onload = () => {
      if (!ctx) return;

      // Background Card
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top Accent Banner
      const primary = selectedStore.primaryColor || '#4F46E5';
      ctx.fillStyle = primary;
      ctx.fillRect(0, 0, canvas.width, 240);

      // Top Banner Header Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⭐ REVIEW US ON GOOGLE', canvas.width / 2, 140);

      // Store Name
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 64px sans-serif';
      ctx.fillText(selectedStore.name, canvas.width / 2, 360);

      // Store Category or Description
      ctx.fillStyle = '#64748B';
      ctx.font = '32px sans-serif';
      const desc = selectedStore.businessCategory || selectedStore.description || 'Scan to share your genuine experience';
      ctx.fillText(desc.slice(0, 50), canvas.width / 2, 420);

      // 5 Gold Stars
      ctx.fillStyle = '#F59E0B';
      ctx.font = '48px sans-serif';
      ctx.fillText('★ ★ ★ ★ ★', canvas.width / 2, 490);

      // QR Code Container Box
      const qrBoxSize = 740;
      const qrBoxX = (canvas.width - qrBoxSize) / 2;
      const qrBoxY = 540;
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 4;
      ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
      ctx.fillStyle = qrBgColor;
      ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

      // Draw QR Code
      const qrDrawPadding = 30;
      ctx.drawImage(
        qrImg,
        qrBoxX + qrDrawPadding,
        qrBoxY + qrDrawPadding,
        qrBoxSize - qrDrawPadding * 2,
        qrBoxSize - qrDrawPadding * 2
      );

      // Instructions Box
      const instY = 1350;
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(100, instY, 1000, 240);
      ctx.strokeStyle = '#E2E8F0';
      ctx.strokeRect(100, instY, 1000, 240);

      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('1. Open Phone Camera & Scan QR Code', 150, instY + 65);

      ctx.fillStyle = '#475569';
      ctx.font = '28px sans-serif';
      ctx.fillText('2. Formulate your review in English, Telugu or Hindi mix', 150, instY + 125);
      ctx.fillText('3. 1-tap copy and publish on Google Reviews', 150, instY + 185);

      // Footer
      ctx.fillStyle = '#94A3B8';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Powered by MagicReview.in', canvas.width / 2, 1680);

      // Trigger download
      const a = document.createElement('a');
      const campSuffix = activeCampaignTag ? `-${activeCampaignTag}` : '';
      a.download = `${selectedStore.slug}-standee-card${campSuffix}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      setToastMessage('Complete High-Res Standee Card downloaded!');
    };

    qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // 3. Print Standee / Save as PDF via Browser Print
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading QR Standee Studio...</p>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">No Stores Created Yet</h2>
        <p className="text-sm text-slate-500 mt-1">Please create a store first to generate its QR standee.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">QR Standee Studio</h1>
          <p className="text-sm text-slate-500 mt-1">
            Design, brand, and download print-ready acrylic tent cards, counter standees, and campaign QR codes.
          </p>
        </div>

        {/* Store Selector */}
        {stores.length > 1 && (
          <div className="flex items-center gap-2">
            <StoreIcon className="w-4 h-4 text-slate-400" />
            <select
              value={selectedStore?.id}
              onChange={(e) => {
                const s = stores.find((st) => st.id === e.target.value);
                if (s) handleSelectStore(s);
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedStore && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Standee Preview Mockup (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-100 p-6 sm:p-10 rounded-3xl flex justify-center border border-slate-200 shadow-inner">
              {/* Actual Printable Standee Card */}
              <div
                ref={standeeRef}
                id="printable-standee"
                className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border-4 flex flex-col items-center text-center relative"
                style={{ borderColor: selectedStore.primaryColor || '#4F46E5' }}
              >
                {/* Standee Banner */}
                <div
                  className="w-full py-4 px-6 text-white text-center shadow-sm"
                  style={{ backgroundColor: selectedStore.primaryColor || '#4F46E5' }}
                >
                  <p className="text-xs uppercase font-extrabold tracking-widest flex items-center justify-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-300" />
                    Review Us on Google
                  </p>
                </div>

                <div className="p-6 flex flex-col items-center w-full">
                  {/* Store Name & Category */}
                  <h3 className="font-extrabold text-slate-900 text-2xl mb-1 leading-snug">
                    {selectedStore.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2 font-medium">
                    {selectedStore.businessCategory || selectedStore.description || 'Scan to share your feedback'}
                  </p>

                  {/* 5 Stars */}
                  <div className="flex items-center gap-1 text-amber-400 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400" />
                    ))}
                  </div>

                  {/* QR Code SVG */}
                  <div
                    className="p-4 rounded-2xl shadow-sm border border-slate-200 mb-5 flex items-center justify-center transition-all"
                    style={{ backgroundColor: qrBgColor }}
                  >
                    <QRCodeSVG
                      id="main-qr-svg"
                      value={targetUrl}
                      size={200}
                      level="H"
                      fgColor={qrFgColor}
                      bgColor={qrBgColor}
                      includeMargin={false}
                      imageSettings={
                        embedLogo && selectedStore.logoUrl
                          ? {
                              src: selectedStore.logoUrl,
                              x: undefined,
                              y: undefined,
                              height: 42,
                              width: 42,
                              excavate: true,
                            }
                          : undefined
                      }
                    />
                  </div>

                  {/* Campaign Pill indicator on preview */}
                  {activeCampaignTag && (
                    <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
                      <Tag className="w-3 h-3 text-indigo-600" />
                      Campaign: {activeCampaignTag}
                    </div>
                  )}

                  {/* 3 Step Instruction Card */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 w-full border border-slate-100 text-left space-y-1 mb-3">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] inline-flex items-center justify-center font-bold">1</span>
                      Point Camera & Tap Link
                    </p>
                    <p className="text-[11px] text-slate-600 pl-5.5">
                      Choose English, Telugu mix or Hindi mix
                    </p>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pt-1">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] inline-flex items-center justify-center font-bold">2</span>
                      1-Tap Copy & Post on Google
                    </p>
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono tracking-tight">
                    Powered by MagicReview.in
                  </p>
                </div>
              </div>
            </div>

            {/* Quick URL Box */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm print:hidden">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Customer Review URL
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="truncate text-slate-700 font-mono select-all flex-1">{targetUrl}</span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors"
                  title="Copy Link"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors"
                  title="Test Link in New Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Customization & Actions (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-6 print:hidden">
            {/* 1. Campaign Tracking Configuration */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                QR Placement & Campaign Tracking
              </h3>
              <p className="text-xs text-slate-500">
                Generate distinct QR codes for your billing counters, individual dining tables, or standees to track where your reviews originate.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CAMPAIGN_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSelectedCampaignPreset(preset.value)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      selectedCampaignPreset === preset.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {selectedCampaignPreset === 'custom' && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custom Campaign Identifier
                  </label>
                  <input
                    type="text"
                    value={customCampaignName}
                    onChange={(e) => setCustomCampaignName(e.target.value)}
                    placeholder="e.g. table-4, valet-stand, takeaway-bag"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Appends <code>?campaign={activeCampaignTag || '...'}</code> to review URL.
                  </p>
                </div>
              )}
            </div>

            {/* 2. QR Code Colors & Logo Customization */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600" />
                QR Visual Branding & Styling
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  QR Pattern Color
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: 'Store Brand', color: selectedStore.primaryColor || '#4F46E5' },
                    { label: 'Obsidian', color: '#0F172A' },
                    { label: 'Deep Indigo', color: '#312E81' },
                    { label: 'Emerald', color: '#065F46' },
                    { label: 'Crimson', color: '#991B1B' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setQrFgColor(c.color)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        qrFgColor === c.color
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-200" style={{ backgroundColor: c.color }} />
                      {c.label}
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <input
                      type="color"
                      value={qrFgColor}
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                      title="Choose custom HEX color"
                    />
                  </div>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  QR Background Color
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Pure White', color: '#FFFFFF' },
                    { label: 'Soft Cream', color: '#FFFDF5' },
                    { label: 'Cool Slate', color: '#F8FAFC' },
                  ].map((bg) => (
                    <button
                      key={bg.color}
                      type="button"
                      onClick={() => setQrBgColor(bg.color)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        qrBgColor === bg.color
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: bg.color }} />
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Embedding Toggle */}
              {selectedStore.logoUrl && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Center Merchant Logo</p>
                      <p className="text-[11px] text-slate-500">Embed your brand logo inside the QR code matrix</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={embedLogo}
                      onChange={(e) => setEmbedLogo(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              )}
            </div>

            {/* 3. Export & Download Actions */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Export & Print Actions</h3>
              <p className="text-xs text-slate-500">
                Choose the format you need for printing table tents, counter acrylics, or digital promotions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleDownloadStandeePng}
                  className="inline-flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all text-center"
                >
                  <Download className="w-5 h-5" />
                  <span>Standee PNG</span>
                  <span className="text-[10px] font-normal opacity-80">Full Card (1200x1800)</span>
                </button>

                <button
                  onClick={handleDownloadQrPng}
                  className="inline-flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-bold text-xs transition-colors text-center"
                >
                  <FileDown className="w-5 h-5 text-slate-600" />
                  <span>QR Code Only</span>
                  <span className="text-[10px] font-normal text-slate-500">PNG (1200x1200)</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="inline-flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-bold text-xs transition-colors text-center"
                >
                  <Printer className="w-5 h-5 text-slate-600" />
                  <span>Print Standee</span>
                  <span className="text-[10px] font-normal text-slate-500">A5 / 4x6" PDF print</span>
                </button>
              </div>
            </div>

            {/* In-Store Counter Playbook */}
            <div className="bg-indigo-50/70 rounded-3xl p-6 border border-indigo-100">
              <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Checkout Counter Conversion Tips
              </h4>
              <ul className="text-xs text-indigo-900 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Place by the Card Machine:</strong> Keep the acrylic standee directly in line with customer eye level during billing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Staff Script:</strong> <em>"Sir/Ma'am, please scan this standee on your way out — it takes just 15 seconds to leave your review!"</em></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Campaigns:</strong> Place distinct tags on Dining Tables vs Billing Counters to compare where your happiest customers scan.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};