import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
        miniflare: {
          compatibilityDate: '2026-04-22',
          compatibilityFlags: ['nodejs_compat'],
          kvNamespaces: ['SOCKEYES_COMMENTS'],
          bindings: {
            CF_ACCESS_TEAM: 'sbjaques.cloudflareaccess.com',
            CF_ACCESS_AUD: 'test-audience',
            ADMIN_EMAIL: 'admin@example.com',
            NOTIFY_EMAIL: 'notify@example.com',
            RESEND_API_KEY: 'test-key',
          },
        },
      },
    },
  },
});
