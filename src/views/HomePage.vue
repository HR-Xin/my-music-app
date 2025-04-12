<template>
  <div class="min-h-screen w-full bg-[#f5f3ef] text-[#2e2d2a] relative overflow-y-auto">
    <div class="absolute inset-0 overflow-hidden">
      <img src="../assets/musicapp.svg" alt="背景" class="w-full h-full object-cover opacity-10">
    </div>

    <nav class="absolute top-0 w-full flex justify-between items-center p-6 bg-[rgba(160,112,77,0.9)] z-10">
      <h1 class="text-4xl font-serif font-bold tracking-wide">禅音</h1>
      <router-link :to="goToProfile" class="flex items-center space-x-4">
        <img :src="userAvatar" alt="用户头像" class="w-10 h-10 rounded-full border border-gray-600">
      </router-link>
    </nav>

    <div class="relative pt-24 z-10 text-center space-y-8 mt-12">
      <h2 class="text-5xl font-bold">沉浸于音乐的静谧世界</h2>
      <p class="text-lg text-gray-700">与朋友共享音乐，享受禅意旋律</p>

      <div class="flex space-x-6 justify-center">
        <input type="file" @change="handleSongUpload" accept="audio/*"
          class="px-8 py-3 text-lg border border-gray-700 rounded-xl hover:bg-gray-700 hover:text-white transition" />
        <button @click="openMusicPlayer" class="bg-[#A67B5B] text-white px-4 py-2 rounded-lg">播放音乐</button>
        <button @click="inviteFriend"
          class="px-4 py-2 bg-[#A67B5B] text-white rounded-lg hover:bg-[#8a6548] transition">
          邀请朋友
        </button>
      </div>
      <el-progress v-if="uploading" :percentage="uploadPercentage"></el-progress>
      <el-alert v-if="showEncodingMessage" title="歌曲已飞向云端，正在努力变声中，请耐心等待一下下~" type="info" center show-icon
        :closable="false" />

      <div class="mt-12">
        <h3 class="text-3xl font-semibold mb-6 text-left">我上传的歌曲</h3>
        <div v-if="myUploadedSongs.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div v-for="song in myUploadedSongs" :key="song.id"
            class="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg relative group text-left">
            <div @click="playMySong(song)" class="cursor-pointer">
              <div
                class="w-full h-40 flex items-center justify-center text-center overflow-hidden relative bg-gray-300 text-white"
                :style="{ backgroundColor: stringToColor(song.title + song.artist) }">
                <img v-if="song.coverUrl" :src="song.coverUrl" alt=""
                  class="w-full h-full object-cover absolute inset-0 z-0 opacity-80" loading="lazy"
                  @error="$event.target.style.display = 'none'" />

                <div class="relative z-10 p-3"> <span class="font-bold break-words"
                    :style="{ fontSize: Math.max(12, 28 - (song.title?.length || 0) * 0.7) + 'px', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }">
                    {{ song.title || '未知标题' }}
                  </span>
                </div>
              </div>
              <div class="p-4">
                <h4 class="font-semibold text-lg truncate" :title="song.title">{{ song.title || '未知标题' }}</h4>
                <p class="text-sm text-gray-500 truncate" :title="song.artist">{{ song.artist || '未知艺术家' }}</p>
              </div>
            </div>
            <div class="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="shareSongWithFriend(song)" title="与朋友共享这首歌"
                class="bg-blue-500 text-white p-1.5 rounded-full shadow-md hover:bg-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.016l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          你还没有上传过歌曲，快去上传分享吧！
        </div>
      </div>

      <div class="flex justify-center mt-6 items-center space-x-2">
        <button @click="uploadedSongsCurrentPage--" :disabled="uploadedSongsCurrentPage === 1"
          class="px-3 py-1 bg-gray-300 rounded">上一页</button>

        <button v-for="page in Math.ceil(uploadedSongsTotal / uploadedSongsPageSize)" :key="page"
          @click="uploadedSongsCurrentPage = page" :class="[
            'px-3 py-1 rounded',
            uploadedSongsCurrentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          ]">
          {{ page }}
        </button>

        <button @click="uploadedSongsCurrentPage++"
          :disabled="uploadedSongsCurrentPage >= Math.ceil(uploadedSongsTotal / uploadedSongsPageSize) && uploadedSongsTotal > 0"
          class="px-3 py-1 bg-gray-300 rounded">下一页</button>

        <input v-model.number="uploadedSongsGoPage" type="number" placeholder="跳转页"
          class="w-20 border px-2 py-1 ml-4 rounded" />
        <button @click="() => {
          if (uploadedSongsGoPage >= 1 && uploadedSongsGoPage <= Math.ceil(uploadedSongsTotal / uploadedSongsPageSize)) uploadedSongsCurrentPage = uploadedSongsGoPage
          else ElMessage.warning('请输入有效页码')
        }" class="px-3 py-1 bg-green-500 text-white rounded">
          跳转
        </button>
      </div>
      <div class="flex justify-end items-center mb-4">
        <button @click="toggleSettings" class="px-4 py-2 bg-gray-500 text-white rounded-lg">
          {{ showSettings ? '确认' : '歌单设置' }}
        </button>
      </div>

      <div class="flex justify-end items-center mb-4 space-x-2"> <button @click="addPlaylistDialog" v-if="showSettings"
          class="px-4 py-2 bg-green-600 text-white rounded-lg">添加歌单</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="playlist in playlists" :key="playlist.id" @click="openPlaylistDetail(playlist)"
          class="relative cursor-pointer hover:scale-105 transition-all">
          <img :src="playlist.coverUrl" alt="歌单封面" class="w-full h-48 object-cover rounded-xl">
          <h3 class="mt-2 text-xl font-semibold">{{ playlist.name }}</h3>
          <p class="text-gray-600 text-sm">{{ playlist.description }}</p>

          <div v-if="showSettings" class="absolute top-2 right-2 flex space-x-2">
            <button @click.stop="editPlaylistDialog(playlist)"
              class="bg-blue-500 text-white text-sm px-2 py-1 rounded">编辑</button>
            <button @click.stop="deletePlaylistConfirm(playlist.id)"
              class="bg-red-500 text-white text-sm px-2 py-1 rounded">删除</button>
          </div>
        </div>
      </div>

      <div class="flex justify-center mt-6 items-center space-x-2">
        <button @click="currentPage--" :disabled="currentPage === 1" class="px-3 py-1 bg-gray-300 rounded">上一页</button>

        <button v-for="page in Math.ceil(total / pageSize)" :key="page" @click="currentPage = page" :class="[
          'px-3 py-1 rounded',
          currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
        ]">
          {{ page }}
        </button>

        <button @click="currentPage++" :disabled="currentPage === Math.ceil(total / pageSize)"
          class="px-3 py-1 bg-gray-300 rounded">下一页</button>

        <input v-model.number="goPage" type="number" placeholder="跳转页" class="w-20 border px-2 py-1 ml-4 rounded" />
        <button @click="() => {
          if (goPage >= 1 && goPage <= Math.ceil(total / pageSize)) currentPage = goPage
          else ElMessage.warning('请输入有效页码')
        }" class="px-3 py-1 bg-green-500 text-white rounded">
          跳转
        </button>
      </div>
    </div>

    <ZenAudioPlayer v-if="showPlayer" :initialIsWsOpen="isWsOpen" :socketInstance="socket"
      :chat-container-ref-prop="chatContainerRef" :username="username" @send-message="sendMessage"
      @close="showPlayer = false" :initialMessages="messages"
      :generatedCoverColor="stringToColor(playerStore.currentSong.title + playerStore.currentSong.artist)" />


    <PlaylistDetailDialog v-if="showPlaylistDetail" :playlist="selectedPlaylist" @close="showPlaylistDetail = false"
      @play="playSong" :uploadedSongs="myUploadedSongs"
      />
    <PlaylistEditDialog v-model:visible="showEditDialog" :playlist="editingPlaylist" @save="onSavePlaylist"
        @cancel-upload="handleCancelUpload" @playlistUpdated="handlePlaylistUpdated" />


  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useUserStore } from '../store/user';
