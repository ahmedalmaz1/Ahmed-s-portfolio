import { z } from 'zod';
import { LIMITS } from '../config.js';
import { atLeastOneField, email, emptyToNull, keyOf, text } from './common.js';

// PATCH semantics: only the fields that are sent are changed; null clears a field.
export const profileUpdateSchema = z
  .object({
    name: text(LIMITS.nameMax, 1).optional(),
    bio: text(LIMITS.bioMax).optional(),
    email: emptyToNull(email).optional(),
    avatarKey: emptyToNull(keyOf('avatars')).optional(),
    showreelKey: emptyToNull(keyOf('showreel', { video: true })).optional(),
    showreelPosterKey: emptyToNull(keyOf('showreel')).optional(),
  })
  .refine(...atLeastOneField);

export const PROFILE_COLUMNS = {
  name: 'name',
  bio: 'bio',
  email: 'email',
  avatarKey: 'avatar_key',
  showreelKey: 'showreel_key',
  showreelPosterKey: 'showreel_poster_key',
};
