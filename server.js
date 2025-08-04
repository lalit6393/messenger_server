require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(port, () => {
      console.log('🚀 Server running on http://localhost:3000');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
