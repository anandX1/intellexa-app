// This is the FINAL, COMPLETE, and CORRECTED code for: app/page.tsx
// It uses YOUR original UI with the NEW, corrected Supabase logic.
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabaseClient'; // The new, correct import
import { AtSymbolIcon, LockClosedIcon, UserIcon, RocketLaunchIcon, BookOpenIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const supabase = createClient(); // The new, correct client instance
  const [isLoginView, setIsLoginView] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    if (isLoginView) {
      // Handle Sign In
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setMessage('Please check your inbox and confirm your email address first.');
        } else {
          setMessage(error.message);
        }
      } else {
        // router.refresh(); // This helps ensure the session is updated for the middleware
        router.push('/dashboard');
      }
    } else {
      // Handle Sign Up
      if (fullName.trim() === '') {
        setMessage('Please enter your full name.');
        setIsLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: {
          data: { full_name: fullName }
        } 
      });
      if (error) {
          setMessage(error.message);
      } else {
          setMessage('Sign up successful! Please check your email to verify your account.');
      }
    }
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 p-4 font-sans">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl bg-slate-800/80 shadow-2xl ring-1 ring-white/10 md:grid-cols-2">
        
        {/* --- LEFT COLUMN (YOUR ORIGINAL DESIGN) --- */}
        <div className="hidden flex-col justify-between bg-black/20 p-8 text-white md:flex">
          <div>
            <div className="flex items-center gap-4">
              <Image src="/intellexa.png" alt="Intellexa Logo" width={50} height={50} quality={100} />
              <h1 className="text-4xl font-black">Intellexa</h1>
            </div>
            <h2 className="mt-8 text-4xl font-extrabold leading-tight">From Dreams to Reality: Your Personal AI CBSE Tutor</h2>
          </div>
          <ul className="mt-8 space-y-4 text-slate-300">
            <li className="flex items-start gap-3"><RocketLaunchIcon className="h-6 w-6 flex-shrink-0 text-cyan-400" /><span><span className="font-semibold text-white">Personalized Learning Paths</span></span></li>
            <li className="flex items-start gap-3"><BookOpenIcon className="h-6 w-6 flex-shrink-0 text-cyan-400" /><span><span className="font-semibold text-white">Interactive Whiteboard</span></span></li>
            <li className="flex items-start gap-3"><UserGroupIcon className="h-6 w-6 flex-shrink-0 text-cyan-400" /><span><span className="font-semibold text-white">24/7 Doubt Solving</span></span></li>
          </ul>
          <div className="mt-auto pt-8 text-sm text-slate-400">
            Contact us: <a href="mailto:anandkumar.3042008@gmail.com" className="underline hover:text-cyan-400">anandkumar.3042008@gmail.com</a>
          </div>
        </div>
        
        {/* --- RIGHT COLUMN (YOUR ORIGINAL DESIGN) --- */}
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/80">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold text-white text-center">
              {isLoginView ? 'Welcome Back' : 'Get Started Now'}
            </h2>
            <p className="mt-2 text-slate-400 text-center">
              {isLoginView ? 'Sign in to continue your journey' : 'Create an account to begin'}
            </p>

            {message && <p className="mt-6 rounded-md bg-slate-700/50 p-3 text-center text-sm font-medium text-white">{message}</p>}

            <form onSubmit={handleAuthAction} className="mt-8 space-y-5">
              {!isLoginView && (
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} id="fullName" type="text" placeholder="Full Name" required className="w-full rounded-md border-slate-700 bg-slate-800 py-2.5 pl-10 pr-3 text-white placeholder-slate-400 ring-1 ring-inset ring-slate-700 transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-400" />
                </div>
              )}
              <div className="relative">
                <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} id="email" type="email" placeholder="Email" required className="w-full rounded-md border-slate-700 bg-slate-800 py-2.5 pl-10 pr-3 text-white placeholder-slate-400 ring-1 ring-inset ring-slate-700 transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-400" />
              </div>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" placeholder="Password" required className="w-full rounded-md border-slate-700 bg-slate-800 py-2.5 pl-10 pr-3 text-white placeholder-slate-400 ring-1 ring-inset ring-slate-700 transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-400" />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              {isLoginView ? "First time here?" : "Already have an account?"}{' '}
              <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-cyan-400 transition hover:text-cyan-300">
                {isLoginView ? "Create an account" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
