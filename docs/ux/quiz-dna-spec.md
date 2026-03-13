# UX Design Spec — Quiz DNA de Viagem

## TravelMatch BR | Epic 1, Stories 1.4 → 1.7

> Spec completa de UX para o fluxo do Quiz DNA de Viagem — wireframes, interações, componentes e tokens.
> Autor: Uma (ux-design-expert) | Data: 2026-03-09 | PRD: docs/prd.md

---

## 1. Princípios de Design do Quiz

| Princípio | Aplicação | Referência |
|-----------|-----------|------------|
| **Zero fricção** | Cada interação é 1 toque/swipe. Sem digitação, sem dropdowns | Tinder |
| **Recompensa imediata** | Feedback visual a cada resposta. Resultado parcial em 90s | Headspace |
| **Progressão visível** | Barra que enche, animações de conquista, "DNA carregando..." | Duolingo |
| **Personalidade desde o início** | Tom de voz acolhedor, não clínico. "Me conta..." não "Selecione:" | Spotify |
| **Compartilhável por design** | Resultado é visual, bonito e feito para viralizar | Spotify Wrapped |
| **Retomável** | Se sair no meio, retoma exatamente onde parou | Netflix |

---

## 2. Arquitetura de Telas — Fluxo Completo

```
┌─────────────────────────────────────────────────────────┐
│                    FLUXO DO QUIZ DNA                     │
│                                                         │
│  [Login] → [Welcome] → [Quiz Fase 1] → [Resultado      │
│                          (3 cards)      Parcial]        │
│                                           │             │
│                              ┌────────────┴──────┐      │
│                              ▼                   ▼      │
│                        [Quiz Fase 2]    [Feed DNA 40%]  │
│                         (7 cards)             │         │
│                              │                │         │
│                              ▼                │         │
│                        [Resultado             │         │
│                         Completo]             │         │
│                              │                │         │
│                              ▼                ▼         │
│                        [Perfil DNA] ◄─────────┘         │
│                              │                          │
│                         [Compartilhar]                   │
│                              │                          │
│                         [Feed Destinos]                  │
└─────────────────────────────────────────────────────────┘
```

**Decisões de fluxo:**

| Ponto de decisão | Caminho A | Caminho B |
|-------------------|-----------|-----------|
| Após resultado parcial | "Completar DNA" → Fase 2 | "Ver destinos assim mesmo" → Feed com banner |
| Após resultado completo | "Compartilhar" → Share sheet | "Ver destinos" → Feed |
| Qualquer momento no quiz | "Sair" → Progresso salvo, retoma depois | — |

---

## 3. Wireframes Detalhados — Tela a Tela

### TELA 1: Welcome Screen (pós-login, pré-quiz)

```
┌──────────────────────────────────┐
│         STATUS BAR               │
├──────────────────────────────────┤
│                                  │
│          ┌──────────┐            │
│          │  🧬      │            │
│          │ (ícone   │            │
│          │  DNA     │            │
│          │ animado) │            │
│          └──────────┘            │
│                                  │
│    Descubra seu DNA              │
│      de Viagem                   │
│                                  │
│  "3 perguntas. 90 segundos.     │
│   E você vai descobrir que       │
│   tipo de viajante você é."      │
│                                  │
│  ┌──────────────────────────┐    │
│  │                          │    │
│  │  ⏱️ Menos de 2 minutos   │    │
│  │  🎯 100% visual          │    │
│  │  🔒 Seus dados protegidos│    │
│  │                          │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │                          │    │
│  │    DESCOBRIR MEU DNA →   │    │
│  │                          │    │
│  └──────────────────────────┘    │
│         (accent color, full w)   │
│                                  │
│    Já fez o quiz? Ver meu DNA    │
│                                  │
└──────────────────────────────────┘
```

**Specs de interação:**

| Elemento | Spec |
|----------|------|
| Ícone DNA | Animação Lottie, loop suave 3s, cores do branding |
| Headline | `text-2xl font-bold`, max 2 linhas |
| Sub-headline | `text-base text-muted`, tom conversacional |
| Badges | Ícone + texto, `text-sm`, fundo `surface-secondary` |
| CTA principal | `h-14 w-full rounded-2xl`, accent color, `font-semibold text-lg` |
| Link secundário | `text-sm text-muted underline`, abaixo do CTA |
| Animação de entrada | Fade in sequencial: ícone (0ms) → headline (200ms) → sub (400ms) → badges (600ms) → CTA (800ms) |

