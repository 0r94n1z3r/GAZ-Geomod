import { sendGET } from '@/script/api.js';

export const getPassport = (cb)=>{
    sendGET(
        `/fieldPassport/field/reserves`,
        null,
        cb,
    )
}
