import type {Config} from 'jest';
import common from './jest.config';

const config: Config = {
  ...common,
  testMatch: ['**/*.test.ts']
};

export default config;
