# Roadmap vers la production — Coiffeurs225

Cette roadmap conserve le design, les parcours, les composants et tous les packages existants. Les migrations doivent être additives, rétrocompatibles et réversibles. Chaque phase se termine par des critères de sortie vérifiables ; les durées sont des ordres de grandeur pour une petite équipe produit (2 à 4 développeurs, QA/produit partagés), à recalibrer après cadrage.

## Principes de livraison

- Une branche protégée, Pull Request, CI verte et revue pour chaque changement.
- Aucun secret ni donnée réelle dans Git.
- Migrations `expand → migrate → contract`, sans suppression immédiate.
- Calculs de prix, autorisations et transitions de statuts côté serveur.
- Idempotence pour réservation, paiement, webhook et notification.
- Fonctionnalités nouvelles derrière flags lorsque le risque le justifie.
- Tests de non-régression des abonnements Essentiel, Premium, VIP, Famille et des packages publicitaires.
- Observabilité et procédure de retour arrière avant activation production.

## Phase 0 — Sécurisation du prototype

Durée indicative : 1 à 2 semaines. Priorité : immédiate.

Objectifs :

- supprimer le secret Better Auth de secours et imposer les variables requises ;
- révoquer les liens admin permanents ; authentification admin avec MFA et jetons expirants ;
- protéger ou internaliser SMS/WhatsApp, ajouter rate limits et anti-rejeu ;
- valider tous les payloads ; limiter taille, format et fréquence ;
- recalculer prix et totaux depuis un catalogue serveur ;
- mettre à jour Next.js et dépendances vulnérables ;
- retirer `ignoreBuildErrors`, corriger les deux erreurs TypeScript ;
- installer/configurer ESLint, fixer Node et pnpm, définir `packageManager` et `allowBuilds` ;
- créer `.env.example` sans secret et une matrice des variables ;
- ajouter en-têtes CSP/HSTS/Permissions-Policy adaptés.

Critères de sortie :

- installation gelée reproductible ;
- lint, typecheck, build et audit exécutables en CI ;
- aucun avis haut exploitable accepté sans dérogation documentée ;
- aucune notification facturable déclenchable anonymement ;
- aucun accès admin permanent ou basé sur une valeur par défaut ;
- tests de sécurité minimaux sur toutes les entrées publiques.

## Phase 1 — Fondations techniques

Durée indicative : 2 à 3 semaines.

Objectifs :

- structurer le monolithe en modules métier ;
- ajouter validation partagée, erreurs typées, logs JSON et identifiants de corrélation ;
- configurer Drizzle, migrations versionnées, seeds non sensibles et sauvegarde/restauration ;
- créer une CI GitHub : install, lint, typecheck, tests, build, audit ;
- ajouter tests unitaires et intégration DB éphémère ;
- définir conventions d’identifiants, timestamps UTC, devise FCFA, enums et idempotence ;
- documenter ADR, variables, développement local et stratégie de migration ;
- mettre en place feature flags simples.

Critères de sortie :

- routes/Server Actions minces, règles métier testables hors UI ;
- migration depuis l’état existant validée sur une copie anonymisée ;
- restauration DB testée ;
- tableau de dépendances et ownership des modules documentés.

## Phase 2 — Comptes et profils

Durée indicative : 2 à 4 semaines.

Objectifs :

- profils client et professionnel liés à Better Auth ;
- rôles `customer`, `professional`, `admin`, `support`, autorisations centralisées ;
- vérification email/téléphone et récupération de compte non énumérable ;
- plusieurs adresses client, adresse par défaut et consentement géolocalisation ;
- onboarding professionnel et workflow de validation ;
- upload privé de justificatifs par URL présignée, scan et rétention ;
- suppression de compte, export et journal d’audit ;
- espace client et espace professionnel réutilisant le design existant.

Critères de sortie :

- tests d’isolation entre comptes et rôles ;
- un professionnel non validé ne peut pas recevoir de réservation ;
- export/suppression démontrés ;
- aucun document sensible public.

## Phase 3 — Catalogue des prestations

Durée indicative : 2 à 3 semaines.

Objectifs :

