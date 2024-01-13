<template>
    <div 
        class="prod-chart" 
        :drop="useCameraStore().chartsLoading || (drop && prod.productionDisplayMode == 1) || null"
        :photo-mode="useCameraStore().loading || null"
    >
        <div class="top">
            <UnfoldArrow class="arrow" :direction="drop?'b':'t'" @click="switchDrop" v-if="!useCameraStore().chartsLoading"/>
            <h4>Ключевые показатели разработки месторождения</h4>
        </div>

        <div class="chart-container">
            <div class="chart">
                <div class="title">
                    <h2>
                        {{
                            prod.productionDisplayMode == 0?(
                                map.activeAreaDisplay?
                                    `${map.activeArea?.['Название']}` + (map.activeObjectDisplay?` (${map.activeObjectDisplay['Объект']})`:''):
                                    `${map.activeField?.['Месторождение'] || 'Месторождение'}`
                                ): 
                                `${''/*map.activeArea?.['Название']*/}(${map.activeWells.map(e => e['Скважина'])})`
                        }}
                    </h2>
                    <!-- <VButton 
                        grey
                        v-if="map.activeWells.length && !useCameraStore().chartsLoading" 
                        @click="prod.productionDisplayMode = (prod.productionDisplayMode + 1) % 2"
                    >
                        {{prod.productionDisplayMode == 0?'Скважины':'Месторождение'}}
                    </VButton> -->
                </div>
                <div class="display" v-if="charts.length">
                    <ProdChartColumn v-for="(i,k) in visibleCharts" :chart="i" :key="k"/>
                    <ProdChartDisplay :charts="charts"/>
                </div>
                <div class="placeholder" v-else>
                    <p
                        v-if="
                        prod.productionDisplayMode == 0 && !prod.areaProductionLoading && !prod.objectsProductionLoading && !prod.fieldProductionLoading ||
                        prod.productionDisplayMode == 1 && !prod.wellsProductionLoading"
                    >
                        Данных не найдено
                    </p>
                    <p v-else>Загрузка...</p>
                </div>
            </div>
            <div class="legend" v-if="charts.length">
                <label v-for="(i,k) in charts" :key="k" class="checkbox">
                    <input type="checkbox" v-model="getChartByName(i.title).show">
                    <span></span>
                    <div class="line" :style="{background: i.color}"></div>
                    <div class="title">{{i.title}} ({{roundedVal(i.range[1], 1).text?roundedVal(i.range[1], 1).text+" ":''}}{{i.unit}})</div>
                </label>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref } from "vue";
    import { useMapStore } from "@/stores/map.js";
    import ProdChartDisplay from "@/components/prodChart/ProdChartDisplay.vue";
    import ProdChartColumn from "@/components/prodChart/ProdChartColumn.vue";

    import { useProductionStore } from '@/stores/production.js';
    import { useCameraStore } from '@/stores/camera.js';

    import { roundedVal } from '@/script/formatters.js';

    const prod = useProductionStore();
    const map = useMapStore();

    const drop = ref(true);   
    
    let resizeTimeout = null;

    const switchDrop = ()=>{
        drop.value = !drop.value;

        resizeTimeout = setInterval(()=>map.resize(),1);
        setTimeout(()=>clearInterval(resizeTimeout),300);
    }

    const charts = computed(()=>{
        const data = prod.productionDisplayMode == 0?(
            map.activeObjectDisplay?prod.objectsProduction:
            map.activeAreaDisplay?prod.areaProduction:
            prod.fieldProduction
        ):prod.wellsProduction;
        
        let res = JSON.parse(JSON.stringify(prod.productionVariables));

        res.forEach((e,k) => {
            e.chart = [];
            e.range = [0,0];
        })

        const days = (id)=> daysInMonth(`${data[id]['Год']}-${data[id]['Месяц']}`)

        data.forEach((e,k) => {
            res.forEach((j) => {
                if(
                    (prod.activeModeId == 0 && e['Месяц'] != 12) ||
                    (prod.activeModeId == 1 && e['Месяц'] != 3 && e['Месяц'] != 6 && e['Месяц'] != 9 && e['Месяц'] != 12)
                )return;
                let y = 0;

                if(!j.key.includes('qнэ_')){
                    if(prod.activeModeId == 0 && e['Месяц'] == 12){//год
                        let year = e['Год'];
                        for (var i = 0; i < 12; i++) {
                            if(
                                (k - i) < 0 || 
                                data[k-i]['Год'] != year
                            )break;
                            y += data[k-i][j.key] //* days(k-i);
                        }
                    }else if(prod.activeModeId == 1 && (e['Месяц'] == 3 || e['Месяц'] == 6 || e['Месяц'] == 9 || e['Месяц'] == 12)){//квартал
                        let start = parseInt(e['Месяц']);
                        let year = e['Год']
                        for (var i = 0; i < 3; i++) {
                            if(
                                (k - i) < 0 ||
                                data[k-i]['Год'] != year ||
                                data[k-i-1] && (
                                    start == 3 && (
                                        data[k-i]['Месяц'] != 3 &&
                                        data[k-i]['Месяц'] != 2 &&
                                        data[k-i]['Месяц'] != 1
                                    ) ||
                                    start == 6 && (
                                        data[k-i]['Месяц'] != 6 &&
                                        data[k-i]['Месяц'] != 5 &&
                                        data[k-i]['Месяц'] != 4
                                    ) ||
                                    start == 9 && (
                                        data[k-i]['Месяц'] != 9 &&
                                        data[k-i]['Месяц'] != 8 &&
                                        data[k-i]['Месяц'] != 7
                                    ) ||
                                    start == 12 && (
                                        data[k-i]['Месяц'] != 12 &&
                                        data[k-i]['Месяц'] != 11 &&
                                        data[k-i]['Месяц'] != 10
                                    )
                                )
                            )break;
                            y += data[k-i][j.key] //* days(k-i);
                        }
                    }else if(prod.activeModeId == 2){
                        y = e[j.key] //* days(k);
                    }

                    // console.log('!!', j.key, data[k]['Месяц'], data[k]['Год'], y);
                }else{
                    y = e[j.key] //* days(k);
                }

                

                j.chart.push({
                    x: `${e['Месяц'] < 10?`0${e['Месяц']}`:e['Месяц']}.${e['Год']}`,
                    y
                })
            })
        });

        res.forEach(e=> {
            let list = e.chart.map(j => j.y);
            e.range = [Math.min(...list), Math.max(...list)];
        })

        return res.filter(e => e?.chart?.length > 1);
    });

    const getChartByName = (name)=>prod.productionVariables.find(e => e.title == name)

    const visibleCharts = computed(()=>charts.value.filter(e=>e.show));

    const daysInMonth = (date)=> new Date(new Date(date).getYear(), new Date(date).getMonth() + 1, 0).getDate();
    
