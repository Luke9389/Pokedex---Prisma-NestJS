# Pokedex Practice Project - Claude Instructions

## User Learning Preferences

- Provide clear, step-by-step instructions
- Explain what each command/code does
- Let the user execute commands and write code themselves
- This hands-on approach helps build familiarity with the technologies

## Project Goal

Build a Pokedex application to practice TypeScript, NestJS, and Prisma before a technical assessment. The user is strong in JavaScript but new to these specific technologies.

## Technologies Being Practiced

- **TypeScript** - Type-safe JavaScript
- **Node.js** - Runtime environment
- **NestJS** - Backend framework (similar to Express but more opinionated)
- **Prisma** - Modern ORM for database operations
- **SQLite** - Simple file-based database (no server needed)
- **Git/GitHub** - Version control (user already familiar)

## Project Overview

A Pokedex that fetches Pokemon data from the PokeAPI (https://pokeapi.co/) and stores it in a local database.

### Features to Build:

1. **Fetch Pokemon from External API**
   - Practice async/await in TypeScript
   - HTTP requests to external API
   - Data transformation

2. **Store Pokemon in Database**
   - Prisma schema definition
   - Database migrations
   - CRUD operations

3. **REST API Endpoints:**
   - `GET /pokemon` - List all Pokemon in Pokedex
   - `POST /pokemon/fetch` - Fetch Pokemon from PokeAPI and save to DB
   - `PATCH /pokemon/:number/catch` - Mark a Pokemon as caught/uncaught
   - `GET /pokemon/:number` - Get specific Pokemon details

### Data Model:

```prisma
model Pokemon {
  id        Int      @id @default(autoincrement())
  number    Int      @unique
  name      String
  imageUrl  String
  caught    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

## Implementation Plan

### Phase 1: Setup
- [x] Install NestJS CLI
- [x] Create new NestJS project
- [x] Install Prisma
- [x] Initialize Prisma with SQLite
- [x] Define Pokemon schema
- [x] Run initial migration

### Phase 2: Prisma Service
- [ ] Generate Prisma Client
- [ ] Create PrismaService in NestJS
- [ ] Set up proper module configuration

### Phase 3: Pokemon Module
- [ ] Generate Pokemon module, controller, and service
- [ ] Inject PrismaService into PokemonService
- [ ] Implement database operations (CRUD)

### Phase 4: External API Integration
- [ ] Install HTTP client (axios or native fetch)
- [ ] Create method to fetch from PokeAPI
- [ ] Parse and transform API response
- [ ] Store fetched data using Prisma

### Phase 5: API Endpoints
- [ ] Implement GET /pokemon (list all)
- [ ] Implement POST /pokemon/fetch (fetch and store)
- [ ] Implement PATCH /pokemon/:number/catch (toggle caught status)
- [ ] Implement GET /pokemon/:number (get one)

### Phase 6: Testing
- [ ] Test all endpoints manually
- [ ] Practice making a PR-style commit
- [ ] Document any learnings

## Key Learning Points

- **TypeScript syntax**: types, interfaces, async/await
- **NestJS patterns**: modules, controllers, services, dependency injection
- **Prisma workflow**: schema → migrate → client → queries
- **Async operations**: Fetching external APIs and handling promises
- **REST API design**: HTTP methods, status codes, route parameters

## Notes for Assessment

The actual assessment will likely:
- Give you a pre-existing codebase (similar to this practice)
- Ask you to fetch data from a web API
- Require storing/manipulating that data
- Take 45-60 minutes
- Test your ability to work with unfamiliar code

By building this Pokedex, you'll practice all these skills in a fun way!
