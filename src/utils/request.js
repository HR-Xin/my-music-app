import axios from 'axios';

// 设置 token 到 localStorage 中，并记录过期时间
function setToken(token) {
  const expiresAt = Date.now() + 86400000; // 当前时间 + 1天（86400000 毫秒）
  localStorage.setItem('token', token);
  localStorage.setItem('expiresAt', expiresAt); // 存储过期时间
}

// 从 localStorage 中获取 token
function getToken() {
  return localStorage.getItem('token');
}

// 获取存储的过期时间
function getTokenExpiration() {
  return localStorage.getItem('expiresAt');
}

// 检查 token 是否过期
function isTokenExpired() {
  const expiresAt = getTokenExpiration();
  return !expiresAt || Date.now() > expiresAt; // 如果过期时间不存在或当前时间大于过期时间，则 token 过期
}

// 清理过期的 token
function clearExpiredToken() {
  if (isTokenExpired()) {
    console.log('Token 已过期，正在清除');
    localStorage.removeItem('token'); // 删除过期的 token
    localStorage.removeItem('expiresAt'); // 删除过期时间
  }
}

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'http://localhost:2222/api',
  timeout: 30000,
});

// 确保跨域请求带上 cookie
instance.defaults.withCredentials = true;

// 请求拦截器：请求时自动添加 token
instance.interceptors.request.use(
  config => {
    const token = getToken();
    if (token && !isTokenExpired()) {
      config.headers['Authorization'] = `Bearer ${token}`; // 添加 token
    } else {
      console.log('Token 过期或不存在，无法发送请求');
      localStorage.removeItem('token'); // 如果 token 过期，清除它
      localStorage.removeItem('expiresAt'); // 清除过期时间
    }
    // 只有当 data 不是 FormData 时才设置 Content-Type 为 application/json
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器：登录成功时设置 token
instance.interceptors.response.use(
  response => {
    if (response.config.url.includes('/auth/login')) {
      const token = response.data.data.token; // 根据你的响应结构获取 token
      if (token) {
        setToken(token); // 登录成功后设置 token
        console.log('设置 token 到 localStorage:', token);
      }
    }
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      console.log('Token 已过期或无效');
      localStorage.removeItem('token'); // 删除无效的 token
      localStorage.removeItem('expiresAt'); // 删除过期时间
    }
    return Promise.reject(error);
  }
);

// 直接导出 axios 实例
export default instance;