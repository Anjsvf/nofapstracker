
export const getCurrentLocalDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export const formatDisplayDate = (dateString: string): string => {
  
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};


export const formatDisplayTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};