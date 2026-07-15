import React, { useState } from 'react';
import { Plus, X, User } from 'lucide-react';

export default function CharacterInput({ characters, onAddCharacter, onRemoveCharacter }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAddCharacter({
      id: Date.now().toString(),
      name: name.trim(),
      role: role.trim() || 'Protagonist'
    });
    
    setName('');
    setRole('');
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-slate-200">
          Cast of Characters
        </label>
        <span className="text-xs text-slate-400">
          Introduce up to 3-4 key characters for the AI to weave into your narrative.
        </span>
      </div>

      {/* Dynamic Tags Grid */}
      {characters.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-slate-900/30 border border-slate-800/50">
          {characters.map((char) => (
            <div
              key={char.id}
              className="flex items-center gap-2 rounded-full bg-purple-500/10 px-3.5 py-1 text-xs text-purple-300 border border-purple-500/20"
            >
              <User className="h-3 w-3" />
              <span>
                <strong>{char.name}</strong> {char.role ? `(${char.role})` : ''}
              </span>
              <button
                type="button"
                onClick={() => onRemoveCharacter(char.id)}
                className="rounded-full p-0.5 hover:bg-purple-500/20 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Character Input Form Row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Character Name (e.g., Barnaby)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-purple-500"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Role/Traits (e.g., A clumsy owl)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-purple-500"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!name.trim()}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 disabled:bg-slate-900/40 disabled:text-slate-600 disabled:hover:bg-slate-900/40 border border-slate-700/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Cast
        </button>
      </div>
    </div>
  );
}
