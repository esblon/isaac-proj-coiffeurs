# Audit d’architecture et de qualité — Coiffeurs225

Date de l’audit : 23 juillet 2026

Branche : `codex/audit`

Révision auditée : `5a8e682` (`main`)

Périmètre : lecture statique de l’ensemble du dépôt, installation et contrôles locaux. Aucun design, parcours, package d’abonnement, modèle de données ou code applicatif n’a été modifié.

## Résumé exécutif

Le dépôt est un **prototype fonctionnel de vitrine et de prise de commande**, pas encore une marketplace de réservation. Il possède une identité visuelle cohérente, un catalogue riche, un panier persistant, quatre abonnements préservables, des formulaires commerciaux, une première authentification et un tableau de bord. Ces actifs constituent une bonne base produit et justifient de **conserver puis refactorer progressivement** le prototype.

En revanche, les fonctions qui font la différence entre une vitrine et une marketplace — profils persistés, disponibilités, réservation transactionnelle, affectation d’un professionnel, paiement vérifié, cycle de statuts, notifications fiables, suivi temps réel, litiges et administration métier — sont absentes ou simulées. Le modèle actuel `orders` mélange produits, abonnements et réservations. Il ne peut pas garantir les invariants d’un rendez-vous.

La mise en production est bloquée par plusieurs problèmes :

1. Next.js `16.2.6` est concerné par plusieurs avis de sécurité corrigés à partir de `16.2.11`.
2. L’accès administrateur « en un clic » est réutilisable sans expiration, emploie un secret de secours connu et expose une liste d’administrateurs de secours dans le code.
3. Les actions de création et les routes SMS/WhatsApp sont publiques, non limitées et valident très peu les données ; le client choisit notamment le total enregistré.
4. Le build ignore volontairement les erreurs TypeScript. Le typecheck échoue réellement.
5. Le lint annoncé ne fonctionne pas : ESLint n’est pas déclaré.
6. Il n’existe ni migrations de base, ni tests, ni CI, ni exemple documenté de variables d’environnement, ni politique RGPD.

**Recommandation finale : conserver et refactorer, avec reconstruction partielle du cœur transactionnel.** Conserver l’interface, les contenus, les composants, les packages, le panier et les fondations Next.js/TypeScript. Reconcevoir progressivement, derrière ces écrans, le domaine réservation/paiement/affectation et la sécurité d’administration.

Estimation de réutilisation :

- **70 % du code actuel** peut être conservé ou adapté dans le produit cible ;
- environ **85 % de la couche présentation** est réutilisable ;
- environ **35 % de la couche serveur/données** est réutilisable telle quelle ou après durcissement ;
- le futur produit nécessitera beaucoup de nouveau code métier : le pourcentage ci-dessus mesure la réutilisation du prototype, pas la part du produit final déjà terminée.

## Méthode et limites

L’audit a couvert les fichiers `app/`, `components/`, `lib/`, les configurations, le manifeste PWA, le lockfile et les assets. Les commandes demandées ont été exécutées autant que l’environnement le permettait.

Limites :

- aucune variable d’environnement ni base de données de test n’est fournie ;
- aucun scénario avec Twilio, WhatsApp, Resend ou PostgreSQL ne pouvait donc être validé de bout en bout ;
- aucun compte, paiement, upload, trafic réel ou infrastructure AWS n’a été testé ;
- le test `dev` a été lancé, mais n’a pas produit de réponse HTTP exploitable avant l’expiration de la fenêtre de contrôle dans cet environnement ;
- l’audit de dépendances reflète les avis disponibles le 23 juillet 2026 et doit être réexécuté au moment de chaque livraison.

## Résultats des vérifications techniques

