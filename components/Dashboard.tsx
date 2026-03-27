
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db as firestore } from '../lib/firebase';
import { UserRole, Appointment, Challenge, HealthPlan, AppointmentStatus, AppointmentType } from '../types';
import { Calendar, Video, Users, Wallet, Bot, ShoppingBag, Shield, FileText, Pill, Activity, Trophy, Flame, Droplet, Dumbbell, Utensils, CheckCircle, AlertOctagon, PenTool, AlertTriangle, PhoneCall, MapPin, Clock, CheckSquare, Camera, Ambulance, Flame as Fire, ShieldAlert, Plus, Package } from 'lucide-react';
import { useNotification } from './NotificationSystem';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { MOCK_CHALLENGES, MOCK_HEALTH_PLANS, MOCK_MEDICINES } from '../constants';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { VitalsScanner } from './VitalsScanner';
import { SkeletonLoader } from './SkeletonLoader';
import { PatientDashboard } from './PatientDashboard';
import { DoctorDashboard } from './DoctorDashboard';
import { PharmacyDashboard } from './PharmacyDashboard';

interface DashboardProps {
    role: UserRole;
    userName: string;
    onNavigate: (view: string, tab?: any) => void;
    appointments?: Appointment[];
    loading?: boolean;
    onCancelAppointment?: (id: string) => void;
    onRescheduleAppointment?: (id: string, date: string, time: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    role, 
    userName, 
    onNavigate, 
    appointments = [], 
    loading = false,
}) => {
    const { user } = useAuth();
    const [greeting, setGreeting] = useState('Hello');
    const [userPoints, setUserPoints] = useState(user?.points || 0);

    // Doctor analytics
    const [doctorArticleViews, setDoctorArticleViews] = useState<{ total: number; topTitle: string; topViews: number }>({ total: 0, topTitle: '', topViews: 0 });
    const [doctorEarnings, setDoctorEarnings] = useState<{ articles: number; consultations: number }>({ articles: 0, consultations: 0 });
    
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
        
        if (user) setUserPoints(user.points);
    }, [user]);

    useEffect(() => {
        const loadDoctorStats = async () => {
            if (!user || user.role !== UserRole.DOCTOR) return;
            try {
                const allArticles = await db.getArticles();
                const my = Array.isArray(allArticles) ? allArticles.filter(a => a?.authorId === user.id) : [];
                const totalViews = my.reduce((sum, a) => sum + (Number(a?.views) || 0), 0);
                const top = my.length > 0 ? [...my].sort((a, b) => (Number(b?.views) || 0) - (Number(a?.views) || 0))[0] : null;
                setDoctorArticleViews({ total: totalViews, topTitle: top?.title || '', topViews: Number(top?.views) || 0 });

                try {
                    const txs = await (db as any).getPendingTransactions?.() ?? [];
                    const mine = Array.isArray(txs) ? txs.filter((t: any) => t?.recipientId === user.id && (t?.status === 'VERIFIED' || t?.status === 'COMPLETED' || t?.status === 'APPROVED')) : [];
                    const articleE = mine.filter((t: any) => t?.itemType === 'article').reduce((s: number, t: any) => s + Number(t?.amount || 0), 0);
                    const consultE = mine.filter((t: any) => t?.itemType === 'consultation').reduce((s: number, t: any) => s + Number(t?.amount || 0), 0);
                    setDoctorEarnings({ articles: articleE, consultations: consultE });
                } catch (txError) {
                    console.error('Error loading doctor earnings:', txError);
                }
            } catch (e) {
                console.error('Error loading doctor stats:', e);
            }
        };
        loadDoctorStats();
    }, [user?.id, user?.role]);

    if (role === UserRole.DOCTOR) {
        return (
            <DoctorDashboard 
                user={user!}
                userName={userName}
                greeting={greeting}
                appointments={appointments}
                doctorArticleViews={doctorArticleViews}
                doctorEarnings={doctorEarnings}
                loading={loading}
                onNavigate={onNavigate}
            />
        );
    }

    if (role === UserRole.PATIENT) {
        return (
            <PatientDashboard 
                user={user!}
                userName={userName}
                greeting={greeting}
                userPoints={userPoints}
                appointments={appointments}
                loading={loading || false}
                onNavigate={onNavigate}
            />
        );
    }

    if (role === UserRole.PHARMACY) {
        return (
            <PharmacyDashboard 
                userName={userName}
                loading={loading}
                onNavigate={onNavigate}
            />
        );
    }
    
    return (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <h2 className="text-2xl font-bold mb-2">Welcome {role}</h2>
            <p>Dashboard view for {role} role.</p>
        </div>
    );
};