---

### TELA 2: Quiz Card — Fase 1 (Perguntas 1-3)

**Mobile (< 768px):**

```
┌──────────────────────────────────┐
│  ← Sair        FASE 1 DE 2      │
├──────────────────────────────────┤
│                                  │
│  ■ ■ □  ──────── Pergunta 1/3   │
│  (progress dots)                 │
│                                  │
│  "Qual é o seu ritmo             │
│   ideal de viagem?"              │
│                                  │
│  ┌──────────────────────────┐    │
│  │                          │    │
│  │   🌿                     │    │
│  │   [FOTO: pessoa em rede  │    │
│  │    na praia, pôr do sol] │    │
│  │                          │    │
│  │   Zen & Tranquilo        │    │
│  │   "Acordar sem alarme,   │    │
│  │    fluir com o dia"      │    │
│  │                          │    │
│  └──────────────────────────┘    │
│          ← SWIPE →              │
│  ┌──────────┐  ┌──────────┐     │
│  │  · · ●   │  │  Pular → │     │
│  └──────────┘  └──────────┘     │
│  (dot indicators)               │
│                                  │
│  💡 Deslize para ver as opções   │
│     (tooltip primeira vez)       │
│                                  │
└──────────────────────────────────┘
```

**Desktop (> 768px):**

```
┌────────────────────────────────────────────────────────────┐
│  ← Sair              FASE 1 DE 2           Pergunta 1/3   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│     "Qual é o seu ritmo ideal de viagem?"                  │
│                                                            │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│   │            │  │            │  │            │          │
│   │   🌿      │  │   ⚡       │  │   🔥      │          │
│   │   [foto]  │  │   [foto]  │  │   [foto]  │          │
│   │           │  │           │  │           │          │
│   │   Zen     │  │ Moderado  │  │  Intenso  │          │
│   │           │  │           │  │           │          │
│   └────────────┘  └────────────┘  └────────────┘          │
│    (click to select)                                       │
│                                                            │
│    ■ ■ □                                      Pular →      │
└────────────────────────────────────────────────────────────┘
```

**Specs de interação — Quiz Card:**

| Elemento | Spec |
|----------|------|
| **Progress dots** | 3 dots (Fase 1), preenchidos conforme avança. `w-3 h-3 rounded-full` |
| **Pergunta** | `text-xl font-semibold`, center, max 2 linhas |
| **Card de opção** | `rounded-2xl overflow-hidden shadow-md`, 85% width mobile, foto ocupa 60% do card |
| **Foto** | Aspect ratio 4:3, `object-cover`, fotos reais apenas |
| **Label da opção** | Emoji + nome (`text-lg font-medium`) + descrição curta (`text-sm text-muted`) |
| **Swipe** | Horizontal carousel (mobile), snap scroll. Velocidade mínima: 100px/s para registrar |
| **Tap** | Mobile e desktop: tap/click no card seleciona |
| **Seleção** | Card selecionado: borda accent 3px + scale(1.02) + haptic feedback (se disponível) |
| **Transição** | Após seleção: 300ms delay → card atual slide out left → próximo card slide in right |
| **Dot indicators** | 2-4 dots abaixo do carousel indicando opção atual |
| **Tooltip** | Aparece só na primeira pergunta, some após primeiro swipe, nunca retorna |
| **Botão Sair** | `text-sm text-muted`, confirm dialog: "Seu progresso será salvo. Sair?" |
| **Botão Pular** | `text-sm text-muted`, pula pergunta (marca dimensão como neutra/50) |

---

### Conteúdo das 3 Perguntas — Fase 1

**Pergunta 1: Ritmo** (dimensões: ritmo, relax, aventura)

| Opção | Emoji | Foto | Label | Sublabel |
|-------|-------|------|-------|----------|
| A | 🌿 | Pessoa em rede, pôr do sol | **Zen & Tranquilo** | "Acordar sem alarme, fluir com o dia" |
| B | ⚡ | Grupo caminhando em trilha leve | **Moderado & Equilibrado** | "Mistura perfeita de passeio e descanso" |
| C | 🔥 | Pessoa fazendo rapel em cachoeira | **Intenso & Aventureiro** | "Cada minuto é uma nova experiência" |

