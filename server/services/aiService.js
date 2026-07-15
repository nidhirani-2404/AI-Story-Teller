import Groq from 'groq-sdk';

// Declare a placeholder variable for the Groq client
let groq = null;

/**
 * Service function to generate a multi-chapter story with illustration prompts (JSON Mode)
 * @param {Object} params - Story details (topic, genre, length, writingStyle, language, ageGroup, characters)
 * @returns {Promise<Object>} - Promise resolving to structured story data
 */
export const generateStoryFromAI = async ({
  topic,
  genre,
  length,
  writingStyle,
  language,
  ageGroup,
  characters,
}) => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not defined in the server environment configuration.');
    }
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  // Define structured system instructions requesting a chapters array
  const systemPrompt = `You are a professional, bestselling children's book author and creative writer.
Your goal is to write a highly engaging, multi-chapter story based on the user's parameters.

You MUST return your response ONLY as a valid JSON object.
The JSON object must have exactly the following structure:
{
  "title": "[Insert an imaginative, catchy title for the story]",
  "summary": "[Provide a concise 1-2 sentence summary of the story]",
  "chapters": [
    {
      "title": "Chapter 1: [Insert Chapter Title]",
      "story": "[Write detailed narrative paragraphs for Chapter 1. Break into paragraphs using double newlines (\\n\\n)]",
      "imagePrompt": "[Detailed, descriptive illustration prompt depicting a key scene from this chapter. Style: Whimsical digital illustration, vivid colors, no text, child-friendly]"
    },
    {
      "title": "Chapter 2: [Insert Chapter Title]",
      "story": "[Write detailed narrative paragraphs for Chapter 2. Break into paragraphs using double newlines (\\n\\n)]",
      "imagePrompt": "[Detailed, descriptive illustration prompt depicting a key scene from this chapter. Style: Whimsical digital illustration, vivid colors, no text, child-friendly]"
    }
  ],
  "moral": "[A meaningful moral lesson or key takeaway from the story]"
}

CRITICAL CREATIVE GUIDELINES:
- Language: Write the ENTIRE response (title, summary, chapter titles, chapter stories, imagePrompts, and moral) in "${language}".
- Tone & Style: Adapt the narration style to match: "${writingStyle}".
- Target Audience: Adjust vocabulary and sentence complexity for: "${ageGroup}".
- Cast: Weave the characters "${characters || 'a mysterious explorer'}" organically into the plot.
- Chapters: Generate exactly 2 detailed chapters.`;

  const userPrompt = `Generate a story matching this details:
- Core Concept/Topic: ${topic}
- Genre: ${genre}
- Length Target: ${length}`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    model: 'llama-3.1-8b-instant',
    response_format: { type: 'json_object' },
    temperature: 0.75,
  });

  const responseText = chatCompletion.choices[0]?.message?.content || '{}';
  const responseJson = JSON.parse(responseText);

  return {
    title: responseJson.title || 'The Illustrated Saga',
    summary: responseJson.summary || 'A story about a secret adventure.',
    chapters: responseJson.chapters || [],
    moral: responseJson.moral || 'Believe in yourself.'
  };
};

/**
 * Service function to continue an existing story by writing the next chapter (JSON Mode)
 * @returns {Promise<Object>} - Promise resolving to { title, story, imagePrompt, summary }
 */
export const continueStoryFromAI = async ({
  previousStoryText,
  instruction,
  language,
  writingStyle,
  ageGroup
}) => {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  // System Prompt requesting next chapter + illustration prompt
  const systemPrompt = `You are a professional author. You are writing the NEXT CHAPTER of an existing story.
You MUST return your response ONLY as a valid JSON object.

Format your response exactly as follows:
{
  "title": "[Insert subtitle for this new chapter (e.g. Chapter 3: The Secret Vault)]",
  "story": "[Write only the new chapter content. Break into paragraphs using double newlines (\\n\\n)]",
  "imagePrompt": "[Detailed illustration prompt describing a key visual scene from this new chapter. Style: Whimsical digital illustration, vivid colors, no text]",
  "summary": "[Provide an updated 1-2 sentence summary of the entire saga including this new addition]"
}

CRITICAL RULES:
- Do not repeat previous text. Write only the new events.
- Language: Write the entire response in "${language}".
- Tone & Style: Maintain consistency with style: "${writingStyle}".
- Target Audience: Match target age group complexity: "${ageGroup}".`;

  const userPrompt = `Here is the story written so far:
\"\"\"
${previousStoryText}
\"\"\"

Now, continue the story based on this instruction:
"${instruction}"`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    model: 'llama-3.1-8b-instant',
    response_format: { type: 'json_object' },
    temperature: 0.75
  });

  const responseText = chatCompletion.choices[0]?.message?.content || '{}';
  return JSON.parse(responseText);
};

/**
 * Service function to retrieve a real-time text completion stream from Groq
 */
export const streamStoryFromAI = async ({
  topic,
  genre,
  length,
  writingStyle,
  language,
  ageGroup,
  characters,
}) => {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  const prompt = `Write a story matching these parameters:
- Core Concept: ${topic}
- Genre: ${genre}
- Length: ${length}
- Style: ${writingStyle}
- Language: ${language}
- Target Age Group: ${ageGroup}
- Cast: ${characters || 'A curious adventurer'}

Please write the story directly. You MUST write a creative story title on the first line starting with "Title: [Title Name]" and then write the story content. Do not output JSON.`;

  return await groq.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a professional children\'s author.' },
      { role: 'user', content: prompt }
    ],
    model: 'llama-3.1-8b-instant',
    stream: true,
    temperature: 0.75
  });
};

/**
 * Utility service to generate a descriptive illustration prompt from raw text (for stream fallbacks)
 * @param {String} storyText - The story context
 * @returns {Promise<String>} - Descriptive illustration prompt
 */
export const generateImagePromptText = async (storyText) => {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  const systemPrompt = `You are a creative art director. Your job is to read a story scene and write a short, highly descriptive image generation prompt (1-2 sentences) that represents it.
Output ONLY the final image prompt text. Do not write intros or quotes.
Include style details: "Whimsical digital art, vibrant colors, child-friendly, no text".`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Write a prompt for this text:\n\n${storyText.substring(0, 1000)}` }
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.6
  });

  return completion.choices[0]?.message?.content?.trim() || 'A magical digital illustration of a story scene.';
};
