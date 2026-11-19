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
  Check,
  Palette,
  Tag,
  Layers
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { Store, Category, Attribute, StoreRequest } from '../types';
import { QRCodeModal } from '../components/QRCodeModal';
import { Toast } from '../components/Toast';
import { getErrorMessage } from '../services/api';

export const StoreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<StoreRequest>({
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#06B6D4',
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
          name: storeData.name,
          slug: storeData.slug,
          description: storeData.description || '',
          logoUrl: storeData.logoUrl || '',
          primaryColor: storeData.primaryColor || '#4F46E5',
          secondaryColor: storeData.secondaryColor || '#06B6D4',
          googleReviewUrl: storeData.googleReviewUrl,
          active: storeData.active,
        });
      } catch (err) {
        alert(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSaving(true);
    try {
      const updated = await storeService.updateStore(id, formData);
      setStore(updated);
      setToastMessage('Store profile and branding saved successfully!');
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
        <p className="text-sm text-slate-500 font-medium">Loading store configurator...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Store Not Found</h2>
        <Link to="/dashboard" className="text-sm font-semibold text-indigo-600 mt-2 inline-block">
          ← Back to Stores
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{store.name}</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Slug: /s/{store.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
          >
            <QrCode className="w-4 h-4" />
            Standee QR
          </button>
          <Link
            to={`/s/${store.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm transition-colors"
          >
            Preview Live
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Store Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-slate-900">
              <Palette className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold">Store Details & Branding</h2>
            </div>

            <form onSubmit={handleSaveStore} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Google Review Link *
                </label>
                <input
                  type="url"
                  required
                  value={formData.googleReviewUrl}
                  onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                  placeholder="https://g.page/r/YOUR_ID/review"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Secondary Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-sm font-semibold text-slate-800">Store Active & Accessible via QR</span>
                </label>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Categories Manager */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-slate-900">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold">Store Categories</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Customers choose one category when formulating their review (e.g., Dining, Bridal Jewellery, Hair Cut).
            </p>

            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New Category (e.g. Diamond Rings)"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </form>

            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(cat)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        cat.active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-transparent'
                      }`}
                      title={cat.active ? 'Active' : 'Inactive'}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <span className={`text-sm font-semibold ${cat.active ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                      {cat.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Attributes Manager */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-slate-900">
              <Tag className="w-5 h-5 text-cyan-600" />
              <h2 className="text-lg font-bold">Review Experience Tags (Attributes)</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Quick tap chips that customer select to describe what they loved (e.g. Helpful staff, Quick service).
            </p>

            <form onSubmit={handleAddAttribute} className="flex gap-2 mb-6">
              <input
                type="text"
                required
                value={newAttributeLabel}
                onChange={(e) => setNewAttributeLabel(e.target.value)}
                placeholder="New Tag (e.g. Transparent Pricing)"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Tag
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {attributes.map((attr) => (
                <div
                  key={attr.id}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    attr.active
                      ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleAttribute(attr)}
                    className="hover:underline"
                  >
                    {attr.label}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAttribute(attr.id)}
                    className="p-0.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Live Standee Visualizer */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24">
            <h3 className="font-bold text-slate-900 text-base mb-1">Customer Page Preview</h3>
            <p className="text-xs text-slate-500 mb-4">
              Changes to your primary color and description update immediately on your public URL.
            </p>

            <div
              className="p-5 rounded-2xl border-2 text-center"
              style={{ borderColor: formData.primaryColor }}
            >
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center font-bold text-white text-lg shadow-md"
                style={{ backgroundColor: formData.primaryColor }}
              >
                {formData.name.charAt(0) || 'M'}
              </div>
              <h4 className="font-bold text-slate-900 text-base">{formData.name}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{formData.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <span
                  className="inline-block px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: formData.secondaryColor }}
                >
                  3 Language Styles Supported
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <QrCode className="w-4 h-4" />
                View & Print Standee QR
              </button>
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
