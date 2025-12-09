// Confetti animation utility
import confetti from 'canvas-confetti';

/**
 * Trigger confetti animation
 * Non-blocking, auto-cleanup after 3 seconds
 */
export const triggerConfetti = () => {
  // Fire confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'],
  });

  // Auto-cleanup after 3 seconds
  setTimeout(() => {
    confetti.reset();
  }, 3000);
};

/**
 * Trigger multiple confetti bursts for extra celebration
 */
export const triggerCelebration = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      confetti.reset();
      return;
    }

    confetti({
      particleCount: 50,
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
};
