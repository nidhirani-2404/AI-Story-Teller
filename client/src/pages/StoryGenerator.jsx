import React, { useState } from 'react';
import StoryForm from '../components/StoryForm';
import Loader from '../components/Loader';
import StoryDisplay from '../components/StoryDisplay';

export default function StoryGenerator() {
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState(null);

  const handleGenerateStory = (formData) => {
    setLoading(true);
    setStory(null);

    // Simulate AI Generation delay (2.5 seconds)
    setTimeout(() => {
      const generated = generateMockStory(formData);
      setStory(generated);
      setLoading(false);
    }, 2500);
  };

  // Simplified Client-side Story Weaver
  const generateMockStory = (data) => {
    const charNames = data.characters.length > 0 
      ? data.characters.map(c => c.name) 
      : ['Aria'];
    const hero = charNames[0];
    const sidekick = charNames[1] || 'Bramble';
    
    const heroRole = data.characters[0]?.role || 'a curious wanderer';
    const sidekickRole = data.characters[1]?.role || 'a loyal companion';

    let title = '';
    let content = '';

    const topicSnippet = data.topic.length > 25 
      ? data.topic.substring(0, 25).trim() + '...' 
      : data.topic;

    switch (data.genre) {
      case 'fantasy':
        title = `The Chronicles of ${hero}: Quest for the Lost Realm`;
        content = `Deep within the whispering groves of Eldoria, ${hero}, ${heroRole}, discovered a secret that would alter history. Under a moss-covered boulder lay a glowing map revealing details of: "${data.topic}".\n\nSetting off at twilight, ${hero} was soon joined by ${sidekick}, ${sidekickRole}. Together, they navigated the Shimmering Marshes, where glowing fireflies danced in patterns. "The map says we must follow the northern star," whispered ${sidekick}, adjusting a heavy leather satchel.\n\nSuddenly, the ground trembled, and a stone gate emerged from the mist. Inserting the ancient relic they had found into the keyhole, the gate swung open, releasing a wave of warm, lavender-scented wind. As they stepped through, ${hero} knew their fantasy quest had only just begun.`;
        break;

      case 'scifi':
        title = `System Failure: The ${hero} Protocol`;
        content = `The year was 2142, and Neo-Tokyo was locked under the control of a rogue mainframe. ${hero}, ${heroRole}, sat in a dark basement typing rapid lines of code. The objective was simple yet perilous: bypass the encryption shielding "${data.topic}".\n\n"Drones are patrolling the lower corridor," warned ${sidekick}, ${sidekickRole}, checking the holographic security monitors. "We have less than ninety seconds before they trace our IP." ${hero}'s fingers flew across the keyboard. A green loading bar on the terminal reached 99%.\n\nWith a final click, the power grids across the sector flickered out, plunging the streets into silence. "We're in," ${hero} muttered, pulling out a glowing drive. The mainframe was breached, and humanity finally had a fighting chance.`;
        break;

      case 'mystery':
        title = `The Secret of the Clockwork Vault`;
        content = `A dense fog blanketed the streets of Victorian London. At 221B Baker Street, ${hero}, ${heroRole}, carefully examined a tarnished key. It was directly linked to the bizarre case of "${data.topic}".\n\n"The footprints in the study lead to the garden wall," remarked ${sidekick}, ${sidekickRole}, holding up a brass magnifying glass. "But they vanish completely near the old fountain." ${hero} smiled, recognizing a classic diversion.\n\nPressing a hidden brick in the fountain's base, a secret drawer slid open, revealing a leather-bound journal. Just then, a shadow darted across the courtyard. "Hold it!" yelled ${sidekick}. The game was afoot, and ${hero} was determined to solve the grandest mystery London had ever witnessed.`;
        break;

      default:
        title = `The Legend of ${hero}: ${topicSnippet}`;
        content = `It was a day unlike any other when ${hero}, ${heroRole}, was tasked with resolving: "${data.topic}". It was a burden that weighed heavily on their shoulders.\n\nWith the help of ${sidekick}, ${sidekickRole}, they gathered their supplies and ventured into the unknown. Along the journey, they discovered reserves of courage they never knew they possessed. "We can do this," encouraged ${sidekick} during their darkest hour.\n\nBy sunset, they had achieved the impossible. The town celebrated their return, and the names of ${hero} and ${sidekick} were etched forever in the archives of heroes.`;
    }

    if (data.language !== 'en') {
      const langNames = {
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        ja: 'Japanese',
        hi: 'Hindi',
        zh: 'Chinese'
      };
      content += `\n\n[Translation Sandbox: This story is dynamically generated in English for the preview. In the complete version, the AI engine will write the entire text natively in ${langNames[data.language] || 'your selected language'}.]`;
    }

    return {
      title,
      content,
      metadata: data
    };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          AI Story Generator
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Specify your parameters and cast to let the AI write a story for you.
        </p>
      </div>

      {/* Main Workspace Card */}
      <div className="rounded-xl border border-slate-900 bg-slate-900/20 p-6 shadow-md">
        {loading ? (
          <Loader />
        ) : story ? (
          <StoryDisplay story={story} onReset={() => setStory(null)} />
        ) : (
          <StoryForm onSubmit={handleGenerateStory} />
        )}
      </div>

    </div>
  );
}
