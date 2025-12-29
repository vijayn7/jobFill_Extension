import type {
  FieldContext,
  ProfileData,
  ProfileFieldKey,
  SuggestionEntry,
} from '../../shared/types';
import { buildSearchText } from '../matching/normalize';

const PROFILE_LABELS: Record<ProfileFieldKey, string> = {
  email: 'Email',
  phone: 'Phone',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  resumeText: 'Resume',
};

const SEARCH_KEYWORDS: Record<ProfileFieldKey, string[]> = {
  email: ['email', 'e mail'],
  phone: ['phone', 'mobile', 'cell'],
  linkedin: ['linkedin', 'linked in'],
  github: ['github', 'git hub'],
  resumeText: ['resume', 'cv', 'curriculum vitae'],
};

const getFieldSearchText = (context: FieldContext): string => {
  return buildSearchText([
    context.question_text,
    context.label,
    context.name,
    context.placeholder,
    context.nearby_text,
    context.section_heading,
    context.input_type,
    context.id,
  ]);
};

const matchesKeyword = (text: string, keyword: string): boolean => {
  if (!keyword) {
    return false;
  }
  return text.includes(keyword.replace(/\s+/g, ' ').trim());
};

const detectProfileField = (context: FieldContext): ProfileFieldKey | null => {
  const inputType = context.input_type?.toLowerCase();
  if (inputType === 'email') {
    return 'email';
  }
  if (inputType === 'tel') {
    return 'phone';
  }

  const searchText = getFieldSearchText(context);
  if (!searchText) {
    return null;
  }

  const orderedFields: ProfileFieldKey[] = [
    'email',
    'phone',
    'linkedin',
    'github',
    'resumeText',
  ];

  for (const field of orderedFields) {
    if (SEARCH_KEYWORDS[field].some((keyword) => matchesKeyword(searchText, keyword))) {
      return field;
    }
  }

  return null;
};

const getProfileValue = (profile: ProfileData, field: ProfileFieldKey): string => {
  return profile[field] ?? '';
};

export const buildProfileSuggestions = (
  context: FieldContext,
  profile: ProfileData,
): SuggestionEntry[] => {
  const matchedField = detectProfileField(context);
  if (!matchedField) {
    return [];
  }

  const value = getProfileValue(profile, matchedField).trim();
  if (!value) {
    return [];
  }

  const now = new Date().toISOString();
  const label = PROFILE_LABELS[matchedField];

  return [
    {
      id: `profile-${matchedField}`,
      question_text: `Profile ${label}`,
      answer_text: value,
      answer_type: context.input_type ?? 'text',
      meta: {
        domain: context.domain ?? 'profile',
        platform: 'profile',
        section: 'profile',
        field_type: matchedField,
      },
      created_at: now,
      updated_at: now,
      last_used_at: null,
      usage_count: 0,
      score: 1,
    },
  ];
};
