// Menu data extracted from original iset_zaghouan_restaurant.html
const MENU_DATA = [
  // Entrées
  { id: 1, cat: 'entrees', name: 'Salade Mechouia', desc: 'Poivrons et tomates grillés, câpres, thon, œuf dur', price: 2.500, emoji: '🥗', service: 'both', ramadan: false },
  { id: 2, cat: 'entrees', name: 'Brick à l\'œuf', desc: 'Brick croustillante, œuf, thon, harissa maison', price: 1.800, emoji: '🥟', service: 'both', ramadan: false },
  { id: 3, cat: 'entrees', name: 'Soupe Tunisienne', desc: 'Chorba traditionnelle, légumes, coriandre fraîche', price: 1.500, emoji: '🍲', service: 'both', ramadan: false },
  // Plats
  { id: 4, cat: 'plats', name: 'Couscous Tunisien', desc: 'Semoule fine, légumes de saison, agneau tendre, merguez', price: 5.500, emoji: '🫕', service: 'lunch', ramadan: false },
  { id: 5, cat: 'plats', name: 'Tajine Kefta', desc: 'Boulettes de viande en sauce tomate épicée, œufs pochés', price: 4.500, emoji: '🍳', service: 'both', ramadan: false },
  { id: 6, cat: 'plats', name: 'Poisson Grillé', desc: 'Daurade fraîche, chermoula maison, légumes vapeur', price: 6.500, emoji: '🐟', service: 'lunch', ramadan: false },
  { id: 7, cat: 'plats', name: 'Poulet Rôti', desc: 'Demi-poulet mariné aux épices, frites maison, salade', price: 5.000, emoji: '🍗', service: 'both', ramadan: false },
  { id: 8, cat: 'plats', name: 'Lablabi', desc: 'Pois chiches épicés, cumin, harissa, œuf, pain', price: 2.800, emoji: '🫘', service: 'lunch', ramadan: false },
  // Sandwichs
  { id: 9, cat: 'sandwichs', name: 'Sandwich Tunisien', desc: 'Baguette, thon, harissa, olives, œuf, câpres', price: 2.200, emoji: '🥖', service: 'both', ramadan: false },
  { id: 10, cat: 'sandwichs', name: 'Sandwich Merguez', desc: 'Merguez grillées, frites, harissa, tomate', price: 2.500, emoji: '🌭', service: 'both', ramadan: false },
  { id: 11, cat: 'sandwichs', name: 'Sandwich Kefta', desc: 'Kefta maison, fromage, tomate, mayonnaise légère', price: 2.800, emoji: '🥙', service: 'both', ramadan: false },
  // Desserts
  { id: 12, cat: 'desserts', name: 'Baklawa', desc: 'Feuilleté aux amandes et pistaches, miel de fleurs', price: 1.500, emoji: '🍯', service: 'both', ramadan: false },
  { id: 13, cat: 'desserts', name: 'Assiette de Fruits', desc: 'Fruits frais de saison, selon disponibilité', price: 1.800, emoji: '🍊', service: 'both', ramadan: false },
  { id: 14, cat: 'desserts', name: 'Zriga', desc: 'Dessert traditionnel, graines de pin, crème, eau de rose', price: 2.000, emoji: '🥣', service: 'both', ramadan: false },
  // Boissons
  { id: 15, cat: 'boissons', name: 'Jus de Fruit Frais', desc: 'Orange, citronnade, grenade, selon saison', price: 1.500, emoji: '🍹', service: 'both', ramadan: false },
  { id: 16, cat: 'boissons', name: 'Café Tunisien', desc: 'Café turc ou espresso, cardamome en option', price: 0.800, emoji: '☕', service: 'both', ramadan: false },
  { id: 17, cat: 'boissons', name: 'Eau Minérale', desc: 'Bouteille 50cl ou 1L', price: 0.500, emoji: '💧', service: 'both', ramadan: false },
  // Ramadan specials
  { id: 18, cat: 'ramadan', name: 'Chorba Frik', desc: 'Soupe traditionnelle ramadanesque, blé vert, agneau, tomate', price: 2.000, emoji: '🍜', service: 'iftar', ramadan: true },
  { id: 19, cat: 'ramadan', name: 'Assiette Iftar Complète', desc: 'Chorba + Brick + Dattes + Lben + Dessert', price: 8.500, emoji: '🌙', service: 'iftar', ramadan: true },
  { id: 20, cat: 'ramadan', name: 'Assiette Sahour', desc: 'Œufs, fromage, pain, olives, thé — repas léger avant l\'aube', price: 4.500, emoji: '⭐', service: 'sahour', ramadan: true },
];

const SUBSCRIPTION_PLANS = [
  {
    id: 'etudiant',
    name: 'Étudiant',
    icon: '🎓',
    audience: 'ÉTUDIANT',
    monthlyPrice: 45,
    ramadanPrice: 38,
    features: [
      { text: 'Déjeuner quotidien (5j/sem)', included: true },
      { text: 'Plat du jour + Boisson', included: true },
      { text: 'Accès cafétéria prioritaire', included: true },
      { text: 'Carte de fidélité', included: true },
      { text: 'Dîner inclus', included: false },
      { text: 'Réservation table privée', included: false },
    ]
  },
  {
    id: 'enseignant',
    name: 'Enseignant',
    icon: '👨‍🏫',
    audience: 'ENSEIGNANT',
    monthlyPrice: 65,
    ramadanPrice: 55,
    featured: true,
    features: [
      { text: 'Déjeuner + Dîner (5j/sem)', included: true },
      { text: 'Menu Premium au choix', included: true },
      { text: 'Salle réservée enseignants', included: true },
      { text: 'Invité 1×/mois offert', included: true },
      { text: 'Réservation table en ligne', included: true },
      { text: 'Café offert chaque jour', included: true },
    ]
  },
  {
    id: 'externe',
    name: 'Externe',
    icon: '🏢',
    audience: 'PERSONNEL EXTERNE',
    monthlyPrice: 85,
    ramadanPrice: 72,
    features: [
      { text: 'Déjeuner + Dîner (5j/sem)', included: true },
      { text: 'Accès menu complet', included: true },
      { text: 'Facturation mensuelle', included: true },
      { text: 'Accès weekend (sam.)', included: true },
      { text: 'Badge accès dédié', included: true },
      { text: 'Support prioritaire', included: true },
    ]
  }
];

module.exports = { MENU_DATA, SUBSCRIPTION_PLANS };
