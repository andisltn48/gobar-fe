import api from './api';

export async function getUsers() {
  const res = await api.get('/admin/users');
  return res.data.data;
}

export async function createUser(userData) {
  const res = await api.post('/admin/users', userData);
  return res.data.data;
}

export async function updateUser(id, userData) {
  const res = await api.put(`/admin/users/${id}`, userData);
  return res.data.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
}
