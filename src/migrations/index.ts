import * as migration_20250806_211029 from './20250806_211029';

export const migrations = [
  {
    up: migration_20250806_211029.up,
    down: migration_20250806_211029.down,
    name: '20250806_211029'
  },
];
