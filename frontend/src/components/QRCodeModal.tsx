import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy, ExternalLink, Star } from 'lucide-react';
import { Store } from '../types';
import { copyToClipboard } from '../utils/clipboard';

interface QRCodeModalProps {
  store: Store;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ store, onClose, onShowToast }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const targetUrl = `${window.location.origin}/s/${store.slug}`;

  const handleCopy = async () => {
    const ok = await copyToClipboard(targetUrl);
    if (ok) onShowToast('Public review link copied to clipboard!');
  };

  const handleDownload = () => {
    // Generate an image via canvas for clean download
    const svg = document.getElementById('store-qr-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 600;
    canvas.height = 600;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 50, 50, 500, 500);

        const a = document.createElement('a');
        a.download = `${store.slug}-qrcode.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        onShowToast('QR Code downloaded successfully!');
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Store QR Standee</h3>
            <p className="text-xs text-slate-500">{store.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Standee Preview Card */}
        <div className="p-6 flex flex-col items-center bg-slate-50/50">
          <div
            ref={printRef}
            className="w-full max-w-xs bg-white rounded-2xl p-6 shadow-md border-2 border-slate-200 flex flex-col items-center text-center relative"
            style={{ borderColor: store.primaryColor || '#4F46E5' }}
          >
            {/* Top Badge */}
            <div
              className="px-3 py-1 rounded-full text-[11px] font-bold text-white mb-3 shadow-sm"
              style={{ backgroundColor: store.primaryColor || '#4F46E5' }}
            >
              ⭐ Rate Your Experience
            </div>

            <h4 className="font-bold text-slate-900 text-lg mb-1 leading-snug">{store.name}</h4>
            <div className="flex items-center gap-1 text-amber-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>

            {/* QR SVG */}
            <div className="p-3 bg-white rounded-xl shadow-inner border border-slate-100 mb-4">
              <QRCodeSVG
                id="store-qr-svg"
                value={targetUrl}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="text-xs font-semibold text-slate-700">Scan with your Phone Camera</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Quick 1-tap review formulation</p>
          </div>

          {/* URL Pill */}
          <div className="w-full mt-4 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <span className="truncate text-slate-600 font-mono select-all">{targetUrl}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleCopy}
                className="p-1 text-slate-600 hover:text-indigo-600 rounded hover:bg-white transition-colors"
                title="Copy link"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <a
                href={targetUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-slate-600 hover:text-indigo-600 rounded hover:bg-white transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Download Standee PNG
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
