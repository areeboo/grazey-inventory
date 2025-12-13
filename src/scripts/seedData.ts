// Set environment variable directly for seed script
process.env.MONGODB_URI = 'mongodb+srv://aliareeb62:1t53Iayg1jZDVtqH@cluster0.icbx89z.mongodb.net/grazey-inventory?retryWrites=true&w=majority';

import connectDB from '../lib/db/mongodb';
import Ingredient from '../lib/db/models/Ingredient';
import Recipe from '../lib/db/models/Recipe';
import recipeData from './fullRecipeData.json';

// Extract all unique ingredients from recipes
function extractIngredients() {
  const ingredientsMap = new Map<string, { unit: string; category: string }>();

  // Ingredient category mappings
  const categoryMap: Record<string, string> = {
    'Cheddar': 'Cheese',
    'Cheese': 'Cheese',
    'Brie': 'Cheese',
    'Carmella': 'Cheese',
    'Goat Cheese': 'Cheese',
    'Swiss': 'Cheese',
    'Salami': 'Meat',
    'Prosciutto': 'Meat',
    'Pepperoni': 'Meat',
    'Ham': 'Meat',
    'Capicola': 'Meat',
    'Capocollo': 'Meat',
    'Sopressata': 'Meat',
    'Soppressata': 'Meat',
    'Bianca': 'Meat',
    'Strawberry': 'Fruit',
    'Strawberries': 'Fruit',
    'Grape': 'Fruit',
    'Grapes': 'Fruit',
    'Blackberry': 'Fruit',
    'Blackberries': 'Fruit',
    'Blueberry': 'Fruit',
    'Blueberries': 'Fruit',
    'Kiwi': 'Fruit',
    'Orange': 'Fruit',
    'Tomato': 'Vegetable',
    'Tomatoes': 'Vegetable',
    'Cucumber': 'Vegetable',
    'Cucumbers': 'Vegetable',
    'Carrot': 'Vegetable',
    'Carrots': 'Vegetable',
    'Pepper': 'Vegetable',
    'Peppers': 'Vegetable',
    'Olive': 'Vegetable',
    'Olives': 'Vegetable',
    'Broccoli': 'Vegetable',
    'Cauliflower': 'Vegetable',
    'Asparagus': 'Vegetable',
    'Pickle': 'Vegetable',
    'Pickles': 'Vegetable',
    'Cracker': 'Crackers',
    'Crackers': 'Crackers',
    'Bread': 'Bread',
    'Baguette': 'Bread',
    'Cake': 'Sweets',
    'Cookie': 'Sweets',
    'Cookies': 'Sweets',
    'Brownie': 'Sweets',
    'Brownies': 'Sweets',
    'Macaron': 'Sweets',
    'Macarons': 'Sweets',
    'Chocolate': 'Sweets',
    'Bark': 'Sweets',
    'Nuts': 'Nuts',
    'Nut': 'Nuts',
    'Cranberries': 'Nuts',
    'Hummus': 'Spreads',
    'Dip': 'Spreads',
    'Jam': 'Spreads',
    'Honey': 'Spreads',
    'Mustard': 'Spreads',
    'Nutella': 'Spreads',
  };

  function categorizeIngredient(name: string): string {
    for (const [key, category] of Object.entries(categoryMap)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return category;
      }
    }
    return 'Other';
  }

  // Parse all recipes
  for (const category of recipeData.categories) {
    for (const product of category.products) {
      for (const ing of product.ingredients) {
        const normalizedName = ing.item.trim();
        if (!ingredientsMap.has(normalizedName)) {
          ingredientsMap.set(normalizedName, {
            unit: ing.unit,
            category: categorizeIngredient(normalizedName),
          });
        }
      }
    }
  }

  return Array.from(ingredientsMap.entries()).map(([name, data]) => ({
    name,
    unit: data.unit,
    category: data.category,
    currentQuantity: 0,
    lowStockThreshold: 10,
    isCustom: false,
  }));
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});

    // Seed ingredients
    console.log('📦 Seeding ingredients...');
    const ingredientsToSeed = extractIngredients();
    const createdIngredients = await Ingredient.insertMany(ingredientsToSeed);
    console.log(`✅ Created ${createdIngredients.length} ingredients`);

    // Create ingredient lookup map
    const ingredientMap = new Map(
      createdIngredients.map((ing) => [ing.name, ing._id])
    );

    // Seed recipes
    console.log('📋 Seeding recipes...');
    let recipeCount = 0;
    let displayOrder = 0;

    for (const category of recipeData.categories) {
      const categoryName = category.category_name.includes('Classic')
        ? 'Classic'
        : category.category_name.includes('Vegetarian')
        ? 'Vegetarian'
        : category.category_name.includes('Sweet')
        ? 'Sweet'
        : 'Keto';

      for (const product of category.products) {
        const recipeIngredients = product.ingredients.map((ing: any) => {
          const ingredientId = ingredientMap.get(ing.item.trim());
          if (!ingredientId) {
            console.warn(`⚠️  Warning: Ingredient "${ing.item}" not found`);
          }
          return {
            ingredientId: ingredientId || null,
            ingredientName: ing.item.trim(),
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.note || '',
          };
        }).filter(ing => ing.ingredientId !== null);

        await Recipe.create({
          name: product.product_name,
          category: categoryName,
          displayOrder: displayOrder++,
          ingredients: recipeIngredients,
          isActive: true,
        });

        recipeCount++;
      }
    }

    console.log(`✅ Created ${recipeCount} recipes`);
    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${createdIngredients.length} ingredients`);
    console.log(`   - ${recipeCount} board recipes`);
    console.log('\n🚀 You can now run: npm run dev');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
