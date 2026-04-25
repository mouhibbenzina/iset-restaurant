// In-memory store (replace with a DB like PostgreSQL on Render for production)
const { v4: uuidv4 } = require('uuid');

let orders = [
  {
    id: '#001',
    client: 'Ahmed Ben Ali',
    type: 'Étudiant',
    items: ['Couscous Tunisien', 'Jus de Fruit Frais'],
    total: 7.000,
    status: 'ready',
    progress: 75,
    meal: 'Déjeuner',
    createdAt: new Date().toISOString(),
  },
  {
    id: '#002',
    client: 'Dr. Fatma Trabelsi',
    type: 'Enseignant',
    items: ['Poisson Grillé', 'Café Tunisien', 'Baklawa'],
    total: 8.800,
    status: 'preparing',
    progress: 30,
    meal: 'Déjeuner',
    createdAt: new Date().toISOString(),
  },
];

let reservations = [
  {
    id: uuidv4(),
    name: 'Prof. Sami Mansour',
    type: 'Enseignant',
    time: 'Déjeuner 12h00',
    persons: 3,
    status: 'confirmed',
    ramadan: false,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
];

function getOrders() { return [...orders]; }
function getReservations() { return [...reservations]; }

function createOrder(data) {
  const newOrder = {
    id: `#${String(Math.floor(Math.random() * 900 + 100)).padStart(3, '0')}`,
    ...data,
    status: 'preparing',
    progress: 20,
    createdAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  return newOrder;
}

function createReservation(data) {
  const res = {
    id: uuidv4(),
    ...data,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  reservations.unshift(res);
  return res;
}

function updateOrderStatus(id, status, progress) {
  const order = orders.find(o => o.id === id);
  if (!order) return null;
  order.status = status;
  order.progress = progress;
  return order;
}

module.exports = { getOrders, getReservations, createOrder, createReservation, updateOrderStatus };
