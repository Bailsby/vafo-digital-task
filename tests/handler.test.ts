import { describe, it, expect, vi } from 'vitest';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handler } from '../src/handler';
import { HTTP_STATUS, TEXT_LIMITS } from '../src/constants';

vi.mock('../src/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function makeEvent(body: string | null): APIGatewayProxyEvent {
  return {
    body,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    resource: '',
  };
}

describe('handler', () => {
  describe('successful requests', () => {
    it('returns 200 with analysis for valid input', async () => {
      const response: APIGatewayProxyResult = await handler(makeEvent(JSON.stringify({ text: 'Hello world.' })));

      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      expect(JSON.parse(response.body)).toEqual({
        wordCount: 2,
        characterCount: 11,
        lineCount: 1,
        longestWordLength: 5,
        mostCommonLetter: 'l',
      });
    });
  });

  describe('invalid JSON', () => {
    it.each([
      ['invalid JSON string', 'not json'],
      ['a JSON primitive', JSON.stringify('just a string')],
      ['null', null],
    ])('returns 400 when body is %s', async (_, body) => {
      const response: APIGatewayProxyResult = await handler(makeEvent(body));

      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });
  });

  describe('invalid text field', () => {
    it.each([
      ['missing', JSON.stringify({ other: 'field' })],
      ['empty', JSON.stringify({ text: '' })],
      ['fewer than 5 characters', JSON.stringify({ text: 'hi' })],
      ['greater than 300 characters', JSON.stringify({ text: 'a'.repeat(TEXT_LIMITS.MAX_LENGTH + 1) })],
    ])('returns 400 when text is %s', async (_, body) => {
      const response: APIGatewayProxyResult = await handler(makeEvent(body));

      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });
  });
});