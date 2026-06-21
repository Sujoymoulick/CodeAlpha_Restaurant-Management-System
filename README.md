# GourmetOS - Restaurant Management System

A production-ready Full-Stack Restaurant Management System built with **Node.js, Express.js, MongoDB (Mongoose)** for the backend and **Vite + React (Vanilla CSS)** for the frontend. 

This release includes two separate workspaces:
1. **Management Desk:** For waitstaff, cooks, and admins to configure menu items, manage tables, monitor live stock levels, and review sales analytics.
2. **Customer Portal (MVP):** For customers to register, sign in, search dishes, check table availability, schedule table bookings, place orders, and track preparation statuses.

---

## Features

### 1. Unified Showcase Landing Page
* Sleek, modern design with an interactive **glassmorphic CSS Dashboard Preview** that dynamically updates based on the active theme.
* Access links to launch either the **Customer Space** or the **Staff Desk**.
* Built-in **Light & Dark Mode** theme toggle.

### 2. Customer Workspace (MVP Showcase)
* **Authentication:** Customer registration and login using JWT session hashes.
* **Menu Browsing:** Interactive card list showing dish categories, prices, descriptions, and real-time inventory statuses. Includes pagination, category filtering, and keyword search.
* **Automated Table Seating:** Customer inputs their guest count, date, and time. GourmetOS automatically searches physical tables, resolves booking conflicts, and books the smallest optimal table.
* **Shopping Cart & Checkout:** Live subtotal calculations. Customer selects their seated table and places food orders.
* **Live Order Tracker:** Real-time tracking of kitchen workflow steps (`Pending` -> `Preparing` -> `Ready` -> `Served`) with estimated preparation times.

### 3. Management Workspace (Waitstaff/Admin)
* **Operational Dashboard:** Overview of table occupancy statistics, active order lists, and admin sales reports.
* **Menu Editor:** Full CRUD capabilities for configuring categories, pricing limits, and available state flags.
* **Table Map Editor:** Floor configuration tool to add tables, capacity rules, and override occupancy statuses.
* **Waitlist Planner:** Centralized list of customer bookings with cancellation controls.
* **Order Ticketing Drawer:** Waitstaff order creations and manual cooking state updates.
* **Inventory Control:** Manual restocking and automated ingredient depletions when orders are placed.
* **Sales Analytics (Admin Only):** Daily/Monthly sales counts, total revenue aggregation, top-selling items ranking, and safety threshold stock warnings.

---

## Folder Structure

