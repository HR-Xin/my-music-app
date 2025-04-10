function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // 转换为 32 位整数
    }
    const hue = Math.abs(hash) % 360; // 色相 0-359
    const saturation = 60 + (Math.abs(hash >> 8) % 21); // 饱和度 60-80%
    const lightness = 45 + (Math.abs(hash >> 16) % 11); // 亮度 45-55%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  
  /**
   * 生成歌曲封面 Data URL
   * @param {string} title 歌曲标题
   * @param {string} artist 艺术家 (可选, 用于颜色生成)
   * @param {number} size 图片尺寸 (正方形)
   * @returns {string} PNG格式的 Data URL
   */
  export function generateCoverDataUrl(title = "无标题", artist = "", size = 200) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
  
    // 1. 填充背景色 (基于标题和艺术家生成)
    const bgColor = stringToColor(title + artist);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
  
    // 2. 设置文字样式
    ctx.fillStyle = 'white'; // 白色文字
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  
    // 动态调整字体大小 (简单示例)
    let fontSize = Math.max(14, Math.floor(size / 7)); // 基础字号
    // 尝试使用更有设计感的字体，如果浏览器不支持则回退
    ctx.font = `bold ${fontSize}px "FZKTJW", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`;
  
    // 简单的文字测量和换行 (更复杂的换行需要库或更多代码)
    const maxWidth = size * 0.8; // 文字最大宽度
    const words = title.split(''); // 按字分割，尝试逐字添加看是否超宽
    let lines = [];
    let currentLine = '';
    for (let i = 0; i < words.length; i++) {
        let testLine = currentLine + words[i];
        if (ctx.measureText(testLine).width > maxWidth && i > 0) {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
  
    // 3. 绘制文字 (居中，支持多行)
    const lineHeight = fontSize * 1.3; // 行高
    const startY = (size - (lines.length - 1) * lineHeight) / 2; // 计算起始 Y 坐标实现垂直居中
  
    lines.forEach((line, index) => {
        // 可以添加文字阴影等“艺术”效果
        // ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        // ctx.shadowBlur = 3;
        // ctx.shadowOffsetX = 1;
        // ctx.shadowOffsetY = 1;
        ctx.fillText(line, size / 2, startY + index * lineHeight);
    });
  
  
    // 4. 导出为 Data URL
    return canvas.toDataURL('image/png');
  }