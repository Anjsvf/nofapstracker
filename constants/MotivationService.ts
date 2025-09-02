export class MotivationService {
  static getMotivationMessage(streak: number): string {
    if (streak === 0) return "Hora de começar! ";
    if (streak === 1) return "Primeiro passo dado! ";
    if (streak === 2) return "Dois dias! A constância começa!";
    if (streak === 3) return "Três dias de disciplina! ";
    if (streak === 4) return "Quatro dias, está criando força!";
    if (streak === 5) return "Cinco dias, parabéns! ";
    if (streak === 6) return "Seis dias, quase uma semana!";
    if (streak === 7) return "Uma semana completa! ";

    if (streak < 15) return `${streak} dias! Mantendo firmeza!`;
    if (streak === 15) return "15 dias! Meio mês de vitória! ";
    if (streak < 30) return `${streak} dias! Continue disciplinado!`;
    if (streak === 30) return "30 dias! Um marco incrível!";

    if (streak < 50) return `${streak} dias! Você está se transformando!`;
    if (streak === 50) return "50 dias! Uma conquista gigante! ";

    if (streak < 75) return `${streak} dias! O hábito está sólido!`;
    if (streak === 75) return "75 dias! 1/4 de ano!";

    if (streak < 100) return `${streak} dias! Inspiração total! `;
    if (streak === 100) return "100 dias! Três dígitos de vitória!";

    if (streak < 150) return `${streak} dias! Nada pode te parar! `;
    if (streak === 150) return "150 dias! Meio caminho para 1 ano! ";

    if (streak < 200) return `${streak} dias! Força impressionante! `;
    if (streak === 200) return "200 dias! Uma muralha de disciplina!";

    if (streak < 250) return `${streak} dias! Seu foco é inabalável!`;
    if (streak === 250) return "250 dias! Uma marca lendária!";

    if (streak < 300) return `${streak} dias! Superando limites! `;
    if (streak === 300) return "300 dias! Três centenas gloriosas! ";

    if (streak < 365) return `${streak} dias! O ano já é quase seu! `;
    if (streak === 365) return "365 dias! UM ANO COMPLETO!";
    if (streak === 366) return "366 dias 😲😲";

    return `${streak} dias! Uma jornada sem limites!`;
  }

  static getRandomMotivationalQuote(): string {
    const quotes = [
      "A disciplina é a ponte entre objetivos e conquistas.",
      "Cada dia é uma nova oportunidade de crescer.",
      "A força não vem da capacidade física, vem da vontade invencível.",
      "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
      "Você é mais forte do que imagina.",
      "A jornada de mil milhas começa com um único passo.",
      "Transforme seus obstáculos em oportunidades.",
      "O foco é a chave para desbloquear seu potencial.",
    ];
    
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  static getMilestoneMessage(streak: number): boolean {
    const milestones = [1, 7, 15, 30, 50, 75, 100, 150, 200, 250, 300, 365];
    return milestones.includes(streak);
  }
}