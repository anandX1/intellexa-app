// This is the FINAL, COMPLETE, CHAMPIONSHIP version of: app/learn/[...slug]/page.tsx
// It includes ALL features: Sidebar, Avatar, Supabase Progress, and the full "Raise Hand" logic with Textbox.
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { Howl } from 'howler';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath } from 'react-katex';
import { ArrowLeftIcon, HandRaisedIcon, SpeakerWaveIcon, SpeakerXMarkIcon, CheckCircleIcon, ArrowUturnLeftIcon, MicrophoneIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';

// --- TYPE DEFINITIONS ---
interface LessonStep {
  id: string;
  subtopic: string;
  narration_url: string;
  visual_type: 'title_card' | 'animated_text' | 'animated_svg' | 'static_diagram' | 'formula' | 'question';
  content: any;
  svg_url?: string;
}

// --- THE MAIN COMPONENT ---
export default function LessonPlayer() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState<User | null>(null);
  const [lessonSteps, setLessonSteps] = useState<LessonStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState('Loading...');
  const [isMuted, setIsMuted] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const soundRef = useRef<Howl | null>(null);
  const chapterIdRef = useRef<string | null>(null);
  
  // --- STATES FOR RAISE HAND & TEXTBOX ---
  const [isListening, setIsListening] = useState(false);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [isTextboxActive, setIsTextboxActive] = useState(false);
  const [typedQuestion, setTypedQuestion] = useState('');
  const recognitionRef = useRef<any>(null);

  // --- 1. DATA & PROGRESS FETCHING ---
  useEffect(() => {
    const initializeLesson = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUser(user);

      if (params.slug) {
        const [subject, chapter] = params.slug as string[];
        const currentChapterId = `${subject}_${chapter}`;
        chapterIdRef.current = currentChapterId;
        const jsonPath = `/content/physics/chapter1/physics_chapter_1.json`;
        
        try {
          const res = await fetch(jsonPath);
          if (!res.ok) throw new Error('Could not find lesson data');
          const data = await res.json();
          setLessonSteps(data);

          const { data: logData } = await supabase.from('student_logs').select('progress_percentage').eq('user_id', user.id).eq('chapter_id', currentChapterId).single();
          if (logData && data.length > 0) {
            const savedProgress = logData.progress_percentage || 0;
            const savedStep = Math.floor((savedProgress / 100) * data.length);
            setCurrentStepIndex(savedStep < data.length ? savedStep : 0);
          }
        } catch (error) {
          console.error("Failed to load lesson:", error);
          setStatus('Error: Could not load lesson.');
        } finally {
          setIsInitialLoad(false);
        }
      }
    };
    initializeLesson();
  }, [params.slug, router, supabase]);

  // --- 2. THE AUDIO PLAYER & PROGRESS SAVING ---
  useEffect(() => {
    if (isInitialLoad || lessonSteps.length === 0 || isAIResponding) return;
    if (soundRef.current) soundRef.current.stop();

    if (currentStepIndex < lessonSteps.length) {
      const currentStep = lessonSteps[currentStepIndex];
      setStatus(currentStep.subtopic);
      const sound = new Howl({
        src: [currentStep.narration_url],
        html5: true,
        onend: async () => {
          const nextStepIndex = currentStepIndex + 1;
          if (user && chapterIdRef.current) {
            const progressPercentage = Math.min(100, Math.round((nextStepIndex / lessonSteps.length) * 100));
            await supabase.from('student_logs').update({ progress_percentage: progressPercentage }).eq('user_id', user.id).eq('chapter_id', chapterIdRef.current);
          }
          setCurrentStepIndex(nextStepIndex);
        }
      });
      soundRef.current = sound;
      if (!isMuted) sound.play();
    } else {
      setStatus("Chapter Complete!");
    }
    return () => { if (soundRef.current) soundRef.current.stop(); };
  }, [currentStepIndex, lessonSteps, isInitialLoad, user, supabase, isMuted, isAIResponding]);

  // --- 3. RAISE HAND & TEXTBOX LOGIC ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTextboxActive) {
      timer = setTimeout(() => setIsTextboxActive(false), 120000);
    }
    return () => clearTimeout(timer);
  }, [isTextboxActive]);

  const sendQuestionToAI = async (question: string) => {
    if (question.trim() === '') return;
    setIsAIResponding(true);
    setStatus('Intellexa is thinking...');
    setIsTextboxActive(false);
    setTypedQuestion('');
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context: lessonSteps[currentStepIndex] }),
      });
      if (!response.ok) throw new Error('Backend API failed');
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const aiSound = new Howl({ src: [audioUrl], format: ['wav'], html5: true, onend: () => setIsAIResponding(false) });
      if (!isMuted) aiSound.play();
      else setIsAIResponding(false);
    } catch (error) {
      console.error("Error in Raise Hand flow:", error);
      setStatus('Sorry, an error occurred.');
      setIsAIResponding(false);
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN';
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => sendQuestionToAI(event.results[0][0].transcript);
  }, []);

  const handleRaiseHand = () => {
    if (isListening || isAIResponding) return;
    if (soundRef.current && soundRef.current.playing()) soundRef.current.pause();
    setIsTextboxActive(true);
  };
  const handleMicClick = () => {
    if (isListening) recognitionRef.current?.stop();
    else recognitionRef.current?.start();
  };
  const handleSendTypedQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestionToAI(typedQuestion);
  };
  
  // --- 4. NAVIGATION & UI HELPERS ---
  const handlePrevStep = () => setCurrentStepIndex(prev => Math.max(0, prev - 1));
  const handleStepSelect = (index: number) => { if (index <= currentStepIndex) setCurrentStepIndex(index); };
  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (soundRef.current) soundRef.current.mute(newMutedState);
  };

  const currentStep = lessonSteps[currentStepIndex];

  return (
    <div className="flex h-screen w-full bg-slate-900 text-white font-sans overflow-hidden">
      <aside className="w-80 flex-shrink-0 bg-slate-800/50 p-6 border-r border-slate-700 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-white">Physics: Chapter 1</h2>
        <nav className="space-y-2">
          {lessonSteps.map((step, index) => (
            <button key={step.id} onClick={() => handleStepSelect(index)} disabled={index > currentStepIndex} className={`flex w-full items-start text-left gap-3 p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${ index === currentStepIndex ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:bg-slate-700/50' }`}>
              {index < currentStepIndex ? (<CheckCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-500" />) : (<span className={`h-5 w-5 mt-0.5 flex-shrink-0 flex items-center justify-center font-bold text-xs rounded-full ${index === currentStepIndex ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700'}`}>{index + 1}</span>)}
              <span className="truncate">{step.subtopic}</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col relative">
        <header className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-black/10 backdrop-blur-sm z-10">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-300 hover:text-white transition"><ArrowLeftIcon className="h-5 w-5" />Back to Dashboard</button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span><p className="text-sm text-slate-400">LIVE</p></div>
            <p className="font-semibold truncate max-w-xs">{status}</p>
          </div>
          <button onClick={handleMuteToggle} className="text-slate-300 hover:text-white transition">{isMuted ? <SpeakerXMarkIcon className="h-6 w-6" /> : <SpeakerWaveIcon className="h-6 w-6" />}</button>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-8 pt-20">
          <AnimatePresence mode="wait">
            {currentStep ? (
              <motion.div key={currentStep.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5, ease: 'easeInOut' }} className="w-full h-full flex items-center justify-center">
                {(() => {
                  switch (currentStep.visual_type) {
                    case 'title_card': return <h1 className="text-6xl font-extrabold text-cyan-400 text-center">{currentStep.content}</h1>;
                    case 'animated_text': return <p className="text-3xl text-center leading-relaxed max-w-4xl">{currentStep.content}</p>;
                    case 'formula': return <div className="text-5xl bg-slate-800 p-8 rounded-lg shadow-xl"><BlockMath math={currentStep.content} /></div>;
                    case 'animated_svg':
                    case 'static_diagram': return <div className="w-full h-5/6 relative"><Image src={currentStep.svg_url!} alt={currentStep.subtopic} layout="fill" objectFit="contain" /></div>;
                    case 'question': return (<div className="text-center bg-slate-800 p-8 rounded-lg shadow-xl"><h3 className="text-2xl text-slate-400 mb-4">{currentStep.content.question}</h3><p className="text-4xl font-bold text-green-400">{currentStep.content.answer}</p></div>);
                    default: return <p>Loading content...</p>;
                  }
                })()}
              </motion.div>
            ) : (<p>{status}</p>)}
          </AnimatePresence>
        </main>
        <div className="absolute bottom-6 left-6 z-10 w-32 h-32 rounded-full overflow-hidden ring-2 ring-cyan-400/50 shadow-lg">
          <video src="/ai_avatar.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-4">
          <AnimatePresence>
            {isTextboxActive && (
              <motion.form 
                onSubmit={handleSendTypedQuestion}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={typedQuestion}
                    onChange={(e) => setTypedQuestion(e.target.value)}
                    placeholder="Or type your question..."
                    className="w-72 bg-slate-700 p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <button type="button" onClick={handleMicClick} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-600 hover:bg-slate-500">
                    <MicrophoneIcon className={`h-6 w-6 transition-colors ${isListening ? 'text-green-400' : 'text-white'}`} />
                  </button>
                </div>
                <button type="submit" className="p-4 bg-blue-600 rounded-full transition-transform hover:scale-110"><PaperAirplaneIcon className="h-6 w-6" /></button>
              </motion.form>
            )}
          </AnimatePresence>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handlePrevStep} className="flex items-center gap-2 px-6 py-4 bg-slate-700 rounded-full shadow-lg font-semibold"><ArrowUturnLeftIcon className="h-6 w-6" />Previous</motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleRaiseHand} disabled={isAIResponding} className="flex items-center gap-3 px-6 py-4 bg-yellow-600 rounded-full shadow-lg font-semibold disabled:opacity-50">
            {isAIResponding ? "Thinking..." : (<><HandRaisedIcon className="h-6 w-6" />Raise Hand</>)}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
