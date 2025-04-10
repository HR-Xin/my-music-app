<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 class="text-2xl font-bold mb-4">{{ playlist ? '编辑歌单' : '创建歌单' }}</h3>
  
        <form @submit.prevent="handleSave">
          <!-- 歌单封面上传 -->
          <div class="mb-4">
            <label for="cover" class="block text-lg">歌单封面</label>
            <input type="file" id="cover" @change="handleCoverChange" class="mt-2" />
            <div v-if="coverUrl" class="mt-4">
              <img :src="coverUrl" alt="封面预览" class="w-full h-32 object-cover rounded-lg" />
            </div>
          </div>
  
          <!-- 歌单标题 -->
          <div class="mb-4">
            <label for="title" class="block text-lg">歌单标题</label>
            <input type="text" id="title" v-model="playlist.title" class="mt-2 p-2 border border-gray-300 rounded-md w-full" required />
          </div>
  
          <!-- 歌单描述 -->
          <div class="mb-4">
            <label for="description" class="block text-lg">歌单描述</label>
            <textarea id="description" v-model="playlist.description" class="mt-2 p-2 border border-gray-300 rounded-md w-full" rows="4"></textarea>
          </div>
  
          <!-- 提交按钮 -->
          <div class="flex justify-end">
            <button type="submit" class="bg-[#A67B5B] text-white px-4 py-2 rounded-lg">
              {{ playlist ? '保存' : '创建' }}
            </button>
          </div>
        </form>
  
        <button @click="$emit('close')" class="absolute top-4 right-4 text-lg">×</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import PlayListsApi from '../api/playlists'
  
  const props = defineProps({
    playlist: {
      type: Object,
      default: () => ({
        title: '',
        description: '',
        cover: '',
      }),
    },
  })
  
  const emit = defineEmits(['save', 'close'])
  
  const coverUrl = ref(props.playlist.cover)
  
  // 监听 props 中传入的歌单数据，更新封面预览
  watch(() => props.playlist.cover, (newCover) => {
    coverUrl.value = newCover
  })
  
  // 处理封面图片上传
  const handleCoverChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      coverUrl.value = URL.createObjectURL(file)
      // 如果需要上传至阿里云，可以在这里做处理
    }
  }
  
  // 保存歌单
  const handleSave = () => {
    // 处理表单数据并触发 save 事件
    const playlistData = {
      ...props.playlist,
      cover: coverUrl.value, // 使用封面图
    }
    emit('save', playlistData)
  }
  </script>
  
  <style scoped>
  /* 添加表单样式 */
  textarea {
    resize: vertical;
  }
  </style>
  