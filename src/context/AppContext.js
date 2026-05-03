import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Contacts from 'expo-contacts';

const STORAGE_KEY = 'stayaway-data-v1';

const initialState = {
  contacts: [],
  schedules: [],
  logs: [],
  settings: {
    emergencyBypass: true,
    threshold: 2,
    notifications: true,
    darkMode: false,
  },
  callAttempts: {},
  loading: true,
  contactsPermission: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, loading: false };
    case 'SET_CONTACTS':
      return { ...state, contacts: action.payload };
    case 'SET_CONTACTS_PERMISSION':
      return { ...state, contactsPermission: action.payload };
    case 'TOGGLE_CONTACT': {
      const contacts = state.contacts.map(c =>
        c.id === action.payload ? { ...c, selected: !c.selected } : c
      );
      return { ...state, contacts };
    }
    case 'RESET_SELECTIONS':
      return { ...state, contacts: state.contacts.map(c => ({ ...c, selected: false })) };
    case 'ADD_SCHEDULE':
      return { ...state, schedules: [action.payload, ...state.schedules] };
    case 'TOGGLE_SCHEDULE': {
      const schedules = state.schedules.map(s =>
        s.id === action.payload ? { ...s, active: !s.active } : s
      );
      return { ...state, schedules };
    }
    case 'DELETE_SCHEDULE':
      return { ...state, schedules: state.schedules.filter(s => s.id !== action.payload) };
    case 'ADD_LOG': {
      const logs = [action.payload, ...state.logs].slice(0, 100);
      return { ...state, logs };
    }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_CALL_ATTEMPTS':
      return { ...state, callAttempts: { ...state.callAttempts, ...action.payload } };
    case 'EMERGENCY_UNBLOCK': {
      const { contactId } = action.payload;
      const schedules = state.schedules.map(s => ({
        ...s,
        contacts: s.contacts.filter(c => c.id !== contactId),
      })).filter(s => s.contacts.length > 0);
      const callAttempts = { ...state.callAttempts };
      delete callAttempts[contactId];
      return { ...state, schedules, callAttempts };
    }
    default:
      return state;
  }
}

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // Load persisted schedules/logs/settings — contacts always come fresh from device
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const { contacts: _c, loading: _l, contactsPermission: _p, ...rest } = JSON.parse(raw);
          if (mounted) dispatch({ type: 'HYDRATE', payload: rest });
        } else {
          if (mounted) dispatch({ type: 'HYDRATE', payload: {} });
        }
      } catch {
        if (mounted) dispatch({ type: 'HYDRATE', payload: {} });
      }

      // Load real contacts from device
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (!mounted) return;
        dispatch({ type: 'SET_CONTACTS_PERMISSION', payload: status });

        if (status === 'granted') {
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
            sort: Contacts.SortTypes.FirstName,
          });

          const formatted = data
            .filter(c => c.name && c.phoneNumbers && c.phoneNumbers.length > 0)
            .map(c => {
              const words = (c.name || 'U').trim().split(' ').filter(Boolean);
              const avatar = words.map(w => w[0]).slice(0, 2).join('').toUpperCase();
              return {
                id: c.id,
                name: c.name.trim(),
                number: c.phoneNumbers[0].number,
                avatar,
                selected: false,
              };
            });

          if (mounted) dispatch({ type: 'SET_CONTACTS', payload: formatted });
        }
      } catch (e) {
        console.warn('Contacts load error:', e);
      }
    };

    init();
    return () => { mounted = false; };
  }, []);

  // Persist — never save contacts (always load fresh from device)
  useEffect(() => {
    if (state.loading) return;
    const timer = setTimeout(() => {
      const { loading, contacts, contactsPermission, ...toSave } = state;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }, 300);
    return () => clearTimeout(timer);
  }, [state]);

  const addSchedule = useCallback((schedule) => {
    dispatch({ type: 'ADD_SCHEDULE', payload: schedule });
  }, []);

  const toggleSchedule = useCallback((id) => {
    dispatch({ type: 'TOGGLE_SCHEDULE', payload: id });
  }, []);

  const deleteSchedule = useCallback((id) => {
    dispatch({ type: 'DELETE_SCHEDULE', payload: id });
  }, []);

  const toggleContact = useCallback((id) => {
    dispatch({ type: 'TOGGLE_CONTACT', payload: id });
  }, []);

  const resetSelections = useCallback(() => {
    dispatch({ type: 'RESET_SELECTIONS' });
  }, []);

  const updateSettings = useCallback((settings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const addLog = useCallback((message, type) => {
    const log = { message, type, time: new Date().toISOString() };
    dispatch({ type: 'ADD_LOG', payload: log });
    if (state.settings.notifications) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: type === 'block' ? 'Call Blocked' : 'Emergency Unblock',
          body: message,
        },
        trigger: null,
      });
    }
  }, [state.settings.notifications]);

  const simulateIncomingCall = useCallback((contactId) => {
    if (!state.settings.emergencyBypass) return false;
    const contact = state.contacts.find(c => c.id === contactId);
    if (!contact) return false;
    const isBlocked = state.schedules.some(s => s.active && s.contacts.some(c => c.id === contactId));
    if (!isBlocked) return false;
    const current = (state.callAttempts[contactId] || 0) + 1;
    if (current >= state.settings.threshold) {
      dispatch({ type: 'EMERGENCY_UNBLOCK', payload: { contactId } });
      addLog(`Emergency unblock: ${contact.name}`, 'unblock');
      return { unblocked: true, contact, count: current };
    } else {
      dispatch({ type: 'UPDATE_CALL_ATTEMPTS', payload: { [contactId]: current } });
      addLog(`Blocked ${contact.name} (${current}/${state.settings.threshold})`, 'block');
      return { unblocked: false, contact, count: current };
    }
  }, [state, addLog]);

  const value = {
    ...state,
    addSchedule, toggleSchedule, deleteSchedule,
    toggleContact, resetSelections, updateSettings,
    addLog, simulateIncomingCall,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
