# Verde Tech Portal Redesign

Transform the Verde Tech Portal into a playful, interactive, game-like dashboard to improve student engagement.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Visual Style**: Confirmed as "Playful, interactive, game-like".
> - **Priorities**: Color/Typography update, enhanced interactivity/animations, and layout restructuring.

- **Confirmed Decision 1**: Adopt a vibrant, high-energy color palette inspired by nature-meets-tech (e.g., vibrant emeralds and cobalt blues).
- **Confirmed Decision 2**: Implement playful, game-like animations (Framer Motion) for point tracking, badge unlocks, and action logging.
- **Open Question / Choice 1**: Navigation structure: I recommend moving from a tab-based system to a card-based "Mission Control" style dashboard. Does this align with your vision for "restructuring layout and navigation flow"?

## 1. Overview & Core Concept

- **What It Does**: Enhances the existing student sustainability dashboard with playful gamification elements, smooth animations, and a modern, game-like aesthetic.
- **Target Audience**: Students, aiming for increased engagement in campus sustainability actions.
- **Key Value**: Makes tracking eco-impact enjoyable through tangible, reactive, and visually appealing game mechanics.

## 2. User Experience & Visual Design

- **Key User Flows**: 
    - Dashboard: Interactive mission progress cards, animated leaderboards, playful point-tracking.
    - Action Logging: Satisfying, feedback-rich submission flow for verified sustainability actions.
- **Visual Identity & Theme**:
    - *Aesthetic Direction*: Playful, high-energy, interactive game-like interface.
    - *Color Palette*: Dominant neutral (`#F8FAFC`), structural surfaces (`#FFFFFF` with `#E2E8F0` borders), vibrant accents (`#059669` emerald, `#0284C7` cobalt, `#F59E0B` amber).
    - *Typography*: `Bricolage Grotesque` (headers) paired with `Plus Jakarta Sans` (body). Tabular numbers for points (`font-mono tabular-nums`).
    - *Layout*: "Mission Control" dashboard layout (card-based), generous whitespace, single-elevation depth.
- **Interactive Feedback & Motion**:
    - Framer Motion for smooth point tally updates, badge reveal animations, and card hover effects.
    - Immediate visual feedback on action submissions (e.g., subtle confetti or success chimes).

## 3. Key Product Decisions & Trade-Offs

- **Decision 1**: Moving from standard tab navigation to a card-based Mission Control dashboard.
    - *Chosen Approach*: Card-based layout focused on key missions and progress.
    - *Why*: Higher engagement and better fits the "game-like" theme.
    - *Alternatives Considered*: Retaining the existing tabbed layout (discarded for being less immersive).
- **Decision 2**: Using Framer Motion for interactivity.
    - *Chosen Approach*: Standardizing on Framer Motion for animations.
    - *Why*: Robust performance and native React integration.

## 4. Technical Architecture & Data Strategy

```text
┌──────────────────────┐   ┌───────────────────┐
│     Firebase (DB)    │ <─>  │  server.ts (API)  │
└──────────┬───────────┘   └─────────┬─────────┘
           │                         │
           └───────────┬─────────────┘
                       │
             ┌─────────┴──────────┐
             │       App.tsx      │
             │   (State/Sync)     │
             └─────────┬──────────┘
                       │
             ┌─────────┴──────────┐
             │  Game Dash/Comp.   │
             │ (Framer Motion UI) │
             └────────────────────┘
```

- **Data Model & State**: Continue utilizing existing Firestore schema for students, logs, and feed posts. Enhance UI components to reactively display gamified state.
- **Interactive Component Mapping**: All existing actions (`submitLog`, `approveLog`) will be kept functional, but wrapped with new animated feedback components in the UI.
