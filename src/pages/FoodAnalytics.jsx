// src/pages/FoodAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Gift, 
  UtensilsCrossed,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import FoodAnalyticsFilter from '../component/FoodAnalyticsFilter.jsx';
import './FoodAnalytics.css';

// Cute Empty State Component
const CuteEmptyState = ({ filters }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Falling leaves animation
  const leaves = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    delay: i * 1.5,
    x: Math.random() * 100 - 50,
  }));

  return (
    <div style={{
      position: 'relative',
      minHeight: '500px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      padding: '40px',
      borderRadius: '24px',
      margin: '20px 0'
    }}>
      {/* Falling Leaves */}
      <AnimatePresence>
        {leaves.map((leaf) => (
          <motion.div
            key={leaf.id}
            initial={{ 
              y: -100, 
              x: leaf.x, 
              opacity: 0,
              rotate: 0 
            }}
            animate={{ 
              y: 600,
              x: leaf.x + Math.sin(leaf.delay) * 30,
              opacity: [0, 0.5, 0.5, 0],
              rotate: [0, 360, 720]
            }}
            transition={{
              duration: 4,
              delay: leaf.delay,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              fontSize: '24px',
              pointerEvents: 'none',
              zIndex: 1
            }}
          >
            🍃
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Cute Face with Color Change */}
        <motion.div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
          animate={isShaking ? {
            rotate: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.5 }
          } : {}}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            cursor: 'pointer',
            display: 'inline-block',
            position: 'relative',
            marginBottom: '30px'
          }}
        >
          {/* Face Circle - Pink to Green */}
          <motion.div
            animate={{
              background: isHovered 
                ? 'linear-gradient(135deg, #b4d17d89 0%, #95b2709c 100%)'
                : 'linear-gradient(135deg, #ffcccc 0%, #ffb3b3 100%)'
            }}
            transition={{ duration: 0.5 }}
            style={{
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: isHovered 
                ? '0 10px 40px rgba(127, 163, 75, 0.3)'
                : '0 10px 40px rgba(255, 179, 179, 0.3)',
            }}
          >
            {/* Eyes - Blink on hover */}
            <div style={{
              display: 'flex',
              gap: '30px',
              marginBottom: '10px',
              position: 'relative',
              zIndex: 10
            }}>
              <motion.div
                animate={{
                  backgroundColor: isHovered ? '#4a7c3f' : '#cc6666',
                  scaleY: isHovered ? [1, 0.2, 1] : 1
                }}
                transition={{ 
                  backgroundColor: { duration: 0.3 },
                  scaleY: { duration: 0.3, times: [0, 0.5, 1] }
                }}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                }}
              />
              <motion.div
                animate={{
                  backgroundColor: isHovered ? '#4a7c3f' : '#cc6666',
                  scaleY: isHovered ? [1, 0.2, 1] : 1
                }}
                transition={{ 
                  backgroundColor: { duration: 0.3 },
                  scaleY: { duration: 0.3, times: [0, 0.5, 1] }
                }}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                }}
              />
            </div>

            {/* Mouth - Sad to Happy */}
            <motion.div
              style={{
                position: 'absolute',
                bottom: '35px',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <svg width="60" height="40" viewBox="0 0 80 40">
                <motion.path
                  animate={{
                    d: isHovered ? 'M 20 20 Q 40 35 60 20' : 'M 20 20 Q 40 5 60 20',
                    stroke: isHovered ? '#4a7c3f' : '#cc6666'
                  }}
                  transition={{ duration: 0.3 }}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            {/* Tears - Only show when NOT hovered (sad) */}
            {!isHovered && (
              <>
                {/* Left tear */}
                <motion.div
                  key="left-tear"
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: [0, 80], opacity: [1, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeIn"
                  }}
                  style={{
                    position: "absolute",
                    left: "45px",
                    top: "65px",
                    width: "12px",
                    height: "20px",
                    background: "#97c0e6ff",
                    borderRadius: "8px 8px 50% 50%",
                    filter: "blur(0.5px)"
                  }}
                />

                {/* Right tear */}
                <motion.div
                  key="right-tear"
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: [0, 80], opacity: [1, 0] }}
                  transition={{
                    duration: 1.5,
                    delay: 0.5,
                    repeat: Infinity,
                    ease: "easeIn"
                  }}
                  style={{
                    position: "absolute",
                    right: "45px",
                    top: "65px",
                    width: "12px",
                    height: "20px",
                    background: "#76B6F0",
                    borderRadius: "8px 8px 50% 50%",
                    filter: "blur(0.5px)"
                  }}
                />
              </>
            )}


            {/* Blush - Pink cheeks that fade when hover */}
            <motion.div
              animate={{
                opacity: isHovered ? 0 : 0.6
              }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                left: '15px',
                top: '70px',
                width: '20px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ff9999',
                filter: 'blur(4px)'
              }}
            />
            <motion.div
              animate={{
                opacity: isHovered ? 0 : 0.6
              }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                right: '15px',
                top: '70px',
                width: '20px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ff9999',
                filter: 'blur(4px)'
              }}
            />

            {/* Sparkles when hover */}
            <AnimatePresence>
              {isHovered && (
                <>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      left: '20px',
                      fontSize: '20px'
                    }}
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      fontSize: '20px'
                    }}
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '30px',
                      fontSize: '16px'
                    }}
                  >
                    ✨
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Little leaf on top */}
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '32px'
            }}
          >
            🌿
          </motion.div>
        </motion.div>

        {/* Text Content with Fade In */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#5a5a5a',
            marginBottom: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          No Food Saving Data Found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            fontSize: '18px',
            color: '#7a7a7a',
            marginBottom: '16px',
            fontWeight: '500'
          }}
        >
          Start to use IYO Smart Pantry to view your progress!
        </motion.p>

        {filters?.category !== 'all' && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            style={{
              fontSize: '14px',
              color: '#597334ff',
              backgroundColor: 'rgba(127, 163, 75, 0.08)',
              padding: '8px 16px',
              borderRadius: '20px',
              display: 'inline-block',
              marginTop: '8px',
              border: '1px solid #B4D17D'
            }}
          >
             Try selecting "All Categories" to see all data
          </motion.p>
        )}

        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -40, -20],
              x: [0, 10, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 3,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              left: `${30 + i * 20}%`,
              bottom: '20%',
              fontSize: '20px',
              pointerEvents: 'none'
            }}
          >
            ✨
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Main FoodAnalytics Component
const FoodAnalytics = () => {
  const [filters, setFilters] = useState({ 
    category: 'all',
    timeRange: 'last6months',
    customStartDate: null,
    customEndDate: null
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);

  // ✅ Get category name helper
  const getCategoryName = (categoryID) => {
    const categoryMap = {
      'C1': 'Protein',
      'C2': 'Grains',
      'C3': 'Fruits',
      'C4': 'Vegetables',
      'C5': 'Dairy',
      'C6': 'Canned Food',
      'C7': 'Other'
    };
    return categoryMap[categoryID] || categoryID;
  };

  // ✅ Helper function to format date range for display
  const getDateRangeLabel = () => {
    const labels = {
      'thisweek': 'This Week',
      'lastweek': 'Last Week',
      'thismonth': 'This Month',
      'lastmonth': 'Last Month',
      'last6months': 'Past 6 Months',
      'custom': filters.customStartDate && filters.customEndDate 
        ? `${new Date(filters.customStartDate).toLocaleDateString('en-GB')} - ${new Date(filters.customEndDate).toLocaleDateString('en-GB')}`
        : 'Custom Range'
    };
    return labels[filters.timeRange] || 'Unknown Range';
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      setRawResponse(null);
      
      try {
        const userID = localStorage.getItem('userID');
        console.log("Current userID:", userID);
        console.log("Current filters:", filters);
        
        if (!userID) {
          throw new Error('User not logged in');
        }

        console.log("Making API call to /api/food_analytics.php");
        
        const response = await fetch('/api/food_analytics.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userID,
            categoryID: filters.category,
            timeRange: filters.timeRange,
            customStartDate: filters.customStartDate,
            customEndDate: filters.customEndDate
          }),
        });
        
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        setRawResponse(responseText);
        
        let res;
        try {
          res = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(`Non-JSON response: ${responseText.substring(0, 200)}...`);
        }
        
        console.log("Parsed API response:", res);

        if (res.ok) {
          const analyticsData = {
            hasData: res.hasData,
            summary: {
              totalSaved: res.summary.totalSaved,
              totalDonated: res.summary.totalDonated,
              totalUsed: res.summary.totalUsed
            },
            statusOverview: res.statusOverview,
            expiringSoon: res.expiringSoon.map(item => ({
              id: item.id,
              foodName: item.foodName,
              expiryDate: item.expiryDate,
              quantity: item.quantity,
              categoryName: item.categoryName
            })),
            savedVsWaste: res.savedVsWaste || [],
            dateRange: res.dateRange || {}
          };

          setAnalyticsData(analyticsData);
        } else {
          console.error("API returned error:", res.error);
          throw new Error(res.error || 'Failed to fetch analytics');
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError(err.message);
        setAnalyticsData({ hasData: false, savedVsWaste: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    console.log("Filter changed:", newFilters);
    setFilters(newFilters);
  };

  // Loading State
  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-state">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <BarChart3 size={48} color="#7FA34B" />
          </motion.div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="analytics-container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1>Track My Impact</h1>
        </motion.div>
        
        <motion.div 
          className="error-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AlertCircle size={64} color="#E85D75" strokeWidth={1.5} />
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <p>Please check the console for more details.</p>
          
          {rawResponse && (
            <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '800px', margin: '20px auto' }}>
              <summary>Raw Response (Click to expand)</summary>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto', maxHeight: '200px' }}>
                {rawResponse}
              </pre>
            </details>
          )}
        </motion.div>
      </div>
    );
  }

  // Empty State
  if (!analyticsData?.hasData) {
    return (
      <div className="analytics-container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1>Track My Impact</h1>
        </motion.div>
        
        <FoodAnalyticsFilter 
          onFilterChange={handleFilterChange} 
          hasData={false}
          currentFilters={filters}
        />
        
        <CuteEmptyState filters={filters} />
      </div>
    );
  }

  const { 
    summary = {}, 
    statusOverview = [], 
    expiringSoon = [], 
    savedVsWaste = [],
    dateRange = {}
  } = analyticsData || {};

  return (
    <div className="analytics-container">
      {/* Page Header */}
      <motion.div 
        className="page-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1>Track My Impact</h1>
      </motion.div>

      {/* Filters Component - Pass current filters */}
      <FoodAnalyticsFilter 
        onFilterChange={handleFilterChange} 
        hasData={analyticsData.hasData}
        currentFilters={filters}
      />

      {/* Report Title - Dynamic based on filters */}
      <motion.div 
        className="report-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="report-title">
          Food Analytics Report
          {filters.category !== 'all' && ` (${getCategoryName(filters.category)})`}
          <br />
          <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#718096' }}>
            {getDateRangeLabel()}
            {dateRange.startDate && dateRange.endDate && (
              <span style={{ display: 'block', fontSize: '14px', marginTop: '4px' }}>
                ({new Date(dateRange.startDate).toLocaleDateString('en-GB')} to {new Date(dateRange.endDate).toLocaleDateString('en-GB')})
              </span>
            )}
          </span>
        </h2>
      </motion.div>

      {/* Summary Cards Section */}
      <div className="summary-cards">
        <motion.div 
          className="summary-card saved"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <div className="card-icon saved">
              <Package size={24} />
            </div>
            <div className="card-title">Total Saved</div>
          </div>
          <div className="card-value">{summary.totalSaved || 0}</div>
          <div className="card-subtitle">items</div>
        </motion.div>

        <motion.div 
          className="summary-card donated"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-header">
            <div className="card-icon donated">
              <Gift size={24} />
            </div>
            <div className="card-title">Total Donated</div>
          </div>
          <div className="card-value">{summary.totalDonated || 0}</div>
          <div className="card-subtitle">items</div>
        </motion.div>

        <motion.div 
          className="summary-card used"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="card-header">
            <div className="card-icon used">
              <UtensilsCrossed size={24} />
            </div>
            <div className="card-title">Total Used</div>
          </div>
          <div className="card-value">{summary.totalUsed || 0}</div>
          <div className="card-subtitle">items</div>
        </motion.div>
      </div>

      {/* Visualization Grid: Pie Chart + Expiring Soon */}
      <div className="visualization-grid">
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="chart-header">
            <BarChart3 size={20} />
            <h3 className="chart-title">Food Status Overview</h3>
          </div>
          {statusOverview.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusOverview}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusOverview.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="chart-header">
            <AlertCircle size={20} />
            <h3 className="chart-title">Expiring Soon</h3>
          </div>
          {expiringSoon.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
              No items expiring in the next 7 days
            </div>
          ) : (
            <table className="expiring-table">
              <thead>
                <tr>
                  <th>Food Name</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {expiringSoon.map((item, idx) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                  >
                    <td>{item.foodName}</td>
                    <td>
                      <span className="expiry-date">
                        <Calendar size={14} />
                        {new Date(item.expiryDate).toLocaleDateString('en-GB')}
                      </span>
                    </td>
                    <td>{item.quantity}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>

      {/* Full Width Line Chart */}
      <motion.div 
        className="full-width-chart"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="chart-header">
          <TrendingUp size={20} />
          <h3 className="chart-title">Food Saved and Food Waste Overview</h3>
        </div>
        {savedVsWaste.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
            No data available for the selected time range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={savedVsWaste}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="label" stroke="#718096" />
              <YAxis stroke="#718096" />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="saved" 
                stroke="#7FA34B" 
                strokeWidth={3}
                name="Food Saved"
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line 
                type="monotone" 
                dataKey="wasted" 
                stroke="#E85D75" 
                strokeWidth={3}
                name="Food Wasted"
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
};

export default FoodAnalytics;