| Vérification | Résultat réel | Conclusion |
|---|---|---|
| `pnpm install --frozen-lockfile` | Échec | `pnpm.overrides` ne correspond plus à la configuration lue par pnpm 11 ; le lockfile gelé est inutilisable avec cette version. |
| `pnpm install --no-frozen-lockfile` | Réussi après autorisation explicite de `sharp` et `msw` et ajout du binaire Node au `PATH` | L’installation est possible, mais la version de pnpm et la politique des scripts doivent être figées dans le dépôt. |
| `pnpm lint` | Échec | Le script existe, mais `eslint` n’est ni une dépendance ni un exécutable installé. |
| `tsc --noEmit` | Échec | Deux erreurs `TS2322` dans `components/admin-dashboard.tsx` aux lignes 100 et 106 : la prop `asChild` n’existe plus sur le composant Base UI `Button`. |
| `pnpm build` / `next build` | Réussi avec avertissements | Compilation réussie, mais le build affiche « Skipping validation of types » à cause de `ignoreBuildErrors: true`. Sept erreurs Better Auth signalent le secret par défaut absent. |
| `pnpm dev` | Inconclusif | Le processus a été lancé sur le port 3100 ; aucune réponse HTTP concluante n’a été obtenue avant le délai de contrôle. |
| `pnpm audit --prod` | Échec, 20 vulnérabilités | 9 hautes, 10 modérées, 1 faible. Les chemins principaux concernent Next.js, Sharp et l’outil `shadcn`. |

Le build recense 14 routes : `/`, `/_not-found`, quatre routes d’administration, trois routes API métier, l’API Better Auth, connexion, inscription, manifeste et téléchargement.

### Anomalies d’installation

- Le dépôt ne définit pas `packageManager`; la reproductibilité dépend donc de la version globale de pnpm.
- Avec pnpm 11.9.0, le champ `pnpm.overrides` de `package.json` n’est plus lu. L’override Hono `4.12.25` devient donc inopérant.
- Les scripts natifs de `sharp` et le post-install de `msw` nécessitent une politique `allowBuilds`.
- Le README propose npm, Yarn et pnpm alors que seul `pnpm-lock.yaml` est versionné.
- Aucun fichier `.nvmrc`, `.node-version`, Volta ou `engines` ne fixe Node.

## État actuel

### Architecture générale

- **Framework** : Next.js 16.2.6, React 19, App Router uniquement.
- **Rendu** : page d’accueil et pages PWA statiques ; administration, authentification et comptes rendus dynamiques.
- **UI** : Tailwind CSS 4, Base UI, quelques composants shadcn, Lucide.
- **État client** : Context React et `localStorage` pour le panier.
- **Serveur** : Server Actions et Route Handlers dans la même application Next.js.
- **Données** : PostgreSQL via `pg` et Drizzle ORM.
- **Authentification** : Better Auth avec email/mot de passe, sessions et réinitialisation par Resend.
- **Notifications** : intégrations directes Twilio SMS et Meta WhatsApp.
- **Observabilité** : Vercel Analytics en production seulement.

Cette architecture monolithique est adaptée au stade actuel et peut rester la base du MVP. La faiblesse principale n’est pas le monolithe : c’est l’absence d’une couche métier explicite entre les composants/routes et la base.

### Organisation

Points positifs :

- alias `@/*`, TypeScript strict, App Router moderne ;
- composants d’interface déjà découpés par section ;
- séparation initiale `lib/db`, `lib/auth`, `lib/data` ;
- composants serveur par défaut et `"use client"` utilisé seulement lorsque nécessaire ;
- composants partagés simples (`Button`, `Input`, `Card`, `Label`) ;
- assets locaux, ce qui limite les dépendances externes de rendu.

Limites :

- Server Actions d’accès aux données placées directement sous `app/actions` sans services métier ;
- données de production, données marketing et tarifs en constantes TypeScript ;
- très gros composants clients : `partner-form` (492 lignes), `cart-drawer` (481), `advertise` (478), `admin-dashboard` (394), `subscription` (300) ;
- schéma, migrations et configuration Drizzle incomplets : aucune migration versionnée ni commande de migration ;
- absence de répertoires `domain`, `services`, `repositories`, `validators`, `tests` ;
- code généré v0 encore identifiable dans les logs (`[v0]`) et README générique ;
- encodage mojibake visible dans de nombreuses chaînes du dépôt (`RÃ©servation`, etc.), à confirmer dans l’interface selon l’encodage du checkout.

## Inventaire des écrans et routes

