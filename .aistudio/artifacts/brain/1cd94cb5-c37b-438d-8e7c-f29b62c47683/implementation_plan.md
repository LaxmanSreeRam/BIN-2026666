# Username Onboarding, Email Login & Instagram-Style Social Network

## Summary
Completely scrap all legacy Eco Numbers from the portal and registration flows, transition user authentication to standard Email ID & Password, introduce post-verification `@username` selection with live availability validation, and integrate an Instagram-style network system featuring separate Followers/Following metrics, a dedicated Follow Requests tab in the user profile, and configurable 3-tier privacy settings (Direct Follow, Request to Follow, and Private).

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were aligned during Phase 1 clarification:
> - **Authentication Method**: Users log in exclusively using their **Email ID and Password** (Eco Numbers are entirely scrapped from login inputs, emails, and student badges).
> - **Network Metric Display**: Profile headers display separate **Followers** and **Following** counters (Instagram style) rather than a merged single number.
> - **Request Management**: A dedicated **Follow Requests** tab and badge are placed directly inside the user's Profile section to review, accept, or decline incoming requests.
> - **Existing Account Compatibility**: Existing profiles will have a clean, unique `@username` automatically assigned (derived from their name or handle), ensuring full backward compatibility while completely eliminating the display of numeric Eco IDs.

---

### 1. Overview & Core Concept

- **What It Does**:
  - Replaces all legacy numeric Eco Numbers across registration, verification emails, leaderboard tables, community posts, and user profiles with clean, unique `@username` handles.
  - Streamlines registration: after 6-digit email verification, users are prompted to pick their unique `@username` with instant format and uniqueness checking.
  - Equips every student's Profile section with an interactive social network hub:
    - **Followers & Following counts** displayed prominently in the profile stats bar.
    - Clickable modals to view follower/following lists with one-click follow/unfollow actions.
    - **Follow Requests Tab**: An inbox for pending connection requests with one-click Accept and Decline controls.
    - **Privacy Settings**: A 3-mode selector in Profile Settings:
      1. **Direct Follow (Public)**: Anyone can follow immediately.
      2. **Let Other Users Request (Approval Required)**: New followers must be approved via the Follow Requests tab.
      3. **Private (Hidden / Closed)**: Account profile is shielded, and only approved followers can view activity posts.
- **Target Audience / Persona**: Students, eco-club leaders, and faculty who want a modern, social experience to connect, share sustainability initiatives, and build eco-friendly networks without robotic numeric identifiers.
- **Key Value**: Delivers an authentic social community feel akin to modern platforms (Instagram/GitHub), providing user privacy control and removing cumbersome ID numbers.

---

### 2. User Experience & Visual Design

#### A. Key User Flows

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. REGISTRATION & USERNAME FLOW                                        │
│                                                                        │
│  [Step 1: Details]      [Step 2: Email Code]     [Step 3: Pick Handle] │
│  Name, Email, Pass  ──► Strict 6-digit email ──► Pick @username        │
│                         dispatch verification    Format & live check   │
│                                                  ──► Account Ready!    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│ 2. LOGIN FLOW                                                          │
│                                                                        │
│  Email ID  +  Password  ──► Instant Authentication & Profile Restore   │
│  (No Eco Number required)                                              │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│ 3. PROFILE & NETWORK INTERACTION                                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Profile Header: @ecowarrior · Alex Chen                          │  │
│  │ [ 142 Followers ]  [ 86 Following ]  [ 3 Requests (Badge) ]     │  │
│  └───────────────┬───────────────────┬──────────────────┬───────────┘  │
│                  ▼                   ▼                  ▼              │
│            Followers Modal     Following Modal   Requests Drawer/Tab   │
│            View & Unfollow     View & Unfollow   Accept / Decline      │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Privacy Settings Toggle:                                         │  │
│  │ (●) Direct Follow (Public)                                       │  │
│  │ ( ) Let Users Request (Instagram Private)                        │  │
│  │ ( ) Private & Closed                                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### B. Visual Identity & Theme
- **Theme Palette**:
  - Dominant Forest & Emerald: `emerald-600` (`#059669`), `emerald-700` (`#047857`)
  - Crisp White & Dark Accents: High-contrast neo-brutalist borders (`border-dark border-3` / `border-4`) with sharp dropped shadows (`shadow-[4px_4px_0px_0px_black]`).
  - Warm Sand & Gold: `amber-400` / `amber-500` for badges and notifications.
  - Soft Neutral Backgrounds: `bg-slate-50` / `bg-white` card surfaces.
