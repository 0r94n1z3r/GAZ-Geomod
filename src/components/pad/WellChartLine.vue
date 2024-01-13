<template>
    <Responsive class="chart-wr" :style="{height: wellHeight*stepH/step + 'px'}">
        <template #main="{ width, height }">
            <Chart
                class="chart"
                :size="{width, height}"
                :data="path"
                :axis="axis"
                direction="vertical"
            >
                <template #layers>
                    <Line :dataKeys="['depth',logarithmic?'XLog':'X']" class="line" :lineStyle="{ stroke: curve.color || '#32B4FF', 'strokeWidth': 1 }"/>
                </template>
            </Chart>
        </template>
    </Responsive>
</template>

<script setup>
    import { computed, onMounted, ref } from "vue";
    import { Chart, Grid, Line, Responsive } from 'vue3-charts'

    var props = defineProps({
        wellHeight: Number,
        stepH: Number,
        step: Number,

        logarithmic: Boolean,
        
        curve: Object,
    })

    // const tmpath = ref([]);

    // onMounted(()=>{
    //     for (let i = 0; i < props.wellHeight; i++) {
    //         tmpath.value.push({depth: i, X: props.curve[props.logarithmic?'rangeLog':'range'][1] * Math.random()});
    //     }
    // })

    const path = computed(()=>{
        let res = props.curve.path;

        if(props.curve.range[0]<0){
            res = res.map(e => {
                return {
                    X: e.X + Math.abs(props.curve.range[0]), 
                    XLog: e.XLog, 
                    depth: e.depth
                }
            })
        }

        if(props.curve.rangeLog[0]<0){
            res = res.map(e => {
                return {
                    X: e.X, 
                    XLog: e.XLog + Math.abs(props.curve.rangeLog[0]), 
                    depth: e.depth
                }
            })
        }

        return res;
    });

    const axis = computed(()=>{
        return {
            primary: { //Вертикаль
                domain: [0, props.wellHeight],
                type: 'linear',
                hide: true
            },
            secondary: { //Горизонталь
                domain: [
                    props.curve[props.logarithmic?'rangeLog':'range'][0]>=0?
                    props.curve[props.logarithmic?'rangeLog':'range'][0]:
                    0, 
                    props.curve[props.logarithmic?'rangeLog':'range'][0]>=0?
                    props.curve[props.logarithmic?'rangeLog':'range'][1]:
                    props.curve[props.logarithmic?'rangeLog':'range'][1] + Math.abs(props.curve[props.logarithmic?'rangeLog':'range'][0])
                ],
                type: 'linear',
                hide: true
            }
        }
    })
</script>

<style lang="scss" scoped>
    .chart-wr{
        width: 100%;
        padding: 0 3px;
    }

    :deep(.chart){

        circle{
             display: none;
        }
    }
</style>