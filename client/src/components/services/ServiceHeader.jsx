'use client';

import React from 'react';
import './Services.css';

export default function ServiceHeader({ title, subtitle, icon, onBack }) {
  return (
    <header className="dashboard-header service-header">
      <div className="header-content">
        <div className="service-header-left">
          <button onClick={onBack} className="back-btn">←</button>
          <div>
            <h1 className="service-title">
              <span className="service-icon-large">{icon}</span> {title}
            </h1>
            <p className="service-subtitle">{subtitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
