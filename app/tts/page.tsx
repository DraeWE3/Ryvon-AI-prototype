'use client';

import React, { useState, useEffect } from 'react';

export default function TextToSpeechPage() {
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState('');

  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '';

  useEffect(() => {
    setMounted(true);
    if (!apiKey) {
      setError('API key not found. Please set NEXT_PUBLIC_ELEVENLABS_API_KEY in .env.local');
      return;
    }
    fetchVoices(apiKey);
  }, []);

  useEffect(() => {
    if (audio) {
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setError('Error playing audio');
      };
    }
  }, [audio]);

  const fetchVoices = async (key: string) => {
    try {
      console.log('API Key length:', key.length);
      console.log('API Key starts with:', key.substring(0, 10) + '...');
      
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': key
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', response.status, errorText);
        throw new Error(`Failed to fetch voices (${response.status})`);
      }

      const data = await response.json();
      setVoices(data.voices || []);
      if (data.voices && data.voices.length > 0) {
        setSelectedVoiceId(data.voices[0].voice_id);
      }
      setError('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load voices';
      setError(`${errorMessage}. Please verify your API key is correct.`);
      console.error(err);
    }
  };

  const generateSpeech = async () => {
    if (!text.trim()) {
      setError('Please enter some text to convert to speech');
      return;
    }

    if (!apiKey) {
      setError('Please set NEXT_PUBLIC_ELEVENLABS_API_KEY in your environment variables');
      return;
    }

    if (!selectedVoiceId) {
      setError('Please select a voice');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.message || 'Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioUrl(url);
      const newAudio = new Audio(url);
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate speech';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  if (!mounted) {
    return null;
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
          {/* Error Message */}
          {error && (
            <div className="p-4 text-sm border rounded-lg bg-destructive/10 text-destructive border-destructive/20">
              {error}
            </div>
          )}

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

          {/* Voice Selection */}
          {voices.length > 0 && (
            <div className="p-6 transition-colors border rounded-lg bg-card border-border hover:border-muted-foreground">
              <h2 className="mb-4 text-sm font-medium text-foreground">Voice Selection</h2>
              <select
                value={selectedVoiceId}
                onChange={(e) => setSelectedVoiceId(e.target.value)}
                className="w-full px-3 py-2 text-sm transition-colors border rounded-lg bg-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {voices.map((voice) => (
                  <option key={voice.voice_id} value={voice.voice_id}>
                    {voice.name} {voice.labels?.accent && `(${voice.labels.accent})`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={generateSpeech}
              disabled={isGenerating || !apiKey}
              className="flex items-center justify-center flex-1 gap-2 px-6 py-3 text-sm font-medium transition-colors rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                  Generate Speech
                </>
              )}
            </button>

            {audioUrl && (
              <>
                <button
                  onClick={togglePlayPause}
                  className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-colors border rounded-lg text-foreground border-border hover:bg-secondary"
                >
                  {isPlaying ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" />
                      </svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                      Play
                    </>
                  )}
                </button>

                <button
                  onClick={stopAudio}
                  className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-colors border rounded-lg text-foreground border-border hover:bg-secondary"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" />
                  </svg>
                  Stop
                </button>

                <a
                  href={audioUrl}
                  download="speech.mp3"
                  className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-colors border rounded-lg text-foreground border-border hover:bg-secondary"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
              </>
            )}
          </div>

          {/* Status Bar */}
          {isPlaying && (
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-secondary border-border">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">Playing</div>
                <div className="text-xs text-muted-foreground">
                  {voices.find(v => v.voice_id === selectedVoiceId)?.name || 'Unknown voice'}
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