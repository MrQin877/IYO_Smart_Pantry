import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Calendar, AlertCircle, X } from 'lucide-react';

const FoodAnalyticsFilter = ({ onFilterChange, hasData, currentFilters }) => {
  // Sync with parent state
  const [category, setCategory] = useState(currentFilters?.category || 'all');
  const [timeRange, setTimeRange] = useState(currentFilters?.timeRange || 'alltime');
  const [customStartDate, setCustomStartDate] = useState(currentFilters?.customStartDate || '');
  const [customEndDate, setCustomEndDate] = useState(currentFilters?.customEndDate || '');
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ NEW: Error state for date validation
  const [dateError, setDateError] = useState(null);

  // Sync state when parent filters change
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

  // ✅ NEW: Validation function with error handling
  const handleCustomDateChange = () => {
    // Clear previous errors
    setDateError(null);

    // Validation checks
    if (!customStartDate || !customEndDate) {
      setDateError('Please select both start and end dates');
      return;
    }

    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    // Check if start date is in the future
    if (start > today) {
      setDateError('Start date cannot be in the future. Please select today or an earlier date.');
      return;
    }

    // Check if end date is in the future
    if (end > today) {
      setDateError('End date cannot be in the future. Please select today or an earlier date.');
      return;
    }

    // Check if start date is after end date
    if (start > end) {
      setDateError('Start date cannot be after end date. Please adjust your date range.');
      return;
    }

    // Check if date range is too large (optional - e.g., max 2 years)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 730) { // 2 years
      setDateError('Date range cannot exceed 2 years. Please select a shorter period.');
      return;
    }

    // If all validations pass, apply the filter
    onFilterChange({ 
      category, 
      timeRange: 'custom',
      customStartDate,
      customEndDate
    });
  };

  // ✅ NEW: Close error popup
  const closeErrorPopup = () => {
    setDateError(null);
  };

  const handleReset = () => {
    setCategory('all');
    setTimeRange('alltime');
    setCustomStartDate('');
    setCustomEndDate('');
    setShowCustomDates(false);
    setDateError(null); // Clear any errors
    onFilterChange({ 
      category: 'all', 
      timeRange: 'alltime',
      customStartDate: null,
      customEndDate: null
    });
  };

  return (
    <>
      {/* ✅ NEW: Error Popup Modal */}
      <AnimatePresence>
        {dateError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeErrorPopup}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '440px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                position: 'relative'
              }}
            >
              {/* Close button */}
              <button
                onClick={closeErrorPopup}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#718096',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F7FAFC'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <X size={20} />
              </button>

              {/* Error icon with animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}
              >
                <AlertCircle size={36} color="#E85D75" strokeWidth={2.5} />
              </motion.div>

              {/* Error title */}
              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#2D3748',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                Invalid Date Range
              </h3>

              {/* Error message */}
              <p style={{
                fontSize: '16px',
                color: '#4A5568',
                marginBottom: '28px',
                textAlign: 'center',
                lineHeight: '1.6'
              }}>
                {dateError}
              </p>

              {/* OK button */}
              <button
                onClick={closeErrorPopup}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  backgroundColor: '#7FA34B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(127, 163, 75, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#6B8A3F';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(127, 163, 75, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#7FA34B';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(127, 163, 75, 0.3)';
                }}
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Container */}
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
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates in picker
                />
              </div>
              <div className="filter-item">
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="filter-select"
                  placeholder="End Date"
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates in picker
                />
              </div>
              <button 
                onClick={handleCustomDateChange} 
                className="reset-button"
                disabled={!customStartDate || !customEndDate}
                style={{
                  opacity: (!customStartDate || !customEndDate) ? 0.5 : 1,
                  cursor: (!customStartDate || !customEndDate) ? 'not-allowed' : 'pointer'
                }}
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
    </>
  );
};

export default FoodAnalyticsFilter;