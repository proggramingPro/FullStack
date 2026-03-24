import { useEffect, useState } from 'react';
import { X, Loader2, Users, Home, Calendar, IndianRupee, Check, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAllBookings,
  getAdminOverview,
  getRenterStats,
  type AdminBooking,
  type AdminOverview,
  type RenterStats,
} from '../../lib/adminService';
import { getProfilesByIds } from '../../lib/profileService';
import {
  getHostApplicationsForAdmin,
  updateHostApplicationStatus,
} from '../../lib/hostService';
import type { HostApplication, Profile } from '../../types/database';

interface AdminDashboardProps {
  onClose: () => void;
}

type AdminTab = 'overview' | 'bookings' | 'renters' | 'hosts';

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [renters, setRenters] = useState<RenterStats[]>([]);
  const [hostApps, setHostApps] = useState<HostApplication[]>([]);
  const [hostProfiles, setHostProfiles] = useState<Record<string, Profile | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewData, bookingsData, renterStats, hostApplications] = await Promise.all([
        getAdminOverview(),
        getAllBookings(),
        getRenterStats(),
        getHostApplicationsForAdmin(),
      ]);
      
      setOverview(overviewData);
      setBookings(bookingsData);
      setRenters(renterStats);
      setHostApps(hostApplications);

      const userIds = [...new Set(hostApplications.map(app => app.user_id))];
      if (userIds.length > 0) {
        const profilesMap = await getProfilesByIds(userIds);
        setHostProfiles(profilesMap);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleHostDecision = async (id: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    setActionLoadingId(id);
    setError('');
    try {
      await updateHostApplicationStatus({ id, status, reviewedBy: user.id });
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update host application');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto bg-gray-50 rounded-2xl shadow-2xl overflow-hidden">
          
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ₹{loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

         
          <div className="border-b border-gray-200 bg-white">
            <div className="max-w-6xl mx-auto px-6">
              <nav className="flex space-x-8 overflow-x-auto">
                {(['overview', 'bookings', 'renters', 'hosts'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm capitalize whitespace-nowrap transition-colors ₹{
                      activeTab === tab
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab === 'hosts' ? 'Host Requests' : tab}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="p-6 md:p-8 space-y-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              
              {activeTab === 'overview' && overview && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StatCard icon={<Calendar className="w-5 h-5" />} label="Total Bookings" value={overview.totalBookings} bgColor="bg-orange-50" textColor="text-orange-500" />
                  <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Total Revenue" value={overview.totalRevenue.toLocaleString()} bgColor="bg-green-50" textColor="text-green-600" />
                  <StatCard icon={<Home className="w-5 h-5" />} label="Properties" value={overview.totalProperties} bgColor="bg-blue-50" textColor="text-blue-600" />
                  <StatCard icon={<Users className="w-5 h-5" />} label="Renters" value={overview.totalRenters} bgColor="bg-purple-50" textColor="text-purple-600" />
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">All Bookings</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-500">Date</th>
                          <th className="px-4 py-2 text-left text-gray-500">Property</th>
                          <th className="px-4 py-2 text-left text-gray-500">Renter</th>
                          <th className="px-4 py-2 text-left text-gray-500">Stay</th>
                          <th className="px-4 py-2 text-right text-gray-500">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td className="px-4 py-2">{new Date(booking.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-2 font-medium">{booking.property.title}</td>
                            <td className="px-4 py-2">{booking.renter?.full_name || 'Unknown'}</td>
                            <td className="px-4 py-2">{booking.check_in} → {booking.check_out}</td>
                            <td className="px-4 py-2 text-right font-bold">₹{booking.total_price.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'hosts' && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                   <div className="px-4 py-3 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Host Applications</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-500">User</th>
                          <th className="px-4 py-2 text-left text-gray-500">Status</th>
                          <th className="px-4 py-2 text-right text-gray-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {hostApps.map((app) => {
                          const p = hostProfiles[app.user_id];
                          const loadingThis = actionLoadingId === app.id;
                          return (
                            <tr key={app.id}>
                              <td className="px-4 py-2">
                                <div className="font-medium text-gray-900">{app.full_name || p?.full_name}</div>
                                <div className="text-xs text-gray-500">{app.phone || p?.phone}</div>
                              </td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ₹{
                                  app.status === 'approved' ? 'bg-green-50 text-green-700' : 
                                  app.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                                }`}>
                                  {app.status}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    disabled={loadingThis || app.status !== 'pending'}
                                    onClick={() => handleHostDecision(app.id, 'approved')}
                                    className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg disabled:opacity-30"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    disabled={loadingThis || app.status !== 'pending'}
                                    onClick={() => handleHostDecision(app.id, 'rejected')}
                                    className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg disabled:opacity-30"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bgColor, textColor }: { icon: React.ReactNode, label: string, value: string | number, bgColor: string, textColor: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-center space-x-4">
      <div className={`p-3 rounded-full ₹{bgColor} ₹{textColor}`}>{icon}</div>
      <div>
        <p className="text-xs uppercase text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}