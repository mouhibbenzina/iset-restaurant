const router = require('express').Router();
const { body } = require('express-validator');
const { handleValidation, sanitizeString, reservationLimiter } = require('../middleware/security');
const { getReservations, createReservation } = require('../data/store');

// GET /api/reservations
router.get('/', (req, res) => {
  const { date } = req.query;
  let data = getReservations();
  if (date) data = data.filter(r => r.date === date);
  res.json({ success: true, count: data.length, data });
});

// POST /api/reservations
router.post(
  '/',
  reservationLimiter,
  [
    body('name').trim().notEmpty().withMessage('Nom requis').isLength({ max: 100 }),
    body('type').trim().isIn(['Étudiant', 'Enseignant', 'Personnel Externe']).withMessage('Type invalide'),
    body('time').trim().notEmpty().withMessage('Heure requise').isLength({ max: 50 }),
    body('persons').isInt({ min: 1, max: 50 }).withMessage('Nombre de personnes invalide (1-50)'),
    body('date').isISO8601().withMessage('Date invalide'),
    body('ramadan').optional().isBoolean(),
    body('notes').optional().trim().isLength({ max: 300 }),
  ],
  handleValidation,
  (req, res) => {
    const { name, type, time, persons, date, ramadan = false, notes = '' } = req.body;

    const reservation = createReservation({
      name: sanitizeString(name),
      type: sanitizeString(type),
      time: sanitizeString(time),
      persons: Number(persons),
      date,
      ramadan: Boolean(ramadan),
      notes: sanitizeString(notes),
    });

    res.status(201).json({ success: true, data: reservation });
  }
);

module.exports = router;
