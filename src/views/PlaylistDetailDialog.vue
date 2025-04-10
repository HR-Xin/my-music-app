<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white p-6 rounded-xl w-1/2 max-w-4xl">
      <div class="flex items-center">
        <img :src="playlist.coverUrl" alt="歌单封面" class="w-40 h-24 rounded-lg mr-4 object-cover">
        <div>
          <h2 class="text-3xl font-semibold">{{ playlist.name }}</h2>
          <p class="text-lg text-gray-600">{{ playlist.description }}</p>
        </div>
      </div>

      <div class="mt-6">
        <h3 class="text-2xl font-bold">歌曲列表</h3>
        <div class="mt-4">
          <input type="text" v-model="searchQuery" placeholder="搜索我的歌曲"
            class="border rounded-md p-2 w-full shadow-sm focus:border-[#A67B5B] focus:ring-[#A67B5B]" />
          <ul v-if="searchQuery && filteredUploadedSongs.length > 0"
            class="mt-2 max-h-48 overflow-y-auto border rounded-md shadow-sm">
            <li v-for="song in filteredUploadedSongs" :key="song.id" class="flex items-center p-2 hover:bg-gray-100">
              <input type="checkbox" :value="song.id" v-model="selectedSongs" class="mr-2" />
              <span>{{ song.title }} - {{ song.artist || '未知艺术家' }}</span>
            </li>
          </ul>
          <p v-else-if="searchQuery && filteredUploadedSongs.length === 0" class="mt-2 text-gray-500">
            没有找到符合条件的歌曲。
          </p>
          <button @click="addSelectedSongsToPlaylist" v-if="selectedSongs.length > 0"
            class="bg-green-500 text-white px-4 py-2 rounded-lg mt-4">
            添加到歌单
          </button>
        </div>
        <ul v-if="playlist.list && playlist.list.length > 0" class="mt-4">
          <li v-for="(song, index) in playlist.list" :key="song.id"
            class="flex justify-between items-center py-3 px-4 rounded-lg"
            :class="index % 2 === 0 ? 'bg-gray-100' : 'bg-white'">
            <span>{{ song.title }}</span>
            <button @click="playSong(song)" class="bg-[#A67B5B] text-white px-4 py-2 rounded-lg">
              {{ currentSong === song && isPlaying ? '暂停' : '播放' }}
            </button>
          </li>
        </ul>
        <p v-else class="mt-2 text-gray-600">暂无歌曲</p>

      </div>

      <div v-if="showPlayer"
        class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg flex items-center space-x-4">
        <button @click="togglePlay" class="bg-[#A67B5B] text-white px-4 py-2 rounded-lg">
          {{ isPlaying ? '暂停' : '播放' }}
        </button>
        <button @click="closePlayerDialog" class="bg-red-500 text-white px-4 py-2 rounded-lg">关闭播放器</button>
      </div>
      <div id="player-container"></div>

      <div class="mt-6 text-right">
        <button @click="close" class="px-4 py-2 text-white bg-gray-600 rounded-lg">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, computed } from 'vue';
import playListApi from '../api/playlists';  // 引入API文件
import { ElMessage } from 'element-plus'; // 引入 ElMessage

const props = defineProps({
  playlist: Object,
  uploadedSongs: Array, // 接收用户上传的歌曲列表作为 prop
});
const emit = defineEmits(['close', 'playlistUpdated']);
// --- 状态定义 ---
// const playlist = ref(props.playlist || {});
const currentSong = ref({});
const showPlayer = ref(false);
const isPlaying = ref(false);
let playerInstance = null; // 阿里云播放器实例
const songUrl = ref('');
const searchQuery = ref('');
const selectedSongs = ref([]);

