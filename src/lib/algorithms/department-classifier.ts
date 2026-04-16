export type Department =
  | 'Groente & Fruit'
  | 'Zuivel'
  | 'Vlees & Vis'
  | 'Bakkerij'
  | 'Voorraadkast'
  | 'Diepvries'
  | 'Kruiden & Specerijen'
  | 'Dranken'
  | 'Overig';

const DEPARTMENT_KEYWORDS: Record<Department, string[]> = {
  Zuivel: [
    // Dutch
    'melk', 'boter', 'kaas', 'yoghurt', 'room', 'ei', 'eieren',
    'zure room', 'slagroom', 'mozzarella', 'parmezaan', 'parmezaanse',
    'cheddar', 'feta', 'ricotta', 'mascarpone', 'crème fraîche',
    'kwark', 'karnemelk', 'roomkaas', 'geitenkaas', 'brie',
    'camembert', 'gruyère', 'emmentaler', 'gorgonzola', 'halvarine',
    'margarine', 'crème', 'vla',
    // English
    'milk', 'butter', 'cheese', 'yogurt', 'cream', 'egg', 'eggs',
    'sour cream', 'whipping cream', 'parmesan',
    'ricotta', 'mascarpone',
  ],
  'Vlees & Vis': [
    // Dutch
    'kip', 'kipfilet', 'kippenbouten', 'kippendijen', 'rundvlees',
    'rundergehakt', 'biefstuk', 'entrecote', 'varkensvlees',
    'varkenshaas', 'gehakt', 'lam', 'lamsvlees', 'kalkoen',
    'spek', 'ontbijtspek', 'worst', 'worstjes', 'rookworst',
    'ham', 'shoarma', 'gyros', 'eend', 'konijn',
    'zalm', 'garnalen', 'garnaal', 'tonijn', 'kabeljauw', 'vis',
    'pangasius', 'tilapia', 'makreel', 'haring', 'forel', 'zeebaars',
    'mosselen', 'inktvis', 'scampi', 'krab', 'kreeft', 'ansjovis',
    'sardines', 'oesters', 'sint-jakobsschelpen', 'filet americain',
    'kipgehakt', 'ossenstaart', 'slavink', 'schnitzel',
    // English
    'chicken', 'beef', 'pork', 'lamb', 'turkey', 'bacon', 'sausage',
    'ham', 'steak', 'ground meat', 'mince', 'veal', 'duck',
    'salmon', 'shrimp', 'prawn', 'tuna', 'cod', 'fish', 'crab',
    'lobster', 'mussel', 'clam', 'scallop', 'anchovy', 'sardine',
    'squid', 'calamari', 'oyster',
  ],
  'Groente & Fruit': [
    // Dutch vegetables
    'sla', 'tomaat', 'tomaten', 'ui', 'uien', 'knoflook',
    'aardappel', 'aardappelen', 'aardappels', 'wortel', 'wortelen',
    'wortels', 'selderij', 'komkommer', 'paprika', 'spinazie',
    'boerenkool', 'broccoli', 'bloemkool', 'courgette', 'pompoen',
    'champignon', 'champignons', 'mais', 'erwten', 'doperwten',
    'taugé', 'kool', 'rode kool', 'witte kool', 'spitskool',
    'prei', 'sjalot', 'sjalotten', 'avocado', 'radijs', 'biet',
    'bieten', 'zoete aardappel', 'asperges', 'artisjok', 'aubergine',
    'venkel', 'raap', 'rucola', 'veldsla', 'andijvie', 'witlof',
    'snijbonen', 'sperziebonen', 'tuinbonen', 'kapucijners',
    'peultjes', 'paksoi', 'chinese kool', 'bataat',
    // Dutch fruits
    'appel', 'appels', 'banaan', 'bananen', 'citroen', 'citroenen',
    'limoen', 'sinaasappel', 'sinaasappels', 'aardbei', 'aardbeien',
    'bosbes', 'bosbessen', 'framboos', 'frambozen', 'druif', 'druiven',
    'mango', 'ananas', 'perzik', 'peer', 'peer', 'gember',
    'kiwi', 'meloen', 'watermeloen', 'pruim', 'abrikoos',
    // Dutch herbs (fresh)
    'koriander', 'peterselie', 'munt', 'basilicum', 'dille',
    'bieslook', 'bosui', 'lente-ui', 'jalapeño', 'chilipeper',
    'verse kruiden', 'dragon', 'kervel',
    // English
    'lettuce', 'tomato', 'onion', 'garlic', 'potato', 'carrot',
    'celery', 'cucumber', 'pepper', 'bell pepper', 'spinach', 'kale',
    'broccoli', 'cauliflower', 'zucchini', 'squash', 'mushroom',
    'corn', 'peas', 'cabbage', 'leek', 'shallot',
    'avocado', 'apple', 'banana', 'lemon', 'lime', 'orange',
    'berry', 'berries', 'strawberry', 'blueberry', 'raspberry',
    'grape', 'mango', 'pineapple', 'peach', 'pear', 'ginger',
    'cilantro', 'parsley', 'mint', 'basil', 'dill', 'chive',
    'scallion', 'green onion', 'jalapeño', 'chili', 'arugula',
    'radish', 'beet', 'sweet potato', 'asparagus', 'artichoke',
    'eggplant', 'fennel', 'turnip',
  ],
  Bakkerij: [
    // Dutch
    'brood', 'tortilla', 'broodje', 'bol', 'pita', 'naan', 'bagel',
    'croissant', 'stokbrood', 'platbrood', 'ciabatta', 'zuurdesem',
    'wrap', 'wraps', 'pizzadeeg', 'focaccia', 'turks brood',
    'volkoren brood', 'wit brood', 'roggebrood', 'beschuit',
    // English
    'bread', 'tortilla', 'bun', 'roll', 'pita', 'naan', 'bagel',
    'croissant', 'baguette', 'flatbread', 'ciabatta', 'sourdough',
    'wrap', 'pizza dough',
  ],
  'Kruiden & Specerijen': [
    // Dutch
    'zout', 'peper', 'zwarte peper', 'komijn', 'oregano', 'kaneel',
    'paprikapoeder', 'kurkuma', 'chilipoeder', 'cayennepeper',
    'nootmuskaat', 'kruidnagel', 'kardemom', 'korianderzaad',
    'tijm', 'rozemarijn', 'salie', 'laurierblad', 'kerrie',
    'kerriepoeder', 'currypasta', 'saffraan', 'piment', 'vanille',
    'sesamzaad', 'maanzaad', 'mosterdzaad', 'garam masala',
    'ras el hanout', 'baharat', 'za\'atar', 'sumak',
    'gedroogde kruiden', 'kruidenmix', 'italiaanse kruiden',
    'provençaalse kruiden', 'ketjap', 'sambal', 'trassi',
    // English
    'salt', 'pepper', 'cumin', 'oregano', 'cinnamon', 'paprika',
    'turmeric', 'chili powder', 'cayenne', 'nutmeg', 'clove',
    'cardamom', 'coriander', 'thyme', 'rosemary', 'sage',
    'bay leaf', 'curry', 'saffron', 'allspice', 'vanilla',
    'sesame seed', 'poppy seed', 'mustard seed',
  ],
  Voorraadkast: [
    // Dutch
    'bloem', 'suiker', 'rijst', 'pasta', 'noedels', 'mie',
    'olie', 'olijfolie', 'zonnebloemolie', 'azijn', 'sojasaus',
    'blik', 'ingeblikt', 'tomatensaus', 'tomatenpuree', 'passata',
    'gepelde tomaten', 'bouillon', 'honing', 'ahornsiroop',
    'stroop', 'maïzena', 'bakpoeder', 'baksoda', 'gist',
    'cacao', 'chocolade', 'chocoladeschilfers', 'havermout',
    'muesli', 'granola', 'noten', 'amandelen', 'walnoten',
    'pecannoten', 'pinda', 'pindakaas', 'cashewnoten', 'kokos',
    'kokosmelk', 'kokosroom', 'linzen', 'bonen', 'kidneybonen',
    'witte bonen', 'zwarte bonen', 'kikkererwten', 'quinoa',
    'couscous', 'paneermeel', 'panko', 'worcestershire',
    'hete saus', 'ketchup', 'mayonaise', 'mosterd', 'jam',
    'tahini', 'miso', 'vissaus', 'oestersaus', 'hoisin',
    'sriracha', 'tortillachips', 'crackers', 'macaroni',
    'spaghetti', 'penne', 'tagliatelle', 'fusilli', 'lasagne',
    'vermicelli', 'rijstnoedels', 'eiermie', 'basmatirijst',
    'jasmijnrijst', 'risottorijst', 'zilvervliesrijst',
    'tomatenketchup', 'pindasaus', 'kroepoek', 'atjar',
    'zilveruitjes', 'kappertjes', 'zongedroogde tomaten',
    // English
    'flour', 'sugar', 'rice', 'pasta', 'noodle', 'oil', 'olive oil',
    'vinegar', 'soy sauce', 'can', 'canned', 'tomato sauce',
    'tomato paste', 'broth', 'stock', 'bouillon', 'honey',
    'maple syrup', 'cornstarch', 'baking soda',
    'baking powder', 'yeast', 'cocoa', 'chocolate',
    'oats', 'cereal', 'granola', 'nut', 'almond', 'walnut',
    'pecan', 'peanut', 'cashew', 'coconut', 'lentil', 'bean',
    'chickpea', 'quinoa', 'couscous', 'breadcrumb', 'panko',
    'worcestershire', 'hot sauce', 'ketchup', 'mayonnaise',
    'mustard', 'jam', 'peanut butter', 'tahini', 'miso',
    'fish sauce', 'oyster sauce', 'hoisin', 'sriracha',
    'cracker',
  ],
  Diepvries: [
    // Dutch
    'diepvries', 'ijs', 'sorbet', 'diepvriespizza',
    'diepvriesgroenten', 'diepvriesfruit', 'bevroren',
    // English
    'frozen', 'ice cream', 'sorbet', 'frozen pizza',
    'frozen vegetable', 'frozen fruit',
  ],
  Dranken: [
    // Dutch
    'sap', 'jus', 'koffie', 'thee', 'wijn', 'bier', 'frisdrank',
    'water', 'bruiswater', 'kokosmelk', 'amandelmelk', 'havermelk',
    'sojamelk', 'limonade',
    // English
    'juice', 'coffee', 'tea', 'wine', 'beer', 'soda', 'water',
    'sparkling', 'coconut milk', 'almond milk', 'oat milk',
  ],
  Overig: [],
};

export function classifyIngredient(ingredient: string): Department {
  const lower = ingredient.toLowerCase();

  for (const [dept, keywords] of Object.entries(DEPARTMENT_KEYWORDS) as [Department, string[]][]) {
    if (dept === 'Overig') continue;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return dept;
      }
    }
  }

  return 'Overig';
}

export const DEPARTMENT_ORDER: Department[] = [
  'Groente & Fruit',
  'Zuivel',
  'Vlees & Vis',
  'Bakkerij',
  'Voorraadkast',
  'Kruiden & Specerijen',
  'Diepvries',
  'Dranken',
  'Overig',
];
