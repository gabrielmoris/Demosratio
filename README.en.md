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
  - Homepage: Summary of recent promises and decisions.
  - Votes in congress: Decisions sorted by date. With search by file text.
  - Electoral promises: Promises and decisions grouped by topics.
  - Data visualization: Interactive graphs and tables, when votes are clicked.
  - Voting simulations: Simulated votes on current issues.
  - Information contribution: Form to add promises and decisions. (NO MVP)
  - Manipulation reports: Form to report false information. (NO MVP)
  - Manifesto: Information about the project and its creators.
  - Contact: Contact form.

## Technologies

- **Frontend**: Next.js, Typescript
- **Backend**: Express (or Next.js), Bun.js, Docker

## Database

```mermaid
erDiagram
    users {
        int id PK
        varchar email
        varchar password
        date register_date
    }

    user_devices {
        int id PK
        int user_id FK
        varchar device_hash UNIQUE
        timestamp added_at
    }

    political_parties {
        int id PK
        varchar name
        text logo
        varchar abbreviation UNIQUE
    }

    sources {
        int id PK
        text url
        date date
        int user_id FK
        varchar source_type
    }

    proposals {
        int id PK
        text title
        text url
        int session
        text expedient_text
        jsonb votes_parties_json
        int parliament_presence
        int votes_for
        int abstentions
        int votes_against
        int no_vote
        boolean assent
        date date
    }

    proposal_likes {
        int id PK
        int proposal_id FK
        int user_id FK
        timestamp created_at
    }

    proposal_dislikes {
        int id PK
        int proposal_id FK
        int user_id FK
        timestamp created_at
    }

    promises {
        int id PK
        text text
        text url
        int political_party_id FK
        date date
    }

    promises_status_reached {
        int id PK
        int promise_id FK
        int user_id FK
        timestamp created_at
    }

    promises_status_not_reached {
        int id PK
        int promise_id FK
        int user_id FK
        timestamp created_at
    }

    users ||--o{ user_devices : "one-to-many"
    users ||--o{ sources : "one-to-many"
    users ||--o{ proposal_likes : "one-to-many"
    users ||--o{ proposal_dislikes : "one-to-many"
    users ||--o{ promises_status_reached : "one-to-many"
    users ||--o{ promises_status_not_reached : "one-to-many"
    political_parties ||--o{ promises : "one-to-many"
    proposals ||--o{ proposal_likes : "one-to-many"
    proposals ||--o{ proposal_dislikes : "one-to-many"
    promises ||--o{ promises_status_reached : "one-to-many"
    promises ||--o{ promises_status_not_reached : "one-to-many"
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
