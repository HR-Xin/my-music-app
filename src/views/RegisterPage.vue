<template>
    <div class="min-h-screen flex flex-col justify-center items-center bg-[#f5f3ef] px-6 py-12">
        <div class="max-w-lg w-full bg-white p-10 rounded-2xl shadow-md">
            <h1 class="text-4xl font-serif text-[#2e2d2a] text-center mb-6">注册</h1>

            <form @submit.prevent="handleRegister">
                <div class="mb-4">
                    <label class="block text-[#2e2d2a] text-lg mb-2" for="email">邮箱</label>
                    <input id="email" v-model="registerData.email" type="email" required @input="validateEmail"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500">
                    <p v-if="emailError" class="text-[#B64949] text-xs mt-1 ml-1 font-bold">{{ emailError }}</p>
                </div>

                <!-- 验证码 -->
                <div class="mb-4">
                    <label class="block text-[#2e2d2a] text-lg mb-2" for="code">验证码</label>
                    <div class="flex space-x-2">
                        <input id="code" v-model="registerData.code" type="text" required placeholder="请输入验证码"
                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500" />
                        <!-- 倒计时按钮 -->
                        <button type="button" :disabled="isSendingCode" @click="sendCode"
                            class="px-4 py-2 rounded-lg transition text-white"
                            :class="isSendingCode ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-900'">
                            {{ isSendingCode ? `${seconds}s后重试` : '发送验证码' }}
                        </button>
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block text-[#2e2d2a] text-lg mb-2" for="password">密码</label>
                    <input id="password" v-model="registerData.password" type="password" required @input="validatePassword"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500">
                    <p v-if="passwordError" class="text-[#B64949] text-xs mt-1 ml-1 font-bold">{{ passwordError }}</p>
                </div>

                <button type="submit"
                    class="w-full bg-gray-700 text-white text-lg py-3 rounded-lg hover:bg-gray-900 transition">
                    注册
                </button>
            </form>

            <p class="text-center text-[#2e2d2a] mt-6">
                已有账号？
                <router-link to="/login" class="text-gray-700 hover:underline">登录</router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { register, sendVerificationCode } from '../api/auth.js'
import '@/style.css'

const registerData = ref({
    username:'',
    email: '',
    password: '',
    code: ''
});

const isSendingCode = ref(false);
const seconds = ref(0);
let timer = null;//倒计时器

const emailError = ref('');
const passwordError = ref('');

//register 函数很可能是一个向服务器发送请求以注册新用户的函数。
// 网络请求通常是异步的，这意味着它们不会立即返回结果，
// 而是需要一些时间来等待服务器的响应。使用异步机制可以让程序在等待响应时不会被阻塞，
// 可以继续执行其他操作。
const handleRegister = async () => {
    //code.value为空时,!code.value为true
    if (!registerData.value.code) {
        alert('请先输入邮箱验证码');
        return;
    }
    console.log('注册信息:', { email: registerData.value.email, password: registerData.value.password, code: registerData.value.code });
    await register(registerData.value);
    // 注册成功后清除表单
    registerData.email='';
    // registerData.value.email = '';
    registerData.value.password = '';
    registerData.value.code = '';
    alert('注册成功');
};

const sendCode = async () => {

    if (!registerData.value.email) {
        alert('请先输入邮箱');
        return;
    }
    //验证码已发送
    if (isSendingCode.value) return;

    try {
        await sendVerificationCode(registerData.value.email);
        alert('验证码已发送，请检查邮箱');
        startCountdown();//开始倒计时
    } catch (err) {
        console.error('验证码发送失败:', err);
        alert('验证码发送失败，请确认邮箱格式正确');
    }
};

//定时器
const startCountdown = () => {
    seconds.value = 30;
    isSendingCode.value = true;

    timer = setInterval(() => {
        if (seconds.value > 0) {
            seconds.value--;
        } else {
            clearInterval(timer);
            isSendingCode.value = false;
        }
    }, 1000);
}

//校验规则
const validateEmail = () => {
    const qqEmailPattern = /^[a-zA-Z0-9._-]+@qq\.com$/;
    if (!qqEmailPattern.test(registerData.value.email)) {
        emailError.value = '请输入有效的QQ邮箱地址';
    } else {
        emailError.value = '';
    }
};

const validatePassword = () => {
    if (registerData.value.password.length < 6) {
        passwordError.value = '密码不能少于六位';
    } else {
        passwordError.value = '';
    }
};
</script>
