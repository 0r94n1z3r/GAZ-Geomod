import { defineStore } from 'pinia';
import { ref, computed, reactive, onMounted } from "vue";
import { getCookie, setCookie, deleteCookie } from '@/script/cookie.js';
import { sendPOST, sendGET } from '@/script/api.js';

import { useMapStore } from './map.js'

export const useUserStore = defineStore("user", ()=>{

    const isLogged = ref(null);

    onMounted(()=>{//auth check
        sendGET(
            ``,
            null,
            (res)=>{
                if(res.length){
                    sendGET(
                        `/fieldData/currentOperatingMode`,
                        {
                            dbName: res[0].dbName,
                            dbType: res[0].dbType
                        },
                        ()=>isLogged.value = !!res
                    );
                }else{
                    isLogged.value = false;
                }
            }
        );
    })
    
    const auth = (
        login,
        password,
        cb
    )=>{
        sendPOST(
            '/auth/login',
            {
                "Эл_почта": login,
                "Пароль": password
            },
            (res)=>{
                if(res.token){
                    setCookie('token', res.token, {'max-age': 2678400000});
                    setCookie('user', JSON.stringify(res.user), {'max-age': 2678400000});
                    isLogged.value = true;
                }else{
                    cb(res.message)
                }
            }
        )
    }

    const exit = ()=>{
        deleteCookie('token');
        deleteCookie('user');

        isLogged.value = false;
    }

//--------------------------------------------------------------------
    return {
        isLogged,
        auth,
        exit
    };
})