**Pergunta 2: Vibe Principal** (dimensões: natureza, urbano, praia, cultura)

| Opção | Emoji | Foto | Label | Sublabel |
|-------|-------|------|-------|----------|
| A | 🏖️ | Praia deserta com coqueiros | **Praia & Mar** | "Pé na areia, brisa no rosto" |
| B | 🏔️ | Vista de montanha com névoa | **Natureza & Trilha** | "Cachoeiras, matas e ar puro" |
| C | 🏙️ | Cidade vibrante à noite | **Urbano & Cultura** | "Gastronomia, arte e vida noturna" |
| D | 🍽️ | Mesa com pratos regionais | **Gastronomia & Imersão** | "Conhecer um lugar pelo paladar" |

**Pergunta 3: Social** (dimensões: sociabilidade)

| Opção | Emoji | Foto | Label | Sublabel |
|-------|-------|------|-------|----------|
| A | 🧘 | Pessoa sozinha contemplando | **Solo & Introvertido** | "Meu ritmo, meu silêncio, minha paz" |
| B | 👫 | Casal em cenário romântico | **A Dois** | "Momentos a dois, memórias pra vida" |
| C | 👨‍👩‍👧‍👦 | Família brincando na praia | **Em Família** | "Diversão para todas as idades" |
| D | 🎉 | Grupo de amigos rindo | **Com Amigos** | "Quanto mais, melhor!" |

---

### TELA 3: Transição Fase 1 → Resultado Parcial

```
┌──────────────────────────────────┐
│                                  │
│                                  │
│        ┌──────────────┐          │
│        │              │          │
│        │   🧬         │          │
│        │  (animação   │          │
│        │   helix DNA  │          │
│        │   formando)  │          │
│        │              │          │
│        └──────────────┘          │
│                                  │
│     Analisando suas              │
│       respostas...               │
│                                  │
│     ████████░░░░ 67%             │
│     (progress bar animada)       │
│                                  │
│     "Parece que você gosta       │
│      de [dimensão top]..."       │
│     (texto dinâmico, fade in)    │
│                                  │
│                                  │
└──────────────────────────────────┘
```

**Specs:**

| Elemento | Spec |
|----------|------|
| Duração | 2.5-3 segundos (tempo de cálculo + UX delight) |
| Animação DNA | Lottie: double helix formando-se, cores do branding |
| Progress bar | Animação de 0% → 100% em 2.5s, `rounded-full h-2` |
| Texto dinâmico | Frase baseada na dimensão mais alta. Fade in a 50% do progress |
| Transição de saída | Tela inteira faz morph/dissolve para o resultado |

---

### TELA 4: Resultado Parcial (DNA 40%)

```
┌──────────────────────────────────┐
│         STATUS BAR               │
├──────────────────────────────────┤
│                                  │
│  ┌──────────────────────────┐    │
│  │                          │    │
│  │   Seu DNA de Viagem      │    │
│  │                          │    │
│  │     🌿                   │    │
│  │   Explorador Zen         │    │
│  │                          │    │
│  │   ┌──────────────────┐   │    │
│  │   │                  │   │    │
│  │   │  [RADAR CHART]   │   │    │
│  │   │   3 dimensões    │   │    │
│  │   │   preenchidas    │   │    │
│  │   │   7 em cinza     │   │    │
│  │   │   claro          │   │    │
│  │   │                  │   │    │
│  │   └──────────────────┘   │    │
│  │                          │    │
│  │  DNA ████░░░░░░ 40%      │    │
│  │  "Resultado preliminar"  │    │
│  │                          │    │
│  └──────────────────────────┘    │
│                                  │
│  "Você é do tipo que prefere     │
│   sentir a brisa do que correr   │
│   atrás do próximo passeio."     │
│                                  │
│  🏖️ Destinos que combinam:      │
│  ┌────────┐ ┌────────┐          │
│  │F.Noronh│ │Jericoa │          │
│  │  87%   │ │  82%   │          │
│  └────────┘ └────────┘          │
│  (cards pequenos, não clicáveis) │
│                                  │
│  ┌──────────────────────────┐    │
│  │  COMPLETAR MEU DNA →     │    │
│  │  +2 min para 95%         │    │
│  └──────────────────────────┘    │
│  (accent color, full width)      │
│                                  │
│  Ver meus destinos assim mesmo   │
│  (link secundário)               │
│                                  │
└──────────────────────────────────┘
```

