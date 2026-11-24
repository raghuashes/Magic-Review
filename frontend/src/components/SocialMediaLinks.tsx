import React from 'react';
import { MessageCircle, Instagram, Facebook, Globe, ExternalLink } from 'lucide-react';
import { formatWhatsAppUrl, formatInstagramUrl, formatFacebookUrl, formatWebsiteUrl } from '../utils/social';

interface SocialMediaLinksProps {
  whatsapp?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  storeName?: string;
  onLinkClick?: (platform: 'whatsapp' | 'instagram' | 'facebook' | 'website') => void;
}

export const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  whatsapp,
  instagramUrl,
  facebookUrl,
  websiteUrl,
  storeName,
  onLinkClick,
}) => {
  const waUrl = formatWhatsAppUrl(whatsapp);
  const igUrl = formatInstagramUrl(instagramUrl);
  const fbUrl = formatFacebookUrl(facebookUrl);
  const webUrl = formatWebsiteUrl(websiteUrl);

  const hasAnySocial = Boolean(waUrl || igUrl || fbUrl || webUrl);

  if (!hasAnySocial) {
    return null;
  }

  const handleClick = (platform: 'whatsapp' | 'instagram' | 'facebook' | 'website') => {
    if (onLinkClick) {
      onLinkClick(platform);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-lg space-y-4">
      <div className="text-center space-y-1">
        <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Stay in touch</span>
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">CONNECT WITH US</h3>
        <p className="text-xs text-slate-500 font-medium">
          Follow {storeName || 'our business'} on your favorite platforms for exclusive updates & offers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {/* WhatsApp */}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick('whatsapp')}
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-all font-bold text-xs group shadow-sm hover:shadow"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-slate-900 font-bold leading-tight">WhatsApp</p>
                <p className="text-[11px] text-emerald-700 font-medium">Chat With Us</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}

        {/* Instagram */}
        {igUrl && (
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick('instagram')}
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 text-pink-900 border border-pink-200/80 transition-all font-bold text-xs group shadow-sm hover:shadow"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-slate-900 font-bold leading-tight">Instagram</p>
                <p className="text-[11px] text-pink-700 font-medium">Follow Us</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-pink-500 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}

        {/* Facebook */}
        {fbUrl && (
          <a
            href={fbUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick('facebook')}
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 transition-all font-bold text-xs group shadow-sm hover:shadow"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Facebook className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-slate-900 font-bold leading-tight">Facebook</p>
                <p className="text-[11px] text-blue-700 font-medium">Visit Our Page</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}

        {/* Website */}
        {webUrl && (
          <a
            href={webUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick('website')}
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 transition-all font-bold text-xs group shadow-sm hover:shadow"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-slate-900 font-bold leading-tight">Official Website</p>
                <p className="text-[11px] text-indigo-700 font-medium">Visit Website</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}
      </div>
    </div>
  );
};
