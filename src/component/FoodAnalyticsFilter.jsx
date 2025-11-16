// src/component/FoodAnalyticsFilter.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Calendar } from 'lucide-react';

const FoodAnalyticsFilter = ({ onFilterChange, hasData, currentFilters }) => {
  // ✅ Sync with parent state
  const [category, setCategory] = useState(currentFilters?.category || 'all');
  const [timeRange, setTimeRange] = useState(currentFilters?.timeRange || 'alltime');
  const [customStartDate, setCustomStartDate] = useState(currentFilters?.customStartDate || '');
  const [customEndDate, setCustomEndDate] = useState(currentFilters?.customEndDate || '');
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Sync state when parent filters change
  useEffect(() => {
    if (currentFilters) {
      setCategory(currentFilters.category || 'all');
      setTimeRange(currentFilters.timeRange || 'last6months');
      setCustomStartDate(currentFilters.customStartDate || '');
      setCustomEndDate(currentFilters.customEndDate || '');
      setShowCustomDates(currentFilters.timeRange === 'custom');
    }
  }, [currentFilters]);

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
    onFilterChange({ 
      category: value, 
      timeRange,
      customStartDate: showCustomDates ? customStartDate : null,
      customEndDate: showCustomDates ? customEndDate : null
    });
  };

  const handleTimeRangeChange = (e) => {
    const value = e.target.value;
    setTimeRange(value);
    setShowCustomDates(value === 'custom');
    
    if (value !== 'custom') {
      onFilterChange({ 
        category, 
        timeRange: value,
        customStartDate: null,
        customEndDate: null
      });
    }
  };

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      onFilterChange({ 
        category, 
        timeRange: 'custom',
        customStartDate,
        customEndDate
      });
    }
  };

  const handleReset = () => {
    setCategory('all');
    setTimeRange('alltime');
    setCustomStartDate('');
    setCustomEndDate('');
    setShowCustomDates(false);
    onFilterChange({ 
      category: 'all', 
      timeRange: 'alltime',
      customStartDate: null,
      customEndDate: null
    });
  };

  return (
    <motion.div 
      className="filter-container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="filter-group">
        {/* Category Filter */}
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

        {/* Time Range Filter */}
        <div className="filter-item">
          <Calendar size={18} />
          <select 
            value={timeRange}
            onChange={handleTimeRangeChange}
            className="filter-select"
          >
            <option value="alltime">All Time</option>
            <option value="thisweek">This Week</option>
            <option value="lastweek">Last Week</option>
            <option value="thismonth">This Month</option>
            <option value="lastmonth">Last Month</option>
            <option value="last6months">Last 6 Months</option>
            <option value="thisyear">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Custom Date Range Inputs */}
        {showCustomDates && (
          <>
            <div className="filter-item">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="filter-select"
                placeholder="Start Date"
              />
            </div>
            <div className="filter-item">
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="filter-select"
                placeholder="End Date"
              />
            </div>
            <button 
              onClick={handleCustomDateChange} 
              className="reset-button"
              disabled={!customStartDate || !customEndDate}
            >
              Apply
            </button>
          </>
        )}

        <button onClick={handleReset} className="reset-button">
          Reset
        </button>
      </div>
    </motion.div>
  );
};

export default FoodAnalyticsFilter;