**Specs:**

| Elemento | Spec |
|----------|------|
| **Card DNA** | `rounded-3xl shadow-xl p-6`, background gradient suave (branding) |
| **Label DNA** | Emoji grande (32px) + nome (`text-2xl font-bold`) |
| **Radar chart** | 10 eixos, 3 preenchidos com cor accent, 7 em `gray-200` com label "?" |
| **Barra de completude** | `h-2 rounded-full`, 40% preenchido, accent color |
| **Descrição** | 2-3 frases personalizadas, `text-base`, tom acolhedor |
| **Destinos teaser** | Cards 120x80px, foto + nome + score, `opacity-80`, não clicáveis |
| **CTA Completar** | `h-14 w-full rounded-2xl`, accent, `font-semibold` |
| **Link pular** | `text-sm text-muted underline`, leva ao feed com banner "DNA incompleto" |
| **Animação reveal** | Card entra de baixo → radar desenha-se → label fade in → destinos slide in |

---

### TELA 5: Quiz Fase 2 (Perguntas 4-10)

Mesmo layout da Fase 1, mas com indicadores atualizados:

```
┌──────────────────────────────────┐
│  ← Voltar       FASE 2 DE 2     │
├──────────────────────────────────┤
│                                  │
│  ■ ■ ■ □ □ □ □  ── Pergunta 4/10│
│                                  │
│  "O que não pode faltar          │
│   na sua viagem?"                │
│                                  │
│  ┌──────────────────────────┐    │
│  │   [CARD OPÇÃO ou         │    │
│  │    MULTI-SELECT ou       │    │
│  │    SLIDER conforme tipo] │    │
│  └──────────────────────────┘    │
│                                  │
│  DNA ████████░░░░ 67%            │
│  (atualiza a cada resposta)      │
│                                  │
└──────────────────────────────────┘
```

**7 Perguntas da Fase 2:**

| # | Pergunta | Tipo | Dimensões |
|---|----------|------|-----------|
| 4 | "O que não pode faltar na sua viagem?" | Multi-select (2-3) | Todas — refinamento |
| 5 | "Qual o seu nível de energia física?" | Slider visual (3 níveis) | fitness |
| 6 | "Comida é parte da experiência?" | Swipe 2 opções | gastronomia |
| 7 | "Seu orçamento ideal por pessoa/dia?" | Slider com faixas (R$) | budget (metadata) |
| 8 | "Qual o objetivo dessa próxima viagem?" | Swipe 4 opções | relax, aventura, cultura |
| 9 | "Tem alguma restrição?" | Multi-select opcional | restrições (metadata) |
| 10 | "Última: mar ou montanha?" | Swipe rápido 2 opções | natureza, praia |

**Tipos de interação:**

| Tipo | Mecânica | Quando |
|------|----------|--------|
| **Swipe card** | Carousel horizontal, tap/swipe para selecionar | 2-4 opções visuais |
| **Multi-select grid** | Grid 2x3 de ícones/fotos, tap para toggle (max 3) | Pergunta 4 e 9 |
| **Slider visual** | 3-4 stops com ícone/label, drag ou tap | Pergunta 5 e 7 |

**Multi-select wireframe (Perguntas 4 e 9):**

```
┌──────────────────────────────────┐
│  "O que não pode faltar?"        │
│  (selecione até 3)               │
│                                  │
│  ┌─────────┐  ┌─────────┐       │
│  │ 🏊 Água │  │ 🥾Trilha │       │
│  │  [ ]    │  │  [✓]    │       │
│  └─────────┘  └─────────┘       │
│  ┌─────────┐  ┌─────────┐       │
│  │ 🍽️Comida│  │ 📸Fotos │       │
│  │  [✓]    │  │  [ ]    │       │
│  └─────────┘  └─────────┘       │
│  ┌─────────┐  ┌─────────┐       │
│  │ 🧘Spa   │  │ 🎵Música│       │
│  │  [ ]    │  │  [ ]    │       │
│  └─────────┘  └─────────┘       │
│                                  │
│  ┌──────────────────────────┐    │
│  │      CONTINUAR →         │    │
│  └──────────────────────────┘    │
│                                  │
└──────────────────────────────────┘
```

