const app = require('./app');
const { PORT } = require('./config');

app.listen(PORT, () => {
  console.log(`🚀 Oscilla Backend running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
});