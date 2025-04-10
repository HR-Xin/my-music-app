import api from '../utils/request';

// 用户登录
export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

//这种写法只能进行特定请求方法名的导入(在其他模块中)
//import { login } from '../api/auth';  这种export写法的正确导入方式

// 用户注册
export const register = (registerData) => {
  return api.post('/auth/register', { registerData });
};

// 发送验证码
export const sendVerificationCode = (email) => {
  return api.get('/auth/sendcode', { params: { email } });
}
