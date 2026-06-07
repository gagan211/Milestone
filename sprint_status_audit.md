# 🏁 Milestone Project Architecture & Sprint Status Audit

This audit document provides a comprehensive, file-by-file status update on the Milestone project (covering the Rust Axum backend and the React Vite frontend). Use this file to feed directly into your IDE (Cursor, Copilot, etc.) to give it full context on what has been completed, what is pending, and the security concerns that require immediate attention.

---

## 📊 High-Level Completion Matrix

| Feature Module | Backend Status (Rust) | Frontend Status (React) | Overall Progress |
| :--- | :--- | :--- | :---: |
| **1. Auth & User Role Sync** | ✅ Implemented (`/api/auth/sync`) | ✅ Implemented (`AuthCallback.tsx`) | **100%** |
| **2. Dynamic Dashboard** | ✅ Implemented (`/api/projects/dashboard`) | ✅ Implemented (`Dashboard.tsx`) | **100%** |
| **3. Repo Link Flow** | ⚠️ Partial (`/api/projects/link` live) | ⚠️ Partial (Modal & reauth hooks ready) | **75%** |
| **4. Milestone Timeline View** | ❌ **Stubbed** (Returns 501 Not Implemented) | ✅ Implemented (`ProjectDetail.tsx`) | **50%** |
| **5. Public Profiles** | ✅ Implemented (`/api/profile/:userId`) | ✅ Implemented (`PublicProfile.tsx`) | **100%** |
| **6. Git Verification Engine** | ❌ **To Do** (No webhooks or validation) | — (Handled in background) | **0%** |



## 🦀 Backend Status Audit (Rust Axum & SQLx)

### 📁 1. Implemented Components
*   **Configuration Loader (`src/config/mod.rs`):** Fully loads `config.yaml` into a strongly-typed, read-only `AppConfig` struct. Supports dynamic CORS origins, database pool sizes, JWT credentials, and GitHub OAuth credentials.
*   **Supabase JWT Verification (`src/auth/jwt.rs`):** Implements Axum's `FromRequestParts` to parse the `Authorization: Bearer <JWT>` header, fetch and cache Supabase's public JWKS keys, and verify signatures using ES256 validation. Extracting `AuthenticatedUser` data (GitHub username, avatar URL, display name, sub) is fully robust.
*   **User Synchronization Service (`src/services/user_service.rs` & `src/handlers/users.rs`):** High-efficiency sync for OAuth users. Handles developer and client sync transactions utilizing the compilation-time SQL scripts `sync_developer.sql` and `sync_client.sql`. Exposes the `POST /api/auth/sync` endpoint.
*   **Developer Profiles (`src/handlers/profile.rs` & `src/services/user_service.rs`):** Fully implements public profile queries and customizable layout updates. Exposes `GET /api/profile/:userId` and `PUT /api/profile`.
*   **Dashboard Aggregator Service (`src/services/project_service.rs`):** Checks if the authenticated user is a developer or client, fetches role-appropriate project feeds, and dynamically aggregates the verified Trust Score. Exposes `GET /api/projects/dashboard`.
*   **Repository Linking Flow (`src/handlers/projects.rs`):**
    *   Validates GitHub repository URL structure.
    *   Retrieves developer's access token from the database.
    *   Hits public GitHub API to verify repo access.
    *   Saves the linked repository and seeds 3 initial default tracking milestones in a single safe SQL transaction.

### 📁 2. Skeletons & Stubbed/Missing Code
*   **`GET /api/projects/:id` (Timeline View):** ❌ Stubbed. The function `get_project_handler` in `src/handlers/projects.rs` currently returns `StatusCode::NOT_IMPLEMENTED`. The SQL query `queries/get_project_timeline.sql` exists but is never queried.
*   **`GET /api/projects/authorized-clients` (Client Selector):** ❌ Missing. The query `queries/get_authorized_clients.sql` exists, but there is no handler or router mapping to support fetching clients during repository linking.
*   **GitHub Webhook Receiver (`POST /api/webhooks/github`):** ❌ To Do. No webhook listener exists.
*   **Verification Engine (`src/verification/engine.rs` & `scheduler.rs`):** ❌ Empty skeletons. No actual verification processing logic is implemented.

---

## ⚛️ Frontend Status Audit (React & Vite)

The frontend codebase is modern, polished, and fully ready to connect once backend endpoints are live. 

### 📁 1. Implemented Components
*   **Auth Gateways (`src/pages/Auth.tsx` & `AuthCallback.tsx`):** Complete Supabase authentication page and onboarding setup. The auto-retry flow has been prepared to handle redirecting from GitHub OAuth reauthorization back into repository linking.
*   **Dashboard Interfaces (`src/pages/Dashboard.tsx`):** Glassmorphic Bento-box dashboard showing active projects and Trust Scores with premium micro-interactions.
*   **Link Repository Modal (`src/components/dashboard/LinkRepoModal.tsx`):** Beautiful dialog component. Detects permission errors, renders actionable `ApiErrorCard` to request additional GitHub scopes, and triggers redirects via `useGitHubReauth`.
*   **Timeline Details (`src/pages/ProjectDetail.tsx` & `ProjectTimeline.tsx`):** Premium progress meters and dashed timeline visualization components ready to show status states (`verified`, `in_progress`, `pending`, `failed`).
*   **Public Developer Profiles (`src/pages/PublicProfile.tsx`):** Custom bento score trackers and robust layout rendering blocks built to display the portfolio.

### 📁 2. Pending Integration Items
*   **Auto-Polling:** `useProjectData` inside `src/api/queries.ts` is ready to poll every 30s.
*   **Verified Mapping:** Status check logic must check for `'verified'` instead of `'completed'` to match backend conventions.

---

## 📋 Recommended Action Plan for Next Sprint

If you plan to implement the remaining backend work yourself, here is the exact roadmap of what to construct:

### Step 1: Implement Project Timeline Detail Endpoint
1. In `backend/milestone/src/services/project_service.rs`, add a service function `get_project_details`:
   ```rust
   pub async fn get_project_details(db: &Database, project_id: Uuid) -> Result<Option<ProjectData>, sqlx::Error> {
       // Query using get_project_timeline.sql and build the DTO structure matching what frontend expects.
   }
   ```
2. Update the stubbed `get_project_handler` in `src/handlers/projects.rs` to fetch this service and return a `200 OK` JSON response.

### Step 2: Implement Authorized Clients Endpoint
1. Create a service method to retrieve authorized clients:
   ```rust
   pub async fn get_authorized_clients(db: &Database, dev_id: Uuid) -> Result<Vec<AuthorizedClient>, sqlx::Error> {
       // Query using get_authorized_clients.sql
   }
   ```
2. Create a handler `get_authorized_clients_handler` in `src/handlers/projects.rs`.
3. Add the route `.route("/authorized-clients", get(projects::get_authorized_clients_handler))` to the `/projects` sub-router inside `src/handlers/mod.rs`.

### Step 3: Webhook Verification Engine
1. Register `POST /api/webhooks/github` in `src/handlers/mod.rs`.
2. Read SHA256 header and compare it with GitHub Webhook Secret to verify payload authenticity.
3. Parse commits for string tags like `[Verify: Core Development]` and toggle milestone state to `'verified'`.
