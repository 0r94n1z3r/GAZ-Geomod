<template>
    <div class="wr" :style="{'--c-y-axis': topChart?.color}">
        <Responsive class="chart-wr">
            <template #main="{ width, height }">
                <Chart
                    class="chart grid-chart"

                    :size="{width, height}"
                    :data="topChart?.chart || charts[charts.length-1].chart"
                    direction="horizontal"
                    
                    :margin="{top: 5, bottom: 5, left: 10, right: 10}"
                    :axis="axis(topChart || charts[charts.length-1])"
                >
                    <template #layers>
                        <Grid stroke="var(--bg-border)" strokeDasharray="0,0" stroke-opacity="1"/>
                        <Line :dataKeys="['x', 'y']" class="line" :lineStyle="{ stroke: 'transparent' }"/>
                    </template>
                </Chart>
            </template>
        </Responsive>

        <template v-for="(i,k) in charts">
            <Responsive class="chart-wr" :key="k" v-if="i.show">
                <template #main="{ width, height }">
                    <Chart
                        class="chart line-chart"

                        :size="{width, height}"
                        :data="i.chart"
                        direction="horizontal"
                        
                        :margin="{top: 5, bottom: 5, left: 10, right: 10}"
                        :axis="axis(i)"
                    >
                        
                        <template #layers>
                            <Line :dataKeys="['x', 'y']" class="line" :lineStyle="{ stroke: i.color }"/>
                        </template>
                    </Chart>
                </template>
            </Responsive>
        </template>
    </div>
</template>

<script setup>
    import { computed, onMounted, ref } from 'vue';
    import { Chart, Grid, Line, Responsive } from 'vue3-charts';

    import { useProductionStore } from '@/stores/production.js';

    const props = defineProps({
        charts: Array
    });

    const prod = useProductionStore();

    const axis = (chart)=>{
        let monCounter = 0;
        let validDate = chart.chart.filter((e,k,arr)=>{
            if(prod.activeModeId == 2 && arr.map(i => i.x.split('.')[1]).filter(i => i == e.x.split('.')[1]).length < 9)return false;

            let fut = arr[k+1];

            if(!fut)return true;

            if(e.x.split('.')[1] < fut.x.split('.')[1])return true;
        }).map(e => e.x);

        return {
            primary:{
                domain: ['dataMin', 'dataMax'],
                type: 'band',
                format: val => {
                    let date = val.split('.');

                    return (props.charts[0].chart.length<=24 && prod.activeModeId != 0)?
                            val:
                            validDate.includes(val)?(parseInt(date[1])+1):'';
                }
            },
            secondary: {
                domain: chart.range,
                type: 'linear',
                hide: true
            }
        }
    }

    const topChart = computed(()=>{
        for(var k in props.charts.reverse()){
            if(props.charts[k].show)return props.charts[k]
        }
        return null;
    })

</script>

<style lang="scss" scoped>
    .wr{
        position: relative;
        height: 100%;
        width: 100%;
    }

    .chart-wr{
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
    }

    :deep(.chart){

        circle{
            display: none;
        }

        &.line-chart{
            .axis{
                display: none;
            }
        }

        &.grid-chart{
            .layer-axis-y{
                color: var(--c-y-axis);
            }
        }

        
        .domain, .tick line{
            color: var(--bg-border);
        }
    }
</style>