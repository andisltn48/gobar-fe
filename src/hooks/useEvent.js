import { useState, useEffect, useCallback } from 'react';
import api, { extractError } from '../services/api';

export function useEvents(city) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = city ? { city } : {};
      const res = await api.get('/events', { params });
      setEvents(res.data.data ?? []);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const createEvent = async (eventData) => {
    const res = await api.post('/events', eventData);
    setEvents((prev) => [...prev, res.data.data]);
    return res.data;
  };

  const updateEvent = async (id, eventData) => {
    const res = await api.put(`/events/${id}`, eventData);
    setEvents((prev) => prev.map((e) => (e.id === id ? res.data.data : e)));
    return res.data;
  };

  const deleteEvent = async (id) => {
    await api.delete(`/events/${id}`);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return { events, loading, error, createEvent, updateEvent, deleteEvent, refetch: fetchEvents };
}

export function useEvent(id) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/events/${id}`)
      .then((res) => setEvent(res.data.data))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  return { event, loading, error };
}
