# StreamFlix - Movie Streaming Platform

## Overview

StreamFlix is a Netflix-inspired movie streaming platform built with a React frontend and Express backend. The application allows users to browse and watch movies, while authenticated administrators can manage the movie catalog through a protected admin panel. The platform supports both regular movies and TV series with episode management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with a Netflix-inspired dark theme using CSS variables
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy, session-based auth using express-session
- **Session Storage**: MemoryStore (development) with connect-pg-simple available for production
- **Password Security**: Scrypt hashing with timing-safe comparison
- **API Pattern**: RESTful routes with type-safe contracts defined in shared/routes.ts

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: shared/schema.ts contains all database table definitions
- **Validation**: Drizzle-Zod for automatic schema-to-validation integration
- **Migrations**: Drizzle Kit for database schema management (run with `npm run db:push`)

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components including shadcn/ui
│       ├── hooks/        # Custom React hooks (auth, movies, etc.)
│       ├── pages/        # Route components (Home, Watch, Login, Admin)
│       └── lib/          # Utilities and query client setup
├── server/           # Express backend
│   ├── auth.ts       # Authentication setup
│   ├── routes.ts     # API route handlers
│   ├── storage.ts    # Data access layer (IStorage interface)
│   └── db.ts         # Database connection
└── shared/           # Shared code between client and server
    ├── schema.ts     # Drizzle database schema
    └── routes.ts     # API contract definitions
```

### Key Design Decisions

1. **Shared Type Contracts**: The `shared/routes.ts` file defines API endpoints with Zod schemas, enabling type-safe API calls and runtime validation on both client and server.

2. **Storage Abstraction**: The `IStorage` interface in `server/storage.ts` abstracts data operations, allowing easy switching between in-memory storage (MemStorage) and database storage (DatabaseStorage via Drizzle).

3. **Component Architecture**: Uses Shadcn/ui's approach of copying component source code into the project, allowing full customization while maintaining accessibility through Radix UI primitives.

4. **Video Embedding**: The Watch page supports multiple video sources including YouTube embeds, Google Drive, and direct video URLs with automatic format detection.

## External Dependencies

### Database
- **PostgreSQL**: Required for production data persistence
- **Connection**: Uses `DATABASE_URL` environment variable
- **Schema Management**: Drizzle Kit handles migrations via `npm run db:push`

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Secret for session encryption (defaults to fallback in development)

### Key NPM Packages
- **Frontend**: React, Wouter, TanStack Query, Tailwind CSS, Radix UI components
- **Backend**: Express, Passport, Drizzle ORM, pg (PostgreSQL client)
- **Shared**: Zod for validation, drizzle-zod for schema integration

### Development Tools
- **Vite**: Development server with HMR
- **esbuild**: Production bundling for server code
- **TypeScript**: Full type coverage across the stack