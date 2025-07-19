# Top Dog Arena - Project Directory Structure

## Overview
This document outlines the complete directory structure for the Top Dog Arena project, including backend services, frontend applications, and supporting infrastructure.

## Root Directory Structure

```
Top Dog Arena/
├── Administration/
│   ├── Company_Info.txt
│   ├── project-roadmap.md
│   ├── technical-specs.md
│   └── deployment-guide.md
├── Client Communications/
│   ├── meeting-notes/
│   ├── requirements/
│   └── feedback/
├── Credentials/
│   ├── Email_Accounts.txt
│   ├── Social_Media_Platforms.txt
│   ├── api-keys.env.example
│   └── blockchain-wallets.txt
├── Database/
│   ├── schema.sql
│   ├── migrations/
│   │   ├── 202507191201_create_players_table.up.sql
│   │   ├── 202507191201_create_players_table.down.sql
│   │   ├── 202507191202_create_nfts_table.up.sql
│   │   ├── 202507191202_create_nfts_table.down.sql
│   │   ├── 202507191203_create_battles_table.up.sql
│   │   └── 202507191203_create_battles_table.down.sql
│   ├── seeds/
│   │   ├── players.sql
│   │   ├── nfts.sql
│   │   └── battles.sql
│   └── README.md
├── Projects/
│   ├── td-player-ui/                # Current Angular Nx workspace
│   │   ├── projects/
│   │   │   ├── shell/               # Main shell application (port 4200)
│   │   │   │   ├── src/
│   │   │   │   │   ├── app/
│   │   │   │   │   │   ├── components/
│   │   │   │   │   │   │   ├── home.component.ts
│   │   │   │   │   │   │   ├── arena/
│   │   │   │   │   │   │   │   ├── arena-banner.component.ts
│   │   │   │   │   │   │   │   ├── battle-card.component.ts
│   │   │   │   │   │   │   │   ├── stats-panel.component.ts
│   │   │   │   │   │   │   │   └── call-to-action.component.ts
│   │   │   │   │   │   │   ├── settings/
│   │   │   │   │   │   │   ├── shared/
│   │   │   │   │   │   │   └── remote-wrapper.component.ts  # Wrapper for remote modules
│   │   │   │   │   │   ├── services/
│   │   │   │   │   │   │   ├── theme.service.ts
│   │   │   │   │   │   │   └── websocket.service.ts
│   │   │   │   │   │   └── interfaces/
│   │   │   │   │   └── assets/
│   │   │   │   │       └── images/
│   │   │   │   │           ├── battle-meme-king.svg
│   │   │   │   │           ├── battle-comedy-queen.svg
│   │   │   │   │           └── logo/
│   │   │   │   └── project.json
│   │   │   ├── nft-marketplace/     # NFT Marketplace micro-frontend (port 4202)
│   │   │   │   ├── src/
│   │   │   │   │   ├── app/
│   │   │   │   │   │   ├── components/
│   │   │   │   │   │   │   ├── nft-marketplace.component.ts
│   │   │   │   │   │   │   ├── nft-marketplace.component.html
│   │   │   │   │   │   │   ├── nft-marketplace.component.scss
│   │   │   │   │   │   │   ├── flippable-nft-card.component.ts
│   │   │   │   │   │   │   ├── nft-card.component.ts
│   │   │   │   │   │   │   ├── nft-grid.component.ts
│   │   │   │   │   │   │   ├── nft-detail-modal.component.ts
│   │   │   │   │   │   │   └── collection-card.component.ts
│   │   │   │   │   │   ├── services/
│   │   │   │   │   │   │   ├── nft-marketplace.service.ts
│   │   │   │   │   │   │   ├── blockchain.service.ts
│   │   │   │   │   │   │   └── ipfs.service.ts
│   │   │   │   │   │   ├── interfaces/
│   │   │   │   │   │   │   ├── nft.interface.ts
│   │   │   │   │   │   │   ├── collection.interface.ts
│   │   │   │   │   │   │   └── marketplace.interface.ts
│   │   │   │   │   │   └── pipes/
│   │   │   │   │   │       ├── price-format.pipe.ts
│   │   │   │   │   │       └── rarity-color.pipe.ts
│   │   │   │   │   └── assets/
│   │   │   │   │       └── images/
│   │   │   │   │           ├── big-dog-front.png
│   │   │   │   │           ├── big-dog-back.png
│   │   │   │   │           ├── nft-*.svg
│   │   │   │   │           └── collections/
│   │   │   │   └── project.json
│   │   │   └── playerLandingPage/   # Player UI (port 4201)
│   │   │       └── src/
│   │   ├── angular.json
│   │   ├── nx.json
│   │   ├── package.json
│   │   └── README.md
│   └── backend/                     # Backend services directory
│       ├── nft-service/             # Go service for XRPL mint/update
│       │   ├── cmd/
│       │   │   └── server/
│       │   │       └── main.go
│       │   ├── internal/
│       │   │   ├── handlers/
│       │   │   │   ├── mint.go
│       │   │   │   ├── update.go
│       │   │   │   ├── transfer.go
│       │   │   │   └── health.go
│       │   │   ├── services/
│       │   │   │   ├── nft.go
│       │   │   │   ├── xrpl.go
│       │   │   │   └── ipfs.go
│       │   │   ├── ws/
│       │   │   │   ├── server.go
│       │   │   │   ├── broadcaster.go
│       │   │   │   └── client.go
│       │   │   ├── models/
│       │   │   │   ├── nft.go
│       │   │   │   ├── player.go
│       │   │   │   └── transaction.go
│       │   │   └── utils/
│       │   │       ├── xrpl.go
│       │   │       ├── ipfs.go
│       │   │       └── crypto.go
│       │   ├── pkg/
│       │   ├── configs/
│       │   │   ├── config.yaml
│       │   │   └── docker.yaml
│       │   ├── go.mod
│       │   ├── go.sum
│       │   ├── Dockerfile
│       │   └── README.md
│       ├── metadata-engine/         # Node.js metadata generation
│       │   ├── src/
│       │   │   ├── index.js
│       │   │   ├── generators/
│       │   │   │   ├── nft-metadata.js
│       │   │   │   ├── battle-stats.js
│       │   │   │   └── player-cards.js
│       │   │   ├── utils/
│       │   │   │   ├── image-processing.js
│       │   │   │   ├── ipfs-upload.js
│       │   │   │   └── validation.js
│       │   │   └── templates/
│       │   │       ├── nft-template.json
│       │   │       └── metadata-schema.json
│       │   ├── package.json
│       │   ├── Dockerfile
│       │   └── README.md
│       ├── contest-engine/          # Go service for battle management
│       │   ├── cmd/
│       │   │   └── server/
│       │   │       └── main.go
│       │   ├── internal/
│       │   │   ├── handlers/
│       │   │   │   ├── battle.go
│       │   │   │   ├── vote.go
│       │   │   │   └── leaderboard.go
│       │   │   ├── services/
│       │   │   │   ├── contest.go
│       │   │   │   ├── voting.go
│       │   │   │   └── rewards.go
│       │   │   ├── ws/
│       │   │   │   ├── server.go
│       │   │   │   ├── broadcaster.go
│       │   │   │   └── rooms.go
│       │   │   └── models/
│       │   │       ├── battle.go
│       │   │       ├── vote.go
│       │   │       └── contest.go
│       │   ├── go.mod
│       │   ├── go.sum
│       │   ├── Dockerfile
│       │   └── README.md
│       ├── ai-service/              # Python AI/ML service
│       │   ├── src/
│       │   │   ├── app.py
│       │   │   ├── models/
│       │   │   │   ├── meme_analyzer.py
│       │   │   │   ├── battle_predictor.py
│       │   │   │   └── nft_generator.py
│       │   │   ├── utils/
│       │   │   │   ├── image_processing.py
│       │   │   │   ├── text_analysis.py
│       │   │   │   └── model_loader.py
│       │   │   └── api/
│       │   │       ├── routes.py
│       │   │       └── middleware.py
│       │   ├── requirements.txt
│       │   ├── Dockerfile
│       │   └── README.md
│       ├── api-gateway/             # API Gateway and routing
│       │   ├── configs/
│       │   │   ├── nginx.conf
│       │   │   ├── ssl/
│       │   │   └── rate-limiting.conf
│       │   ├── middleware/
│       │   │   ├── auth.conf
│       │   │   ├── cors.conf
│       │   │   └── logging.conf
│       │   ├── Dockerfile
│       │   └── README.md
│       └── shared/                  # Shared utilities and configs
│           ├── proto/               # Protocol Buffers definitions
│           │   ├── nft.proto
│           │   ├── battle.proto
│           │   └── player.proto
│           ├── configs/
│           │   ├── development.env
│           │   ├── staging.env
│           │   └── production.env
│           └── scripts/
│               ├── setup.sh
│               ├── deploy.sh
│               └── backup.sh
├── Resources/
│   ├── nft-images/
│   │   ├── big-dog/
│   │   │   ├── big-dog-front.png
│   │   │   └── big-dog-back.png
│   │   ├── characters/
│   │   │   ├── rex-slugger/
│   │   │   ├── bella-lightning/
│   │   │   ├── max-ace/
│   │   │   ├── luna-wall/
│   │   │   ├── buddy-hr/
│   │   │   ├── sadie-glove/
│   │   │   ├── charlie-rookie/
│   │   │   └── zeus-legend/
│   │   └── collections/
│   │       ├── champions/
│   │       └── cyber-warriors/
│   ├── branding/
│   │   ├── logos/
│   │   ├── colors.md
│   │   └── style-guide.md
│   ├── documentation/
│   │   ├── AUTHENTICATION_GUIDE.md    # Complete NFT-backed card auth strategy
│   │   ├── api-specs/
│   │   ├── user-guides/
│   │   └── technical-docs/
│   └── mockups/
│       ├── ui-designs/
│       └── wireframes/
├── Infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.dev.yml
│   │   ├── docker-compose.prod.yml
│   │   └── .env.example
│   ├── kubernetes/
│   │   ├── deployments/
│   │   ├── services/
│   │   ├── ingress/
│   │   └── configmaps/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── scripts/
│       ├── build.sh
│       ├── deploy.sh
│       └── monitor.sh
├── td-nft-cards/                    # NFT card generation tools
│   ├── generators/
│   ├── templates/
│   └── output/
├── .gitignore
├── .env.example
├── README.md
├── PROJECT_STRUCTURE.md             # This file
└── GETTING_STARTED.md
```

