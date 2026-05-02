import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logWorkout, addSets } from '../../api/workouts';
import BottomNav from '../../components/BottomNav';
import toast from 'react-hot-toast';

const LogWorkout = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [workoutId, setWorkoutId] = useState(null);
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [exercises, setExercises] = useState([]);

  const [workoutForm, setWorkoutForm] = useState({
    title: '',
    workout_type: 'strength',
    duration_minutes: 45,
    notes: ''
  });

  const [exerciseForm, setExerciseForm] = useState({
    exercise_name: '',
    sets: '',
    reps: '',
    weight_kg: '',
    duration_seconds: '',
    notes: ''
  });

  const workoutTypes = [
    'strength',
    'cardio',
    'flexibility',
    'yoga',
    'cycling',
    'sports',
    'other'
  ];

  const motivationalQuotes = [
    '"Strength does not come from physical capacity. It comes from an indomitable will."',
    '"The only bad workout is the one that didn\'t happen."',
    '"Push yourself because no one else is going to do it for you."',
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const handleWorkoutChange = (e) => {
    setWorkoutForm({ ...workoutForm, [e.target.name]: e.target.value });
  };

  const handleExerciseChange = (e) => {
    setExerciseForm({ ...exerciseForm, [e.target.name]: e.target.value });
  };

  const handleStartWorkout = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await logWorkout(workoutForm);
      setWorkoutId(response.data.workout.id);
      setWorkoutTitle(response.data.workout.title);
      toast.success('Workout started! 💪 Now add your exercises.');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start workout');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddExercise = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addSets(workoutId, {
        exercise_name: exerciseForm.exercise_name,
        sets: parseInt(exerciseForm.sets) || null,
        reps: parseInt(exerciseForm.reps) || null,
        weight_kg: parseFloat(exerciseForm.weight_kg) || null,
        duration_seconds: parseInt(exerciseForm.duration_seconds) || null,
        notes: exerciseForm.notes || null
      });

      setExercises([...exercises, exerciseForm]);
      toast.success(`${exerciseForm.exercise_name} added! 🏋️`);

      // Reset exercise form
      setExerciseForm({
        exercise_name: '',
        sets: '',
        reps: '',
        weight_kg: '',
        duration_seconds: '',
        notes: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add exercise');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    toast.success(`Workout complete! ${exercises.length} exercise(s) logged 🎉`);
    navigate('/home');
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <button
          onClick={() => step === 1 ? navigate('/home') : setStep(1)}
          className="flex items-center gap-2 text-red-900 font-medium"
        >
          <span>←</span>
          <span>Log Workout</span>
        </button>
        {step === 2 && (
          <button
            onClick={handleFinish}
            className="text-red-900 font-semibold text-sm"
          >
            Finish
          </button>
        )}
      </div>

      <div className="px-4 md:px-8 lg:px-12 py-6 max-w-3xl mx-auto">

        {/* ── STEP 1 — Start Workout ── */}
        {step === 1 && (
          <>
            {/* Motivational Banner */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex gap-4 items-center">
              <div className="w-24 h-20 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                <span className="text-4xl">🏋️</span>
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-lg">Morning Flow</h3>
                <p className="text-gray-400 text-xs mt-1 italic">{randomQuote}</p>
              </div>
            </div>

            {/* Workout Form */}
            <form onSubmit={handleStartWorkout} className="space-y-4">

              {/* Workout Title */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                  Workout Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Upper Body Strength"
                  value={workoutForm.title}
                  onChange={handleWorkoutChange}
                  required
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                />
              </div>

              {/* Workout Type + Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    Workout Type
                  </label>
                  <select
                    name="workout_type"
                    value={workoutForm.workout_type}
                    onChange={handleWorkoutChange}
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm appearance-none"
                  >
                    {workoutTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    Estimated Duration
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="duration_minutes"
                      placeholder="45"
                      value={workoutForm.duration_minutes}
                      onChange={handleWorkoutChange}
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                    />
                    <span className="absolute right-3 top-3 text-gray-400 text-sm">min</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                  Notes
                </label>
                <textarea
                  name="notes"
                  placeholder="How are you feeling today? Any specific goals?"
                  value={workoutForm.notes}
                  onChange={handleWorkoutChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm resize-none"
                />
              </div>

              {/* Start Workout Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-red-900 text-white font-bold rounded-full hover:bg-red-800 transition disabled:opacity-50 text-lg mt-4"
              >
                {submitting ? 'Starting...' : 'Start Workout'}
              </button>

              <p className="text-center text-gray-400 text-xs">
                Your progress will be synced automatically
              </p>

            </form>
          </>
        )}

        {/* ── STEP 2 — Add Exercises ── */}
        {step === 2 && (
          <>
            {/* Current Session Info */}
            <div className="text-center mb-6">
              <p className="text-gray-400 text-xs uppercase tracking-wide">
                Current Session
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">{workoutTitle}</h2>
              <p className="text-gray-400 text-sm mt-1">{today}</p>
            </div>

            {/* Exercises Added So Far */}
            {exercises.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
                <h3 className="text-gray-900 font-bold mb-3">
                  Added Exercises ({exercises.length})
                </h3>
                {exercises.map((ex, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-gray-800 text-sm font-medium">{ex.exercise_name}</p>
                      <p className="text-gray-400 text-xs">
                        {ex.sets && `${ex.sets} sets`}
                        {ex.reps && ` × ${ex.reps} reps`}
                        {ex.weight_kg && ` • ${ex.weight_kg}kg`}
                      </p>
                    </div>
                    <span className="text-green-500 text-sm">✓</span>
                  </div>
                ))}
              </div>
            )}

            {/* Add Exercise Form */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-gray-900 font-bold text-lg mb-4">Add Exercise</h3>

              <form onSubmit={handleAddExercise} className="space-y-4">

                {/* Exercise Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    name="exercise_name"
                    placeholder="Squat"
                    value={exerciseForm.exercise_name}
                    onChange={handleExerciseChange}
                    required
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                  />
                </div>

                {/* Sets Reps Weight */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                      Sets
                    </label>
                    <input
                      type="number"
                      name="sets"
                      placeholder="3"
                      value={exerciseForm.sets}
                      onChange={handleExerciseChange}
                      className="w-full px-3 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                      Reps
                    </label>
                    <input
                      type="number"
                      name="reps"
                      placeholder="10"
                      value={exerciseForm.reps}
                      onChange={handleExerciseChange}
                      className="w-full px-3 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight_kg"
                      placeholder="40"
                      value={exerciseForm.weight_kg}
                      onChange={handleExerciseChange}
                      className="w-full px-3 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    name="duration_seconds"
                    placeholder="60"
                    value={exerciseForm.duration_seconds}
                    onChange={handleExerciseChange}
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    name="notes"
                    placeholder="Add notes..."
                    value={exerciseForm.notes}
                    onChange={handleExerciseChange}
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                  />
                </div>

                {/* Add Exercise Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-red-900 text-white font-semibold rounded-full hover:bg-red-800 transition disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : '+ Add Exercise'}
                </button>

              </form>
            </div>

            {/* Finish Workout Button */}
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition mt-4"
            >
              Finish Workout 🎉
            </button>

          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default LogWorkout;