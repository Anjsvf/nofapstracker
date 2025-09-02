import { Badge } from '@/types';


const badgeImages = {
O_iniciante: require('@/assets/images/badges/o_iniciante.webp'),
   pre_humano: require('@/assets/images/badges/pre_humano.png'),
  o_aprendiz: require('@/assets/images/badges/o_aprendiz.webp'),
  noob: require('@/assets/images/badges/noob.webp'),
  betinha: require('@/assets/images/badges/betinha.webp'),
  esforcado: require('@/assets/images/badges/esforcado.webp'),
  disciplinado: require('@/assets/images/badges/diciplinado.webp'),
  foco_total: require('@/assets/images/badges/foco_total.webp'),
  quase_alpha: require('@/assets/images/badges/quase_alpha.webp'),
  sigma_da_semana: require('@/assets/images/badges/sigma_da_semana.webp'),
  o_escolhido: require('@/assets/images/badges/guerreiro_escolhido.webp'),
  guerreiro_avancado: require('@/assets/images/badges/guerreiro_avancado.webp'),
  guerreiro_mestre: require('@/assets/images/badges/guerreiro_mestre.webp'),
  visionario: require('@/assets/images/badges/visionario.webp'),
  prime: require('@/assets/images/badges/modo_prime.webp'),
  god_mode_ativado: require('@/assets/images/badges/god_mode.webp'),
  hacker: require('@/assets/images/badges/hacker.webp'),
  tita: require('@/assets/images/badges/tita.webp'),
  imbativel: require('@/assets/images/badges/imbativel.webp'),
  sigma_boy: require('@/assets/images/badges/sigma_boy.webp'),
  sigma: require('@/assets/images/badges/sigma.webp'),
  Super_sigma: require('@/assets/images/badges/super_sigma.webp'),
  chad: require('@/assets/images/badges/super_chad.webp'),
  super_chad: require('@/assets/images/badges/chad.webp'),
  giga_chad: require('@/assets/images/badges/giga_chad.webp'),
  deus_chad: require('@/assets/images/badges/deus_chad.webp'),
};

export const BADGES: Badge[] = [
  
  { 
    key: 'iniciante', 
    name: 'Iniciante', 
    days: 0, 
    category: 'Divisão Zero',
    imageSource: badgeImages.O_iniciante
  },
  { 
    key: 'novato', 
    name: 'Novato', 
    days: 1, 
    category: 'Divisão Zero',
    imageSource: badgeImages.o_aprendiz
  },
  { 
    key: 'noob', 
    name: 'Noob', 
    days: 3, 
    category: 'Divisão Zero',
    imageSource: badgeImages.betinha
  },

  
  { 
    key: 'Betinha', 
    name: 'Betinha', 
    days: 4, 
    category: 'Divisão Beta',
    imageSource: badgeImages.noob
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


  { 
    key: 'Foco_Total', 
    name: 'Foco Total', 
    days: 10, 
    category: 'Divisão Resistência',
    imageSource: badgeImages.foco_total
  },
  { 
    key: 'Quase_Alpha', 
    name: 'Quase Alpha', 
    days: 12, 
    category: 'Divisão Resistência',
    imageSource: badgeImages.quase_alpha
  },
  { 
    key: 'sigma_da_semana', 
    name: 'Sigma da Semana', 
    days: 14, 
    category: 'Divisão Resistência',
    imageSource: badgeImages.sigma_da_semana
  },

  
  { 
    key: 'Guerreiro_Escolhido', 
    name: 'Guerreiro Escolhido', 
    days: 20, 
    category: 'Divisão Guerreiro',
    imageSource: badgeImages.o_escolhido
  },
  { 
    key: 'Guerreiro_avancado', 
    name: 'Guerreiro Avançado', 
    days: 25, 
    category: 'Divisão Guerreiro',
    imageSource: badgeImages.guerreiro_avancado
  },
  { 
    key: 'guerreiro_mestre', 
    name: 'Guerreiro Mestre', 
    days: 30, 
    category: 'Divisão Guerreiro',
    imageSource: badgeImages.guerreiro_mestre
  },

  
  { 
    key: 'visionario', 
    name: 'Visionário', 
    days: 40, 
    category: 'Divisão Prime',
    imageSource: badgeImages.visionario
  },
  { 
    key: 'modo_prime', 
    name: 'Modo Prime', 
    days: 50, 
    category: 'Divisão Prime',
    imageSource: badgeImages.prime
  },
  { 
    key: 'god_mode_ativado', 
    name: 'God Mode Ativado', 
    days: 60, 
    category: 'Divisão Prime',
    imageSource: badgeImages.god_mode_ativado
  },

  {
    key: 'supremo', 
    name: 'Supremo', 
    days: 70, 
    category: 'Divisão Lendária',
    imageSource: badgeImages.hacker
  },
  { 
    key: 'tita', 
    name: 'Titã', 
    days: 80, 
    category: 'Divisão Lendária',
    imageSource: badgeImages.tita
  },
  { 
    key: 'lobo_lolitário', 
    name: 'Lobo Solitário', 
    days: 90, 
    category: 'Divisão Lendária',
    imageSource: badgeImages.imbativel
  },


  { 
    key: 'sigma_boy', 
    name: 'Sigma Boy', 
    days: 120, 
    category: 'Divisão Sigma',
    imageSource: badgeImages.sigma
  },
  { 
    key: 'sigma', 
    name: 'Sigma', 
    days: 150, 
    category: 'Divisão Sigma',
    imageSource: badgeImages.sigma_boy
  },
  { 
    key: 'Alpha', 
    name: 'Alpha', 
    days: 180, 
    category: 'Divisão Sigma',
    imageSource: badgeImages.Super_sigma
  },

  
  { 
    key: 'chad', 
    name: 'Chad', 
    days: 240, 
    category: 'Divisão Chad',
    imageSource: badgeImages.chad
  },
  { 
    key: 'super_chad', 
    name: 'Super Chad', 
    days: 300, 
    category: 'Divisão Chad',
    imageSource: badgeImages.super_chad
  },
  { 
    key: 'giga_chad', 
    name: 'Giga Chad', 
    days: 365, 
    category: 'Divisão Chad',
    imageSource: badgeImages.giga_chad
  },

  
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
  'Divisão Resistência',
  'Divisão Guerreiro',
  'Divisão Prime',
  'Divisão Lendária',
  'Divisão Sigma',
  'Divisão Chad',
  'Divisão Imortal'
] as const;