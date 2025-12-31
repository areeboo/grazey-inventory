// Set environment variable directly for import script
process.env.MONGODB_URI = 'mongodb+srv://aliareeb62:1t53Iayg1jZDVtqH@cluster0.icbx89z.mongodb.net/grazey-inventory?retryWrites=true&w=majority';

import connectDB from '../lib/db/mongodb';
import Ingredient from '../lib/db/models/Ingredient';
import Recipe from '../lib/db/models/Recipe';
import officialData from './officialBoardData.json';

interface IngredientMaster {
  name: string;
  category: string;
  unit: string;
  aliases: string[];
}

interface BoardIngredient {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  context?: string;
}

interface Board {
  name: string;
  category: string;
  displayOrder: number;
  ingredients: BoardIngredient[];
}

async function importOfficialBoards() {
  try {
    console.log('🚀 Starting official board data import...');
    console.log('');

    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Step 1: Clear existing recipes (keeping ingredients to upsert)
    console.log('');
    console.log('🗑️  Clearing existing recipes...');
    const deletedRecipes = await Recipe.deleteMany({});
    console.log(`   Deleted ${deletedRecipes.deletedCount} existing recipes`);

    // Step 2: Upsert ingredients
    console.log('');
    console.log('📦 Upserting ingredients...');

    const ingredientMaster: IngredientMaster[] = officialData.ingredientMaster;
    const ingredientMap = new Map<string, any>();

    let created = 0;
    let updated = 0;

    for (const ing of ingredientMaster) {
      // Try to find existing ingredient by name or alias
      let existing = await Ingredient.findOne({ name: ing.name });

      if (!existing) {
        // Check if any alias matches an existing ingredient
        for (const alias of ing.aliases) {
          existing = await Ingredient.findOne({ name: alias });
          if (existing) break;
        }
      }

      if (existing) {
        // Update existing ingredient with aliases
        const newAliases = Array.from(new Set([...existing.aliases, ...ing.aliases]));
        await Ingredient.updateOne(
          { _id: existing._id },
          {
            $set: {
              aliases: newAliases,
              category: ing.category,
              unit: ing.unit
            }
          }
        );
        ingredientMap.set(ing.name, existing._id);
        // Also map aliases to this ID
        for (const alias of ing.aliases) {
          ingredientMap.set(alias.toLowerCase(), existing._id);
        }
        updated++;
      } else {
        // Create new ingredient
        const newIng = await Ingredient.create({
          name: ing.name,
          category: ing.category,
          unit: ing.unit,
          currentQuantity: 0,
          lowStockThreshold: 10,
          isCustom: false,
          aliases: ing.aliases,
        });
        ingredientMap.set(ing.name, newIng._id);
        // Also map aliases to this ID
        for (const alias of ing.aliases) {
          ingredientMap.set(alias.toLowerCase(), newIng._id);
        }
        created++;
      }
    }

    console.log(`   Created: ${created} new ingredients`);
    console.log(`   Updated: ${updated} existing ingredients`);

    // Step 3: Create board recipes
    console.log('');
    console.log('📋 Creating board recipes...');

    const boards: Board[] = officialData.boards;
    let boardsCreated = 0;
    let ingredientWarnings: string[] = [];

    for (const board of boards) {
      const recipeIngredients = [];

      for (const ing of board.ingredients) {
        // Look up ingredient ID by name (case-insensitive)
        let ingredientId = ingredientMap.get(ing.name);

        if (!ingredientId) {
          // Try lowercase lookup
          ingredientId = ingredientMap.get(ing.name.toLowerCase());
        }

        if (!ingredientId) {
          // Try to find in database directly
          const dbIng = await Ingredient.findOne({
            $or: [
              { name: ing.name },
              { name: { $regex: new RegExp(`^${ing.name}$`, 'i') } },
              { aliases: { $in: [ing.name, ing.name.toLowerCase()] } }
            ]
          });

          if (dbIng) {
            ingredientId = dbIng._id;
            ingredientMap.set(ing.name, dbIng._id);
          }
        }

        if (!ingredientId) {
          ingredientWarnings.push(`${board.name}: "${ing.name}" not found`);
          continue;
        }

        recipeIngredients.push({
          ingredientId,
          ingredientName: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes || '',
          context: ing.context || undefined,
        });
      }

      if (recipeIngredients.length > 0) {
        await Recipe.create({
          name: board.name,
          category: board.category,
          displayOrder: board.displayOrder,
          ingredients: recipeIngredients,
          isActive: true,
        });
        boardsCreated++;
      } else {
        console.log(`   ⚠️  Skipped "${board.name}" - no valid ingredients`);
      }
    }

    console.log(`   Created: ${boardsCreated} board recipes`);

    // Print warnings
    if (ingredientWarnings.length > 0) {
      console.log('');
      console.log('⚠️  Ingredient warnings:');
      for (const warning of ingredientWarnings.slice(0, 10)) {
        console.log(`   - ${warning}`);
      }
      if (ingredientWarnings.length > 10) {
        console.log(`   ... and ${ingredientWarnings.length - 10} more`);
      }
    }

    // Summary
    console.log('');
    console.log('🎉 Import completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Ingredients: ${created} created, ${updated} updated`);
    console.log(`   Boards: ${boardsCreated} created`);

    // Category breakdown
    const categoryCount: Record<string, number> = {};
    for (const board of boards) {
      categoryCount[board.category] = (categoryCount[board.category] || 0) + 1;
    }
    console.log('');
    console.log('📁 Boards by category:');
    for (const [cat, count] of Object.entries(categoryCount)) {
      console.log(`   - ${cat}: ${count}`);
    }

    console.log('');
    console.log('🚀 You can now run: npm run dev');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
}

importOfficialBoards();
