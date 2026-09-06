# HoloKira

Site vitrine React/Vite pour présenter et réserver des cartes Pokémon, avec
catalogue, panier de réservations, message vendeur, traduction FR/EN et panel
admin.

## Fonctionnement

Le site ne prend aucun paiement en ligne et n'envoie pas d'e-mail. Le client
ajoute une ou plusieurs cartes à ses réservations, clique sur `Je réserve`,
renseigne ses coordonnées et ajoute un message pour le vendeur.

La réservation est enregistrée dans Supabase et la quantité demandée est retirée
du stock disponible. Les exemplaires restants restent réservables. Quand il ne
reste plus aucun exemplaire libre, la carte passe en `Réservée`. La demande
apparaît dans le panel admin du site.

Le panel admin permet aussi de passer une carte en `Disponible`, `Réservée` ou
`Vendue`, de remettre une réservation en vente, d'ajouter une note privée, et
de gérer une durée de réservation temporaire.

## Admin sécurisé

Le panel admin utilise Supabase Auth et une liste d'autorisation RLS. Une simple
session Supabase ne suffit pas : seul l'utilisateur Auth lié à
`holokira@gmail.com` est autorisé à ouvrir le panel et à modifier les données.

Dans Supabase :

1. Ouvre `Authentication`, puis `Users`.
2. Clique sur `Add user`.
3. Crée le compte `holokira@gmail.com` avec un mot de passe fort.
4. Dans les réglages Auth, désactive les nouvelles inscriptions publiques.
5. Ouvre `SQL Editor`.
6. Colle la totalité de `supabase-schema.sql`, puis clique sur `Run`.

Le compte Auth doit exister avant d'exécuter le SQL. Si tu l'as créé après,
relance simplement le même fichier : aucune carte ni réservation ne sera
supprimée.

Le script protège également les notes privées dans une table séparée, refuse
les écritures de cartes par les visiteurs et limite l'upload d'images au seul
administrateur autorisé.

## Supabase

Le fichier [supabase-schema.sql](./supabase-schema.sql) contient les tables,
policies et triggers nécessaires : cartes, statuts, images, défauts visibles,
réservations, lignes de réservation, notes privées, demandes de rachat et
paramètres du site.

Dans Supabase, ouvre `SQL Editor`, colle le fichier complet, puis clique sur
`Run`.

Important : relance ce fichier après chaque changement de sécurité. Les clients
peuvent lire les cartes et appeler la fonction contrôlée de réservation, mais
seul le compte administrateur autorisé peut ajouter, modifier ou supprimer les
cartes et consulter les réservations.

Le schéma ajoute aussi la fonction `create_reservation`. Elle enregistre la
réservation et ses cartes dans une seule opération : si une carte n'est plus
disponible, la demande est refusée proprement au lieu de créer une réservation
incomplète.

Les cartes utilisent aussi des champs de merchandising gérés depuis l'admin :
`badge`, `tags` et `added_at`. Relance le SQL après cette mise à jour pour que
les badges, tags et dates d'ajout soient synchronisés avec Supabase.

Variables nécessaires côté site :

```env
VITE_SUPABASE_URL=https://ton-projet.supabase.co
VITE_SUPABASE_ANON_KEY=ta_cle_anon_public
```

## Cloudflare Pages

Réglages de build :

```txt
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

Ajoute ensuite les variables d'environnement dans Cloudflare Pages :

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Ne mets jamais la clé `service_role` ou `secret` dans Cloudflare Pages. Le site
public doit uniquement recevoir la clé `anon public`.

## Lancer en local

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5175
```

Ouvre ensuite `http://127.0.0.1:5175`.

## Commandes utiles

```bash
npm run lint
npm test
npm run build
```

## Reprise et corrections — septembre 2026

La version précédente avait plusieurs parcours seulement partiellement reliés à
la base. Cette reprise corrige les points suivants :

- **Paramètres partagés** : les textes FR/EN, le thème et les coordonnées se
  sauvegardent explicitement depuis l’admin. Les visiteurs lisent une projection
  limitée aux réglages publics, sans accès direct à `site_settings`.
