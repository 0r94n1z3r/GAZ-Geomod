<template>
    <MapModal 
        subtitle="Оценка корректности картопостроения"
        :title="`${polyMap['Название_объекта']} ${map.activeLayer['Пласт']}`" 
        ref="modal"
    >
        <p class="loading" v-if="polyMap.loading">Загрузка...</p>
        <div v-else class="eval-modal-content">
            <div class="table">
                <table class="table-default">
                    <thead>
                        <tr>
                            <th
                                v-for="i in head"
                                :key="i.key"
                            >
                                <div class="th-wr">
                                    {{i.title}}
                                    <div 
                                        class="arrows" 
                                        v-if="i.hasSortby" 
                                        :sort-by="i.key == sortBy.key?sortBy.v:null"
                                        @click="setSortBy(i.key)"
                                    >
                                        <IDrop class="arr"/>
                                        <IDrop class="arr"/>
                                    </div>
                                    <div 
                                        class="filters-caller" 
                                        v-if="i.hasFilters"
                                        @click="switchFilters"
                                    >
                                        <IFilter class="ico"/>
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="filters-tr" v-show="filtersDrop">
                            <td>
                                <VTextInput 
                                    class="search" 
                                    v-model="search"
                                    :delay="600"
                                >
                                    <img class="ico" src="/img/search.svg">
                                </VTextInput>
                            </td>
                            <td></td>
                            <td></td>
                            <td>
                                <Slider
                                    v-if="fullDiffRange != null && !isNaN(fullDiffRange[0])"
                                    v-model="diffRange"
                                    :min="fullDiffRange[0]"
                                    :max="fullDiffRange[1]"
                                    showTooltip="focus"
                                    :style="{
                                        '--slider-connect-bg': 'var(--bg-border-focus)',
                                        '--slider-tooltip-bg': 'var(--bg-border-focus)',
                                        '--slider-handle-ring-color': 'transparent',
                                    }"
                                />
                            </td>
                        </tr>
                        <tr v-for="(i,k) in sortedEval" :key="k">
                            <td>{{i['Скважина']}}</td>
                            <td>{{Math.abs(i['Значение из БД'])}}</td>
                            <td>{{Math.abs(i['Значение с карты'])}}</td>
                            <td>{{i.diff}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="charts-wr">
                <apexchart height="500" width="500" :options="chartOptions" :series="series"></apexchart>
            </div>
        </div>
    </MapModal>
</template>
     
<script setup>
    import IDrop from "@/components/icons/IDrop.vue";
    import IFilter from "@/components/icons/IFilter.vue";
    
    import ModalTabs from "@/components/ui/ModalTabs.vue";

    import Slider from '@vueform/slider';
    import '@vueform/slider/themes/default.css';

    import { getMapEval } from "@/script/well.js";
    
    import { useMapStore } from "@/stores/map.js";

    import { ref, computed } from "vue";

    import { round } from '@/script/formatters.js';

    const map = useMapStore();

    const polyMap = ref({});

    const head = computed(()=>[
        {key: 'Скважина', title: 'Скважина', hasSortby: true, hasFilters: true},
        {key: 'Значение из БД', title: 'Значение из БД'},
        {key: 'Значение с карты', title: 'Значение с карты'},
        {key: 'diff', title: 'Разница', type: 'Float', hasSortby: true, hasFilters: true},
    ]);

    const sortBy = ref({key: head.value[0].key, v: 1});

    const setSortBy = (key)=>{
        if(sortBy.value.key == key){
            sortBy.value.v = (sortBy.value.v == 1)?-1:1;
        }else{
            sortBy.value = {key, v: 1};
        }
    }

// filters
    const filtersDrop = ref(false);

    const switchFilters = ()=>{
        if(filtersDrop.value){
            filtersDrop.value = false;
        }else{
            filtersDrop.value = true;
            search.value = '';
        }
    }

    const search = ref('');

    //range
        const fullDiffRange = computed(()=>{
            if(!polyMap.value?.eval || polyMap.value?.eval?.[0]?.diff == null)return null;
            
            let l = polyMap.value?.eval?.map(e => parseFloat(e.diff)).filter(e => Math.abs(e) != 9999900);

            let res = [
                Math.min(...l),
                Math.max(...l)
            ];

            if(!diffRange.value)diffRange.value = res;

            return res;
        });
        // const fullDiffRange = computed(()=>[-100, 100]);
        const diffRange = ref(fullDiffRange.value);

//filteredEval
    const hasPassedFilters = (well)=>
        !filtersDrop.value || 
        (
            well?.diff != null &&
            well?.['Скважина']?.toLowerCase().includes(search.value.toLowerCase()) &&
            well?.diff >= diffRange.value[0] &&
            well?.diff <= diffRange.value[1]
        )


    const filteredEval = computed(()=>polyMap.value?.eval?.filter(e => {
                e.diff = round(
                    Math.abs(e['Значение из БД']) - Math.abs(e['Значение с карты']),
                    4
                )

                return e['Значение из БД'] && 
                    e['Значение с карты'] && 
                    ![e['Значение из БД'], e['Значение с карты']].includes(9999900) &&
                    hasPassedFilters(e)
            }
        ) || 
        []
    ); 

    const sortedEval = computed(()=>{
        let type = head.value.find(e => e.key == sortBy.value.key)?.type || 'String';
        
        return JSON.parse(JSON.stringify(polyMap.value))?.eval?.
            filter(e => hasPassedFilters(e))?.
            sort((a,b)=>{
                let key = sortBy.value.key;
                let v = sortBy.value.v

                let A = a[key];
                let B = b[key];

                if(type == 'Float'){
                    A = parseFloat(A);
                    B = parseFloat(B);
                }

                if ( A < B ) return -1*v;
                if ( A > B ) return 1*v;
                return 0;
            }) || 
            []
    });

//map
    const points = computed(()=>filteredEval.value.map(e => [Math.abs(e['Значение из БД']) || 0, Math.abs(e['Значение с карты']) || 0]) || [[0,0]])

    const range = computed(()=>[
        Math.min(...points.value.flat().flat()),
        Math.max(...points.value.flat().flat())
    ])


    const series = computed(()=>
        [   
            {
                type: 'line',
                data: [
                    [range.value[0],range.value[0]],
                    [range.value[1],range.value[1]],
                ]
            },
            {
                type: 'scatter',
                name: "Значение с карты / Значение из БД",
                data: points.value
            },
        ]
    );

    const chartOptions =  computed(()=>{
        return {
            chart: {
                toolbar: {
                    tools: {zoom: false},
                    show: false,
                },
                
            },

            stroke: {
                width: [1, 1]
            },
            

            grid: {
                show: true,
                xaxis: {
                    lines: {
                        show: true
                    }
                },   
                yaxis: {
                    lines: {
                        show: true
                    }
                },  
            },

            colors: ['var(--bg-control-primary)', 'var(--bg-control-primary)'],
            
            plotOptions: {
                bar: {
                    horizontal: true,
                }
            },

            dataLabels: {
                enabled: true,
                offsetY: -6,
                style:{
                    colors: ['transparent', '#000'],
                    fontWeight: '300',
                },
                background: {
                    enabled: false
                },
                formatter: function (val, opts) {
                    if(!isFinite(val) || opts.seriesIndex == 0)return null;
                    return filteredEval.value?.[opts.dataPointIndex]?.['Скважина'];
                },
            },

            tooltip: {
                    shared: false,
                    intersect: true,
                    x: {
                        formatter(val, opts){
                            return 'Скважина '+filteredEval.value?.[opts.dataPointIndex]?.['Скважина'];
                        }
                    },
                    y: {
                        formatter(val, opts){
                            return `
                                ${Math.abs(filteredEval.value?.[opts.dataPointIndex]?.['Значение с карты'] || 0)}/
                                ${Math.abs(filteredEval.value?.[opts.dataPointIndex]?.['Значение из БД'] || 0)}
                            `
                            ;
                        }
                    }
            },

            xaxis: {
                tickAmount: 5,
                title: {
                    text: 'Значение из БД',
                    style: {
                        fontWeight: '300'
                    }
                },
                min: range.value[0],
                max: range.value[1],
                tooltip:{
                    enabled: false
                },
                crosshairs: {
                    show: false,
                },
                labels: {
                    formatter(e){
                        return e.toFixed(0);
                    }
                }
            },

            yaxis: {
                type: 'numeric',
                tickAmount: 5,
                title: {
                    text: 'Значение с карты',
                    offsetX: -4,
                    style: {
                        fontWeight: '300',
                    }
                },
                min: range.value[0],
                max: range.value[1],
                labels: {
                    formatter(e){
                        return e.toFixed(0);
                    }
                }
            },

            legend: {
                show: false,
            },

            markers: {
                size: [0, 4]
            }
        }
    });

//call
    const modal = ref(null);

    const call = (pm)=>{
        modal.value.call();

        polyMap.value = pm;

        if(!polyMap.value.eval){
            polyMap.value.loading = true;

            getMapEval(
                map.activeLayer['Ид_пласта'],
                polyMap.value['Название_объекта'],
                (res)=>{
                    polyMap.value.eval = res;
                    polyMap.value.loading = false;
                },
                ()=>{
                    polyMap.value.loading = false;
                }
            );
        }
    }

    const close = ()=>{
        modal.value.close();
    }

    defineExpose({
        call,
        close
    });
</script>

<style lang="scss" scoped>
    .eval-modal-content{
        overflow-y: auto;
        display: flex;
        gap: 70px;
        flex-direction: row;
        overflow: auto;
    }

    :deep(.modal){
        @include flex-col;
        min-height: 0;
    }

    .loading{
        color: var(--typo-secondary);
        font-size: 18px;
    }

    .charts-wr{
        position: sticky;
        top: 0;
        overflow: auto;
    }

    .th-wr{
        @include flex-jtf;
        gap: 10px;
        align-items: start;
        user-select: none;

        .arrows{
            @include flex-col;
            justify-content: center;
            gap: 3px;
            height: 20px;
            color: var(--typo-ghost);
            cursor: pointer;

            .arr{
                display: block;
                transition: .1s;
                opacity: .2;
                
                &:first-child{
                    transform: rotate(.5turn);
                }
            }

            &[sort-by="1"]{
                .arr:last-child{opacity: 1;}
            }
            &[sort-by="-1"]{
                .arr:first-child{opacity: 1;}
            }
        }
    }

    thead, .filters-tr{
        position: sticky;
        top: 0;
        background: var(--bg-default);
    }

    .filters-tr{
        top: 56px;
        border-bottom: 1px solid var(--bg-border-focus);
    }

    .filters-caller{
        cursor: pointer;
        color: var(--typo-ghost);
    }

    .search.input{
        width: 120px;

        .ico{
            padding: 2px 6px;
            height: 100%;
        }
    }

    
</style>