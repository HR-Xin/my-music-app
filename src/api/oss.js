import api from '../utils/request';
export default {
    uploadAvatar(file, userId) {
        return api({
            url: `/oss/avatarupload/${userId}`,
            method: 'post',
            data: file,
            // headers: {
            //     'Content-Type': 'multipart/form-data', // 需要设置请求头为 multipart/form-data
            //     // },//为已经明确设置了 Content-Type 为 multipart/form-data，
            //     // 所以这个设置会优先于任何默认的 Content-Type。
            // }
        })
    }


    , uploadCover(formData) { // 确保这里参数是 FormData
        for (let pair of formData.entries()) {
            console.log(`📌 FormData: ${pair[0]}, `, pair[1]);
        }
        return api({
            url: `/oss/cover`,
            method: 'post',
            data: formData, // 确保传输的是 FormData
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
    }


    // , test(file) {
    //     return api({
    //         url: `/oss/test/${userState.userInfo.id}`,
    //         method: 'post',
    //         data: file,
    //         headers: {
    //             'Content-Type': 'multipart/form-data', // 需要设置请求头为 multipart/form-data
    //         },
    //     })
    // }
}