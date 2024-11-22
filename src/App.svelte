<script>
  import { onMount } from "svelte";

  let bpm = 100;
  let beat = 0;
  const beatsPerMeasure = 4;
  const numberOfMeasures = 4;
  let isPlaying = false;
  // @ts-ignore
  let sequencer;
  // @ts-ignore
  let loadedSounds = [];

  const scaleOfNotes = ["C4", "D4", "Eb4", "F4"];
  let instruments = [
    Array.from({ length: beatsPerMeasure * numberOfMeasures }, () => ({ note: scaleOfNotes[3], active: false })),
    Array.from({ length: beatsPerMeasure * numberOfMeasures }, () => ({ note: scaleOfNotes[2], active: false })),
    Array.from({ length: beatsPerMeasure * numberOfMeasures }, () => ({ note: scaleOfNotes[1], active: false })),
    Array.from({ length: beatsPerMeasure * numberOfMeasures }, () => ({ note: scaleOfNotes[0], active: false })),
  ];

  // @ts-ignore
  let playbackInterval;

  // Load WASM and sounds on mount
  onMount(async () => {
    // @ts-ignore
    const wasmModule = await import("$lib/pkg/poetisa_audio_engine.js");
    const { default: init, Sequencer } = wasmModule;

    // Initialize WASM
    await init("/pkg/poetisa_audio_engine_bg.wasm");
    sequencer = new Sequencer(bpm);

    // Load sound files
    const soundFiles = ["sound1.ogg", "sound2.ogg", "sound3.ogg", "sound4.ogg"];
    for (let file of soundFiles) {
      const response = await fetch(file);
      const buffer = await response.arrayBuffer();
      const index = await sequencer.load_sound(new Uint8Array(buffer));
      loadedSounds.push(index);
    }
  });

  // @ts-ignore
  const handleNoteClick = (instIndex, noteIndex) => {
    instruments[instIndex][noteIndex].active = !instruments[instIndex][noteIndex].active;
  };

  const startPlayback = () => {
    // @ts-ignore
    if (!sequencer) return;

    sequencer.start();
    isPlaying = true;

    playbackInterval = setInterval(() => {
      instruments.forEach((instrument, index) => {
        if (instrument[beat].active) {
          // @ts-ignore
          sequencer.play_step(loadedSounds[index]);
        }
      });
      beat = (beat + 1) % (beatsPerMeasure * numberOfMeasures);
    }, (60000 / bpm) / beatsPerMeasure);
  };

  const stopPlayback = () => {
    // @ts-ignore
    if (!sequencer) return;

    sequencer.stop();
    isPlaying = false;
    // @ts-ignore
    clearInterval(playbackInterval);
  };

 // @ts-ignore
   $: if (sequencer && isPlaying) {
    sequencer.clock_speed = bpm;
  };

  const handlePlayClick = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };
</script>

<div class="bpm-controls">
  <label for="bpm">{bpm} BPM</label>
  <input type="range" id="bpm" min="50" max="240" bind:value={bpm} />
  <button on:click={handlePlayClick}>{isPlaying ? "Stop" : "Play"}</button>
</div>

<div class="sequencer">
  <div class="sequencer__wrapper">
    {#each Array(numberOfMeasures) as _, measureIndex}
      <div class="sequencer__block">
        {#each Array(instruments.length) as _, instrumentIndex}
          <div class="sequencer__measure">
            {#each Array(beatsPerMeasure) as _, beatIndex}
              <div class="sequencer__beat">
                {#if instrumentIndex === 0}
                  <div class="beat-indicator {(measureIndex * beatsPerMeasure) + beatIndex === beat ? 'live' : ''}"></div>
                {/if}
                <button 
                  on:click={() => handleNoteClick(instrumentIndex, (measureIndex * beatsPerMeasure) + beatIndex)}
                  class="note {instruments[instrumentIndex][(measureIndex * beatsPerMeasure) + beatIndex].active ? 'active' : ''} {beatIndex % 4 === 0 ? 'first-beat-of-the-bar' : ''}">
                </button>
              </div>
            {/each}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  /* Style remains unchanged */
  * {
    box-sizing: border-box;
  }

  .sequencer__wrapper {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    background-color: #98c9fa;
    border-radius: 7px;
    padding: 4px;
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    .sequencer__wrapper {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 767px) {
    .sequencer__wrapper {
      grid-template-columns: 1fr;
    }
  }

  .sequencer__block {
    display: block;
    margin: 5px;
  }

  .sequencer__measure {
    display: flex;
    gap: 5px;
    border-color: #555;
  }

  .sequencer__beat {
    display: block;
  }

  .note {
    background: #ccc;
    width: 70px;
    height: 50px;
    border: 1px solid #ccc;
    border-radius: 7px;
    margin-top: 7px;
  }

  .note.active {
    background: #600889;
    border: 1px solid #600889;
    color: #fff;
  }

  .first-beat-of-the-bar {
    background: #434445;
    border: 1px solid #98c9fa;
  }

  .bpm-controls {
    margin-bottom: 20px;
    text-align: center;
  }

  .bpm-controls label {
    color: #fff;
  }

  .beat-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #555;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 1.5rem;
    margin: 0 auto;
  }

  .live {
    background: #05f18f;
  }
</style>