import { usePlayerStore } from '../store/player';
import ZenAudioPlayer from '../views/ZenAudioPlayer.vue';
import PlaylistDetailDialog from '../views/PlaylistDetailDialog.vue'; // 引入歌单详情弹窗组件
import PlayListsApi from '../api/playlists'; // 引入歌单 API
import { useToast } from 'vue-toastification';
import PlaylistEditDialog from '../views/PlaylistEditDialog.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoute, useRouter } from 'vue-router'; // 引入 useRoute
import apiClient from '../api/ws'; // 引入你的 API 封装
import songsApi from '../api/songs';

const router = useRouter();
const route = useRoute(); // 获取当前路由信息
const toast = useToast();
const playerStore = usePlayerStore();
const userStore = useUserStore();
const showPlaylistDetail = ref(false); // 控制歌单详情弹窗
const selectedPlaylist = ref(null); // 存储选择的歌单
const currentSong = ref(null);  // 确保定义了 currentSong
const showPlayer = ref(false);
const currentRoomId = ref(null); // 存储当前房间 ID
const isLoadingRoom = ref(false); // 防止重复加入
const uploading = ref(false); // 控制进度条是否显示
const uploadPercentage = ref(0); // 存储上传的百分比
const showEncodingMessage = ref(false); // New ref for the encoding message
const myUploadedSongs = ref([]); // <--- 新增：存储用户上传的歌曲列表

// --- WebSocket 相关 ---
let socket = ref(null);
const isWsOpen = ref(false);
const messages = ref([]); // 聊天消息
const chatText = ref('');
const chatContainerRef = ref(null); // 聊天容器 ref

