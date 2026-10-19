# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep API access in the shared frontend client and render each capability in its existing route component. Every view handles loading, empty, and API-error states; Vite proxies relative `/api` requests to Express.
- Logic tier decision: Keep request validation and HTTP status handling in Express routes, with capability behavior in the backend service. Reject malformed IDs and missing references with deliberate 4xx responses rather than leaking Mongoose cast errors. Do not add authentication.
- Data tier decision: Make required fields and defaults explicit in the Mongoose models, and keep seed data idempotent without deleting unrelated records. Use MongoDB on port `27017`.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and positive `minutes`; verify both referenced records exist, then persist their IDs, the activity type and minutes, computed points, and the occurrence timestamp. Return the created activity and expose persisted activities from the list endpoint.
- Team management approach: Require a non-empty name, preserve the submitted name and mascot, and default members to an empty array. Validate submitted member IDs before creating the team and return its members from the list endpoint.
- Leaderboard approach: Aggregate activity points by team, sort totals descending, and return `teamName`, `totalPoints`, and a 1-based rank for each team.
- Workout suggestions approach: Find the user by email, use their fitness goal and recent activities to rank available workouts, and include a reason for each suggestion. Ensure the first suggestion matches the goal or recent activity; return a deliberate 4xx when no user matches.

## Test plan

Record the commands you run and what each failure means.

- Run checks in dependency order: data contracts, API contracts, frontend contracts, then both builds. After a change, rerun the narrowest affected test before moving to the next tier.
- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — failures indicate missing model validation/defaults or seed behavior that is not representative, idempotent, or safe for existing records.
- API command: `npm run test:api --prefix octofit-tracker/backend` — failures indicate incorrect endpoint status/payloads, missing input or reference validation, incorrect activity persistence, team membership handling, leaderboard totals/ranks, or workout matching.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — failures indicate a route is not requesting or rendering API data, selecting the expected user, or exposing accessible loading, empty, and error states.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — failures indicate backend TypeScript type or compilation errors.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — failures indicate frontend TypeScript or Vite production-build errors.
