<template>
    <div class="min-h-screen bg-[#eae4dc] px-6 py-12 overflow-y-auto">
        
        <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10">
            <button @click="goHome" class="logout-button py-2 rounded-lg transition mb-4">返回主页</button>
            <h1 class="text-3xl font-serif font-bold text-center text-[#2e2d2a] mb-8">个人中心</h1>

            <!-- 头像 + 个性签名区域 -->
            <div class="flex items-center justify-between mb-8">
                <div class="flex-1 pr-6">
                    <label class="block text-lg text-[#2e2d2a] mb-2">个性签名</label>
                    <div v-if="!isEditingBio">
                        <p class="text-xl text-gray-600 font-cursive">{{ bioWithDefault }}</p>
                    </div>
                    <textarea v-else v-model="user.bio" placeholder="输入你的个性签名"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"></textarea>
                </div>

                <button @click="toggleBioEdit" class="logout-button py-2 rounded-lg transition" style="height: 2.5rem;">
                    {{ isEditingBio ? '保存' : '修改' }}
                </button>


                <!-- 用户头像 -->
                <div class="flex flex-col items-center">
                    <!-- 头像展示 -->
                    <img :src="user.avatarUrl || userStore.userInfo.avatar || defaultAvatar"
                        class="w-24 h-24 rounded-full border border-gray-400 object-cover mb-4" />
                    <!-- 头像上传 -->
                    <input type="file" accept="image/*" @change="handleAvatarChange" class="text-sm mt-4" />
                </div>
            </div>

            <!-- 显示信息 -->
            <div class="mb-8 space-y-2">
                <div class="flex items-center space-x-4">
                    <span class="font-medium w-20">邮箱:</span>
                    <span class="text-gray-700">{{ user.email }}</span>
                </div>
                <button @click="isEditingEmail = true" v-if="!isEditingEmail"
                    class="logout-button py-2 rounded-lg transition" style="height: 2.5rem;">修改</button>
            </div>
            <div v-if="isEditingEmail" class="mt-2 space-y-2">
                <input v-model="verifyPassword" type="password" placeholder="请输入密码进行验证"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm" />
                <input v-model="newEmail" type="email" placeholder="输入新的邮箱地址"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm" />
                <div class="flex space-x-2">
                    <button @click="updateEmail" class="logout-button py-1 rounded-lg transition text-sm">
                        确认
                    </button>
                    <button @click="isEditingEmail = false" class="logout-button py-2 rounded-lg transition text-sm"
                        style="border: 2px solid;">
                        取消
                    </button>
                </div>
            </div>

            <!-- 修改昵称 -->
            <div class="mb-8">
                <h2 class="text-xl font-semibold mb-2">修改昵称</h2>
                <div class="flex items-center space-x-4">
                    <input v-model="user.editNickname" type="text" :placeholder="user.editNickname"
                        :disabled="!isEditingNickname"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500" />
                    <button @click="toggleNicknameEdit" class="logout-button py-2 rounded-lg transition">
                        {{ isEditingNickname ? '确认' : '修改' }}
                    </button>
                </div>
            </div>

            <!-- 修改密码部分 -->
            <div class="mb-8">
                <h2 class="text-xl font-semibold mb-2">修改密码</h2>
                <div class="flex items-center space-x-4">
                    <input v-model="oldPassword" type="password" placeholder="旧密码"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none" />
                    <input v-model="newPassword" type="password" placeholder="新密码"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none" />
                    <input v-model="confirmPassword" type="password" placeholder="确认新密码"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none" />
                    <button @click="updatePassword" class="logout-button py-2 rounded-lg transition">
                        提交修改
                    </button>
                </div>
            </div>

            <!-- 退出登录 -->
            <button @click="logout" class="logout-button w-full mt-4 border border-gray-700 py-2 rounded-lg transition">
                退出登录
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import userApi from '../api/user';
import ossApi from '../api/oss';
import { useUserStore } from '../store/user';
import { useToast } from 'vue-toastification';
const toast = useToast();
const router = useRouter();
const userStore = useUserStore();
const isEditingBio = ref(false);
// 用户数据
const user = ref({
    nickname: '',
    email: '',
    id: '',
    password: '',
    editNickname: '',
    avatarUrl: '',
    bio: ''
});

