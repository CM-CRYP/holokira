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

## Admin local

Le code admin de départ est `1234`. Il est modifiable dans l'onglet
`Paramètres` du panel admin.

## Supabase

Le fichier [supabase-schema.sql](./supabase-schema.sql) contient les tables et
policies nécessaires : cartes, statuts, images, défauts visibles, réservations,
lignes de réservation, notes privées, demandes de rachat et paramètres du site.

Dans Supabase, ouvre `SQL Editor`, colle le fichier complet, puis clique sur
`Run`.

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
