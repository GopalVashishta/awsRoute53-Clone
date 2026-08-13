import { apiRequest } from './api';
export const login = (email: string, password: string) =>
  apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const logout = () =>
  apiRequest('/api/auth/logout', { method: 'POST' });
export const getMe = () =>
  apiRequest<{ user: { id: string; email: string; display_name: string }; account_id: string; arn: string }>('/api/auth/me');
