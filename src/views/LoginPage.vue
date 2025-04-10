<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f5f1e9]">
    <div class="relative w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-[#d6c7b0]">
      <h2 class="text-2xl font-semibold text-gray-900 text-center">登录</h2>

      <form @submit.prevent="handleLogin" class="mt-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">邮箱</label>
          <input v-model="email" type="email" required
            class="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-[#A67B5B]"
            placeholder="输入你的邮箱" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">密码</label>
          <input v-model="password" type="password" required
            class="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-[#A67B5B]"
            placeholder="输入你的密码" />
        </div>

        <button type="submit" class="w-full p-3 text-white bg-[#A67B5B] rounded-lg hover:bg-[#8c6344] transition">
          登录
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        还没有账号？
        <router-link to="/register" class="text-[#A67B5B] hover:underline">去注册</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../api/auth.js'; // ✅ 引入 login API 方法
import { useUserStore } from '../store/user.js'; // ✅ 引入用户状态管理
import '@/style.css';

const email = ref('');
const password = ref('');
const router = useRouter();
const userStore = useUserStore(); // ✅ 获取状态实例

const handleLogin = async () => {
  try {
    // ✅ 发送登录请求，接收 token 和用户信息
    const response = await login(email.value, password.value);

    // 查看完整的响应数据
    console.log('完整响应数据:', response.data.data);

    // 获取 token
    const token = response.data.data?.token; // 根据你的响应结构，token 在 response.data.data.token 中
    console.log('Token:', token);

    // 调试信息，确保 token 不是 falsy 值
    console.log('Token 是否存在:', token !== undefined && token !== null);

    if (token !== undefined && token !== null) {
      // ✅ 更新状态管理中的用户信息和 token
      userStore.setToken(token);
      
      // 假设返回数据中有 user 字段
      // const userInfo = {email:email.value}; // 如果响应中有用户信息，也可以获取
      userStore.setUser(response.data.data);
      console.log('用户信息:', userStore.userInfo);

      // ✅ 跳转到首页
      router.push('/');
    } else {
      alert('登录失败：Token 丢失');
    }
  } catch (error) {
    alert('登录失败: ' + (error.response?.data?.message || '请检查账号和密码'));
  }
};


</script>