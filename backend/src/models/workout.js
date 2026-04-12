const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Workout = sequelize.define('Workout', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  workout_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  logged_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  logged_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'workouts',
  timestamps: false
});

module.exports = Workout;