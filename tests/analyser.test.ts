import { describe, it, expect, vi } from 'vitest';
import { analyseText, AnalysisResult, validateText, ValidationError } from '../src/analyser';
import { HTTP_STATUS, TEXT_LIMITS } from '../src/constants';

describe('validateText', () => {
  describe('invalid inputs', () => {
    it.each([
      ['undefined', undefined],
      ['null', null],
      ['an empty string', ''],
      ['a non-string value', 123],
      ['fewer than 5 characters', 'hi'],
      ['greater than 300 characters', 'a'.repeat(TEXT_LIMITS.MAX_LENGTH + 1)],
    ])('returns a 400 error when text is %s', (_, input) => {
      const result: ValidationError | null = validateText(input);

      expect(result).not.toBeNull();
      expect(result?.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });
  });

  describe('valid inputs', () => {
    it.each([
      ['valid text', 'Hello world'],
      ['exactly 5 characters', 'a'.repeat(TEXT_LIMITS.MIN_LENGTH)],
      ['exactly 300 characters', 'a'.repeat(TEXT_LIMITS.MAX_LENGTH)],
    ])('returns null when text is %s', (_, input) => {
      const result: ValidationError | null = validateText(input);

      expect(result).toBeNull();
    });
  });
});

describe('analyseText', () => {
  describe('wordCount', () => {
    it.each([
      ['a simple sentence', 'Hello world.', 2],
      ['multiple spaces between words', 'one  two   three', 3],
      ['leading and trailing whitespace', '  hello world  ', 2],
      ['a single word', 'hello', 1],
    ])('counts words correctly for %s', (_, input, expected) => {
      const result: AnalysisResult = analyseText(input);

      expect(result.wordCount).toBe(expected);
    });
  });

  describe('characterCount', () => {
    it.each([
      ['a simple sentence', 'Hello world.', 11],
      ['spaces, tabs, and newlines', 'a b\tc\nd', 4],
    ])('counts non-whitespace characters for %s', (_, input, expected) => {
      const result: AnalysisResult = analyseText(input);

      expect(result.characterCount).toBe(expected);
    });
  });

  describe('lineCount', () => {
    it.each([
      ['a single line', 'Hello world.', 1],
      ['multiple lines', 'line one\nline two\nline three', 3],
    ])('counts lines correctly for %s', (_, input, expected) => {
      const result: AnalysisResult = analyseText(input);

      expect(result.lineCount).toBe(expected);
    });
  });

  describe('longestWordLength', () => {
    it.each([
      ['a simple sentence', 'Hello world.', 5],
      ['punctuation attached to a word', 'Hi world.', 5],
      ['all same-length words', 'cat bat hat', 3],
    ])('finds the longest word length for %s', (_, input, expected) => {
      const result: AnalysisResult = analyseText(input);

      expect(result.longestWordLength).toBe(expected);
    });
  });

  describe('mostCommonLetter', () => {
    it.each([
      ['a simple sentence', 'Hello world.', 'l'],
      ['uppercase letters', 'AAAA bbbb', 'a'],
      ['non-letter characters', '111 aaa bb', 'a'],
    ])('finds the most common letter for %s', (_, input, expected) => {
      const result: AnalysisResult = analyseText(input);

      expect(result.mostCommonLetter).toBe(expected);
    });
  });
});