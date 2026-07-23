# Environnement AWS BLON-ENTERPRISES

Inventaire vérifié en lecture seule le 23 juillet 2026 depuis le dépôt
`eblon-aws-infrastructure` et les API AWS. Aucun SecureString ni secret n’a été
lu.

## Organisation et accès

| Usage | Compte | Profil AWS CLI | Région |
|---|---:|---|---|
| Non-production | `273956034614` | `blon-nonprod` | Europe (Paris), `eu-west-3` |
| DNS et services partagés | `268140507002` | `blon-sharedservices` | Global / `eu-west-3` selon le service |

Les deux profils utilisent IAM Identity Center avec le rôle
`BLON-AdministratorAccess`. Le profil `default` local contient un jeton invalide
et ne doit pas être utilisé.

## Infrastructure NonProd déployée

- Stack CloudFormation : `blon-nonprod-core`, état `UPDATE_COMPLETE`.
- VPC : `vpc-0f43f7eca30f9dfc3`, CIDR `10.20.0.0/16`.
- Subnets publics :
  - `subnet-07b40aa858f93f8dd`, `eu-west-3a`, `10.20.10.0/24` ;
  - `subnet-06a6867d4ca7809ef`, `eu-west-3b`, `10.20.20.0/24`.
- Subnets privés :
  - `subnet-00890388b407d68a7`, `eu-west-3a`, `10.20.110.0/24` ;
  - `subnet-029d19f02a4b7dfd7`, `eu-west-3b`, `10.20.120.0/24`.
- Internet Gateway et route publique `0.0.0.0/0`.
- Aucun NAT Gateway ; les subnets privés n’ont pas de sortie Internet.
- Security Group web : `sg-071b467cd0e06bf6b`.
  - entrées publiques TCP 80 et 443 ;
  - aucune entrée SSH 22 ;
  - sortie IPv4 générale.
- EC2 : `i-039909a212713012b`, `t3.small`, Amazon Linux 2023.
  - nom : `blon-nonprod-app-01` ;
  - subnet public principal ;
  - IP privée `10.20.10.39` ;
  - Elastic IP `13.38.252.106` ;
  - SSM Agent en ligne ;
  - administration par Systems Manager, sans SSH.
- Volume racine EBS gp3 chiffré de 30 Gio selon le template.
- Docker et Docker Compose gérés par State Manager.
- Démarrage EC2 quotidien à 07:00 et arrêt à 00:00, fuseau
  `Europe/Paris`, via EventBridge Scheduler.
- DLQ SQS dédiée aux planifications EC2.

Un VPC AWS par défaut `172.31.0.0/16` existe aussi dans le compte. Il ne fait
pas partie du socle BLON et ne doit pas être utilisé pour Coiffeurs225.

## Registre, paramètres et DNS

### ECR

Le dépôt existant est exclusivement destiné à la Bibliothèque :

```text
273956034614.dkr.ecr.eu-west-3.amazonaws.com/blon/eblon-bibliotheque
```

- tags immuables ;
- chiffrement AES256 ;
- conservation des dix images les plus récentes ;
- images runtime et migration AMD64 déjà présentes.

Coiffeurs225 doit obtenir son propre dépôt :

```text
blon/isaac-proj-coiffeurs
```

### Parameter Store

Paramètres SecureString existants, dont les valeurs n’ont pas été lues :

- `/blon/nonprod/bibliotheque/runtime/app-env` ;
- `/blon/uat/eblon-bibliotheque/resend-api-key`.

Convention proposée pour Coiffeurs225 :

```text
/blon/nonprod/coiffeurs225/runtime/app-env
```

À terme, les secrets individuels peuvent être séparés dans Secrets Manager.

### Route 53

- Zone publique : `blon-enterprises.com`.
- Compte propriétaire : `BLON-SharedServices`.
- Profil : `blon-sharedservices`.
- Enregistrement applicatif existant :
  `uat.biblio.blon-enterprises.com`.
- Enregistrements email présents sous `notifications.blon-enterprises.com`.

Nom UAT recommandé, à valider avant création :

```text
uat.coiffeurs.blon-enterprises.com
```

Aucun certificat ACM n’est actuellement présent dans `eu-west-3` dans les
comptes NonProd ou SharedServices.

## Ressources absentes

L’environnement ne possède pas encore les composants nécessaires à une
architecture AWS cible complète pour Coiffeurs225 :

