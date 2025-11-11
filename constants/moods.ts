import { MoodType } from '../types/moods';


export const MOOD_IMAGES = {
  excellent: require('../assets/images/moods/exelente.png'),
  good: require('../assets/images/moods/smiling-face.png'),
  neutral: require('../assets/images/moods/rosto-neutro.png'),
  bad: require('../assets/images/moods/ruim.png'),
  terrible: require('../assets/images/moods/pessimo.png'),
   sad: require('../assets/images/moods/sad-face.png')
};

export const TRIGGER_IMAGES = {
  work: require('../assets/images/moods/motivations/work.png'),
  family: require('../assets/images/moods/motivations/family.png'),
  health: require('../assets/images/moods/motivations/health.png'),
  sleep: require('../assets/images/moods/motivations/sleep.png'),
  social: require('../assets/images/moods/motivations/social-media.png'),
  exercise: require('../assets/images/moods/motivations/exercise.png'),
  food: require('../assets/images/moods/motivations/food.png'),
  weather: require('../assets/images/moods/motivations/climate.png'),
  finance: require('../assets/images/moods/motivations/salary.png'),
  relationship: require('../assets/images/moods/motivations/relationship.png'),
 
};

export const MOODS: Array<{ 
  type: MoodType; 
  emoji: string; 
  image: any;
  label: string; 
  color: string; 
  score: number 
}> = [
  { type: 'excellent', emoji: '😄', image: MOOD_IMAGES.excellent, label: 'Excelente', color: '#22c55eff', score: 6},
  { type: 'good', emoji: '🙂', image: MOOD_IMAGES.good, label: 'Bom', color: '#84cc16', score: 5 },
  { type: 'neutral', emoji: '😐', image: MOOD_IMAGES.neutral, label: 'Neutro', color: '#eab308', score: 4 },
  { type: 'bad', emoji: '😟', image: MOOD_IMAGES.bad, label: 'Ruim', color: '#f97316', score: 3},
  { type: 'terrible', emoji: '😢', image: MOOD_IMAGES.terrible, label: 'Péssimo', color: '#ef4444', score: 2 },
  { type: 'sad', emoji: '😒', image: MOOD_IMAGES.sad, label: 'triste', color: '#005AEB', score: 1 },
];

export const TRIGGERS: Array<{ 
  type: string; 
  label: string; 
  icon: string;
  image: any;
}> = [
  { type: 'work', label: 'Trabalho', icon: '💼', image: TRIGGER_IMAGES.work },
  { type: 'family', label: 'Família', icon: '👨‍👩‍👧', image: TRIGGER_IMAGES.family },
  { type: 'health', label: 'Saúde', icon: '🏥', image: TRIGGER_IMAGES.health },
  { type: 'sleep', label: 'Sono', icon: '😴', image: TRIGGER_IMAGES.sleep },
  { type: 'social', label: 'Social', icon: '👥', image: TRIGGER_IMAGES.social },
  { type: 'exercise', label: 'Exercício', icon: '🏃', image: TRIGGER_IMAGES.exercise },
  { type: 'food', label: 'Alimentação', icon: '🍽️', image: TRIGGER_IMAGES.food },
  { type: 'weather', label: 'Clima', icon: '🌤️', image: TRIGGER_IMAGES.weather },
  { type: 'finance', label: 'Finanças', icon: '💰', image: TRIGGER_IMAGES.finance },
  { type: 'relationship', label: 'Relacionamento', icon: '❤️', image: TRIGGER_IMAGES.relationship },
 
];

export const getMoodByType = (type: MoodType) => {
  return MOODS.find(m => m.type === type);
};

export const getTriggerByType = (type: string) => {
  return TRIGGERS.find(t => t.type === type);
};