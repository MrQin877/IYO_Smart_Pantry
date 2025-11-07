// src/component/FoodAnalyticsFilter.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter } from 'lucide-react';

const FoodAnalyticsFilter = ({ onFilterChange, hasData }) => {
  const [dateRange, setDateRange] = useState('last30days');
  const [category, setCategory] = useState('all');

  const handleDateChange = (e) => {
    const value = e.target.value;
    setDateRange(value);
    onFilterChange({ dateRange: value, category });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    onFilterChange({ dateRange, category: value });
  };

  const handleReset = () => {
    setDateRange('last30days');
    setCategory('all');
    onFilterChange({ dateRange: 'last30days', category: 'all' });
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
          <Calendar size={18} />
          <select 
            value={dateRange} 
            onChange={handleDateChange}
            className="filter-select"
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last3months">Last 3 Months</option>
            <option value="last6months">Last 6 Months</option>
            <option value="lastyear">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div className="filter-item">
          <Filter size={18} />
          <select 
            value={category} 
            onChange={handleCategoryChange}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="protein">Protein</option>
            <option value="grains">Grains</option>
            <option value="fruits">Fruits</option>
            <option value="vegetables">Vegetables</option>
            <option value="dairy">Dairy</option>
            <option value="canned">Canned Food</option>
            <option value="other">Other</option>
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