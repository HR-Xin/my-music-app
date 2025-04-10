// 检查 token 是否过期
function isTokenExpired(token) {
    if (!token) return true;
  
    const payload = JSON.parse(atob(token.split('.')[1])); // 解码 JWT 获取 payload
    const exp = payload.exp * 1000; // 过期时间（转换为毫秒）
  
    return Date.now() > exp; // 如果当前时间大于过期时间，说明 token 已过期
  }
  
  // 获取 token
  function getToken() {
    const token = localStorage.getItem('token');
    if (isTokenExpired(token)) {
      console.log('Token 已过期');
      localStorage.removeItem('token'); // 清除过期的 token
      return null;
    }
    return token;
  }
  
  // 设置 token
  function setToken(token) {
    localStorage.setItem('token', token);
  }
  
  export { getToken, setToken, isTokenExpired };
  