| Route / écran | État | Contenu |
|---|---|---|
| `/` | Implémenté visuellement | Landing page, recherche statique, services, boutique, abonnements, coiffeurs, témoignages, publicité, partenaire, panier. |
| `/connexion` | Partiel | Connexion Better Auth ; pas de véritable espace client après connexion. |
| `/inscription` | Partiel | Création de compte Better Auth ; pas de profil métier. |
| `/telecharger` | Implémenté visuellement | Guide d’installation PWA selon la plateforme. |
| `/admin/login` | Implémenté mais dangereux | Affiche les liens magiques de tous les emails administrateurs configurés. |
| `/admin` | Partiel | Métriques et listes des commandes, candidatures, publicités et utilisateurs ; pas d’actions métier structurées. |
| `/admin/mot-de-passe-oublie` | Partiel | Demande de réinitialisation ; fuite l’existence d’un compte. |
| `/admin/reinitialiser` | Partiel | Saisie d’un nouveau mot de passe via Better Auth. |
| `/api/auth/[...all]` | Implémenté | Route Better Auth. |
| `/api/admin-login` | Implémenté mais dangereux | Pose un cookie admin après validation d’un HMAC permanent. |
| `/api/sms` | Partiel | Envoi direct Twilio sur payload client, sans authentification. |
| `/api/whatsapp` | Partiel | Envoi direct Meta sur payload client, sans authentification. |
| `/manifest.webmanifest` | Implémenté | Métadonnées PWA. |

Écrans absents : espace client, profil et adresses, fiche détaillée du coiffeur, agenda, choix réel de créneau, confirmation de réservation, paiement, suivi, historique, favoris, avis, réclamation, espace professionnel, revenus/statistiques professionnels, consoles de litige/remboursement/promotion/zone.

## Inventaire fonctionnel

Légende : **I** = implémenté ; **P** = partiel ; **S** = simulé/maquetté ; **A** = absent.

### Fonctions transverses et commerciales

| Fonction | État | Preuve / remarque |
|---|---|---|
| Landing page responsive | I | Sections composées dans `app/page.tsx`. |
| Thèmes | I | `next-themes` et sélecteur de thème. |
| Installation PWA | P | Manifeste et prompt ; aucun service worker/offline métier vérifié. |
| Catalogue de services | S | Six prestations codées en dur, non reliées aux professionnels. |
| Catalogue de professionnels | S | Six profils codés en dur, notes et volumes non persistés. |
| Recherche/filtres | S | Sélecteurs visuels ; bouton vers une ancre, sans filtrage. |
| Zones et tarifs | S | Huit zones et tarifs codés en dur. |
| Panier | I | Ajout, quantité, suppression et persistance locale. |
| Boutique produits | P | Produits et panier fonctionnels ; stock, livraison et paiement absents. |
| Commande | P | Enregistrement PostgreSQL puis notification ; données et total contrôlés par le client. |
| Candidature partenaire | P | Formulaire, géolocalisation, enregistrement ; le « document » n’est qu’un nom de fichier. |
| Publicité | P | Trois packages, demande enregistrée, relais WhatsApp ; pas de campagne ni paiement. |
| Administration | P | Lecture de listes et métriques ; workflows de validation/édition absents. |

### Packages d’abonnement à préserver

Les quatre packages clients sont présents et doivent être conservés sans rupture :

| Package | Prix | Comportement existant |
|---|---:|---|
| Essentiel | 9 000 FCFA/mois | Ajout au panier comme abonnement récurrent. |
| Premium | 15 000 FCFA/mois | Ajout au panier comme abonnement récurrent. |
| VIP | 25 000 FCFA/mois | Ajout au panier comme abonnement récurrent. |
| Famille | 35 000 FCFA/mois | Ajout au panier comme abonnement récurrent. |

Le parcours permet aussi l’achat comme cadeau. Il n’existe toutefois ni table `subscriptions`, ni cycle de facturation, ni dates de début/fin, ni bénéficiaire persistant, ni renouvellement, ni suspension. Une migration future devra :

- créer des identifiants stables de plans sans renommer/supprimer les offres ;
- importer les lignes d’anciennes commandes comportant `recurring: true` ;
- conserver prix, libellés et avantages historiques sur chaque souscription ;
- versionner les catalogues afin qu’un changement futur n’altère pas un contrat existant ;
- ajouter les nouveaux champs de façon nullable ou avec valeurs par défaut rétrocompatibles.

