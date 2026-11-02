# SQL Server Production DBA Academy

A self-paced learning site for SQL Server database administration, built with Next.js 16, React 19, JavaScript, and Tailwind CSS. Course state is stored in browser `localStorage`; no database, account, API key, or paid service is required.

## Requirements

- Node.js 20.9 or newer (Next.js 16 requirement)
- npm
- SQL Server Developer Edition and SSMS for hands-on SQL labs (optional for browsing)

Use Developer Edition for local learning only. It is not licensed for production workloads.

## Install and run

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The site can be browsed without a SQL Server instance; database exercises require a separately installed local lab instance.

## Available sections

- 20 chapter learning modules and chapter assignments
- 60-day guided roadmap with daily objectives and completion state
- 50 practical labs
- 20 interactive production incident simulations
- SQL script library with copy and download actions
- 200-question interview and assessment bank, plus a 50-question final exam view
- Searchable glossary, notes, bookmarks, dashboard, and progress report

Learning state is stored under the `dba-academy-progress` key in the current browser. It is not synchronized to other devices. Clearing browser data removes saved progress. The reset action on My Progress clears the academy's saved state for this site.

## Development and production build

```powershell
npm run lint
npm run build
npm run start
```

`npm run start` serves the last successful production build. No environment variables are required.

## Deploy to Vercel

1. Push this project to a Git provider account you control.
2. In Vercel, import the repository and keep the detected Next.js framework preset.
3. Use `npm install` as the install command and `npm run build` as the build command; the output directory is managed by Next.js.
4. No environment variables are needed. Deploy and verify the site on the generated preview URL before promoting it.

Alternatively, install the Vercel CLI and run `vercel` from the project directory, then follow the authenticated prompts. Do not commit credentials or secrets.

## Accuracy and safety

Examples are educational starting points, not a production runbook. Verify SQL Server version, edition, permissions, and current Microsoft documentation before applying a procedure. Destructive or configuration-changing exercises belong only in an isolated lab. Key references:

- [SQL Server documentation](https://learn.microsoft.com/en-us/sql/sql-server/)
- [Backup and restore](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/)
- [Database Engine](https://learn.microsoft.com/en-us/sql/database-engine/)
- [SQL Server Management Studio](https://learn.microsoft.com/en-us/sql/ssms/)
- [SQL Server PowerShell](https://learn.microsoft.com/en-us/powershell/sql-server/)
