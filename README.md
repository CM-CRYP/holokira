# HoloKira

Site vitrine React/Vite pour présenter et réserver des cartes Pokémon, avec
catalogue, panier de réservations, message vendeur, traduction FR/EN et panel
admin.

## Fonctionnement

Le site ne prend aucun paiement en ligne et n'envoie pas d'e-mail. Le client
ajoute une ou plusieurs cartes à ses réservations, clique sur `Je réserve`,
renseigne ses coordonnées et ajoute un message pour le vendeur.

La réservation est enregistrée dans Supabase, la carte passe en `Réservée`, et
la demande apparaît dans le panel admin du site.

Le panel admin permet aussi de passer une carte en `Disponible`, `Réservée` ou
`Vendue`, de remettre une réservation en vente, d'ajouter une note privée, et
de gérer une durée de réservation temporaire.

## Admin sécurisé

Le panel admin utilise Supabase Auth. Il n'y a plus de code admin public dans le
site.

Dans Supabase :

1. Ouvre `Authentication`.
2. Va dans `Users`.
3. Clique sur `Add user`.
4. Crée ton compte administrateur avec ton e-mail et un mot de passe fort.

Ensuite, sur le site, ouvre `Admin` et connecte-toi avec ce compte. Les
réservations et les actions admin ne sont visibles qu'après connexion.

## Supabase

Le fichier [supabase-schema.sql](./supabase-schema.sql) contient les tables,
policies et triggers nécessaires : cartes, statuts, images, défauts visibles,
réservations, lignes de réservation, notes privées, demandes de rachat et
paramètres du site.

Dans Supabase, ouvre `SQL Editor`, colle le fichier complet, puis clique sur
`Run`.

Important : relance ce fichier après chaque changement de sécurité. Les clients
peuvent lire les cartes et créer une réservation, mais seul un compte connecté
avec Supabase Auth peut ajouter, modifier ou supprimer les cartes et consulter
les réservations.

Le schéma ajoute aussi la fonction `create_reservation`. Elle enregistre la
réservation et ses cartes dans une seule opération : si une carte n'est plus
disponible, la demande est refusée proprement au lieu de créer une réservation
incomplète.

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
npm run build
```