## Service Architecture

### Frontend Services
- **Shell Application** (Port 4200): Main Top Dog Arena interface and module federation host
- **Player Landing Page** (Port 4201): Dedicated player management interface
- **NFT Marketplace** (Port 4202): Standalone NFT marketplace micro-frontend with Big Dog showcase

### Backend Services
- **NFT Service** (Port 8080): XRPL blockchain integration, minting, transfers
- **Metadata Engine** (Port 8081): Dynamic NFT metadata generation
- **Contest Engine** (Port 8082): Battle management, voting, leaderboards
- **AI Service** (Port 8083): ML-powered meme analysis and NFT generation
- **API Gateway** (Port 80/443): Request routing, authentication, rate limiting

### Database Services
- **PostgreSQL** (Port 5432): Primary database
- **Redis** (Port 6379): Caching and session management
- **IPFS** (Port 5001): Decentralized file storage

## Micro-Frontend Architecture

### Module Federation Setup
The Top Dog Arena uses Angular Module Federation to create a micro-frontend architecture:

- **Shell Application (Host)**: Main container that loads remote modules
- **NFT Marketplace (Remote)**: Independent NFT marketplace module 
- **Player Landing Page (Remote)**: Player management interface

### Remote Module Communication
- **Shared State**: Redux/NgRx for cross-module state management
- **Event Bus**: Custom event system for module-to-module communication
- **Shared Services**: Common services exposed through the shell
- **Theme Consistency**: Shared theme service ensures consistent styling

