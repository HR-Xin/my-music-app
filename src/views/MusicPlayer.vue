<template>
    <div class="fixed inset-0 bg-white z-50 flex">
      <!-- 播放器区域（左侧） -->
      <div class="w-1/2 p-8 flex flex-col justify-center border-r border-gray-300">
        <div class="mb-6">
          <h2 class="text-2xl font-bold mb-2">{{ currentSongTitle || '未命名音频' }}</h2>
          <p class="text-sm text-gray-600">与好友同步播放</p>
        </div>
  
        <!-- 播放控制 -->
        <div class="mb-6 flex items-center space-x-4">
          <button @click="togglePlayPause" class="bg-[#A67B5B] text-white px-6 py-2 rounded-lg">
            {{ isPlaying ? '暂停' : '播放' }}
          </button>
          <div class="text-sm text-gray-500">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</div>
        </div>
  
        <!-- 进度条 -->
        <input type="range" min="0" :max="duration" v-model="currentTime" @input="seekAudio" class="w-full mb-4" />
  
        <!-- 隐藏音频元素 -->
        <audio ref="audioRef" :src="songUrl" @timeupdate="updateTime" @loadedmetadata="loadMeta" @ended="onEnded" />
      </div>
  
      <!-- 聊天区域（右侧） -->
      <div class="w-1/2 flex flex-col p-8">
        <h3 class="text-xl font-bold mb-4">实时聊天</h3>
  
        <!-- 聊天记录 -->
        <div class="flex-1 overflow-y-auto space-y-3 pr-2">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="flex"
            :class="msg.sender === '我' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[70%] px-4 py-2 rounded-xl text-sm"
              :class="msg.sender === '我' ? 'bg-[#A67B5B] text-white rounded-br-none' : 'bg-gray-200 text-black rounded-bl-none'"
            >
              <p v-if="msg.sender !== '我'" class="text-xs font-semibold text-gray-600 mb-1">{{ msg.sender }}</p>
              {{ msg.text }}
            </div>
          </div>
        </div>
  
        <!-- 输入框 -->
        <div class="flex items-center space-x-2 mt-4">
          <input
            v-model="chatText"
            type="text"
            placeholder="发送消息..."
            class="flex-1 px-3 py-2 border rounded-lg"
            @keyup.enter="sendMessage"
          />
          <button @click="sendMessage" class="px-4 py-2 bg-[#A67B5B] text-white rounded-lg">发送</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref,watch } from 'vue';
  
  const props = defineProps({
  songUrl: String,
  currentSongTitle: String,
  isPlaying: Boolean
});
const emit = defineEmits(['close', 'updatePlayStatus']);
  
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const audioRef = ref(null);
  const chatText = ref('');
  const messages = ref([]);
  
  // WebSocket 连接
  const socket = new WebSocket('ws://localhost:3000');
  
  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'chat') {
      messages.value.push(msg);
    } else if (msg.type === 'playback') {
      isPlaying.value = msg.isPlaying;
      isPlaying.value ? audioRef.value.play() : audioRef.value.pause();
    }
  };
  
  // 播放控制
// 点击播放/暂停
const togglePlayPause = () => {
  emit('updatePlayStatus', !props.isPlaying);
  socket.send(JSON.stringify({
    type: 'playback',
    isPlaying: !props.isPlaying
  }));
};

// 进度同步
const updateTime = () => {
  currentTime.value = audioRef.value?.currentTime || 0;
};
  
  const seekAudio = () => {
    audioRef.value.currentTime = currentTime.value;
  };
  
  const loadMeta = () => {
    duration.value = audioRef.value.duration;
  };
  
  const onEnded = () => {
    isPlaying.value = false;
  };
  
  // 聊天发送
  const sendMessage = () => {
    if (!chatText.value.trim()) return;
    const msg = { type: 'chat', sender: '我', text: chatText.value };
    socket.send(JSON.stringify(msg));
    messages.value.push(msg);
    chatText.value = '';
  };
  
  // 时间格式化
  const formatTime = (s) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };
  </script>
  