import { getToken } from 'next-auth/jwt';
import createError from 'http-errors';

export const isProfessor = async (req) => {
  const token = await getToken({ req });
  
  if (!token || token.role !== 'professor') {
    throw createError(401, 'Unauthorized - Professor access required');
  }
  
  return token;
};