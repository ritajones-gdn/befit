const Workout = require('./workout');
const WorkoutSet = require('./workoutSet');

Workout.hasMany(WorkoutSet, { foreignKey: 'workout_id', as: 'sets', onDelete:'CASCADE'});
WorkoutSet.belongsTo(Workout, { foreignKey: 'workout_id', as:'workout' });

module.exports = {
  Workout,
  WorkoutSet
};