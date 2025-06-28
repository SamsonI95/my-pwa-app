# Inventory Management PWA

A modern, offline-first Progressive Web App (PWA) for inventory management in warehouses or retail stores, built with React, Vite, Tailwind CSS, and a mock REST API using json-server. The app supports full CRUD operations, works offline, and syncs changes when connectivity is restored.

---

## Features

- **Inventory Management:** Add, edit, and delete inventory items with quantity tracking.
- **Offline Support:** All actions work offline using IndexedDB for local storage.
- **Sync on Reconnect:** Changes made offline are marked as "Pending Sync" and automatically synchronized with the backend when you go online.
- **Network Status Detection:** Real-time online/offline status indicator.
- **Installable PWA:** Can be installed on desktop or mobile devices.
- **Modern Tooling:** Fast development and build with Vite, UI with React 19 and Tailwind CSS, code linting with ESLint.
- **Mock REST API:** Uses json-server for local API simulation.

---

## Tech Stack

- **React 19** – UI library
- **Vite** – Build tool and dev server
- **Tailwind CSS** – Utility-first CSS framework
- **IndexedDB (via idb)** – Local storage for offline support
- **json-server** – Mock REST API for development
- **ESLint** – Code linting
- **Service Worker** – For offline caching (PWA)

---

## How It Works

- When online, the app fetches inventory items from the mock API and displays them.
- When offline, all changes (add/edit/delete) are stored locally and marked as "Pending Sync."
- When you go back online, all pending changes are automatically synchronized with the backend API.
- The app shows your current network status and which items are pending sync.

---

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm

### Installation

```sh
git clone https://github.com/SamsonI95/my-pwa-app.git
cd my-pwa-app
npm install
```

---

## Running the App

### 1. Start the Mock API

Open a terminal and run:

```sh
npm run mock-api
```

- The API will be available at [http://localhost:3001/api/items](http://localhost:3001/api/items)
- Data is stored in `db.json` in the project root.

### 2. Start the React App

Open a **second terminal** and run:

```sh
npm run dev
```

- The app will be available at [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
my-pwa-app/
├── public/
│   ├── service-worker.js      # Custom service worker for offline support
│   └── vite.svg               # App favicon
├── src/
│   ├── App.jsx                # Main React component (UI and logic)
│   ├── main.jsx               # App entry point and SW registration
│   ├── index.css              # Tailwind CSS import
│   ├── App.css                # (optional custom styles)
│   ├── assets/
│   │   └── react.svg          # React logo
│   └── manifest.json          # PWA manifest
├── db.json                    # Mock API data
├── routes.json                # Mock API route mapping
├── json-server-middleware.cjs # Middleware for CORS (mock API)
├── index.html                 # HTML template
├── package.json               # Project metadata and scripts
├── vite.config.js             # Vite configuration
└── README.md                  # Project documentation
```

---

## Customization

- **Icons:** Add your own icons to `public/` for PWA installation.
- **Theme:** Edit Tailwind classes in `App.jsx` or add custom styles in `App.css`.
- **Service Worker:** Customize caching strategies in `public/service-worker.js`.
- **API:** Replace the mock API with a real backend by updating the API URL in `src/inventoryStore.js`.

---

## Credits

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [json-server](https://www.npmjs.com/package/json-server)
- [idb](https://www.npmjs.com/package/idb)

---

## License

MIT