- **Zero-Pill Discipline**:
  - Metadata such as usernames, join dates, and status are rendered as clean, unboxed text separated by subtle typographic dots (`@alex_chen · Joined Oct 2026`).
  - Followers and Following counts use tabular figures (`font-variant-numeric: tabular-nums`) with bold counts and quiet labels (`142 followers · 86 following`).
- **Interactive Controls**:
  - Segmented privacy selector buttons with clear active states and helper descriptions explaining what each privacy level means.
  - Follow / Following / Requested state buttons:
    - *Follow*: High-contrast filled emerald button (`Follow`).
    - *Requested*: Amber muted button (`Requested` with clock icon).
    - *Following*: Outlined button (`Following` turning to `Unfollow` on hover).
- **Typography**:
  - System font stack with tight tracking on headings (`tracking-tight fw-black`).
  - Monospace accents (`font-mono`) exclusively for `@username` tags and numeric stats.

---

### 3. Key Product Decisions & Trade-Offs

#### Decision 1: Primary Authentication & Identification Transition
- **Chosen Approach**: Transition user authentication entirely to standard **Email ID and Password**. Under the hood, preserve unique document keys in Firestore, but store and index unique `username` handles (lowercase alphanumeric, underscores, dots).
- **Why**: Eliminates user friction of remembering a random 5-digit Eco Number. Matches standard user expectations and enables natural mentions (`@username`) in feed posts and leaderboards.
- **Alternatives Considered**: Keeping Eco Number as a secondary login identifier. *Rejected* because the user explicitly instructed to "completely scrap eco number".

#### Decision 2: Asymmetric Network Architecture (Followers vs. Following)
- **Chosen Approach**: Asymmetric social graph model with 3 states per relationship:
  1. `accepted` (active follow)
  2. `requested` (pending approval for private accounts)
  3. `none` (not following)
- **Why**: Exactly mirrors Instagram's social architecture, naturally supporting public accounts (instant follow) and requested accounts (gated access).
- **Alternatives Considered**: Symmetric "friendship" or LinkedIn-style mutual connections. *Rejected* because the user requested separate followers/following counts like Instagram.

#### Decision 3: Follow Requests Location
- **Chosen Approach**: A dedicated, badge-highlighted **Follow Requests tab** integrated directly inside the user's Profile section (alongside Activity and Badges tabs), plus a quick modal trigger from the Followers count.
- **Why**: Keeps all personal social relationship management in one logical home, avoiding navigation fragmentation.

---

### 4. Technical Architecture & Data Strategy