onMounted(() => {
    getUserInfo();
})


// 修改邮箱相关
const isEditingEmail = ref(false);
const newEmail = ref('');
const verifyPassword = ref('');

// updateEmail 方法 (与之前的代码相同)
const updateEmail = async () => {
    if (!verifyPassword.value) {
        toast.error('请先输入密码进行验证');
        return;
    }
    if (!newEmail.value) {
        toast.error('请输入新的邮箱地址');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.value)) {
        toast.error('请输入有效的邮箱地址');
        return;
    }

    try {
        const response = await userApi.updateEmail({
            id: user.value.id,
            password: verifyPassword.value,
            email: newEmail.value
        });

        if (response.data.code == 20000) {
            toast.success('邮箱修改成功，请重新登录');
            userStore.logout();
            router.push('/login');
        } else {
            toast.error(response.data.message || '邮箱修改失败，请检查密码或稍后再试');
        }
    } catch (error) {
        console.error('修改邮箱失败', error);
        toast.error('修改邮箱时发生错误，请稍后再试');
    } finally {
        isEditingEmail.value = false;
        verifyPassword.value = '';
        newEmail.value = '';
    }
};
const goHome = () => {
  router.push('/'); // 假设你的首页路由路径是 '/'
};

// 切换个性签名编辑状态
const toggleBioEdit = () => {
    if (isEditingBio.value) {
        updateBio(); // 调用保存个性签名的方法
    } else {
        isEditingBio.value = true;
    }
};

// 修改个性签名功能
const updateBio = async () => {
    console.log('更新个性签名:', user.value.bio);
    const response = await userApi.updateProfile({
        bio: user.value.bio,
        id: user.value.id
    });
    if (response.data.code == 20000) {
        toast.success('个性签名修改成功');
        isEditingBio.value = false; // 退出编辑模式
    } else {
        toast.error('个性签名修改失败，请稍后再试');
    }
};

const bioWithDefault = computed(() => {
    return user.value.bio || '这个人很懒，什么都没留下。';
})


// const avatarUrl = ref('@/assets/default-avatar.webp');

//如果你希望用户在进入页面时能够立即看到所有已加载的信息，而不是等待页面完全刷新，
// 那么使用异步请求（例如通过AJAX或者Fetch API）是一个很好的选择。这样可以减少用户等待时间，
// 提高页面响应速度。

// 页面加载完成后，获取用户信息
const getUserInfo = async () => {
    console.log('开始获取用户信息');
    try {
        const response = await userApi.getProfile();
        console.log("用户主页响应成功" + response.data.data.user);
        //相同就可以直接赋值 user.value=response.data
        console.log("当前用户是:", response.data.data.user.username);
        //  response.data 和 user.value 的结构完全一致，并且字段名称和顺序都对应
        //如果user前端属性与后端属性不一致，可以在这里进行转换

        //必须所有都要进行映射
        user.value = {
            nickname: response.data.data.user.username,
            editNickname: response.data.data.user.username,
            email: response.data.data.user.email,
            avatarUrl: response.data.data.user.avatar,
            bio: response.data.data.user.bio,
            id: response.data.data.user.id
        }
        // console.log("userid:" + response.data.data.user.id);
        // console.log("userid:" + user.value.id);
        console.log('获取用户信息成功', response.data);
    }
    catch (error) {
        console.error('获取用户信息失败', error);
    }
};
// 密码修改字段
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showPasswordForm = ref(false);
// 默认头像
const defaultAvatar = '@/assets/default-avatar.webp';
// 昵称编辑状态
const isEditingNickname = ref(false);

