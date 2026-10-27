import * as migration_20260929_035053_initial from './20260929_035053_initial';
import * as migration_20260929_035100_seed_saddlebrook_tenant from './20260929_035100_seed_saddlebrook_tenant';

export const migrations = [
  {
    up: migration_20260929_035053_initial.up,
    down: migration_20260929_035053_initial.down,
    name: '20260929_035053_initial',
  },
  {
    up: migration_20260929_035100_seed_saddlebrook_tenant.up,
    down: migration_20260929_035100_seed_saddlebrook_tenant.down,
    name: '20260929_035100_seed_saddlebrook_tenant',
  },
];
