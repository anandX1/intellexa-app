// This is the FINAL, CORRECTED, and COMPLETE code for your original dashboard design.
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient'; // The new, correct client
import type { User } from '@supabase/supabase-js';
import { ArrowRightOnRectangleIcon, BookOpenIcon, BeakerIcon, CalculatorIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';

// --- TYPE DEFINITIONS ---
type StudentLog = {
  streak_days: number;
  total_time_spent_seconds: number;
};
interface SubjectCardProps {
  subject: string;
  subtext: string;
  icon: React.ReactNode;
  href: string;
  colorClass: string;
}
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtext: string;
}

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// --- REUSABLE UI COMPONENTS ---
const SubjectCard = ({ subject, subtext, icon, href, colorClass }: SubjectCardProps) => (
    <motion.div variants={itemVariants}>
        <Link href={href}>
            <div className={`flex flex-col h-full justify-between rounded-2xl bg-slate-800 p-6 shadow-lg ring-1 ring-white/10 transition-all duration-300 hover:ring-2 ${colorClass} hover:-translate-y-1`}>
                <div>
                    <div className="mb-4 flex items-center gap-4">
                        <div className="rounded-lg bg-slate-700 p-3">{icon}</div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{subject}</h3>
                            <p className="text-sm text-slate-400">{subtext}</p>
                        </div>
                    </div>
                </div>
                <div className={`mt-4 block w-full rounded-lg py-2.5 text-center font-semibold text-white transition bg-slate-700/50 hover:bg-slate-700`}>
                    Start Learning
                </div>
            </div>
        </Link>
    </motion.div>
);

const StatCard = ({ title, value, icon, subtext }: StatCardProps) => (
    <motion.div variants={itemVariants} className="flex items-center gap-6 rounded-2xl bg-slate-800 p-6 ring-1 ring-white/10">
        <div className="text-orange-400">{icon}</div>
        <div>
            <p className="text-slate-400">{title}</p>
            <p className="text-4xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-500">{subtext}</p>
        </div>
    </motion.div>
);

// --- MAIN DASHBOARD PAGE ---
export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [log, setLog] = useState<StudentLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('Student');

  const checkUserAndFetchLog = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student';
      setDisplayName(name);
      const { data, error } = await supabase.from('student_logs').select('*').eq('user_id', user.id).single();
      if (error) console.error('Error fetching student log:', error.message);
      else setLog(data);
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    checkUserAndFetchLog();
  }, [checkUserAndFetchLog]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };
  
  const formatTime = (seconds: number) => {
    if (!seconds) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <header className="sticky top-0 z-10 bg-slate-900/50 p-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/intellexa.png" alt="Logo" width={32} height={32} quality={100} />
            <span className="font-bold text-xl">Intellexa</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">Welcome, {displayName}!</span>
            <button onClick={handleSignOut} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white">
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>
      
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto w-full max-w-7xl p-6"
      >
        <motion.div variants={itemVariants} className="mb-12">
            <h1 className="text-4xl font-bold text-white">Welcome back, {displayName}!</h1>
            <p className="mt-2 text-slate-400">Choose a subject to start your interactive learning session</p>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <SubjectCard subject="Physics" subtext="Chapter 1" icon={<BookOpenIcon className="h-6 w-6 text-blue-400" />} href="/learn/physics/chapter1" colorClass="ring-blue-500" />
          <SubjectCard subject="Chemistry" subtext="Coming Soon" icon={<BeakerIcon className="h-6 w-6 text-green-400" />} href="#" colorClass="ring-green-500" />
          <SubjectCard subject="Mathematics" subtext="Coming Soon" icon={<CalculatorIcon className="h-6 w-6 text-purple-400" />} href="#" colorClass="ring-purple-500" />
        </motion.div>

        <div className="mt-16">
            <motion.h2 variants={itemVariants} className="mb-6 text-2xl font-bold text-center">Your Progress at a Glance</motion.h2>
            <motion.div variants={containerVariants} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <StatCard 
                    title="Learning Streak"
                    value={`${log?.streak_days || 0} Days`}
                    icon={<FireIcon className="h-16 w-16" />}
                    subtext="Keep it up to build a strong habit!"
                />
                <StatCard 
                    title="Total Time Spent"
                    value={formatTime(log?.total_time_spent_seconds || 0)}
                    icon={<ClockIcon className="h-16 w-16" />}
                    subtext="Every minute is an investment in your future."
                />
            </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
