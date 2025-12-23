# Stily Shop

Full-stack e-commerce web application implemented as an **Angular SPA** with a **Go REST API** backend and a **Microsoft SQL Server** database.  
The project demonstrates end-to-end web development: REST API design, DB integration, transactional order flow, and SQL-based analytics.

---

## Tech Stack

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![Microsoft%20SQL%20Server](https://img.shields.io/badge/Microsoft%20SQL%20Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![sqlx](https://img.shields.io/badge/sqlx-4B5563?style=for-the-badge&logo=go&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

---

## About the Project

**Stily Shop** is an online clothing store built as a full-stack application.  
The backend is developed in Go and exposes REST endpoints for product catalog, administration (add/delete products), checkout, payment confirmation, and analytics.  
The frontend is an Angular SPA that consumes the API and provides separate customer and admin flows.

The backend follows a layered architecture with a clear separation between HTTP handlers, business logic, and data access repositories.

---

## Functional Overview

### Customer side
- Product catalog (active products)
- Product details with variants
- Shopping cart with quantity management
- Multi-step checkout
- Order creation with a public identifier
- Payment confirmation flow

### Admin side
- Product management (create / delete)
- Orders and customers overview
- Analytical dashboard with aggregated KPIs

---

## Backend Architecture

The Go backend is structured using a repository-based approach:

- `cmd/server` — entry point (`main.go`)
- `internal/config` — environment config and DB setup
- `internal/http` — router, middleware, handlers
- `internal/repo` — sqlx repositories with parameterized SQL queries
- `internal/core` — domain models and business logic
- `pkg/respond` — unified JSON response helpers

A single database connection pool is created at startup and injected into repositories.

---

## Database

Database: **Microsoft SQL Server**

Core tables:
- `products`
- `orders`
- `order_items`
- `customers`
- `addresses`

Order creation and item insertion are executed inside a SQL transaction.

---

## Analytics Module

Analytics is implemented on the **database level** using SQL (CTEs, window functions, aggregations).  
The backend exposes `/api/analytics/*` endpoints that return ready-to-use JSON aggregates.

Implemented analytics:
- Monthly revenue
- Unique customers count
- Average and median order value
- Day with minimum / maximum customers
- Most frequently purchased product
- “Bought together with the most popular” products
- Most frequent and rare product pairs
- Revenue and customers by day
- Payment and delivery method distributions

---

## Repository Structure

stily_shop/
  front/        # Angular SPA
  server/       # Go REST API
  README.md

---

## Getting Started (Development)

### Backend
cd server
cp .env.example .env
go mod tidy
go run .

Backend will be available at http://localhost:8080.

### Frontend
cd ../front
npm install
npm start

Frontend will be available at http://localhost:4200.

--- 

## Environment Configuration

PORT=8080
ALLOWED_ORIGINS=http://localhost:4200,http://127.0.0.1:5173

DB_AUTH=windows
DB_HOST=127.0.0.1
DB_PORT=1433
DB_NAME=STILY_SHOP
DB_ENCRYPT=true
TRUST_SERVER_CERT=true

---

## API Overview (Selected Endpoints)

| Method | Endpoint | Description |
|------:|----------|-------------|
| GET | /api/products | Get active product catalog |
| POST | /api/products | Create product (admin) |
| DELETE | /api/products/{id} | Delete product (admin) |
| POST | /api/orders | Create order |
| POST | /api/orders/{publicId}/pay | Confirm payment |
| GET | /api/analytics/summary | KPI summary |
| GET | /api/analytics/customers-by-day | Customers by day |
| GET | /api/analytics/revenue-by-day | Revenue by day |

---

## Project Status

Core functionality of the application is implemented and fully operational:
- product catalog and administration
- order checkout and payment confirmation flow
- database-backed analytics module
- Angular SPA integration with Go REST API

Additional features and UI pages are planned but not yet implemented:
- product search
- contact / feedback page
- extended user profile pages
- UI and UX refinements

---
