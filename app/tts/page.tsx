'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { AppSidebar } from '@/components/app-sidebar';

export default function TextToSpeechPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoice]);

  const speak = () => {
    if (!text.trim()) {
      alert('Please enter some text to speak');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
      alert('Error occurred during speech synthesis');
    };

    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  if (!mounted) {
    return null;
  }

  if (!supported) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-semibold text-foreground">Browser Not Supported</h1>
          <p className="text-muted-foreground">
            Your browser doesn't support the Web Speech API. Please use a modern browser like Chrome, Edge, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-background">
      {/* Header */}
      
      <header className="border-b border-border">
        <div className="px-4 py-6 mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold text-foreground">Text to Speech</h1>
          <p className="mt-1 text-sm text-muted-foreground">Convert text to natural-sounding speech</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-5xl">
        <div className="space-y-6">
          {/* Text Input Section */}
          <div className="p-6 transition-colors border rounded-lg bg-card border-border hover:border-muted-foreground">
            <label className="block mb-3 text-sm font-medium text-foreground">
              Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you'd like to convert to speech..."
              className="w-full h-48 px-4 py-3 text-base transition-colors border rounded-lg resize-none bg-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">{text.length} characters</span>
              {text.length > 0 && (
                <button
                  onClick={() => setText('')}
                  className="text-xs transition-colors text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Settings Section */}
          <div className="p-6 transition-colors border rounded-lg bg-card border-border hover:border-muted-foreground">
            <h2 className="mb-4 text-sm font-medium text-foreground">Settings</h2>
            
            {/* Voice Selection */}
            <div className="mb-6">
              <label className="block mb-2 text-xs font-medium text-muted-foreground">
                Voice
              </label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = voices.find(v => v.name === e.target.value);
                  setSelectedVoice(voice || null);
                }}
                className="w-full px-3 py-2 text-sm transition-colors border rounded-lg bg-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {voices.map((voice, index) => (
                  <option key={index} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Speed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Speed</label>
                  <span className="text-xs text-muted-foreground">{rate.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-secondary accent-foreground"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">0.5x</span>
                  <span className="text-xs text-muted-foreground">2x</span>
                </div>
              </div>

              {/* Pitch */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Pitch</label>
                  <span className="text-xs text-muted-foreground">{pitch.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-secondary accent-foreground"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Low</span>
                  <span className="text-xs text-muted-foreground">High</span>
                </div>
              </div>

              {/* Volume */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Volume</label>
                  <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-secondary accent-foreground"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">0%</span>
                  <span className="text-xs text-muted-foreground">100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={speak}
              disabled={isSpeaking && !isPaused}
              className="flex items-center justify-center flex-1 gap-2 px-6 py-3 text-sm font-medium transition-colors rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              Generate Speech
            </button>

            {isSpeaking && !isPaused && (
              <button
                onClick={pause}
                className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-colors border rounded-lg text-foreground border-border hover:bg-secondary"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" />
                </svg>
                Pause
              </button>
            )}

            {isPaused && (
              <button
                onClick={resume}
                className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-colors border rounded-lg text-foreground border-border hover:bg-secondary"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                Resume
              </button>
            )}

            {isSpeaking && (
              <button
                onClick={stop}
                className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-colors border rounded-lg text-foreground border-border hover:bg-secondary"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" />
                </svg>
                Stop
              </button>
            )}
          </div>

          {/* Status Bar */}
          {isSpeaking && (
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-secondary border-border">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">
                  {isPaused ? 'Paused' : 'Playing'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedVoice?.name} • {rate}x speed
                </div>
              </div>
            </div>
          )}

          {/* Examples Section */}
          <div className="pt-6 border-t border-border">
            <h2 className="mb-4 text-sm font-medium text-foreground">Quick Examples</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                "Hello! Welcome to our text-to-speech service.",
                "The quick brown fox jumps over the lazy dog.",
                "This technology converts written text into natural-sounding speech."
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setText(example)}
                  className="p-4 text-left transition-colors border rounded-lg group border-border hover:border-muted-foreground hover:bg-secondary"
                >
                  <div className="mb-2 text-xs font-medium text-muted-foreground group-hover:text-foreground">
                    Example {index + 1}
                  </div>
                  <div className="text-sm line-clamp-2 text-muted-foreground">{example}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}