#### A. System & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (REACT)                         │
│                                                                        │
│   ┌─────────────────────┐   ┌──────────────────────────────────────┐   │
│   │    LoginModal       │   │           PersonalDashboard          │   │
│   │  - Email + Password │   │  - Profile Header (@username)        │   │
│   │  - Verify Code      │   │  - Followers / Following Counters    │   │
│   │  - Pick @username   │   │  - Follow Requests Tab (Accept/Deny) │   │
│   └──────────┬──────────┘   │  - Follow Privacy Setting Controls   │   │
│              │              └──────────────────┬───────────────────┘   │
│              │                                 │                       │
│              ▼                                 ▼                       │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                   CommunityFeed / Leaderboard                  │   │
│   │  - Displays @username on posts & rank tables                   │   │
│   │  - UserProfileModal: view profile, click Follow / Request      │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EXPRESS SERVER (server.ts)                      │
│                                                                        │
│   POST /api/check-username       - Check availability of @username     │
│   POST /api/login                - Login with Email + Password         │
│   POST /api/send-verification    - Email verification code dispatch    │
│   POST /api/verify-code          - Verify code & register with @handle │
│   POST /api/network/follow       - Follow / Request follow a user      │
│   POST /api/network/unfollow     - Unfollow a user                     │
│   POST /api/network/respond-req  - Accept or decline follow request    │
│   POST /api/user/privacy         - Update follow privacy setting       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         FIRESTORE PERSISTENCE                          │
│                                                                        │
│   /students/{studentId}                                                │
│     ├── username: string (unique, indexed)                             │
│     ├── email: string                                                  │
│     ├── followPrivacy: 'direct' | 'request' | 'private'                │
│     ├── followers: string[] (student IDs / usernames)                  │
│     ├── following: string[] (student IDs / usernames)                  │
│     └── pendingFollowRequests: string[] (IDs requesting to follow)     │
│                                                                        │
│   /firestore.rules & /firebase-blueprint.json (synchronized)           │
└────────────────────────────────────────────────────────────────────────┘
```

#### B. Data Model Specifications

```typescript
export type FollowPrivacy = 'direct' | 'request' | 'private';

export interface Student {
  grNo: string; // Internal persistent identifier
  username: string; // Unique public handle (e.g. "alex_green")
  name: string;
  email?: string;
  password?: string;
  avatarUrl?: string;
  grade: string;
  points: number;
  rank: number;
  badges: string[];
  followPrivacy: FollowPrivacy; // Default: 'direct'
  followers: string[]; // List of follower IDs
  following: string[]; // List of following IDs
  pendingFollowRequests: string[]; // Incoming request IDs
  co2SavedKg: number;
  waterSavedLiters: number;
  wasteDivertedKg: number;
  energySavedKwh: number;
  joinedDate: string;
}
```

#### C. Interactive Flow & State Handling
1. **Username Availability Check**:
   - As the user types their desired handle in the onboarding step, debounce a live query (`/api/check-username`).
   - Show instantaneous feedback (Green checkmark: `@alex is available` / Red alert: `Username already taken` / Format guidelines: `3-20 lowercase letters, numbers, or underscores`).
2. **Follow Action Logic**:
   - If target user has `followPrivacy === 'direct'`:
     - Adds user immediately to target's `followers` and current user's `following`.
     - Button updates to `Following`.
   - If target user has `followPrivacy === 'request'`:
     - Adds current user to target's `pendingFollowRequests`.
     - Button updates to `Requested` (with option to cancel request).
   - If target user has `followPrivacy === 'private'`:
     - Profile details and activity feed are hidden with a lock notice: `This account is private. Follow to see their eco contributions.`
3. **Requests Tab Interaction**:
   - Displays list of users who sent follow requests with their avatar, name, and `@username`.
   - Clicking **Accept** moves them from `pendingFollowRequests` into `followers` and updates both parties' records.
   - Clicking **Decline** dismisses the request cleanly.
4. **Scrapping Eco Number UI cleanup**:
   - Scrub all UI occurrences of "Eco ID: ...", "Eco Number", and "GR No." from `PersonalDashboard`, `LoginModal`, `Navbar`, `CommunityFeed`, `StudentLeaderboard`, and `UserProfileModal`.
   - Update verification emails to no longer mention Eco Numbers.

---

### Verification & Testing Plan
1. **Compilation & Linting**: Run `lint_applet` and `compile_applet` to confirm clean TypeScript compilation.
2. **Username Validation**: Verify valid and duplicate username handling.
3. **Follow & Request State**: Test following a direct-follow user vs a request-required user.
4. **Follow Requests Management**: Test approving and declining requests in the Profile section tab.
5. **Privacy Enforcement**: Verify that switching between Direct, Request, and Private updates target user follow behavior appropriately.
