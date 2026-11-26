import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store as StoreIcon,
  Plus,
  ExternalLink,
  QrCode,
  Settings2,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { storeService } from '../services/storeService';
import { Store, StoreRequest, BUSINESS_CATEGORIES } from '../types';
import { QRCodeModal } from '../components/QRCodeModal';
import { Toast } from '../components/Toast';
import { getErrorMessage } from '../services/api';

export const DashboardPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Store Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStore, setNewStore] = useState<StoreRequest>({
    name: '',
    slug: '',
    businessCategory: 'Restaurant',
    specialties: '',
    description: '',
    googleReviewUrl: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#06B6D4',
  });
  const [isCreating, setIsCreating] = useState(false);

  // QR Modal State
  const [selectedQrStore, setSelectedQrStore] = useState<Store | null>(null);

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const data = await storeService.listStores();
      setStores(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await storeService.createStore(newStore);
      setIsModalOpen(false);
      setNewStore({
        name: '',
        slug: '',
        businessCategory: 'Restaurant',
        specialties: '',
        description: '',
        googleReviewUrl: '',
        primaryColor: '#4F46E5',
        secondaryColor: '#06B6D4',
      });
      setToastMessage('Store created successfully with default review tags!');
      fetchStores();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteStore = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await storeService.deleteStore(id);
      setToastMessage('Store deleted successfully');
      setStores((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Locations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your stores, customize review categories & attributes, and generate QR standees.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Store
        </button>
      </div>

      {/* Loading & Error States */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Fetching your stores...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-4 text-rose-700">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <StoreIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Stores Created Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Add your first retail store or clinic to start collecting customer Google reviews.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Your First Store
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              <div
                className="h-3 w-full"
                style={{ backgroundColor: store.primaryColor || '#4F46E5' }}
              />
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-snug">{store.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">/s/{store.slug}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      store.active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {store.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 flex-1">
                  {store.description || 'No description provided.'}
                </p>

                {/* Public link preview */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs mb-4">
                  <span className="text-slate-500 font-medium">Customer Review Page</span>
                  <Link
                    to={`/s/${store.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Open
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedQrStore(store)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR Standee
                  </button>
                  <Link
                    to={`/dashboard/stores/${store.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    Configure
                  </Link>
                  <button
                    onClick={() => handleDeleteStore(store.id, store.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Store"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Add New Store</h3>
                <p className="text-xs text-slate-500">Configure your local business profile</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Store / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  placeholder="e.g. Sri Sai Jewellers"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Category *
                </label>
                <select
                  value={newStore.businessCategory || 'Restaurant'}
                  onChange={(e) => setNewStore({ ...newStore, businessCategory: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                >
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-0.5">Seeds your store with tailored category attributes and vocabulary.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Specialties / Offerings (Optional)
                </label>
                <input
                  type="text"
                  value={newStore.specialties || ''}
                  onChange={(e) => setNewStore({ ...newStore, specialties: e.target.value })}
                  placeholder="e.g. Biryani, family dining, fresh juices"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom Slug (optional)
                </label>
                <input
                  type="text"
                  value={newStore.slug}
                  onChange={(e) => setNewStore({ ...newStore, slug: e.target.value })}
                  placeholder="e.g. sri-sai-jewellers"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">Leaves blank to auto-generate from store name.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Google Review URL *
                </label>
                <input
                  type="url"
                  required
                  value={newStore.googleReviewUrl}
                  onChange={(e) => setNewStore({ ...newStore, googleReviewUrl: e.target.value })}
                  placeholder="https://g.page/r/YOUR_ID/review or https://search.google.com/local/writereview?placeid=..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">Where customers are directed with their copied review.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={newStore.description}
                  onChange={(e) => setNewStore({ ...newStore, description: e.target.value })}
                  placeholder="e.g. Premier gold, diamond & bridal jewellery in Hyderabad"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newStore.primaryColor}
                      onChange={(e) => setNewStore({ ...newStore, primaryColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={newStore.primaryColor}
                      onChange={(e) => setNewStore({ ...newStore, primaryColor: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono uppercase"
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
                      value={newStore.secondaryColor}
                      onChange={(e) => setNewStore({ ...newStore, secondaryColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={newStore.secondaryColor}
                      onChange={(e) => setNewStore({ ...newStore, secondaryColor: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {isCreating ? 'Creating Store...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {selectedQrStore && (
        <QRCodeModal
          store={selectedQrStore}
          onClose={() => setSelectedQrStore(null)}
          onShowToast={(msg) => setToastMessage(msg)}
        />
      )}
    </div>
  );
};