// --- 用户信息 ---
const username = computed(() => userStore.userInfo?.username || `用户${Math.random().toString().substring(2, 6)}`); // 获取或生成用户名
// *****************************上传歌曲列表*****************************************8
// 在 <script setup> 中
function hashCode(str) { /* ... 哈希函数实现 ... */ }
function stringToColor(str) { /* ... 根据哈希生成 HSL 或 RGB 颜色的实现 ... */
  let hash = 0;
  if (!str) return 'hsl(0, 0%, 85%)'; // 为空时给个默认灰色
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const hue = Math.abs(hash) % 360;
  const saturation = 65 + (Math.abs(hash >> 8) % 16); // 饱和度 65-80%
  const lightness = 55 + (Math.abs(hash >> 16) % 11); // 亮度 55-65%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// *****************************歌曲详情*****************************************8
const handlePlaylistUpdated = (updatedSongList) => {
  console.log('歌单已更新:', updatedSongList);
  // 在这里你可以刷新你的歌单列表，或者更新 selectedPlaylist 中的数据
  // 例如：如果你有一个歌单列表的 ref 叫做 playlists，你可以在这里更新它
  if (selectedPlaylist.value) {
    selectedPlaylist.value.list = updatedSongList; // 假设你的歌单对象有一个 list 属性存储歌曲列表
  }
};



// *****************************上传歌曲列表*****************************************8
// --- 获取用户上传歌曲的函数 ---
const fetchMyUploadedSongs = async () => {
  // 确保用户信息已加载
  if (!userStore.userInfo?.id) {
    // console.log("无法获取上传歌曲：用户未登录或用户信息不可用。");
    myUploadedSongs.value = []; // 用户未登录则清空
    return;
  }
  try {
    const userId = userStore.userInfo.id;
    console.log(`获取用户 ${userId} 上传的歌曲...`);
    const response = await songsApi.getMyUploadedSongs(userId);
    if (response.data.code === 20000) {
      myUploadedSongs.value = response.data.data.songs || [];
      console.log("成功获取用户上传歌曲:", myUploadedSongs.value);
    } else {
      console.error("获取上传歌曲失败:", response.data.message);
      ElMessage.error(`获取上传歌曲列表失败: ${response.data.message}`);
      myUploadedSongs.value = [];
    }
  } catch (error) {
    console.error("请求上传歌曲列表出错:", error);
    ElMessage.error("请求上传歌曲列表出错");
    myUploadedSongs.value = [];
  }
};

// --- 新增：播放“我上传的歌曲” ---
const playMySong = (song) => {
  console.log("播放我的上传歌曲:", song);
  // currentSong.value.title=song.title;
  // currentSong.value.artist=song.artist;
  console.log("更新当前歌曲:", currentSong.value);
  if (!song || !song.musicUrl) {
    ElMessage.error("歌曲信息无效，无法播放");
    return;
  }

  // 1. 更新 Pinia Store，触发播放器更新
  playerStore.setCurrentSong({
    url: song.musicUrl,
    title: song.title,
    artist: song.artist,
    coverUrl: song.coverUrl
  });
  playerStore.setIsPlaying(true); // 点击播放通常意味着开始播放

  // 2. 如果在房间中，通过 WebSocket 同步 "change_song"
  if (isWsOpen.value && currentRoomId.value && socket) {
    console.log(`在房间 ${currentRoomId.value} 中切换歌曲并同步`);
    const changeSongMsg = {
      type: 'change_song',
      songUrl: song.musicUrl,
      songTitle: song.title || '未知标题',
      songCover: song.coverUrl || null,
      songArtist: song.artist || '未知' // 确保后端能处理 songArtist
    };
    socket.send(JSON.stringify(changeSongMsg));
  } else {
    console.log("不在房间内或 WebSocket 未连接，仅本地播放（通过Store更新）");
    // 确保播放器能响应 Store 的变化
    showPlayer.value = true; // 本地播放也要显示播放器
  }
};


// --- 新增：共享“我上传的歌曲” ---
const shareSongWithFriend = async (song) => {
  console.log("准备共享歌曲:", song);
  if (!song || !song.musicUrl) {
    ElMessage.error("歌曲信息无效，无法共享");
    return;
  }

  // 简单的处理：总是创建新房间来共享
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("将关闭现有连接以创建新的共享房间...");
    socket.close(); // 关闭旧连接
    // 等待 onclose 事件将 isWsOpen 和 currentRoomId 重置
    // 或者手动重置并等待 nextTick
    isWsOpen.value = false;
    currentRoomId.value = null;
    await nextTick();
  }

  try {
    console.log("请求创建新房间用于共享...");
    const response = await apiClient.createRoom(); // 调用后端创建房间接口
    // !! 注意: 请根据你后端 /room/create 接口实际返回的数据结构调整下面的路径 !!
    const newRoomId = response.data?.data?.res?.roomId || response.data?.roomId; // 尝试不同可能路径

    if (newRoomId) {
      console.log(`新房间创建成功: ${newRoomId}`);
      // 修改 initializeWebSocket 或添加回调来处理加入成功后的操作
      const joinAndSetSong = () => {
        console.log(`成功加入房间 ${newRoomId}，发送 change_song 消息`);
        const changeSongMsg = {
          type: 'change_song',
          songUrl: song.musicUrl,
          songTitle: song.title || '未知标题',
          songCover: song.coverUrl || null,
          songArtist: song.artist || '未知'
        };
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(changeSongMsg));
          // 更新 URL 并复制链接
          router.push({ query: { roomId: newRoomId } }); // 更新浏览器地址栏
          copyInviteLink(newRoomId); // 复制邀请链接
          // 状态更新和播放器显示会由 onmessage 处理 change_song 触发
        } else {
          console.error("WebSocket 在尝试发送初始歌曲时未连接");
          ElMessage.error("连接异常，无法设置共享歌曲");
        }
      };

      // 重写 WebSocket 初始化，加入成功后执行回调
      socket = new WebSocket('ws://localhost:2222/ws');
      socket.onopen = () => {
        console.log(`WebSocket (for sharing) 连接成功! 发送加入请求: ${newRoomId}`);
        isWsOpen.value = true;
        socket.send(JSON.stringify({ type: 'join', roomId: newRoomId, username: username.value }));
        currentRoomId.value = newRoomId; // 立即记录房间ID
        // 可以在这里立即调用 joinAndSetSong，假设后端会立刻处理 join 并接受 change_song
        // 或者等待后端确认消息 (更稳妥，但需要后端配合发送确认或依赖 initial_state)
        joinAndSetSong(); // 尝试立即发送
      };
      // 加上其他事件处理器 (onmessage, onclose, onerror)，与 initializeWebSocket 中的类似
      socket.onmessage = (event) => {
        console.log("收到 WebSocket 消息:", event.data);
        try {
          const msg = JSON.parse(event.data);
          // console.log("解析后的消息:", msg);
          switch (msg.type) {
            case 'initial_state': // 处理加入房间后收到的初始状态
            case 'change_song': // 处理切歌同步
              console.log("更新播放器状态 (歌曲信息):", msg);
              // 更新 Pinia Store 或直接更新本地状态传递给播放器
              playerStore.setCurrentSong({ url: msg.songUrl, title: msg.songTitle, coverUrl: msg.songCover, artist: msg.songArtist || '未知', });
              playerStore.setIsPlaying(msg.isPlaying);
              playerStore.setCurrentTime(msg.currentTime); // 可能需要更精细的同步
              if (msg.songUrl && !showPlayer.value) { // 如果有歌曲 URL 且播放器未显示，则显示
                showPlayer.value = true;
              } else if (!msg.songUrl && showPlayer.value) { // 如果没歌曲了，隐藏播放器
                showPlayer.value = false;
              }
              break;
            case 'playback': // 处理播放状态同步
              console.log("收到播放状态同步消息:", msg);
              playerStore.setIsPlaying(msg.isPlaying);
              playerStore.setCurrentTime(msg.currentTime);
              break;
            case 'chat':
              console.log("收到聊天消息:", msg);
              messages.value.push({
                sender: msg.sender || '匿名', // 使用后端提供的 sender
                senderId: msg.senderId, // 可以用来判断是否是自己
                text: msg.text || '',
              });
              console.log("聊天消息列表:", messages.value);
              scrollToBottom();
              break;
            case 'user_join':
              console.log(`用户 ${msg.username || msg.userId} 加入房间`);
              messages.value.push({ type: 'system', text: `欢迎 ${msg.username || msg.userId} 加入房间！` });
              scrollToBottom();
              // (可选) 更新在线用户列表 UI
              break;
            case 'user_leave':
              console.log(`用户 ${msg.username || msg.userId} 离开房间`);
              messages.value.push({ type: 'system', text: `${msg.username || msg.userId} 离开了房间。` });
              scrollToBottom();
              // (可选) 更新在线用户列表 UI
              break;
            case 'error':
              console.error("收到后端错误消息:", msg.message);
              ElMessage.error(`错误: ${msg.message}`);
              if (msg.message?.includes("room not found")) {
                // 如果房间找不到，可能需要清除 roomId 并提示用户
                currentRoomId.value = null;
                router.replace({ query: {} }); // 清除 URL 中的 roomId
                // 可以在这里关闭 WebSocket 或尝试创建新房间
              }
              break;
            default:
              console.log("收到未知类型的消息:", msg);
          }
        } catch (e) {
          console.error("处理 WebSocket 消息失败:", e, event.data);
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket 连接关闭:', event);
        isWsOpen.value = false;
        currentRoomId.value = null; // 连接关闭，清除房间 ID
        showPlayer.value = false; // 关闭播放器
        ElMessage.warning('连接已断开');
        // 可以在这里尝试自动重连
      };

      socket.onerror = (error) => {
        console.error('WebSocket 错误:', error);
        isWsOpen.value = false;
        currentRoomId.value = null;
        showPlayer.value = false;
        ElMessage.error('连接发生错误');
      };

    } else {
      ElMessage.error('创建房间失败，未获取到房间 ID');
    }
  } catch (error) {
    console.error("创建房间用于共享失败:", error);
    ElMessage.error('创建房间失败，请稍后再试');
  }
};


