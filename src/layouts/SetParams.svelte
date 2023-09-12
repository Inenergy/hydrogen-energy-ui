<script>
  import { data, getValue } from '../stores';
  import RangeInput from '../molecules/RangeInput';
  import Button from '../atoms/Button';
  import { CONSTRAINTS, COMMANDS } from '../constants';
  import { __ } from '../utils/translations';
  import { ipcRenderer } from 'electron';
  export let onNext;

  const columns = [{ pos: 1 }, { pos: 2 }];

  const initialData = getValue(data);

  function setFanPower(v, fc) {
    ipcRenderer.send('serialCommand', COMMANDS['setFanPower' + fc](v));
  }

  function setBlowPeriod(v, fc) {
    ipcRenderer.send('serialCommand', COMMANDS['setBlowPeriod' + fc](v));
  }

  function setBlowDuration(v, fc) {
    ipcRenderer.send('serialCommand', COMMANDS['setBlowDuration' + fc](v));
  }
</script>

<div class="layout">
  <header>{$__('set params')}</header>
  <main>
    {#each columns as { pos }}
      <div class="col">
        <h2>{$__('fuel cell')} {pos}</h2>
        <img
          src="../static/icons/fuelCell.svg"
          alt="fuelCell"
          class="fc-icon" />
        <figure>
          <img src="../static/icons/fan.svg" alt="fan" />
          <figcaption>{$__('fan')}</figcaption>
        </figure>
        <div class="input-field">
          <div class="label">{$__('fan power')}, {$__('percent')}</div>
          <RangeInput
            name={pos}
            onChange={setFanPower}
            range={CONSTRAINTS.fanPower}
            defaultValue={initialData['fanPower' + pos].value} />
        </div>
        <figure>
          <img src="../static/icons/valve.svg" alt="valve" />
          <figcaption>{$__('blow valve')}</figcaption>
        </figure>
        <div class="input-field">
          <div class="label">{$__('blow period')}, {$__('s', true)}</div>
          <RangeInput
            name={pos}
            onChange={setBlowPeriod}
            range={CONSTRAINTS.blowPeriod}
            defaultValue={initialData['blowPeriod' + pos].value} />
          <div class="label">{$__('blow duration')}, {$__('ms', true)}</div>
          <RangeInput
            name={pos}
            onChange={setBlowDuration}
            range={CONSTRAINTS.blowDuration}
            defaultValue={initialData['blowDuration' + pos].value} />
        </div>
      </div>
    {/each}
  </main>
  <footer>
    <Button on:click={onNext}>{$__('go to research')}</Button>
  </footer>
</div>

<style>
  main {
    display: flex;
    justify-content: space-evenly;
  }
  .col {
    max-width: 40rem;
    flex: 1 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
  .fc-icon {
    height: 10rem;
    display: block;
    margin: 0 auto;
    grid-column: span 3;
  }
  h2 {
    text-align: center;
    grid-column: span 3;
  }
  figure {
    grid-column: 1 / 2;
    text-align: center;
    margin: 0;
  }
  figure img {
    height: 7.2rem;
  }
  .input-field {
    grid-column: span 2;
  }
  .label {
    white-space: nowrap;
  }
  footer {
    justify-content: center;
  }
</style>