- **Demandes réelles** : aucun succès ni blocage local du stock n’est simulé si
  Supabase est absent ou refuse une réservation ou une demande de rachat.
  Les formulaires valident les coordonnées, bloquent les doubles clics et
  conservent leur contenu en cas d’échec.
- **Confidentialité** : les dossiers admin restent en mémoire pendant la session.
  Les anciens caches locaux de réservations et de rachats sont supprimés. Les
  visiteurs ne conservent que leurs reçus sur cet appareil, sans coordonnées,
  message client, note privée ou historique admin. Ces reçus ne sont pas un suivi
  en temps réel : le vendeur confirme le statut par e-mail.
- **Stock** : annuler ou expirer une réservation restitue sa quantité une seule
  fois. Le nouveau statut `Terminée` clôture une vente sans doubler la déduction
  et l’exclut de l’expiration. Une vente terminée ne se réactive pas.
- **Produits** : `admin_save_cards` enregistre les fiches modifiées et leurs notes
  privées dans une transaction. Une version périmée est refusée plutôt que
  d’écraser une réservation récente. Les suppressions échouées restent visibles ;
  les cartes liées à l’historique des réservations doivent être conservées.
- **Navigation** : liens mal encodés et fiches absentes gérés, état de catalogue
  indisponible, filtres sans résultat, labels de champs et focus clavier.
- **Livraison** : le total de réservation est clairement présenté hors frais
  d’envoi, à confirmer avec le vendeur.

### Mise à jour du site existant

1. Exécuter la nouvelle version complète de `supabase-schema.sql` dans le projet
   Supabase existant **avant** de publier le nouveau frontend. Le fichier est
   transactionnel et réexécutable ; il conserve les cartes, réservations et notes.
   Il ajoute `updated_at`, `admin_save_cards`, `get_public_site_settings` et
   met à jour les fonctions de réservation. `create_reservation` renvoie désormais
   le montant et la durée réellement enregistrés ; l’ancien frontend peut ignorer
   ce résultat pendant la transition.
2. Conserver les deux variables Supabase publiques et renseigner `VITE_SITE_URL`
   avec l’origine réelle. Le générateur de sitemap lit aussi `.env.production` et
   génère `robots.txt` avec la même origine.
3. Exécuter `npm ci`, `npm run lint`, `npm test` et `npm run build`.
4. Publier `dist` sur l’hébergement existant. La configuration `wrangler.jsonc`
   reprend le nom `holokira` de la dernière proposition Cloudflare du dépôt et
   définit le dossier `dist` ainsi que le fallback SPA. Si le site actuel est le
   Worker `holokira2`, conserver ce nom avec `npx wrangler deploy --name holokira2`.
   Pour Cloudflare Pages, `public/_redirects` assure l’ouverture directe des fiches.
   Référence : [routage SPA Cloudflare](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/).
5. Depuis l’admin, enregistrer les réglages voulus puis vérifier le résultat dans
   une session visiteur distincte. En cas de conflit produit, le bouton d’annulation
   abandonne le brouillon après confirmation et recharge le catalogue.

### Vérifications et limites

`npm test` exécute la validation des formulaires et des données locales ainsi que
le schéma complet dans un PostgreSQL isolé via PGlite. Les tests couvrent les
règles d’accès, l’installation répétée, la réservation de plusieurs exemplaires,
le prix/délai côté serveur, l’annulation, l’expiration, la clôture des ventes,
le rollback d’une demande incomplète, les conflits de sauvegarde et les liens
privés de recherche Japon. Seuls les schémas de plateforme Auth/Storage de
Supabase sont simulés ; les fonctions SQL applicatives sont utilisées telles quelles.

Ces tests ne remplacent pas une vérification sur le projet Supabase réel, des
uploads de photos, de l’authentification et du rendu mobile/desktop dans un
navigateur. Aucun paiement ou envoi automatique d’e-mail n’est intégré, conformément
au fonctionnement de réservation déjà prévu. Les informations légales de
l’éditeur et les conditions spécifiques restent à compléter par le propriétaire.
