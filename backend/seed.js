require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Inventory = require('./models/Inventory');
const Reservation = require('./models/Reservation');
const Order = require('./models/Order');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_management');
    console.log('Connected to database for seeding...');

    // Clear existing collections and drop indexes
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    for (const name of ['users', 'customers', 'menuitems', 'tables', 'inventories', 'reservations', 'orders']) {
      if (collectionNames.includes(name)) {
        await mongoose.connection.db.dropCollection(name);
        console.log(`Dropped collection: ${name}`);
      }
    }
    console.log('Cleared existing collections and indexes.');

    // 1. Seed Users (Admin & Staff)
    // Passwords will be automatically hashed in pre-save hooks
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      phone: '+15550001',
      password: 'adminpassword',
      role: 'Admin'
    });

    const staffUser = await User.create({
      name: 'Kitchen Staff',
      email: 'staff@example.com',
      phone: '+15550002',
      password: 'staffpassword',
      role: 'Staff'
    });

    console.log('Admin and Staff seeded successfully: admin@example.com/adminpassword, staff@example.com/staffpassword');

    // 2. Seed Customer (Temporary / Default Customer)
    // Passwords will be automatically hashed in pre-save hooks
    const defaultCustomer = await Customer.create({
      name: 'John Doe',
      email: 'customer@example.com',
      phone: '+15551234',
      password: 'customerpassword',
      address: '123 Main Street, Cityville',
      role: 'Customer'
    });

    console.log('Customer seeded successfully: customer@example.com/customerpassword');

    // 3. Seed Menu Items
    const menuItems = [
      { name: 'Burger', description: 'Juicy beef patty, burger bun, lettuce, tomato and cheese slice.', category: 'Main Course', price: 12.99, available: true },
      { name: 'Pizza', description: 'Freshly baked dough, pepperoni, mozzarella cheese and pizza sauce.', category: 'Main Course', price: 15.49, available: true },
      { name: 'Pasta', description: 'Penne noodles mixed in rich marinara sauce, topped with parmesan cheese.', category: 'Main Course', price: 11.99, available: true },
      { name: 'Salad', description: 'Crisp green salad with fresh lettuce, tomatoes and dressing.', category: 'Starter', price: 7.99, available: true },
      { name: 'Soda', description: 'Refreshing carbonated soft drink.', category: 'Beverage', price: 2.49, available: true }
    ];

    const seededMenuItems = await MenuItem.insertMany(menuItems);
    console.log('Menu items seeded successfully.');

    // 4. Seed Dining Tables
    const tables = [
      { tableNumber: 1, capacity: 2, status: 'Available' },
      { tableNumber: 2, capacity: 2, status: 'Available' },
      { tableNumber: 3, capacity: 4, status: 'Available' },
      { tableNumber: 4, capacity: 4, status: 'Available' },
      { tableNumber: 5, capacity: 6, status: 'Available' },
      { tableNumber: 6, capacity: 6, status: 'Available' },
      { tableNumber: 7, capacity: 8, status: 'Available' },
      { tableNumber: 8, capacity: 10, status: 'Available' }
    ];

    await Table.insertMany(tables);
    console.log('Dining tables seeded successfully.');

    // 5. Seed Inventory items (raw ingredients mapping to menu recipes)
    const inventory = [
      { itemName: 'Burger Buns', quantity: 50, unit: 'pcs', lowStockThreshold: 10 },
      { itemName: 'Beef Patty', quantity: 50, unit: 'pcs', lowStockThreshold: 10 },
      { itemName: 'Cheese Slices', quantity: 100, unit: 'pcs', lowStockThreshold: 20 },
      { itemName: 'Lettuce', quantity: 15, unit: 'kg', lowStockThreshold: 3 },
      { itemName: 'Pizza Dough', quantity: 40, unit: 'pcs', lowStockThreshold: 8 },
      { itemName: 'Mozzarella Cheese', quantity: 20, unit: 'kg', lowStockThreshold: 5 },
      { itemName: 'Tomato Sauce', quantity: 30, unit: 'liters', lowStockThreshold: 5 },
      { itemName: 'Pepperoni', quantity: 10, unit: 'kg', lowStockThreshold: 2 },
      { itemName: 'Pasta Noodles', quantity: 25, unit: 'kg', lowStockThreshold: 5 },
      { itemName: 'Parmesan Cheese', quantity: 5, unit: 'kg', lowStockThreshold: 1 },
      { itemName: 'Tomatoes', quantity: 15, unit: 'kg', lowStockThreshold: 4 },
      { itemName: 'Olive Oil', quantity: 10, unit: 'liters', lowStockThreshold: 2 },
      { itemName: 'Soda Can', quantity: 120, unit: 'pcs', lowStockThreshold: 24 }
    ];

    await Inventory.insertMany(inventory);
    console.log('Raw inventory items seeded successfully.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
