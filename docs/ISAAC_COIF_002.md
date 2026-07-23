# ISAAC_COIF_002 — secteurs et disponibilités

## Livré

- Recherche publique des partenaires actifs par secteur.
- Affichage des prochains créneaux disponibles.
- Gestion autonome des créneaux depuis l'espace partenaire.
- Refus des créneaux passés, invalides, supérieurs à douze heures ou qui se chevauchent.
- Vue administrateur de tous les agendas partenaires.
- Secteur obligatoire à la création d'un nouveau partenaire.

## Modèle de données

La migration `0003_isaac_coif_002.sql` ajoute le secteur au partenaire et une
table de créneaux datés. Les statuts prévus sont `disponible`, `reserve` et
`indisponible`. Ce modèle reste volontairement simple : il prépare la
réservation sans ajouter de service externe ni de nouvelle infrastructure.

## Compatibilité

Les partenaires existants conservent un secteur nullable. L'administrateur les
voit comme « secteur non renseigné » jusqu'à régularisation. Les packages,
commandes, invitations et historiques existants ne sont pas modifiés.
