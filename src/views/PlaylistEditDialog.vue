  <template>
    <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white w-full max-w-lg p-6 rounded-xl shadow-xl relative">
        <h2 class="text-2xl font-bold mb-4">{{ isEdit ? '编辑歌单' : '新建歌单' }}</h2>

        <form @submit.prevent="submit">
          <div class="mb-4">
            <label class="block font-medium mb-1">歌单名称</label>
            <input v-model="form.name" type="text" class="w-full border rounded px-3 py-2" required />
          </div>

          <div class="mb-4">
            <label class="block font-medium mb-1">描述</label>
            <textarea v-model="form.description" class="w-full border rounded px-3 py-2" rows="3"></textarea>
          </div>

          <div class="mb-4">
            <label class="block font-medium mb-1">上传封面图</label>
            <input type="file" accept="image/*" @change="handleCoverUpload" />
            <div v-if="form.coverUrl" class="mt-2">
              <img :src="form.coverUrl" class="w-32 h-32 object-cover rounded" />
              <button type="button" @click="cancelCoverUpload"
                class="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded">取消上传</button>
            </div>
          </div>

          <div class="flex justify-end space-x-4">
            <button type="button" @click="close" class="px-4 py-2 rounded bg-gray-400 text-white">取消</button>
            <button type="submit" class="px-4 py-2 rounded bg-[#A67B5B] text-white">{{ isEdit ? '保存修改' : '创建歌单'
            }}</button>
          </div>
        </form>
      </div>
    </div>
  </template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useUserStore } from '../store/user';
import ossApi from '../api/oss';
import { usePlayerStore } from '../store/player';//按名字导入,需要加上{},export const usePlayerStore = defineStore('player', {
import { ElMessage } from 'element-plus';
const userStore = useUserStore();
const playerStore = usePlayerStore();

const props = defineProps({
  playlist: Object, // 如果传入则为编辑模式
  visible: Boolean
});

const emit = defineEmits(['update:visible', 'save']);

const form = ref({
  // playlistId:'',  不需要,对象传入,对象传出
  name: '',
  description: '',
  coverUrl: '',
  editorName: ''
});

const isEdit = computed(() => !!props.playlist);

// 当 props.playlist 发生变化，回填数据
watch(() => props.playlist, (val) => {
  // console.log("watch 监听到 playlist 变化:", val);  // ✅ 确保 watch 触发

  if (val) {
    form.value = {
      playlistId: val.id || '',
      name: val.name || '',
      description: val.description || '',
      coverUrl: val.coverUrl || ''
    };
  } else {
    form.value = {
      playlistId: '',
      name: '',
      description: '',
      coverUrl: ''
    };
  }
}, { immediate: true });

const close = () => emit('update:visible', false);

const handleCoverUpload = async (e) => {
  const file = e.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('file', file);//这个fordata键名要和后端参数MultipartFile 变量名一致

    // ✅ 正确打印 FormData
    for (let pair of formData.entries()) {
      console.log(`📌 FormData: ${pair[0]}, `, pair[1]);
    }


    try {
      const res = await ossApi.uploadCover(formData);
      console.log('上传封面图方法返回', res.data);
      if (res.data.code === 20000) {
        form.value.coverUrl = res.data.data.coverUrl;
        ElMessage.success('上传成功');
      } else {
        ElMessage.error('上传失败');
        form.value.coverUrl = '';
      }
    } catch (err) {
      ElMessage.error('发送请求失败');
      form.value.coverUrl = '';
    }
  }
};

const cancelCoverUpload = async () => {
  if (!form.value.coverUrl) return;

  try {
    await ossApi.deleteCover(form.value.coverUrl); // 你的删除 OSS API
    form.value.coverUrl = ''; // 清空封面 URL
    userStore.updateCoverUrl(''); // 更新 store
    ElMessage.success('封面已删除');
  } catch (err) {
    console.error('删除封面失败', err);
    ElMessage.error('删除失败');
  }
};



const submit = () => {
  emit('save', { ...form.value });
  close();
};
</script>