**Slider visual wireframe (Perguntas 5 e 7):**

```
┌──────────────────────────────────┐
│  "Qual o seu nível de energia?"  │
│                                  │
│  ┌──────────────────────────┐    │
│  │                          │    │
│  │  🛋️ ─────●───── 🏃‍♂️     │    │
│  │  Tranquilo    Fitness    │    │
│  │                          │    │
│  │  Atual: Moderado ⚡      │    │
│  │                          │    │
│  └──────────────────────────┘    │
│                                  │
└──────────────────────────────────┘
```

---

### TELA 6: Resultado Completo (DNA 95%)

**Sequência de reveal animado (inspirado Spotify Wrapped):**

```
STEP 1 (0-1s):     Tela escura com partículas DNA flutuando
STEP 2 (1-1.5s):   Label aparece — "Você é um... 🌿 Explorador Zen"
STEP 3 (1.5-3.5s): Radar chart desenha — cada eixo se estende sequencialmente
STEP 4 (3.5-4.5s): Descrição personalizada fade in por palavra
STEP 5 (4.5-6s):   Barras de score preenchem uma por uma
STEP 6 (6-7s):     Cards de destinos Top 3 slide in da direita
```

**Wireframe final (após animações):**

```
┌──────────────────────────────────┐
│         STATUS BAR               │
├──────────────────────────────────┤
│                                  │
│     Você é um...                 │
│                                  │
│     🌿                           │
│     Explorador Zen               │
│                                  │
│   ┌──────────────────────────┐   │
│   │                          │   │
│   │     [RADAR COMPLETO]     │   │
│   │     10 dimensões         │   │
│   │     preenchidas com      │   │
│   │     cores por dimensão   │   │
│   │                          │   │
│   └──────────────────────────┘   │
│                                  │
│  "Você é o viajante que busca    │
│   paz e conexão com a natureza.  │
│   Prefere pousadas boutique a    │
│   resorts lotados, trilhas       │
│   leves a esportes radicais,     │
│   e o som do mar ao DJ."         │
│                                  │
│  ┌──────────────────────────┐    │
│  │  Natureza  ████████░░ 85 │    │
│  │  Relax     ███████░░░ 78 │    │
│  │  Praia     ███████░░░ 75 │    │
│  │  Gastro    ██████░░░░ 62 │    │
│  │  Cultura   █████░░░░░ 55 │    │
│  │  Fitness   ████░░░░░░ 42 │    │
│  │  Aventura  ████░░░░░░ 38 │    │
│  │  Urbano    ███░░░░░░░ 28 │    │
│  │  Social    ███░░░░░░░ 25 │    │
│  │  Ritmo     ██░░░░░░░░ 20 │    │
│  └──────────────────────────┘    │
│                                  │
│  🏖️ Seus Top Destinos:          │
│  ┌────────┐┌────────┐┌────────┐  │
│  │F.Noronh││Jericoa ││S.Miguel│  │
│  │  94%   ││  89%   ││  87%   │  │
│  │🥇 Top  ││🥈      ││🥉      │  │
│  └────────┘└────────┘└────────┘  │
│                                  │
│  DNA ██████████████ 95% ✨       │
│                                  │
│  ┌──────────────────────────┐    │
│  │  📤 COMPARTILHAR MEU DNA │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │  🏖️ VER MEUS DESTINOS → │    │
│  └──────────────────────────┘    │
│                                  │
└──────────────────────────────────┘
```

**Specs da animação de reveal:**

| Step | Tempo | Animação | Easing |
|------|-------|----------|--------|
| 1 | 0-1s | Background escuro com partículas DNA flutuando | — |
| 2 | 1-1.5s | Label faz fade in + scale de 0.8 → 1.0 | ease-out-cubic |
| 3 | 1.5-3.5s | Radar: cada eixo do centro para fora (100ms entre eixos) | spring(0.6) |
| 4 | 3.5-4.5s | Texto de descrição faz fade in por palavra | ease-in-out |
| 5 | 4.5-6s | Barras preenchem da esquerda (150ms entre barras) | ease-out |
| 6 | 6-7s | Cards de destino slide in da direita | ease-out |
| **Total** | **~7s** | **Tap em qualquer momento → skip, tudo aparece** | — |