Les trois packages publicitaires (`Visibilité`, `Croissance`, `Prestige`) sont distincts et doivent également rester disponibles.

### Client

| Capacité cible | État | Écart principal |
|---|---|---|
| Inscription / connexion | P | Compte technique sans profil, vérification email ni règles métier. |
| Profil | A | Aucun modèle `customer_profile`. |
| Plusieurs adresses | A | Coordonnées ponctuelles seulement. |
| Géolocalisation | P | API navigateur, coordonnées exactes envoyées/stockées sans politique. |
| Recherche et filtres | S | Contrôles non fonctionnels. |
| Réservation | S | Ajout d’une ligne au panier, sans date/créneau ni professionnel garanti. |
| Paiement | S | Choix déclaratif ; aucun PSP, intent, webhook ou preuve. |
| Historique | A | Seul l’admin lit les commandes. |
| Favoris | A | Aucun modèle ni écran. |
| Annulation | A | Aucun workflow. |
| Notation | S | Notes statiques ; aucune création d’avis. |
| Réclamation | A | Aucun modèle ni écran. |

### Coiffeur

| Capacité cible | État | Écart principal |
|---|---|---|
| Création de profil | P | Candidature uniquement. |
| Validation | P | Statut brut `nouveau`, sans action/version/audit. |
| Spécialités | P | JSON libre dans la candidature. |
| Prestations et tarifs | S | Données globales statiques. |
| Agenda / disponibilités | A | Aucun modèle. |
| Acceptation / refus | A | Aucun workflow ou rôle coiffeur. |
| Déplacement / arrivée | A | Aucun statut, position ou preuve. |
| Début / fin de prestation | A | Aucun événement de cycle de vie. |
| Revenus / statistiques | A | Métriques globales seulement. |

### Administration

| Capacité cible | État | Écart principal |
|---|---|---|
| Validation professionnels | P | Visualisation sans véritable action sécurisée. |
| Gestion prestations/utilisateurs | P | Utilisateurs visibles, pas de gestion métier. |
| Commissions | A | Aucun modèle. |
| Paiements/remboursements | A | Aucun PSP ni ledger. |
| Promotions | S | Bannières statiques seulement. |
| Zones couvertes | S | Constantes TypeScript. |
| Statistiques | P | Comptage et chiffre d’affaires déclaratif. |
| Litiges | A | Aucun modèle ni workflow. |

## Parcours utilisateur actuel

Le parcours affiché est : choisir un service ou un professionnel → l’ajouter au panier → fournir nom, téléphone, moyen de paiement et géolocalisation → enregistrer une commande → tenter une notification SMS/WhatsApp → ouverture possible d’un relais WhatsApp.

Ce parcours ne constitue pas encore une réservation :

- aucun créneau n’est sélectionné ni verrouillé ;
- le prix peut combiner des produits, des abonnements et des prestations ;
- l’identité du professionnel n’est pas relationnelle ;
- aucune adresse structurée n’est enregistrée ;
- aucune transaction n’englobe commande, réservation et paiement ;
- la notification peut échouer après l’enregistrement ;
- l’échec d’enregistrement est absorbé en un simple `{ ok: false }` ;
- la disponibilité, l’acceptation et l’affectation ne sont pas vérifiées.

### Cycle de statuts

Le schéma actuel n’expose qu’un champ texte libre `status`, initialisé à `nouveau`, pour les commandes, candidatures et demandes publicitaires. Aucun des statuts demandés n’est implémenté comme machine à états.

Cycle cible conseillé, avec transitions contrôlées et journalisées :

`draft` → `pending` → `proposed` → `accepted` → `barber_en_route` → `arrived` → `in_progress` → `completed` → `paid`

Branches terminales ou compensatoires :

- `proposed` → `rejected` → nouvelle proposition ou annulation ;
- avant prestation → `cancelled` selon règles et auteur ;
- paiement → `refunded` partiel/complet ;
- état éligible → `disputed` → résolution explicite.

Chaque transition doit déclarer les rôles autorisés, préconditions, horodatage, auteur, motif et effets secondaires. Les libellés UI peuvent rester français ; les valeurs stockées doivent être stables.

## Qualité du code

### Points forts