// --- 聊天相关 ---
const sendMessage = (text) => { // 参数改为 text，由子组件传递
  if (!text || !text.trim()) return;
  if (!isWsOpen.value) {
    ElMessage.error('连接尚未建立，无法发送消息');
    return;
  }
  const msg = {
    type: 'chat',
    text: text,
    username: username.value // 带上用户名
  };
  socket.send(JSON.stringify(msg));
  // 等待广播回来显示
};


// --- WebSocket 初始化和处理 ---
const initializeWebSocket = (roomIdToJoin) => {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    console.log("WebSocket 已存在或正在连接，无需重复初始化");
    // 如果已连接但房间不同，可能需要先关闭再重连，或发送切换房间消息
    if (isWsOpen.value && currentRoomId.value !== roomIdToJoin) {
      console.warn(`已在房间 ${currentRoomId.value}，尝试加入 ${roomIdToJoin}，需要重新连接或发送切换请求`);
      // 简单的处理：关闭旧连接，稍后重连
      socket.close();
      isWsOpen.value = false;
      // 延迟一点再重连，确保旧连接已关闭
      setTimeout(() => initializeWebSocket(roomIdToJoin), 500);
      return; // 退出当前执行
    } else if (isWsOpen.value && currentRoomId.value === roomIdToJoin) {
      console.log(`已在房间 ${roomIdToJoin} 中。`);
      return; // 已经在目标房间
    } else {
      console.log("等待现有连接完成...");
      return; // 正在连接中，等待 onopen 触发加入
    }
  }


  console.log(`尝试连接 WebSocket: ws://localhost:2222/ws`);
  socket = new WebSocket('ws://localhost:2222/ws');

  socket.onopen = () => {
    console.log('WebSocket 连接成功!');
    isWsOpen.value = true;
    if (roomIdToJoin) {
      console.log(`发送加入房间请求: ${roomIdToJoin}`);
      // 连接成功后，发送加入房间的消息
      socket.send(JSON.stringify({
        type: 'join',
        roomId: roomIdToJoin,
        username: username.value // 发送用户名
      }));
      currentRoomId.value = roomIdToJoin; // 记录当前房间 ID
    } else {
      console.log("WebSocket 已连接，但没有房间 ID 加入。");
      // 可能需要提示用户创建或加入房间
    }
  };

  socket.onmessage = (event) => {
    console.log("收到 WebSocket 消息:", event.data);
    try {
      const msg = JSON.parse(event.data);
      // console.log("解析后的消息:", msg);
      switch (msg.type) {
        case 'initial_state': // 处理加入房间后收到的初始状态
        case 'change_song': // 处理切歌同步
          console.log("更新播放器状态 (歌曲信息):", msg);
          // 更新 Pinia Store 或直接更新本地状态传递给播放器
          playerStore.setCurrentSong({ url: msg.songUrl, title: msg.songTitle, coverUrl: msg.songCover, author: msg.songArtist || '未知', });
          playerStore.setIsPlaying(msg.isPlaying);
          playerStore.setCurrentTime(msg.currentTime); // 可能需要更精细的同步
          if (msg.songUrl && !showPlayer.value) { // 如果有歌曲 URL 且播放器未显示，则显示
            showPlayer.value = true;
          } else if (!msg.songUrl && showPlayer.value) { // 如果没歌曲了，隐藏播放器
            showPlayer.value = false;
          }
          break;
        case 'playback': // 处理播放状态同步
          console.log("收到播放状态同步消息:", msg);
          playerStore.setIsPlaying(msg.isPlaying);
          playerStore.setCurrentTime(msg.currentTime);
          break;
        case 'chat':
          console.log("收到聊天消息:", msg);
          messages.value.push({
            sender: msg.sender || '匿名', // 使用后端提供的 sender
            senderId: msg.senderId, // 可以用来判断是否是自己
            text: msg.text || '',
          });
          console.log("聊天消息列表:", messages.value);
          scrollToBottom();
          break;
        case 'user_join':
          console.log(`用户 ${msg.username || msg.userId} 加入房间`);
          messages.value.push({ type: 'system', text: `欢迎 ${msg.username || msg.userId} 加入房间！` });
          scrollToBottom();
          // (可选) 更新在线用户列表 UI
          break;
        case 'user_leave':
          console.log(`用户 ${msg.username || msg.userId} 离开房间`);
          messages.value.push({ type: 'system', text: `${msg.username || msg.userId} 离开了房间。` });
          scrollToBottom();
          // (可选) 更新在线用户列表 UI
          break;
        case 'error':
          console.error("收到后端错误消息:", msg.message);
          ElMessage.error(`错误: ${msg.message}`);
          if (msg.message?.includes("room not found")) {
            // 如果房间找不到，可能需要清除 roomId 并提示用户
            currentRoomId.value = null;
            router.replace({ query: {} }); // 清除 URL 中的 roomId
            // 可以在这里关闭 WebSocket 或尝试创建新房间
          }
          break;
        default:
          console.log("收到未知类型的消息:", msg);
      }
    } catch (e) {
      console.error("处理 WebSocket 消息失败:", e, event.data);
    }
  };

  socket.onclose = (event) => {
    console.log('WebSocket 连接关闭:', event);
    isWsOpen.value = false;
    currentRoomId.value = null; // 连接关闭，清除房间 ID
    showPlayer.value = false; // 关闭播放器
    ElMessage.warning('连接已断开');
    // 可以在这里尝试自动重连
  };

  socket.onerror = (error) => {
    console.error('WebSocket 错误:', error);
    isWsOpen.value = false;
    currentRoomId.value = null;
    showPlayer.value = false;
    ElMessage.error('连接发生错误');
  };
};


