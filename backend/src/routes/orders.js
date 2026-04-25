const router = require('express').Router();
const { body } = require('express-validator');
const { handleValidation, sanitizeString, orderLimiter } = require('../middleware/security');
const { getOrders, createOrder, updateOrderStatus } = require('../data/store');
const { MENU_DATA } = require('../data/menu');

const VALID_STATUSES = ['preparing', 'ready', 'delivered'];
const STATUS_PROGRESS = { preparing: 30, ready: 75, delivered: 100 };

// GET /api/orders
router.get('/', (req, res) => {
  res.json({ success: true, data: getOrders() });
});

// POST /api/orders — place a new order
router.post(
  '/',
  orderLimiter,
  [
    body('client').trim().notEmpty().withMessage('Nom client requis').isLength({ max: 100 }),
    body('type').trim().notEmpty().withMessage('Type de client requis').isIn(['Étudiant', 'Enseignant', 'Personnel Externe']),
    body('meal').trim().notEmpty().withMessage('Repas requis').isIn(['Déjeuner', 'Dîner', 'Sahour', 'Iftar']),
    body('items').isArray({ min: 1 }).withMessage('Au moins un article requis'),
    body('items.*').isInt({ min: 1, max: 9999 }).withMessage('ID article invalide'),
  ],
  handleValidation,
  (req, res) => {
    const { client, type, meal, items: itemIds } = req.body;

    // Resolve item IDs to menu items
    const resolvedItems = itemIds.map(id => MENU_DATA.find(m => m.id === id)).filter(Boolean);
    if (resolvedItems.length === 0) return res.status(400).json({ error: 'Articles invalides' });

    const total = resolvedItems.reduce((sum, item) => sum + item.price, 0);
    const hasRamadan = resolvedItems.some(i => i.ramadan);

    const order = createOrder({
      client: sanitizeString(client),
      type: sanitizeString(type),
      meal: sanitizeString(meal),
      items: resolvedItems.map(i => i.name),
      total: hasRamadan ? +(total * 0.85).toFixed(3) : +total.toFixed(3),
    });

    res.status(201).json({ success: true, data: order });
  }
);

// PATCH /api/orders/:id/status — update order status (staff use)
router.patch(
  '/:id/status',
  [
    body('status').isIn(VALID_STATUSES).withMessage('Statut invalide'),
  ],
  handleValidation,
  (req, res) => {
    const { status } = req.body;
    const order = updateOrderStatus(req.params.id, status, STATUS_PROGRESS[status]);
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    res.json({ success: true, data: order });
  }
);

module.exports = router;