- `strict: true` est activé ;
- pas d’utilisation directe notable de `any` dans le code métier ;
- noms de types simples et lisibles ;
- composants et données statiques facilement compréhensibles ;
- requêtes Drizzle paramétrées, réduisant le risque d’injection SQL classique ;
- cookie admin posé `httpOnly`, `sameSite: lax`, `secure` en production ;
- comparaison HMAC en temps constant ;
- ouverture des fenêtres avec `noopener,noreferrer`.

### Faiblesses

- `allowJs: true`, `skipLibCheck: true` et surtout `ignoreBuildErrors: true` réduisent la garantie de typage ;
- erreurs TypeScript actuellement masquées ;
- aucun schéma de validation runtime (Zod, Valibot ou équivalent) ;
- casts directs des payloads JSON et Server Actions typées seulement à la compilation ;
- erreurs souvent loguées puis réduites à `{ ok: false }`, sans code, contexte ni corrélation ;
- valeurs monétaires en `integer` FCFA acceptables localement mais sans devise, taxes, frais ou ventilation ;
- JSONB non typé en base pour les items, zones et spécialités ;
- références de commande sans contrainte `unique` ;
- statuts en texte libre sans enum/check/transition ;
- aucun test unitaire, intégration, composant, E2E ou contrat ;
- aucune CI, couverture ou règle de qualité ;
- gros composants mêlant rendu, validation, calcul, persistance et intégrations ;
- dépendances probablement inutiles au runtime : `shadcn` est un CLI mais figure dans `dependencies`; `swr` ne semble pas importé ; `@base-ui/react` reste utilisé.

## Modèle de données

### Modèle actuel

Better Auth fournit `user`, `session`, `account`, `verification`. L’application ajoute :

- `orders` : référence, identité/téléphone client, paiement déclaré, total, items JSON, coordonnées, statut ;
- `partner_applications` : informations déclaratives, zones/spécialités JSON, nom de document, coordonnées, statut ;
- `ad_requests` : package, durée, budget, contact et statut.

### Risques

- pas de migration versionnée ni procédure de restauration ;
- pas de séparation entre commande e-commerce, souscription et réservation ;
- pas de clés étrangères applicatives ;
- pas d’utilisateur lié à une commande ;
- pas de professionnel, adresse, prestation, créneau ou affectation ;
- pas de contrainte d’idempotence ;
- données sensibles exactes dans les tables sans classification ni politique de rétention ;
- aucune trace des transitions et décisions administratives.

### Modèle cible minimal

Conserver les tables existantes pour compatibilité, puis ajouter par migrations :

- `customer_profiles`, `addresses`, `professional_profiles`, `professional_documents`;
- `service_catalog`, `professional_services`, `service_areas`;
- `availability_rules`, `availability_exceptions`, `booking_slots`;
- `bookings`, `booking_items`, `booking_assignments`, `booking_events`;
- `subscription_plans`, `subscriptions`, `subscription_events`;
- `payment_intents`, `payments`, `refunds`, `commission_ledger`;
- `reviews`, `favorites`, `claims`, `disputes`;
- `notifications`, `notification_attempts`, `outbox_events`;
- `consents`, `data_export_requests`, `account_deletion_requests`, `audit_log`.

Les `orders` existantes restent lisibles. Une table de correspondance ou un champ nullable peut relier progressivement une ancienne commande à une réservation, une souscription ou une commande boutique.

## Analyse sécurité

### Bloquants

#### S-01 — Accès administrateur permanent et forgeable avec le secret de secours

`lib/admin.ts` utilise `BETTER_AUTH_SECRET ?? "coiffeurs225-admin-dev-secret"`. Le même HMAC d’email est valable sans date d’expiration, sans nonce, sans usage unique et sert au lien et au cookie. En l’absence de secret d’environnement, toute personne connaissant le code peut forger un accès. Même avec un bon secret, un lien intercepté reste valable jusqu’à rotation du secret.

Actions :

- supprimer le secret de secours en dehors des tests et faire échouer le démarrage en production ;
- remplacer le HMAC déterministe par un jeton aléatoire, haché en base, mono-usage et expirant ;
- exiger une authentification Better Auth avec MFA pour les administrateurs ;
- invalider tous les liens existants et journaliser les connexions.

