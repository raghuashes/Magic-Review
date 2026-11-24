import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  QrCode,
  Loader2,
  Palette,
  Tag,
  Layers,
  Building2,
  Share2,
  Star,
  MessageCircle,
  Instagram,
  Facebook,
  Globe,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Eye
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { Store, Category, Attribute, StoreRequest } from '../types';
import { QRCodeModal } from '../components/QRCodeModal';
import { Toast } from '../components/Toast';
import { getErrorMessage } from '../services/api';
import { formatWhatsAppUrl, formatInstagramUrl, formatFacebookUrl, formatWebsiteUrl } from '../utils/social';

const POSTER_PRESETS = [
  {
    name: 'Jewellery Boutique',
    url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Restaurant / Cafe',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Salon & Spa',
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Clothing / Fashion',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Clinic / Healthcare',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Repair / Services',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
];

const CATEGORY_PRESETS = [
  'Jewellery Store',
  'Restaurant & Dining',
  'Cafe & Bakery',
  'Salon & Beauty Spa',
  'Clothing & Apparel',
  'Clinic & Healthcare',
  'Automobile & Repair',
  'Electronics & Retail',
  'Fitness & Gym',
  'General Local Business'
];

type ActiveTab = 'business' | 'branding' | 'social' | 'google' | 'tags';

export const StoreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('business');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<StoreRequest>({
    name: '',
    slug: '',
    description: '',
    businessCategory: 'General Local Business',
    businessEmail: '',
    phone: '',
    address: '',
    logoUrl: '',
    posterUrl: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#06B6D4',
    welcomeMessage: '',
    thankYouMessage: '',
    whatsapp: '',
    instagramUrl: '',
    facebookUrl: '',
    websiteUrl: '',
    googleReviewUrl: '',
    active: true,
  });

  // Category & Attribute Creation Inputs
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newAttributeLabel, setNewAttributeLabel] = useState('');

  // QR Modal State
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setIsLoading(true);
        const [storeData, catData, attrData] = await Promise.all([
          storeService.getStore(id),
          storeService.listCategories(id),
          storeService.listAttributes(id),
        ]);
        setStore(storeData);
        setCategories(catData);
        setAttributes(attrData);
        setFormData({
          name: storeData.name || '',
          slug: storeData.slug || '',
          description: storeData.description || '',
          businessCategory: storeData.businessCategory || 'General Local Business',
          businessEmail: storeData.businessEmail || '',
          phone: storeData.phone || '',
          address: storeData.address || '',
          logoUrl: storeData.logoUrl || '',
          posterUrl: storeData.posterUrl || '',
          primaryColor: storeData.primaryColor || '#4F46E5',
          secondaryColor: storeData.secondaryColor || '#06B6D4',
          welcomeMessage: storeData.welcomeMessage || '',
          thankYouMessage: storeData.thankYouMessage || '',
          whatsapp: storeData.whatsapp || '',
          instagramUrl: storeData.instagramUrl || '',
          facebookUrl: storeData.facebookUrl || '',
          websiteUrl: storeData.websiteUrl || '',
          googleReviewUrl: storeData.googleReviewUrl || '',
          active: storeData.active !== undefined ? storeData.active : true,
        });
      } catch (err) {
        alert(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSaveStore = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!id) return;
    setIsSaving(true);
    try {
      const updated = await storeService.updateStore(id, formData);
      setStore(updated);
      setToastMessage('Store profile, branding, and social settings saved successfully!');
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Category handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newCategoryName.trim()) return;
    try {
      const created = await storeService.createCategory(id, { name: newCategoryName.trim(), active: true });
      setCategories((prev) => [...prev, created]);
      setNewCategoryName('');
      setToastMessage('Category added!');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleToggleCategory = async (cat: Category) => {
    if (!id) return;
    try {
      const updated = await storeService.updateCategory(id, cat.id, { name: cat.name, active: !cat.active });
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!id) return;
    try {
      await storeService.deleteCategory(id, categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      setToastMessage('Category removed');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // Attribute handlers
  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newAttributeLabel.trim()) return;
    try {
      const created = await storeService.createAttribute(id, { label: newAttributeLabel.trim(), active: true });
      setAttributes((prev) => [...prev, created]);
      setNewAttributeLabel('');
      setToastMessage('Attribute tag added!');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleToggleAttribute = async (attr: Attribute) => {
    if (!id) return;
    try {
      const updated = await storeService.updateAttribute(id, attr.id, { label: attr.label, active: !attr.active });
      setAttributes((prev) => prev.map((a) => (a.id === attr.id ? updated : a)));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleDeleteAttribute = async (attributeId: string) => {
    if (!id) return;
    try {
      await storeService.deleteAttribute(id, attributeId);
      setAttributes((prev) => prev.filter((a) => a.id !== attributeId));
      setToastMessage('Attribute tag removed');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading store profile & settings...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Store Not Found</h2>
        <Link to="/dashboard" className="text-indigo-600 text-sm font-semibold hover:underline mt-2 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const publicReviewUrl = `/s/${formData.slug || store.slug}`;

  return (
    <div className="space-y-6 pb-20">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} duration={3500} />
      )}

      {/* Top Header & Actions Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2.5 text-slate-500 hover:text-slate-800 rounded-2xl hover:bg-slate-100 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight truncate">{formData.name || store.name}</h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  formData.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {formData.active ? 'Active' : 'Draft'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">Public Slug: {publicReviewUrl}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <QrCode className="w-4 h-4 text-slate-600" />
            Standee QR
          </button>
          <Link
            to={publicReviewUrl}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
          >
            <Eye className="w-4 h-4" />
            Live Preview
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>
          <button
            type="button"
            onClick={() => handleSaveStore()}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('business')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'business'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Business Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'branding'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Branding & Cover
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'social'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          Social Media Links
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('google')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'google'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          Google Review URL
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'tags'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          Categories & Tags
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Content */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveStore} className="space-y-6">
            {/* TAB 1: Business Information */}
            {activeTab === 'business' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex items-center gap-2 text-slate-900 pb-3 border-b border-slate-100">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h2 className="text-base font-bold">Business Information</h2>
                    <p className="text-xs text-slate-500">Essential contact details and physical location for your customers.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Business / Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sri Krishna Jewellers"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Business Category
                    </label>
                    <select
                      value={formData.businessCategory || 'General Local Business'}
                      onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                    >
                      {CATEGORY_PRESETS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Public URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Business Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Business Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={formData.businessEmail || ''}
                      onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                      placeholder="contact@yourstore.in"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Store Physical Address / Landmark
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Shop #12, MG Road, Somajiguda, Hyderabad"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Store Description & Tagline
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief intro for your customers (e.g. Hyderabad's trusted gold & diamond boutique since 1998)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Branding & Cover */}
            {activeTab === 'branding' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex items-center gap-2 text-slate-900 pb-3 border-b border-slate-100">
                  <Palette className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h2 className="text-base font-bold">Brand Styling & Cover Imagery</h2>
                    <p className="text-xs text-slate-500">Your logo, storefront cover banner, and brand colors.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Store Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-2"
                  />
                  {formData.logoUrl && (
                    <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-slate-50 p-1 overflow-hidden shadow-sm">
                      <img
                        src={formData.logoUrl}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Storefront Cover Banner / Poster Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.posterUrl || ''}
                    onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-2"
                  />
                  <p className="text-xs text-slate-500 mb-2">Or select from curated industry storefront presets:</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {POSTER_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, posterUrl: preset.url })}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors border ${
                          formData.posterUrl === preset.url
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  {formData.posterUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-36 bg-slate-100 shadow-inner">
                      <img
                        src={formData.posterUrl}
                        alt="Store Cover Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Primary Brand Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.primaryColor || '#4F46E5'}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor || '#4F46E5'}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-28 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Secondary Brand Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.secondaryColor || '#06B6D4'}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={formData.secondaryColor || '#06B6D4'}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-28 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Customer Welcome Greeting
                    </label>
                    <input
                      type="text"
                      value={formData.welcomeMessage || ''}
                      onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                      placeholder="e.g. Welcome to our store! We value your feedback."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Customer Thank-You Message
                    </label>
                    <input
                      type="text"
                      value={formData.thankYouMessage || ''}
                      onChange={(e) => setFormData({ ...formData, thankYouMessage: e.target.value })}
                      placeholder="e.g. Thank you for visiting! We look forward to serving you again."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Social Media Links */}
            {activeTab === 'social' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex items-center gap-2 text-slate-900 pb-3 border-b border-slate-100">
                  <Share2 className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h2 className="text-base font-bold">Social Media & Connect Channels</h2>
                    <p className="text-xs text-slate-500">
                      These links will appear in the "CONNECT WITH US" section on your customer review page.
                    </p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      WhatsApp Number / Chat URL
                    </label>
                    {formData.whatsapp && (
                      <a
                        href={formatWhatsAppUrl(formData.whatsapp) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                      >
                        Test WhatsApp <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="e.g. 919876543210 or +91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Enter your 10-digit mobile number or full chat link.</p>
                </div>

                {/* Instagram */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <Instagram className="w-4 h-4 text-pink-600" />
                      Instagram Profile URL
                    </label>
                    {formData.instagramUrl && (
                      <a
                        href={formatInstagramUrl(formData.instagramUrl) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-pink-600 hover:underline inline-flex items-center gap-1"
                      >
                        Test Instagram <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.instagramUrl || ''}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="e.g. @srikrishnajewellers or https://instagram.com/srikrishnajewellers"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>

                {/* Facebook */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      Facebook Page URL
                    </label>
                    {formData.facebookUrl && (
                      <a
                        href={formatFacebookUrl(formData.facebookUrl) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        Test Facebook <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.facebookUrl || ''}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    placeholder="e.g. https://facebook.com/srikrishnajewellers"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Website */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      Official Website URL
                    </label>
                    {formData.websiteUrl && (
                      <a
                        href={formatWebsiteUrl(formData.websiteUrl) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                      >
                        Test Website <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={formData.websiteUrl || ''}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="e.g. https://srikrishnajewellers.in"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: Google Review Setup */}
            {activeTab === 'google' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex items-center gap-2 text-slate-900 pb-3 border-b border-slate-100">
                  <Star className="w-5 h-5 text-amber-500" />
                  <div>
                    <h2 className="text-base font-bold">Google Review Target Link</h2>
                    <p className="text-xs text-slate-500">Where customers are directed with one tap after copying their drafted review.</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Google Review Direct Link *
                    </label>
                    {formData.googleReviewUrl && (
                      <a
                        href={formData.googleReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                      >
                        Test Google Review URL <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    value={formData.googleReviewUrl}
                    onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                    placeholder="https://g.page/r/YOUR_ID/review or https://search.google.com/local/writereview?placeid=..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-900 leading-relaxed">
                    <p className="font-bold">How to find your Google Review Direct Link:</p>
                    <ol className="list-decimal ml-4 mt-1 space-y-0.5 text-indigo-800">
                      <li>Go to your Google Business Profile on Google Maps or Search.</li>
                      <li>Click the <strong>"Ask for reviews"</strong> button.</li>
                      <li>Copy the short review link (e.g. <code>https://g.page/r/.../review</code>) and paste it here.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Categories & Tags */}
            {activeTab === 'tags' && (
              <div className="space-y-6">
                {/* Categories visited for */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Layers className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h2 className="text-base font-bold">1. Visit Categories</h2>
                        <p className="text-xs text-slate-500">What service or purchase customers visit your business for.</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleAddCategory} className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Custom Bridal Gold, Hair Styling, Takeaway"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </form>

                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                      >
                        <span className={`text-sm font-bold ${cat.active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                          {cat.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleCategory(cat)}
                            className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                              cat.active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-200 text-slate-600 border-slate-300'
                            }`}
                          >
                            {cat.active ? 'Enabled' : 'Disabled'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Tags */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Tag className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h2 className="text-base font-bold">2. Customer Experience Tags</h2>
                        <p className="text-xs text-slate-500">Quick-tap tags customers highlight (e.g. Helpful staff, Quick delivery).</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleAddAttribute} className="flex gap-2">
                    <input
                      type="text"
                      value={newAttributeLabel}
                      onChange={(e) => setNewAttributeLabel(e.target.value)}
                      placeholder="e.g. Great Ambience, Transparent Pricing, Friendly Doctor"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {attributes.map((attr) => (
                      <div
                        key={attr.id}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          attr.active ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                        }`}
                      >
                        <span onClick={() => handleToggleAttribute(attr)} className="cursor-pointer">
                          {attr.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAttribute(attr.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Col: Live Customer Page Interactive Preview Card */}
        <div className="space-y-4">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                Live Customer Preview
              </span>
              <Link
                to={publicReviewUrl}
                target="_blank"
                className="text-[11px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
              >
                Open in tab <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Mobile Device Mockup Frame */}
            <div className="rounded-3xl border-4 border-slate-900 bg-white shadow-2xl overflow-hidden max-w-sm mx-auto">
              {/* Phone Speaker Notch */}
              <div className="bg-slate-900 h-5 w-full flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-700 rounded-full" />
              </div>

              {/* Mockup Header with Cover Banner & Branding */}
              <div
                className="p-5 text-white text-center relative overflow-hidden"
                style={{
                  background: formData.posterUrl
                    ? `linear-gradient(rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.88)), url(${formData.posterUrl}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${formData.primaryColor || '#4F46E5'} 0%, ${formData.secondaryColor || '#06B6D4'} 100%)`,
                }}
              >
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Store logo"
                    className="w-12 h-12 rounded-xl object-contain bg-white p-1 mx-auto shadow mb-2"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg font-black text-white mx-auto mb-2 border border-white/30">
                    {(formData.name || store.name).charAt(0)}
                  </div>
                )}
                <h3 className="font-extrabold text-base leading-tight text-white">{formData.name || store.name}</h3>
                <p className="text-[10px] text-white/80 line-clamp-2 mt-0.5 font-medium">{formData.description || 'Customer review portal'}</p>

                <div className="flex items-center justify-center gap-0.5 text-amber-300 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-300" />
                  ))}
                  <span className="text-[10px] font-bold text-white ml-1">5.0 Star Feedback</span>
                </div>
              </div>

              {/* Mockup Card Content */}
              <div className="p-4 bg-slate-50 space-y-3 text-xs">
                {formData.welcomeMessage && (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[11px] font-medium leading-relaxed text-center">
                    "{formData.welcomeMessage}"
                  </div>
                )}

                <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-slate-500">1. Visited for</div>
                  <div className="flex flex-wrap gap-1">
                    {categories.slice(0, 3).map((c) => (
                      <span
                        key={c.id}
                        className="text-[10px] px-2 py-0.5 rounded-lg font-bold bg-indigo-50 text-indigo-700"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Connect Preview */}
                {(formData.whatsapp || formData.instagramUrl || formData.facebookUrl || formData.websiteUrl) && (
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-1.5 text-center">
                    <p className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">CONNECT WITH US</p>
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {formData.whatsapp && (
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {formData.instagramUrl && (
                        <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-200">
                          <Instagram className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {formData.facebookUrl && (
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                          <Facebook className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {formData.websiteUrl && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-indigo-600 text-white font-bold text-center text-xs shadow-sm">
                  Generate Review Draft ✨
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showQrModal && (
        <QRCodeModal
          store={store}
          onClose={() => setShowQrModal(false)}
          onShowToast={(msg) => setToastMessage(msg)}
        />
      )}
    </div>
  );
};
