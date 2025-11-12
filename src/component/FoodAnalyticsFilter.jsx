// src/component/FoodAnalyticsFilter.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

const FoodAnalyticsFilter = ({ onFilterChange, hasData }) => {
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories_list.php');
        const data = await response.json();
        
        if (data.ok && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          console.error('Failed to load categories:', data.error);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    onFilterChange({ category: value });
  };

  const handleReset = () => {
    setCategory('all');
    onFilterChange({ category: 'all' });
  };

  return (
    <motion.div 
      className="filter-container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="filter-group">
        <div className="filter-item">
          <Filter size={18} />
          <select 
            value={category} 
            onChange={handleCategoryChange}
            className="filter-select"
            disabled={loading}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.categoryID || cat.id} value={cat.categoryID || cat.id}>
                {cat.categoryName || cat.name}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleReset} className="reset-button">
          Reset
        </button>
      </div>
    </motion.div>
  );
};

export default FoodAnalyticsFilter;