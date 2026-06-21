const Inventory = require('../models/Inventory');
const MenuItem = require('../models/MenuItem');

// Simple Recipe Mapping: MenuItem Name -> Array of { itemName, qtyRequired }
const RECIPES = {
  'Burger': [
    { itemName: 'Burger Buns', qtyRequired: 1 },
    { itemName: 'Beef Patty', qtyRequired: 1 },
    { itemName: 'Cheese Slices', qtyRequired: 1 },
    { itemName: 'Lettuce', qtyRequired: 0.05 }
  ],
  'Pizza': [
    { itemName: 'Pizza Dough', qtyRequired: 1 },
    { itemName: 'Mozzarella Cheese', qtyRequired: 0.2 },
    { itemName: 'Tomato Sauce', qtyRequired: 0.1 },
    { itemName: 'Pepperoni', qtyRequired: 0.1 }
  ],
  'Pasta': [
    { itemName: 'Pasta Noodles', qtyRequired: 0.15 },
    { itemName: 'Tomato Sauce', qtyRequired: 0.15 },
    { itemName: 'Parmesan Cheese', qtyRequired: 0.03 }
  ],
  'Salad': [
    { itemName: 'Lettuce', qtyRequired: 0.2 },
    { itemName: 'Tomatoes', qtyRequired: 0.1 },
    { itemName: 'Olive Oil', qtyRequired: 0.02 }
  ],
  'Soda': [
    { itemName: 'Soda Can', qtyRequired: 1 }
  ]
};

/**
 * Deducts ingredients from inventory based on ordered menu items.
 * Returns an array of low stock alert messages if any ingredients fall below threshold.
 */
const deductInventoryForOrder = async (orderItems) => {
  const alerts = [];

  for (const item of orderItems) {
    // Populate menuItem details to get name
    const menuItem = await MenuItem.findById(item.menuItemId);
    if (!menuItem) continue;

    const recipe = RECIPES[menuItem.name];
    if (!recipe) {
      // Default: If no specific recipe is found, assume 1:1 mapping (e.g., pre-packaged food)
      // Look for an inventory item with the same name as the menu item
      const invItem = await Inventory.findOne({ itemName: menuItem.name });
      if (invItem) {
        const deductQty = 1 * item.quantity;
        invItem.quantity = Math.max(0, invItem.quantity - deductQty);
        await invItem.save();

        if (invItem.quantity <= invItem.lowStockThreshold) {
          alerts.push(`Low stock alert: ${invItem.itemName} is currently at ${invItem.quantity} ${invItem.unit} (Threshold: ${invItem.lowStockThreshold} ${invItem.unit})`);
        }
      }
      continue;
    }

    // Process recipe ingredients
    for (const ingredient of recipe) {
      const invItem = await Inventory.findOne({ itemName: ingredient.itemName });
      if (invItem) {
        const deductQty = ingredient.qtyRequired * item.quantity;
        invItem.quantity = Math.max(0, invItem.quantity - deductQty);
        await invItem.save();

        if (invItem.quantity <= invItem.lowStockThreshold) {
          alerts.push(`Low stock alert: ${invItem.itemName} is currently at ${invItem.quantity.toFixed(2)} ${invItem.unit} (Threshold: ${invItem.lowStockThreshold} ${invItem.unit})`);
        }
      }
    }
  }

  return alerts;
};

module.exports = {
  deductInventoryForOrder,
  RECIPES
};