---

### TELA 7: Compartilhamento Social

```
┌──────────────────────────────────┐
│           Compartilhar           │
│              ✕                   │
├──────────────────────────────────┤
│                                  │
│  ┌──────────────────────────┐    │
│  │                          │    │
│  │  [PREVIEW DA IMAGEM]     │    │
│  │                          │    │
│  │  ┌────────────────────┐  │    │
│  │  │  🌿 Explorador Zen │  │    │
│  │  │                    │  │    │
│  │  │  [mini radar]      │  │    │
│  │  │                    │  │    │
│  │  │  Natureza 85%      │  │    │
│  │  │  Relax    78%      │  │    │
│  │  │  Praia    75%      │  │    │
│  │  │                    │  │    │
│  │  │  travelmatch.com.br│  │    │
│  │  │  Descubra o seu!   │  │    │
│  │  └────────────────────┘  │    │
│  │                          │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌────┐│
│  │ 📸  │ │ 💬  │ │ 🐦  │ │ 🔗 ││
│  │Insta│ │Whats│ │ X   │ │Copy││
│  │Story│ │App  │ │     │ │Link││
│  └─────┘ └─────┘ └─────┘ └────┘│
│                                  │
│     Pular — ir para destinos     │
│                                  │
└──────────────────────────────────┘
```

**Specs de imagem gerada (Satori / OG Image API):**

| Formato | Dimensão | Uso |
|---------|----------|-----|
| **Stories** | 1080 x 1920px | Instagram Stories, WhatsApp Status |
| **Feed** | 1200 x 630px | WhatsApp mensagem, Twitter/X, OG preview |

**Layout da imagem gerada:**

```
┌─────────────────────────────────────┐
│   [Background: gradient branding]   │
│                                     │
│        🌿 Explorador Zen            │
│                                     │
│        [Radar chart mini]           │
│                                     │
│   Natureza 85% │ Relax 78%         │
│   Praia 75%    │ Gastro 62%        │
│                                     │
│   ─────────────────────────         │
│   TravelMatch — Descubra seu DNA    │
│   travelmatch.com.br/quiz           │
│                                     │
└─────────────────────────────────────┘
```

---

## 4. Tabela de Labels de DNA

20 labels possíveis, gerados por combinação das 2-3 dimensões mais altas:

| Top 1 | Top 2 | Label | Emoji | Descrição curta |
|-------|-------|-------|-------|----------------|
| Natureza | Relax | Explorador Zen | 🌿 | Paz e natureza em harmonia |
| Natureza | Aventura | Desbravador | 🏔️ | Trilhas, cachoeiras e adrenalina |
| Natureza | Fitness | Atleta da Natureza | 🥾 | Performance ao ar livre |
| Praia | Relax | Alma Praiana | 🏖️ | Pé na areia, mente em paz |
| Praia | Aventura | Surfista de Alma | 🏄 | Mar, vento e liberdade |
| Praia | Social | Festeiro do Litoral | 🎉 | Beach party é meu habitat |
| Urbano | Cultura | Cosmopolita | 🌆 | Arte, museus e vida urbana |
| Urbano | Gastro | Foodie Urbano | 🍜 | A cidade pelo paladar |
| Urbano | Social | Noctívago | 🌙 | A cidade acorda quando escurece |
| Cultura | Gastro | Imersivo Cultural | 🎭 | Conhecer um lugar de verdade |
| Cultura | Relax | Contemplativo | 🧘 | Absorver cada detalhe com calma |
| Aventura | Fitness | Extremo | ⚡ | Limites existem para serem testados |
| Aventura | Social | Aventureiro Social | 🪂 | Adrenalina é melhor em grupo |
| Relax | Gastro | Hedonista | 🍷 | Conforto, sabores e prazeres |
| Relax | Social | Anfitrião | 🏡 | Reunir pessoas em lugares especiais |
| Fitness | Praia | Aquático | 🤿 | Esportes aquáticos são vida |
| Gastro | Aventura | Gastrônomade | 🗺️ | Viaja com o estômago como guia |
| Social | Cultura | Conector | 🤝 | Pessoas e lugares, juntos |
| Natureza | Gastro | Orgânico | 🌱 | Da terra pro prato, do campo pra alma |
| Solo (introvertido) | Qualquer | Lobo Solitário | 🐺 | O caminho é meu, o ritmo também |

