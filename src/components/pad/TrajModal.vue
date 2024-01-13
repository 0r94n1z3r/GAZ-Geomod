<template>
    <VModal title="Траектория скважины" ref="modal">
        <div class="table-wr">
            <table>
                <thead>
                    <tr>
                        <th v-for="i in headers" :key="i">{{i}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(i,k) in traj" :key="k">
                        <td v-for="(j,f) in i" :key="f">
                            {{round(i[f],3)}}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="chart-wr">
            <div class="chart" ref="chartRef"></div>
        </div>
    </VModal>
</template>

<script setup>
    import VModal from '@/components/ui/VModal.vue';

    import { round } from '@/script/formatters.js';

    import { useMapStore } from '@/stores/map.js';

    import Plotly from 'plotly.js-dist-min';

    import { onMounted, ref, watch, computed } from 'vue';

    const props = defineProps({
        traj: Array,
        layers: Array,
    })

    const headers = ref(['Глубина', 'Угол', 'Азимут', 'X', 'Y', 'Z'])

//chart
    let chart = null;

    const chartRef = ref();

    const createChart = ()=>{
        if(chart)Plotly.purge(chart);

        let charts = [
            {
                type: 'scatter3d',
                mode: 'lines',
                name: 'Скважина',
                x: props.traj.map(e => e.X),
                y: props.traj.map(e => e.Y),
                z: props.traj.map(e => -e.Z),
                opacity: 1,
                line: {
                    width: 3,
                    color: 'var(--bg-border)',
                }
            }
        ]

        console.log(props.layers);

        charts.push({
            type: 'scatter3d',
            mode: 'markers+text',
            // labels: lrs.map(e => e.title),
            text: props.layers.map(e => e.title),
            textposition: 'middle right',
            name: 'Пласты',
            x: props.layers.map(e => e.x),
            y: props.layers.map(e => e.y),
            z: props.layers.map(e => -e.z),
            opacity: 1,
            marker: {
                size: 3,
                color: 'var(--c-yellow)',
            },
            textfont: {
                color: 'var(--c-yellow)',
            }
        })

        
        //chart
            chart = new Plotly.newPlot(
                chartRef.value, 
                charts,
                {
                    height: chartRef.value.clientHeight,
                    scene: {
                        aspectmode: 'data'
                    },
                    margin: {
                        b: 0,
                        l: 0,
                        r: 0,
                        t: 0,
                    },
                },
                {
                    responsive: true
                }
            );
    }

//call
    const modal = ref(null);

    const call = ()=>{
        modal.value.call();
        createChart();
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
    @import "@/style/mixins.scss";

    :deep(.modal){
        @include flex-col;

        .modal-content{
            display: flex;
            padding: 10px 24px;
            gap: 24px;
            overflow: auto;
            overflow-x: hidden;
        }
    }

    // :deep(.plotly){
    //     #scene{
    //         left: 0!important;
    //         top: 0!important;
    //         height: 100%!important;
    //         width: 100%!important;
    //     }
    // }

    .chart-wr{
        background: pink;
        width: 450px;
        position: sticky;
        top: 0;
        right: 0;

        min-height: calc(90vh - 60px - 20px);

        .chart{
            height: 100%;
        }
    }

    .table-wr{
        height: max-content;
    }

    table{
        border-collapse: collapse;
        
        // max-width: 1003px;

        th,td{
            border-right: 1px solid var(--bg-border);
        }

        thead{
            position: sticky;
            top: 0;
            left: 0;
            background: #fff;

            tr{
                border-bottom: 1px solid var(--typo-secondary);

                th{
                    font-weight: 400;
                    white-space: nowrap;
                    padding: 18.25px 12px;

                    &:first-child{
                        text-align: left;
                    }
                }
            }
        }

        tbody{
            tr{
                &:nth-child(2n){
                    background: var(--bg-control-ghost-hover);
                }

                td{
                    padding: 12px;
                }
            }
        }
    }

    
</style>