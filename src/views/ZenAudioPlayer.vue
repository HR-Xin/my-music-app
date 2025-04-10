<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { usePlayerStore } from '../store/player'; // 引入 Pinia Store
import { ElMessage } from 'element-plus';

const props = defineProps({
    // 不再直接接收 songUrl 和 songInfo，改为从 Store 获取
    // socketInstance: Object, // 直接传递 Socket 实例，或者在 Store 中管理
    initialMessages: { type: Array, default: () => [] },
    initialIsWsOpen: { type: Boolean, default: false },
    username: { type: String, default: '我' },
    socketInstance: Object, // 接收父组件的 socket 实例
    chatContainerRefProp: Object // 接收父组件的 ref
    , generatedCoverColor: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['close', 'send-message']); // 定义发送消息的事件

const playerStore = usePlayerStore(); // 使用 Pinia Store

// 从 Store 获取响应式状态
const songInfo = computed(() => playerStore.currentSong || { title: '未知', author: '未知', coverUrl: null });
const songUrl = computed(() => playerStore.currentSong?.url); // URL 来自 Store
const isPlaying = ref(playerStore.isPlaying); // 本地状态，但需要与 Store 同步
const currentTime = ref(playerStore.currentTime); // 本地状态
const duration = ref(0); // 时长状态
const audioRef = ref(null);

// const messages = ref([...props.initialMessages]); // 从 props 初始化聊天消息
const chatText = ref('');
const isWsOpen = ref(props.initialIsWsOpen); // 从 props 初始化 WS 状态

const chatContainerRef = ref(null); // 播放器内部的聊天容器 ref

// --- WebSocket 逻辑 (大部分移到父组件或 Store) ---
// 这里只处理从父组件接收到的更新或触发父组件发送消息

// --- 监听 Pinia Store 的变化来更新本地状态 ---
watch(() => playerStore.isPlaying, (newVal) => {
    console.log(`播放器: Store isPlaying 变化 -> `, playerStore.currentSong);
    if (isPlaying.value !== newVal) {
        console.log(`播放器: Store isPlaying 变化 -> ${newVal}`);
        isPlaying.value = newVal;
        // 控制音频元素
        if (audioRef.value) {
            if (newVal) audioRef.value.play().catch(e => console.error("播放失败", e));
            else audioRef.value.pause();
        }
    }
});

watch(() => playerStore.currentTime, (newVal) => {
    // 只在差异较大时更新，避免本地 timeupdate 和 store 更新冲突
    if (Math.abs(currentTime.value - newVal) > 1) {
        console.log(`播放器: Store currentTime 变化 -> ${newVal}`);
        currentTime.value = newVal;
        if (audioRef.value) {
            audioRef.value.currentTime = newVal;
        }
    }
});

// 监听 songUrl 变化 (来自 Store)，用于加载新音频
watch(songUrl, (newUrl) => {
    console.log(`播放器: Store songUrl 变化 -> ${newUrl}`);
    // 当 URL 变化时，<audio> 标签的 :src 会自动更新
    // duration 会在 loadedmetadata 时自动重置和更新
    duration.value = 0; // 先重置
    currentTime.value = 0; // 从头开始
});


// 监听从父组件传来的消息列表变化 (如果父组件管理 messages)
// watch(() => props.initialMessages, (newMessages) => {
//     console.log("播放器: 收到新的聊天消息列表");
//     messages.value = [...newMessages];
//     scrollToBottom();
// }, { deep: true });

// 监听从父组件传来的 WS 状态
watch(() => props.initialIsWsOpen, (newVal) => {
    isWsOpen.value = newVal;
});

// 监听从父组件传递的 chatContainerRefProp
watch(() => props.chatContainerRefProp, (newRef) => {
    chatContainerRef.value = newRef;
    scrollToBottom(); // 确保在 ref 更新后滚动到底部
});


// --- 本地播放器控制 ---
const togglePlayPause = () => {
    if (!songUrl.value) {
        ElMessage.warning("没有可播放的歌曲");
        return;
    }
    // if (!isWsOpen.value) {
    //     ElMessage.error('WebSocket 未连接，无法同步状态');
    //     // return; // 可以选择阻止操作，或者允许本地操作但不同步
    // }

    const newIsPlaying = !isPlaying.value;
    // isPlaying.value = newIsPlaying; // 不立即更新本地状态，等待 Store 反馈？或者本地优先？
    // 本地优先体验更好，但可能与同步状态冲突

    // 推荐：本地立即响应，并发送同步请求
    isPlaying.value = newIsPlaying; // 更新本地 UI
    if (audioRef.value) {
        if (newIsPlaying) audioRef.value.play().catch(e => console.error("播放失败", e));
        else audioRef.value.pause();
    }

    // 通过父组件或 Store 发送同步消息
    if (props.socketInstance && props.socketInstance.readyState === WebSocket.OPEN) {
        props.socketInstance.send(JSON.stringify({
            type: 'playback',
            isPlaying: newIsPlaying,
            currentTime: currentTime.value,
        }));
        console.log(`播放器: 发送播放状态 -> ${newIsPlaying}`);
    } else {
        console.warn("WebSocket 未连接或未传递，无法发送播放状态");
    }

    // 更新 Store (如果 Store 是状态中心)
    playerStore.setIsPlaying(newIsPlaying); // 这可能会导致 watch 触发重复操作，需要小心

};

const updateTime = () => {
    if (!audioRef.value || !isPlaying.value) return; // 暂停时不更新时间或发送同步
    const current = audioRef.value.currentTime;
    currentTime.value = current;
    playerStore.setCurrentTime(current); // 更新 Store 中的时间 (可能需要节流)

    // 发送进度同步 (需要节流，避免过于频繁)
    // throttleSendProgress(current);
    if (props.socketInstance && props.socketInstance.readyState === WebSocket.OPEN) {
        // 简单的节流：例如每 2 秒发送一次
        const now = Date.now();
        if (!window.lastProgressSent || now - window.lastProgressSent > 2000) {
            props.socketInstance.send(JSON.stringify({
                type: 'playback',
                isPlaying: isPlaying.value,
                currentTime: current,
            }));
            window.lastProgressSent = now;
            // console.log(`播放器: 发送进度 -> ${current}`);
        }
    }
};

const seekAudio = () => {
    if (!audioRef.value || !songUrl.value) return;
    if (!isWsOpen.value) {
        ElMessage.error('WebSocket 未连接，无法同步进度');
        // return;
    }

    const seekTime = currentTime.value; // v-model 已经更新了 currentTime
    audioRef.value.currentTime = seekTime;

    // 发送 seek 同步消息
    if (props.socketInstance && props.socketInstance.readyState === WebSocket.OPEN) {
        props.socketInstance.send(JSON.stringify({
            type: 'playback', // 复用 playback 类型
            isPlaying: isPlaying.value, // 保持当前播放状态
            currentTime: seekTime,
        }));
        console.log(`播放器: 发送 Seek -> ${seekTime}`);
    } else {
        console.warn("WebSocket 未连接或未传递，无法发送 Seek 状态");
    }
};

const loadMeta = () => {
    if (audioRef.value && !isNaN(audioRef.value.duration) && isFinite(audioRef.value.duration)) {
        duration.value = audioRef.value.duration;
        console.log(`播放器: 获取到时长 -> ${duration.value}`);
    } else {
        console.warn("播放器: 无法获取有效时长");
        duration.value = 0;
    }
};

const onEnded = () => {
    console.log("播放器: 歌曲播放结束");
    isPlaying.value = false;
    currentTime.value = 0;
    playerStore.setIsPlaying(false); // 更新 Store
    playerStore.setCurrentTime(0);

    // 发送播放结束同步消息
    if (props.socketInstance && props.socketInstance.readyState === WebSocket.OPEN) {
        props.socketInstance.send(JSON.stringify({
            type: 'playback',
            isPlaying: false,
            currentTime: 0,
        }));
        console.log(`播放器: 发送播放结束状态`);
    } else {
        console.warn("WebSocket 未连接或未传递，无法发送播放结束状态");
    }
};

// --- 聊天 ---
const sendMessageInternal = () => {
    if (!chatText.value.trim()) return;
    if (!isWsOpen.value) {
        ElMessage.error('连接尚未建立，无法发送消息');
        return;
    }
    // 触发父组件的发送逻辑
    // emit('send-message', chatText.value);

    // 或者，如果 socket 实例被传递下来了，可以直接发送
    if (props.socketInstance && props.socketInstance.readyState === WebSocket.OPEN) {
        const msg = {
            type: 'chat',
            text: chatText.value,
            username: props.username // 使用传入的用户名
        };
        props.socketInstance.send(JSON.stringify(msg));
        // 立即显示自己的消息
        //    messages.value.push({ sender: props.username, text: chatText.value });
        scrollToBottom();
        chatText.value = '';
    } else {
        console.error('WebSocket 未连接或未传递，无法发送消息');
        ElMessage.error('连接失败，无法发送');
    }
};

const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainerRef.value) {
            chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
        }
    });
};

