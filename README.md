# Airbnb Clone - Architecture Full-Stack (.NET 8 & React)

Clone Airbnb moderne, sécurisé et performant développé selon les meilleures pratiques d'ingénierie logicielle.

---

## 1. Pile Technique

- **Backend :** .NET 8 (C#) avec serveur **Hot Chocolate GraphQL** (projections, tris, filtrages, autorisation par attributs).
- **Base de données :** Microsoft SQL Server via **Entity Framework Core Code-First** avec `IDbContextFactory` pour une exécution multi-thread sans blocage de requêtes GraphQL.
- **Cache :** Redis 7 (via `StackExchange.Redis`) avec sérialisation JSON automatique et tolérance aux pannes (mode fallback gracieux si Redis est éteint).
- **Médias :** Cloudinary SDK (service intégré prêt pour la Phase 2).
- **Authentification & Sécurité :** JWT Bearer Tokens, hachage robuste des mots de passe avec **BCrypt**, gestion des rôles (`Guest` et `Host`).
- **Frontend :** React 18, Vite, TypeScript strict, Tailwind CSS (charte graphique officielle Airbnb `#FF385C`), icônes Lucide React.
- **Client GraphQL :** Apollo Client avec middleware d'autorisation automatique pour injecter les tokens Bearer.

---

## 2. Structure du Projet

```
AirBnB-clone/
├── backend/
│   └── AirbnbClone.Api/
│       ├── Models/            # Entités (User, Listing, ListingImage, Review, Booking)
│       ├── Data/              # AppDbContext & DbInitializer (Seed avec 8 annonces d'exception)
│       ├── Services/          # AuthService (JWT & BCrypt), RedisCacheService, CloudinaryService
│       ├── GraphQL/
│       │   ├── Common/        # AuthPayload, LoginInput, RegisterInput, CreateListingInput
│       │   ├── Queries/       # Query (GetListings, GetListingById, GetMe, GetUsers)
│       │   ├── Mutations/     # Mutation (Register, Login, SwitchToHostRole, CreateListing)
│       │   └── Types/         # ListingType, UserType, ReviewType, ListingImageType
│       ├── appsettings.json   # Chaînes de connexion & configurations JWT/Redis
│       └── Program.cs         # Configuration DI, pipeline HTTP & serveur GraphQL
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, SearchBar, UserMenu, CategoryFilter, ListingCard, ListingGrid, DetailModal, AuthModal
│   │   ├── context/           # AuthContext (gestion session utilisateur)
│   │   ├── graphql/           # apolloClient, queries.ts, mutations.ts
│   │   ├── types/             # Interfaces TypeScript
│   │   ├── App.tsx            # Composant principal
│   │   └── main.tsx           # Point d'entrée React
│   ├── tailwind.config.js     # Tokens design Airbnb
│   └── package.json
└── docker-compose.yml         # Conteneur Redis
```

---

## 3. Démarrage Rapide

### Prérequis
- [.NET 8 SDK ou version ultérieure](https://dotnet.microsoft.com/download)
- [Node.js (>= 18)](https://nodejs.org/)
- [Docker](https://www.docker.com/) (pour Redis)
- SQL Server LocalDB ou SQL Server Express (fourni nativement sur Windows)

### Étape 1 : Démarrer le Cache Redis
```powershell
docker compose up -d redis
```

### Étape 2 : Lancer le Backend .NET GraphQL
```powershell
cd backend/AirbnbClone.Api
dotnet run
```
*Le serveur API démarre sur `http://localhost:5193` et l'IDE GraphQL (Banana Cake Pop) est accessible sur `http://localhost:5193/graphql`.*
*La base de données `AirbnbCloneDb` est automatiquement créée et alimentée avec 8 logements de prestige et 2 comptes de test.*

### Étape 3 : Lancer le Frontend React
Dans un second terminal :
```powershell
cd frontend
npm install
npm run dev
```
*Le frontend démarre sur `http://localhost:5173`.*

---

## 4. Comptes de Démonstration (Test Prédéfini)

Vous pouvez vous connecter en 1 clic grâce aux boutons démo dans le modal d'authentification :

| Rôle | E-mail | Mot de passe | Description |
| :--- | :--- | :--- | :--- |
| **Hôte (Superhôte)** | `host@airbnb.com` | `Airbnb123!` | Compte de Sophie Dubois, gestionnaire des villas de luxe |
| **Voyageur (Guest)** | `guest@airbnb.com` | `Airbnb123!` | Compte d'Alexandre Martin, explorateur |

---

## 5. Fonctionnalités Implémentées (Phase 1)

- [x] Architecture modulaire .NET 8 + Hot Chocolate GraphQL.
- [x] Modèles relationnels Code-First (Users, Listings, Images, Reviews, Bookings).
- [x] Seeding automatique avec des photos réelles haute définition Unsplash.
- [x] Authentification complète JWT avec chiffrement BCrypt et protection des résolveurs `@me`.
- [x] Cache de données Redis avec reconnexion automatique et fallback transparent.
- [x] Frontend React ultra-fidèle au design Airbnb (couleur `#FF385C`, coins arrondis, police Inter).
- [x] Barre de navigation avec recherche par capsule et filtrage interactif par ville.
- [x] Barre de défilement horizontal des catégories avec icônes Lucide.
- [x] Grille responsive et cartes de logements avec carrousel d'images fluide, indicateurs à points et cœur de favori.
- [x] Modal d'inspection détaillée de logement avec calcul du prix du séjour.
- [x] Modal d'authentification (Connexion & Inscription) avec connexion démo en 1 clic.
