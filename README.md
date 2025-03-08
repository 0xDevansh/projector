# Projector

Projector is deployed at https://projects.apps.iitd.ac.in/app

## Setting up a development environment

All tools are installed by `nix develop` if you use Nix.

Required tools:
- Node.js (>= 22 LTS)
- pnpm (recommended)
- sqlite3
- pm2 (for deployment)

```bash
pnpm install
tsc -w   
```
and in parallel
```bash
node dist/server.js --dev
```

## Deployment

First time deployment:
```bash
pnpm install && pnpm build
pm2 start ecosystem.config.cjs
```

To reload,

```bash
pnpm run deploy
```

## Roadmap
- [x] Add profile editing
- [ ] Implement profile viewing
- [ ] Add application withdrawal and other options
- [ ] Fix resume bugs
- [ ] Set up and test email system

## Some resources for reference
- [Form creator](https://www.shadcn-form.com/playground)
- [shadcn expansions](https://shadcnui-expansions.typeart.cc/)