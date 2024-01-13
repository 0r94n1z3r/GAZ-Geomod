import { defineStore } from 'pinia';
import { ref, computed, reactive, watch } from "vue";
import { sendGET } from '@/script/api.js';

import { getWellsByLayers, getWellInfo, getAllMapItems } from '@/script/well.js'
import { getPolyMap, getPolyMapList } from '@/script/poly.js'

import chroma from 'chroma-js';

export const useMapStore = defineStore("map", ()=>{
    const map = ref(null);
    const mapObj = computed(()=>map.value?.leafletObject);
    const center = ref({lat: 55.7522, lng: 37.6156});

    const init = (mp)=>{
        map.value = mp;
    }

    const remove = ()=>{
        map.value = null;
    }

    const resize = ()=>{
        setTimeout(()=>{
            if(map.value && mapObj.value)mapObj.value.invalidateSize();
        });
    }

    const isAbsoluteHeight = ref(false);

//field
    const fields = ref([]);
    const activeField = ref(null);

    const updateFields = ()=>{
        fields.value = [];
        activeWells.value = [];
        loadFields();
    };

    const loadFields = ()=>{
        sendGET(
            '',
            {},
            (dt)=>{
                fields.value.push(...dt.reverse())
                activeField.value = fields.value[0];//tmp 0
            }
        );
    }

    watch(activeField, ()=>{
        updateMapItems();
    })

//areas - Участки
    const mapItemsLoaded = ref(false);

    const areas = ref([]);

    const areasDropList = computed(()=>
        [
            {'Название': 'Все участки'}, 
            ...areas.value
        ]
    )

    const activeArea = ref(areasDropList.value[0]);

    const activeAreaDisplay = computed(()=>activeArea.value['Ид_участка'] && activeArea.value);

    const updateMapItems = ()=>{
        mapItemsLoaded.value = false;

        areas.value = [];
        activeArea.value = areasDropList.value[0];

        allWells.value = [];
        activeWells.value = [];

        layers.value = [];

        objects.value = [];

        getAllMapItems((res)=>{
            areas.value = res.areas;
            allWells.value = res.wells;
            layers.value = res.layers;
            mapItemsLoaded.value = true;

            console.log(areas.value, allWells.value, layers.value);
        })
    }

    watch(activeArea, ()=>activeWells.value = []);

//objects
    const objects = ref([]);

    const objectsDropList = computed(()=>
        [
            {'Объект': 'Объекты разработки'}, 
            ...JSON.parse(JSON.stringify(objects.value)).sort((a,b)=>{
                if ( a['Объект'] < b['Объект'] )return -1;
                if ( a['Объект'] > b['Объект'] )return 1;
                return 0;
            })
        ]
    )

    const activeObject = ref(objectsDropList.value[0]);

    const activeObjectDisplay = computed(()=>activeObject.value['Объекты_по_скважине'] && activeObject.value);

    watch(activeObject, (n)=>pickObject(n));

    const pickObject = (obj)=>{
        if(!obj['Объекты_по_скважине']){
            hlCategories.objects = [];
            return;
        }

        hlCategories.objects = obj['Объекты_по_скважине'].map(e => allWells.value.find(k => k['Ид_скважины'] == e['Скважина']['Ид_скважины'])).filter(e => e)
    }

    watch(()=>objects.value, ()=>{
        activeObject.value = objectsDropList.value[0];
    });

//layers
    const layers = ref([]);

    const currentLayers = computed(()=>
        [
            {'Пласт': 'Все пласты'},
            ...(activeArea.value?.['Пласты'] || layers.value)
        ]
    );

    const activeLayer = ref(currentLayers.value[0]);
    const activeLayerDisplay = computed(()=>activeLayer.value['Ид_пласта'] && activeLayer.value);

    watch(activeArea, ()=>{activeLayer.value = currentLayers.value[0]})
    watch(activeObject, ()=>{activeLayer.value = currentLayers.value[0]})
    watch(activeField, ()=>{activeLayer.value = currentLayers.value[0]})

    watch(activeLayer, (n)=>pickLayer(n));

    const pickLayer = (obj)=>{ 
        if(!obj['Ид_пласта']){
            hlCategories.layers = [];
            updatePolyMapList(null);
            return;            
        }

        updatePolyMapList(obj['Пласт']);

        getWellsByLayers(
            obj['Ид_пласта'],
            (res)=>{
                hlCategories.layers = res['Скважины'].map(e => allWells.value.find(k => k['Ид_скважины'] == e['Ид_скважины'])).filter(e => e);
            }
        )
    }

//wells
    const allWells = ref([]);

    const wells = computed(()=>
        activeAreaDisplay.value?
        allWells.value.filter(e => e['Ид_участков'].includes(activeArea.value['Ид_участка']))
        :[]
    );

    const extendWell = (id, key, data)=>{
        if(data){
            let well = allWells.value.find(e => e['Ид_скважины'] == id);
            well[key] = data;

            if(!well['Подошва_инкл'] && data[0]?.['Подошва']){
                let bot_arr = data.map(e => e['Подошва']);
                if((well['Подошва_fake']||0) < Math.max(...bot_arr))well['Подошва_fake'] = Math.max(...bot_arr)
            }
        }
    }

    let wellStratQueue = {
        processing: [],
        queue: [],
        limit: 20
    }

    const switchStratQueue = (wellId)=>{
        if(wellId)
            wellStratQueue.processing.splice(wellStratQueue.processing.indexOf(wellId),1);

        if(wellStratQueue.queue.length){
            let obj = wellStratQueue.queue.splice(0,1)[0];
            updateWellStrat(obj);
        }
    };

    const updateWellStrat = (well)=>{
        if(well['Стратиграфия']){
            switchStratQueue();
            return;
        }

        if(wellStratQueue.processing.length < wellStratQueue.limit){
            well['Стратиграфия'] = [];
            wellStratQueue.processing.push(well['Ид_скважины']);
        }else{
            wellStratQueue.queue.push(well);
            return;
        }

        getWellInfo(
            well['Ид_скважины'],
            'Stratigraphy',
            (res)=>{
                extendWell(well['Ид_скважины'], 'Стратиграфия', res['Стратиграфия']);
                switchStratQueue(well['Ид_скважины']);
            }
        );
    }

    //active
        const activeWells = ref([])
        const activeWellsIDs = computed(()=>activeWells.value.map(e => e["Ид_скважины"]))

        const switchActiveState = (id)=>{
            if(activeWellsIDs.value.includes(id)){
                activeWells.value = activeWells.value.filter(e => e["Ид_скважины"] != id);
            }else{
                activeWells.value.push(allWells.value.find(e => e["Ид_скважины"] == id));
            }
        }

        const selectWells = (arr)=>{
            activeWells.value = arr;
        }

        const activeWellsSwitch = {
            left: (id)=>{activeWells.value[id-1] = activeWells.value.splice(id, 1, activeWells.value[id-1])[0]},
            right: (id)=>{activeWells.value[id+1] = activeWells.value.splice(id, 1, activeWells.value[id+1])[0]}
        }

    //highlighted
        const hlCategories = reactive({
            objects: [],
            layers: []
        })

        const highlightedWellsIDs = computed(()=>highlightedWells.value.map(e => e["Ид_скважины"]));

        const highlightedWells = computed(()=>{
            if(!(activeAreaDisplay.value || activeLayerDisplay.value || activeObjectDisplay.value))return allWells.value;

            let objectsIds = hlCategories.objects.map(e => e['Ид_скважины']);
            let layersIds = hlCategories.layers.map(e => e['Ид_скважины']);

            let res = allWells.value.filter(e => 
                (activeAreaDisplay.value?e['Ид_участков'].includes(activeArea.value['Ид_участка']):true) &&
                (activeLayerDisplay.value?layersIds.includes(e['Ид_скважины']):true) && 
                (activeObjectDisplay.length?objectsIds.includes(e['Ид_скважины']):true)
            );

            return res;
        })

   

        // watch(highlightedWells, (arr)=>{
        //     if(hlCategories.layers.length)udpateWellsStrat(arr);
        // });

//clusters
    const clusters = computed(()=>{
        let res = {
            clusters: {},
            none: []
        };

        allWells.value.forEach((e,k)=>{
            if(e['Номер_куста']){
                let id = e['Номер_куста'].replace('-н','');
                if(!res.clusters[id]){
                    res.clusters[id] = {
                        wells: [],
                        name: id
                    };
                }
                res.clusters[id].wells.push(e);
            }else{
                res.none.push(e);
            }
        })

        for (const key in res.clusters){
            let obj = res.clusters[key];

            let coords = {x:[], y:[]};
            obj.wells.forEach(e => {
                coords.x.push(e['Коорд_x']);
                coords.y.push(e['Коорд_y']);
            });

            let borders = {
                min: {x: Math.min(...coords.x), y: Math.min(...coords.y)},
                max: {x: Math.max(...coords.x), y: Math.max(...coords.y)}
            }

            obj.coords = [
                borders.min.y + ((borders.max.y - borders.min.y)/2),
                borders.min.x + ((borders.max.x - borders.min.x)/2)
            ]
        }

        return res;
    })

    const highlightedClustersIDs = computed(()=>{
        let res = [];

        for (const key in clusters.value.clusters){
            if(clusters.value.clusters[key].wells.map(e => e['Ид_скважины']).some(e => highlightedWellsIDs.value.includes(e))){
                res.push(clusters.value.clusters[key].name)
            }
        }

        return res;
    })

//poly
    const polyAllList = ref([])

    const polyMapList = computed(()=>polyAllList.value.filter(e => e['Тип_объекта'] == "карта"))

    const polyList = computed(()=>polyAllList.value.filter(e => e['Тип_объекта'] == "полигон"))

    const polyListLoading = ref(false);

    const updatePolyMapList = (layer)=>{
        polyAllList.value = [];
        if(!layer)return;

        polyListLoading.value = true;
        getPolyMapList(layer, (res)=>{
            polyListLoading.value = false;
            polyAllList.value = res;
        })
    };

    const updatePolyMap = (obj, cb)=>{
        if(obj.map){
            return;
            cb();
        }

        obj.loading = true;

        getPolyMap(
            activeLayerDisplay.value['Пласт'], 
            obj['Тип_объекта'], 
            obj['Название_объекта'],
            (res)=>{
                obj.loading =false;
                if(res == "nopoly")return;
                
                obj.map = res;
                cb();
            }
        )
    }        

//syncScroll
    const syncScroll = ref(false);
    const currentScroll = ref(0);

    const minPadheight = computed(()=>
        activeWells.value.length?
        Math.min(...activeWells.value.map(e => e['Подошва_инкл'] || e['Подошва_fake'])):
        0
    );

    watch(syncScroll, (n)=>{
        if(n)currentScroll.value = 0;
    });

    watch(minPadheight, (n)=>{
        if(currentScroll.value < minPadheight.value)currentScroll.value = minPadheight.value;
    });

//layersScroll
    const scrollToLayerId = ref(0);

//heightScroll
    const scrollToheight = ref(0);


//--------------------------------------------
    return {
        map,
        mapObj,
        center,
        init,
        remove,

        isAbsoluteHeight,

        resize,

        objects,
        activeObject,
        objectsDropList,
        activeObjectDisplay,

        updateFields,
        activeField,
        fields,

        mapItemsLoaded,

        currentLayers,
        activeLayer,
        layers,
        activeLayerDisplay,

        areas,
        areasDropList,
        activeArea,
        activeAreaDisplay,
        
        wells,
        allWells,
        extendWell,
        updateWellStrat,

        activeWellsIDs,
        activeWells,
        switchActiveState,
        selectWells,
        activeWellsSwitch,
        highlightedWells,
        highlightedWellsIDs,

        clusters,
        highlightedClustersIDs,

        polyList,
        polyMapList,
        polyListLoading,
        updatePolyMapList,
        updatePolyMap,

        syncScroll,
        currentScroll,
        minPadheight,
        // primaryScroll,

        scrollToLayerId
    };
})