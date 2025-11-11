 export const getShift = (hour: number): { name: string; emoji: string; color: string } => {
    if (hour >= 5 && hour < 12)
      return { name: 'Manhã', emoji: '☀️', color: '#facc15' };
    if (hour >= 12 && hour < 18)
      return { name: 'Tarde', emoji: '🌤️', color: '#fb923c' };
    if (hour >= 18 && hour < 24)
      return { name: 'Noite', emoji: '🌙', color: '#3b82f6' };
    return { name: 'Madrugada', emoji: '🌌', color: '#8b5cf6' };
  };