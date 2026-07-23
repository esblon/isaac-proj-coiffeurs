# ISAAC_COIF_001 — Administration et espace partenaire

## Périmètre livré

- dashboard administrateur protégé par session et liste d’emails autorisés ;
- traitement des demandes de coiffure avec statut, réponse et partenaire assigné ;
- traitement des candidatures partenaires : nouveau, en attente, validé ou refusé ;
- création manuelle d’un partenaire et invitation email valable 48 heures ;
- activation du compte partenaire par définition d’un mot de passe ;
- espace partenaire avec statut, historique, gains et paiements ;
- gestion des numéros de contact avec libellé et statut actif/inactif ;
- utilisation du premier numéro actif sur les liens et affichages publics ;
- historique des actions administratives ;
- migrations PostgreSQL additives et idempotentes.

## Règles

- les numéros sont désactivés plutôt que supprimés ;
- les invitations sont stockées sous forme de hash et expirent après 48 heures ;
- chaque partenaire possède son propre compte Better Auth ;
- les gains sont enregistrés en FCFA, sous forme d’écritures historisées ;
- toutes les mutations sensibles exigent une session administrateur.

## Limites de cette itération

- la réponse à une demande de coiffure est historisée dans le dashboard ; l’envoi
  automatique par SMS/WhatsApp dépendra d’un fournisseur de messagerie configuré ;
- les paiements restent déclaratifs et ne sont pas reliés à une passerelle de
  paiement ;
- la suppression physique des partenaires, contacts et historiques n’est pas
  exposée dans l’interface.
