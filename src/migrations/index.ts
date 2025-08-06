import * as migration_20250806_151530 from './20250806_151530';

export const migrations = [
  {
    up: migration_20250806_151530.up,
    down: migration_20250806_151530.down,
    name: '20250806_151530'
  },
];
