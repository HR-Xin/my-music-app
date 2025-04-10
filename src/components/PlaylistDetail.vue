<template>
    <div class="p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">我的歌单</h2>
        <button @click="showEditor = true" class="bg-[#A67B5B] text-white px-4 py-2 rounded-lg">创建歌单</button>
      </div>
  
      <!-- 歌单列表 -->
      <div class="grid grid-cols-3 gap-4">
        <PlaylistCard
          v-for="playlist in paginatedPlaylists"
          :key="playlist.id"
          :playlist="playlist"
          @click="openDetail(playlist)"
          @edit="editPlaylist"
          @delete="deletePlaylist"
        />
      </div>
  
      <!-- 分页 -->
      <div class="mt-4 flex justify-center space-x-2">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page"
          :class="['px-3 py-1 rounded', currentPage === page ? 'bg-[#A67B5B] text-white' : 'bg-gray-200']"
        >
          {{ page }}
        </button>
      </div>
  
      <!-- 创建/编辑弹窗 -->
      <PlaylistEditor
        v-if="showEditor"
        :playlist="editingPlaylist"
        @save="savePlaylist"
        @close="closeEditor"
      />
  
      <!-- 歌单详情弹窗 -->
      <PlaylistDetail v-if="selectedPlaylist" :playlist="selectedPlaylist" @close="selectedPlaylist = null" />
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import PlaylistCard from '@/components/PlaylistCard.vue'
  import PlaylistEditor from '@/components/PlaylistEditor.vue'
  import PlaylistDetail from '@/components/PlaylistDetail.vue'
  
  // 所有歌单数据
  const playlists = ref([])
  
  const currentPage = ref(1)
  const pageSize = 6
  
  const showEditor = ref(false)
  const editingPlaylist = ref(null)
  const selectedPlaylist = ref(null)
  
  const paginatedPlaylists = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return playlists.value.slice(start, start + pageSize)
  })
  
  const totalPages = computed(() => Math.ceil(playlists.value.length / pageSize))
  
  const openDetail = (playlist) => {
    selectedPlaylist.value = playlist
  }
  
  const editPlaylist = (playlist) => {
    editingPlaylist.value = { ...playlist }
    showEditor.value = true
  }
  
  const deletePlaylist = (playlist) => {
    playlists.value = playlists.value.filter(p => p.id !== playlist.id)
  }
  
  const savePlaylist = (playlistData) => {
    if (playlistData.id) {
      // 编辑
      const index = playlists.value.findIndex(p => p.id === playlistData.id)
      playlists.value[index] = playlistData
    } else {
      // 新建
      playlistData.id = Date.now()
      playlists.value.push(playlistData)
    }
    closeEditor()
  }
  
  const closeEditor = () => {
    showEditor.value = false
    editingPlaylist.value = null
  }
  </script>
  