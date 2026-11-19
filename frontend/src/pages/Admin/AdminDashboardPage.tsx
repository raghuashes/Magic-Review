import React, { useState, useEffect } from 'react';
import {
  Users,
  Store as StoreIcon,
  MousePointer2,
  FileText,
  Eye,
  LogOut,
  Trash2,
  Power,
  PowerOff,
  Search,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminStats, AdminUser, AdminStore } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'stores' | 'merchants'>('stores');

  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, storesData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.getStores(),
        adminService.getUsers()
      ]);
      setStats(statsData);
      setStores(storesData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load admin data', err);
      toast.error('Failed to load platform data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStore = async (id: string) => {
    try {
      const updated = await adminService.toggleStoreStatus(id);
      setStores(stores.map(s => s.id === id ? updated : s));
      toast.success(`Store ${updated.active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error('Failed to toggle store status');
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this store? This cannot be undone.')) return;
    try {
      await adminService.deleteStore(id);
      setStores(stores.filter(s => s.id !== id));
      toast.success('Store deleted');
    } catch (err) {
      toast.error('Failed to delete store');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this merchant account? All their stores will be removed.')) return;
    try {
      await adminService.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      setStores(stores.filter(s => s.ownerId !== id));
      toast.success('Merchant deleted');
    } catch (err) {
      toast.error('Failed to delete merchant');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-medium">Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-none">Magic Review</h1>
              <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Platform Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Merchants"
            value={stats?.totalMerchants || 0}
            icon={<Users className="w-5 h-5" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Stores"
            value={stats?.totalStores || 0}
            icon={<StoreIcon className="w-5 h-5" />}
            color="bg-indigo-500"
          />
          <StatCard
            title="Total Page Views"
            value={stats?.totalPageViews || 0}
            icon={<Eye className="w-5 h-5" />}
            color="bg-emerald-500"
          />
          <StatCard
            title="Drafts → Clicks"
            value={`${stats?.totalDraftsGenerated || 0} / ${stats?.totalGoogleClicks || 0}`}
            subtitle={`Conv. Rate: ${stats?.overallConversionRate || 0}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="bg-orange-500"
          />
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl self-start">
              <button
                onClick={() => setActiveTab('stores')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'stores' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All Stores
              </button>
              <button
                onClick={() => setActiveTab('merchants')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'merchants' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Merchants
              </button>
            </div>

            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'stores' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Store Info</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Owner</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Metrics</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStores.map(store => (
                    <tr key={store.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                            {store.posterUrl ? (
                              <img src={store.posterUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <StoreIcon className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{store.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              /{store.slug}
                              <a href={`/s/${store.slug}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{store.ownerEmail}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{store.ownerId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          <MetricBadge icon={<Eye className="w-3 h-3" />} label="PV" value={store.pageViews} />
                          <MetricBadge icon={<FileText className="w-3 h-3" />} label="DR" value={store.draftsGenerated} />
                          <MetricBadge icon={<MousePointer2 className="w-3 h-3" />} label="CL" value={store.googleClicks} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${store.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                          {store.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStore(store.id)}
                            title={store.active ? 'Deactivate Store' : 'Activate Store'}
                            className={`p-2 rounded-lg transition-colors ${store.active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          >
                            {store.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteStore(store.id)}
                            title="Delete Store"
                            className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStores.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No stores found matching your search</td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Merchant Account</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Stores</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Joined On</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{user.email}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{user.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-900">{user.storeCount}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete User"
                            className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No merchants found matching your search</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-indigo-600 font-semibold mt-1">{subtitle}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

const MetricBadge: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-slate-400">{icon}</span>
    <span className="text-[10px] font-bold text-slate-500 uppercase">{label}:</span>
    <span className="text-xs font-bold text-slate-900">{value}</span>
  </div>
);
