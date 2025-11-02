// root/backend/utils/validation.js

const validator = require('validator');

// Common validation patterns
const PATTERNS = {
  username: /^[a-zA-Z0-9_-]{3,30}$/,
  password: /^.{6,}$/, // At least 6 characters
  name: /^[a-zA-Z\s-']{2,50}$/,
  jobTitle: /^[a-zA-Z\s-'()&]{2,100}$/,
  company: /^[a-zA-Z0-9\s-'()&.]{2,100}$/,
};

// Validation functions
const validationUtils = {
  // Email validation
  isValidEmail: (email) => {
    return typeof email === 'string' && validator.isEmail(email) && email.length <= 254;
  },

  // Username validation
  isValidUsername: (username) => {
    return typeof username === 'string' && PATTERNS.username.test(username);
  },

  // Password validation
  isValidPassword: (password) => {
    return typeof password === 'string' && password.length >= 6 && password.length <= 128;
  },

  // Strong password validation (for optional enhanced security)
  isStrongPassword: (password) => {
    if (!validationUtils.isValidPassword(password)) return false;
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasLower && hasUpper && hasNumber && hasSpecial;
  },

  // Name validation (full name, first name, last name)
  isValidName: (name) => {
    return typeof name === 'string' && PATTERNS.name.test(name) && name.trim().length >= 2;
  },

  // Job title validation
  isValidJobTitle: (title) => {
    return typeof title === 'string' && PATTERNS.jobTitle.test(title) && title.trim().length >= 2;
  },

  // Company name validation
  isValidCompany: (company) => {
    if (!company) return true; // Optional field
    return typeof company === 'string' && PATTERNS.company.test(company) && company.trim().length >= 2;
  },

  // Experience level validation
  isValidExperienceLevel: (level) => {
    return typeof level === 'string' && ['beginner', 'intermediate', 'advanced'].includes(level);
  },

  // Duration validation (in minutes)
  isValidDuration: (duration) => {
    const num = parseInt(duration, 10);
    return !isNaN(num) && num >= 5 && num <= 180; // 5 minutes to 3 hours
  },

  // Question count validation
  isValidQuestionCount: (count) => {
    const num = parseInt(count, 10);
    return !isNaN(num) && num >= 1 && num <= 20;
  },

  // Text content validation (for answers, feedback, etc.)
  isValidTextContent: (text, minLength = 1, maxLength = 5000) => {
    return typeof text === 'string' && 
           text.trim().length >= minLength && 
           text.length <= maxLength;
  },

  // Array validation
  isValidArray: (arr, maxLength = 50) => {
    return Array.isArray(arr) && arr.length <= maxLength;
  },

  // String array validation (for focus areas, tags, etc.)
  isValidStringArray: (arr, maxLength = 20, itemMaxLength = 100) => {
    if (!validationUtils.isValidArray(arr, maxLength)) return false;
    
    return arr.every(item => 
      typeof item === 'string' && 
      item.trim().length > 0 && 
      item.length <= itemMaxLength
    );
  },

  // Score validation (0-100)
  isValidScore: (score) => {
    const num = parseInt(score, 10);
    return !isNaN(num) && num >= 0 && num <= 100;
  },

  // Rating validation (1-5)
  isValidRating: (rating) => {
    const num = parseInt(rating, 10);
    return !isNaN(num) && num >= 1 && num <= 5;
  },

  // ID validation (positive integer)
  isValidId: (id) => {
    const num = parseInt(id, 10);
    return !isNaN(num) && num > 0 && num <= Number.MAX_SAFE_INTEGER;
  },

  // Page validation (for pagination)
  isValidPage: (page) => {
    const num = parseInt(page, 10);
    return !isNaN(num) && num >= 1 && num <= 10000;
  },

  // Limit validation (for pagination)
  isValidLimit: (limit) => {
    const num = parseInt(limit, 10);
    return !isNaN(num) && num >= 1 && num <= 100;
  },

  // URL validation
  isValidUrl: (url) => {
    return typeof url === 'string' && validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
    });
  },

  // JSON validation
  isValidJSON: (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Sanitize text input
  sanitizeText: (text) => {
    if (typeof text !== 'string') return '';
    return validator.escape(text.trim());
  },

  // Sanitize HTML
  sanitizeHtml: (html) => {
    if (typeof html !== 'string') return '';
    // Basic HTML sanitization - in production, use a proper HTML sanitizer like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },

  // Validate and sanitize user registration data
  validateRegistration: (data) => {
    const errors = [];

    if (!validationUtils.isValidUsername(data.username)) {
      errors.push('Username must be 3-30 characters long and contain only letters, numbers, hyphens, and underscores');
    }

    if (!validationUtils.isValidEmail(data.email)) {
      errors.push('Please provide a valid email address');
    }

    if (!validationUtils.isValidPassword(data.password)) {
      errors.push('Password must be at least 6 characters long');
    }

    if (data.fullName && !validationUtils.isValidName(data.fullName)) {
      errors.push('Full name must be 2-50 characters long and contain only letters, spaces, hyphens, and apostrophes');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: {
        username: validationUtils.sanitizeText(data.username || ''),
        email: validationUtils.sanitizeText(data.email || '').toLowerCase(),
        password: data.password, // Don't sanitize passwords
        fullName: validationUtils.sanitizeText(data.fullName || ''),
      }
    };
  },

  // Validate and sanitize interview configuration
  validateInterviewConfig: (data) => {
    const errors = [];

    if (!validationUtils.isValidJobTitle(data.jobTitle)) {
      errors.push('Job title must be 2-100 characters long and contain valid characters');
    }

    if (data.company && !validationUtils.isValidCompany(data.company)) {
      errors.push('Company name must be 2-100 characters long and contain valid characters');
    }

    if (!validationUtils.isValidExperienceLevel(data.experienceLevel)) {
      errors.push('Experience level must be beginner, intermediate, or advanced');
    }

    if (data.duration && !validationUtils.isValidDuration(data.duration)) {
      errors.push('Duration must be between 5 and 180 minutes');
    }

    if (data.questionCount && !validationUtils.isValidQuestionCount(data.questionCount)) {
      errors.push('Question count must be between 1 and 20');
    }

    if (data.focusAreas && !validationUtils.isValidStringArray(data.focusAreas)) {
      errors.push('Focus areas must be an array of valid strings');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: {
        jobTitle: validationUtils.sanitizeText(data.jobTitle || ''),
        company: validationUtils.sanitizeText(data.company || ''),
        experienceLevel: data.experienceLevel,
        duration: parseInt(data.duration, 10) || 30,
        questionCount: parseInt(data.questionCount, 10) || 5,
        focusAreas: Array.isArray(data.focusAreas) 
          ? data.focusAreas.map(area => validationUtils.sanitizeText(area))
          : []
      }
    };
  },

  // Validate question data
  validateQuestion: (data) => {
    const errors = [];

    if (!validationUtils.isValidTextContent(data.questionText, 10, 1000)) {
      errors.push('Question text must be 10-1000 characters long');
    }

    if (!validationUtils.isValidName(data.category)) {
      errors.push('Category must be a valid category name');
    }

    if (!validationUtils.isValidExperienceLevel(data.difficultyLevel)) {
      errors.push('Difficulty level must be beginner, intermediate, or advanced');
    }

    if (data.expectedDuration && !validationUtils.isValidDuration(data.expectedDuration)) {
      errors.push('Expected duration must be between 5 and 180 minutes');
    }

    if (data.sampleAnswer && !validationUtils.isValidTextContent(data.sampleAnswer, 0, 2000)) {
      errors.push('Sample answer must not exceed 2000 characters');
    }

    if (data.evaluationCriteria && !validationUtils.isValidStringArray(data.evaluationCriteria)) {
      errors.push('Evaluation criteria must be an array of valid strings');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: {
        questionText: validationUtils.sanitizeText(data.questionText || ''),
        category: validationUtils.sanitizeText(data.category || ''),
        difficultyLevel: data.difficultyLevel,
        expectedDuration: parseInt(data.expectedDuration, 10) || 3,
        sampleAnswer: validationUtils.sanitizeText(data.sampleAnswer || ''),
        evaluationCriteria: Array.isArray(data.evaluationCriteria)
          ? data.evaluationCriteria.map(criterion => validationUtils.sanitizeText(criterion))
          : []
      }
    };
  },

  // Common middleware for request validation
  createValidator: (validationFn) => {
    return (req, res, next) => {
      const validation = validationFn(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      req.validatedData = validation.sanitized;
      next();
    };
  }
};

module.exports = validationUtils;