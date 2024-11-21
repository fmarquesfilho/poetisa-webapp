<script>
  import * as Tone from "tone";

  let bpm = 100;
  let beat = 0;
  const beatsPerMeasure = 4;
  const numberOfMeasures = 4;
  let isPlaying = false;

  const synths = [
    new Tone.Synth().toDestination(),
    new Tone.Synth().toDestination(),
    new Tone.Synth().toDestination(),
    new Tone.Synth().toDestination(),
  ];

  const scaleOfNotes = ["C4", "D4", "Eb4", "F4"];

  let instruments = [
    Array.from({ length: beatsPerMeasure*numberOfMeasures }, (_, i) => ({ note: scaleOfNotes[3], active: false })),
    Array.from({ length: beatsPerMeasure*numberOfMeasures }, (_, i) => ({ note: scaleOfNotes[2], active: false })),
    Array.from({ length: beatsPerMeasure*numberOfMeasures }, (_, i) => ({ note: scaleOfNotes[1], active: false })),
    Array.from({ length: beatsPerMeasure*numberOfMeasures }, (_, i) => ({ note: scaleOfNotes[0], active: false })),
  ];

  Tone.Transport.scheduleRepeat((time) => {
    instruments.forEach((instrument, index) => {
      let synth = synths[index];
      let note = instrument[beat];
      if (note.active) synth.triggerAttackRelease(note.note, "16n", time);
    });
    beat = (beat + 1) % 16;
  }, "16n");

  // @ts-ignore
  const handleNoteClick = (instIndex, noteIndex) => {
    instruments[instIndex][noteIndex].active = !instruments[instIndex][noteIndex].active;
  };

  const handlePlayClick = () => {
    if (!isPlaying) Tone.start();
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.start();
    isPlaying = true;
  };

  const handleStopClick = () => {
    Tone.Transport.stop();
    isPlaying = false;
  };

 // @ts-ignore
   $: if (isPlaying) {
    Tone.Transport.bpm.value = bpm;
  }
</script>

<div class="bpm-controls">
  <label for="bpm">{bpm} BPM</label>
  <input type="range" id="bpm" min="50" max="240" bind:value={bpm} />
  {#if isPlaying}
    <button on:click={handleStopClick}>Stop</button>
  {:else}
    <button on:click={handlePlayClick}>Play</button>
  {/if}
</div>

<div class="sequencer">
  <div class="sequencer sequencer__wrapper">
    {#each Array(numberOfMeasures) as _, measureIndex}
    <div class="sequencer sequencer__block">
      {#each Array(instruments.length) as _, instrumentIndex}
      <div class="sequencer sequencer__measure">
          {#each Array(beatsPerMeasure) as _, beatIndex}
          <div class="sequencer sequencer__beat">
            {#if instrumentIndex === 0}
              <div class="beat-indicator {(measureIndex*beatsPerMeasure)+beatIndex === beat ? 'live' : ''}"></div>
            {/if}
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button 
              on:click={() => handleNoteClick(instrumentIndex, (measureIndex*beatsPerMeasure)+beatIndex)}
              class="note {instruments[instrumentIndex][(measureIndex*beatsPerMeasure)+beatIndex].active ? 'active' : ''} {beatIndex % 4 === 0 ? 'first-beat-of-the-bar' : ''}">
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

