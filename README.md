# RaahPrahari — Know before you go · सफ़र से पहले सुरक्षा की ख़बर

A prototype road-hazard advisory and reporting app for Uttarakhand. Travellers pick a FROM and TO place and see seeded route options. Each road section shows its advisory level, how fresh the evidence is, and any official restriction. All data is synthetic.

**Stack:** TanStack Start (React 19, TanStack Router), Vite, Nitro, Tailwind CSS 4, shadcn/ui, lucide-react, Zod, Vitest. Deployed on Vercel; the Nitro Netlify preset remains available for separate Netlify deployments.

## Run locally

```bash
pnpm install --frozen-lockfile
pnpm dev         # http://localhost:3000
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Roadmap

See [PLAN.md](PLAN.md) for completed work and future phases. The current prototype includes route search and advisories, the map and traveller views, the local hazard-report flow, and help/about/contact pages.
