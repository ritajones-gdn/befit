const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutSet = sequelize.define('WorkoutSet', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  workout_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  exercise_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  sets: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reps: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  weight_kg: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  duration_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'workout_sets',
  timestamps: false
});

module.exports = WorkoutSet;