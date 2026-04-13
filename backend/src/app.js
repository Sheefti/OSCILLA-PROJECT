const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { CORS_ORIGIN } = require('./config');
const rateLimiter = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const neoRoutes = require('./routes/neo.routes');

const app = express();

// === Sécurité & Middlewares globaux ===
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(rateLimiter);

// === Routes ===
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'oscilla-backend' }));
app.use('/api/neo', neoRoutes);

// === Gestion des erreurs (doit être en dernier) ===
app.use(errorHandler);

module.exports = app;