- migrer services, zones, tarifs et professionnels statiques vers le catalogue ;
- prestations globales et offres spécifiques par professionnel ;
- durées, prix, frais de déplacement, statut actif et versionnement ;
- recherche et filtres réellement fonctionnels ;
- conservation des anciens libellés/prix dans les commandes historiques ;
- identifiants stables pour les quatre abonnements et trois packages publicitaires.

Critères de sortie :

- rendu existant inchangé à données équivalentes ;
- filtres testés et accessibles ;
- modification d’un tarif sans effet rétroactif ;
- aucun package supprimé ni renommé.

## Phase 4 — Calendrier et disponibilités

Durée indicative : 3 à 4 semaines.

Objectifs :

- règles récurrentes, exceptions, congés, durée et temps de trajet ;
- créneaux calculés selon prestation, zone et professionnel ;
- verrouillage temporaire et prévention atomique des doubles réservations ;
- fuseau horaire explicite (`Africa/Abidjan`) et stockage UTC ;
- agenda professionnel et vue disponibilité client.

Critères de sortie :

- tests de concurrence sur un même créneau ;
- aucun chevauchement accepté ;
- cas limites de fuseau/durée couverts ;
- performance de recherche de créneaux mesurée.

## Phase 5 — Réservation

Durée indicative : 4 à 6 semaines.

Objectifs :

- agrégat `booking`, lignes, affectation et journal d’événements ;
- choix professionnel/créneau/adresse et devis serveur ;
- machine à états contrôlée : brouillon, attente, proposée, acceptée, refusée, annulée, en route, arrivée, commencée, terminée, payée, remboursée, litige ;
- acceptation/refus par le professionnel et réaffectation ;
- annulation, frais et motifs ;
- historique client/professionnel/admin ;
- migration/liaison progressive des anciennes `orders`.

Critères de sortie :

- matrice des transitions et rôles testée ;
- création idempotente ;
- audit complet de chaque transition ;
- parcours E2E réservation/acceptation/annulation ;
- compatibilité des commandes existantes démontrée.

## Phase 6 — Paiement

Durée indicative : 3 à 5 semaines après sélection du PSP.

Objectifs :

- sélectionner un PSP compatible Côte d’Ivoire/mobile money après validation métier ;
- abstraction fournisseur, payment intent serveur et webhooks signés ;
- idempotence, rapprochement, remboursements partiels/complets ;
- commissions et ledger immuable ;
- prise en charge explicite du paiement en espèces ;
- transformer les abonnements existants en contrats versionnés sans casser les anciennes commandes ;
- états d’échec, reprise et support.

Critères de sortie :

- aucun statut « payé » fondé sur le navigateur ;
- tests sandbox des succès, refus, timeout, doublon et remboursement ;
- total réservation = lignes + déplacement + frais − remises ;
- rapprochement quotidien et alertes ;
- aucun numéro de carte stocké.

## Phase 7 — Géolocalisation

Durée indicative : 2 à 4 semaines.

Objectifs :

- adresses structurées et coordonnées géocodées ;
- PostGIS pour zones, distance et professionnels éligibles ;
- consentement, saisie manuelle et précision minimale nécessaire ;
- estimation distance/temps/frais ;
- partage temporaire de position pendant le déplacement seulement ;
- purge ou réduction de précision après prestation.

Critères de sortie :

- réservation possible sans permission GPS via adresse manuelle ;
- contrôle serveur de la zone couverte ;
- règles de rétention automatiques ;
- aucun historique de position permanent non justifié.

## Phase 8 — Notifications

Durée indicative : 2 à 3 semaines.

Objectifs :

- outbox transactionnelle, SQS, worker, retries et dead-letter queue ;
- templates versionnés email/SMS/WhatsApp/push ;
- préférences et consentements ;
- rappels et notifications pilotés par événements ;
- suivi des tentatives, coûts et erreurs ;
- polling ou SSE pour le statut ; WebSocket uniquement si nécessaire.

Critères de sortie :

- aucune perte entre transaction et notification ;
- doublons tolérés par idempotence ;
- endpoint fournisseur non public ;
- tableau de suivi et alertes sur échecs.

## Phase 9 — Administration

