import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayMeals, logMeal, deleteMeal } from '../../api/meals';
import BottomNav from '../../components/BottomNav';
import toast from 'react-hot-toast';

const LogMeal = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    meal_type: 'breakfast'
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await getTodayMeals();
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await logMeal({
        ...formData,
        calories: parseInt(formData.calories),
        protein: parseFloat(formData.protein) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        fats: parseFloat(formData.fats) || 0,
      });
      toast.success('Meal logged successfully! 🥗');
      setFormData({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        meal_type: 'breakfast'
      });
      setShowForm(false);
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to log meal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMeal(id);
      toast.success('Meal deleted!');
      fetchSummary();
    } catch (error) {
      toast.error('Failed to delete meal');
    }
  };

  const getMealsByType = (type) => {
    return summary?.meals?.filter(meal => meal.meal_type === type) || [];
  };

  const getMealTypeCalories = (type) => {
    return getMealsByType(type).reduce((sum, meal) => sum + meal.calories, 0);
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-900 text-lg font-medium">Loading... 🥗</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <button
          onClick={() => navigate('/home')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          <span className="text-xl">←</span>
        </button>
        <h1 className="text-gray-900 font-bold text-lg">Nutrition Dashboard</h1>
        <div className="w-10 h-10 flex items-center justify-center">
          <span className="text-xl">📅</span>
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-12 py-6 max-w-7xl mx-auto">

        {/* Calories Remaining Card */}
        {summary && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              Calories Remaining
            </p>
            <p className="text-5xl font-bold text-gray-900 mb-1">
              {summary.calories_remaining}
            </p>
            <p className="text-gray-400 text-sm">
              Goal: {summary.calorie_goal?.toLocaleString()} kcal
            </p>

            {/* Eaten Burned Net */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-gray-900 font-bold text-lg">
                  {summary.total_calories_eaten}
                </p>
                <p className="text-gray-400 text-xs">EATEN</p>
              </div>
              <div>
                <p className="text-gray-900 font-bold text-lg">
                  {summary.total_calories_burned}
                </p>
                <p className="text-gray-400 text-xs">BURNED</p>
              </div>
              <div>
                <p className="text-gray-900 font-bold text-lg">
                  {summary.net_calories}
                </p>
                <p className="text-gray-400 text-xs">NET</p>
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {/* Protein */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>PROTEIN</span>
                  <span>{summary.total_protein}g</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-red-900 h-1.5 rounded-full"
                    style={{ width: `${Math.min((summary.total_protein / 150) * 100, 100)}%` }}
                  />
                </div>
              </div>
              {/* Carbs */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>CARBS</span>
                  <span>{summary.total_carbs}g</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-red-900 h-1.5 rounded-full"
                    style={{ width: `${Math.min((summary.total_carbs / 200) * 100, 100)}%` }}
                  />
                </div>
              </div>
              {/* Fats */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>FATS</span>
                  <span>{summary.total_fats}g</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-red-900 h-1.5 rounded-full"
                    style={{ width: `${Math.min((summary.total_fats / 65) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Today's Meals */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-gray-900 font-bold text-lg">Today's Meals</h3>
          </div>

          {mealTypes.map((type) => (
            <div key={type} className="p-4 border-b border-gray-50">
              {/* Meal Type Header */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-red-900 text-xs font-bold uppercase tracking-wide">
                  {type}
                </span>
                <span className="text-gray-400 text-xs">
                  {getMealTypeCalories(type)} kcal
                </span>
              </div>

              {/* Meals List */}
              {getMealsByType(type).length === 0 ? (
                <p className="text-gray-300 text-xs italic">No meals logged</p>
              ) : (
                getMealsByType(type).map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="text-gray-800 text-sm font-medium">{meal.name}</p>
                      <p className="text-gray-400 text-xs">
                        {meal.calories} kcal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(meal.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition"
                    >
                      <span className="text-gray-300 hover:text-red-500">🗑️</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Log Meal Button */}
      {!showForm && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30">
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-900 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-red-800 transition flex items-center gap-2"
          >
            <span>+</span> Log Meal
          </button>
        </div>
      )}

      {/* Log Meal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-3xl p-6 max-h-screen overflow-y-auto">

            {/* Form Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 font-bold text-xl">Log Meal</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="text-red-900 font-semibold text-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Log'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Meal Name */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                  Meal Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Chicken Salad"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                />
              </div>

              {/* Calories */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                  Calories
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="calories"
                    placeholder="500"
                    value={formData.calories}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                  />
                  <span className="absolute right-4 top-3 text-gray-400 text-sm">kcal</span>
                </div>
              </div>

              {/* Protein and Carbs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    Protein
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="protein"
                      placeholder="30"
                      value={formData.protein}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                    />
                    <span className="absolute right-3 top-3 text-gray-400 text-sm">g</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    Carbs
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="carbs"
                      placeholder="50"
                      value={formData.carbs}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                    />
                    <span className="absolute right-3 top-3 text-gray-400 text-sm">g</span>
                  </div>
                </div>
              </div>

              {/* Fats */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                  Fats
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="fats"
                    placeholder="10"
                    value={formData.fats}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                  />
                  <span className="absolute right-3 top-3 text-gray-400 text-sm">g</span>
                </div>
              </div>

              {/* Meal Type */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Meal Type
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, meal_type: type })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition capitalize ${
                        formData.meal_type === type
                          ? 'bg-red-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-red-900 text-white font-semibold rounded-full hover:bg-red-800 transition disabled:opacity-50 mt-2"
              >
                {submitting ? 'Logging...' : '+ Log Meal'}
              </button>

            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default LogMeal;