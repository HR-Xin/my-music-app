import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';  // 主页组件
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import ProfilePage from '@/views/ProfilePage.vue';
import ZenAudioPlayer from '../views/ZenAudioPlayer.vue';
import CoverTest from '../views/CoverTestPage.vue';
// import PlaylistEditor from '../components/PlaylistEditor.vue';


const routes = [
  { path: '/', component: HomePage },  // 默认路由，访问根路径时加载 HomePage
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/profile/:id', component: ProfilePage },//  :意为使用动态路由
  { path: '/music-player', component: ZenAudioPlayer },
  { path: '/covertest', component:  CoverTest}
  // { path: 'playlist-editor', component: PlaylistEditor }
];

const router = createRouter({
  history: createWebHistory(),  // 使用浏览器的 history 模式
  routes
});

export default router;
