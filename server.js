// 创建 WebSocket 连接
//websocket前端nodejs监听的端口是3001,不能和后端服务2500端口冲突,ws使用3001端口,http使用2500端口
const socket = new WebSocket('ws://localhost:2500/ws');//ws协议本地连接后端服务器


socket.onopen = () => {
    console.log('WebSocket connected!');
};

// 当 WebSocket 连接后，向服务器发送当前播放状态
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // 处理接收到的播放状态数据（例如，其他用户的播放同步）
    const playerStore = usePlayerStore();
    playerStore.setCurrentSong(data.song);
    playerStore.isPlaying = data.isPlaying;
    playerStore.progress = data.progress;
};

// 向服务器发送当前播放状态
const syncPlayStatus = (song, isPlaying, progress) => {
    const message = {
        song: song,
        isPlaying: isPlaying,
        progress: progress,
    };
    socket.send(JSON.stringify(message));
};

export { syncPlayStatus };

// 维护当前的播放状态
// let currentSong = null;
// let currentTime = 0;
// let isPlaying = false;

// 监听 WebSocket 连接成功
// socket.onopen = () => {
//     console.log('Connected to WebSocket server');

//     // 连接后从服务器获取当前播放状态
//     socket.onmessage = (event) => {
//         const message = JSON.parse(event.data);

//         if (message.type === 'sync') {
//             currentSong = message.currentSong;
//             currentTime = message.currentTime;
//             isPlaying = message.isPlaying;

//             // 根据服务器同步的信息更新 UI
//             updateUI(currentSong, currentTime, isPlaying);
//         }
//     };
// };

// // 发送播放控制消息到服务器
// function sendPlaybackMessage(songUrl, currentTime, isPlaying) {
//     const message = {
//         type: 'playback',
//         songUrl,
//         currentTime,
//         isPlaying
//     };
//     socket.send(JSON.stringify(message));
// }

// // 更新前端 UI 显示播放状态
// function updateUI(song, time, playing) {
//     console.log(`Current song: ${song}, Current time: ${time}, Is playing: ${playing}`);
//     // 更新播放器 UI，如进度条、播放/暂停按钮等
// }

// // 控制播放
// function playSong(songUrl) {
//     // 播放新歌曲
//     isPlaying = true;
//     currentSong = songUrl;
//     currentTime = 0;  // 从头开始播放

//     // 发送消息到服务器，控制播放
//     sendPlaybackMessage(songUrl, currentTime, isPlaying);
// }

// // 暂停播放
// function pauseSong() {
//     // 暂停当前歌曲
//     isPlaying = false;

//     // 发送暂停消息到服务器
//     sendPlaybackMessage(currentSong, currentTime, isPlaying);
// }

// // 更新进度条
// function updateProgress(time) {
//     currentTime = time;

//     // 发送进度更新到服务器
//     sendPlaybackMessage(currentSong, currentTime, isPlaying);
// }