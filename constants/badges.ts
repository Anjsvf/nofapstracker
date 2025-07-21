import { Badge } from '@/types';

// Import all badge images
const badgeImages = {
   pre_humano: require('@/assets/images/badges/pre_humano.png'),
  aluno: require('@/assets/images/badges/aluno.webp'),
  noob: require('@/assets/images/badges/noob.webp'),
  cidadao_comum: require('@/assets/images/badges/cidadao_comum.webp'),
  esforcado: require('@/assets/images/badges/esforcado.webp'),
  disciplinado: require('@/assets/images/badges/diciplinado.webp'),
  quase_alpha: require('@/assets/images/badges/quase_alpha.webp'),
  fenix: require('@/assets/images/badges/pre_humano.png'),
  sigma_da_semana: require('@/assets/images/badges/sigma_da_semana.webp'),
  o_escolhido: require('@/assets/images/badges/o_escolhido.webp'),
  o_avancado: require('@/assets/images/badges/o_avancado.webp'),
  o_mestre: require('@/assets/images/badges/o_mestre.webp'),
  sobrevivente: require('@/assets/images/badges/sobrevivente.webp'),
  pro_player: require('@/assets/images/badges/proplayer.webp'),
  god_mode_ativado: require('@/assets/images/badges/god_mode.webp'),
  hacker: require('@/assets/images/badges/hacker.webp'),
  tita: require('@/assets/images/badges/tita.webp'),
  imbativel: require('@/assets/images/badges/imbativel.webp'),
  sigma_boy: require('@/assets/images/badges/pre_humano.png'),
  sigma: require('@/assets/images/badges/pre_humano.png'),
  chad_iniciante: require('@/assets/images/badges/pre_humano.png'),
  chad: require('@/assets/images/badges/pre_humano.png'),
  super_chad: require('@/assets/images/badges/pre_humano.png'),
  giga_chad: require('@/assets/images/badges/pre_humano.png'),
  deus_chad: require('@/assets/images/badges/deus_chad.webp'),
};

export const BADGES: Badge[] = [
  // Recruit (0–3 days)
  { 
    key: 'pre_humano', 
    name: 'Pré-Humano', 
    days: 0, 
    category: 'Divisão Zero',
    imageSource: badgeImages.pre_humano
  },
  { 
    key: 'rece_nascido', 
    name: 'Recém-Nascido', 
    days: 1, 
    category: 'Divisão Zero',
    imageSource: badgeImages.aluno
  },
  { 
    key: 'noob', 
    name: 'Noob', 
    days: 3, 
    category: 'Divisão Zero',
    imageSource: badgeImages.noob
  },

  // Combat Apprentice (4–7 days)
  { 
    key: 'cidadao_comum', 
    name: 'Cidadão Comum', 
    days: 4, 
    category: 'Divisão Beta',
    imageSource: badgeImages.cidadao_comum
  },
  { 
    key: 'esforcado', 
    name: 'Esforçado', 
    days: 5, 
    category: 'Divisão Beta',
    imageSource: badgeImages.esforcado
  },
  { 
    key: 'disciplinado', 
    name: 'Disciplinado', 
    days: 7, 
    category: 'Divisão Beta',
    imageSource: badgeImages.disciplinado
  },

  // Rising Warrior (8–14 days)
  { 
    key: 'quase_alpha', 
    name: 'Quase Alpha', 
    days: 10, 
    category: 'Rising Warrior',
    imageSource: badgeImages.quase_alpha
  },
  { 
    key: 'fenix', 
    name: 'Fênix Renascente', 
    days: 12, 
    category: 'Rising Warrior',
    imageSource: badgeImages.fenix
  },
  { 
    key: 'sigma_da_semana', 
    name: 'Sigma da Semana', 
    days: 14, 
    category: 'Rising Warrior',
    imageSource: badgeImages.sigma_da_semana
  },

  // Tactical Master (15–30 days)
  { 
    key: 'o_escolhido', 
    name: 'O Escolhido', 
    days: 20, 
    category: 'Tactical Master',
    imageSource: badgeImages.o_escolhido
  },
  { 
    key: 'o_avancado', 
    name: 'O Avançado', 
    days: 25, 
    category: 'Tactical Master',
    imageSource: badgeImages.o_avancado
  },
  { 
    key: 'o_mestre', 
    name: 'O Mestre', 
    days: 30, 
    category: 'Tactical Master',
    imageSource: badgeImages.o_mestre
  },

  // Elite Veteran (31–60 days)
  { 
    key: 'sobrevivente', 
    name: 'Sobrevivente', 
    days: 40, 
    category: 'Elite Veteran',
    imageSource: badgeImages.sobrevivente
  },
  { 
    key: 'pro_player', 
    name: 'Pro Player', 
    days: 50, 
    category: 'Elite Veteran',
    imageSource: badgeImages.pro_player
  },
  { 
    key: 'god_mode_ativado', 
    name: 'God Mode Ativado', 
    days: 60, 
    category: 'Elite Veteran',
    imageSource: badgeImages.god_mode_ativado
  },

  // Forged Legend (61–90 days)
  { 
    key: 'hacker', 
    name: 'Hacker', 
    days: 70, 
    category: 'Forged Legend',
    imageSource: badgeImages.hacker
  },
  { 
    key: 'tita', 
    name: 'Titã', 
    days: 80, 
    category: 'Forged Legend',
    imageSource: badgeImages.tita
  },
  { 
    key: 'imbativel', 
    name: 'Imbatível', 
    days: 90, 
    category: 'Forged Legend',
    imageSource: badgeImages.imbativel
  },

  // Immortal Hero (91–180 days)
  { 
    key: 'sigma_boy', 
    name: 'Sigma Boy', 
    days: 120, 
    category: 'Immortal Hero',
    imageSource: badgeImages.sigma_boy
  },
  { 
    key: 'sigma', 
    name: 'Sigma', 
    days: 150, 
    category: 'Immortal Hero',
    imageSource: badgeImages.sigma
  },
  { 
    key: 'chad_iniciante', 
    name: 'Chad Iniciante', 
    days: 180, 
    category: 'Immortal Hero',
    imageSource: badgeImages.chad_iniciante
  },

  // God of the Game (181–365 days)
  { 
    key: 'chad', 
    name: 'Chad', 
    days: 240, 
    category: 'Divisão Prime',
    imageSource: badgeImages.chad
  },
  { 
    key: 'super_chad', 
    name: 'Super Chad', 
    days: 300, 
    category: 'Divisão Prime',
    imageSource: badgeImages.super_chad
  },
  { 
    key: 'giga_chad', 
    name: 'Giga Chad', 
    days: 365, 
    category: 'Divisão Prime',
    imageSource: badgeImages.giga_chad
  },

  // Immortal Deity (>365 days)
  { 
    key: 'deus_chad', 
    name: 'Deus Chad', 
    days: 366, 
    category: 'Divisão Imortal',
    imageSource: badgeImages.deus_chad
  },
];

export const BADGE_CATEGORIES = [
  'Divisão Zero',
  'Divisão Beta', 
  'Rising Warrior',
  'Tactical Master',
  'Elite Veteran',
  'Forged Legend',
  'Immortal Hero',
  'Divisão Prime',
  'Divisão Imortal'
] as const;