import { HTTP_STATUS, TEXT_LIMITS } from './constants';

export interface AnalysisResult {
  wordCount: number;
  characterCount: number;
  lineCount: number;
  longestWordLength: number;
  mostCommonLetter: string;
}

export interface ValidationError {
  statusCode: typeof HTTP_STATUS.BAD_REQUEST;
  message: string;
}

export function validateText(text: unknown): ValidationError | null {
  if (text === undefined || text === null || text === '') {
    return { statusCode: HTTP_STATUS.BAD_REQUEST, message: 'Missing or empty "text" field' };
  }

  if (typeof text !== 'string') {
    return { statusCode: HTTP_STATUS.BAD_REQUEST, message: '"text" must be a string' };
  }

  if (text.length < TEXT_LIMITS.MIN_LENGTH) {
    return { statusCode: HTTP_STATUS.BAD_REQUEST, message: `"text" must be at least ${TEXT_LIMITS.MIN_LENGTH} characters` };
  }

  if (text.length > TEXT_LIMITS.MAX_LENGTH) {
    return { statusCode: HTTP_STATUS.BAD_REQUEST, message: `"text" must not exceed ${TEXT_LIMITS.MAX_LENGTH} characters` };
  }

  return null;
}

export function analyseText(text: string): AnalysisResult {
  const words: string[] = text.trim().split(/\s+/).filter((w) => w.length > 0);

  const wordCount: number = words.length;

  const characterCount: number = text.replace(/\s/g, '').length;

  const lineCount: number = text.split(/\n/).length;

  const longestWordLength: number = words.reduce((max, word) => {
    const stripped = word.replace(/[^a-zA-Z0-9]/g, '');
    return Math.max(max, stripped.length);
  }, 0);

  const letterFrequency: Record<string, number> = {};
  for (const char of text.toLowerCase()) {
    if (char >= 'a' && char <= 'z') {
      letterFrequency[char] = (letterFrequency[char] ?? 0) + 1;
    }
  }

  const mostCommonLetter: string = Object.entries(letterFrequency).reduce(
    (best, [letter, count]) => (count > best.count ? { letter, count } : best),
    { letter: '', count: 0 }
  ).letter;

  return {
    wordCount,
    characterCount,
    lineCount,
    longestWordLength,
    mostCommonLetter,
  };
}