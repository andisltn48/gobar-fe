import { useState, useEffect, useCallback } from 'react';
import api, { extractError } from '../services/api';

export function useLeaderboard(month, year) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/leaderboards', {
        params: { month, year },
      });
      setEntries(res.data.data);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const createEntry = async (entryData) => {
    const res = await api.post('/leaderboards', entryData);
    setEntries((prev) => [...prev, res.data.data]);
    return res.data;
  };

  const updateEntry = async (id, entryData) => {
    const res = await api.put(`/leaderboards/${id}`, entryData);
    setEntries((prev) => prev.map((e) => (e.id === id ? res.data.data : e)));
    return res.data;
  };

  const deleteEntry = async (id) => {
    await api.delete(`/leaderboards/${id}`);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return { entries, loading, error, createEntry, updateEntry, deleteEntry, refetch: fetchLeaderboard };
}
