import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  Search, 
  Trash2, 
  Calendar, 
  BookOpenCheck, 
  ArrowLeft, 
  SlidersHorizontal,
  Play,
  Pause,
  Square,
  Download,
  Volume2
} from 'lucide-react';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

// Global reference for logout trigger (needed in fetch handlers)
let globalLogoutRef = () => {};

function App() {
  // 1. User & Authentication State
  const [user, setUser] = useState(null);
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'signup'
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // 2. Navigation / View State
  const [activeTab, setActiveTab] = useState('generate');

  // 3. Form Input States
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [length, setLength] = useState('Short (~500 words)');
  const [writingStyle, setWritingStyle] = useState('Whimsical');
  const [language, setLanguage] = useState('English');
  const [ageGroup, setAgeGroup] = useState('Kids (4-8 years)');
  const [characters, setCharacters] = useState('');

  // 4. Generator & Streaming States
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState(null);

  // 5. Continuation States
  const [continueInstruction, setContinueInstruction] = useState('');
  const [continueLoading, setContinueLoading] = useState(false);

  // 6. History States
  const [historyStories, setHistoryStories] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [activeHistoryStory, setActiveHistoryStory] = useState(null);

  // 7. Text-to-Speech (TTS) Browser Playback States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('storyForgeUser');
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setStory(null);
    setActiveHistoryStory(null);
    setHistoryStories([]);
  };

  // Bind logout to global reference
  useEffect(() => {
    globalLogoutRef = handleLogout;
  }, []);

  // Auto-login check on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('storyForgeUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch stories matching token
  const fetchStories = async (tokenVal) => {
    const activeToken = tokenVal || user?.token;
    if (!activeToken) return;
    
    setHistoryLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/story`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (response.data && response.data.data) {
        setHistoryStories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      if (error.response && error.response.status === 401) {
        handleLogout();
        alert('Session expired or account not found in Atlas database. Please sign up or log in again.');
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history' && user?.token) {
      fetchStories();
      setActiveHistoryStory(null);
    }
  }, [activeTab, user]);

  // Cancel voice narration on screen changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [activeTab, activeHistoryStory]);

  // Auth Submit: SignUp / Login
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      const endpoint = authTab === 'login' ? 'login' : 'signup';
      const payload = authTab === 'login'
        ? { email: authEmail.trim(), password: authPassword }
        : { username: authUsername.trim(), email: authEmail.trim(), password: authPassword };

      const response = await axios.post(`${API_BASE_URL}/api/user/${endpoint}`, payload);

      if (response.data && response.data.data) {
        const userData = response.data.data;
        setUser(userData);
        localStorage.setItem('storyForgeUser', JSON.stringify(userData));
        
        // Clear fields
        setAuthUsername('');
        setAuthEmail('');
        setAuthPassword('');
        
        // Load stories
        fetchStories(userData.token);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setAuthError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    }
  };

  // Text-To-Speech Playback
  const startSpeech = (storyText, storyLanguage) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(storyText);

    const localeMap = {
      English: 'en-US',
      Spanish: 'es-ES',
      French: 'fr-FR',
      German: 'de-DE',
      Japanese: 'ja-JP',
      Hindi: 'hi-IN'
    };
    utterance.lang = localeMap[storyLanguage] || 'en-US';

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error('Speech failed:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    setIsPlaying(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const handlePlaySpeech = (storyText, storyLanguage) => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      startSpeech(storyText, storyLanguage);
    }
  };

  const handlePauseSpeech = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleStopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Delete a story
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/story/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      if (error.response && error.response.status === 401) {
        handleLogout();
        alert('Session expired. Please log in again.');
      }
    }
  };

  // Form Submit: Stream story linked to user credentials
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStory(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/story/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          topic: topic.trim(),
          genre,
          length,
          writingStyle,
          language,
          ageGroup,
          characters: characters.trim(),
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          alert('Session expired or user account not found in Atlas database. Please sign up or log in again.');
          return;
        }
        throw new Error(`HTTP server error: ${response.status}`);
      }

      setStory({
        title: 'StoryForge AI Creation',
        content: '',
        chapters: []
      });
      setLoading(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finished = false;

      while (!finished) {
        const { value, done } = await reader.read();
        if (done) {
          finished = true;
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              finished = true;
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                setStory((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    content: prev.content + parsed.text,
                  };
                });
              }
              if (parsed.id) {
                const docResponse = await axios.get(`${API_BASE_URL}/api/story`, {
                  headers: { Authorization: `Bearer ${user.token}` }
                });
                const matchedDoc = docResponse.data.data.find(d => d._id === parsed.id);
                
                if (matchedDoc) {
                  setStory({
                    id: matchedDoc._id,
                    title: matchedDoc.title,
                    summary: matchedDoc.summary,
                    content: matchedDoc.story,
                    chapters: matchedDoc.chapters || [],
                    moral: matchedDoc.moral
                  });
                } else {
                  setStory((prev) => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      id: parsed.id,
                      title: parsed.title || prev.title,
                    };
                  });
                }
              }
            } catch (jsonErr) {
              // Ignore incomplete JSON chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming story:', error);
      setStory({
        title: `Generation Error`,
        content: `Could not connect or load stream. Please verify your server is active.\n\nDetails: ${error.message}`,
      });
      setLoading(false);
    }
  };

  // Continue story
  const handleContinue = async (storyId) => {
    if (!continueInstruction.trim()) return;
    setContinueLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/story/${storyId}/continue`, {
        instruction: continueInstruction.trim()
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (response.data && response.data.data) {
        const updatedStory = response.data.data;
        if (story && story.id === storyId) {
          setStory({
            ...story,
            summary: updatedStory.summary,
            content: updatedStory.story,
            chapters: updatedStory.chapters || []
          });
        }
        if (activeHistoryStory && activeHistoryStory._id === storyId) {
          setActiveHistoryStory(updatedStory);
        }
        setContinueInstruction('');
      }
    } catch (error) {
      console.error('Error continuing story:', error);
      if (error.response && error.response.status === 401) {
        handleLogout();
        alert('Session expired. Please log in again.');
      }
    } finally {
      setContinueLoading(false);
    }
  };

  const filteredStories = historyStories.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(query) ||
      s.prompt.toLowerCase().includes(query) ||
      s.genre.toLowerCase().includes(query)
    );
  });

  const sortedStories = [...filteredStories].sort((a, b) => {
    const dateA = new Date(a.createdDate);
    const dateB = new Date(b.createdDate);
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // ===========================================
  // RENDER METHOD 1: LOGIN / SIGNUP SCREEN
  // ===========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-sm border border-slate-900 bg-slate-950 p-6 rounded-lg space-y-6 shadow-xl">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              StoryForge AI
            </h1>
            <p className="text-xs text-slate-400">Your portal to illustrated tales</p>
          </div>

          <div className="flex border-b border-slate-900 text-xs uppercase font-bold tracking-wider">
            <button
              onClick={() => { setAuthTab('login'); setAuthError(''); }}
              className={`flex-1 pb-2 cursor-pointer transition-colors ${authTab === 'login' ? 'border-b-2 border-purple-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Log In
            </button>
            <button
              onClick={() => { setAuthTab('signup'); setAuthError(''); }}
              className={`flex-1 pb-2 cursor-pointer transition-colors ${authTab === 'signup' ? 'border-b-2 border-purple-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
              <div className="text-rose-400 bg-rose-950/15 border border-rose-950/30 p-2.5 rounded text-xs">
                {authError}
              </div>
            )}

            {authTab === 'signup' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">Username</label>
                <input
                  type="text"
                  required
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="e.g. storyweaver"
                  className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="******"
                className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded text-xs transition-colors cursor-pointer shadow mt-2"
            >
              {authTab === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===========================================
  // RENDER METHOD 2: MAIN DASHBOARD VIEW
  // ===========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      
      {/* HEADER */}
      <header className="border-b border-slate-900 bg-slate-950 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-500" />
            StoryForge AI
          </h1>
          
          <nav className="flex gap-4 items-center">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeTab === 'generate' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Generator
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeTab === 'history' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              History
            </button>
            
            <div className="h-4 w-px bg-slate-850"></div>

            <span className="text-[10px] text-slate-400 hidden sm:inline">Hi, {user.username}</span>

            <button
              onClick={handleLogout}
              className="text-[10px] bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold uppercase tracking-wider px-2 py-1 rounded cursor-pointer transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 py-8">
        
        {/* =======================================
            TAB 1: GENERATE STORIES
            ======================================= */}
        {activeTab === 'generate' && (
          loading ? (
            <div className="text-center py-16 space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
              <p className="text-sm text-slate-300 font-semibold">Opening AI connection channel...</p>
            </div>
          ) : story ? (
            
            /* B. LIVE STREAMING / ILLUSTRATED PREVIEW CARD */
            <div className="space-y-6 animate-fade-in">
              <div className="border border-slate-900 bg-slate-950 p-6 rounded-lg space-y-4 shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold text-purple-400">{story.title}</h2>
                
                <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  <span>{genre}</span>
                  <span>&bull;</span>
                  <span>{writingStyle}</span>
                  <span>&bull;</span>
                  <span>{length}</span>
                  <span>&bull;</span>
                  <span>{ageGroup}</span>
                </div>

                {/* TTS Playback, Audio & PDF Downloads Toolbar */}
                <div className="flex flex-wrap gap-2 items-center py-2.5 border-y border-slate-900 my-2">
                  <div className="flex gap-1.5">
                    {!isPlaying || isPaused ? (
                      <button
                        onClick={() => handlePlaySpeech(story.content, language)}
                        className="bg-purple-600/15 hover:bg-purple-600/30 text-purple-400 px-3 py-1.5 rounded flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
                        title="Play Narration"
                      >
                        <Play className="h-3 w-3" />
                        Play Voice
                      </button>
                    ) : (
                      <button
                        onClick={handlePauseSpeech}
                        className="bg-amber-600/15 hover:bg-amber-600/30 text-amber-400 px-3 py-1.5 rounded flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
                        title="Pause Narration"
                      >
                        <Pause className="h-3 w-3" />
                        Pause Voice
                      </button>
                    )}
                    
                    {isPlaying && (
                      <button
                        onClick={handleStopSpeech}
                        className="bg-slate-905 hover:bg-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
                        title="Stop Narration"
                      >
                        <Square className="h-3 w-3" />
                        Stop
                      </button>
                    )}
                  </div>

                  {story.id && (
                    <div className="flex gap-2 ml-auto">
                      <a
                        href={`${API_BASE_URL}/api/story/${story.id}/audio`}
                        download
                        className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-3 py-1.5 rounded flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                        title="Download MP3 Audio"
                      >
                        <Download className="h-3 w-3 text-purple-400" />
                        Audio
                      </a>
                      <a
                        href={`${API_BASE_URL}/api/story/${story.id}/pdf`}
                        download
                        className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-3 py-1.5 rounded flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                        title="Download Illustrated PDF File"
                      >
                        <Download className="h-3 w-3 text-purple-400" />
                        PDF
                      </a>
                    </div>
                  )}
                </div>
                
                {story.summary && (
                  <div className="bg-slate-900/50 border border-slate-800/80 p-3.5 rounded text-xs text-slate-400 italic">
                    <span className="font-bold not-italic text-slate-300 uppercase tracking-wide mr-1.5">Summary:</span>
                    {story.summary}
                  </div>
                )}
                
                {story.chapters && story.chapters.length > 0 ? (
                  <div className="space-y-8 pt-2">
                    {story.chapters.map((ch, idx) => (
                      <div key={idx} className="space-y-4 border-b border-slate-900 pb-6 last:border-0 last:pb-0">
                        <h3 className="text-lg font-bold text-slate-200">{ch.title}</h3>
                        <p className="whitespace-pre-line text-slate-300 leading-relaxed text-sm sm:text-base">
                          {ch.story}
                        </p>
                        {ch.imageUrl && (
                          <div className="max-w-md mx-auto overflow-hidden rounded-lg border border-slate-800 bg-slate-900/30 p-1.5 shadow-md mt-4">
                            <img
                              src={ch.imageUrl}
                              alt={ch.title}
                              loading="lazy"
                              className="w-full h-auto object-cover rounded shadow"
                            />
                            <p className="text-[10px] text-slate-500 italic text-center mt-1.5 px-2">
                              Illustration prompt: "{ch.imagePrompt}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="whitespace-pre-line text-slate-300 leading-relaxed text-sm sm:text-base pt-2">
                    {story.content || 'AI is thinking...'}
                  </p>
                )}

                {story.moral && (
                  <div className="border-l-4 border-purple-500 bg-purple-950/15 p-4 rounded-r mt-6 text-sm text-purple-200">
                    <span className="font-bold text-purple-400 block mb-1 uppercase tracking-wider text-xs">The Moral of the Story:</span>
                    {story.moral}
                  </div>
                )}

                {/* Continue Story Form */}
                {story.id && (
                  <div className="pt-6 border-t border-slate-900 mt-6 space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-purple-400">Continue Story (Add Next Chapter)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="What happens next? (E.g., Continue for another chapter where they meet a giant...)"
                          value={continueInstruction}
                          onChange={(e) => setContinueInstruction(e.target.value)}
                          disabled={continueLoading}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          onClick={() => handleContinue(story.id)}
                          disabled={continueLoading || !continueInstruction.trim()}
                          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/30 disabled:text-slate-500 disabled:hover:bg-purple-900/30 text-white font-bold px-4 py-2 rounded text-xs transition-colors cursor-pointer"
                        >
                          {continueLoading ? 'Writing...' : 'Continue'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <button
                  onClick={() => setStory(null)}
                  className="bg-slate-905 border border-slate-800 hover:bg-slate-800 text-slate-200 px-5 py-2 rounded text-sm font-medium cursor-pointer"
                >
                  Create Another Story
                </button>
              </div>
            </div>
          ) : (
            
            /* C. INPUT PARAMETERS FORM */
            <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">AI Story Generator</h2>
                <p className="text-xs text-slate-400">Fill in the fields below to stream illustrated stories.</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-200">Story Topic</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What is your story about?"
                  required
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-200">Genre</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Fantasy">Fantasy</option>
                    <option value="Science Fiction">Science Fiction</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Fairy Tale">Fairy Tale</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-200">Writing Style</label>
                  <select
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Whimsical">Whimsical</option>
                    <option value="Dramatic">Dramatic</option>
                    <option value="Poetic">Poetic</option>
                    <option value="Humorous">Humorous</option>
                    <option value="Suspenseful">Suspenseful</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-200">Story Length</label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Short (~500 words)">Short (~500 words)</option>
                    <option value="Medium (~1000 words)">Medium (~1000 words)</option>
                    <option value="Long (~2000 words)">Long (~2000 words)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-200">Target Age Group</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Toddlers (0-3 years)">Toddlers (0-3 years)</option>
                    <option value="Kids (4-8 years)">Kids (4-8 years)</option>
                    <option value="Pre-teens (9-12 years)">Pre-teens (9-12 years)</option>
                    <option value="Teens (13-18 years)">Teens (13-18 years)</option>
                    <option value="Adults (18+)">Adults (18+)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-200">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-200">Characters</label>
                  <input
                    type="text"
                    value={characters}
                    onChange={(e) => setCharacters(e.target.value)}
                    placeholder="E.g., Aria the Wizard, Bramble the Fox"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded text-sm transition-colors cursor-pointer shadow-md mt-4"
              >
                Generate AI Story (Streamed)
              </button>
            </form>
          )
        )}

        {/* =======================================
            TAB 2: STORY HISTORY
            ======================================= */}
        {activeTab === 'history' && (
          activeHistoryStory ? (
            
            /* A. DETAILED INDIVIDUAL STORY VIEW (with continue feature + illustrated chapters + audio voice + pdf download) */
            <div className="space-y-6 animate-fade-in">
              <button
                onClick={() => setActiveHistoryStory(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to History List
              </button>

              <div className="border border-slate-900 bg-slate-950 p-6 rounded-lg space-y-4 shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold text-purple-400">{activeHistoryStory.title}</h2>
                
                <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{activeHistoryStory.genre}</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{activeHistoryStory.language}</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {new Date(activeHistoryStory.createdDate).toLocaleDateString()}
                  </span>
                </div>

                {/* TTS Playback and Download Toolbar */}
                <div className="flex flex-wrap gap-2 items-center py-2.5 border-y border-slate-900 my-2">
                  <div className="flex gap-1.5">
                    {!isPlaying || isPaused ? (
                      <button
                        onClick={() => handlePlaySpeech(activeHistoryStory.story, activeHistoryStory.language)}
                        className="bg-purple-600/15 hover:bg-purple-600/30 text-purple-400 px-3 py-1.5 rounded flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
                        title="Play Narration"
                      >
                        <Play className="h-3 w-3" />
                        Play Voice
                      </button>
                    ) : (
                      <button
                        onClick={handlePauseSpeech}
                        className="bg-amber-600/15 hover:bg-amber-600/30 text-amber-400 px-3 py-1.5 rounded flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
                        title="Pause Narration"
                      >
                        <Pause className="h-3 w-3" />
                        Pause Voice
                      </button>
                    )}
                    
                    {isPlaying && (
                      <button
                        onClick={handleStopSpeech}
                        className="bg-slate-905 hover:bg-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
                        title="Stop Narration"
                      >
                        <Square className="h-3 w-3" />
                        Stop
                      </button>
                    )}
                  </div>

                  {activeHistoryStory._id && (
                    <div className="flex gap-2 ml-auto">
                      <a
                        href={`${API_BASE_URL}/api/story/${activeHistoryStory._id}/audio`}
                        download
                        className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-3 py-1.5 rounded flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                        title="Download MP3 Audio"
                      >
                        <Download className="h-3 w-3 text-purple-400" />
                        Audio
                      </a>
                      <a
                        href={`${API_BASE_URL}/api/story/${activeHistoryStory._id}/pdf`}
                        download
                        className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-3 py-1.5 rounded flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                        title="Download Illustrated PDF"
                      >
                        <Download className="h-3 w-3 text-purple-400" />
                        PDF
                      </a>
                    </div>
                  )}
                </div>

                {activeHistoryStory.summary && (
                  <div className="bg-slate-900/50 border border-slate-800/80 p-3.5 rounded text-xs text-slate-400 italic">
                    <span className="font-bold not-italic text-slate-300 uppercase tracking-wide mr-1.5">Summary:</span>
                    {activeHistoryStory.summary}
                  </div>
                )}

                {/* Illustrated Chapters Renderer */}
                {activeHistoryStory.chapters && activeHistoryStory.chapters.length > 0 ? (
                  <div className="space-y-8 pt-2">
                    {activeHistoryStory.chapters.map((ch, idx) => (
                      <div key={idx} className="space-y-4 border-b border-slate-900 pb-6 last:border-0 last:pb-0">
                        <h3 className="text-lg font-bold text-slate-200">{ch.title}</h3>
                        <p className="whitespace-pre-line text-slate-300 leading-relaxed text-sm sm:text-base">
                          {ch.story}
                        </p>
                        {ch.imageUrl && (
                          <div className="max-w-md mx-auto overflow-hidden rounded-lg border border-slate-800 bg-slate-900/30 p-1.5 shadow-md mt-4">
                            <img
                              src={ch.imageUrl}
                              alt={ch.title}
                              loading="lazy"
                              className="w-full h-auto object-cover rounded shadow"
                            />
                            <p className="text-[10px] text-slate-500 italic text-center mt-1.5 px-2">
                              Illustration prompt: "{ch.imagePrompt}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="whitespace-pre-line text-slate-300 leading-relaxed text-sm sm:text-base pt-2">
                    {activeHistoryStory.story}
                  </p>
                )}

                {activeHistoryStory.moral && (
                  <div className="border-l-4 border-purple-500 bg-purple-950/15 p-4 rounded-r mt-6 text-sm text-purple-200">
                    <span className="font-bold text-purple-400 block mb-1 uppercase tracking-wider text-xs">The Moral:</span>
                    {activeHistoryStory.moral}
                  </div>
                )}

                {/* Continue Story Form Section */}
                <div className="pt-6 border-t border-slate-900 mt-6 space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-purple-400">Continue Story (Add Next Chapter)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="What happens next? (E.g., Continue for another chapter where they meet a giant...)"
                        value={continueInstruction}
                        onChange={(e) => setContinueInstruction(e.target.value)}
                        disabled={continueLoading}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={() => handleContinue(activeHistoryStory._id)}
                        disabled={continueLoading || !continueInstruction.trim()}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/30 disabled:text-slate-500 disabled:hover:bg-purple-900/30 text-white font-bold px-4 py-2 rounded text-xs transition-colors cursor-pointer"
                      >
                        {continueLoading ? 'Writing...' : 'Continue'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            
            /* B. HISTORY LIST SEARCH, SORT & CARDS GRID */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-950/50 border border-slate-900 p-4 rounded-lg">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by title or concept..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-slate-400">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>

              {historyLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-purple-500 border-r-transparent"></div>
                  <p className="text-xs text-slate-400 mt-2">Loading library history...</p>
                </div>
              ) : sortedStories.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-900 rounded-lg space-y-2">
                  <BookOpenCheck className="h-8 w-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-400">No stories found</p>
                  <p className="text-xs text-slate-500">Go back to the generator to weave your first story!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedStories.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => setActiveHistoryStory(item)}
                      className="border border-slate-900 bg-slate-900/10 hover:bg-slate-900/30 hover:border-slate-800 p-5 rounded-lg flex flex-col justify-between transition-all cursor-pointer shadow hover:shadow-md group"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <button
                            onClick={(e) => handleDelete(item._id, e)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Story"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <p className="text-xs text-slate-400 italic line-clamp-2">
                          {item.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-4 mt-2 border-t border-slate-950">
                        <span className="uppercase text-purple-400/90">{item.genre}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.createdDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} StoryForge AI. Learner Edition.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
