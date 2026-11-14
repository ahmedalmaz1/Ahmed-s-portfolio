import { z } from 'zod';
import { SOCIAL_PLATFORMS } from '../config.js';
import { atLeastOneField, httpsUrl } from './common.js';

const sortOrder = z.number().int().min(0).max(1000);

export const socialCreateSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  url: httpsUrl,
  sortOrder: sortOrder.optional(),
});

export const socialUpdateSchema = z
  .object({
    platform: z.enum(SOCIAL_PLATFORMS).optional(),
    url: httpsUrl.optional(),
    sortOrder: sortOrder.optional(),
  })
  .refine(...atLeastOneField);

export const SOCIAL_COLUMNS = { platform: 'platform', url: 'url', sortOrder: 'sort_order' };
