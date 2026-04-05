
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import {
  FlaskConical,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  UploadCloud,
  Search,
  Filter
} from 'lucide-react';
import { useNotification } from './NotificationSystem';
import { labService, LabBooking } from '../services/labService';
import * as Safe from '../utils/safeAccess';

interface LabTechnicianDashboardProps {
  user: User;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:          'bg-amber-50  text-amber-700  dark:bg-amber-900/20  dark:text-amber-300',
  CONFIRMED:        'bg-blue-50   text-blue-700   dark:bg-blue-900/20   dark:text-blue-300',
  SAMPLE_COLLECTED: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
  IN_PROGRESS:      'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
  COMPLETED:        'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
  CANCELLED:        'bg-red-50    text-red-700    dark:bg-red-900/20    dark:text-red-300',
};

const NEXT_STATUS: Record<string, LabBooking['status'] | null> = {
  PENDING:          'CONFIRMED',
  CONFIRMED:        'SAMPLE_COLLECTED',
  SAMPLE_COLLECTED: 'IN_PROGRESS',
  IN_PROGRESS:      'COMPLETED',
  COMPLETED:        null,
  CANCELLED:        null,
};

const NEXT_LABEL: Record<string, string> = {
  PENDING:          'Confirm',
  CONFIRMED:        'Mark Sample Collected',
  SAMPLE_COLLECTED: 'Start Analysis',
  IN_PROGRESS:      'Mark Complete',
};

export const LabTechnicianDashboard: React.FC<LabTechnicianDashboardProps> = ({ user }) => {
  const { notify } = useNotification();
  const [bookings, setBookings] = useState<LabBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LabBooking['status'] | 'ALL'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      // Lab techs see all lab bookings (the service filters by labPartnerId in production)
      // For now we load all and display them
      const data = await labService.getUserLabBookings(user.id);
      setBookings(data);
    } catch (e) {
      console.error('Lab bookings fetch error:', e);
      notify('Failed to load lab bookings', 'error');
    } finally {
      setLoading(false);
    }
  }, [user.id, notify]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleStatusUpdate = async (booking: LabBooking) => {
    const nextStatus = NEXT_STATUS[booking.status];
    if (!nextStatus || !booking.id) return;
    setUpdatingId(booking.id);
    try {
      await labService.updateBookingStatus(booking.id, nextStatus, notes[booking.id] || undefined);
      notify(`Status updated to ${nextStatus.replace('_', ' ')}`, 'success');
      await loadBookings();
      setExpandedId(null);
    } catch (e) {
      notify('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Derived stats
  const stats = {
    pending:    bookings.filter(b => b.status === 'PENDING').length,
    inProgress: bookings.filter(b => ['CONFIRMED', 'SAMPLE_COLLECTED', 'IN_PROGRESS'].includes(b.status)).length,
    completed:  bookings.filter(b => b.status === 'COMPLETED').length,
    total:      bookings.length,
  };

  const filtered = bookings.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      b.testName.toLowerCase().includes(q) ||
      b.userName.toLowerCase().includes(q) ||
      b.labPartnerName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Hero / Stats */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-1">Habari, {user.name}</h1>
          <p className="text-indigo-100 mb-8 max-w-lg">
            Laboratory Technician Console — process samples, update statuses, deliver results.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1 text-indigo-200 text-sm">
                <Clock size={16} /> Pending
              </div>
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1 text-indigo-200 text-sm">
                <FlaskConical size={16} /> In Progress
              </div>
              <span className="text-2xl font-bold">{stats.inProgress}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1 text-indigo-200 text-sm">
                <CheckCircle2 size={16} /> Completed
              </div>
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1 text-indigo-200 text-sm">
                <ClipboardList size={16} /> Total Orders
              </div>
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search patient, test, or lab partner..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#0A0F1C] border border-gray-200 dark:border-gray-700/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-[#0A0F1C] border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SAMPLE_COLLECTED">Sample Collected</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Booking List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700/50">
          <FlaskConical size={52} className="mx-auto mb-4 text-gray-200 dark:text-gray-700" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No lab orders found</h3>
          <p className="text-gray-500 text-sm">Adjust your filters or check back later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => {
            const isExpanded = expandedId === booking.id;
            const nextStatus = NEXT_STATUS[booking.status];
            const nextLabel = NEXT_LABEL[booking.status];
            const isUpdating = updatingId === booking.id;

            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden"
              >
                {/* Header Row */}
                <div
                  className="p-5 flex flex-col md:flex-row gap-4 md:items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : (booking.id ?? null))}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{booking.testName}</h3>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {booking.userName} &bull; {booking.labPartnerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-gray-400">
                      {booking.appointmentDate
                        ? (booking.appointmentDate instanceof Date ? booking.appointmentDate.toLocaleDateString() : new Date(booking.appointmentDate.seconds * 1000).toLocaleDateString())
                        : 'No date set'}
                    </span>
                    {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Panel */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700/50 pt-4 space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5 tracking-widest">Payment</p>
                        <p className="font-bold text-gray-900 dark:text-white">{booking.paymentStatus}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5 tracking-widest">Price</p>
                        <p className="font-bold text-gray-900 dark:text-white">{booking.currency} {booking.price?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5 tracking-widest">Appt. Time</p>
                        <p className="font-bold text-gray-900 dark:text-white">{booking.appointmentTime || '—'}</p>
                      </div>
                    </div>

                    {/* Notes for transition */}
                    {nextStatus && (
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">
                          {nextStatus === 'COMPLETED' ? 'Result Notes (required)' : 'Technician Notes (optional)'}
                        </label>
                        <textarea
                          rows={3}
                          className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#0A0F1C] border border-gray-200 dark:border-gray-700/50 text-sm outline-none resize-none focus:ring-2 focus:ring-indigo-500"
                          placeholder={nextStatus === 'COMPLETED' ? 'Enter result summary or findings...' : 'Optional notes...'}
                          value={notes[booking.id!] || ''}
                          onChange={e => setNotes(prev => ({ ...prev, [booking.id!]: e.target.value }))}
                        />
                      </div>
                    )}

                    {nextStatus && nextLabel && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleStatusUpdate(booking)}
                          disabled={isUpdating || (nextStatus === 'COMPLETED' && !notes[booking.id!])}
                          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all"
                        >
                          {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                          {nextLabel}
                        </button>
                      </div>
                    )}

                    {booking.status === 'COMPLETED' && booking.resultNotes && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4">
                        <p className="text-[10px] font-black uppercase text-emerald-600 mb-1 tracking-widest">Result on Record</p>
                        <p className="text-sm text-emerald-800 dark:text-emerald-300">{booking.resultNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
