# Comment est votre blanquette

Une application web pour mieux manger au fil des saisons et comprendre les produits alimentaires du quotidien.

## Fonctionnalités

- sélection de fruits et légumes de saison avec recherche instantanée ;
- interface responsive pensée pour mobile ;
- scanner via caméra avec `BarcodeDetector` lorsque le navigateur le supporte ;
- saisie manuelle de code-barres en solution de secours ;
- recherche des informations produit via l'API Open Food Facts.

## Développement

```bash
npm install
npm run dev
```

Le build de production est généré dans `dist/` avec `npm run build`.

## Déploiement GitHub Pages

Le workflow dans `.github/workflows/deploy.yml` publie automatiquement le dossier `dist/` à chaque push sur `main`. Dans les paramètres du dépôt GitHub, sélectionner **Pages > GitHub Actions** comme source.