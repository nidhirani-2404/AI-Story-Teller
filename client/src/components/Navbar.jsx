import React from 'react';
import { BookOpen } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="w-full border-b border-slate-900 bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 cursor-pointer">
          <BookOpen className="h-5 w-5 text-purple-500" />
          <span className="text-lg font-bold text-white tracking-tight">
            StoryForge <span className="text-purple-500">AI</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="#" className="text-white transition-colors">
            Generator
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Library
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Discover
          </a>
        </nav>

        {/* Badge */}
        <div className="flex items-center">
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400 border border-slate-800">
            v1.0
          </span>
        </div>
        
      </div>
    </header>
  );
}
