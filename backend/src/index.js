const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/database');
//1.
const authRoutes = require('./routes/auth');

//2.
const userRoutes = require('./routes/users');

//3
const mealRoutes = require('./routes/meals');
const workoutRoutes = require('./routes/workouts');

const app = express();
app.use(cors());
app.use(express.json());

//ROUTES 
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/meals', mealRoutes);
app.use('/workouts',workoutRoutes);


//Later we will add:
//app.use('/workouts', workoutRoutes);
//app.use('/checkins', checkinRoutes);
//app.use('/friends', friendRoutes);

//HEALTH CHECK (for now)
app.get('/', (req, res) => {
  res.json({ message: 'BeFit API is running' });
});

//start server to check if everything is connected
const PORT = process.env.PORT || 3000;

db.getConnection()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });