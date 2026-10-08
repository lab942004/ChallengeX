import { api } from './api';
import { AuthUser } from '../types/api';

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<{ user: AuthUser }> {
    return api.post('/auth/register', payload);
  },

  async login(payload: LoginPayload): Promise<{ user: AuthUser }> {
    return api.post('/auth/login', payload);
  },

  async logout(): Promise<{ message: string }> {
    return api.post('/auth/logout');
  },

  async me(): Promise<{ user: AuthUser }> {
    return api.get('/auth/me');
  },

  async forgotPassword(email: string): Promise<{ message: string; devResetUrl?: string }> {
    return api.post('/auth/forgot-password', { email });
  },

  async resetPassword(payload: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ message: string }> {
    return api.post('/auth/reset-password', payload);
  },

  async checkAvailability(params: { email?: string; username?: string }): Promise<{
    emailAvailable?: boolean;
    usernameAvailable?: boolean;
  }> {
    const query = new URLSearchParams();
    if (params.email) query.set('email', params.email);
    if (params.username) query.set('username', params.username);
    return api.get(`/users/availability?${query.toString()}`);
  },
};