// --- 页面加载和路由处理 ---
onMounted(() => {
  fetchPlaylists(); // 获取公共播放列表
  // 检查 URL 中是否带有 roomId 参数
  const roomIdFromUrl = route.query.roomId; // 或者 route.params.roomId，取决于你的路由配置
  if (roomIdFromUrl) {
    console.log(`从 URL 检测到房间 ID: ${roomIdFromUrl}，尝试加入...`);
    initializeWebSocket(roomIdFromUrl);
  } else {
    console.log("URL 中没有房间 ID。");
    // 如果希望没有房间ID也能连ws（例如，连上后再创建房间），可以调用
    // initializeWebSocket(null);
    // 但通常建议在有明确意图（加入或创建）时再连接
  }
});

// 监听用户信息变化，加载用户上传的歌曲
watch(() => userStore.userInfo?.id, (newUserId) => {
  if (newUserId) {
    fetchMyUploadedSongs(); // 用户登录后加载
  } else {
    myUploadedSongs.value = []; // 用户登出后清空
  }
}, { immediate: true }); // 立即执行一次，处理已登录情况

// 监听路由变化（如果用户在应用内通过链接跳转到带 roomId 的页面）
watch(() => route.query.roomId, (newRoomId, oldRoomId) => {
  if (newRoomId && newRoomId !== oldRoomId && !isLoadingRoom.value) {
    console.log(`路由变化，检测到新房间 ID: ${newRoomId}，尝试加入...`);
    initializeWebSocket(newRoomId);
  }
});


// --- 核心功能函数 ---

