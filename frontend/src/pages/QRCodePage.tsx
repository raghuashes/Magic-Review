import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  Copy,
  ExternalLink,
  Star,
  Printer,
  Sparkles,
  Loader2,
  Store as StoreIcon
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { Store } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { Toast } from '../components/Toast';
import { getErrorMessage } from '../services/api';

export const QRCodePage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadStores() {
      try {
        setIsLoading(true);
        const data = await storeService.listStores();
        setStores(data);
        if (data.length > 0) {
          setSelectedStore(data[0]);
        }
      } catch (err) {
        alert(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    loadStores();
  }, []);

  const targetUrl = selectedStore ? `${window.location.origin}/s/${selectedStore.slug}` : '';

  const handleCopy = async () => {
    if (!targetUrl) return;
    const ok = await copyToClipboard(targetUrl);
    if (ok) setToastMessage('Public review URL copied to clipboard!');
  };

  const handleDownload = () => {
    if (!selectedStore) return;
    const svg = document.getElementById('full-qr-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1000;
    canvas.height = 1000;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 800, 800);

        const a = document.createElement('a');
        a.download = `${selectedStore.slug}-qr-standee.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        setToastMessage('High-resolution QR Standee downloaded!');
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading QR Standee Center...</p>
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">QR Standee Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Download print-ready counter standees customized with your brand colors and direct review links.
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
                if (s) setSelectedStore(s);
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
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Standee Visual Mockup */}
          <div className="bg-slate-100 p-8 sm:p-12 rounded-3xl flex justify-center border border-slate-200">
            <div
              className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border-4 flex flex-col items-center text-center relative"
              style={{ borderColor: selectedStore.primaryColor || '#4F46E5' }}
            >
              {/* Badge */}
              <div
                className="px-4 py-1.5 rounded-full text-xs font-bold text-white mb-4 shadow-sm"
                style={{ backgroundColor: selectedStore.primaryColor || '#4F46E5' }}
              >
                ⭐ Review Us on Google
              </div>

              <h3 className="font-extrabold text-slate-900 text-2xl mb-1 leading-snug">
                {selectedStore.name}
              </h3>
              <p className="text-xs text-slate-500 mb-3">{selectedStore.description || 'Scan to formulate your review'}</p>

              <div className="flex items-center gap-1.5 text-amber-400 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400" />
                ))}
              </div>

              {/* QR Code SVG */}
              <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-200 mb-6">
                <QRCodeSVG
                  id="full-qr-svg"
                  value={targetUrl}
                  size={220}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-3 w-full border border-slate-100 mb-2">
                <p className="text-xs font-bold text-slate-800">1. Open Phone Camera</p>
                <p className="text-[11px] text-slate-500 mt-0.5">2. Tap to formulate review in Telugu, Hindi, or English</p>
                <p className="text-[11px] text-slate-500">3. 1-tap copy & post on Google</p>
              </div>

              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                Powered by MagicReview.in
              </p>
            </div>
          </div>

          {/* Right: Actions & Print Recommendations */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-900 text-lg">Download Standee Assets</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use our high-resolution PNG for 4x6 inch acrylic tent cards, table displays, or billing counter stickers.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download High-Res PNG
                </button>
                <a
                  href={`/api/stores/${selectedStore.id}/qr?size=600`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Direct QR Stream
                </a>
              </div>

              {/* URL Pill */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Direct Customer Review Link
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
                    title="Open link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* In-Store Counter Best Practices */}
            <div className="bg-indigo-50/70 rounded-3xl p-6 border border-indigo-100">
              <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Tips to Maximize Reviews at Checkout
              </h4>
              <ul className="text-xs text-indigo-900 space-y-2 leading-relaxed">
                <li>• Place acrylic standees directly in front of the card/UPI payment machine.</li>
                <li>• Train cashiers to say: <em>"Sir/Ma'am, please scan this standee on your way out — it takes just 15 seconds to leave your review!"</em></li>
                <li>• Remind customers they can choose Telugu or Hindi so they feel comfortable.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
