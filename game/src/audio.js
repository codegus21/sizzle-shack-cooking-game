// Sizzle Shack — tiny WebAudio synth, no sound files.
// Every sound is a few oscillators; the game ships no audio assets.

let actx = null;

function ctx() {
  if (!actx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      actx = new AC();
    } catch (e) {
      actx = null;
    }
  }
  if (actx && actx.state === 'suspended') actx.resume();
  return actx;
}

function tone(freq, dur, type = 'sine', vol = 0.12, when = 0, slideTo = null) {
  const ac = ctx();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ac.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

export const sfx = {
  pickup() { tone(520, 0.07, 'square', 0.06); },
  place() { tone(340, 0.08, 'square', 0.06); },
  chop() { tone(180, 0.05, 'square', 0.09); tone(120, 0.05, 'square', 0.07, 0.05); },
  sizzle() { tone(900, 0.35, 'sawtooth', 0.03, 0, 500); },
  ding() { tone(880, 0.12, 'sine', 0.12); tone(1320, 0.18, 'sine', 0.1, 0.1); },
  serve() { tone(660, 0.1, 'sine', 0.12); tone(880, 0.1, 'sine', 0.12, 0.09); tone(1320, 0.22, 'sine', 0.12, 0.18); },
  wrong() { tone(220, 0.18, 'sawtooth', 0.08, 0, 140); },
  expired() { tone(330, 0.15, 'square', 0.08); tone(220, 0.25, 'square', 0.08, 0.12); },
  newOrder() { tone(587, 0.09, 'sine', 0.1); tone(740, 0.12, 'sine', 0.1, 0.08); },
  tick() { tone(1000, 0.04, 'square', 0.05); },
  pour() { tone(300, 0.3, 'sine', 0.05, 0, 520); },
  start() { tone(523, 0.1, 'sine', 0.12); tone(659, 0.1, 'sine', 0.12, 0.09); tone(784, 0.2, 'sine', 0.12, 0.18); },
  end() { tone(784, 0.12, 'sine', 0.12); tone(659, 0.12, 'sine', 0.12, 0.11); tone(523, 0.3, 'sine', 0.12, 0.22); },
};