// 时间格式化 (同之前)
const formatTime = (s) => {
    if (isNaN(s) || !isFinite(s) || s < 0) {
        return '00:00';
    }
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
};

// --- 组件挂载和卸载 ---
onMounted(() => {
    console.log("ZenAudioPlayer 组件已挂载");
    if (audioRef.value) {
        audioRef.value.addEventListener('loadedmetadata', loadMeta);
        audioRef.value.addEventListener('canplaythrough', () => {
            console.log("Audio can play through");
            if (playerStore.isPlaying) {
                audioRef.value.play().catch(e => console.error("播放失败 after canplaythrough", e));
            }
        });
    } else {
        console.error("audioRef 为 null，无法添加 loadedmetadata 监听器");
    }
    console.log('ZenAudioPlayer mounted!');
    console.log('ZenAudioPlayer - props.initialIsWsOpen:', props.initialIsWsOpen); // 打印 prop 的初始值
    console.log('ZenAudioPlayer - isWsOpen.value:', isWsOpen.value);
    // (可选) 组件挂载时滚动到底部
    scrollToBottom();
});

</script>

<template>
    <div class="fixed inset-0 bg-white bg-opacity-90 z-50 flex">
        <div class="w12 p-8 flex justify-center items-center bg2 border-r border-gray-300 relative">
            <div class="w-[320px] flex flex-col items-center bg-white p-6 rounded-2xl shadow-xl">
                <div v-if="!songInfo.coverUrl"
                    class="w-48 h-48 rounded-lg object-cover mb-4 flex items-center justify-center text-center overflow-hidden relative bg-gray-300 text-white"
                    :style="{ backgroundColor: generatedCoverColor }">
                    <div class="relative z-10 p-3">
                        <span class="font-bold break-words"
                            :style="{ fontSize: Math.max(12, 28 - (songInfo.title?.length || 0) * 0.7) + 'px', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }">
                            {{ songInfo.title || '未命名音频' }}
                        </span>
                    </div>
                </div>
                <img v-else :src="songInfo.coverUrl" class="w-48 h-48 rounded-lg object-cover mb-4" loading="lazy"
                    @error="$event.target.style.display = 'none'" />
                <h2 class="text-xl font-semibold text-gray-800 mb-1 text-center">{{ songInfo.title || '未命名音频' }}</h2>
                <p class="text-sm text-gray-500 mb-4">{{ songInfo.artist || '未知艺术家' }}</p>

                <div class="flex items-center space-x-4 mb-4 play-button">
                    <button @click="togglePlayPause"
                        class="bg1 text-white px-6 py-2 rounded-full shadow hover:bg-[#8b5e3c] transition">
                        {{ isPlaying ? '暂停' : '播放' }}
                    </button>
                </div>

                <input type="range" min="0" :max="duration" v-model="currentTime" @input="seekAudio"
                    class="w-full accent-[#A67B5B] mb-2" />
                <div class="text-xs text-gray-400">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</div>

                <audio ref="audioRef" :src="songUrl" @timeupdate="updateTime" @loadedmetadata="loadMeta"
                    @ended="onEnded" />
            </div>
        </div>
        <!-- <div>{{ songInfo }}</div> -->
        <div class="w12 flex flex-col p-6 bg-white relative">
            <h3 class="text-xl font-bold mb-4 text-gray-700">实时聊天</h3>
            <button @click="$emit('close')" class="absolute top-4 right-4 logout-button py-2 rounded-lg transition"
                style="height: 2.5rem; padding: 0 1rem;">
                关闭
            </button>

            <div ref="chatContainerRef" class="flex-1 overflow-y-auto space-y-3 pr-2">
                <div v-for="(msg, index) in props.initialMessages" :key="index" class="flex"
                    :class="msg.sender === username || msg.sender === '我' ? 'justify-end' : 'justify-start'">
                    <div v-if="msg.type === 'system'" class="text-center w-full my-2">
                        <span class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{{ msg.text }}</span>
                    </div>
                    <div v-else class="max-w-[70%] px-4 py-2 rounded-xl text-sm"
                        :class="msg.sender === username || msg.sender === '我' ? 'bg1 text-white rounded-br-none' : 'bg-gray-200 text-black rounded-bl-none'">
                        <p v-if="msg.sender !== username && msg.sender !== '我'"
                            class="text-xs font-semibold text-blue-600 mb-1">{{ msg.sender }}</p>
                        {{ msg.text }}
                    </div>
                </div>
            </div>

            <div class="flex items-center space-x-2 mt-4">
                <input v-model="chatText" type="text" placeholder="发送消息..." class="flex-1 px-3 py-2 border rounded-lg"
                    @keyup.enter="sendMessageInternal" />
                <button @click="sendMessageInternal"
                    class="px-4 py-2 bg1 text-white rounded-lg hover:bg-[#8b5e3c] transition">发送</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.w12 {
    width: 50%;
    /* 调整宽度 */
}
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
.bg1 {
    background-color: #A67B5B;
}

.bg2 {
    background-color: #f0f0f0;
}
</style>