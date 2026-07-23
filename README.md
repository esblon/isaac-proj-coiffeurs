# Coiffeurs225

Marketplace de services de coiffure à domicile construite avec Next.js.

## Hébergement cible

Le projet abandonne Vercel. La cible est AWS avec un déploiement Next.js
conteneurisé sur l’EC2 existante et une base logique dédiée dans le moteur
PostgreSQL partagé. RDS n’est pas utilisé à ce stade.
Une fusion dans `main` ne doit déclencher aucun déploiement Vercel.

## Runtime AWS

L'image de production est une image Next.js standalone non privilegiee. Au
demarrage, elle applique les migrations SQL versionnees, puis lance le serveur
sur le port `3000`. Le endpoint `GET /api/health` verifie l'application et la
connexion PostgreSQL.

La cible UAT est l'EC2 existante `blon-nonprod-app-01` en `eu-west-3`. Elle
reutilise le conteneur PostgreSQL existant avec une base logique
`coiffeurs225` et un role dedie `coiffeurs225_app`. Aucun RDS et aucune seconde
EC2 ne sont requis pour cette phase.

Construction et controle local :

```powershell
docker build --tag isaac-proj-coiffeurs:local .
docker inspect isaac-proj-coiffeurs:local `
  --format '{{json .Config.Healthcheck}}'
```

Variables obligatoires au runtime :

- `DATABASE_URL` ;
- `BETTER_AUTH_URL` ;
- `BETTER_AUTH_SECRET` (32 caracteres minimum) ;
- `ADMIN_EMAILS` ;
- `NEXT_PUBLIC_SITE_URL`.

La configuration UAT sera fournie par le SecureString Parameter Store
`/blon/nonprod/coiffeurs225/runtime/app-env`. Aucun secret reel ne doit etre
fourni comme argument de construction Docker.

## Développement local

Utilisez Node.js 22 et pnpm 10.28.2. Copiez `.env.example` vers `.env.local`,
configurez PostgreSQL et Better Auth, puis exécutez :

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

Avant d’ouvrir une Pull Request :

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm audit --prod --audit-level high
```

## Documentation

- `docs/AUDIT.md` : audit initial ;
- `docs/ROADMAP.md` : trajectoire vers la production AWS ;
- `docs/PHASE-0.md` : durcissement du prototype et prochaine étape.

## Références

- [Documentation Next.js](https://nextjs.org/docs)
- [Apprendre Next.js](https://nextjs.org/learn)
