<template>
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-4">封面生成测试页面</h1>
  
      <div class="grid grid-cols-3 gap-4">
        <div v-for="song in testSongs" :key="song.id" class="border p-4 rounded shadow">
          <p class="font-semibold">{{ song.title }}</p>
          <p class="text-sm text-gray-600">{{ song.artist }}</p>
          <img
            :src="song.coverUrl || song.generatedCoverUrl || defaultSvgPath"
            alt="封面"
            class="w-40 h-40 object-cover mt-2 border"
            @error="onImageError(song)" <!-- Add error handler -->
          />
          <div class="mt-2 text-xs break-all">
            <p>原始 CoverURL: {{ song.originalCoverUrl || '无' }}</p>
            <!-- <p>生成 DataURL: {{ song.generatedCoverUrl ? '已生成' : '未生成' }}</p> -->
          </div>
        </div>
      </div>
  
      <h2 class="text-xl font-bold mt-8 mb-4">调试信息:</h2>
      <pre class="bg-gray-100 p-4 rounded text-xs overflow-auto">{{ JSON.stringify(testSongs, null, 2) }}</pre>
  
    </div>
  </template>
  
  <script setup>
  import { ref, watch, nextTick } from 'vue';
  // 确保路径正确 - 相对于此测试文件的位置或使用 `@` 别名
  import { generateCoverDataUrl } from '../utils/coverGenerator';
  // 确保默认 SVG 路径正确 - 相对于此文件或使用 `@` 别名
  import defaultSvg from '../assets/musicapp.svg'; // 直接导入 SVG
  
  const defaultSvgPath = defaultSvg; // 使用导入的路径
  
  // 示例歌曲数据
  const testSongs = ref([
    {
      id: 1,
      title: '歌曲一 (有真实 URL)',
      artist: '艺术家A',
      coverUrl: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg', // 一个有效的公共图片 URL
      originalCoverUrl: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg' // 备份原始值
    },
    {
      id: 2,
      title: '歌曲二 (无 Cover URL)',
      artist: '艺术家B',
      coverUrl: null, // 应该是 null 或 undefined
      originalCoverUrl: null
    },
    {
      id: 3,
      title: '歌曲三 (空字符串 Cover URL)',
      artist: '艺术家C',
      coverUrl: '', // 空字符串也是 falsy
      originalCoverUrl: ''
    },
     {
      id: 4,
      title: '一个非常非常非常长的歌曲标题用于测试换行效果',
      artist: '长名艺术家D',
      coverUrl: null,
      originalCoverUrl: null
    },
    {
      id: 5,
      title: '歌曲五 (无效 URL)',
      artist: '艺术家E',
      coverUrl: 'http://invalid-url-that-will-fail-to-load', // 无效 URL (但非空)
      originalCoverUrl: 'http://invalid-url-that-will-fail-to-load'
    },
    // Add more test cases as needed
  ]);
  
  // 使用 watch 监听（对于静态数据，也可以用 onMounted 处理一次）
  watch(testSongs, (songs) => {
    console.log("Watch triggered for testSongs");
    if (Array.isArray(songs)) {
      songs.forEach(song => {
        // 如果 coverUrl 为 falsy (null, undefined, '') 且尚未生成
        if (!song.coverUrl && !song.generatedCoverUrl) {
          try {
              console.log(`为 "${song.title}" 生成封面...`);
              song.generatedCoverUrl = generateCoverDataUrl(song.title, song.artist, 160);
              console.log(`...生成完成 (Data URL 长度: ${song.generatedCoverUrl?.length})`);
          } catch (error) {
              console.error(`为 "${song.title}" 生成封面时出错:`, error);
              // 可以在这里设置一个错误状态或标记
              song.generationError = true;
          }
        } else {
           // console.log(`歌曲 "${song.title}" 不需要生成封面 (coverUrl: ${!!song.coverUrl}, generated: ${!!song.generatedCoverUrl})`);
        }
      });
    }
  }, { deep: true, immediate: true }); // immediate: true 在初始加载时就运行一次
  
  // 图片加载错误处理
  const onImageError = (song) => {
      console.error(`图片加载失败: ${song.title}. 当前 src:`, song.coverUrl || song.generatedCoverUrl || defaultSvgPath);
      // 可选：尝试强制显示默认 SVG
      // const imgElement = event.target;
      // imgElement.src = defaultSvgPath;
  };
  
  </script>
  
  <style scoped>
  /* 可以添加一些简单的样式 */
  </style>