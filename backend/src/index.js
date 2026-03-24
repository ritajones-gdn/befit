const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

//ROUTES 
app.use('/auth', authRoutes);

//Later we will add:
//app.use('/meals', mealRoutes);
//app.use('/workouts', workoutRoutes);
//app.use('/checkins', checkinRoutes);
//app.use('/friends', friendRoutes);

//HEALTH CHECK 
app.get('/', (req, res) => {
  res.json({ message: 'BeFit API is running! 💪' });
});

// ─── START SERVER ────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

db.getConnection()
  .then(() => {
    console.log('✅ Database connected!');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });