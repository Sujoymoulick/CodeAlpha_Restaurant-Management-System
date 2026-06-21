const fs = require('fs');
const path = require('path');

// ANSI Colors
const reset = "\x1b[0m";
const bold = "\x1b[1m";
const green = "\x1b[32m";
const blue = "\x1b[34m";
const cyan = "\x1b[36m";
const yellow = "\x1b[33m";
const magenta = "\x1b[35m";

console.log(`${bold}${cyan}================================================================================${reset}`);
console.log(`${bold}${green}         🍳 GourmetOS - RESTAURANT MANAGEMENT SYSTEM ARCHITECTURE 🍳${reset}`);
console.log(`${bold}${cyan}================================================================================${reset}\n`);

console.log(`${bold}${yellow}1. OVERVIEW${reset}`);
console.log(`   GourmetOS is a full-stack, production-grade Restaurant Management System built`);
console.log(`   using the MERN stack (MongoDB, Express, React/Vite, Node.js). It separates operations`);
console.log(`   into two distinct workspace portals governed by role-based access controls.\n`);

console.log(`${bold}${yellow}2. THE TWO PORTALS${reset}`);
console.log(`   ${bold}${blue}A. Management Workspace (Staff & Admins)${reset}`);
console.log(`      Allows restaurant staff to manage active restaurant business operations:`);
console.log(`      • ${bold}Dashboard:${reset} Admins view daily/monthly sales metrics and inventory alerts.`);
console.log(`      • ${bold}Menu Editor:${reset} Admins manage category and pricing structures.`);
console.log(`      • ${bold}Table Layout:${reset} Staff update seating status (Available/Reserved/Occupied).`);
console.log(`      • ${bold}Reservations:${reset} Staff view and schedule in-house customer bookings.`);
console.log(`      • ${bold}Order Tickets:${reset} Waitstaff place and update orders (Pending -> Serving).`);
console.log(`      • ${bold}Raw Stock:${reset} Admin manages ingredient stocks and restocking thresholds.`);
console.log(`   ${bold}${blue}B. Customer Space (Seated/Remote Customers)${reset}`);
console.log(`      Allows customers to manage their dining experience independently:`);
console.log(`      • ${bold}Authentication:${reset} Secure customer signup and profile management.`);
console.log(`      • ${bold}Menu Browsing:${reset} Browse categorized menu items and live stock state.`);
console.log(`      • ${bold}Automated Booking:${reset} Automatic resolution and seating for bookings.`);
console.log(`      • ${bold}Cart & Checkout:${reset} Select seated table and order food items.`);
console.log(`      • ${bold}Live Order Tracker:${reset} Live status tracker for kitchen preparation.`);
console.log();

console.log(`${bold}${yellow}3. DATABASE SCHEMAS & UNIFIED USER MODEL${reset}`);
console.log(`   All user accounts are managed in a unified ${bold}User${reset} collection with three roles:`);
console.log(`   • ${bold}Admin:${reset} Full CRUD access on all routes, reports, and structural changes.`);
console.log(`   • ${bold}Staff:${reset} View menu, update table status, take orders, update preparation states.`);
console.log(`   • ${bold}Customer:${reset} Book tables, place orders, view their own order history.`);
console.log();

console.log(`${bold}${yellow}4. BACKEND FOLDER STRUCTURE${reset}`);
console.log(`   ${bold}${cyan}backend/config/${reset}          - Database connections.`);
console.log(`   ${bold}${cyan}backend/models/${reset}          - Database schemas (User, MenuItem, Table, Reservation, Order, Inventory).`);
console.log(`   ${bold}${cyan}backend/controllers/${reset}     - Business logic controllers.`);
console.log(`   ${bold}${cyan}backend/routes/${reset}          - REST endpoints separated by resources.`);
console.log(`   ${bold}${cyan}backend/middleware/${reset}      - JWT protect, customerProtect, staffProtect, and error handlers.`);
console.log(`   ${bold}${cyan}backend/services/${reset}        - Deducts stock automatically when orders are processed.`);
console.log();

console.log(`${bold}${yellow}5. FRONTEND PORTAL STRUCTURE${reset}`);
console.log(`   ${bold}${cyan}frontend/src/App.jsx${reset}     - Global session mount, sidebar state, and layout.`);
console.log(`   ${bold}${cyan}frontend/src/pages/${reset}      - Administrative modules (Dashboard, Menu, Tables, Inventory, etc.).`);
console.log(`   ${bold}${cyan}frontend/src/pages/customer/${reset} - Customer UI flows (Auth, Cart, Bookings, Orders).`);
console.log(`   ${bold}${cyan}frontend/src/services/api.js${reset} - Central fetch requester using bearer tokens.`);
console.log();

console.log(`${bold}${cyan}================================================================================${reset}`);
console.log(`${bold}${green}   To start dev servers: ${cyan}npm run dev${green} (in backend & frontend directories)${reset}`);
console.log(`${bold}${cyan}================================================================================${reset}`);
