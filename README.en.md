# Demosratio

[Leer en español](README.md)

An online tool to verify compliance with political promises and decisions, fostering transparency and citizen participation.

## What problem does it solve?

Demosratio aims to solve the lack of transparency in politics, allowing citizens to be informed clearly and objectively about the promises of politicians and the decisions they make. The platform avoids the political filters of the current press, providing direct access to information and facilitating citizen participation.

## How does it work?

Demosratio collects and organizes information about the electoral promises of politicians and the decisions they make in government. Users can easily access this information, verify official sources, and participate in voting simulations.

## Features

- **Clear and accessible information**: Database with promises and decisions, linked to official sources.
- **Easy tracking**: Status of promises (fulfilled, unfulfilled, in progress) and results of decisions (approved, rejected, in progress).
- **Citizen participation**: Contribution of verifiable information, reports of manipulation, and voting simulations.
- **Data visualization**: Interactive graphs and tables to analyze information.
- **Website sections**:
  - Homepage: Cards to show recent promises and decisions.
  - Votes in congress: Decisions sorted by date. With search by file text.
  - Electoral promises: Promises and decisions grouped by topics.
  - Data visualization: Interactive graphs and tables, when votes are clicked.
  - Manifesto: Information about the project and its creators.

## Technologies

- **Frontend**: Next.js, Typescript
- **Backend**: Next.js, Supabase

## First Installation

- Create an account on Supabase.
- Set up a project in Supabase and create a .env file at the root of the codebase.
- In Supabase: Navigate to Configuration > DATA API, then copy the Project URL and two Project API keys.
- In the code: Run npm run dev and visit `http://localhost:3000/api/create-tables`.

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Application Configuration
DAYS_TO_CHECK_VOTES=30 # Number of days to check prior congressional votes
JWT_KEY=<RANDOM_STRING>
ENCRYPTION_KEY=<GENERATED_ENCRYPTION_KEY> #openssl rand -base64 64 | tr -dc 'a-zA-Z0-9' | head -c 64
```

- Create a project in Supabase
- Log in via console using: `npx supabase login`
- Go to Supabaseand search Database > Migrations and follow all steps adding `npx` at the beginning
  - `npx supabase link --project-ref <TU_PROJECT_REF>`
  - `npx supabase migration new new-migration`
  - Go to `supabase/migrations/<ID>_new-migration.sql` and paste the content of `schema.sql`
  - `npx supabase db push`

## Database

```mermaid
erDiagram
    campaigns {
        bigint id PK
        timestamp created_at
        bigint year NOT NULL
        bigint party_id FK
        varchar campaign_pdf_url
    }

    parties {
        bigint id PK
        timestamp created_at
        text name UNIQUE NOT NULL
        text logo_url
    }

    promises {
        bigint id PK
        timestamp created_at
        bigint campaign_id FK
        bigint subject_id FK
        text promise NOT NULL
        bigint party_id FK
    }

    promises_readiness_index {
        bigint id PK
        timestamp created_at
        bigint campaign_id FK
        bigint user_id FK
        bigint readiness_score
    }

    proposal_dislikes {
        bigint id PK
        timestamp created_at
        bigint proposal_id FK
        bigint user_id FK
    }

    proposal_likes {
        bigint id PK
        timestamp created_at
        bigint proposal_id FK
        bigint user_id FK
    }

    proposals {
        bigint id PK
        text title NOT NULL
        text url NOT NULL
        bigint session DEFAULT 0 NOT NULL
        text expedient_text NOT NULL
        jsonb votes_parties_json NOT NULL
        bigint parliament_presence NOT NULL
        bigint votes_for NOT NULL
        bigint abstentions NOT NULL
        bigint votes_against NOT NULL
        bigint no_vote NOT NULL
        boolean assent
        timestamp date DEFAULT now() NOT NULL
        text BOE
    }

    subjects {
        bigint id PK
        timestamp created_at
        text name UNIQUE NOT NULL
        varchar description
    }

    user_devices {
        bigint id PK
        bigint user_id FK
        varchar device_hash UNIQUE NOT NULL
        timestamp added_at DEFAULT now() NOT NULL
    }

    users {
        bigint id PK
        timestamp register_date DEFAULT now() NOT NULL
        text name NOT NULL
        text password
        boolean is_admin DEFAULT false
    }

    campaigns ||--|| parties : "has"
    promises ||--|| campaigns : "belongs to"
    promises ||--|| parties : "made by"
    promises ||--|| subjects : "categorized as"
    promises_readiness_index ||--|| campaigns : "evaluates"
    promises_readiness_index ||--|| users : "created by"
    proposal_dislikes ||--|| proposals : "targets"
    proposal_dislikes ||--|| users : "created by"
    proposal_likes ||--|| proposals : "targets"
    proposal_likes ||--|| users : "created by"
    user_devices ||--|| users : "belongs to"
```

## Installation

1.  Clone the repository: `git clone git@github.com:gabrielmoris/Demosratio.git`
2.  Navigate to the project directory: `cd Demosratio`
3.  Install dependencies: `bun install`
4.  Start the development server: `bun run next dev`

## Contribution

Contributions are welcome! If you want to contribute to the project, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your contribution: `git checkout -b my-contribution`
3.  Make your changes and make sure the tests pass.
4.  Submit a pull request with a clear description of your changes.

## License

This project is under the GNU General Public License v3.0.

## Creators

- Gabriel Moris

## Contact

You can contact us through our GitHub profile: [https://github.com/gabrielmoris](https://github.com/gabrielmoris)

## Branching convention

We will use the following branching convention:

- `main`: Main branch with production code.
- `develop`: Development branch where changes are integrated.
- `feature/feature-name`: Branches to develop new features.
- `bugfix/error-name`: Branches to fix errors.

## Next steps

- Implement unit and integration tests.
- Configure the deployment process.
