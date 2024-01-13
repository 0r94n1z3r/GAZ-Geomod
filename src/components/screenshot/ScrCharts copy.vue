<template>
    <div class="src-charts-wr" ref="wr" :hide="!camera.chartsLoading || null">
        <WellChart class="well-chart" :info="activeChart" photo-chart @allLoaded="convertCharts"/>
    </div>
</template>

<script setup>
    import WellChart from "@/components/pad/WellChart.vue";
    import VProdChart from '@/components/prodChart/VProdChart.vue';

    import { useCameraStore } from '@/stores/camera.js';
    import { useMapStore } from  '@/stores/map.js';
    import { useProductionStore } from '@/stores/production.js';
    
    import { computed, onMounted, ref, watch } from '@vue/runtime-core';

    const map = useMapStore();
    const camera = useCameraStore();
    const prod = useProductionStore();

    const wr = ref(null);
    onMounted(()=>{
        camera.addZone('chart', wr.value);
    });

    const list = computed(()=>map.activeWells.slice(0,5));
    const activeChartId = ref(0);
    const activeChart = computed(()=>list.value[activeChartId.value]);

    const photoCharts = ref([]);

    const start = ref(false);

    const convertCharts = ()=>{
        if(!start.value)return;
        if(activeChart.value){
            setTimeout(
                ()=>{
                    camera.getPhoto(
                        'chart',
                        (base)=>{
                            photoCharts.value.push({
                                name: activeChart.value['Скважина'],
                                base: base.split(',')[1]
                            });
                            activeChartId.value++;

                            setTimeout(()=>{
                                if(!activeChart.value)fin();
                            })
                        },
                        {
                            width: wr.value.offsetWidth,
                            height: wr.value.offsetHeight,
                            x: 0,
                            y: 0,
                            noExit: true,
                        }
                    )
                }
            ,300)
        }else{
            fin();
        }
    }

    const fin = ()=>{
        camera.downloadCharts(photoCharts.value);
        activeChartId.value = 0;
        start.value = false;
    }

    watch(()=>camera.chartsLoading, (s)=>{
        if(s){
            photoCharts.value = [];
            activeChartId.value = 0;
            start.value = true;
            setTimeout(convertCharts);
        }
    });
    
</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .src-charts-wr{
        position: fixed;
        left: 0;
        top: 0;
        height: max-content;

        &[hide]{
            @include hidden(0);
        }
    }

    .well-chart{
        height: auto;
    }

    
</style>