### Development Workflow
1. Each micro-frontend runs independently during development
2. Shell application loads remotes via module federation
3. Hot module replacement works across all modules
4. Independent testing and deployment for each module

## Development Guidelines

### Port Allocation
- **Frontend**: 4200-4299
  - Shell (Host): 4200
  - Player UI: 4201
  - NFT Marketplace: 4202
  - Future Micro-frontends: 4203-4299
- **Backend APIs**: 8080-8099
- **WebSocket Services**: 9000-9099
- **Database Services**: 5000-5999
- **Monitoring**: 3000-3999

### Environment Configuration
- **Development**: Local Docker Compose + Nx serve for micro-frontends
- **Staging**: Kubernetes cluster with module federation
- **Production**: Kubernetes with Terraform and CDN for micro-frontends

### File Naming Conventions
- **Components**: kebab-case (e.g., `nft-marketplace.component.ts`)
- **Services**: kebab-case (e.g., `nft-marketplace.service.ts`)
- **Go Files**: snake_case (e.g., `nft_handler.go`)
- **Database**: snake_case (e.g., `player_stats`)
- **Docker**: kebab-case (e.g., `nft-service`)

## Current Status
- ✅ Frontend Shell (Angular) - Running on port 4200
- ✅ NFT Marketplace - Ready to extract as micro-frontend (port 4202)
- ✅ Big Dog NFT flip animation - Implemented and working
- ✅ Asset management - Local SVG/PNG assets configured
- ✅ Module Federation setup - Ready for micro-frontend architecture
- 🔄 Backend services - Planned
- 🔄 Database schema - Planned
- 🔄 Docker configuration - Planned

## Next Steps
1. **Extract NFT Marketplace as separate Nx project** 
   - Move components from shell to nft-marketplace project
   - Configure module federation for remote loading
   - Set up independent deployment pipeline
2. Initialize backend service directories
3. Set up database schema and migrations
4. Implement Docker Compose for development
5. Create API specifications
6. Set up CI/CD pipeline for micro-frontends

---
*Last updated: July 19, 2025*