// 邀请好友 (创建房间并生成链接)
const inviteFriend = async () => {
  if (currentRoomId.value) {
    // 如果已经在房间里，直接复制当前房间链接
    copyInviteLink(currentRoomId.value);
    return;
  }
  try {
    console.log("请求创建新房间...");
    const response = await apiClient.createRoom(); // 调用后端创建房间接口
    const newRoomId = response.data.data.res.roomId;
    if (newRoomId) {
      console.log(`房间创建成功: ${newRoomId}，正在加入...`);
      // 1. 连接 WebSocket 并加入房间
      initializeWebSocket(newRoomId);
      // 2. 更新当前页面的 URL (可选, 推荐)
      router.push({ query: { roomId: newRoomId } }); // 在 URL 中显示房间 ID
      // 3. 复制邀请链接
      copyInviteLink(newRoomId);
    } else {
      ElMessage.error('创建房间失败，未获取到房间 ID');
    }
  } catch (error) {
    console.error("创建房间失败:", error);
    ElMessage.error('创建房间失败，请稍后再试');
  }
};

// 复制邀请链接到剪贴板
const copyInviteLink = (roomId) => {
  // 拼接完整的 URL，注意域名和端口需要根据你的部署环境调整
  const inviteUrl = `${window.location.origin}${window.location.pathname}?roomId=${roomId}`;
  navigator.clipboard.writeText(inviteUrl).then(() => {
    ElMessage.success('邀请链接已复制!');
  }).catch(err => {
    console.error('复制邀请链接失败:', err);
    ElMessage.error('复制链接失败');
  });
};


// 修改后的文件上传处理
const handleSongUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (!isWsOpen.value || !currentRoomId.value) {
    ElMessage.error('请先加入或创建一个房间再上传歌曲');
    event.target.value = null; // 清空文件选择，以便再次选择相同文件
    return;
  }

  const formData = new FormData();
  formData.append('file', file); // 后端接口需要接收名为 'file' 的参数
  uploading.value = true; // 开始上传时显示进度条
  uploadPercentage.value = 0; // 重置进度
  console.log("开始上传音频文件...");
  try {
    const response = await apiClient.uploadAudio(formData, { // 第二个参数是配置对象
      onUploadProgress: (progressEvent) => {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        uploadPercentage.value = percentage;
        console.log(`上传进度: ${percentage}%`);
        if (percentage === 100) {
          uploading.value = false; // 上传完成后隐藏进度条
          showEncodingMessage.value = true; // 显示编码信息
          setTimeout(() => {
            showEncodingMessage.value = false; // 3秒后隐藏编码信息
            // ElMessage.success('编码完成，可以尽情享受音乐啦！'); // 显示成功消息
          }, 20000);
        }
      }
    }); // 调用后端上传接口
    console.log("文件上传响应:", response.data.data);
    if (response.data.data && response.data.data.response) {
      ElMessage.success('上传成功!');
      const songData = response.data.data.response // 后端返回的数据，包含 fileUrl, title, coverUrl
      // 从文件名中提取歌手和歌曲名
      const fileNameParts = file.name.replace(/\.[^/.]+$/, '').split(' - '); // 去除后缀并按 " - " 分割
      let artist = '未知';
      let title = file.name.replace(/\.[^/.]+$/, ''); // 默认使用文件名作为标题

      if (fileNameParts.length === 2) {
        artist = fileNameParts[0].trim();
        title = fileNameParts[1].trim();
      } else if (fileNameParts.length === 1) {
        title = fileNameParts[0].trim(); // 如果没有 " - "，则整个文件名作为标题
      }
      const music = {
        title: title,
        artist: artist,
        musicUrl: songData.musicUrl,
        musicId: songData.musicId,
        coverUrl: songData.coverUrl,
        uploaderId: userStore.userInfo.id,
      }
      console.log('提取的歌曲信息:', music);
      const res = await songsApi.saveMusic(music);
      if (res.data.code === 20001) {
        console.log("歌曲保存失败");
      } else {
        console.log("歌曲保存成功");
      }
      console.log("提取的文件信息:", { artist, title });
      // 通过 WebSocket 发送 "change_song" 消息
      if (socket && socket.readyState === WebSocket.OPEN) {
        const changeSongMsg = {
          type: 'change_song',
          songUrl: songData.musicUrl,
          // 优先使用提取的标题，其次使用后端标题，最后使用文件名     
          //      songCover: songData.coverUrl || null, // 使用后端封面或 null
          songTitle: title || songData.title || file.name.replace(/\.[^/.]+$/, ''),
          songArtist: artist // 添加歌手信息
        };
        console.log("发送 change_song 消息:", changeSongMsg);
        socket.send(JSON.stringify(changeSongMsg));
      } else {
        console.error("WebSocket 未连接，无法发送切歌消息");
        ElMessage.error('WebSocket 未连接，无法同步歌曲');
      }
    } else {
      ElMessage.error(response.data?.message || '上传失败，服务器未返回有效 URL');
      uploading.value = false;
      showEncodingMessage.value = false;
    }
  } catch (error) {
    console.error("文件上传或处理失败:", error);
    ElMessage.error('文件上传失败: ' + (error.response?.data?.message || error.message));
  } finally {
    event.target.value = null; // 清空文件选择

  }
};


