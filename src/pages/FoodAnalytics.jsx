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
import { apiPost } from "../lib/api";
import FoodAnalyticsFilter from '../component/FoodAnalyticsFilter.jsx';
import './FoodAnalytics.css';

const FoodAnalytics = () => {
  const [filters, setFilters] = useState({ dateRange: 'last30days', category: 'all' });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null); // To store raw response for debugging

  // Simulated data fetching - replace with actual API call
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      setRawResponse(null);
      
      try {
        // Get userID from localStorage/session
        const userID = localStorage.getItem('userID');
        console.log("Current userID:", userID); // Debug log
        
        if (!userID) {
          throw new Error('User not logged in');
        }

        // Call your backend API
        console.log("Making API call to /api/food_analytics.php"); // Debug log
        
        // Let's try to fetch the raw response first to see what we're getting
        const response = await fetch('/api/food_analytics.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userID }),
        });
        
        // Get the response as text first to check if it's valid JSON
        const responseText = await response.text();
        console.log("Raw response:", responseText); // Debug log
        setRawResponse(responseText);
        
        // Try to parse it as JSON
        let res;
        try {
          res = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(`Non-JSON response: ${responseText.substring(0, 200)}...`);
        }
        
        console.log("Parsed API response:", res); // Debug log

        if (res.ok) {
          console.log("Data received:", res); // Debug log
          
          // Map response to state
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
              quantity: item.quantity
            })),
            usedVsWaste: res.usedVsWaste
          };

          setAnalyticsData(analyticsData);
        } else {
          console.error("API returned error:", res.error); // Debug log
          throw new Error(res.error || 'Failed to fetch analytics');
        }
      } catch (err) {
        console.error('Failed to load analytics:', err); // Debug log
        setError(err.message);
        setAnalyticsData({ hasData: false }); // Show empty state
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [filters]); // Re-fetch when filters change

  const handleFilterChange = (newFilters) => {
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
          
          {/* Show raw response for debugging */}
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
        
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Package size={64} color="#7FA34B" strokeWidth={1.5} />
          <h2>No Food Saving Data Found</h2>
          <p>Begin logging and donating to view your progress!</p>
        </motion.div>
      </div>
    );
  }

  const { summary, statusOverview, expiringSoon, usedVsWaste } = analyticsData;

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
          Food Analytics Report (01-01-2025 to {new Date().toLocaleDateString('en-GB')})
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
          <div className="card-value">{summary.totalSaved}</div>
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
          <div className="card-value">{summary.totalDonated}</div>
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
          <div className="card-value">{summary.totalUsed}</div>
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
          <table className="expiring-table">
            <thead>
              <tr>
                <th>Food Name</th>
                <th>Expiry Date</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {expiringSoon.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + item.id * 0.1 }}
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
          <h3 className="chart-title">Monthly Food Used and Food Waste Overview</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={usedVsWaste}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" stroke="#718096" />
            <YAxis stroke="#718096" />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="used" 
              stroke="#7FA34B" 
              strokeWidth={3}
              name="Food Used"
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
      </motion.div>
    </div>
  );
};

export default FoodAnalytics;