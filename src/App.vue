<!-- <template>
  <div class="app-container">
    <nav class="navigation">
      <router-link to="/">Home</router-link>
      <router-link to="/login">Login</router-link>
      <router-link to="/register">Register</router-link>
    </nav>
    <main class="content">
      <router-view></router-view>  
    </main>
  </div>
</template> -->

<template>
  <div id="app">
    <router-view></router-view> <!-- 渲染路由组件 -->
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>


<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 让整个页面铺满 */
}

.navigation {
  padding: 10px;
  background-color: #f5f1e9;
}

.content {
  flex-grow: 1; /* 让 router-view 填充剩余空间 */
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f1e9; /* 确保整个页面风格一致 */
}
</style>
