import { getCookie } from '@/script/cookie.js';
import axios from 'axios';
import config from "@/config.json";

export const api = config.api;

import { useUserStore} from '@/stores/user.js';
import { useMapStore} from '@/stores/map.js';

export const sendGET = (url, data, cb, errCb=()=>{})=>{
    let map = useMapStore();

    if(!data)data = {};
    if(map?.activeField?.dbName)data.dbName = map?.activeField?.dbName;
    if(map?.activeField?.dbType)data.dbType = map?.activeField?.dbType;

    axios.get(api + url, 
    {
        params: data,
        headers: {'authorization': 'bearer ' + getCookie('token')}
    })
    .then((resp) => {
        cb(resp.data);
    })
    .catch((err) => {
        console.log(err);
        errCb(err);
        
        if(
            err.response.status == 401 || 
            err.response.status == 0 
        ){
            useUserStore().exit();
            return;
        }

        // cb(err);
    })
}
    
export const sendPOST = (url, data, cb)=>{
    axios({
        method: 'post',
        url: api + url,
        data,
        headers: {'authorization': 'bearer ' + getCookie('token')}
    })
    .then((resp) => {
        cb(resp.data);
    })
    .catch((err) => {
        console.log(err);
        // cb(err);
    })
}

export const downloadFile = (name, cb, url, data)=>{
    let map = useMapStore();

    axios({
        url: api+(url || `/files/${name}`),
        method: 'GET',
        params: Object.assign(
            {},
            {
                dbName: map?.activeField?.dbName,
                dbType: map?.activeField?.dbType,
            },
            data
        ),
        headers: {'authorization': 'bearer ' + getCookie('token')},
        responseType: 'blob',
    }).then((response) => {
        // create file link in browser's memory
        const href = URL.createObjectURL(response.data);
    
        // create "a" HTML element with href to file & click
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', name); //or any other extension
        document.body.appendChild(link);
        link.click();
    
        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(href);

        cb();
    });
}
