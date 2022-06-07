const { mergeRename } = require('./utils/others');
const path = require('path');

const IS_RPI = process.platform === 'linux' && process.arch == 'arm';
const PORT = {
  name: IS_RPI ? '/dev/serial0' : 'COM5',
  baudRate: 230400,
};
const SEPARATORS = Buffer.alloc(4);
SEPARATORS.writeUInt16BE(6891);
SEPARATORS.writeUInt16BE(25500, 2);

const STATES = {
  initial: 'params',
  charts: 'charts',
  research: 'research',
};

const LOW_PRESSURE = 0.2;

const SINGLE_DATA = {
  voltage: {
    symbol: 'U',
    units: 'V',
    divider: 1000,
  },
  current: {
    symbol: 'I',
    units: 'A',
    divider: 1000,
  },
  temp1: {
    symbol: 'T<sub>1</sub>',
    units: '\u02daC',
    divider: 10,
  },
  temp2: {
    symbol: 'T<sub>2</sub>',
    units: '\u02daC',
    divider: 10,
  },
  blowDuration: {
    label: 'blow duration',
    units: 'ms',
  },
  blowPeriod: {
    label: 'blod period',
    units: 's',
  },
  fanPower: {
    label: 'fan power',
    units: 'percent',
  },
};

const COMMON_DATA = {
  tankTemp: {
    symbol: 'T<sub>H<sub>2</sub></sub>',
    units: '\u02daC',
    divider: 10,
  },
  currentExternal: {
    symbol: `external load current`,
    units: 'A',
    divider: 1000,
  },
  currentInternal: {
    symbol: `internal load current`,
    units: 'A',
    divider: 1000,
  },
  loadValue: {
    divider: 1000,
  },
  consumption1: {
    symbol: 'Q',
    units: 'ml/min',
  },
  consumption2: {
    symbol: 'Q',
    units: 'ml/min',
  },
  pressure: {
    symbol: 'p',
    units: 'bar',
    divider: 1000,
  },
};

const STATE_DATA = {
  loadMode: 0,
  hydrogenConcentration: 0,
  valve1: 0,
  valve2: 0,
  onoff: 0,
  connectionType: 0,
};

const BOTH_DATA = mergeRename([SINGLE_DATA, SINGLE_DATA], [1, 2]);

const FC_DATA = {
  ...BOTH_DATA,
  ...COMMON_DATA,
};

const COMMANDS = [
  'closeValve1',
  'openValve1',
  'closeValve2',
  'openValve2',
  'start',
  'stop',
].reduce(
  (a, c, i) => {
    a[c] = [(i + 1) * 4, 0];
    return a;
  },
  {
    switchConnectionType: (m) => [28, m],
    switchLoadMode: (m) => [32, m],
    setValue: (v) => [36, 10 * v],
    setBlowDuration1: (v) => [40, v],
    setBlowPeriod1: (v) => [44, v],
    setFanPower1: (v) => [48, v],
    setBlowDuration2: (v) => [52, v],
    setBlowPeriod2: (v) => [56, v],
    setFanPower2: (v) => [60, v],
    startCalibration: 64,
  }
);

const CONSTRAINTS = {
  currentSeries: [0.1, 5],
  currentSingle: [0.1, 5],
  currentParallel: [0.1, 5],
  voltageSeries: [14, 24],
  voltageSingle: [7, 14],
  voltageParallel: [7, 14],
  powerSingle: [1, 25],
  powerParallel: [1, 25],
  powerSeries: [1, 25],
  fanPower: [40, 100],
  blowDuration: [20, 250],
  blowPeriod: [1, 100],
};

const CONNECTION_TYPES = [
  'series',
  'parallel',
  'only first',
  'only second',
  'not selected',
];

const SETTINGS_PATH = IS_RPI
  ? '/home/pi/.inenergy/config.json'
  : path.join(__dirname, '..', 'config.json');

module.exports = {
  IS_RPI,
  PORT,
  SEPARATORS,
  STATES,
  LOW_PRESSURE,
  FC_DATA,
  COMMON_DATA,
  STATE_DATA,
  CONSTRAINTS,
  COMMANDS,
  CONNECTION_TYPES,
  SETTINGS_PATH,
};
