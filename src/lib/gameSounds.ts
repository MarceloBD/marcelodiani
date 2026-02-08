let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new AudioContext();
    } catch {
      return null;
    }
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

export function initializeGameAudio(): void {
  const context = getAudioContext();
  if (context?.state === "suspended") {
    context.resume();
  }
}

export function playJumpSound(): void {
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(400, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.15, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.15);
}

export function playCoinSound(): void {
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, context.currentTime);
  oscillator.frequency.setValueAtTime(1320, context.currentTime + 0.05);

  gainNode.gain.setValueAtTime(0.12, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.12);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.12);
}

export function playDeathSound(): void {
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(440, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(80, context.currentTime + 0.5);

  gainNode.gain.setValueAtTime(0.2, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.5);
}
