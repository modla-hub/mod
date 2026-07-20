/**
 * Procedural Audio Synthesizer using Web Audio API
 * Generates beautiful, royalty-free audio tracks based on chosen genres.
 * Provides a real-time AnalyserNode for audio visualization.
 */

let audioCtx: AudioContext | null = null;
let analyserNode: AnalyserNode | null = null;
let isPlaying = false;
let currentGenre = "";
let synthInterval: any = null;
let activeNodes: AudioNode[] = [];

// Chord progressions (root note frequencies)
const CHORDS: Record<string, number[][]> = {
  lofi: [
    [130.81, 196.00, 246.94, 293.66], // Cmaj7
    [146.83, 220.00, 261.63, 329.63], // Dm7
    [164.81, 246.94, 293.66, 349.23], // Em7
    [174.61, 261.63, 329.63, 392.00], // Fmaj7
  ],
  synthwave: [
    [110.00, 165.00, 220.00], // Am
    [130.81, 196.00, 261.63], // C
    [146.83, 220.00, 293.66], // G
    [174.61, 261.63, 349.23], // F
  ],
  cinematic: [
    [73.42, 110.00, 146.83], // Dm
    [87.31, 130.81, 174.61], // F
    [98.00, 146.83, 196.00], // G
    [110.00, 165.00, 220.00], // Am
  ],
  pop: [
    [130.81, 261.63, 329.63, 392.00], // C
    [146.83, 293.66, 349.23, 440.00], // G
    [110.00, 220.00, 261.63, 329.63], // Am
    [174.61, 349.23, 440.00, 523.25], // F
  ]
};

export function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 64;
    analyserNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return { audioCtx, analyserNode };
}

export function startSynthesizer(genre: string) {
  const { audioCtx: ctx, analyserNode: analyser } = initAudio();
  if (!ctx || !analyser) return;

  if (isPlaying) {
    stopSynthesizer();
  }

  isPlaying = true;
  currentGenre = genre.toLowerCase();
  activeNodes = [];

  const chordsList = CHORDS[currentGenre] || CHORDS.lofi;
  let chordIndex = 0;
  let step = 0;

  // Master Gain for volume control
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
  masterGain.connect(analyser);
  activeNodes.push(masterGain);

  const playStep = () => {
    if (!isPlaying) return;
    const now = ctx.currentTime;
    const currentChord = chordsList[chordIndex];

    if (currentGenre === "lofi") {
      // Play a soft rhodes chord every 2 seconds
      if (step % 8 === 0) {
        currentChord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          // Triangle wave for smooth lofi tone
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now);
          
          // Gentle adsr
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.04, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
          
          // Soft bandpass filter to sound retro
          const filter = ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(1000, now);
          filter.Q.setValueAtTime(1.0, now);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);
          
          osc.start(now);
          osc.stop(now + 1.9);
        });

        // Add a tiny woodblock beat
        const percOsc = ctx.createOscillator();
        const percGain = ctx.createGain();
        percOsc.frequency.setValueAtTime(800, now);
        percGain.gain.setValueAtTime(0.015, now);
        percGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        percOsc.connect(percGain);
        percGain.connect(masterGain);
        percOsc.start(now);
        percOsc.stop(now + 0.08);

        chordIndex = (chordIndex + 1) % chordsList.length;
      }
    } 
    else if (currentGenre === "synthwave") {
      // Fast pulsing retro synth bassline (eighth notes)
      const bassNote = currentChord[0] / 2; // Low frequency
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(bassNote, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(600, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.22);

      // Cheerful retro lead pluck on quarter notes
      if (step % 2 === 0) {
        const leadFreq = currentChord[step % currentChord.length] * 2;
        const leadOsc = ctx.createOscillator();
        const leadGain = ctx.createGain();
        
        leadOsc.type = "sawtooth";
        leadOsc.frequency.setValueAtTime(leadFreq, now);

        leadGain.gain.setValueAtTime(0.02, now);
        leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        const leadFilter = ctx.createBiquadFilter();
        leadFilter.type = "peaking";
        leadFilter.frequency.setValueAtTime(1500, now);

        leadOsc.connect(leadFilter);
        leadFilter.connect(leadGain);
        leadGain.connect(masterGain);

        leadOsc.start(now);
        leadOsc.stop(now + 0.42);
      }

      if (step % 8 === 0) {
        chordIndex = (chordIndex + 1) % chordsList.length;
      }
    } 
    else if (currentGenre === "cinematic") {
      // Slow dark brassy drone
      if (step % 16 === 0) {
        // Slow rising sub-bass chord
        currentChord.forEach((freq) => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc1.type = "sawtooth";
          osc1.frequency.setValueAtTime(freq, now);
          
          // Detune second oscillator for thick brassy cinematic sound
          osc2.type = "sawtooth";
          osc2.frequency.setValueAtTime(freq * 1.01, now);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.04, now + 1.0);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

          const lp = ctx.createBiquadFilter();
          lp.type = "lowpass";
          lp.frequency.setValueAtTime(350, now);

          osc1.connect(lp);
          osc2.connect(lp);
          lp.connect(gain);
          gain.connect(masterGain);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 4.0);
          osc2.stop(now + 4.0);
        });

        // Add dynamic string high note wash
        const stringOsc = ctx.createOscillator();
        const stringGain = ctx.createGain();
        stringOsc.type = "sine";
        stringOsc.frequency.setValueAtTime(currentChord[currentChord.length - 1] * 4, now);
        stringGain.gain.setValueAtTime(0, now);
        stringGain.gain.linearRampToValueAtTime(0.015, now + 1.5);
        stringGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.9);
        stringOsc.connect(stringGain);
        stringGain.connect(masterGain);
        stringOsc.start(now);
        stringOsc.stop(now + 4.0);

        chordIndex = (chordIndex + 1) % chordsList.length;
      }
    } 
    else {
      // Pop: Rhythmic bright progression
      if (step % 4 === 0) {
        currentChord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);
          
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.03, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

          osc.connect(gain);
          gain.connect(masterGain);
          
          osc.start(now);
          osc.stop(now + 1.0);
        });

        // Add bright hi-hat accent
        const noiseOsc = ctx.createOscillator();
        const noiseGain = ctx.createGain();
        noiseOsc.frequency.setValueAtTime(10000, now);
        noiseGain.gain.setValueAtTime(0.005, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.05);
        noiseOsc.connect(noiseGain);
        noiseGain.connect(masterGain);
        noiseOsc.start(now);
        noiseOsc.stop(now + 0.06);
      }

      if (step % 8 === 0) {
        chordIndex = (chordIndex + 1) % chordsList.length;
      }
    }

    step++;
  };

  // Run synthesizer clock at 120BPM (8th notes = 0.25s interval)
  synthInterval = setInterval(playStep, 250);
}

export function stopSynthesizer() {
  isPlaying = false;
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }
  // Stop all active node releases
  activeNodes.forEach((node) => {
    try {
      node.disconnect();
    } catch (e) {}
  });
  activeNodes = [];
}

export function getAudioStream() {
  if (audioCtx && analyserNode) {
    return (audioCtx as any).destination.stream || null;
  }
  return null;
}

export function getAudioContext() {
  return audioCtx;
}

export function getAnalyserNode() {
  return analyserNode;
}
