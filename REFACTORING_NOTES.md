# Sircles Refactoring — `refactor/performance-fixes` Branch

Living changelog for the refactor branch. **Not merged into `main`** — switch with `git checkout refactor/performance-fixes` to use this version.

## Quick stats

| | Before | After |
|---|---|---|
| `app/(tabs)/index.tsx` | 1,686 | **905** |
| `app/(tabs)/circles.tsx` | 1,137 | **734** |
| `app/(tabs)/events.tsx` | 949 | **655** |
| `app/circle/[id].tsx` | 3,798 | **1,457** |
| `lib/database.ts` | 3,443 | **228** |
| TypeScript errors | ~310 | **0** |
| Unused locals/imports | dozens | **0** |
| Tests | 0 | **172** across 27 suites |
| Commits on branch | — | ~55 |

## What changed

### Performance
- **N+1 queries batched** in circles and events screens (pending requests, admin checks).
- **FlatList virtualization** restored on home and events (was nested inside ScrollView).
- **30-second staleness cache** prevents re-fetching on every tab focus.
- **Pagination** on home feed (20 posts at a time, infinite scroll).
- **Optimistic UI** for likes / RSVPs / joins.
- **Double-tap protection** on action buttons.
- **Image upload optimization** — resizes to 1080px JPEG before upload (3–5MB photos → ~300KB).
- **Search debouncing** (200ms) on circles, events, home, messages.
- **`expo-image`** everywhere with built-in caching.

### Architecture
- **Service layer** — `lib/services/{users,circles,events,posts,interests,notifications}.ts`. `database.ts` is now a thin delegation layer (228 lines down from 3,443).
- **Generated Supabase types** from the live DB schema.
- **23 component test suites** covering every extracted feature component.
- **Sentry integration** — DSN-gated, no-op in dev. Just set `EXPO_PUBLIC_SENTRY_DSN` in `.env` to enable.

### Extracted components

| Component | Purpose |
|---|---|
| `Avatar` | Image with initials fallback when uri missing/broken |
| `AnimatedSegment` | Reusable segmented control with animated pill |
| `ConfirmDialog` | Generic destructive-action confirmation |
| `EditPostModal` | Shared post editor (home + circle detail) |
| `ErrorBoundary` | App-level crash handler with Sentry reporting |
| `feed/PostCard`, `EventCard`, `LikeButton` | Home feed items |
| `feed/SuggestedCirclesSection` | Horizontal carousel of circle suggestions |
| `feed/HomeCreatePostModal` | Create-post sheet on home |
| `feed/ActionMenu` | Generic three-dots action sheet |
| `events/EventsListCard` | Card on the Events tab list |
| `events/EventsFilterSheet` | Filter modal (circle / interests / RSVP / photo) |
| `circle/CircleDetailHeader` | Top bar with join/edit/delete actions |
| `circle/CircleInfoHeader` | Profile photo + description + member count |
| `circle/CircleTabBar` | Feed/Events/Members/Admin tab bar |
| `circle/CirclePostCard` | Post variant for circle detail page |
| `circle/CircleEventCard` | Event variant for circle detail page |
| `circle/MemberCard`, `AdminMemberCard`, `JoinRequestCard` | Member views |
| `circle/SearchableSection` | Section with title + count + search input |
| `circle/CreatePostModal`, `EditPostModal`, `EditCircleModal` | Modals |
| `circles/CreateCircleModal` | New-circle sheet on circles tab |
| `SkeletonLoader` (Feed/Circles/Events) | Loading shimmer placeholders |

### Tooling
- **Jest** test infrastructure (172 passing tests).
- **GitHub Actions CI** at [.github/workflows/ci.yml](.github/workflows/ci.yml) — runs type-check, tests, and web build on every push/PR.

## Running locally

```bash
# Tests
npx jest

# Type check
npx tsc --noEmit

# Web build
npx expo export --platform web

# Dev server (offline mode skips Expo's online checks)
EXPO_OFFLINE=1 npx expo start --offline --web
```

## To merge into `main` (when ready)

```bash
git checkout main
git merge refactor/performance-fixes
# (the "v2" badge on the Home screen is intentionally kept on this branch
# so testers can tell which version they're looking at — remove before merge
# by reverting commit ef4399c or editing app/(tabs)/index.tsx)
```

## Notes
- Visual `v2` badge on Home screen distinguishes this branch from `main`.
- All 172 tests must pass before merging.
- Sentry stays disabled until you add a DSN to `.env`.
