import { defineStore } from 'pinia';
import { ref, computed, reactive, watch, onMounted } from "vue";
import { getCookie, setCookie, deleteCookie } from '@/script/cookie.js';

import { getWellsProduction, getAreaProduction, getSeparateAreaProduction, getFieldProduction } from '@/script/well.js'

import { useMapStore } from './map.js'

export const useProductionStore = defineStore("production", ()=>{

    const map = useMapStore();

//time
    //mode
        const activeModeId = ref(0);
        const activeMode = computed(()=>modes.value[activeModeId.value]);

    //date
        const curDate = reactive({
            start: [new Date(0), new Date(0)],
            end: [new Date(0), new Date(0)]
        })

        const dateLen = computed(()=>{
            if(curDate.start[0].getTime() == curDate.end[0].getTime()){
                if(curDate.end[0].getTime() == 0){
                    return 0;
                }
                return 1;
            }
            return 2;
        })

        const dateToStrings = (date)=>{
            return{
                y: date.getUTCFullYear(),
                m: date.getUTCMonth() < 9?`0${date.getUTCMonth()+1}`:date.getUTCMonth()+1,
                d: date.getUTCDate() < 10?`0${date.getUTCDate()}`:date.getUTCDate()
            }
        }

        const dateString = computed(()=>{
            return {
                start:
                    activeModeId.value == 0?dateToStrings(curDate.start[0]).y:
                    `${dateToStrings(curDate.start[0]).m}.${dateToStrings(curDate.start[0]).y}`,
                end:
                    activeModeId.value == 0?dateToStrings(curDate.end[1]).y:
                    `${dateToStrings(curDate.end[1]).m}.${dateToStrings(curDate.end[1]).y}`
            }
        })

        const dateAPI = computed(()=>{
            let shiftedStartDate = new Date(curDate.start[0] - 2678400000);

            let date = {
                start: `${dateToStrings(shiftedStartDate).y}-${dateToStrings(shiftedStartDate).m}-${dateToStrings(shiftedStartDate).d}`,
                end: `${dateToStrings(curDate.end[1]).y}-${dateToStrings(curDate.end[1]).m}-${dateToStrings(curDate.end[1]).d}`
            }

            if(dateLen.value == 0)return null;
            if(dateLen.value == 1)return [null, date.end]
            //if(dateLen.value == 1)return null;
            return [date.start, date.end]
        })

        const bounds = (range) =>{
            if(
                curDate.start[0].getTime() == 0 && 
                curDate.end[1].getTime() == 0
            )return 0

            if(
                range[0] > curDate.start[0] &&
                range[1] < curDate.end[1]
            )return 1;
            
            if(
                range[0] <= curDate.start[0] &&
                range[1] >= curDate.start[0] ||
                range[0] <= curDate.end[1] &&
                range[1] >= curDate.end[1]
            ){
                return 2;
            }

            return 0
        }

        const setDate = (date)=>{
            if(dateLen.value == 2 || dateLen.value == 0){
                curDate.start = date;
                curDate.end = date;
            }else{
                if(date[1] > curDate.start[1]){
                    curDate.end = date;
                }else{
                    curDate.start = date;
                }
            }
        }

        const flushDate = ()=>{
            curDate.start = [new Date(0), new Date(0)];
            curDate.end = [new Date(0), new Date(0)];
        }
        
        //edit
            const editDate = reactive({
                activeModeId: 0,
                start: [new Date(0), new Date(0)],
                end: [new Date(0), new Date(0)]
            })

            const activeEditMode = computed(()=>modes.value[editDate.activeModeId]);

            //watch(()=>editDate.activeModeId, ()=>{modePage.value = 0; flushEditDate();});

            const modePage = ref(0);
            const modePageString = computed(()=>{
                if(editDate.activeModeId == 0){
                    return `${new Date().getFullYear() + 8 * (modePage.value - 1) } - ${new Date().getFullYear() + 8*modePage.value}`;
                }

                return new Date().getFullYear() + modePage.value;
                
            });
            const changePage = (num)=>{
                if((modePage.value + num) >= 0){
                    modePage.value = 0;
                    return;
                }

                modePage.value += num;
            }

            const modes = ref([
                {
                    title: 'Год',
                    mode: 'Year',
                    size: [3,3]
                },
                {
                    title: 'Квартал',
                    mode: 'Quarter',
                    size: [2,2],
                },
                {
                    title: 'Месяц',
                    mode: 'Month',
                    size: [3,4]
                }
            ])

            const typeById = (id)=>{
                const y = new Date().getFullYear()+modePage.value+'';

                const getPrevYear = (steps)=>{
                    return {
                        title: new Date(new Date().getFullYear()+ modePage.value*8 - steps + '').getFullYear(),
                        date: [
                            new Date(new Date().getFullYear()+ modePage.value*8 - steps + ''), 
                            new Date(new Date(new Date().getFullYear()+ modePage.value*8 - steps + 1 + '') - 100)
                        ]
                    }
                }

                switch (activeEditMode.value.mode){
                    case 'Year':
                        return getPrevYear(8-id);
                    case 'Quarter':
                        switch (id){
                            case 0: return {title: 'I', date: [new Date(new Date(y + '-01')), new Date(new Date(y + '-04') - 1)]};
                            case 1: return {title: 'II', date: [new Date(new Date(y + '-04')), new Date(new Date(y + '-07') - 1)]};
                            case 2: return {title: 'III', date: [new Date(new Date(y + '-07')), new Date(new Date(y + '-10') - 1)]};
                            case 3: return {title: 'IV', date: [new Date(new Date(y + '-10')), new Date(new Date(y + '-12'))]};
                        }
                    case 'Month':
                        switch (id){
                            case 0: return {title: 'Январь', date: [new Date(y + '-01'), new Date(new Date(y + '-02') - 100)]};
                            case 1: return {title: 'Февраль', date: [new Date(y + '-02'), new Date(new Date(y + '-03') - 100)]};
                            case 2: return {title: 'Март', date: [new Date(y + '-03'), new Date(new Date(y + '-04') - 100)]};
                            case 3: return {title: 'Апрель', date: [new Date(y + '-04'), new Date(new Date(y + '-05') - 100)]};
                            case 4: return {title: 'Май', date: [new Date(y + '-05'), new Date(new Date(y + '-06') - 100)]};
                            case 5: return {title: 'Июнь', date: [new Date(y + '-06'), new Date(new Date(y + '-07') - 100)]};
                            case 6: return {title: 'Июль', date: [new Date(y + '-07'), new Date(new Date(y + '-08') - 100)]};
                            case 7: return {title: 'Август', date: [new Date(y + '-08'), new Date(new Date(y + '-09') - 100)]};
                            case 8: return {title: 'Сентябрь', date: [new Date(y + '-09'), new Date(new Date(y + '-10') - 100)]};
                            case 9: return {title: 'Октябрь', date: [new Date(y + '-10'), new Date(new Date(y + '-11') - 100)]};
                            case 10: return {title: 'Ноябрь', date: [new Date(y + '-11'), new Date(new Date(y + '-12') - 100)]};
                            case 11: return {title: 'Декабрь', date: [new Date(y + '-12'), new Date(new Date(parseInt(y)+1+'') - 100)]};
                        }
                }
            }

            const syncEdit = ()=>{
                editDate.start = JSON.parse(JSON.stringify(curDate.start)).map(e => new Date(e));
                editDate.end = JSON.parse(JSON.stringify(curDate.end)).map(e => new Date(e));
                editDate.activeModeId = JSON.parse(JSON.stringify(activeModeId.value));
            }

            const syncActive = ()=>{
                activeModeId.value = editDate.activeModeId;
                setTimeout(()=>{
                    curDate.start = editDate.start;
                    curDate.end = editDate.end;
                })
            }

            // watch(curDate, syncEdit);

            const editDateLen = computed(()=>{
                if(editDate.start[0].getTime() == editDate.end[0].getTime()){
                    if(editDate.end[0].getTime() == 0){
                        return 0;
                    }
                    return 1;
                }
                return 2;
            })

            const setEditDate = (date)=>{
                if(editDateLen.value == 2 || editDateLen.value == 0){
                    editDate.start = date;
                    editDate.end = date;
                }else{
                    if(date[1] > editDate.start[1]){
                        editDate.end = date;
                    }else{
                        editDate.start = date;
                    }
                }
            }

            const editDateString = computed(()=>{
                return {
                    start:
                        editDate.activeModeId == 0?dateToStrings(editDate.start[0]).y:
                        `${dateToStrings(editDate.start[0]).m}.${dateToStrings(editDate.start[0]).y}`,
                    end:
                        editDate.activeModeId == 0?dateToStrings(editDate.end[1]).y:
                        `${dateToStrings(editDate.end[1]).m}.${dateToStrings(editDate.end[1]).y}`
                }
            })

            const editDateBounds = (range) =>{
                if(
                    editDate.start[0].getTime() == 0 && 
                    editDate.end[1].getTime() == 0
                )return 0
    
                if(
                    range[0] > editDate.start[0] &&
                    range[1] < editDate.end[1]
                )return 1;
                
                if(
                    range[0] <= editDate.start[0] &&
                    range[1] >= editDate.start[0] ||
                    range[0] <= editDate.end[1] &&
                    range[1] >= editDate.end[1]
                ){
                    return 2;
                }
    
                return 0
            }

            const flushEditDate = ()=>{
                editDate.start = [new Date(0), new Date(0)];
                editDate.end = [new Date(0), new Date(0)];
            }

        //empty
            const emptyDate = computed(()=>{
                //let prodObj = wellsProduction.value.length?wellsProduction.value[0]:areaProduction.value[0];
                let prodObj = productionDisplayMode.value == 0?(
                    map.activeObjectDisplay?objectsProduction.value[0]:
                    map.activeAreaDisplay?areaProduction.value[0]:
                    fieldProduction.value[0]
                ):wellsProduction.value[0];

                if(!prodObj)return curDate;
                
                let startTime = new Date(prodObj['Год'], prodObj['Месяц']);

                return {
                    start: [startTime, startTime],
                    end: [new Date(), new Date()]
                }
            })

            const emptyDateString = computed(()=>{
                return {
                    start:
                        activeModeId.value == 0?dateToStrings(emptyDate.value.start[0]).y:
                        `${dateToStrings(emptyDate.value.start[0]).m}.${dateToStrings(emptyDate.value.start[0]).y}`,
                    end:
                        activeModeId.value == 0?dateToStrings(emptyDate.value.end[1]).y:
                        `${dateToStrings(emptyDate.value.end[1]).m}.${dateToStrings(emptyDate.value.end[1]).y}`
                }
            });

//production
    const productionDisplayMode = ref(0);

    const productionVariables = ref([
        {
            title: 'Текущая добыча газа',
            color: '#00a6ff',
            key: 'Дебит_пласт_газа',
            show: true,
            unit: 'м куб.',
            ratio: 1000
        },
        {
            title: 'Накопленная добыча газа',
            color: '#0000EE',
            key: 'qнэ_пласт_газа',
            show: true,
            unit: 'м куб.',
            ratio: 1000
        },
        {
            title: 'Обводненность',
            color: 'orange',
            key: 'Обводненность',
            show: false,
            unit: '%'
        },
        {
            title: 'Пластовое давление',
            color: 'green',
            key: 'Р_пласт',
            show: false,
            unit: 'ата'
        },
        {
            title: 'Депрессия',
            color: 'red',
            key: 'Депрессия',
            show: false,
            unit: 'ата'
        },
    ]);

    const productionBubmbles = ref([
        {
            title: 'Газ',
            qkey: 'qнэ_пласт_газа',
            key: 'Дебит_пласт_газа',
            color: '#56B9F2',
            ratio: 1000,
            unit: 'м куб.'
        },
        {
            title: 'Нефть',
            qkey: 'qнэ_нефти',
            key: 'Дебит_нефти',
            color: '#EB5757',
            ratio: 1000,
            unit: 'м куб.'
        },
        {
            title: 'Конденсат',
            qkey: 'qнэ_нестаб_конденсата',
            key: 'Дебит_нестаб_конденсата',
            color: '#F38B00',
            ratio: 1000,
            unit: 'м куб.'
        },
        {
            title: 'Вода',
            qkey: 'qнэ_воды',
            key: 'Дебит_воды',
            color: '#FFFFFF',
            ratio: 1000,
            unit: 'м куб.'
        },
    ]);

    const daysInMonth = (date)=> new Date(new Date(date).getYear(), new Date(date).getMonth() + 1, 0).getDate();
    const days = (y,m)=> daysInMonth(new Date(`${y}-${m}`))

    const reRatioProduction = (prodArr)=>{
        productionVariables.value
        .filter(e => e.ratio)
        .forEach(e => {
            prodArr.forEach(i => {
                i[e.key] *= e.ratio;
            });
        });

        return prodArr;
    }

    const countAccum = (obj)=>{
        let prev = null;
        obj.forEach((e)=>{
            if(prev != null){
                Object.keys(e).forEach(k => {
                    if(k.includes('qнэ_')){
                        if(prev[k] > e[k]){
                            e[k] = prev[k];
                        }
                    }
                })
            }
            
            prev = e;
        })
    }

    //field
        const fieldProduction = ref([]);
        const fieldProductionLoading = ref(false);

        watch(()=>map.activeField, (obj)=>{
            if(obj)updateFieldProduction();
        })

        const updateFieldProduction = ()=>{
            productionDisplayMode.value = 0;
            fieldProductionLoading.value = true;

            updateAreaProduction();

            fieldProduction.value = [];
            loadFieldProduction();
        }

        const loadFieldProduction = ()=>{
            getFieldProduction(
                (res)=>{
                    fieldProduction.value = [];

                    fieldProductionLoading.value = false;

                    if(!res)return;

                    fieldProduction.value.push(...reRatioProduction(res));
                    countAccum(fieldProduction.value);
                }, 
                dateAPI.value
            )
        }

    //area
        const areaProduction = ref([]);
        const areaProductionLoading = ref(false);

        watch(()=>map.activeAreaDisplay, (obj)=>{
            if(obj)updateAreaProduction();
        })

        const updateAreaProduction = ()=>{
            productionDisplayMode.value = 0;
            areaProductionLoading.value = true;

            areaProduction.value = [];
            loadAreaProduction();

            updateWellsProduction();
            updateAllAreaProduction();
        }

        const loadAreaProduction = ()=>{
            if(!map.activeAreaDisplay)return;

            getAreaProduction(
                map.activeArea['Ид_участка'], 
                (res)=>{
                    areaProduction.value = [];

                    areaProduction.value.push(...reRatioProduction(res));
                    areaProductionLoading.value = false;
                    countAccum(areaProduction.value);
                }, 
                dateAPI.value
            )
        }

        const allAreaProduction = ref({});
        const updateAllAreaProduction = ()=>{
            allAreaProduction.value = {};

            if(!map.activeAreaDisplay)return;

            getSeparateAreaProduction(
                map.activeArea?.['Ид_участка'] || 1,
                (res)=>{
                    let arr = {};

                    let reRatKeys = productionBubmbles.value.filter(e => e.ratio);
                    console.log(reRatKeys);

                    Object.keys(res).forEach(key => {
                        arr[key] = res[key].sort((a,b)=>{
                            if ( new Date(a['Дата_раб_режима']) < new Date(b['Дата_раб_режима']) )return -1;
                            if ( new Date(a['Дата_раб_режима']) > new Date(b['Дата_раб_режима']) )return 1;
                            return 0;
                        });

                        arr[key].forEach(e => {
                            reRatKeys.forEach(k => {
                                e[k.key] *= k.ratio;
                                e[k.qkey] *= k.ratio;
                            })
                        });

                        countAccum(arr[key]);
                    })

                    allAreaProduction.value = arr;
                },
                dateAPI.value
            )
        }
    
    //wells
        const wellsProduction = ref([]);
        const wellsProductionLoading = ref(false);

        watch(()=>map.activeWellsIDs, (obj)=>{
            updateWellsProduction();
        })

        const updateWellsProduction = ()=>{
            //wellsProduction.value = [];
            wellsProductionLoading.value = true;

            if(!map.activeWellsIDs.length){
                productionDisplayMode.value = 0;
                return;
            }
            productionDisplayMode.value = 1;
            loadWellsProduction();
        }

        const loadWellsProduction = ()=>{
            getWellsProduction(
                map.activeWellsIDs,
                (res)=>{
                    wellsProduction.value = [];
                    wellsProduction.value.push(...reRatioProduction(res));
                    wellsProductionLoading.value = false;
                    countAccum(wellsProduction.value);
                }, 
                dateAPI.value
            )
        }

    //objects
        const objectsProduction = ref([]);
        const objectsProductionLoading = ref(false);

        watch(()=>map.activeObject, (obj)=>{
            objectsProduction.value = [];
            if(!map.activeObjectDisplay)return;
            updateObjectsProduction();
        })

        const updateObjectsProduction = ()=>{
            objectsProductionLoading.value = true;
            getWellsProduction(
                map.activeObjectDisplay?.['Объекты_по_скважине'].map(e => e["Ид_скважины"]),
                (res)=>{
                    objectsProduction.value.push(...reRatioProduction(res));
                    objectsProductionLoading.value = false;
                    countAccum(objectsProduction.value);
                },
                dateAPI.value
            )
        }

//--------------------------------------------------------------------
    return {
        //time
        activeModeId,
        activeMode,
        modes,
        typeById,

        modePage,
        modePageString,
        changePage,

        curDate,
        dateLen,
        dateString,
        bounds,
        setDate,
        flushDate,

        emptyDateString,

        editDate,
        activeEditMode,
        syncEdit,
        syncActive,
        editDateLen,
        setEditDate,
        editDateString,
        editDateBounds,
        flushEditDate,

        //charts
        
        productionDisplayMode,
        productionVariables,
        productionBubmbles,

        fieldProduction,
        fieldProductionLoading,
        updateFieldProduction,

        areaProduction,
        areaProductionLoading,
        updateAreaProduction,
        allAreaProduction,

        wellsProduction,
        wellsProductionLoading,
        updateWellsProduction,

        objectsProduction,
        objectsProductionLoading,
    };
})