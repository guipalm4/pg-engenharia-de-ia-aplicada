import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';
export default defineConfig({
  projectId: '29e2jk',
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'cypress',
    }),
    baseUrl: 'http://localhost:4200',
  },
});
