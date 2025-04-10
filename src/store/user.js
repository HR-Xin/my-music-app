// src/stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        isLoggedIn: false,
        userInfo:{
            id:null,
            username:null,
            email:null,
            avatar:null,
        }, // { id, username, email, ... }
        token: null,
    }),

    // userStore.userInfo
    //{id: 4, username: '123132', password: '', email: '123@qq.com', avatar: 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eoj0…Il115xmJZcT4oCicvia7wMEufibKtTLqiaJeanU2Lpg3w/132', …}

    actions: {
        setUser(data) {
            this.userInfo = data.user;
            this.token = data.token;
            this.isLoggedIn = true;
        },
        setToken(token) {
            this.token = token;
        },
        logout() {
            this.userInfo = null;
            this.token = null;
            this.isLoggedIn = false;
        }

    }
    , getters: {
        profileDynamicPath: (state) => {
            return `/profile/${state.userInfo.id}`
        }
        // ,userAvatar:(state)=>{
        //     return state.userInfo.avatar
        // }
    }
    , persist: true
});
