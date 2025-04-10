import api from '../utils/request';

export default {
    updateEmail(user) {
        console.log('updateEmail',user);
        return api({
            url: `/user/updateEmail/${user.id}`,
            method: 'post',
            data: {
                password: user.password,
                email: user.email
            }
            
        })
    }

    , getProfile() {
        return api({
            url: '/user/getUserInfo',
            method: 'get'
        })
    }
    , updateProfile(data) {
        return api({
            url: `/user/updateProfile`,
            method: 'post',
            data: data
        })
    }

    , deleteUser(userId) {
        return api({
            url: `/user/${userId}`,
            method: 'delete',
        })
    }
    , logout() {
        return api({
            url: '/user/logout',
            method: 'post'
        })
    }

}
