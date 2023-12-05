import { registerAs } from './utils';

export const filesConfig = registerAs('files', () => ({
  avatar: {
    maxSizeMb: +process.env.PW_FILES_AVATAR_MAX_SIZE_MB,
    acceptedMimeTypes: process.env.PW_FILES_AVATAR_ACCEPTED_MIME_TYPES,
  },
}));
