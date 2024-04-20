process.on('uncaughtException', err => {
  console.log('⚠️  Uncaught Exception:', err.name);
  console.log(err);
  console.log('Server is shutting down...');
  process.exit(1);
});

const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const mongoose = require('mongoose');

mongoose.connect(
  process.env.DB_URI.replace(/<password>/g, process.env.DB_PASSWORD)
);

const app = require('./app');

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});

process.on('unhandledRejection', (err, promise) => {
  console.error('⚠️  Unhandled Rejection:', err.message, err.name);
  console.log(err);

  console.log('Server is shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
