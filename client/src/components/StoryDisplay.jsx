import React, { useState, useEffect } from 'react';
import { Copy, Check, Volume2, VolumeX, ArrowLeft, Download, RefreshCw } from 'lucide-react';

export default function StoryDisplay({ story, onReset }) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [synth, setSynth] = useState(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSynth(window.speechSynthesis);
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = () => {
    const textToCopy = `${story.title}\n\n${story.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!synth) return;

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    const newUtterance = new SpeechSynthesisUtterance(story.content);
    newUtterance.onend = () => setIsSpeaking(false);
    newUtterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    synth.speak(newUtterance);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([`${story.title}\n\n${story.content}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const paragraphs = story.content.split('\n\n').filter(p => p.trim().length > 0);

  return (
    <div className="space-y-6">
      
      {/* Header Toolbar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {synth && (
            <button
              onClick={handleSpeak}
              className={`inline-flex items-center justify-center h-8 w-8 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer ${isSpeaking ? 'text-purple-400 border-purple-500/30 bg-purple-500/5' : ''}`}
              title={isSpeaking ? "Mute" : "Listen"}
            >
              {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          )}

          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center h-8 w-8 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Download"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center h-8 px-2.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white gap-1 text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Clean Flat Story Card */}
      <article className="rounded-xl border border-slate-900 bg-slate-950 p-6 space-y-6">
        
        {/* Metadata */}
        <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider text-slate-500">
          <span>{story.metadata.genre}</span>
          <span>&bull;</span>
          <span>{story.metadata.style}</span>
          <span>&bull;</span>
          <span>{story.metadata.length}</span>
          <span>&bull;</span>
          <span>{story.metadata.ageGroup}</span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
          {story.title}
        </h2>

        {/* Characters list */}
        {story.metadata.characters && story.metadata.characters.length > 0 && (
          <div className="text-xs text-slate-400 border-l border-slate-800 pl-3 py-0.5 space-y-1">
            <span className="font-semibold text-slate-300">Featured Cast:</span>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-slate-400">
              {story.metadata.characters.map((char) => (
                <span key={char.id}>
                  {char.name} ({char.role})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Story Text */}
        <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>

      {/* Footer controls */}
      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Generate New Story
        </button>
      </div>

    </div>
  );
}