#### S-02 — Liens administrateurs exposés publiquement

`/admin/login` construit et affiche les liens privés pour chaque admin configuré. `sendAdminLinks` est une Server Action appelable sans session et peut déclencher des emails vers tous les admins. Cette surface facilite la récupération, le spam et la prise de contrôle en cas de fuite.

Action : ne jamais rendre un secret de connexion dans une page publique ; protéger l’envoi par rate limit, anti-automatisation et flux de demande générique.

#### S-03 — Actions serveur de persistance non authentifiées et non validées

`saveOrder`, `savePartnerApplication` et `saveAdRequest` acceptent directement des objets clients. Un attaquant peut créer du spam, injecter des volumes JSON excessifs, choisir un total négatif ou incohérent, fournir des coordonnées invalides et saturer la base.

Action : validation runtime stricte, limites de taille, authentification quand appropriée, rate limiting, idempotency key, calcul serveur des prix, contraintes DB et journalisation.

#### S-04 — Endpoints de notification publics et facturables

`/api/sms` et `/api/whatsapp` acceptent une destination et un message dérivé d’un payload public sans session, signature interne, rate limit ni vérification que la commande existe. Ils peuvent entraîner spam, coûts, réputation dégradée et blocage fournisseur.

Action : rendre ces appels internes à un worker/outbox, vérifier la commande et le destinataire côté serveur, limiter les tentatives et ne jamais exposer le déclencheur fournisseur directement.

#### S-05 — Dépendances vulnérables

`pnpm audit --prod` rapporte 20 avis, dont 9 hauts. Les plus importants pour l’application :

- Next.js `< 16.2.11` : contournement App Router/Turbopack, DoS Server Actions, SSRF sur serveurs personnalisés et autres avis ;
- Sharp `< 0.35.0` : vulnérabilités libvips ;
- plusieurs vulnérabilités transitives via le CLI `shadcn`, qui ne devrait pas être une dépendance de production ;
- l’override Hono est obsolète et, même appliqué, `4.12.25` est inférieur au correctif `4.12.27` signalé.

Action : mettre à jour Next.js au dernier patch compatible, déplacer/retirer les outils de génération du runtime, mettre à jour Sharp/Hono via les parents et revalider build/E2E.

### Majeurs

- `next.config.mjs` ignore les erreurs TypeScript.
- Réinitialisation de mot de passe : le message révèle si l’email existe, facilitant l’énumération de comptes.
- Aucun mécanisme explicite de rate limit sur connexion, reset, formulaires ou notifications.
- `getBaseUrl` dépend de variables d’hôte ; imposer des origines explicitement approuvées.
- Les intégrations retournent parfois les détails fournisseurs au client et loguent leurs réponses.
- Coordonnées GPS exactes conservées sans précision réduite, consentement durable ou rétention.
- `idDocumentName` donne l’illusion d’un upload KYC alors qu’aucun fichier n’est reçu, contrôlé ou stocké.
- Aucun en-tête CSP, HSTS explicite, Permissions-Policy ou politique `frame-ancestors` dans la configuration.
- Aucun modèle d’autorisation par rôle au-delà d’une liste d’emails.
- Pas de protection métier contre double soumission ou rejeu.

### XSS, CSRF, SQL et uploads

- Aucun `dangerouslySetInnerHTML` avec contenu utilisateur n’a été détecté ; React échappe les chaînes rendues.
- Les templates email interpolent des URL construites côté serveur. Toute future donnée utilisateur devra être échappée.
- Les requêtes Drizzle réduisent le risque SQL, mais la validation et les limites restent nécessaires.
- Better Auth apporte ses protections de session ; les Server Actions et endpoints métier doivent encore contrôler origine, session et intention.
- Aucun vrai upload n’existe. Un futur upload de pièce d’identité devra employer URL présignée, limite de taille/type, scan antivirus, stockage privé, chiffrement et accès journalisé.

## Analyse UX et accessibilité

### Points forts

- hiérarchie visuelle cohérente et responsive ;
- textes d’aide, prix et frais de déplacement visibles ;
- boutons avec libellés/`aria-label` fréquents ;
- dialogues avec `role="dialog"` et états de chargement ;
- parcours PWA guidé ;
- conservation du panier entre sessions.

