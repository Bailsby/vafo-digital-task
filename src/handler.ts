import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { analyseText, AnalysisResult, validateText, ValidationError } from './analyser';
import { HTTP_STATUS } from './constants';
import { logger } from './logger';

function jsonResponse(statusCode: number, body: object): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Incoming request', { body: event.body });

  let parsed: unknown;

  try {
    parsed = JSON.parse(event.body ?? '');
  } catch {
    logger.error('Invalid JSON received');

    return jsonResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Request body must be valid JSON' });
  }

  if (typeof parsed !== 'object' || parsed === null) {
    logger.error('Request body is not a JSON object');

    return jsonResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Request body must be a JSON object' });
  }

  const { text } = parsed as Record<string, unknown>;

  const validationError: ValidationError | null = validateText(text);

  if (validationError) {
    logger.warn('Validation error', { errorMessage: validationError.message });

    return jsonResponse(HTTP_STATUS.BAD_REQUEST, { error: validationError.message });
  }

  const result: AnalysisResult = analyseText(text as string);
  logger.info('Request successful', { result });

  return jsonResponse(HTTP_STATUS.OK, result);
};