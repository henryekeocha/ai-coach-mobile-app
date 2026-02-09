const PEXELS_AVATARS: Record<string, string> = {
  'alex-rivera': 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
  'jordan-taylor': 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
};

const LOCAL_ASSETS: Record<string, any> = {
  'maya-chen-new': require('../assets/images/maya-chen.png'),
  'jordan-taylor-new': require('../assets/images/jordan-taylor.png'),
  'alex-rivera-new': require('../assets/images/alex-rivera.png'),
};

export const getImageSource = (avatarUrl: string | null | undefined) => {
  if (!avatarUrl) return null;

  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return { uri: avatarUrl };
  }

  const localKey = Object.keys(LOCAL_ASSETS).find(key => avatarUrl.includes(key));
  if (localKey) {
    return LOCAL_ASSETS[localKey];
  }

  const imageKey = Object.keys(PEXELS_AVATARS).find(key => avatarUrl.includes(key));
  if (imageKey) {
    return { uri: PEXELS_AVATARS[imageKey] };
  }

  return null;
};
