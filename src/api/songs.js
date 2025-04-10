import api from '../utils/request';

export default {
    saveMusic(music) {
        console.log("[saveMusic API 请求] 请求参数:", music);
        return api({
            url: '/songs/uploadMusic',
            method: 'post',
            data: music
        })
    },

    // 新增：获取用户上传的歌曲
    getMyUploadedSongs(uploaderId) {
        console.log(`[API] 获取用户 ${uploaderId} 上传的歌曲`);
        return api({
            url: `/songs/listAllSongs/${uploaderId}`,
            method: 'get'
        })
    },
    pageSongs(page,pageSize,userId){
        return api({
            url: `/songs/getAllSongs/${page}/${pageSize}/${userId}`,
            method: 'get'
        })
    }
}