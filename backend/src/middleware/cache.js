import { PUBLIC_CACHE } from '../config.js';

export const publicCache = async (c, next) => {
  await next();
  if (c.res.status === 200) c.header('Cache-Control', PUBLIC_CACHE);
};
