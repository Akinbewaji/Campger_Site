import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { campaignService } from '../services/campaignService';
import './Dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    sms: 0,
    airtime: 0,
    voice: 0,
    data: 0,
    ussd: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = authService.getUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);

        // Fetch campaign counts
        try {
          const campaigns = await campaignService.getAllCampaigns();
          setStats(prev => ({
            ...prev,
            sms: campaigns?.length || 0,
          }));
        } catch (err) {
          console.error('Error fetching SMS campaigns:', err);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const services = [
    {
      name: 'SMS',
      path: '/sms',
      icon: '💬',
      description: 'Send SMS campaigns',
      count: stats.sms,
    },
    {
      name: 'Airtime',
      path: '/airtime',
      icon: '📱',
      description: 'Send mobile airtime',
      count: stats.airtime,
    },
    {
      name: 'Voice',
      path: '/voice',
      icon: '📞',
      description: 'Make voice calls',
      count: stats.voice,
    },
    {
      name: 'Data',
      path: '/data',
      icon: '📊',
      description: 'Send data bundles',
      count: stats.data,
    },
    {
      name: 'USSD',
      path: '/ussd',
      icon: '⚡',
      description: 'Send USSD codes',
      count: stats.ussd,
    },
  ];

  if (loading) {
    return <div className="loading">Loading CAMPGER...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="logo">CAMPGER</h1>
            <p className="tagline">Multi-service Campaign Manager</p>
          </div>
          <div className="user-info">
            <span>Welcome, {user?.name || user?.email}!</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-container">
          {error && <div className="error-message">{error}</div>}

          <section className="services-section">
            <h2>Our Services</h2>
            <div className="services-grid">
              {services.map(service => (
                <div
                  key={service.path}
                  className="service-card"
                  onClick={() => navigate(service.path)}
                >
                  <div className="service-icon">{service.icon}</div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-stats">
                    <span className="stat-badge">{service.count} campaigns</span>
                  </div>
                  <button className="service-btn">Launch Service →</button>
                </div>
              ))}
            </div>
          </section>

          <section className="features-section">
            <h2>Key Features</h2>
            <div className="features-grid">
              <div className="feature">
                <span className="feature-icon">✓</span>
                <h4>Bulk Operations</h4>
                <p>Send to thousands of recipients at once</p>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <h4>Real-time Tracking</h4>
                <p>Monitor campaign delivery in real-time</p>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <h4>Africa's Talking</h4>
                <p>Powered by Africa's Talking API</p>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <h4>Multiple Services</h4>
                <p>SMS, Airtime, Voice, Data, USSD</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
