import React, { useState } from 'react';
import InputField from './InputField';
import SelectField from './SelectField';
import CharacterInput from './CharacterInput';
import { Wand2 } from 'lucide-react';

const GENRE_OPTIONS = [
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'scifi', label: 'Science Fiction' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'fairytale', label: 'Fairy Tale' },
  { value: 'horror', label: 'Horror' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'suspense', label: 'Suspense' },
];

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short (~500 words)' },
  { value: 'medium', label: 'Medium (~1000 words)' },
  { value: 'long', label: 'Epic (~2000 words)' },
];

const STYLE_OPTIONS = [
  { value: 'whimsical', label: 'Whimsical & Playful' },
  { value: 'poetic', label: 'Poetic & Descriptive' },
  { value: 'dramatic', label: 'Dramatic & Intense' },
  { value: 'humorous', label: 'Humorous & Witty' },
  { value: 'mysterious', label: 'Mysterious & Suspenseful' },
  { value: 'cinematic', label: 'Cinematic & Action-Packed' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish (Español)' },
  { value: 'fr', label: 'French (Français)' },
  { value: 'de', label: 'German (Deutsch)' },
  { value: 'ja', label: 'Japanese (日本語)' },
  { value: 'hi', label: 'Hindi (हिन्दी)' },
  { value: 'zh', label: 'Chinese (中文)' },
];

const AGE_OPTIONS = [
  { value: 'toddlers', label: 'Toddlers (0-3 years)' },
  { value: 'kids', label: 'Kids (4-8 years)' },
  { value: 'preteens', label: 'Pre-teens (9-12 years)' },
  { value: 'teens', label: 'Teens / Young Adults (13-18 years)' },
  { value: 'adults', label: 'Adults (18+)' },
];

export default function StoryForm({ onSubmit }) {
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState(GENRE_OPTIONS[0].value);
  const [length, setLength] = useState(LENGTH_OPTIONS[0].value);
  const [style, setStyle] = useState(STYLE_OPTIONS[0].value);
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0].value);
  const [ageGroup, setAgeGroup] = useState(AGE_OPTIONS[1].value); // Default to Kids
  const [characters, setCharacters] = useState([]);

  const handleAddCharacter = (newChar) => {
    setCharacters((prev) => [...prev, newChar]);
  };

  const handleRemoveCharacter = (id) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onSubmit({
      topic: topic.trim(),
      genre,
      length,
      style,
      language,
      ageGroup,
      characters
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* Topic input */}
      <InputField
        label="Story Topic"
        id="topic"
        name="topic"
        type="textarea"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="E.g., A young detective finds a door to a steampunk kingdom hidden inside an old library clock..."
        required={true}
        rows={4}
      />

      {/* Grid for Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Genre"
          id="genre"
          name="genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          options={GENRE_OPTIONS}
        />
        
        <SelectField
          label="Writing Style"
          id="style"
          name="style"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          options={STYLE_OPTIONS}
        />

        <SelectField
          label="Story Length"
          id="length"
          name="length"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          options={LENGTH_OPTIONS}
        />

        <SelectField
          label="Target Age Group"
          id="ageGroup"
          name="ageGroup"
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          options={AGE_OPTIONS}
        />

        <SelectField
          label="Language"
          id="language"
          name="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          options={LANGUAGE_OPTIONS}
        />
      </div>

      {/* Cast of Characters */}
      <div className="pt-2 border-t border-slate-900">
        <CharacterInput
          characters={characters}
          onAddCharacter={handleAddCharacter}
          onRemoveCharacter={handleRemoveCharacter}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 py-3 text-sm font-semibold text-white transition-colors cursor-pointer shadow"
        >
          <Wand2 className="h-4 w-4" />
          <span>Generate Story</span>
        </button>
      </div>

    </form>
  );
}
