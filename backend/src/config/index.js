require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  NASA_API_KEY: process.env.NASA_API_KEY || 'DEMO_KEY',
  NASA_BASE_URL: 'https://api.nasa.gov/neo/rest/v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};