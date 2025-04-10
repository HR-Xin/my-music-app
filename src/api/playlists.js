import api from '../utils/request';

export default {
  addSongsToPlaylist(playlistId, songIds) {
    // console.log("[API 请求] 请求参数:", playlistId);
    return api({
      url: `/playlistsongs/addSongs/${playlistId}`,
      method: 'post',
      data: songIds
    });
  }
  , getMusicUrl(musicId) {
    return api({
      url: `/vod/getMusicUrl/${musicId}`,
      method: 'get'
    })
  }
  , getPlayAuth(musicId) {
    console.log("请求参数:", musicId);
    return api({
      url: `/vod/getPlayauth/${musicId}`,
      method: 'get'
    })
  }
  //分页跳转
  , getPlaylistsByPage(page, size) {
    return api({
      url: `/playlists/getByPage/${page}/${size}`,
      method: 'get'
    })
  }

  // 获取歌单列表
  , getLists(userId) {
    console.log("[API 请求] 请求 URL:", `/playlists/getAllPlayLists/${userId}`);

    return api({
      url: `/playlists/getAllPlayLists/${userId}`,
      method: 'get'
    });
  },

  // 获取歌单详情
  getPlaylistDetail(playlistId) {
    console.log("[API 请求] 请求参数:", playlistId);
    return api({
      url: `/playlists/getPlaylistInfo/${playlistId}`,
      method: 'get'
    });
  },

  // 创建歌单
  saveList(newPlaylist, userId) {

    return api({
      url: `/playlists/saveList/${userId}`,
      method: 'post',
      data: newPlaylist
    });
  },

  // 更新歌单
  updateList(updatedPlaylist) {
    console.log("[API 请求] 请求参数:", updatedPlaylist);
    return api({
      url: `/playlists/updateById`,
      method: 'put',
      data: updatedPlaylist
    });
  },

  // 删除歌单
  deleteList(playlistId) {
    return api({
      url: `/playlists/${playlistId}`,
      method: 'delete'
    });
  },
};
