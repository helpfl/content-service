import type {Config} from 'jest';
import common from './jest.config';

const config: Config = {
  ...common,
  testMatch: ['**/*.e2e.ts']
};

export default config;
