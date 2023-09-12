<script>
  import Button from '../atoms/Button';
  import Select from '../molecules/Select';
  import Toggle from '../atoms/Toggle';
  import RangeInput from '../molecules/RangeInput';
  import { data } from '../stores';
  import ResetButton from '../molecules/ResetButton';
  import { COMMANDS, CONSTRAINTS } from '../constants';
  import { __ } from '../utils/translations';
  import { ipcRenderer } from 'electron';
  export let onPrev;
  export let onNext;

  const initialData = $data;

  let isActive = initialData.onoff;

  const valves = [initialData.valve1, initialData.valve2];

  const characteristics = [
    'voltage',
    'current',
    'power',
    'temp1',
    'temp2',
    'consumption',
  ];

  const FCColumns = [
    {
      pos: 1,
      characteristics,
    },
    {
      pos: 2,
      characteristics,
    },
  ];

  const commonCharacteristics = [
    'pressure',
    'tankTemp',
    'consumptionCommon',
    'powerCommon',
    'voltageCommon',
    'currentCommon',
    'currentInternal',
    'currentExternal',
  ];

  const connectionTypeOptions = [
    { name: 'Series', label: 'series', value: 0 },
    { name: 'Parallel', label: 'parallel', value: 1 },
    { name: 'Single', label: 'only first', value: 2 },
    { name: 'Single', label: 'only second', value: 3 },
  ];
  const loadModeOptions = [
    { label: 'internal load disabled', value: 0 },
    {
      label: 'constant voltage',
      name: 'voltage',
      value: 1,
      symbol: `U, ${'V'}`,
    },
    {
      label: 'constant current',
      name: 'current',
      value: 2,
      symbol: 'I, A',
    },
    {
      label: 'constant power',
      name: 'power',
      value: 3,
      symbol: `P, ${'W'}`,
    },
  ];

  let selectedLoadMode = loadModeOptions[$data.loadMode],
    loadValue = $data.loadValue.value,
    selectedConnectionType = connectionTypeOptions[$data.connectionType];

  function setConnectionType(t) {
    selectedConnectionType = connectionTypeOptions[t];
    if (t == 2) valves[1] = 0;
    if (t == 3) valves[0] = 0;
    resetLoadMode();
    ipcRenderer.send('serialCommand', COMMANDS.switchConnectionType(+t));
  }
  function setLoadMode(m) {
    selectedLoadMode = loadModeOptions[m];
    ipcRenderer.send('serialCommand', COMMANDS.switchLoadMode(+m));
    resetLoadValue();
  }
  function setLoadValue(v) {
    ipcRenderer.send('serialCommand', COMMANDS.setValue(+v));
  }
  function toggleFC(e) {
    const { name, checked } = e.target;
    valves[name - 1] = checked;
    ipcRenderer.send(
      'serialCommand',
      COMMANDS[(checked ? 'open' : 'close') + 'Valve' + name]
    );
  }
  function toggleAll() {
    isActive = !isActive;
    valves[0] = false;
    valves[1] = false;
    ipcRenderer.send('serialCommand', COMMANDS[isActive ? 'start' : 'stop']);
  }
  function resetLoadMode() {
    selectedLoadMode = loadModeOptions[0];
    ipcRenderer.send('serialCommand', COMMANDS.switchLoadMode(0));
  }
  function resetLoadValue() {
    if (selectedLoadMode.value === 1) {
      loadValue = CONSTRAINTS['voltage' + selectedConnectionType.name][1];
    } else {
      loadValue =
        CONSTRAINTS[selectedLoadMode.name + selectedConnectionType.name][0];
    }
    ipcRenderer.send('serialCommand', COMMANDS.setValue(loadValue));
  }
</script>

<div class="layout">
  <header>{$__('fuel cell research')}</header>
  <main>
    <div class="row first">
      <div class="select-field col">
        <div class="label">{$__('connection type')}</div>
        <Select
          onChange={setConnectionType}
          options={connectionTypeOptions}
          selected={selectedConnectionType} />
      </div>
      <div class="select-field col">
        <div class="label">{$__('load mode')}</div>
        <Select
          onChange={setLoadMode}
          options={loadModeOptions}
          selected={selectedLoadMode} />
      </div>
      <div class="load-mode col">
        {#if selectedLoadMode.value}
          <span class="label">{$__('set ' + selectedLoadMode.name)}</span>
          <RangeInput
            step={0.1}
            onChange={setLoadValue}
            defaultValue={loadValue}
            range={CONSTRAINTS[selectedLoadMode.name + selectedConnectionType.name]} />
        {/if}
      </div>
    </div>
    <div class="row">
      {#each FCColumns as { pos }}
        <div class="col o-{pos}">
          <h3>{$__('fuel cell')} {pos}</h3>
          <img src="../static/icons/valve.svg" alt="valve" class="icon-valve" />
          <div class="fc-toggler">
            <div class="label">
              {@html $__('H2 valve')}
            </div>
            <Toggle
              on:change={toggleFC}
              name={pos}
              disabled={!isActive || Math.abs(selectedConnectionType.value - 3) === pos - 1}
              checked={valves[pos - 1]} />
          </div>
        </div>
      {/each}
      <div class="col onoff">
        <Button on:click={toggleAll} class="start">
          {isActive ? $__('stop') : $__('start')}
        </Button>
      </div>
    </div>
    <h2>{$__('characteristics')}</h2>
    <div class="row">
      {#each FCColumns as { pos, characteristics }}
        <div class="col o-{pos}">
          <h4>{$__('fuel cell')} {pos}</h4>
          <ul class="single">
            {#each characteristics as characteristic}
              <li>
                <span class="label">
                  {@html $__(initialData[characteristic + pos].symbol)}
                  , {$__(initialData[characteristic + pos].units, true)}
                </span>
                <strong class="value">
                  {#if characteristic == 'current' && $data[characteristic + pos].value < 0.04}
                    &lt; 0.04
                  {:else}{$data[characteristic + pos].value}{/if}
                </strong>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
      <div class="col">
        <h4>{$__('common')}</h4>
        <ul class="common">
          {#each commonCharacteristics as characteristic}
            <li>
              <span class="label">
                {@html $__(initialData[characteristic].symbol)}
                , {$__(initialData[characteristic].units, true)}
              </span>
              <strong class="value">
                {#if characteristic.startsWith('current') && $data[characteristic].value < 0.04}
                  &lt; 0.04
                {:else}{$data[characteristic].value}{/if}
              </strong>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </main>
  <footer class="row">
    <div class="col">
      <Button on:click={onPrev}>{$__('back')}</Button>
    </div>
    <div class="col">
      <Button on:click={onNext}>{$__('charts')}</Button>
    </div>
    <div class="col" />
  </footer>
  <ResetButton />
</div>

<style>
  .label {
    white-space: nowrap;
  }
  .row {
    display: flex;
    justify-content: space-evenly;
  }
  .row.first {
    height: 7rem;
  }
  .col {
    flex: 1 1 27rem;
    max-width: 27rem;
  }
  .col.o-2 {
    order: 2;
  }
  ul {
    margin: 0 auto;
    padding: 0;
    list-style: none;
    width: 18rem;
  }
  li {
    white-space: nowrap;
  }
  span.label {
    display: inline-block;
    width: 11rem;
  }
  .onoff {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon-valve {
    height: 6.4rem;
    display: inline-block;
    vertical-align: middle;
  }
  .fc-toggler {
    display: inline-block;
    vertical-align: middle;
  }
  footer {
    padding: 0;
  }
  footer .col:nth-child(2) {
    text-align: center;
  }
</style>
