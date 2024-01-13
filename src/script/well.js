import { sendGET } from '@/script/api.js';
import cfg from '@/config.json';

export const getAllMapItems = (cb) => {
    let res = {
        areas: [],
        wells: [],
        layers: []
    }

    let wellsLoadedCounter = 0;

    loadAreas(1, res, ()=>{
        res.areas.forEach((area)=>{
            let layersIds = res.layers.map(e => e['Ид_пласта']);

            area['Пласты'].forEach(l => {
                if(!layersIds.includes(l['Ид_пласта']))res.layers.push(l);
            });

            loadWells(area['Ид_участка'], 1, res, ()=>{
                if(++wellsLoadedCounter == res.areas.length){
                    res.layers.sort((a, b) => {
                        if(a['Номер'] < b['Номер'])return -1;
                        if(a['Номер'] > b['Номер'])return 1;
                        return 0;
                    })

                    res.wells = filterWells(res.wells);
            
                    cb(res);
                }
            });
        })
    })


} 

const loadAreas = (page, res, cb)=>{
    sendGET(
        //'/wellStock/fields/{id}',
        '/wellStock/areas',
        {
            limit: 20,
            page
        },
        (dt)=>{
            if(dt.rows?.length){
                res.areas.push(...dt.rows);

                if(dt.rows.length == 20){
                    loadAreas(++page, res, cb);
                }else{
                    cb();
                }
            }
        }
    );
}

const loadWells = (id, page, res, cb)=>{
    sendGET(
        '/wellStock/areas/'+id,
        {
            limit: 20,
            page,
            id
        },
        (dt)=>{
            res.wells.push(...dt['Скважины']);

            if(dt.length == 20){
                loadWells(id, ++page);
            }else{
                cb();
            }
        }
    );
};

const filterWells = (wells)=>{
    let res = [];
    let filteredWellsNames = [];

    wells.forEach(w => {
        let linkWell = null;

        if(!filteredWellsNames.includes(w['Скважина'])){
            filteredWellsNames.push(w['Скважина']);
            res.push(w);
            linkWell = res[res.length - 1];
            linkWell['Ид_участков'] = [];
        }else{
            linkWell = res.find(e => e['Скважина'] == w['Скважина']);
        }

        let f =  w['Привязка_к_участку'] || w['Участки'][0];
        linkWell['Ид_участков'].push(f['Ид_участка']);
    })

    return res;
}

//----------------------------------------------------------------

export const getWellInfo = (id, models, cb)=>{
    sendGET(
        `/wellStock/wells/${id}`,
        {
            modelsToInclude: models//'Proplastki,Stratigraphy,GISCurves'
        },
        cb
    )
}

export const getWellDesign = (id, cb)=>{
    sendGET(
        `/wellStock/wellDesign/${id}`,
        {},
        cb
    )
}

//----------------------------------------------------------------

export const getFieldProduction = (cb, date)=>{
    sendGET(
        `/fieldData/currentOperatingMode`,
        {
            field: true,
            summ: true,
            startDate: date && date[0] || null, 
            endDate: date && date[1] || null, 
        },
        (res)=>cb(res)
    )
}

export const getWellsProduction = (
    wellsIds,
    cb, 
    date //['2019-08-04', '2022-08-04']
)=>{
    sendGET(
        `/fieldData/currentOperatingMode`,
        {
            wellsIds: '['+wellsIds+']',
            summ: true,
            startDate: date && date[0] || null, 
            endDate: date && date[1] || null, 
        },
        (res)=>cb(res)
    )
}

export const getAreaProduction = (
    areaId,
    cb, 
    date //['2019-08-04', '2022-08-04']
)=>{
    sendGET(
        `/fieldData/currentOperatingMode`,
        {
            areaId,
            summ: true,
            startDate: date && date[0] || null, 
            endDate: date && date[1] || null, 
        },
        (res)=>cb(res)
    )
}

export const getSeparateAreaProduction = (
    areaId, 
    cb, 
    date //['2019-08-04', '2022-08-04']
)=>{
    sendGET(
        `/fieldData/currentOperatingMode`,
        {
            limit: 1,
            page: 1,
            areaId,
            summ: false,
            startDate: date && date[0] || null, 
            endDate: date && date[1] || null, 
        },
        (res)=>{
            let lim = 1000
            let len = res.count / lim;
            let resLen = 0;
            let arr = {};
            
            for (let i = 1; i < len+1; i++) {
                sendGET(
                    `/fieldData/currentOperatingMode`,
                    {
                        limit: lim,
                        page: i,
                        areaId,
                        summ: false,
                        startDate: date && date[0] || null, 
                        endDate: date && date[1] || null, 
                    },
                    (resp)=>{
                        resp.rows.forEach(e => {
                            if(!arr[e['Ид_скважины']])arr[e['Ид_скважины']] = [];
                            arr[e['Ид_скважины']].push(e);
                        });

                        resLen += resp.rows.length/lim;

                        if(resLen == len){
                            Object.keys(arr).forEach(k => {
                                var maxString = '';
                                arr[k].forEach(e => {
                                    if(!e['Объект'])e['Объект']='';
                                    maxString = e['Объект']?.length > maxString.length?e['Объект']:maxString
                                });
                                arr[k] = arr[k].filter(e => e['Объект'] == maxString);
                            });

                            cb(arr);
                        }
                    }
                )
            }
        }
    )
}

export const getWellsByLayers = (id, cb)=>{
    if(!id)return;
    sendGET(
        `/stratigraphy/breakdown/${id}`,
        null,
        (res)=>cb(res)
    )
}

export const getMapEval = (layerId, objectsName, cb, cbErr)=>{
    if(!layerId)return;
    sendGET(
        `/stratigraphy/breakdown/${layerId}/gis`,
        {objectsName},
        cb,
        cbErr
    )
}