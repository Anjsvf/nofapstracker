export const formatTime = (date: Date) => {
  return date.toLocaleTimeString('pt-BR', {
     weekday: 'long',     
    day: '2-digit',      
    month: 'long',      
    year: 'numeric',     
    hour: '2-digit',      
    minute: '2-digit', 
     hour12: true      

  });
};

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