// 头像上传预览                                             未完成
const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        // 使用 FileReader 读取文件
        const reader = new FileReader();
        reader.onload = (event) => {
            user.value.avatar = event.target.result;
        };
        reader.readAsDataURL(file);

        // 上传头像到服务器
        const formData = new FormData();
        formData.append('avatar', file);
        // formData.append('id', user.value.id);//用于后端用户数据库avatar更新
        // console.log('请求数据:', formData); formData并不能直接打印出来
        // 遍历并打印 formData 的内容
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        await ossApi.uploadAvatar(formData, user.value.id).then(response => {
            if (response.data.code == 20000) {
                toast.success('头像上传成功');
                getUserInfo(); // 更新用户信息
            } else {
                toast.error('头像上传失败，请稍后再试');
                // file.value = ''; 常量不能直接修改,而且是用户上传赋值给它
                // // 清空文件选择框，以便重新选择
                user.value.avatar = '';//user是响应式对象,用户上传后修改它进行实时响应,失败直接清空
            }
        });
    }
};

// 切换昵称编辑状态
const toggleNicknameEdit = () => {
    if (isEditingNickname.value) {
        updateNickname();
    } else {
        // 启用编辑模式
        isEditingNickname.value = true;
    }
};

// 修改昵称功能
const updateNickname = async () => {
    if (user.value.editNickname.trim() === '') {
        toast.error('昵称不能为空');
        return;
    }
    // console.log("editNickname: " + user.value.editNickname);
    user.value.nickname = user.value.editNickname.trim();
    // console.log("nickname: " + user.value.nickname);
    const id = user.value.id;
    console.log("id: " + user.value.id);


    console.log('请求数据:', {
        username: user.value.nickname,
        id: user.value.id
    });
    const response = await userApi.updateProfile({
        username: user.value.nickname,
        id: user.value.id
    });
    console.log("昵称为:" + user.value.nickname);
    if (response.data.code == 20000) {
        toast.success('昵称修改成功');
    } else {
        toast.error('昵称修改失败，请稍后再试');
    }
    isEditingNickname.value = false;
};

// 修改密码功能
const updatePassword = () => {
    if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
        toast.error('请填写所有密码字段');
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        toast.error('新密码与确认密码不一致');
        return;
    }

    if (newPassword.value.length < 6) {
        toast.error('新密码至少6位');
        return;
    }
    user.value.password = newPassword.value;
    console.log('请求数据:', {
        password: user.value.password
    });
    userApi.updateProfile({
        password: user.value.password
        , id: user.value.id
    }).then(response => {
        if (response.data.code == 20000) {
            toast.success('密码修改成功！');
            oldPassword.value = '';
            newPassword.value = '';
            confirmPassword.value = '';
            showPasswordForm.value = false;
        } else {
            toast.error('密码修改失败，请稍后再试');
        }
    });

};

// 退出登录
const logout = () => {
    toast.success('已退出登录');
    userStore.logout();
    router.push('/');
};
</script>

<style scoped>
.logout-button {
    font-size: 1rem;
    /* 调整为适中的字体大小 */
    font-weight: bold;
    /* 粗体文字 */
    color: #2e2d2a;
    /* 文本颜色 */
    background-color: #f3f3f3;
    /* 按钮背景色 */
    border: 2px solid #2e2d2a;
    /* 添加边框效果 */
    border-radius: 5px;
    /* 圆角一致 */
    display: flex;
    /* 弹性布局 */
    justify-content: center;
    /* 水平方向居中 */
    align-items: center;
    /* 垂直方向居中 */
    text-align: center;
    /* 确保文本居中 */
    height: 2.5rem;
    /* 高度与输入框一致 */
    padding: 0 1rem;
    /* 添加左右间距 */
    box-sizing: border-box;
    /* 确保持 padding 不会影响按钮的尺寸 */
    white-space: nowrap;
    /* 防止文字换行 */
}

.logout-button:hover {
    background-color: #d4d4d4;
    /* 鼠标悬停效果 */
}

/* 如果有之前产生箭头效果的 CSS 代码，确保没有 */
.arrow {
    display: none;
}
</style>