</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .prod-chart{
        background: var(--bg-secondary);
        height: 50px;
        transition: .3s;

        &[drop]{
            height: 340px;
        }

        .top{
            background: var(--bg-secondary);
            display: flex;
            gap: 20px;
            align-items: center;
            height: 50px;
            padding: 0 20px;

            h4{
                font-size: 14px;
            }
        }

        .chart-container{
            height: 290px;
            background: var(--bg-default);
            display: flex;
            gap: 3%;

            .chart{
                width: 100%;
                @include flex-col;
                min-width: 0;

                .title{
                    width: 100%;
                    align-items: center;
                    @include flex-c;
                    flex-shrink: 0;
                    height: 35px;
                    padding-left: 10px;

                    .btn{
                        height: 25px;
                        width: max-content;
                        padding: 0 10px;
                        font-size: 14px;
                    }

                    h2{
                        font-size: 12px;
                        font-weight: 700;
                        @include text-overflow;
                        padding: 0 10px;
                        width: 100%;
                        text-align: center;
                    }
                }

                .display{
                    height: calc(100% - 35px);
                    width: 100%;
                    //overflow: hidden;
                    margin-left: 20px;
                    display: flex;
                }

                .placeholder{
                    @include flex-c;
                    height: 100%;

                    p{
                        font-size: 12px;
                        font-weight: 700;
                    }
                }
            }

            .legend{
                width: 25%;
                max-width: max-content;
                margin-top: 35px;
                padding-bottom: 20px;
                overflow-y: auto;
                padding-right: 20px;
                
                @include flex-col;
                gap: 10px;

                label{
                    display: flex;
                    align-items: center;

                    .line{
                        width: 16px;
                        height: 2px;
                        background: orange;
                        flex-shrink: 0;
                    }

                    .title{
                        font-size: 14px;
                        @include text-overflow;
                        padding-left: 5px;
                    }

                    span{
                        &::before, &::after{
                            transform: translateY(2px);
                        }
                    }
                }   

                
            }
        }

        &[photo-mode]{
            :deep(.chart-container){
                .chart .display .label{
                    transform: rotate(-.25turn);
                    writing-mode: inherit;
                    text-overflow: clip;
                    overflow: visible;
                    @include flex-c;
                    margin-right: 13px;
                }
            }
        }
    }
</style>