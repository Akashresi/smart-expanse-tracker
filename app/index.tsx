import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user } = useAuth();
  
  // If user object exists in AuthContext, they are authenticated
  if (user) {
    return <Redirect href="./(tabs)/home" />; // Redirect to premium Home
  }
  
  return <Redirect href="/(auth)/login" />;
}
