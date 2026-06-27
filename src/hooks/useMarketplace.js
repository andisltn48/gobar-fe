import { useState, useEffect, useCallback } from 'react';
import api, { extractError } from '../services/api';

export function useMarketplace(autoFetch = true) {
  const [items, setItems] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [rejectedItems, setRejectedItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchApproved = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/marketplace');
      setItems(res.data.data || []);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/marketplace/pending');
      setPendingItems(res.data.data || []);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/marketplace/my-items');
      setMyItems(res.data.data || []);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRejected = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/marketplace/rejected');
      setRejectedItems(res.data.data || []);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = async (itemData) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/marketplace', itemData);
      return res.data.data;
    } catch (err) {
      const errMsg = extractError(err);
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id, itemData) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.put(`/marketplace/${id}`, itemData);
      const updatedItem = res.data.data;
      setMyItems((prev) => prev.map((item) => item.id === id ? updatedItem : item));
      setItems((prev) => prev.map((item) => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      const errMsg = extractError(err);
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const reviewItem = async (id, status) => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/marketplace/${id}/review`, { status });
      await fetchPending();
      await fetchRejected();
    } catch (err) {
      const errMsg = extractError(err);
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    setLoading(true);
    setError('');
    try {
      await api.delete(`/marketplace/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setPendingItems((prev) => prev.filter((item) => item.id !== id));
      setRejectedItems((prev) => prev.filter((item) => item.id !== id));
      setMyItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      const errMsg = extractError(err);
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchApproved();
    }
  }, [autoFetch, fetchApproved]);

  return {
    items,
    pendingItems,
    rejectedItems,
    myItems,
    loading,
    error,
    fetchApproved,
    fetchPending,
    fetchRejected,
    fetchMyItems,
    createItem,
    updateItem,
    reviewItem,
    deleteItem,
  };
}
