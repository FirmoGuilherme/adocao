# Adocão Platform Backend

Production-ready backend for the Adocão pet adoption platform. Developed with Python 3.13, FastAPI, and PostgreSQL 16. The architecture strictly follows Clean Architecture and SOLID principles.

## Getting Started

### 1. Run the Docker Environment

```bash
docker-compose up --build -d
```

### 2. Run Database Migrations

You can use the initial auto-migration schema via Alembic:

```bash
docker exec -it adocao_backend alembic revision --autogenerate -m "Initial migration"
docker exec -it adocao_backend alembic upgrade head
```
*(Note: Since `seed.py` creates tables directly using SQLAlchemy if they don't exist, this step is optional for local dev but good practice)*

### 3. Seed Database

Populate the database with mock data: Users, Shelters, and Pets.

```bash
docker exec -it adocao_backend python seed.py
```

### 4. Access the API

The interactive documentation will be available at:

[http://localhost:8000/docs](http://localhost:8000/docs)

## Architecture Overview

- **app/core/:** Settings and generic singletons (DatabaseConnection)
- **app/domain/:** Pure enums, entities, and interfaces (RepositoryPattern, StrategyPattern)
- **app/infrastructure/:** Database models (SQLAlchemy), implementation of UnitOfWork, concrete Repositories.
- **app/application/:** Business use cases, DTOs, FactoryPattern, and Services processing rules.
- **app/presentation/:** FastAPI application router dependencies and definitions.
