import api from '../utils/request';

export default{
    createRoom(){
       return api({
        url:'/room/create',
        method : 'post'
       }) 
    },
    uploadAudio(music,config={}){
        return api({
            url:'/vod/uploadMusic',
            method : 'post',
            data:music,...config// 将 config 对象的所有属性展开到 api 的配置中
        }) 
    }
}