**Lógica de seleção:**
1. Ordenar 10 dimensões por score descendente
2. Top 1 e Top 2 determinam o label
3. Se Top 1 é "sociabilidade" com score < 30 (introvertido) → "Lobo Solitário" override
4. Se empate (diferença < 5 entre Top 2 e Top 3) → usar Top 1 + Top 3 como alternativa
5. Descrição longa (2-3 frases) gerada por template com variáveis das dimensões

---

## 5. Guia de Componentes — Atomic Design

### Átomos

| Componente | Props | Variantes |
|-----------|-------|-----------|
| `ProgressDots` | `total: number`, `current: number`, `size: 'sm' \| 'lg'` | Fase 1 (3 dots), Fase 2 (7 dots) |
| `ProgressBar` | `value: number`, `label?: string`, `animated: boolean` | `default`, `dna` (accent + shimmer) |
| `ScoreBar` | `value: number`, `label: string`, `maxValue: number`, `color: string` | Barra horizontal com preenchimento |
| `Badge` | `icon: string`, `text: string`, `variant: 'info' \| 'success' \| 'warning'` | Com ou sem ícone |
| `DnaLabel` | `emoji: string`, `name: string`, `size: 'sm' \| 'lg' \| 'xl'` | Card, resultado, share |

### Moléculas

| Componente | Composição | Props |
|-----------|------------|-------|
| `QuizCard` | Foto + Label + Sublabel + Selection | `image`, `emoji`, `title`, `subtitle`, `selected`, `onSelect` |
| `QuizSlider` | Ícone esq + Slider + Ícone dir + Label | `min`, `max`, `stops[]`, `value`, `onChange` |
| `QuizMultiSelect` | Grid de `QuizCard` com toggle | `options[]`, `maxSelect`, `selected[]`, `onChange` |
| `DestinationTeaser` | Foto mini + Nome + Score badge | `image`, `name`, `score`, `size` |
| `DnaRadarChart` | SVG radar 10 eixos | `dimensions[]`, `animated`, `highlightTop` |
| `DnaScoreList` | Lista de `ScoreBar` ordenada | `dimensions[]`, `animated`, `delay` |
| `ShareButton` | Ícone + Label + Action | `channel`, `shareUrl`, `shareImage` |

### Organismos

| Componente | Composição | Responsabilidade |
|-----------|------------|-----------------|
| `QuizScreen` | Header (progress) + Pergunta + Cards/Slider + Nav | 1 pergunta completa |
| `DnaResultCard` | DnaLabel + RadarChart + ScoreList + ProgressBar | Card principal resultado |
| `DnaShareSheet` | Preview imagem + Botões canal + Skip | Bottom sheet compartilhamento |
| `QuizTransition` | Animação DNA + Progress + Texto dinâmico | Loading entre fases |

### Templates

| Template | Layout | Uso |
|----------|--------|-----|
| `QuizLayout` | Full screen, sem header/nav, progress no topo | Todas as telas do quiz |
| `ResultLayout` | Scroll vertical, card fixo no topo (mobile) ou sidebar (desktop) | Resultado + share |
| `ProfileLayout` | Header com avatar, tabs, scroll content | Perfil / DNA / Histórico |

---

## 6. Design Tokens

