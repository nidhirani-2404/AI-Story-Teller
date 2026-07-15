import mongoose from 'mongoose';

// Define the Chapter Sub-Schema
const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  story: {
    type: String,
    required: true
  },
  imagePrompt: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
});

// Define the main Story Schema details containing nested chapters
const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Story title is required']
  },
  prompt: {
    type: String,
    required: [true, 'Prompt topic is required']
  },
  genre: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  story: {
    type: String,
    required: [true, 'Combined story text is required']
  },
  summary: {
    type: String,
    required: true
  },
  moral: {
    type: String,
    required: true
  },
  chapters: [chapterSchema], // Nested array of illustrated chapters
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference the User schema
    required: false // Keep optional for legacy compatibility!
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

const Story = mongoose.model('Story', storySchema);

export default Story;
