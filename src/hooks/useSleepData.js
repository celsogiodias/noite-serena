import { useState, useEffect, useCallback } from 'react';
import { getSleepLogs, saveSleepLog } from '../services/firebase';
import { isSameDay } from '../utils/sleepUtils';

export function useSleepData(userId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLogs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getSleepLogs(userId, 7);
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const averageHours = logs.length
    ? logs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0) / logs.length
    : 0;

  const averageQuality = logs.length
    ? logs.reduce((sum, log) => sum + (Number(log.quality) || 0), 0) / logs.length
    : 0;

  const saveLog = useCallback(
    async (logData) => {
      if (!userId) return;
      try {
        const now = new Date();
        const payload = {
          ...logData,
          userId,
          date: now.toISOString().split('T')[0],
          timestamp: now.toISOString(),
        };
        await saveSleepLog(userId, payload);
        await loadLogs();
      } catch (err) {
        console.error('Erro ao salvar log:', err);
        throw err;
      }
    },
    [userId, loadLogs]
  );

  const todayLog = logs.find((log) => isSameDay(new Date(log.date || log.timestamp), new Date())) || null;

  return { logs, averageHours, averageQuality, loading, error, saveLog, todayLog, refresh: loadLogs };
}

export default useSleepData;

