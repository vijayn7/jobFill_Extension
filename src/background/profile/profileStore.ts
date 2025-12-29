import type { ProfileData } from '../../shared/types';

export const PROFILE_STORAGE_KEY = 'jobfill_profile';

export const DEFAULT_PROFILE: ProfileData = {
  email: '',
  phone: '',
  linkedin: '',
  github: '',
  resumeText: '',
};

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const normalizeProfile = (input: unknown): ProfileData => {
  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    return {
      email: toString(record.email),
      phone: toString(record.phone),
      linkedin: toString(record.linkedin),
      github: toString(record.github),
      resumeText: toString(record.resumeText),
    };
  }

  return { ...DEFAULT_PROFILE };
};

export const getProfile = async (): Promise<ProfileData> => {
  const stored = await chrome.storage.local.get(PROFILE_STORAGE_KEY);
  return normalizeProfile(stored[PROFILE_STORAGE_KEY]);
};

export const saveProfile = async (profile: ProfileData): Promise<void> => {
  await chrome.storage.local.set({
    [PROFILE_STORAGE_KEY]: profile,
  });
};

export const updateProfile = async (updates: Partial<ProfileData>): Promise<ProfileData> => {
  const current = await getProfile();
  const next: ProfileData = {
    ...current,
    ...updates,
  };
  await saveProfile(next);
  return next;
};
