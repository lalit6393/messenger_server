require('dotenv').config();
const mongoose = require('mongoose');
const server = require('./app');

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    server.listen(3000, () => {
      console.log('🚀 Server running on http://localhost:3000');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
