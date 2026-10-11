import React, { useState } from 'react';
import {
  ArrowRight,
  CircleCheck,
  Sparkles,
  Mic,
  Volume2,
  FileText,
  Bot,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  Code2,
  Briefcase,
  Zap,
  PlayCircle
} from 'lucide-react';
import { speechManager } from '../lib/speech';

interface LandingPageProps {
  onStartMock: (preset?: { mode: 'quick' | 'full' | 'company'; role?: string; company?: string; topics?: string[] }) => void;
  onExploreTracks: () => void;
  onViewDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartMock,
  onExploreTracks,
  onViewDemo,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleTestAudioSample = () => {
    if (isPlayingAudio) {
      speechManager.stop();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    speechManager.speak(
      "Hello! Welcome to MockMate. I'm Aria, your campus placement interviewer. I adapt to your answers in real time, probe your technical depth, and generate an in-depth score card. Are you ready for your next round?",
      'female',
      1.05
    ).then(() => {
      setIsPlayingAudio(false);
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
            Built for campus placement prep
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl text-slate-900">
            Practice interviews that{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600">
              feel real
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl leading-relaxed">
            MockMate simulates HR, technical, and DSA rounds with an adaptive AI interviewer.
            Get scored on clarity, confidence, and accuracy — then receive a detailed report card.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => onStartMock()}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
            >
              <span>Start mock interview</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onExploreTracks}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              Explore practice tracks
            </button>
            <button
              onClick={onViewDemo}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-indigo-300 bg-indigo-50/50 px-6 text-base font-semibold text-indigo-700 hover:bg-indigo-100/60 active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="h-4 w-4 text-indigo-600" />
              <span>Launch Demo</span>
            </button>
          </div>

          {/* Interactive Hero Audition Card */}
          <div className="mt-14 mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl backdrop-blur text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-11 w-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow">
                    A
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">Aria</span>
                    <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                      Live AI Interviewer
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Lead Technical Evaluator • Adaptive Speech Mode Active</p>
                </div>
              </div>
              <button
                onClick={handleTestAudioSample}
                className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors w-fit cursor-pointer"
              >
                <Volume2 className={`h-4 w-4 ${isPlayingAudio ? 'animate-bounce text-indigo-600' : ''}`} />
                <span>{isPlayingAudio ? 'Stop Voice Audition' : 'Hear Aria Speak (Audio Demo)'}</span>
              </button>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2 shrink-0 animate-ping" />
              <div className="space-y-1.5">
                <p className="text-sm text-slate-800 font-medium">
                  &ldquo;I noticed you built a collaborative workspace with WebSockets on your resume. Could you walk me through how you prevent race conditions during concurrent typing, and what trade-offs you considered?&rdquo;
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">Stage 2: Resume Deep-Dive</span>
                  <span>•</span>
                  <span>Adaptive Follow-up: Enabled</span>
                  <span>•</span>
                  <span>Scoring: Clarity, Asymptotic Rigor, STAR format</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="border-t border-slate-200 bg-slate-100/50 px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to crack placements
            </h2>
            <p className="mt-3 text-base text-slate-500">
              From first-round HR to final technical deep dives.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">Adaptive AI questions</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Follow-up questions react to your answers, just like a real interviewer.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">Voice & text mode</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Answer by speaking or typing. Build comfort for online assessments and video calls.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">Resume-aware interviews</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Paste your resume and the AI asks about your specific projects, stack, and skills.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">Detailed report card</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Scores, strengths, weaknesses, sample answers, and curated resources to improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Simple 3-Step Process
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How it works
            </h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-3xl font-black text-indigo-600/30">01</div>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Set your target</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Pick a role, company, difficulty, and topics. Upload your resume text for personalized questions.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Supports FAANG, MNCs, & Startups</span>
              </div>
            </div>
            <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-3xl font-black text-indigo-600/30">02</div>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Start the interview</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Meet Alex or Aria. Answer questions in text or voice while the AI adapts in real time.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Anti-cheating tab switch telemetry</span>
              </div>
            </div>
            <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-3xl font-black text-indigo-600/30">03</div>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Review your report</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Get a breakdown of technical, communication, and confidence scores with improvement tips.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Exportable markdown report & model answers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-8 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white text-xs font-bold">
              M
            </div>
            <span className="font-semibold text-slate-900">MockMate</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 MockMate. Built for student placement success.
          </p>
        </div>
      </footer>
    </div>
  );
};
