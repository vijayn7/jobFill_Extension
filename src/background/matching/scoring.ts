import { lexicalScore } from './lexical';

export const scoreMatch = (question: string, candidate: string): number => {
  return lexicalScore(question, candidate);
};
