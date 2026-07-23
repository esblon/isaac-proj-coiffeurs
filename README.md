# Coiffeurs225

Marketplace de services de coiffure à domicile construite avec Next.js.

## Hébergement cible

Le projet abandonne Vercel. La cible est AWS avec un déploiement conteneurisé
Next.js, PostgreSQL sur RDS, stockage S3 et distribution CloudFront/ALB.
Une fusion dans `main` ne doit déclencher aucun déploiement Vercel.

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
