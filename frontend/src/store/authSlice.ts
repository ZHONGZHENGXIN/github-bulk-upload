import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authService } from '../services/auth'
import { AuthState, LoginCredentials, RegisterData, User } from '../types/user'
import toast from 'react-hot-toast'

// 登录
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      authService.saveAuthData(response.data.user, response.data.token)
      toast.success('登录成功')
      return (response as any).data
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || '登录失败'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// 注册
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      authService.saveAuthData(response.data.user, response.data.token)
      toast.success('注册成功')
      return (response as any).data
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || '注册失败'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// 拉取用户信息
export const fetchUserProfile = createAsyncThunk('auth/fetchProfile', async () => {
  const response = await authService.getProfile()
  return (response as any).data.user as User
})

// 登出
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authService.logout()
  authService.clearAuthData()
  toast.success('已安全登出')
})

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    restoreAuth: (state) => {
      const { user, token } = authService.getAuthData()
      if (user && token) {
        state.user = user
        state.token = token
      }
    },
    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.error = null
      authService.clearAuthData()
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.error = null
      authService.saveAuthData(user, token)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = (action.payload as any).user
        state.token = (action.payload as any).token
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = (action.payload as any).user
        state.token = (action.payload as any).token
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload as any
        state.error = null
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.isLoading = false
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.error = null
      })
  },
})

export const { clearError, restoreAuth, clearAuth, setCredentials } = authSlice.actions
export default authSlice.reducer

