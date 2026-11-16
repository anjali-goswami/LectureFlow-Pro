import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('lf_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('lf_token') || localStorage.getItem('lf_user'));
  });

  const isAdmin = currentUser?.role === 'admin';

  // Data states
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lectureHalls, setLectureHalls] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [conflictsData, setConflictsData] = useState({ totalCount: 0, highSeverityCount: 0, breakViolationsCount: 0, conflicts: [] });
  const [policies, setPolicies] = useState({
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
    lunchBreakEnforced: true,
    minTransitionMinutes: 15,
    maxConsecutiveHours: 3
  });
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [systemHealth, setSystemHealth] = useState({ postgresConnected: false });

  // UI status
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToast({ message, type, id });
    setTimeout(() => {
      setToast(prev => (prev && prev.id === id ? null : prev));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToast(prev => (prev && (id === undefined || prev.id === id) ? null : prev));
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.login({ username, password });
      localStorage.setItem('lf_token', res.token);
      localStorage.setItem('lf_user', JSON.stringify(res.user));
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      showToast(`Welcome back, ${res.user.name || res.user.username}!`);
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const signup = async (details) => {
    try {
      const res = await api.signup(details);
      localStorage.setItem('lf_token', res.token);
      localStorage.setItem('lf_user', JSON.stringify(res.user));
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      showToast(`Account created. Welcome, ${res.user.name || res.user.username}!`);
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('lf_token');
    localStorage.removeItem('lf_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    showToast('Signed out successfully', 'info');
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        deptsData,
        coursesData,
        hallsData,
        slotsData,
        schedulesData,
        conflictsRes,
        policiesData,
        summaryData,
        healthData
      ] = await Promise.allSettled([
        api.getDepartments(),
        api.getCourses(),
        api.getLectureHalls(),
        api.getTimeSlots(),
        api.getSchedules(),
        api.getConflicts(),
        api.getPolicies(),
        api.getDashboardSummary(),
        api.getHealth()
      ]);

      if (deptsData.status === 'fulfilled') setDepartments(deptsData.value);
      if (coursesData.status === 'fulfilled') setCourses(coursesData.value);
      if (hallsData.status === 'fulfilled') setLectureHalls(hallsData.value);
      if (slotsData.status === 'fulfilled') setTimeSlots(slotsData.value);
      if (schedulesData.status === 'fulfilled') setSchedules(schedulesData.value);
      if (conflictsRes.status === 'fulfilled') setConflictsData(conflictsRes.value);
      if (policiesData.status === 'fulfilled') setPolicies(policiesData.value);
      if (summaryData.status === 'fulfilled') setDashboardSummary(summaryData.value);
      if (healthData.status === 'fulfilled') setSystemHealth(healthData.value);
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

  // Operations
  const refreshConflicts = async () => {
    try {
      const res = await api.getConflicts();
      setConflictsData(res);
    } catch (err) {
      console.error('Failed to refresh conflicts:', err);
    }
  };

  const refreshSchedules = async () => {
    try {
      const res = await api.getSchedules();
      setSchedules(res);
      await refreshConflicts();
    } catch (err) {
      console.error('Failed to refresh schedules:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAdmin,
        login,
        signup,
        logout,
        departments,
        courses,
        lectureHalls,
        timeSlots,
        schedules,
        conflicts: conflictsData.conflicts || [],
        conflictsMeta: conflictsData,
        policies,
        setPolicies,
        dashboardSummary,
        systemHealth,
        loading,
        toast,
        showToast,
        dismissToast,
        refreshAll: loadAllData,
        refreshConflicts,
        refreshSchedules,
        setDepartments,
        setCourses,
        setLectureHalls,
        setTimeSlots,
        setSchedules
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
