// app/components/auth/LoginForm.tsx
'use client';
import { AtSymbolIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import React from 'react'; // Import React

// Define the types for the props we are receiving from the main page
interface LoginFormProps {
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
}

// Apply the types to our component's props
export default function LoginForm({ setEmail, setPassword }: LoginFormProps) {
  return (
    <>
      <div className="relative">
        <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input onChange={(e) => setEmail(e.target.value)} id="email" type="email" required placeholder="Enter your email" className="w-full rounded-md border-slate-700 bg-slate-800 py-2.5 pl-10 pr-3 text-white placeholder-slate-400 ring-1 ring-inset ring-slate-700 transition focus:ring-2 focus:ring-inset focus:ring-cyan-400" />
      </div>
      
      <div className="relative">
        <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input onChange={(e) => setPassword(e.target.value)} id="password" type="password" required placeholder="Enter your password" className="w-full rounded-md border-slate-700 bg-slate-800 py-2.5 pl-10 pr-3 text-white placeholder-slate-400 ring-1 ring-inset ring-slate-700 transition focus:ring-2 focus:ring-inset focus:ring-cyan-400" />
      </div>
    </>
  );
}