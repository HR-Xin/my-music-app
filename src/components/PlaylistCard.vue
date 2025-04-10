<template>
    <div
      class="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:scale-105 transform transition-all"
      @click="handleClick"
    >
      <div class="relative">
        <img :src="playlist.cover" alt="歌单封面" class="w-full h-40 object-cover rounded-lg" />
        <div class="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full">
          <button @click.stop="editPlaylist" class="text-white text-sm">编辑</button>
        </div>
        <div class="absolute top-2 left-2 bg-black bg-opacity-50 p-2 rounded-full">
          <button @click.stop="deletePlaylist" class="text-white text-sm">删除</button>
        </div>
      </div>
      <h3 class="mt-2 text-lg font-semibold">{{ playlist.title }}</h3>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  
  // 接收父组件传入的 playlist 数据
  const props = defineProps({
    playlist: {
      type: Object,
      required: true,
    },
  })
  
  // 触发父组件事件
  const emit = defineEmits(['click', 'edit', 'delete'])
  
  // 点击歌单卡片
  const handleClick = () => {
    emit('click', props.playlist)
  }
  
  // 编辑歌单
  const editPlaylist = (event) => {
    event.stopPropagation() // 防止触发 handleClick
    emit('edit', props.playlist)
  }
  
  // 删除歌单
  const deletePlaylist = (event) => {
    event.stopPropagation() // 防止触发 handleClick
    emit('delete', props.playlist)
  }
  </script>
  
  <style scoped>
  /* 添加卡片样式 */
  img {
    border-radius: 8px;
    object-fit: cover;
  }
  
  button {
    font-size: 12px;
    cursor: pointer;
  }
  </style>
  