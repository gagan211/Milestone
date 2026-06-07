# Milestone Requirement Spec — Template

> This template defines the **minimum information a client must provide** when creating a milestone.
> MilestoneBot uses this spec as its ground truth for verification.
> Poorly written specs = poor verification results. This template enforces quality.

---

## How This Gets Used

1. **Client fills this out** when creating a milestone on the platform (via a structured form, not freeform text).
2. **Backend stores it** as a JSONB object in the `milestones.verification_config` column.
3. **MilestoneBot receives it** alongside the git diff when the developer submits for verification.

---

## Template Fields

### Required Fields

```json
{
  "title": "string — Short, specific name of the deliverable",
  "description": "string — 2-3 sentence summary of what must be built",
  "deliverable_type": "github_commit | github_pr | figma_file | url_check | manual",
  
  "acceptance_criteria": [
    "Each criterion is a single, verifiable statement",
    "Written as: 'The system MUST [do X] when [condition Y]'",
    "Minimum 3 criteria per milestone"
  ],
  
  "tech_constraints": {
    "language": "rust | python | typescript | go | etc.",
    "framework": "axum | fastapi | express | gin | etc.",
    "database": "postgresql | mongodb | redis | none",
    "architecture_notes": "Optional — e.g. 'All SQL must use include_str!, handlers must not contain DB logic'"
  }
}
```

### Optional Fields (Improve Verification Accuracy)

```json
{
  "anti_patterns": [
    "Must NOT use hardcoded/mock data",
    "Must NOT return static JSON without DB call",
    "Must NOT skip error handling"
  ],
  
  "related_files": [
    "src/handlers/profile.rs",
    "src/services/user_service.rs",
    "queries/get_developer_profile_full.sql"
  ],
  
  "sub_features": [
    {
      "name": "GET /api/profile/:userId",
      "required": true,
      "criteria": ["Must resolve 'me' keyword", "Must return 404 if profile not found"]
    },
    {
      "name": "PUT /api/profile/:userId",
      "required": true,
      "criteria": ["Must require authentication", "Must persist layout to JSONB column"]
    }
  ]
}
```

---

## Writing Good Acceptance Criteria

### ❌ Bad (Vague, unverifiable)
- "Build the profile page"
- "Make it work"
- "Add API endpoints"

### ✅ Good (Specific, checkable by an agent)
- "The GET /api/profile/:userId endpoint MUST return a JSON response with fields: id, name, title, score, stats, profile_data"
- "When the path parameter is 'me', the handler MUST extract the user ID from the JWT token"
- "The handler MUST return HTTP 401 if 'me' is requested without a valid Bearer token"
- "All database queries MUST be stored in .sql files and loaded via include_str!()"
- "Error responses MUST use appropriate HTTP status codes (400, 401, 404, 500)"

### ✅ For Frontend Milestones
- "The component MUST render a loading skeleton while data is being fetched"
- "The save button MUST be disabled while the mutation is in-flight"
- "The form MUST validate that the headline field is not empty before submitting"

---

## Example: Fully Specified Milestone

```json
{
  "title": "Developer Profile Fetch & Update Endpoints",
  "description": "Implement REST endpoints to fetch and update developer profile data. The profile layout is stored as JSONB in PostgreSQL and supports dynamic blocks (hero, markdown, project_showcase).",
  "deliverable_type": "github_commit",
  
  "acceptance_criteria": [
    "GET /api/profile/:userId returns the developer's full profile including stats and layout blocks",
    "When :userId is 'me', the handler resolves the authenticated user's UUID from the JWT token",
    "GET returns HTTP 401 if 'me' is requested without authentication",
    "GET returns HTTP 404 if the profile does not exist in the database",
    "PUT /api/profile/:userId requires a valid JWT and updates the profile_data JSONB column",
    "PUT returns the fully updated profile in the response body (read-after-write pattern)",
    "All database queries use include_str!() to load from .sql files",
    "Handlers delegate business logic to the UserService (no raw SQL in handlers)",
    "All error cases return appropriate HTTP status codes with descriptive messages"
  ],
  
  "tech_constraints": {
    "language": "rust",
    "framework": "axum",
    "database": "postgresql",
    "architecture_notes": "Handlers in src/handlers/, services in src/services/, DTOs in src/dto/, SQL in queries/"
  },
  
  "anti_patterns": [
    "Must NOT return hardcoded/static JSON responses",
    "Must NOT use unwrap() without fallback on user-facing paths",
    "Must NOT put database query logic directly in handler functions"
  ],
  
  "sub_features": [
    {
      "name": "GET /api/profile/:userId",
      "required": true,
      "criteria": [
        "Resolves 'me' keyword to authenticated user UUID",
        "Fetches profile from PostgreSQL via UserService",
        "Returns 404 for missing profiles",
        "Returns structured ProfileResponse JSON"
      ]
    },
    {
      "name": "PUT /api/profile/:userId",
      "required": true,
      "criteria": [
        "Requires valid JWT authentication",
        "Accepts UpdateProfilePayload JSON body",
        "Persists profile_data to JSONB column in users table",
        "Returns the updated profile after saving (read-after-write)"
      ]
    }
  ]
}
```
