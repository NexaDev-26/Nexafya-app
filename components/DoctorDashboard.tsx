
import React from 'react';
import { UserRole, Appointment, AppointmentStatus, User } from '../types';
import { Calendar, Users, Wallet } from 'lucide-react';
import { SkeletonLoader } from './SkeletonLoader';

interface DoctorDashboardProps {
  user: User;
  userName: string;
  greeting: string;
  appointments: Appointment[];
  doctorArticleViews: { total: number; topTitle: string; topViews: number };
  doctorEarnings: { articles: number; consultations: number };
  loading: boolean;
  onNavigate: (view: string, tab?: any) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  user,
  userName,
  greeting,
  appointments,
  doctorArticleViews,
  doctorEarnings,
  loading,
  onNavigate
}) => {
  if (loading) {
      return (
          <div className="animate-in fade-in duration-500">
              <SkeletonLoader type="dashboard" />
          </div>
      );
  }

  const stats = { 
    patients: 42, 
    consults: appointments.filter(a => a.status === AppointmentStatus.UPCOMING).length, 
    earnings: (doctorEarnings.articles + doctorEarnings.consultations).toLocaleString() 
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full xl:h-[calc(100vh-140px)] animate-in fade-in duration-500">
        <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white mb-1">
                        {greeting}, Dr. {userName.split(' ')[1] || userName}!
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">You have <span className="font-bold text-gray-900 dark:text-white">{stats.consults} appointments</span> upcoming.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg shadow-blue-600/20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-xl"><Users size={20} /></div>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{stats.patients}</h3>
                    <p className="text-blue-100 text-sm">Active Patients</p>
                </div>
                <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl"><Calendar size={20} /></div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.consults}</h3>
                    <p className="text-gray-500 dark:text-gray-300 text-sm">Upcoming Consults</p>
                </div>
                <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl"><Wallet size={20} /></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">TZS {stats.earnings}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Earnings Total</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 dark:bg-[#0A0F1C]/50 rounded-xl p-2 border border-transparent dark:border-gray-700/30">
                        <p className="text-gray-400 dark:text-gray-500 font-bold uppercase text-[9px]">Articles</p>
                        <p className="font-extrabold text-gray-900 dark:text-white">TZS {doctorEarnings.articles.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-[#0A0F1C]/50 rounded-xl p-2 border border-transparent dark:border-gray-700/30">
                        <p className="text-gray-400 dark:text-gray-500 font-bold uppercase text-[9px]">Consults</p>
                        <p className="font-extrabold text-gray-900 dark:text-white">TZS {doctorEarnings.consultations.toLocaleString()}</p>
                      </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-white">Article Views</h3>
                  <button onClick={() => onNavigate('manage-articles', 'feed')} className="text-xs font-bold text-blue-600 hover:underline">Open Articles</button>
                </div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{doctorArticleViews.total.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Total views across your articles</p>
                {doctorArticleViews.topTitle && (
                  <p className="text-xs text-gray-500 mt-3">
                    Top: <span className="font-bold text-gray-900 dark:text-white">{doctorArticleViews.topTitle}</span> • {doctorArticleViews.topViews.toLocaleString()} views
                  </p>
                )}
              </div>
              <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                  <span className="text-xs text-gray-400">Doctor</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => onNavigate('patients')} className="px-4 py-3 rounded-2xl bg-blue-50 text-blue-700 font-bold text-sm">My Patients</button>
                  <button onClick={() => onNavigate('finance')} className="px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-sm">Finance</button>
                  <button onClick={() => onNavigate('manage-articles', 'editor')} className="px-4 py-3 rounded-2xl bg-purple-50 text-purple-700 font-bold text-sm">Write Article</button>
                  <button onClick={() => onNavigate('consultations')} className="px-4 py-3 rounded-2xl bg-gray-50 text-gray-700 font-bold text-sm">Schedule</button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Today's Schedule</h3>
                <div className="space-y-3">
                    {appointments.slice(0, 3).map((apt) => (
                        <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0A0F1C]/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                                    {(apt.patientName || 'P').charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{apt.patientName}</p>
                                    <p className="text-xs text-gray-500">{apt.time} - {apt.type}</p>
                                </div>
                            </div>
                            <button onClick={() => onNavigate('consultations')} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">Open</button>
                        </div>
                    ))}
                    {appointments.length === 0 && <p className="text-gray-500 text-sm">No appointments scheduled.</p>}
                </div>
            </div>
        </div>
    </div>
  );
};
