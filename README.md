# Todo Application

A modern Todo application built with React, TypeScript, and Express. This application allows users to create, manage, and track their tasks with a clean and responsive interface.

## Features

- Create, edit, and delete tasks
- Mark tasks as completed
- Responsive design built with Tailwind CSS and Shadcn/UI components
- Backend API using Express and MySQL

## Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- MySQL database

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/todo-app.git](https://github.com/miguelcano-dev/compare-database-structure.git
cd todo-app
```

2. Install dependencies:
```bash
npm install
# or if using pnpm
pnpm install
```

3. Configure your database:
   - Create a MySQL database
   - Update database connection in `server/index.js` if needed

## Running the Application

To run both the frontend and backend simultaneously:

```bash
npm run dev:all
# or if using pnpm
pnpm dev:all
```

This will start:
- Frontend development server on http://localhost:5173
- Backend API server on http://localhost:3000

### Running Frontend Only

```bash
npm run dev
# or
pnpm dev
```

### Running Backend Only

```bash
npm run server
# or
pnpm server
```

## Building for Production

```bash
npm run build
# or
pnpm build
```

This will generate a production-ready build in the `dist` directory.

## Technologies Used

- **Frontend**:
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
  - Shadcn/UI components
  - React Hook Form

- **Backend**:
  - Express
  - MySQL
  - Node.js

## Project Structure

- `/src` - Frontend React application
- `/server` - Backend Express API
- `/public` - Static assets

## License

MIT 
