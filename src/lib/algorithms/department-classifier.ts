export type Department =
  | 'Produce'
  | 'Dairy'
  | 'Meat & Seafood'
  | 'Bakery'
  | 'Pantry'
  | 'Frozen'
  | 'Spices & Seasonings'
  | 'Beverages'
  | 'Other';

const DEPARTMENT_KEYWORDS: Record<Department, string[]> = {
  Dairy: [
    'milk', 'butter', 'cheese', 'yogurt', 'cream', 'egg', 'eggs',
    'sour cream', 'whipping cream', 'mozzarella', 'parmesan',
    'cheddar', 'feta', 'ricotta', 'mascarpone', 'crème',
  ],
  'Meat & Seafood': [
    'chicken', 'beef', 'pork', 'lamb', 'turkey', 'bacon', 'sausage',
    'ham', 'steak', 'ground meat', 'mince', 'veal', 'duck',
    'salmon', 'shrimp', 'prawn', 'tuna', 'cod', 'fish', 'crab',
    'lobster', 'mussel', 'clam', 'scallop', 'anchovy', 'sardine',
    'squid', 'calamari', 'oyster',
  ],
  Produce: [
    'lettuce', 'tomato', 'onion', 'garlic', 'potato', 'carrot',
    'celery', 'cucumber', 'pepper', 'bell pepper', 'spinach', 'kale',
    'broccoli', 'cauliflower', 'zucchini', 'squash', 'mushroom',
    'corn', 'peas', 'bean sprout', 'cabbage', 'leek', 'shallot',
    'avocado', 'apple', 'banana', 'lemon', 'lime', 'orange',
    'berry', 'berries', 'strawberry', 'blueberry', 'raspberry',
    'grape', 'mango', 'pineapple', 'peach', 'pear', 'ginger',
    'cilantro', 'parsley', 'mint', 'basil', 'dill', 'chive',
    'scallion', 'green onion', 'jalapeño', 'chili', 'arugula',
    'radish', 'beet', 'sweet potato', 'asparagus', 'artichoke',
    'eggplant', 'fennel', 'turnip',
  ],
  Bakery: [
    'bread', 'tortilla', 'bun', 'roll', 'pita', 'naan', 'bagel',
    'croissant', 'baguette', 'flatbread', 'ciabatta', 'sourdough',
    'wrap', 'pizza dough',
  ],
  'Spices & Seasonings': [
    'salt', 'pepper', 'cumin', 'oregano', 'cinnamon', 'paprika',
    'turmeric', 'chili powder', 'cayenne', 'nutmeg', 'clove',
    'cardamom', 'coriander', 'thyme', 'rosemary', 'sage',
    'bay leaf', 'curry', 'saffron', 'allspice', 'vanilla',
    'sesame seed', 'poppy seed', 'mustard seed',
  ],
  Pantry: [
    'flour', 'sugar', 'rice', 'pasta', 'noodle', 'oil', 'olive oil',
    'vinegar', 'soy sauce', 'can', 'canned', 'tomato sauce',
    'tomato paste', 'broth', 'stock', 'bouillon', 'honey',
    'maple syrup', 'molasses', 'cornstarch', 'baking soda',
    'baking powder', 'yeast', 'cocoa', 'chocolate', 'chips',
    'oats', 'cereal', 'granola', 'nut', 'almond', 'walnut',
    'pecan', 'peanut', 'cashew', 'coconut', 'lentil', 'bean',
    'chickpea', 'quinoa', 'couscous', 'breadcrumb', 'panko',
    'worcestershire', 'hot sauce', 'ketchup', 'mayonnaise',
    'mustard', 'jam', 'peanut butter', 'tahini', 'miso',
    'fish sauce', 'oyster sauce', 'hoisin', 'sriracha',
    'tortilla chip', 'cracker',
  ],
  Frozen: [
    'frozen', 'ice cream', 'sorbet', 'frozen pizza',
    'frozen vegetable', 'frozen fruit',
  ],
  Beverages: [
    'juice', 'coffee', 'tea', 'wine', 'beer', 'soda', 'water',
    'sparkling', 'coconut milk', 'almond milk', 'oat milk',
  ],
  Other: [],
};

export function classifyIngredient(ingredient: string): Department {
  const lower = ingredient.toLowerCase();

  for (const [dept, keywords] of Object.entries(DEPARTMENT_KEYWORDS) as [Department, string[]][]) {
    if (dept === 'Other') continue;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return dept;
      }
    }
  }

  return 'Other';
}

export const DEPARTMENT_ORDER: Department[] = [
  'Produce',
  'Dairy',
  'Meat & Seafood',
  'Bakery',
  'Pantry',
  'Spices & Seasonings',
  'Frozen',
  'Beverages',
  'Other',
];
