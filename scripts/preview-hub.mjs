import { loadEnvFile } from 'node:process';
loadEnvFile('.env');
process.argv=[process.execPath,'next','dev','--port','3012'];
await import('../node_modules/next/dist/bin/next');
