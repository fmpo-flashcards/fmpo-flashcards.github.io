# FMPO Flashcards — Guide de mise en ligne

App de flashcards pour la Faculté de Médecine et de Pharmacie d'Oujda.
**409 sujets · 11 936 flashcards** — 6 disciplines, plan de révision 32 semaines.
Site : https://fmpo-flashcards.github.io/ (GitHub Pages, repo `fmpo-flashcards/fmpo-flashcards.github.io`)

Architecture : flashcards uniquement (pas de QCM), un seul palier Pro **100 DH à vie**
(`proTier: 'full'`), parrainage **15 DH** par vente, inscription email + mot de passe,
comptes démo = 5 premières cartes par sujet, fallback auth 8 s.

```
fmpo-full/
├── index.html / styles.css / js/      → l'application
├── firebase-config.js                → config du projet fmpo-flashcards (⚠️ PLACEHOLDER, voir étape 1)
├── index.json + disc-0..5.json       → index + 6 fichiers disciplines
├── topics-index.json / plan.json     → index des sujets / plan 32 semaines
├── icon-192.png / icon-512.png / manifest.json / sw.js → PWA + offline
├── firestore.rules                    → règles de sécurité (à publier)
└── hidden_files/sources/              → sources (PDFs, scripts de build) — NE PAS déployer
```

## Étape 1 — Créer le projet Firebase

1. Console Firebase → *Add project* → nomme-le `fmpo-flashcards` (désactive Google Analytics).
2. **Build → Authentication → Get started** → active **Email/Password**.
   (Pas de Google sign-in dans cette app : email + mot de passe uniquement.)
3. **Build → Firestore Database → Create database** → mode **production** → région `europe-west1`.
4. **Project Overview → Add app → Web** (`</>`) → nickname `fmpo-web` →
   copier la config et remplacer les valeurs `TODO-*` dans `firebase-config.js`.
5. **Authentication → Settings → Authorized domains** → ajouter `fmpo-flashcards.github.io`.
6. Publier les règles : copier `firestore.rules` dans **Firestore → Rules → Publish**.
   Vérifier que l'email admin est `anzajewls@gmail.com` (cf. `firebase-config.js`).

## Étape 2 — Déployer sur GitHub Pages

1. Créer l'org/repo GitHub `fmpo-flashcards/fmpo-flashcards.github.io`.
2. Pousser le contenu de `fmpo-full/` **sans** `hidden_files/` (sources + scripts, ~146 Mo de PDFs)
   et sans `.git`. Exemple :
   ```bash
   cd ~/workspace/fmpo-full
   rsync -a --exclude hidden_files/ --exclude .git/ ./ /tmp/fmpo-deploy/
   cd /tmp/fmpo-deploy && git init && git add -A && git commit -m "FMPO flashcards app"
   git remote add origin git@github.com:fmpo-flashcards/fmpo-flashcards.github.io.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages** → Source : *Deploy from a branch* → `main` / `/ (root)`.
4. Vérifier https://fmpo-flashcards.github.io/ : inscription, connexion, cartes, plan, classement.

## Étape 3 — Vérifications après déploiement

- Inscription email + mot de passe → profil créé dans Firestore (`users/{uid}`, démo).
- Compte démo : 5 premières cartes par sujet seulement ; compte Pro : toutes les cartes.
- Plan 32 semaines visible ; classement ; parrainage (lien `?ref=CODE`, +15 DH par vente Pro).
- Service worker : `sw.js` (cache `fmpo-v1`) — incrémenter `CACHE` à chaque changement
  de stratégie ou de fichiers de données.

## Régénérer le contenu (si les PDFs changent)

Les scripts vivent dans `hidden_files/sources/` (non déployés) :
```bash
cd hidden_files/sources
python3 split_sections.py   # découpe les 6 PDFs en 409 sections (1 par sujet)
python3 verify_grounding.py # vérifie que chaque section contient les termes du sujet (doit être 0 échec)
python3 build_data.py       # génère disc-0..5.json, topics-index.json, index.json, plan.json
```

Règle d'or : **toutes les cartes proviennent du texte des PDFs**. Aucune carte écrite
à partir de connaissances générales. Un sujet sans passage correspondant dans les PDFs
doit être signalé comme NON ANCRÉ, jamais complété par invention.
