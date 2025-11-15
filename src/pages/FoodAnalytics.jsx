// src/pages/FoodAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

const FoodAnalytics = () => {
  const [filters, setFilters] = useState({ category: 'all' });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);

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
            categoryID: filters.category
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
            savedVsWaste: res.savedVsWaste || [] // ✅ Provide default empty array
          };

          setAnalyticsData(analyticsData);
        } else {
          console.error("API returned error:", res.error);
          throw new Error(res.error || 'Failed to fetch analytics');
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError(err.message);
        setAnalyticsData({ hasData: false, savedVsWaste: [] }); // ✅ Provide default
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
        
        <FoodAnalyticsFilter onFilterChange={handleFilterChange} hasData={false} />
        
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Package size={64} color="#7FA34B" strokeWidth={1.5} />
          <h2>No Food Saving Data Found</h2>
          <p>Begin logging and donating to view your progress!</p>
          {filters.category !== 'all' && (
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#718096' }}>
              Try selecting "All Categories" to see all data
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // ✅ Safely destructure with defaults
  const { 
    summary = {}, 
    statusOverview = [], 
    expiringSoon = [], 
    savedVsWaste = [] 
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

      {/* Filters Component */}
      <FoodAnalyticsFilter onFilterChange={handleFilterChange} hasData={analyticsData.hasData} />

      {/* Report Title */}
      <motion.div 
        className="report-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="report-title">
          Food Analytics Report 
          {filters.category !== 'all' && ` (Filtered by Category)`}
          <br />
          <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#718096' }}>
            Past 6 Months
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
          <h3 className="chart-title">Monthly Food Saved and Food Waste Overview</h3>
        </div>
        {savedVsWaste.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
            No data available for the past 6 months
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={savedVsWaste}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#718096" />
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