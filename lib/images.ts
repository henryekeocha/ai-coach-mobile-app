const PEXELS_AVATARS: Record<string, string> = {
  'maya-chen': 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
  'alex-rivera': 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
  'jordan-taylor': 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
};

export const getImageSource = (avatarUrl: string | null) => {
  if (!avatarUrl) return null;

  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return { uri: avatarUrl };
  }

  const imageKey = Object.keys(PEXELS_AVATARS).find(key => avatarUrl.includes(key));
  if (imageKey) {
    return { uri: PEXELS_AVATARS[imageKey] };
  }

  return null;
};
