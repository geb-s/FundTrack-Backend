# FundTrack Backend

FundTrack Backend is the server-side application that powers the FundTrack personal finance management system. It provides the necessary APIs and functionalities for managing users, transactions, categories, and authentication.

## Technologies and Frameworks

FundTrack Backend is built using the following technologies and frameworks:

- Nest.js: A progressive Node.js framework for building efficient, scalable, and maintainable server-side applications.
- TypeORM: An Object-Relational Mapping (ORM) library for TypeScript and JavaScript that simplifies database interactions.
- MySQL: A popular relational database management system used for storing and retrieving data.
- GraphQL: A query language and runtime for APIs that provides a flexible and efficient approach to data fetching.

## Project Structure

The project follows a structured organization with the following important folders:

- **auth**: Contains the authentication-related functionality mainly JWT token management.
- **categories**: Manages the transaction categories, such as income and expense types.
- **common**: Holds common utilities, interfaces, and enums used throughout the application.
- **transactions**: Handles the creation, retrieval, and management of financial transactions.
- **users**: Provides functionality for managing users, including user creation, retrieval, and updates.

Additionally, you'll find the following files:

- **package.json**: Lists the project's dependencies, scripts, and other metadata.

## Installation

To set up the backend application locally, follow these steps:

1. Clone the repository: `git clone <repository-url>`
2. Navigate to the project directory: `cd personal-finance-management-system-backend`
3. Install dependencies: `npm install`
4. Start the development server: `npm run start:dev`
5. Open your browser and visit: `http://localhost:3005`

Please ensure that you have MySQL installed and running, and update the `app.module.ts` file with your database configuration before starting the server.