// 打开播放器（这个逻辑可能需要调整，由 WebSocket 状态决定是否显示）
const openMusicPlayer = () => {
  if (!currentRoomId.value) {
    ElMessage.warning("请先加入或创建房间");
    return;
  }
  console.log("playerStore.currentSong:", playerStore.currentSong); // 添加这行

  if (playerStore.currentSong && playerStore.currentSong.url) {
    // 在你跳转到播放器组件的逻辑之前
    console.log('跳转前 - socketInstance:', socket);
    console.log('跳转前 - isWsOpenToPlayer:', isWsOpen); // 假设你用这个变量传递状态
    // console.log("手动打开播放器 (通常应由 WS 状态驱动)");
    showPlayer.value = true;
  } else {
    ElMessage.info("当前没有正在播放的歌曲");
  }
};


// --- 聊天相关 ---
// const sendMessage = () => {
//   if (!chatText.value.trim()) return;
//   if (!isWsOpen.value) {
//     ElMessage.error('连接尚未建立，无法发送消息');
//     return;
//   }

//   const msg = {
//     type: 'chat',
//     text: chatText.value,
//     username: username.value // 带上用户名
//   };
//   socket.send(JSON.stringify(msg));

//   // 不再立即添加到本地列表，等待后端广播回来
//   // messages.value.push({ sender: '我', text: chatText.value });
//   // scrollToBottom();
//   chatText.value = '';
// };

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
    }
  });
};


// 关闭播放器（如果需要手动关闭）
const closePlayer = () => {
  showPlayer.value = false;
  // 可能还需要通过 WebSocket 发送暂停消息或离开房间的消息？取决于设计
}


// *****************************分页逻辑********************************************8

const rawPlaylists = ref([]); // 这是响应式的歌单数据列表

const total = ref(0)          // 总数量
const currentPage = ref(1)      // 当前页码
const pageSize = ref(6)       // 每页 6 条
const goPage = ref(null)        // 跳页输入框

// 上传歌曲列表的分页状态
const uploadedSongsTotal = ref(0);   // 上传歌曲总数量
const uploadedSongsCurrentPage = ref(1); // 上传歌曲当前页码
const uploadedSongsPageSize = ref(8);  // 每页显示的上传歌曲数量
const uploadedSongsGoPage = ref(null); // 上传歌曲跳页输入框

const fetchPlaylists = async () => {
  // console.log("当前页:", currentPage.value);
  try {
    const res = await PlayListsApi.getPlaylistsByPage(
      currentPage.value,
      pageSize.value,
    );
    // console.log("歌单列表:", res);

    if (res.data.code === 20000) {
      rawPlaylists.value = res.data.data.list;
      // console.log("歌单列表:", rawPlaylists.value.length);
      total.value = res.data.data.total;
    } else {
      ElMessage.error("获取歌单失败：" + res.data.message);
      rawPlaylists.value = [];
    }
  } catch (err) {
    ElMessage.error("请求出错：" + err.message);
    rawPlaylists.value = [];
  }
};

watch(currentPage, fetchPlaylists)


//************************个人上传分页逻辑********************** */
// 获取上传歌曲的函数 (使用独立的分页状态)
const getMyUploadedSongs = async () => {
  try {
    const response = await songsApi.pageSongs(uploadedSongsCurrentPage.value, uploadedSongsPageSize.value, userStore.userInfo.id);
    if (response.data.code === 20000) {
      myUploadedSongs.value = response.data.data.records;
      uploadedSongsTotal.value = response.data.data.total;
      console.log('uploadedSongsTotal.value:', uploadedSongsTotal.value)
    } else {
      ElMessage.error('获取上传歌曲列表失败');
      console.error('获取上传歌曲列表失败:', response.data);
    }
  } catch (error) {
    ElMessage.error('获取上传歌曲列表失败');
    console.error('获取上传歌曲列表失败:', error);
  }
}

// 监听上传歌曲分页状态的变化，重新获取数据
watch([uploadedSongsCurrentPage, uploadedSongsPageSize], () => {
  getMyUploadedSongs();
});

// 歌单数据
const playlists = computed(() => {
  return rawPlaylists.value.length > 0 ? rawPlaylists.value : [
    { id: 1, title: '禅意之音', cover: '/assets/cover1.jpg', description: '放松心情的旋律' },
    { id: 2, title: '竹林深处', cover: '/assets/cover2.jpg', description: '自然的声音' },
    { id: 3, title: '宁静之心', cover: '/assets/cover3.jpg', description: '让心灵平静' },
    { id: 4, title: '禅音流淌', cover: '/assets/cover4.jpg', description: '聆听心灵的声音' },
    { id: 5, title: '静谧世界', cover: '/assets/cover5.jpg', description: '自然的力量' },
    { id: 6, title: '山水画卷', cover: '/assets/cover6.jpg', description: '静享山水' },
  ]
});



// *****************************用户信息********************************************8
// 用户相关状态
const user = ref({});
// const showPlayer = ref(false);
// const currentPlaylist = ref([]);

// 用户信息监听
watch(() => userStore.userInfo, (newUserInfo) => {
  user.value = newUserInfo || {};
}, { immediate: true });
// 计算属性
const goToProfile = computed(() => user.value.id ? `/profile/${user.value.id}` : '/login');
const userAvatar = computed(() => user.value.avatar || '/default-avatar.webp');


// **********************************音乐播放***************************************************
// 音乐操作
// const handleSongUpload = (event) => {
//   const file = event.target.files[0];
//   if (file) {
//     const song = {
//       title: file.name.replace(/\.[^/.]+$/, ''),
//       url: URL.createObjectURL(file),
//     };
//     playerStore.setCurrentSong(song);
//     console.log("上传音乐", song);
//   }
// };
// const openMusicPlayer = () => {
//   // console.log("打开音乐播放器"+playerStore.currentSong);
//   if (playerStore.currentSong) showPlayer.value = true;
// };

