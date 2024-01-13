<template>
    <div class="chart-wr">
        <div class="chart" ref="chartRef"></div>
    </div>
</template>

<script setup>
    import { round } from '@/script/formatters.js';

    import { useMapStore } from '@/stores/map.js';

    import Plotly from 'plotly.js-dist-min';

    import { onMounted, ref, watch, computed } from 'vue';

    import Camera from "@/stores/camera.js"

    const well = computed(()=>Camera().reportWell);

    const traj = computed(()=>well.value?.['Траектория']);

    const layers = computed(()=>{
        let arr = well.value?.['Стратиграфия'];

        if(!arr)return[];

        return arr.map(e => {
            return {
                top: e['Кровля'],
                height: (e['Подошва']||well.value['Подошва_инкл']||well.value['Подошва_fake']) - e['Кровля'],
                title: e['Пласт']?.['Пласт'] || `Пласт ${e['Ид_пласта']}`,
                id: e['Ид_пласта'],
                z: e.TVDSS,
                x: e['Поправка_x_кровля'],
                y: e['Поправка_y_кровля']
            }
        })
    })

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
                x: traj.value.map(e => e.X),
                y: traj.value.map(e => e.Y),
                z: traj.value.map(e => -e.Z),
                opacity: 1,
                line: {
                    width: 5,
                    color: 'var(--bg-border)',
                }
            }
        ]

        charts.push({
            type: 'scatter3d',
            mode: 'markers+text',
            // labels: lrs.map(e => e.title),
            text: layers.value.map(e => e.title),
            textposition: 'middle right',
            name: 'Пласты',
            x: layers.value.map(e => e.x),
            y: layers.value.map(e => e.y),
            z: layers.value.map(e => -e.z),
            opacity: 1,
            marker: {
                size: 5,
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
                    height: 400,
                    watch: 600,
                    margin: {
                        b: 0,
                        l: 0,
                        r: 0,
                        t: 0,
                    },
                    scene: {
                        camera: {
                            eye: rotate({ x: 1.3, y: 1.3, z: 0.3 }, -Math.PI / 4.5),
                            center: { x: 0.6, y: 0, z: 0 },
                        },
                    },

                },
                {
                    responsive: true
                }
            );
    }

    const rotate = (eye, angle)=>{
        const rtz = xyz2rtz(eye);
        rtz.t += angle;
        return rtz2xyz(rtz);
    }

    const xyz2rtz = (xyz)=>{
        return {
            r: Math.sqrt(xyz.x * xyz.x + xyz.y * xyz.y),
            t: Math.atan2(xyz.y, xyz.x),
            z: xyz.z,
        };
    }

    const rtz2xyz = (rtz)=>{
        return {
            x: rtz.r * Math.cos(rtz.t),
            y: rtz.r * Math.sin(rtz.t),
            z: rtz.z,
        };
    }

//getPhoto
    const getPhoto = (cb)=>{
        Plotly.toImage(
            chartRef.value, 
            {
                format: 'png', 
                height: 400, 
                width: 600,
                // imageDataOnly: true,
            }
        )
        .then(cb)
    }

    defineExpose({
        getPhoto
    });

//call
    onMounted(()=>{if(well.value)createChart()});
    watch(()=>well.value?.['Ид_скважины'], n => {if(n)createChart()});

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
        width: 100%;
        height: 100%;
        position: sticky;
        top: 0;
        right: 0;

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