```
restaurant-management-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # Staff accounts schema
│   │   ├── Customer.js           # Customer profiles schema
│   │   ├── MenuItem.js           # Dish prices schema
│   │   ├── Table.js              # Table number schema
│   │   ├── Reservation.js        # Bookings & slots schema
│   │   ├── Order.js              # Ticket items schema
│   │   └── Inventory.js          # Raw stock schema
│   ├── controllers/
│   │   ├── authController.js     # Staff authentication
│   │   ├── customerController.js # Customer auth, bookings, and orders
│   │   ├── menuController.js     # Menu CRUD, search, and pagination
│   │   ├── tableController.js    # Floor plan controls
│   │   ├── orderController.js    # Staff order flows
│   │   ├── inventoryController.js # Restocks and stock levels
│   │   └── reportController.js   # Sales aggregations
│   ├── routes/
│   │   ├── authRoutes.js         # Staff authentication
│   │   ├── customerRoutes.js     # Customer auth (/api/customers)
│   │   ├── bookingRoutes.js      # Customer bookings (/api/bookings)
│   │   ├── menuRoutes.js         # Menu endpoints (/api/menu)
│   │   ├── tableRoutes.js        # Table endpoints (/api/tables)
│   │   ├── orderRoutes.js        # Order endpoints (/api/orders)
│   │   ├── inventoryRoutes.js    # Inventory endpoints (/api/inventory)
│   │   └── reportRoutes.js       # Reports (/api/reports)
│   ├── middleware/
│   │   ├── errorHandler.js       # Express error parser
│   │   ├── authMiddleware.js     # JWT validation (Staff/Customer/Combined)
│   │   └── validationMiddleware.js # express-validator compiler
│   ├── services/
│   │   └── inventoryService.js   # Recipe ingredient stock reductions
│   ├── utils/
│   │   └── responseFormatter.js  # Unified JSON contracts
│   ├── .env                      # Environment config
│   ├── seed.js                   # Mock database seeder
│   └── server.js                 # Express server entrance (Port 5050)
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── LandingPage.jsx   # Public showcase
    │   │   ├── Login.jsx         # Staff desk sign-in
    │   │   ├── Dashboard.jsx     # Staff dashboard & reports
    │   │   ├── Menu.jsx          # Staff menu editor
    │   │   ├── Tables.jsx        # Staff table layout manager
    │   │   ├── Reservations.jsx  # Staff booking list
    │   │   ├── Orders.jsx        # Staff order tracker
    │   │   ├── Inventory.jsx     # Staff stock manager
    │   │   └── customer/
    │   │       ├── CustomerAuth.jsx   # Customer sign-in/register
    │   │       ├── CustomerMenu.jsx   # Customer menu & cart checkout
    │   │       ├── CustomerBookings.jsx # Customer booking form
    │   │       └── CustomerOrders.jsx # Customer order tracker
    │   ├── services/
    │   │   └── api.js            # Axios-like token request client
    │   ├── App.jsx               # Navigation layouts
    │   ├── index.css             # Main styling & theme variables
    │   └── main.jsx              # Vite entry
    ├── index.html
    └── vite.config.js            # Frontend server (Port 3000)
```

---

## Installation & Setup

### Prerequisites
* **Node.js** (v16.x or higher)
* **MongoDB** (Local instance or MongoDB Atlas cluster connection string)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`. You can copy `.env.example` to start:
   ```bash
   cp .env.example .env
   ```
   Modify `.env` to match your requirements. Especially, update the `MONGO_URI` to your MongoDB Atlas connection string if you wish to run it on a cloud database cluster:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/restaurant_management?retryWrites=true&w=majority
   ```
4. **Seed the database** to populate default tables, menu items, users, and ingredient stocks:
   ```bash
   node seed.js
   ```
   *Seeded credentials:*
   * **Admin User:** Username: `admin` | Password: `adminpassword`
   * **Staff User:** Username: `staff` | Password: `staffpassword`
5. Start the backend:
   ```bash
   npm run dev
   ```
   The backend will connect to MongoDB and start listening on `http://localhost:5050`.

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`. You can copy `.env.example` to start:
   ```bash
   cp .env.example .env
   ```
   *Vite environment configurations:*
   ```env
   VITE_API_BASE_URL=http://localhost:5050/api
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
   The application will start listening on `http://localhost:3000`.

---

## API Documentation & Contract

### Success JSON Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error JSON Format
```json
{
  "success": false,
  "message": "Detailed error description"
}
```

### Key Customer Endpoints

#### 1. Authentication
* `POST /api/customers/register` - Create customer account
* `POST /api/customers/login` - Retrieve session token
* `GET /api/customers/profile` - Read customer profile (Bearer Customer Token required)
* `PUT /api/customers/profile` - Update profile address or details

#### 2. Table Booking
* `POST /api/bookings` - Book a table. Customer inputs party size, date, and time. GourmetOS automatically matches and assigns an available table.
* `GET /api/bookings/my-bookings` - Retrieve user reservations.
* `DELETE /api/bookings/:id` - Cancel reservation.

#### 3. Orders & Tracking
* `POST /api/orders` - Place order. Automatically decodes customer profile, links order, computes subtotal and taxes, and deplets inventory ingredients.
* `GET /api/orders/my-orders` - Read user orders.
* `GET /api/orders/:id` - Retrieve order progress steps (`Pending` -> `Preparing` -> `Ready` -> `Served`) and estimated preparation times.