### Écarts

- la recherche et les filtres paraissent actifs mais ne filtrent rien ;
- « Réserver » signifie seulement « ajouter au panier » et aucun créneau n’est choisi ;
- badges « vérifié », statistiques et avis sont statiques sans provenance explicite ;
- l’overlay « Voir en action » n’ouvre pas de vidéo ;
- les mentions « hors connexion », « réservation instantanée », « validée » et « transmise à un coiffeur » dépassent les capacités réelles ;
- le panier mélange objets de natures et cycles de vie différents ;
- les modales personnalisées doivent gérer focus initial, piégeage du focus, fermeture Échap et restitution du focus ;
- les erreurs réseau et de persistance sont parfois génériques ;
- la géolocalisation est demandée comme précondition de commande sans solution d’adresse manuelle structurée ;
- l’encodage apparent des chaînes doit être corrigé avec prudence et validé visuellement.

## RGPD et données sensibles

### Données traitées

- identité, email, téléphone et identifiants de compte ;
- adresse implicite et coordonnées GPS exactes du client ;
- domicile et zones de travail du professionnel ;
- pièce d’identité annoncée, potentiellement très sensible si l’upload est ajouté ;
- sessions, IP et user-agent ;
- historique d’achats, abonnements, prestations et moyens de paiement déclarés ;
- contenus de candidatures, messages commerciaux et futures réclamations.

### Écarts

- aucune notice de confidentialité, base légale ou consentement versionné ;
- aucune minimisation documentée ;
- aucune durée de conservation ni purge ;
- aucune suppression de compte, anonymisation ou export ;
- aucune gestion des droits d’accès/rectification/opposition ;
- aucun registre d’audit ou de violation ;
- aucun accord/registre des sous-traitants (hébergeur, email, SMS, WhatsApp, futur PSP) ;
- aucune règle de localisation ou transfert international des données ;
- géolocalisation exacte stockée sans durée ni séparation d’accès.

### Politique initiale à valider juridiquement

| Donnée | Finalité | Rétention de départ proposée |
|---|---|---|
| Compte/profil actif | Exécution du service | Vie du compte, puis suppression/anonymisation selon obligations. |
| Réservations et écritures financières | Contrat, preuve, fiscalité | Selon droit ivoirien et obligations comptables applicables, à valider par conseil. |
| Coordonnées GPS opérationnelles | Réalisation de la prestation | Précision exacte limitée à la fenêtre opérationnelle ; réduction/anonymisation ensuite. |
| Candidature refusée | Recrutement de partenaires | Courte durée documentée, par exemple 6 mois avec information préalable. |
| Document d’identité | Vérification | Le strict minimum, accès restreint et purge après validation/délai légal. |
| Logs de sécurité | Prévention des abus | Durée proportionnée, par exemple 6 à 12 mois selon risque. |
| Consentements | Preuve | Durée du traitement plus délai de preuve approprié. |

Ces durées sont des propositions d’architecture, pas un avis juridique. Une analyse locale Côte d’Ivoire et, si des résidents UE sont ciblés, RGPD, est requise avant production.

## Architecture cible compatible AWS

### Principe

Conserver un **monolithe modulaire Next.js** pour le MVP. Ne pas introduire de microservices tant que le volume et les équipes ne l’exigent pas.

### Composants