const onSongEnd = () => playerStore.stop();





// **********************************播放器***************************************************

// 打开歌单详情弹窗
const openPlaylistDetail = async (playlist) => {
  const playlistId = playlist.id
  // console.log("歌单歌单弹出id", playlistId);
  console.log("打开歌单详情弹窗", playlist);
  const res = await PlayListsApi.getPlaylistDetail(playlistId);
  console.log("歌单详情接口响应", res);
  if (res.data.code === 20000) {
    console.log('获取歌单成功');
    selectedPlaylist.value = res.data.data.songList;
    console.log("歌单详情", selectedPlaylist.value);
    showPlaylistDetail.value = true;
  } else {
    console.log('获取歌单失败');
  }
};

// 关闭歌单详情弹窗
const closePlaylistDetail = () => {
  showPlaylistDialog.value = false;    // 隐藏弹窗
  selectedPlaylist.value = null;        // 清除选择的歌单
};






// **********************************歌单操作***************************************************
// 歌单操作
const showSettings = ref(false); // 控制歌单设置按钮状态
const isEditMode = ref(false);   // 区分添加 / 编辑模式
const editingPlaylist = ref(null); // 当前正在编辑的歌单
const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

// 控制弹窗显示的状态
const showPlaylistDialog = ref(false);
const showEditDialog = ref(false);

const handleCancelUpload = async (ossUrl) => {
  try {
    // await deleteCoverFromOSS(ossUrl); // 你自己写的删除接口
    editingPlaylist.value.coverUrl = '';
    ElMessage.success('封面已删除');
  } catch (e) {
    ElMessage.error('删除失败');
  }
};


const handleCoverUpload = async (e) => {
  const file = e.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('上传封面图方法参数', formData);
      // const res = await uploadCover(formData); // ✅ 调用你的上传接口
      // form.value.coverUrl = res.data.data.coverUrl; // 假设后端返回的 url 是 res.data.url
    } catch (err) {
      console.error('上传失败', err);
      ElMessage.error('上传失败');
    }
  }
};

const onSavePlaylist = async (formData) => {
  console.log("保存歌单", formData);
  formData.editorName = user.value.username;
  console.log("提交表单数据", formData);
  const endFormData = {
    id: formData.playlistId,
    name: formData.name,
    description: formData.description,
    coverUrl: formData.coverUrl
  }
  console.log("提交表单数据", endFormData.value);
  if (isEditMode.value) {
    // 编辑模式：调用编辑歌单接口
    // console.log("请求体", endFormData,user.value.id);
    const response = await PlayListsApi.updateList(endFormData); // 调用编辑歌单接口
    console.log("新增歌单接口响应", response);
    if (response.data.code === 20000) {
      toast.success('编辑成功');
    } else {
      toast.error('编辑失败');
    }
  } else {
    // 新建模式：调用新增歌单接口
    // console.log("请求体", endFormData,user.value.id);
    const response = await PlayListsApi.saveList(endFormData, user.value.id); // 调用新增歌单接口
    // console.log("新增歌单接口响应", response);
    if (response.data.code === 20000) {
      toast.success('添加成功');
    } else {
      toast.error('添加失败');
    }
  }
  await fetchPlaylists(); // 重新获取歌单列表
  showEditDialog.value = false; // 关闭弹窗
};


// 弹出编辑弹窗
const editPlaylistDialog = (playlist) => {
  console.log("编辑歌单", playlist);
  isEditMode.value = true; // 标记为编辑模式
  editingPlaylist.value = {
    id: playlist.id,
    name: playlist.name, description: playlist.description,
    coverUrl: playlist.coverUrl, editorName: user.value.username
  }; // 数据回填
  console.log("编辑歌单数据", editingPlaylist.value);
  showEditDialog.value = true; // 显示编辑弹窗
};

// 弹出添加弹窗
const addPlaylistDialog = () => {
  console.log("触发添加歌单弹窗");
  isEditMode.value = false; // 标记为添加模式
  editingPlaylist.value = { name: '', description: '', coverUrl: '', editorName: '', playlistId: '' }; // 空数据
  console.log("添加歌单数据", editingPlaylist.value);
  showEditDialog.value = true; // 显示编辑弹窗
};


// 删除歌单（✅ 你需要调用后端接口）
// import { ElMessage, ElMessageBox } from 'element-plus';

const deletePlaylistConfirm = async (playlistId) => {
  try {
    await ElMessageBox.confirm(
      '确定删除该歌单吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 用户点击了“确定”
    await PlayListsApi.deleteList(playlistId);
    ElMessage.success('删除成功');

    await fetchPlaylists(); // 删除后刷新
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
      console.error('删除歌单错误:', error);
    }
  }
};
</script>


<style>
/* 基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #faf3e0, #d5e1df);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 组件样式 */
.container {
  width: 80%;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.header {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.sub-header {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 20px;
}

/* 按钮样式 */
.button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  margin: 0 10px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.button.play {
  background: #8e9775;
  color: white;
}

.button.play:hover {
  background: #6c7b47;
}

.button.invite {
  background: #A67B5B;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
}

.button.invite:hover {
  background: #8a6548;
}

/* 歌单样式 */
.recommend {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.recommend-item {
  background: white;
  flex: 1 1 30%;
  min-width: 200px;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

.recommend-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.recommend-item h3 {
  margin-bottom: 5px;
  font-weight: bold;
}

.recommend-item p {
  color: #666;
}
</style>