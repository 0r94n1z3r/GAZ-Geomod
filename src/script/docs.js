import { sendGET, downloadFile } from '@/script/api.js';

export const getDocsList = (type, id, cb)=>{
    let res = [];
    getListPart(type, id, 1, res, ()=>cb(res));
}

const getListPart = (type,id, page, res, cb) => {
    let limit = 20;

    sendGET(
        `/documents/${type}/${id}`,
        {
            limit,
            page
        },
        (dt)=>{
            if(!dt){
                cb();
                return;
            }
            res.push(...dt.rows);

            if(dt.count > res.length){
                getListPart(type, id, page+1, res, cb);
            }else{
                cb();
            }
        }
    );
}

export const downloadDoc = (name, cb)=>{
    downloadFile(name, res=>cb(res));
}

export const getExportInfo = (id, cb)=>{
    sendGET(
        `/wellStock/wells/${id}`,
        {modelsToInclude: 'Tunnelings,CurrentSlaughters,Columns,Perforation,SharpeningPerforation,NKT,Equipment'},
        cb
    );
}

export const downloadWellReport = (name, wellsId, fieldName, cb)=>{
    downloadFile(
        name, 
        res=>cb(res), 
        `/report/`,
        {wellsId, fieldName}
    );
}

export const getReportData = (wellsId, fieldName, cb)=>{
    sendGET(
        `/report/`,
        {wellsId, fieldName},
        res=>cb(res),
    );
}














