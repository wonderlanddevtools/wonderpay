# WonderPay

WonderPay is a payment processing platform built using the [T3 Stack](https://create.t3.gg/) and integrated with the [Monite API](https://docs.monite.com/) for financial operations.

## Features

- Monite API integration for invoicing and payment processing
- Entity and user management system
- Secure authentication using NextAuth.js
- Type-safe database operations with Prisma
- Responsive UI built with Tailwind CSS

## Tech Stack

- [Next.js](https://nextjs.org) - React framework for server-rendered applications
- [NextAuth.js](https://next-auth.js.org) - Authentication solution
- [Prisma](https://prisma.io) - Type-safe ORM for database access
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [tRPC](https://trpc.io) - End-to-end typesafe API
- [Monite API](https://docs.monite.com/) - Financial operations platform

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker (for local database)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Update `.env` with your Monite API credentials:
   ```
   MONITE_CLIENT_ID=your_client_id
   MONITE_CLIENT_SECRET=your_client_secret
   MONITE_ENTITY_ID=your_entity_id (optional)
   ```
5. Start the database:
   ```bash
   ./start-database.sh
   ```
6. Push the database schema:
   ```bash
   npm run db:push
   ```
7. Start the development server:
   ```bash
   npm run dev
   ```

## Monite API Integration

WonderPay uses the Monite API for financial operations. The integration includes:

1. Secure token generation and management
2. Entity and user creation
3. React components for Monite UI

### Configuration

The Monite API requires authentication tokens for all operations. WonderPay includes:

- Server-side token generation endpoints
- Client-side hooks for using the Monite SDK
- React components for Monite UI integration

## Learn More

- [Monite API Documentation](https://docs.monite.com/)
- [T3 Stack Documentation](https://create.t3.gg/)
