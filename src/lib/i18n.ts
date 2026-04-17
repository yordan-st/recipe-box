export const t = {
  // App / Nav
  appName: "ReceptBox",
  navRecipes: "Recepten",
  navAdd: "Toevoegen",
  navMenu: "Menu",
  toggleDarkMode: "Donkere modus wisselen",
  menuAriaLabel: "Menu",

  // Login
  loginTitle: "Receptenbox",
  loginSubtitle: "Voer wachtwoord in om verder te gaan",
  loginPlaceholder: "Wachtwoord",
  loginError: "Verkeerd wachtwoord",
  loginChecking: "Controleren...",
  loginButton: "Inloggen",

  // Recipes list
  myRecipes: "Recepten",
  addRecipe: "Toevoegen",
  searchPlaceholder: "Zoek recepten...",
  noRecipesYet: "Nog geen recepten. Voeg je eerste recept toe!",
  noSearchResults: (query: string) => `Geen recepten gevonden voor "${query}"`,
  recipeDeleted: "Recept verwijderd",
  recipeUpdated: "Recept bijgewerkt",
  recipeAdded: "Recept toegevoegd!",
  failedToAddRecipe: "Recept toevoegen mislukt",
  addedToMenu: (title: string, slot: number) =>
    `"${title}" toegevoegd aan menuslot ${slot}`,

  // Recipe form
  urlRequired: "URL is verplicht",
  validUrl: "Voer een geldige URL in",
  titleRequired: "Titel is verplicht",
  enterUrlFirst: "Voer eerst een URL in",
  enterValidUrl: "Voer een geldige URL in",
  fetchFailed: "Receptdata ophalen mislukt. Vul de gegevens handmatig in.",
  fetchSuccess: (count: number, source: string) =>
    `${count} ingrediënten opgehaald via ${source}`,
  fetchPartial: (source: string) =>
    `Titel en afbeelding opgehaald via ${source}. Geen ingrediënten gevonden — voer ze handmatig in.`,
  fetchOffline: "Kan de server niet bereiken. Vul de gegevens handmatig in.",
  labelUrl: "Recept URL *",
  placeholderUrl: "https://voorbeeld.nl/recept",
  fetching: "Ophalen...",
  autoFill: "Auto-invullen",
  labelTitle: "Titel *",
  placeholderTitle: "Receptnaam",
  labelImageUrl: "Afbeeldings-URL",
  placeholderImageUrl: "https://voorbeeld.nl/afbeelding.jpg",
  labelIngredients: "Ingrediënten (één per regel)",
  placeholderIngredients: "2 kopjes bloem\n1 theelepel zout\n3 eieren",
  labelTags: "Tags",
  cancel: "Annuleren",
  saving: "Opslaan...",
  saveChanges: "Wijzigingen Opslaan",

  // Recipe card
  openRecipe: "Recept openen",
  addToMenu: "Aan menu toevoegen",
  editRecipe: "Recept bewerken",
  deleteRecipe: "Recept verwijderen",

  // Edit/Delete dialogs
  editRecipeTitle: "Recept Bewerken",
  deleteRecipeTitle: "Recept Verwijderen",
  deleteConfirm:
    "Weet je zeker dat je dit recept wilt verwijderen? Dit kan niet ongedaan worden gemaakt.",
  deleteButton: "Verwijderen",

  // Weekly menu
  thisWeeksMenu: "Weekmenu",
  recipesLabel: "Recepten:",
  generate: "Genereren",
  addRecipes: "Recepten Toevoegen",
  needMoreRecipes: (n: number) =>
    `Voeg minstens ${n} recept${n !== 1 ? "en" : ""} toe om een weekmenu te genereren`,
  generateFirstMenu: "Genereer je eerste weekmenu!",
  generateMenu: "Genereren",
  fillEmptySlots: "Lege plekken vullen",
  swapRecipe: "Recept wisselen",
  pickARecipe: "Kies een recept",

  // Menu slot
  pickRecipeSlot: "Kies een recept",
  swapRecipeAriaLabel: "Recept wisselen",
  removeRecipeAriaLabel: "Recept verwijderen",

  // Recipe picker dialog
  searchByTitleOrTag: "Zoek op titel of tag...",
  noRecipesAvailable: "Geen recepten beschikbaar",
  ingredientsCount: (n: number) => `${n} ingrediënten`,

  // Slot picker dialog
  addToMenuTitle: "Aan menu toevoegen",
  pickSlotDescription: "Kies een plek om dit recept neer te zetten.",
  emptySlot: "Lege plek",

  // Finish week
  finishWeek: "Week afsluiten",
  finishWeekTitle: "Week afsluiten",
  finishWeekDescription:
    "Hiermee markeer je alle recepten als gekookt. Dit beïnvloedt welke recepten vaker of minder vaak worden voorgesteld.",
  finishWeekConfirm: "Afsluiten",
  weekFinished: "Week afgesloten! Recepten gemarkeerd als gekookt.",

  // Grocery list
  groceryList: "Boodschappenlijst",
  noIngredients:
    "Geen ingrediënten gevonden. Voeg ingrediënten toe aan je recepten om ze hier te zien.",
  remaining: (r: number, total: number) => `${r} van ${total} over`,
  usedIn: "Gebruikt in:",

  // Tags
  labelDishType: "Gerecht",
  labelDiet: "Dieet",
  labelCuisine: "Keuken",
  placeholderDishType: "bijv. pasta, rijst, soep...",
  placeholderDiet: "bijv. vlees, vis, vegetarisch...",
  placeholderCuisine: "bijv. Italiaans, Aziatisch, Mexicaans...",

  // Sync
  syncing: "Synchroniseren...",
  syncError: (err: string) => `Synchronisatiefout: ${err}`,
  offline: "Offline",
  synced: "Gesynchroniseerd",

  // Error boundary
  somethingWentWrong: "Er is iets misgegaan",
  errorDescription:
    "De app heeft een onverwachte fout ondervonden. Probeer de pagina opnieuw te laden.",
  reload: "Herladen",

  // Install prompt
  installMessage:
    "Installeer Receptenbox voor een snellere, app-achtige ervaring.",
  install: "Installeren",
  dismissInstall: "Installatieprompt sluiten",

  // Operations
  duplicateRecipeUrl: "Een recept met deze URL bestaat al",
  duplicateUrlWarning: "Er bestaat al een recept met deze URL",
} as const;
