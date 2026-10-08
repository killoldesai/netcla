# AI provider credentials

In Admin → Settings, select AWS Bedrock or OpenRouter, enter credentials and save. AWS requires a region, access key ID and secret access key. An optional session token supports temporary AWS credentials, which must be replaced when they expire. OpenRouter requires its API key.

Then load available models, select or enter a model ID, test it, and save the content-generation default. Credentials are encrypted in Neon using AES-256-GCM and are never returned by admin GET responses. Replacing credentials invalidates the prior model test. Web requests and background jobs read the current saved credentials without a restart. The default model and credentials are separate settings.

Content generation runs through the worker (`npm run worker` locally). The editor and Generation view poll every three seconds while jobs are active. The progress bar represents preparation, writing, validation and saving milestones, not a time estimate. A missing worker heartbeat and retry/failure errors appear visibly. Completed output is saved as an immutable draft revision and loaded into the open editor when there are no unsaved edits. If you edited during generation, those edits remain and the generated revision is available in History. Publishing remains an explicit owner action.

The web and worker services must share `PROVIDER_ENCRYPTION_KEY`, a server-only random 32-byte key encoded as 64 hexadecimal characters. A local key has been created in `.env`; preserve it and configure the same key in Coolify for both services. AWS and OpenRouter credentials are no longer read from environment variables. Existing environment credentials are not imported automatically.

Generate a key for a new deployment with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Preserve the existing key when redeploying. Changing or losing it makes saved credentials unreadable; re-enter provider credentials if recovery is impossible. Keep this key separate from database backups. Full database backups contain encrypted credential settings; content-only SQL exports do not contain credentials.

Use HTTPS for production admin access. Credential updates require an authenticated owner and the existing same-origin check; audit events record the action only, without secret values. Use an AWS identity permitted to invoke the selected Bedrock models and, for catalog listing, list foundation models and inference profiles.
