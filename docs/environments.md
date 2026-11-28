# Environments

RaahPrahari has four isolated environments. Each environment must use its own
Supabase project, public client config, and server secrets. Never point two
environments at the same project or reuse credentials between them.

| Environment | `APP_ENV` / `VITE_APP_ENV` | Purpose                              | Data and boundary                                                                                                                                           |
| ----------- | -------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Development | `development`              | Local implementation and testing     | Dedicated development project; test/synthetic data only.                                                                                                    |
| Demo        | `demo`                     | Judges, partners, and demonstrations | Separate demo project; synthetic data and isolated demo identities only.                                                                                    |
| Pilot       | `pilot`                    | Authorized partner trial             | Separate pilot project. Inactive until partner authorization, staffed review, legal/privacy review, and release approval; real data only after those gates. |
| Production  | `production`               | Vercel deployment for real users     | Dedicated production Supabase project and production-scoped Vercel variables. Never reuse development or demo credentials.                                  |

These are operational boundaries, not claims that separate remote projects
have been provisioned. The pilot is preparation-only until its activation
gates are met. Development and demo are classified as synthetic; pilot and
production are not.

## Rules

1. Keep development, demo, pilot, and production Supabase projects, keys, and
   secrets separate.
2. Demo uses synthetic data and isolated identities only; never load real
   reports or accounts into it.
3. Keep pilot inactive until its approval gates are satisfied.
4. `VITE_` variables are public: Vite can include them in browser bundles.
   Only non-secret values belong there (for example `VITE_APP_ENV`, the
   Supabase URL, and the anon/publishable key).
5. `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `sb_secret_` keys are
   server-only. Do not put them in a `VITE_` variable or frontend source.
6. Only blank environment templates are committed. Real `.env` files remain
   ignored.
7. In connected mode, authorization comes from the backend; never grant or
   switch roles on the client.

## Banner

`EnvBanner` is rendered once in `src/routes/__root.tsx`, below the site header.

- development: no banner
- demo: synthetic-data warning
- pilot: no banner
- production: no banner

## Frontend variables

Template: `.env.example`. Copy it to `.env.local` (or `.env.demo.local` /
`.env.pilot.local` for the other modes) and fill in the values. `.env.local`
and other real environment files are ignored by Git.

| Variable                 | Meaning                                                |
| ------------------------ | ------------------------------------------------------ |
| `VITE_APP_ENV`           | `development`, `demo`, `pilot` or `production`         |
| `VITE_SUPABASE_URL`      | Project URL                                            |
| `VITE_SUPABASE_ANON_KEY` | Anon JWT or publishable key (public, protected by RLS) |

`src/config/env.ts` validates the frontend config at runtime. The Vite config
also checks the active mode's environment before starting the dev server or
building: it rejects secret-like `VITE_` variable names and values that look
like Supabase service-role/secret keys. Errors name variables, never values.
This is a guardrail, not a way to make other `VITE_` values private.

### Vercel Production

Vite uses Nitro's Vercel preset by default. Keep Vercel's framework detection
enabled; if you need to choose a preset manually, select **Other**. Set the
install command to `pnpm install --frozen-lockfile` and the build command to
`pnpm build`. Leave Output Directory unset: Nitro generates `.vercel/output`
with the serverless function, static files, and routing configuration. No
`vercel.json` is required. The generated function currently targets Node.js
26.x, selected from the Node engine range in `package.json`.

In the Vercel project, open **Settings → Environment Variables** and add these
three variables with the **Production** environment selected:

```text
VITE_APP_ENV=production
VITE_SUPABASE_URL=https://<your-production-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-production-publishable-key>
```

Use the production Supabase project's URL and public publishable key (or its
legacy anon JWT). Do not use a development/demo project key, an `sb_secret_`
key, or the service-role key. Ensure Supabase RLS and authorization policies
are configured for production; the browser key is public. Vite embeds `VITE_`
values during the build, so add them before deploying and redeploy after any
change. Preview deployments should have separately scoped values and a
non-production `VITE_APP_ENV`; never copy production credentials into Preview
unless that deployment is explicitly approved to access production data.

## Server variables (Edge Functions)

Template: `supabase/functions/.env.example`. Copy it to `supabase/functions/.env` for local runs.

| Variable                    | Required | Source                                                          |
| --------------------------- | -------- | --------------------------------------------------------------- |
| `APP_ENV`                   | Yes      | You set it. Must match the frontend `VITE_APP_ENV`.             |
| `SUPABASE_URL`              | Yes      | Provided automatically by the Supabase runtime.                 |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes      | Provided automatically by the Supabase runtime.                 |
| `GEMINI_API_KEY`            | No       | `extract-hazard` provider key; set as a Supabase secret.        |
| `GEMINI_MODEL`              | No       | Optional preferred model; stable defaults are used as fallback. |

Do not declare `SUPABASE_*` variables in the example file. Custom secrets starting with `SUPABASE_` cannot be set.

`supabase/functions/_shared/env.ts` exports `loadServerEnv()` and
`safeEnvSummary()`. The helper validates `APP_ENV`, the Supabase runtime URL
and service-role key, and the optional `GEMINI_API_KEY`; diagnostics contain
variable names only. `safeEnvSummary()` returns only booleans and the
environment name. The current `extract-hazard` entrypoint reads its runtime
variables directly; it is deliberately unchanged by BE1-03.

## Setup

### Development

1. `cp .env.example .env.local` (Windows: `copy .env.example .env.local`).
2. Create a dedicated development Supabase project. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and set `VITE_APP_ENV=development`.
3. `cp supabase/functions/.env.example supabase/functions/.env` and set `APP_ENV=development`.
4. Set server secrets only on the dedicated development project:
   `npx supabase secrets set APP_ENV=development GEMINI_API_KEY=...`.
5. Apply the required migrations to that development project and deploy the
   public-callable function:
   `npx supabase db push` and `npx supabase functions deploy extract-hazard --no-verify-jwt`.
6. `pnpm dev`. The development banner should appear.

### Demo

1. Create a separate demo Supabase project with its own keys; load synthetic
   data and create isolated demo identities only.
2. Create `.env.demo.local` with `VITE_APP_ENV=demo` and the demo project's URL
   and anon key.
3. Set `APP_ENV=demo` and any required server secrets on the demo project only.
4. `pnpm exec vite --mode demo`. The synthetic-data banner should appear.

### Pilot (preparation only)

1. Keep pilot inactive and do not create or use real credentials until all
   activation gates above are satisfied.
2. Create a separate pilot Supabase project; enable RLS and review policies
   before any real data is added.
3. Prepare `.env.pilot.local` with `VITE_APP_ENV=pilot`, and set `APP_ENV=pilot`
   and required server secrets on the pilot project only.
4. Release approval is a manual step. The pilot build shows no banner, so
   independently confirm the environment before announcing it.

## Validation

```bash
pnpm check:env      # example files are blank and .gitignore rules are correct
pnpm dev            # Vite checks client-exposed variables before startup
pnpm build          # Vite checks client-exposed variables before bundling
```

`check:env` prints `check:env OK` on success. It fails if an example file has
a value, a frontend example variable lacks the `VITE_` prefix, a secret-like
name appears, a server example declares `VITE_` or `SUPABASE_` variables, or
`.gitignore` is missing a rule. The Vite config independently blocks unsafe
client-exposed names and service-role/secret key values before bundling.

## If a secret leaks

Rotate it in the Supabase dashboard first, then remove it from the file or commit. Removing it from Git history does not make it safe again.
