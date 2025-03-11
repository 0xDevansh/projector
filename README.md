# Projector

This is the repository for SAC x DevClub's project portal. This promotes the discovery of projects and research opportunities for students with the professors at IIT Delhi.
Projector is deployed at https://projects.apps.iitd.ac.in/app

## Setting up a development environment

All tools can be installed with `nix develop` if you use Nix.

Required packages:
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
#### v0.2.0
- [x] Add profile page
- [x] Edit profile option
#### v1.2.1 (Current)
- [x] Add support form
- [x] Allow students to view application
#### Upcoming
- [ ] Public profile options
- [ ] Profile pages and onboarding for faculty
- [ ] Application withdrawal option
- [ ] Fix resume bugs

## Some resources for reference
- [Form creator](https://www.shadcn-form.com/playground)
- [shadcn expansions](https://shadcnui-expansions.typeart.cc/)