- **Web/API** : Next.js conteneurisé sur AWS App Runner ou ECS Fargate derrière CloudFront/ALB. Une plateforme managée compatible Next.js peut être conservée au début si AWS n’est pas une contrainte immédiate.
- **Base** : Amazon RDS PostgreSQL Multi-AZ en sous-réseaux privés, chiffrement KMS, sauvegardes/PITR, pool de connexions.
- **Authentification** : conserver Better Auth à court terme après durcissement, MFA admin et sessions sécurisées. Cognito n’est justifié que si les besoins IAM/fédération le rendent réellement utile.
- **Stockage** : S3 privé, URL présignées, KMS, règles de cycle de vie, scan asynchrone et CloudFront seulement pour les médias publics.
- **Géolocalisation** : PostGIS dans PostgreSQL pour zones, distances et proximité ; Amazon Location Service seulement si cartographie, géocodage ou suivi le justifient.
- **Paiement** : adaptateur de PSP acceptant les moyens locaux ; intents créés serveur, callbacks/webhooks signés, ledger immuable et idempotence. Le choix du fournisseur nécessite validation métier.
- **Notifications** : table outbox transactionnelle → SQS → worker → adaptateurs email/SMS/WhatsApp/push ; retries, dead-letter queue et traçabilité.
- **Temps réel** : commencer par polling/SSE pour statuts. API Gateway WebSocket ou AppSync seulement si le suivi bidirectionnel à grande échelle est prouvé nécessaire.
- **Secrets** : Secrets Manager ou SSM Parameter Store ; jamais de valeur de secours en production.
- **Observabilité** : logs JSON corrélés, CloudWatch, alarmes, traces et audit des actions privilégiées.
- **Protection** : WAF/rate limits, TLS, en-têtes de sécurité, accès DB privé, moindre privilège IAM.

### Modules applicatifs

`auth`, `customers`, `professionals`, `catalog`, `availability`, `bookings`, `subscriptions`, `payments`, `notifications`, `admin`, `compliance`.

Chaque module contient validation, cas d’usage, accès données et règles. Les routes et Server Actions deviennent des adaptateurs minces.

## Dette technique priorisée

### Bloquants production

1. Corriger l’accès admin, supprimer les secrets de secours et révoquer les liens permanents.
2. Mettre à jour les dépendances vulnérables, surtout Next.js.
3. Fermer les endpoints SMS/WhatsApp publics et valider/calculer toutes les commandes côté serveur.
4. Restaurer un lint/typecheck bloquant et enlever `ignoreBuildErrors`.
5. Versionner migrations, configuration d’environnement et procédure de déploiement.
6. Concevoir réservation, disponibilité, paiement et états avant d’accepter de vraies transactions.

### Problèmes majeurs

- absence de tests et CI ;
- aucune gestion de rôles robuste ;
- modèle `orders` surchargé ;
- absence d’idempotence et d’outbox ;
- données et statistiques statiques potentiellement trompeuses ;
- pas de RGPD ni cycle de vie des données ;
- composants clients trop responsables ;
- absence de contrôle d’origine, taille et fréquence sur les entrées.

### Problèmes mineurs

- README générique et nom de package `my-project` ;
- scripts et versions runtime non documentés ;
- logs `[v0]` ;
- dépendances CLI dans les dépendances de production ;
- `images.unoptimized: true` prive de l’optimisation d’image ;
- PWA sans capacité offline démontrée ;
- incohérences d’encodage à corriger après test visuel ;
- métrique de chiffre d’affaires fondée sur des totaux déclaratifs et non des paiements encaissés.

## Recommandations

### Immédiates

- geler tout déploiement public transactionnel ;
- faire tourner les secrets et retirer les liens admin existants ;
- corriger la chaîne qualité et les vulnérabilités ;
- ajouter validation runtime, rate limits et calcul serveur des prix ;
- documenter les variables sans valeur secrète ;
- ajouter CI : install gelée, lint, typecheck, tests, build, audit.

### Stratégie d’évolution

1. Stabiliser sans changer le design.
2. Encapsuler les données statiques derrière des interfaces de catalogue.
3. Ajouter les modèles métier par migrations additives.
4. Brancher les écrans existants sur les nouveaux cas d’usage.
5. Introduire d’abord la réservation transactionnelle, puis paiement et notifications asynchrones.
6. Migrer les commandes/abonnements historiques sans suppression.
7. Déployer par fonctionnalités activables et mesurer les régressions.

### Décision finale

| Option | Décision |
|---|---|
| Conserver tel quel | Non : sécurité et cœur métier insuffisants. |
| Refactorer | **Oui**, pour la majorité de l’interface et des fondations. |
| Reconstruire partiellement | **Oui**, pour réservation, disponibilités, affectation, paiements, notifications, administration et conformité. |
| Reconstruire totalement | Non : perte injustifiée des actifs UI, contenus, packages et parcours déjà produits. |

La trajectoire recommandée est donc : **conserver + refactorer progressivement + reconstruire partiellement le cœur transactionnel**, avec une réutilisation estimée à **70 % du code du prototype**.
