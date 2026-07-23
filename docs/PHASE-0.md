# Phase 0 — sécurisation du prototype

## Changements livrés

- suppression de l’authentification administrateur par liens HMAC permanents et des emails administrateurs de secours ;
- accès admin limité à une session Better Auth dont l’adresse figure dans `ADMIN_EMAILS` ;
- secret Better Auth d’au moins 32 caractères obligatoire en production ;
- suppression des endpoints publics et facturables SMS/WhatsApp ;
- notifications exécutées côté serveur seulement après enregistrement réussi de la commande ;
- validation Zod et limites de fréquence sur commandes, candidatures, publicités et demandes de réinitialisation ;
- recalcul serveur des prix depuis le catalogue existant, y compris les quatre abonnements ;
- erreurs de persistance remontées à l’interface au lieu d’afficher un faux succès ;
- réponse de réinitialisation générique pour empêcher l’énumération des comptes ;
- en-têtes de sécurité HTTP de base ;
- Next.js mis à jour vers `16.2.11`, dépendances vulnérables remplacées et outils de génération déplacés en développement ;
- dépendances, métadonnées et variables d’exécution Vercel supprimées ; URL publique fournie par `NEXT_PUBLIC_SITE_URL` sur AWS ;
- build TypeScript bloquant, ESLint, Vitest, audit et CI GitHub ;
- versions pnpm/Node de CI et scripts natifs explicitement configurés.

## Préparation des environnements

Copier `.env.example` vers `.env.local` et renseigner au minimum :

- `DATABASE_URL` ;
- `BETTER_AUTH_URL` ;
- `BETTER_AUTH_SECRET` généré aléatoirement (32 caractères minimum) ;
- `ADMIN_EMAILS`.
- `NEXT_PUBLIC_SITE_URL`, égal à l’URL CloudFront/ALB de l’environnement.

Les clés Twilio et WhatsApp sont optionnelles. Sans elles, la commande reste enregistrée et le parcours conserve son repli WhatsApp côté client.

## Migration de l’accès administrateur

Les anciens liens administrateur ne fonctionnent plus. Avant le déploiement :

1. vérifier que chaque adresse de `ADMIN_EMAILS` possède un compte Better Auth ;
2. sinon créer le compte par le parcours d’inscription contrôlé ou par une procédure d’administration ;
3. tester la connexion email/mot de passe puis `/admin` en staging ;
4. faire tourner `BETTER_AUTH_SECRET` afin de révoquer les anciennes sessions ;
5. ne jamais remettre de lien permanent dans une page ou un email.

## Limites assumées

- le rate limiting en mémoire protège un processus mais pas encore un déploiement multi-instance ; une solution partagée sera requise avant montée en charge ;
- le panier reste un prototype et le paiement affiché reste simulé ;
- les notifications sont synchrones ; l’outbox/SQS appartient à la Phase 8 ;
- le MFA administrateur nécessite une évolution Better Auth dédiée ;
- les migrations métier et l’idempotence transactionnelle complète appartiennent aux phases suivantes.

## Next step — socle de déploiement AWS

Ne pas connecter cette PR à Vercel. Après validation fonctionnelle locale :

1. préparer une image Docker Next.js non privilégiée ;
2. publier l’image immuable dans l’ECR `blon/isaac-proj-coiffeurs` ;
3. réutiliser l’EC2, le moteur PostgreSQL et Caddy existants ;
4. créer la base logique `coiffeurs225` et le rôle `coiffeurs225_app` dans le
   conteneur PostgreSQL existant, sans RDS ;
5. installer la configuration depuis le SecureString Parameter Store
   `/blon/nonprod/coiffeurs225/runtime/app-env` ;
6. exécuter les migrations versionnées puis un smoke test UAT avant toute
   promotion.

## Validation

Commandes attendues :

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm audit --prod --audit-level high
```
