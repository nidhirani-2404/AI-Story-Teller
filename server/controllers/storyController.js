import axios from 'axios';
import PDFDocument from 'pdfkit'; // Import PDFKit for dynamic document creation
import Story from '../models/Story.js';
import { 
  generateStoryFromAI, 
  continueStoryFromAI, 
  streamStoryFromAI, 
  generateImagePromptText 
} from '../services/aiService.js';

// @desc    Generate a real illustrated AI story and save it to MongoDB linked to user
// @route   POST /api/story
// @access  Private
export const createStory = async (req, res, next) => {
  try {
    const { topic, genre, length, writingStyle, language, ageGroup, characters } = req.body;

    if (!topic) {
      res.status(400);
      throw new Error('Please provide a story topic');
    }

    const { title, summary, chapters, moral } = await generateStoryFromAI({
      topic,
      genre,
      length,
      writingStyle,
      language,
      ageGroup,
      characters
    });

    const illustratedChapters = chapters.map((ch) => {
      const cleanPrompt = `${ch.imagePrompt}, child-friendly digital art, clear details`;
      const encodedPrompt = encodeURIComponent(cleanPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
      
      return {
        title: ch.title,
        story: ch.story,
        imagePrompt: ch.imagePrompt,
        imageUrl: imageUrl
      };
    });

    const combinedStoryText = illustratedChapters
      .map((c) => `[Chapter: ${c.title}]\n${c.story}`)
      .join('\n\n');

    // Save story and assign user reference (req.user._id populated by protect middleware)
    const savedStory = await Story.create({
      title,
      prompt: topic,
      genre,
      language,
      story: combinedStoryText,
      summary,
      moral,
      chapters: illustratedChapters,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      data: savedStory
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved stories belonging to the authenticated user
// @route   GET /api/story
// @access  Private
export const getStories = async (req, res, next) => {
  try {
    // Return stories matching the user's ID OR legacy stories (with no owner assigned)
    const stories = await Story.find({
      $or: [
        { user: req.user._id },
        { user: { $exists: false } }
      ]
    }).sort({ createdDate: -1 });

    res.status(200).json({
      success: true,
      count: stories.length,
      data: stories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a story from the database
// @route   DELETE /api/story/:id
// @access  Private
export const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      res.status(404);
      throw new Error('Story not found');
    }

    // Verify document ownership
    if (story.user && story.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this story');
    }

    await story.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Continue an existing story by appending a new illustrated chapter
// @route   POST /api/story/:id/continue
// @access  Private
export const continueStory = async (req, res, next) => {
  try {
    const { instruction } = req.body;
    const storyId = req.params.id;

    if (!instruction) {
      res.status(400);
      throw new Error('Please provide an instruction for continuation');
    }

    const storyDoc = await Story.findById(storyId);
    if (!storyDoc) {
      res.status(404);
      throw new Error('Story not found');
    }

    // Verify ownership
    if (storyDoc.user && storyDoc.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to edit this story');
    }

    const responseJson = await continueStoryFromAI({
      previousStoryText: storyDoc.story,
      instruction,
      language: storyDoc.language,
      writingStyle: storyDoc.writingStyle,
      ageGroup: storyDoc.ageGroup
    });

    const chapterTitle = responseJson.title || `Chapter ${storyDoc.chapters.length + 1}`;
    const chapterContent = responseJson.story || 'Next segment.';
    const chapterImagePrompt = responseJson.imagePrompt || 'A magical character in a forest.';
    const updatedSummary = responseJson.summary || storyDoc.summary;

    const cleanPrompt = `${chapterImagePrompt}, child-friendly digital art, clear details`;
    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const chapterImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

    storyDoc.chapters.push({
      title: chapterTitle,
      story: chapterContent,
      imagePrompt: chapterImagePrompt,
      imageUrl: chapterImageUrl
    });

    storyDoc.story = `${storyDoc.story}\n\n[Chapter: ${chapterTitle}]\n${chapterContent}`;
    storyDoc.summary = updatedSummary;

    const savedStory = await storyDoc.save();

    res.status(200).json({
      success: true,
      data: savedStory
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Stream AI story text in real-time and save illustrated chapter to database at completion
// @route   POST /api/story/stream
// @access  Private
export const streamStory = async (req, res, next) => {
  try {
    const { topic, genre, length, writingStyle, language, ageGroup, characters } = req.body;

    if (!topic) {
      res.status(400);
      throw new Error('Please provide a story topic');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await streamStoryFromAI({
      topic,
      genre,
      length,
      writingStyle,
      language,
      ageGroup,
      characters
    });

    let fullText = '';

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      fullText += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    let title = 'The Streamed Chronicles';
    let storyContent = fullText;

    if (fullText.includes('Title:')) {
      const parts = fullText.split('\n');
      title = parts[0].replace('Title:', '').trim();
      storyContent = parts.slice(1).join('\n').trim();
    }

    const imagePrompt = await generateImagePromptText(storyContent);
    const cleanPrompt = `${imagePrompt}, child-friendly digital art, clear details`;
    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

    const chapters = [{
      title: 'Chapter 1',
      story: storyContent,
      imagePrompt,
      imageUrl
    }];

    const savedStory = await Story.create({
      title,
      prompt: topic,
      genre,
      language,
      story: storyContent,
      summary: `A real-time streamed ${genre} adventure story.`,
      moral: 'Curiosity unlocks new horizons.',
      chapters,
      user: req.user._id // Bind owner
    });

    res.write(`data: ${JSON.stringify({ id: savedStory._id, title })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    next(error);
  }
};

// @desc    Download story overview audio file (Title and Summary)
// @route   GET /api/story/:id/audio
// @access  Public
export const downloadStoryAudio = async (req, res, next) => {
  try {
    const storyDoc = await Story.findById(req.params.id);
    if (!storyDoc) {
      res.status(404);
      throw new Error('Story not found');
    }

    const textToVoice = `${storyDoc.title}. Overview: ${storyDoc.summary}`.substring(0, 200);

    const langMap = {
      English: 'en',
      Spanish: 'es',
      French: 'fr',
      German: 'de',
      Japanese: 'ja',
      Hindi: 'hi'
    };
    const langCode = langMap[storyDoc.language] || 'en';

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(textToVoice)}`;

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${storyDoc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-audio.mp3"`);

    const response = await axios.get(ttsUrl, { responseType: 'stream' });
    response.data.pipe(res);

  } catch (error) {
    next(error);
  }
};

// @desc    Generate a clean illustrated PDF on server and stream download to client
// @route   GET /api/story/:id/pdf
// @access  Public (Allowed public so anchor links can trigger direct browser file stream downloads)
export const downloadStoryPDF = async (req, res, next) => {
  try {
    // 1. Fetch story from MongoDB
    const storyDoc = await Story.findById(req.params.id);
    if (!storyDoc) {
      res.status(404);
      throw new Error('Story not found');
    }

    // 2. Initialize pdfkit document context with 50px margins
    const doc = new PDFDocument({ margin: 50 });

    // 3. Set standard HTTP download attachment headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${storyDoc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-story.pdf"`);

    // 4. Pipe PDF document generator straight to client Express response stream
    doc.pipe(res);

    // 5. Draw Title Page
    doc.moveDown(4);
    doc.fontSize(32).font('Helvetica-Bold').fillColor('#6d28d9').text(storyDoc.title, { align: 'center', paragraphGap: 10 });
    doc.fontSize(14).font('Helvetica-Oblique').fillColor('#64748b').text(`A Magic ${storyDoc.genre} Storybook`, { align: 'center', paragraphGap: 30 });
    
    // Draw a decorative line separator
    const lineY = doc.y;
    doc.moveTo(150, lineY).lineTo(doc.page.width - 150, lineY).strokeColor('#cbd5e1').lineWidth(1.5).stroke();
    doc.moveDown(3);
    
    doc.fontSize(11).font('Helvetica').fillColor('#64748b').text(`Language: ${storyDoc.language}   |   Created: ${new Date(storyDoc.createdDate).toLocaleDateString()}`, { align: 'center' });

    // 6. Draw each illustrated chapter
    if (storyDoc.chapters && storyDoc.chapters.length > 0) {
      for (let i = 0; i < storyDoc.chapters.length; i++) {
        const ch = storyDoc.chapters[i];

        // Add page break for every chapter
        doc.addPage();

        // Draw Chapter Header
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e293b').text(ch.title, { align: 'center' });
        doc.moveDown(1);

        // Fetch and embed the Pollinations illustration
        if (ch.imageUrl) {
          try {
            const imgResponse = await axios.get(ch.imageUrl, { responseType: 'arraybuffer' });
            const imgBuffer = Buffer.from(imgResponse.data);

            // Embed illustration centered on page
            doc.image(imgBuffer, {
              fit: [280, 280],
              align: 'center'
            });
            doc.moveDown(2);
          } catch (imgErr) {
            console.error('Failed to embed chapter image in PDF:', imgErr.message);
          }
        }

        // Draw Chapter Text Body
        doc.fontSize(11).font('Helvetica').fillColor('#334155').text(ch.story, {
          lineGap: 5,
          paragraphGap: 12
        });
      }
    } else {
      // Fallback: draw legacy flat story content
      doc.addPage();
      doc.fontSize(11).font('Helvetica').fillColor('#334155').text(storyDoc.story, {
        lineGap: 5,
        paragraphGap: 12
      });
    }

    // 7. Draw Moral block on a separate page
    if (storyDoc.moral) {
      doc.addPage();
      doc.moveDown(3);
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#6d28d9').text('The Moral of the Story', { align: 'center' });
      doc.moveDown(1.5);
      doc.fontSize(14).font('Helvetica-Oblique').fillColor('#1e293b').text(`"${storyDoc.moral}"`, {
        align: 'center',
        lineGap: 6
      });
    }

    // 8. Close and finalize PDF document writing stream
    doc.end();

  } catch (error) {
    next(error);
  }
};