Durée indicative : 3 à 5 semaines.

Objectifs :

- validation professionnelle, documents et historique des décisions ;
- gestion utilisateurs, prestations, zones, prix, promotions et abonnements ;
- réservation, affectation manuelle et support ;
- paiements, commissions, remboursements et rapprochement ;
- litiges, preuves, décisions et SLA ;
- statistiques fondées sur paiements réels ;
- permissions fines, MFA et audit exportable.

Critères de sortie :

- moindre privilège testé par rôle ;
- toute action sensible est journalisée ;
- double validation pour remboursement/commission selon seuil ;
- données personnelles masquées par défaut.

## Phase 10 — Tests

Durée indicative : 3 à 4 semaines initiales, puis continu.

Objectifs :

- pyramide de tests : domaine, intégration PostgreSQL, API, composants, E2E ;
- contrats des fournisseurs et webhooks ;
- concurrence créneaux/paiements ;
- accessibilité WCAG 2.2 AA, responsive et navigateurs ;
- charge sur recherche, réservation et temps réel ;
- sécurité : SAST, dépendances, secrets, DAST ciblé ;
- non-régression visuelle et fonctionnelle des packages existants ;
- plan de reprise et chaos ciblé sur notifications/paiements.

Critères de sortie :

- scénarios critiques E2E verts ;
- aucune vulnérabilité critique/haute non arbitrée ;
- objectifs de performance et disponibilité atteints ;
- restauration et reprise testées.

## Phase 11 — Préparation AWS

Durée indicative : 3 à 5 semaines.

Objectifs :

- Infrastructure as Code pour comptes/environnements, réseau, compute, RDS, S3, SQS, secrets et observabilité ;
- séparation dev/staging/prod ;
- RDS privé, chiffrement KMS, PITR, rotation et tests de restauration ;
- App Runner ou ECS Fargate selon besoins, CloudFront/ALB, WAF et TLS ;
- IAM moindre privilège, budgets et alertes de coûts ;
- déploiements immuables, migrations contrôlées et rollback ;
- runbooks, SLO/SLI, alertes et astreinte.

Critères de sortie :

- environnement staging recréable par IaC ;
- aucune clé longue durée dans CI ;
- test de charge et test de restauration en staging ;
- revue sécurité et coûts signée.

## Phase 12 — Mise en production

Durée indicative : 1 à 2 semaines de préparation, puis hypercare.

Objectifs :

- migration répétée et chronométrée ;
- checklist go/no-go, responsabilités et canal incident ;
- sauvegarde vérifiée, rollback applicatif et DB ;
- pilote géographique/professionnels limité, activation progressive ;
- monitoring technique, métier, fraude, paiement et notification ;
- support, politique de confidentialité, CGU/CGV et procédures RGPD publiés ;
- hypercare et revue post-lancement.

Critères de sortie :

- aucun bloquant de l’audit ouvert ;
- métriques et alertes opérationnelles ;
- support et gestion d’incident testés ;
- parcours complet réussi avec transaction et professionnel réels ;
- décision d’élargissement fondée sur les données du pilote.

## Jalons de décision

| Jalon | Décision attendue |
|---|---|
| Après phase 0 | Prototype suffisamment sûr pour poursuivre en environnement contrôlé. |
| Après phase 3 | Catalogue et packages rétrocompatibles ; design actuel alimenté par la base. |
| Après phase 5 | Marketplace de réservation fonctionnelle sans paiement en ligne obligatoire. |
| Après phase 6 | Choix du PSP et modèle de commission validés. |
| Après phase 10 | Go/no-go technique pour AWS staging. |
| Après phase 11 | Go/no-go production pilote. |

## Indicateurs de réussite

- 100 % des transitions de réservation autorisées et auditées ;
- 0 double réservation confirmée ;
- 0 notification fournisseur déclenchable anonymement ;
- 100 % des paiements rapprochés ou placés en exception ;
- taux de réussite création de réservation et paiement mesuré ;
- délais d’acceptation professionnel et d’arrivée mesurés ;
- couverture des scénarios critiques E2E ;
- délais d’export/suppression de données respectés ;
- tous les abonnements historiques et packages existants restent consultables.
