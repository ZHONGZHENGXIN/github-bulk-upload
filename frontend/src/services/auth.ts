import { apiService } from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/user';

export class AuthService {
  // 用户注册
  async register(data: RegisterData): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/register', data);
  }

  // 用户登录
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/login', credentials);
  }

  // 获取用户信息
  async getProfile(): Promise<{ success: boolean; data: { user: User } }> {
    // 后端提供 /api/auth/me，返回 { success, data: User }
    const raw = await apiService.get<{ success: boolean; data: User }>('/auth/me') as any
    // 统一为 { success, data: { user } } 以兼容前端其它逻辑
    return { success: true, data: { user: raw.data } } as any
  }

  // 用户登出
  async logout(): Promise<{ success: boolean; message: string }> {
    // 演示后端可能未实现登出端点，做兼容处理
    try {
      return await apiService.post<{ success: boolean; message: string }>('/auth/logout');
    } catch {
      return { success: true, message: 'logged out locally' } as any;
    }
  }

  // 保存认证信息到本地存储
  saveAuthData(user: User, token: string): void {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  }

  // 从本地存储获取认证信息
  getAuthData(): { user: User | null; token: string | null } {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    return {
      user: userStr ? JSON.parse(userStr) : null,
      token,
    };
  }

  // 清除认证信息
  clearAuthData(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  // 检查是否已认证
  isAuthenticated(): boolean {
    const { token } = this.getAuthData();
    return !!token;
  }
}

export const authService = new AuthService();
