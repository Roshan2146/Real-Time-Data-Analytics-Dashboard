import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('connecting'); // 'connected' | 'connecting' | 'disconnected'
  const [latestTelemetry, setLatestTelemetry] = useState(null);
  const [liveFeed, setLiveFeed] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [latency, setLatency] = useState(null);
  const pingStartRef = useRef(null);

  useEffect(() => {
    // Socket URL: Vite proxies or direct port 5000 in dev
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setStatus('connected');
      console.log('[Socket.io] Connected to server, ID:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      setStatus('disconnected');
      console.warn('[Socket.io] Connection error:', error.message);
    });

    newSocket.on('disconnect', (reason) => {
      setStatus('disconnected');
      console.warn('[Socket.io] Disconnected:', reason);
    });

    newSocket.on('reconnect_attempt', () => {
      setStatus('connecting');
    });

    // Listen for incoming real-time telemetry
    newSocket.on('telemetry:new', (record) => {
      setLatestTelemetry(record);
      setLiveFeed((prev) => [record, ...prev.slice(0, 29)]); // Keep last 30 live records
    });

    // Listen for alerts
    newSocket.on('telemetry:alert', (alertRecord) => {
      setAlerts((prev) => [
        {
          id: alertRecord._id || Math.random().toString(),
          deviceId: alertRecord.deviceId,
          deviceName: alertRecord.deviceName,
          message: alertRecord.alert?.message || 'Warning trigger detected',
          severity: alertRecord.alert?.severity || 'high',
          value: alertRecord.value,
          temperature: alertRecord.temperature,
          timestamp: alertRecord.timestamp || new Date(),
        },
        ...prev.slice(0, 19),
      ]);
    });

    // Latency pong listener
    newSocket.on('pong', () => {
      if (pingStartRef.current) {
        setLatency(Date.now() - pingStartRef.current);
      }
    });

    // Heartbeat ping every 10 seconds
    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        pingStartRef.current = Date.now();
        newSocket.emit('ping');
      }
    }, 10000);

    return () => {
      clearInterval(pingInterval);
      newSocket.disconnect();
    };
  }, []);

  const clearAlerts = () => {
    setAlerts([]);
  };

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        status, // 'connected' | 'connecting' | 'disconnected'
        latestTelemetry,
        liveFeed,
        alerts,
        latency,
        clearAlerts,
        dismissAlert,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
