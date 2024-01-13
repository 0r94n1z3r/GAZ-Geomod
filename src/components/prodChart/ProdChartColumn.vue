<template>
    <div class="column">
        <div class="label" 
            :style="{color: chart.color||'transparent'}">
            {{`${chart.title}, ${roundedVal(chart.range[1],1).text} ${chart.unit}` || null}}
        </div>
        <Responsive class="col-wr" :style="`--color: ${chart.color}`">
            <template #main="{ width, height }">
                <Chart
                    class="chart grid-chart"

                    :size="{width, height}"
                    :data="chart.chart"
                    direction="horizontal"
                    
                    :margin="{top: 5, bottom: 5}"
                    :axis="axis"
                >
                    <template #layers>
                        <Line :dataKeys="['x', 'y']" class="line" :lineStyle="{ stroke: 'transparent' }"/>
                    </template>
                </Chart>
            </template>
        </Responsive>
        <Responsive class="col-wr borders" :style="`--color: ${chart.color}`">
            <template #main="{ width, height }">
                <Chart
                    class="chart grid-chart"

                    :size="{width, height}"
                    :data="chart.chart"
                    direction="horizontal"
                    
                    :margin="{top: 5, bottom: 5}"
                    :axis="Baxis"
                >
                    <template #layers>
                        <Line :dataKeys="['x', 'y']" class="line" :lineStyle="{ stroke: 'transparent' }"/>
                    </template>
                </Chart>
            </template>
        </Responsive>
    </div>
</template>

<script setup>
    import { computed, onMounted, ref } from 'vue';
    import { Chart, Line, Responsive } from 'vue3-charts';

    import { roundedVal } from '@/script/formatters.js';

    const props = defineProps({
        chart: Object
    });

    const axis = computed(()=>{
        return {
            primary:{
                domain: ['dataMin', 'dataMax'],
                type: 'band',
            },
            secondary: {
                domain: props.chart.range, 
                type: 'linear',
                format: val => roundedVal(props.chart.range[1], val).value
            }
        }
    });

    const Baxis = computed(()=>{
        return {
            primary:{
                domain: ['dataMin', 'dataMax'],
                type: 'band',
            },
            secondary: {
                domain: props.chart.range, 
                ticks: 2,
                tickValues: props.chart.range.map(e => Math.round(e)),
                type: 'linear',
                format: val => roundedVal(props.chart.range[1], val).value
            }
        }
    });
</script>

<style lang="scss" scoped>
     @import '@/style/mixins.scss';

    .column{
        display: flex;
        position: relative;

        .label{
            @include text-overflow;
            writing-mode: vertical-lr;
            transform: rotate(0.5turn);
            padding-top: 20px;
            text-align: center;
            margin-right: 5px;
            font-weight: 600;
            font-size: 12px;
            width: 1.4em;
        } 

        .borders{
            position: absolute;
            right: 0;
            height: calc(100% + 1.0em);
            top: -0.5em;

            :deep(.layer-axis-y){

                .tick{
                    position: relative;
                    right: 0;

                    line{
                        opacity: 0;
                    }
                }
            }

            :deep(.domain){
                display: none;
            }
        }
    }

    .col-wr{
        width: 46px;
        padding-right: 5px;
        flex-shrink: 0;

        :deep(*){
            .tick{
                text{
                    fill: var(--color);
                }
            } 

            .layers,
            .layer-axis-x
            {
                display: none;
            }
        }
    }
</style>