```yaml
# Quiz-specific design tokens
quiz:
  card:
    border-radius: 16px        # rounded-2xl
    shadow: shadow-md
    selected-border: "3px solid var(--accent)"
    selected-scale: 1.02

  transition:
    between-questions: "300ms ease-out"
    reveal-step: "200ms ease-in-out"
    progress-fill: "500ms ease-out"

  timing:
    tooltip-dismiss: first-interaction
    loading-screen: 2500ms
    reveal-total: 7000ms
    reveal-skip: immediate

  radar:
    size-mobile: 200px
    size-desktop: 280px
    line-width: 2px
    fill-opacity: 0.2
    animation-per-axis: 100ms

  colors:
    dimension-natureza: "#2D7D46"     # verde floresta
    dimension-praia: "#0EA5E9"        # azul oceano
    dimension-urbano: "#6366F1"       # índigo urbano
    dimension-cultura: "#D946EF"      # magenta cultural
    dimension-gastro: "#F59E0B"       # âmbar gastronômico
    dimension-aventura: "#EF4444"     # vermelho adrenalina
    dimension-relax: "#06B6D4"        # ciano tranquilo
    dimension-fitness: "#10B981"      # verde esportivo
    dimension-social: "#F97316"       # laranja social
    dimension-ritmo: "#8B5CF6"        # violeta ritmo
```

---

## 7. Acessibilidade (WCAG AA)

| Elemento | Requisito | Implementação |
|----------|-----------|---------------|
| **Swipe cards** | Alternativa para quem não pode swipe | Botões "Anterior/Próximo" visíveis, teclado (← →) |
| **Radar chart** | Alt-text para screen readers | `aria-label="Gráfico radar: Natureza 85%, Relax 78%..."` |
| **Animações** | Respeitar `prefers-reduced-motion` | Se ativado: skip todas, exibir resultado direto |
| **Cores** | Contraste 4.5:1 mínimo | Overlay escuro 60% + texto branco sobre fotos |
| **Multi-select** | Estado selecionado claro | Borda + checkmark + mudança de cor (não apenas cor) |
| **Progress** | Informar screen reader | `aria-live="polite"`, "Pergunta 2 de 3" anunciado |
| **Focus** | Visible focus ring | `ring-2 ring-accent ring-offset-2` |
| **Touch target** | Mínimo 44x44px | Cards e botões respeitam minimum tap target |

---

## 8. Métricas de UX (PostHog Events)

| Evento | O que mede | Meta |
|--------|-----------|------|
| `quiz_started` | Conversão welcome → quiz | > 70% |
| `quiz_q{n}_answered` | Abandono por pergunta | < 5% drop/pergunta |
| `quiz_phase1_completed` | Completion Fase 1 | > 85% |
| `quiz_phase2_started` | Conversão parcial → completo | > 50% |
| `quiz_phase2_completed` | Completion total | > 40% dos starts |
| `quiz_time_phase1` | Tempo da Fase 1 | < 90s |
| `quiz_time_total` | Tempo total | < 5 min |
| `dna_result_viewed` | Chegou ao resultado | ~= phase1_completed |
| `dna_shared` | Compartilhou (por canal) | > 15% dos resultados |
| `dna_share_clicked` | Abriu share sheet | > 30% |
| `dna_public_page_visited` | Viralidade do link | Tracking orgânico |
| `quiz_skipped_phase2` | Pulou refinamento | < 50% |
| `quiz_retaken` | Refez o quiz | Monitorar |

---

## 9. Checklist de Handoff para @dev

| Entregável | Status | Seção |
|-----------|--------|-------|
| Fluxo de telas completo | ✅ | 2 |
| Wireframes detalhados (7 telas) | ✅ | 3 |
| Specs de interação por componente | ✅ | 3 |
| Conteúdo das 10 perguntas | ✅ | 3 |
| Tabela de 20 labels de DNA | ✅ | 4 |
| Guia de componentes Atomic Design | ✅ | 5 |
| Design tokens | ✅ | 6 |
| Specs de acessibilidade | ✅ | 7 |
| Métricas de UX | ✅ | 8 |

**Prioridade de implementação:**

1. `QuizCard` + `QuizScreen` — átomo + organismo core
2. `ProgressDots` + `ProgressBar` — feedback visual
3. `DnaRadarChart` — resultado visual
4. `DnaResultCard` — organismo do resultado
5. `DnaShareSheet` + OG Image generation — viralidade
6. `QuizSlider` + `QuizMultiSelect` — Fase 2
7. `QuizTransition` — polish

---

*UX Design Spec — Quiz DNA de Viagem v1.0*
*Uma (ux-design-expert) | 2026-03-09*
*PRD: docs/prd.md | Stories: 1.4, 1.5, 1.6, 1.7*
