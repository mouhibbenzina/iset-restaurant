const router = require('express').Router();
const { MENU_DATA, SUBSCRIPTION_PLANS } = require('../data/menu');

// GET /api/menu — all or filtered by category
router.get('/', (req, res) => {
  const { cat, ramadan } = req.query;
  let items = [...MENU_DATA];
  if (cat && cat !== 'all') items = items.filter(i => i.cat === cat);
  if (ramadan === 'false') items = items.filter(i => !i.ramadan);
  res.json({ success: true, count: items.length, data: items });
});

// GET /api/menu/categories
router.get('/categories', (req, res) => {
  const cats = [...new Set(MENU_DATA.map(i => i.cat))];
  res.json({ success: true, data: cats });
});

// GET /api/menu/:id
router.get('/:id', (req, res) => {
  const item = MENU_DATA.find(i => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Plat introuvable' });
  res.json({ success: true, data: item });
});

// GET /api/menu/subscriptions
router.get('/subscriptions/plans', (req, res) => {
  res.json({ success: true, data: SUBSCRIPTION_PLANS });
});

module.exports = router;
