import { sendGET } from '@/script/api.js';

export const getPolyMapList = (plast, cb)=>{
    let res = {};
    sendGET(
        `/stratigraphy/mapsandpoligonslist/${plast}`,
        null,
        dt => cb(dt),
        dt => cb([])
    )
}

export const getPolyMap = (plast, type, objectsName, cb)=>{
    let res = {};
    sendGET(
        `/stratigraphy/mapsandpoligons/${plast}`,
        {type, objectsName},
        dt => cb(dt),
        dt => cb({})
    )
}