// --- 计算属性：过滤用户上传的歌曲 ---
const filteredUploadedSongs = computed(() => {
  if (!searchQuery.value) {
    return [];
  }
  return props.uploadedSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
// --- 方法：将选中的歌曲添加到歌单 ---
const addSelectedSongsToPlaylist = async () => {
  if (selectedSongs.value.length === 0) {
    ElMessage.warning('请选择要添加的歌曲');
    return;
  }
  // console.log('props:', props.playlist.playlistId, selectedSongs.value);
  try {
    const res = await playListApi.addSongsToPlaylist(props.playlist.playlistId, selectedSongs.value);
    if (res.data.code === 20000) {
      ElMessage.success('歌曲已成功添加到歌单');
      // 重新获取歌单详情，更新歌曲列表
      // console.log('歌单重新请求的歌单id:', props.playlist.playlistId); 
      const updatedPlaylistRes = await playListApi.getPlaylistDetail(props.playlist.playlistId);
      if (updatedPlaylistRes.data.code === 20000 && updatedPlaylistRes.data.data.songList) {
        console.log('updatedPlaylistRes:', updatedPlaylistRes.data.data.songList);
        // props.playlist = updatedPlaylistRes.data.data.songList;
        selectedSongs.value = []; // 清空已选择的歌曲
        searchQuery.value = ''; // 清空搜索框
        emit('playlistUpdated', updatedPlaylistRes.data.data.songList); // 通知父组件歌单已更新
      } else {
        ElMessage.error('更新歌单信息失败');
      }
    } else {
      ElMessage.error('添加歌曲到歌单失败');
      console.error('添加歌曲到歌单失败:', res.data);
    }
  } catch (error) {
    ElMessage.error('添加歌曲到歌单时发生错误');
    console.error('添加歌曲到歌单时发生错误:', error);
  }
};


// 加载 Aliplayer
const loadAliPlayer = () => {
  return new Promise((resolve, reject) => {
    if (window.Aliplayer) {
      console.log('Aliplayer 已加载:', window.Aliplayer);
      resolve(window.Aliplayer);
    } else {
      const script = document.createElement('script');
      script.src = 'https://g.alicdn.com/de/prismplayer/2.15.0/aliplayer-min.js';
      script.onload = () => {
        console.log('Aliplayer 加载成功:', window.Aliplayer);
        resolve(window.Aliplayer);
      };
      script.onerror = (event) => {
        console.error('Aliplayer 加载失败:', event);
        console.error('script error', script.error);
        reject(new Error('Aliplayer 加载失败'));
      };
      document.body.appendChild(script);
    }
  });
};


// --- **将 closePlayerDialog 移到这里** ---
const closePlayerDialog = () => {
  console.log('closePlayerDialog called');
  if (playerInstance) {
    console.log('playerInstance exists, disposing...');
    playerInstance.dispose(); // 销毁播放器实例
    console.log('playerInstance disposed');
    playerInstance = null; // 清空实例引用
    console.log('playerInstance set to null');

    // 手动清空播放器容器内容，确保DOM被清理
    const playerContainer = document.getElementById('player-container');
    if (playerContainer) {
      playerContainer.innerHTML = ''; // 清空容器
    }
  } else {
    console.log('playerInstance is null or undefined, cannot dispose.');
  }

  console.log('setting showPlayer to false');
  showPlayer.value = false; // 隐藏播放器UI
  console.log('showPlayer.value:', showPlayer.value);

  console.log('setting isPlaying to false');
  isPlaying.value = false; // 重置播放状态
  console.log('isPlaying.value:', isPlaying.value);

  // 可以选择性地清空当前歌曲信息
  // currentSong.value = {};
};

// --- 播放歌曲逻辑 ---
const playSong = async (song) => {
  console.log('播放歌曲id:', song.musicId);
  try {
    const res = await playListApi.getMusicUrl(song.musicId);
    console.log('获取播放链接结果:', res.data); // 打印整个 data 对象方便调试

    // 增强错误处理和数据校验
    if (res.data.code !== 20000 || !res.data.data || !res.data.data.playUrl) {
      console.error('获取播放链接失败:', res.data.message || '未找到有效的播放链接');
      // 可以给用户提示
      alert(`无法播放歌曲 "${song.title}": ${res.data.message || '获取播放链接失败'}`);
      return;
    }

    songUrl.value = res.data.data.playUrl;
    console.log('播放链接:', songUrl.value);

    // 如果 playAuth 不需要了，可以注释掉
    // playAuth.value = res.data.data.playAuth;
    // console.log('播放授权:', playAuth.value);

    currentSong.value = song;
    showPlayer.value = true; // 先显示播放器区域

    // 销毁已有的播放器实例（防止多个播放器叠加）
    if (playerInstance) {
      console.log('Disposing previous player instance.');
      playerInstance.dispose();
      playerInstance = null;
      // 确保容器在创建新播放器前是空的
      const playerContainer = document.getElementById('player-container');
      if (playerContainer) playerContainer.innerHTML = '';
    }

    await loadAliPlayer(); // 确保 AliPlayer 库已加载

    // 创建新播放器实例
    playerInstance = new Aliplayer({
      id: 'player-container',
      source: songUrl.value, // 直接使用获取到的 URL
      // vid 和 playauth 在使用 source 时通常不需要
      // vid: vid.value,
      // playauth: playAuth.value,
      // dataType: 'audio', // Aliplayer 通常能自动识别，但明确指定更好
      width: '100%',
      height: '80px', // 保持高度
      autoplay: true, // 自动播放
      // controlBarVisibility: 'hover', // 控制条可见性
      // useH5Prism: true, // 推荐使用 H5 模式
      skinLayout: [ // 保持或调整你的皮肤布局
        { name: 'Progress', align: 'blabs', x: 0, y: 0 },
        { name: 'Volume', align: 'tlabs', x: 0, y: 0 },
        { name: 'PlayButton', align: 'tl', x: 15, y: 12 }, // 使用 PlayButton 更标准
        { name: 'TimeDisplay', align: 'tr', x: 12, y: 12 }, // 使用 TimeDisplay 更标准
      ],
    }, function (player) { // 播放器创建成功的回调
      console.log('播放器创建成功');
      // playerInstance = player; // 在回调里重新赋值确保引用正确，虽然外部已经赋值

      // --- **将事件监听器移到播放器创建成功的回调内** ---
      player.on('error', function (error) {
        console.error('播放器错误:', error);
        // 可以在这里添加用户提示或自动关闭播放器
        alert('播放时发生错误，请稍后重试。');
        closePlayerDialog(); // 出现错误时也关闭播放器
      });

      player.on('play', () => {
        console.log('Player event: play');
        isPlaying.value = true;
      });

      player.on('pause', () => {
        console.log('Player event: pause');
        isPlaying.value = false;
      });

      player.on('ended', () => {
        console.log('Player event: ended');
        isPlaying.value = false;
        // 根据需求决定播放结束后是否隐藏播放器
        // showPlayer.value = false;
      });
      // --- 事件监听器结束 ---

    });

  } catch (error) {
    console.error('播放歌曲过程中发生异常:', error);
    alert('播放歌曲时遇到问题，请检查网络或稍后重试。');
    showPlayer.value = false; // 出错时隐藏播放器
  }
};

// --- 切换播放/暂停 ---
const togglePlay = () => {
  if (!playerInstance) {
    console.warn("尝试切换播放状态，但播放器实例不存在。");
    return;
  }
  if (isPlaying.value) {
    playerInstance.pause();
  } else {
    playerInstance.play();
  }
  // isPlaying 的状态由 'play' 和 'pause' 事件更新，这里不需要手动设置
};

// --- 关闭整个弹窗 ---
const close = () => {
  // 在关闭整个弹窗前，确保播放器被正确关闭和销毁
  closePlayerDialog();
  emit('close'); // 通知父组件关闭
};

// --- 组件卸载时清理播放器 ---
onUnmounted(() => {
  console.log('Component unmounting, checking for player instance.');
  if (playerInstance) {
    console.log('Disposing player instance on unmount.');
    playerInstance.dispose();
    playerInstance = null;
  }
});
</script>

<style scoped>
/* 弹窗背景 */
.fixed {
  z-index: 9999;
}

.bg-black {
  background-color: rgba(0, 0, 0, 0.5);
}

/* 弹窗样式 */
.bg-white {
  background-color: white;
  max-height: 80vh;
  overflow-y: auto;
}

/* 歌曲列表项样式 */
.mt-4>li {
  border-bottom: 2px solid #d1d5db !important;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background-color: #f3f4f6 !important;
}

button {
  transition: background-color 0.3s;
}

button:hover {
  background-color: #8e9775;
}

#player-container {
  width: 100%;
  height: 80px;
  /*  修改：调整高度以适应音频 */
}
</style>