- dépôt ECR Coiffeurs225 ;
- RDS PostgreSQL ;
- Application Load Balancer ;
- certificat ACM ;
- CloudFront ;
- WAF ;
- NAT Gateway ou VPC endpoints pour workloads privés ;
- CloudWatch Agent et tableaux de bord applicatifs ;
- stockage S3 applicatif ;
- environnement de production.

## Décision d’intégration retenue

Pour l’UAT initial, Coiffeurs225 partage la même EC2 `t3.small` que la
Bibliothèque. La charge attendue est limitée à trois testeurs, généralement non
simultanés. Aucun RDS ni seconde EC2 n’est ajouté à ce stade.

Les composants mutualisés sont :

- l’EC2 et son volume EBS ;
- le moteur/conteneur PostgreSQL ;
- Caddy et les ports publics 80/443 ;
- le VPC, l’Elastic IP, SSM et les horaires NonProd.

Les composants isolés par application sont :

- dépôt ECR et images ;
- base logique PostgreSQL ;
- rôle PostgreSQL ;
- migrations ;
- configuration runtime SecureString ;
- répertoire de déploiement et service Docker Compose ;
- domaine et routage Caddy ;
- volumes applicatifs si nécessaires.

### Décision PostgreSQL

Créer une **deuxième base logique** dans le même serveur/conteneur PostgreSQL :

```text
Base Bibliothèque existante   → inchangée
Base Coiffeurs225             → coiffeurs225
Rôle propriétaire dédié       → coiffeurs225_app
```

Ne pas renommer la base existante en `eblonenterprise` et ne pas utiliser une
base commune séparée uniquement par schémas pour l’UAT. Cette option :

- couplerait les cycles de migration des applications ;
- augmenterait le rayon d’impact d’une erreur de permission ou de migration ;
- compliquerait Better Auth et les tables applicatives aux noms génériques ;
- imposerait une migration risquée de la Bibliothèque sans bénéfice immédiat ;
- rendrait plus difficile une future extraction vers RDS.

Deux bases logiques dans le même moteur ont pratiquement le même coût de
ressources que deux schémas, tout en offrant une meilleure isolation et une
migration future plus simple.

### Capacité

La mutualisation doit être accompagnée de limites Docker revues. Les limites
actuelles de la Bibliothèque consomment déjà une part importante des 2 Gio
environ d’une `t3.small`. Avant de démarrer Coiffeurs225 :

- mesurer la mémoire réellement disponible ;
- réduire ou rééquilibrer les limites des services UAT ;
- ajouter un fichier swap uniquement si la politique d’exploitation l’accepte ;
- surveiller mémoire, disque et redémarrages OOM ;
- conserver un seuil d’arrêt si la mémoire disponible devient insuffisante.

## Commandes de vérification

Connexion et identité :

```powershell
aws sso login --profile blon-nonprod
aws sts get-caller-identity `
  --profile blon-nonprod `
  --region eu-west-3

aws sso login --profile blon-sharedservices
aws sts get-caller-identity `
  --profile blon-sharedservices `
  --region eu-west-3
```

Stack et sorties :

```powershell
aws cloudformation describe-stacks `
  --stack-name blon-nonprod-core `
  --query "Stacks[0].{Status:StackStatus,Outputs:Outputs}" `
  --profile blon-nonprod `
  --region eu-west-3 `
  --no-cli-pager
```

État SSM de l’instance :

```powershell
aws ssm describe-instance-information `
  --filters "Key=InstanceIds,Values=i-039909a212713012b" `
  --profile blon-nonprod `
  --region eu-west-3 `
  --no-cli-pager
```

Ces commandes sont en lecture seule. Ne jamais appeler `ssm get-parameter
--with-decryption` pour réaliser un inventaire.

## Next step — étendre l’UAT mutualisé

1. Valider le sous-domaine `uat.coiffeurs.blon-enterprises.com`.
2. Ajouter au template existant l’ECR `blon/isaac-proj-coiffeurs` et les
   permissions de pull strictement nécessaires.
3. Étendre le déploiement Compose avec le service Coiffeurs225, sans créer un
   second PostgreSQL.
4. Créer de façon idempotente la base `coiffeurs225` et son rôle propriétaire
   depuis une procédure d’initialisation sécurisée.
5. Ajouter `/blon/nonprod/coiffeurs225/runtime/app-env` sans valeur secrète dans
   Git.
6. Ajouter le virtual host Caddy du sous-domaine Coiffeurs225.
7. Mesurer la capacité, construire les images, produire un Change Set et le
   relire avant exécution.
