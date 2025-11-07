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
  const [filters, setFilters] = useState({ dateRange: 'last30days', category: 'all' });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulated data fetching - replace with actual API call
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock data based on database schema
      // Change hasData to false to see empty state
      const mockData = {
        hasData: true,
        summary: {
          totalSaved: 57,
          totalDonated: 15,
          totalUsed: 30
        },
        statusOverview: [
          { name: 'Used', value: 30, color: '#7FA34B' },
          { name: 'Saved', value: 27, color: '#4A90E2' },
          { name: 'Donated', value: 15, color: '#F5A962' },
          { name: 'Wasted', value: 5, color: '#E85D75' }
        ],
        expiringSoon: [
          { id: 1, foodName: 'Noodle', expiryDate: '2025-11-10', quantity: '2 pcs' },
          { id: 2, foodName: 'Milk', expiryDate: '2025-11-12', quantity: '1 l' },
          { id: 3, foodName: 'Tomato Can Pod', expiryDate: '2025-11-15', quantity: '3 pack' }
        ],
        usedVsWaste: [
          { month: 'Jun', used: 25, wasted: 8 },
          { month: 'Jul', used: 32, wasted: 6 },
          { month: 'Aug', used: 28, wasted: 4 },
          { month: 'Sep', used: 35, wasted: 7 },
          { month: 'Oct', used: 30, wasted: 5 },
          { month: 'Nov', used: 27, wasted: 3 }
        ]
      };

      setAnalyticsData(mockData);
      setLoading(false);
    };

    fetchAnalyticsData();
  }, [filters]);

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