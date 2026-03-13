# TravelMatch BR

Plataforma brasileira de viagens com personalização baseada em DNA de Viagem. Descubra seu perfil de viajante e encontre destinos perfeitos para você.

## Tech Stack

- **Frontend:** Next.js 15+ (App Router), TypeScript (strict), Tailwind CSS 4, shadcn/ui
- **Backend:** Supabase (PostgreSQL 15+ com pgvector), Edge Functions (Deno)
- **Monorepo:** pnpm workspaces
- **Deploy:** Vercel (web) + Supabase (DB, Auth, Functions)
- **Testes:** Vitest + Testing Library
- **Monitoring:** Sentry (error tracking)

## Pré-requisitos

- Node.js >= 18
- pnpm >= 9
- Supabase CLI >= 1.x

## Setup Local

```bash
# Instalar dependências
pnpm install

# Copiar variáveis de ambiente
cp packages/web/.env.example packages/web/.env.local

# Iniciar Supabase local
supabase start

# Aplicar migrations
supabase db push

# Iniciar dev server
pnpm dev
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Inicia o servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm lint` | Verifica código com ESLint |
| `pnpm typecheck` | Verifica tipos TypeScript |
| `pnpm test` | Executa testes com Vitest |
| `pnpm format` | Formata código com Prettier |

## Estrutura do Monorepo

```
packages/
├── web/         # Next.js PWA (App Router)
└── shared/      # Types, constants, schemas compartilhados

supabase/
├── migrations/  # 10 migrations (16 tabelas)
├── seed/        # Dados iniciais (destinos, admin)
└── functions/   # Edge Functions (Deno)
```

## Documentação

- [PRD](docs/prd.md) — Product Requirements Document
- [Arquitetura](docs/architecture/fullstack-architecture.md) — Arquitetura Fullstack
- [UX Spec](docs/ux/quiz-dna-spec.md) — Quiz DNA de Viagem
