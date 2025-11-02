// root/backend/services/aiService.js

const OpenAI = require('openai');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

// Initialize OpenAI client (if API key is provided)
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here_if_needed') {
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
const generateAIQuestions = async (config) => {
  if (!openai) {
    console.warn('OpenAI API key not configured, using fallback questions');
    return generateFallbackQuestions(config);
  }

  try {
    const { jobTitle, company, experienceLevel, questionCount, focusAreas } = config;

    const prompt = `Generate ${questionCount} interview questions for a ${experienceLevel} level ${jobTitle} position${company ? ` at ${company}` : ''}. 

Requirements:
- Questions should be appropriate for ${experienceLevel} level candidates
- Include a mix of behavioral, technical, and situational questions
- Questions should be professional and relevant to the role
- Avoid discriminatory or illegal questions
${focusAreas && focusAreas.length > 0 ? `- Focus on these areas: ${focusAreas.join(', ')}` : ''}

Return the questions in the following JSON format:
{
  "questions": [
    {
      "text": "Question text here",
      "category": "Category name",
      "expectedDuration": 3,
      "difficulty": "${experienceLevel}",
      "tips": "Brief tip for answering this question"
    }
  ]
}

Make sure the JSON is valid and complete.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert HR professional who creates thoughtful, relevant interview questions. Always return valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(response);
      return parsedResponse.questions || [];
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', response);
      return generateFallbackQuestions(config);
    }

  } catch (error) {
    console.error('Error generating AI questions:', error);
    return generateFallbackQuestions(config);
  }
};

// Generate fallback questions when AI is not available
const generateFallbackQuestions = (config) => {
  const { experienceLevel, questionCount } = config;
  const levelQuestions = defaultQuestions[experienceLevel] || defaultQuestions.beginner;
  
  const allQuestions = [];
  Object.entries(levelQuestions).forEach(([category, questions]) => {
    questions.forEach(questionText => {
      allQuestions.push({
        text: questionText,
        category,
        expectedDuration: experienceLevel === 'beginner' ? 2 : experienceLevel === 'intermediate' ? 3 : 4,
        difficulty: experienceLevel,
        tips: "Take your time to provide specific examples and explain your thought process."
      });
    });
  });

  // Shuffle and return requested number of questions
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, questionCount || 5);
};

// Generate feedback for user answers
const generateAIFeedback = async (question, answer) => {
  if (!openai) {
    return generateFallbackFeedback(question, answer);
  }

  try {
    const prompt = `As an expert interview coach, provide constructive feedback for this interview response:

Question: "${question}"
Answer: "${answer}"

Please provide:
1. Overall assessment (good, needs improvement, etc.)
2. Specific strengths in the answer
3. Areas for improvement
4. Suggestions for better responses
5. A score from 1-100

Return the feedback in the following JSON format:
{
  "score": 85,
  "assessment": "Good response with room for improvement",
  "strengths": ["Clear communication", "Relevant example"],
  "improvements": ["Add more specific metrics", "Elaborate on the outcome"],
  "suggestions": "Consider using the STAR method (Situation, Task, Action, Result) to structure your response more effectively."
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert interview coach providing constructive, helpful feedback to help candidates improve their interview performance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content;
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Error parsing AI feedback response:', parseError);
      return generateFallbackFeedback(question, answer);
    }

  } catch (error) {
    console.error('Error generating AI feedback:', error);
    return generateFallbackFeedback(question, answer);
  }
};

// Generate fallback feedback when AI is not available
const generateFallbackFeedback = (question, answer) => {
  const wordCount = answer.split(' ').length;
  let score = 70; // Base score
  
  // Adjust score based on answer length
  if (wordCount < 20) score -= 20;
  else if (wordCount > 100) score += 10;
  
  // Adjust score based on content quality indicators
  if (answer.toLowerCase().includes('example') || answer.toLowerCase().includes('experience')) score += 10;
  if (answer.toLowerCase().includes('result') || answer.toLowerCase().includes('outcome')) score += 10;
  if (answer.toLowerCase().includes('learn') || answer.toLowerCase().includes('improve')) score += 5;

  score = Math.min(100, Math.max(0, score));

  return {
    score,
    assessment: score >= 80 ? "Good response" : score >= 60 ? "Adequate response with room for improvement" : "Needs significant improvement",
    strengths: wordCount >= 50 ? ["Detailed response", "Shows engagement"] : ["Shows willingness to respond"],
    improvements: wordCount < 50 ? ["Provide more detailed examples", "Expand on your experience"] : ["Add specific metrics or outcomes"],
    suggestions: "Consider using the STAR method (Situation, Task, Action, Result) to structure your responses. Provide specific examples from your experience to make your answers more compelling."
  };
};

// Check if AI service is available
const isAIAvailable = () => {
  return openai !== null;
};

module.exports = {
  generateAIQuestions,
  generateAIFeedback,
  generateFallbackQuestions,
  generateFallbackFeedback,
  isAIAvailable
};