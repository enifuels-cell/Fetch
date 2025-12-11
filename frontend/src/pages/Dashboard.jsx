import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import PassengerDashboard from './PassengerDashboard';
import RiderDashboard from './RiderDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return user.role === 'passenger' ? <PassengerDashboard /> : <RiderDashboard />;
};

export default Dashboard;
