const OpenAI = require('openai');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

// Initialize OpenAI client (if API key is provided)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Default questions template for fallback
const defaultQuestions = {
  beginner: {
    'General': [
      "Tell me about yourself and your background.",
      "Why are you interested in this position?",
      "What are your greatest strengths?",
      "Where do you see yourself in 5 years?",
      "Why do you want to work for our company?"
    ],
    'Motivation': [
      "What motivates you to perform your best?",
      "How do you handle challenging situations?",
      "What interests you most about this role?",
      "How do you stay organized and manage your time?",
      "What do you know about our company?"
    ]
  },
  intermediate: {
    'Problem Solving': [
      "Describe a challenging project you worked on and how you overcame obstacles.",
      "Tell me about a time when you had to learn something new quickly.",
      "How do you approach problem-solving in a team environment?",
      "Describe a situation where you had to make a difficult decision.",
      "Tell me about a time when you failed and what you learned from it."
    ],
    'Leadership': [
      "Describe your leadership style.",
      "Tell me about a time when you had to lead a team through a difficult situation.",
      "How do you motivate team members who are struggling?",
      "Describe a time when you had to give constructive feedback to a colleague.",
      "How do you handle conflicts within a team?"
    ]
  },
  advanced: {
    'Strategic Thinking': [
      "How would you approach developing a long-term strategy for our department?",
      "Describe a time when you had to make a strategic decision with limited information.",
      "How do you stay current with industry trends and incorporate them into your work?",
      "Tell me about a time when you had to pivot your approach mid-project.",
      "How would you handle a situation where you disagree with senior management?"
    ],
    'Innovation': [
      "Describe an innovative solution you implemented to solve a business problem.",
      "How do you foster creativity and innovation within your team?",
      "Tell me about a time when you had to implement change in an organization.",
      "How do you balance innovation with risk management?",
      "Describe your approach to digital transformation initiatives."
    ]
  }
};

// Generate AI-powered interview questions

// Generate fallback questions when AI is not available

// Generate AI feedback for user answers

// Generate fallback feedback when AI is not available
