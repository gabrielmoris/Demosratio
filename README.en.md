# Demosratio

An online tool to verify the fulfillment of political promises and decisions, promoting transparency and citizen participation.

## What problem does it solve?

Demosratio seeks to solve the lack of transparency in politics, allowing citizens to be informed clearly and objectively about the promises of politicians and the decisions they make. The platform avoids the political filters of the current press, providing direct access to information and facilitating citizen participation.

## How does it work?

Demosratio collects and organizes information on the electoral promises of politicians and the decisions they make in government. Users can access this information easily, verify official sources, and participate in mock votes.

## Features

- **Clear and accessible information**: Database with promises and decisions, linked to official sources.
- **Easy tracking**: Status of promises (fulfilled, unfulfilled, in progress) and results of decisions (approved, rejected, in progress).
- **Citizen participation**: Contribution of verifiable information, reports of manipulation, and mock votes.
- **Data visualization**: Interactive graphs and tables to analyze information.
- **Web sections**:
  - Main page: Summary of recent promises and decisions.
  - Timeline: Promises and decisions ordered by date.
  - Categories: Promises and decisions grouped by topic.
  - Data visualization: Interactive graphs and tables.
  - Mock votes: Simulated votes on current issues.
  - Information contribution: Form to add promises and decisions.
  - Manipulation reports: Form to report false information.
  - About: Information about the project and its creators.
  - Contact: Contact form.

## Technologies

- **Frontend**: Next.js, Typescript
- **Backend**: Express (or Next.js), Bun.js, Docker

## Installation

1.  Clone the repository: `git clone git@github.com:gabrielmoris/Demosratio.git`
2.  Navigate to the project directory: `cd demosratio`
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

You can contact us through our GitHub profile: <https://github.com/gabrielmoris>

## Branching convention

We will use the following branching convention:

- `main`: Main branch with production code.
- `develop`: Development branch where changes are integrated.
- `feature/feature-name`: Branches to develop new features.
- `bugfix/bug-name`: Branches to fix bugs.

## Next steps

- Define the code structure and main directories of the repository.
- Establish code style rules with ESLint and Prettier.
- Implement unit and integration tests.
- Configure the deployment process.
