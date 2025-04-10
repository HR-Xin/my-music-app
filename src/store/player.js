import { defineStore } from 'pinia';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentSong: null, // { url: '...', title: '...', coverUrl: '...' }
    isPlaying: false,
    currentTime: 0,
    progress: 0, // 你之前使用的状态
  }),

  actions: {
    setCurrentSong(song) {
      console.log("Store: 设置当前歌曲", song);
      this.currentSong = song;
      // 重置状态
      this.isPlaying = false;
      this.currentTime = 0;
      this.progress = 0; // 初始化进度
      this.syncPlayStatus(); // 同步播放状态 (如果需要)
    },

    setIsPlaying(playing) {
      // 避免不必要的更新触发 watch
      if (this.isPlaying !== playing) {
        console.log("Store: 设置播放状态", playing);
        this.isPlaying = playing;
        this.syncPlayStatus(); // 同步播放状态 (如果需要)
      }
    },

    setCurrentTime(time) {
      // console.log("Store: 设置当前时间", time); // 这个会打印很多
      this.currentTime = time;
      this.syncPlayStatus(); // 同步播放进度 (如果需要)
    },

    playPauseToggle() { // 你之前使用的 action
      this.isPlaying = !this.isPlaying;
      this.syncPlayStatus(); // 同步播放状态
    },

    updateProgress(progress) { // 你之前使用的 action
      this.progress = progress;
      this.syncPlayStatus(); // 同步播放进度
    },

    syncPlayStatus() { // 你之前使用的 action
      // 使用 WebSocket 发送当前播放信息
      if (this.currentSong && this.$socket) {
        const status = {
          song: this.currentSong,
          isPlaying: this.isPlaying,
          progress: this.progress,
        };
        // 发送 WebSocket 消息
        this.$socket.emit('syncPlayStatus', status);
      }
    },
  },
});