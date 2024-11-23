declare module '$lib/pkg/poetisa_audio_engine.js' {
    export default function initModule(path: string): Promise<any>;
    export class Sequencer {
      constructor(bpm: number);
      load_sound(buffer: Uint8Array): number;
      set_step_callback(callback?: Function): void;
      start(): void;
      stop(): void;
      play_step(soundIndex: number): void;
      get_current_step(): number;
    }
  }
  