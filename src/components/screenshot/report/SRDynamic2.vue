<template>
    <div class="chart-wr">
        <div class="chart" ref="chartRef"></div>
    </div>
</template>

<script setup>
    import Camera from "@/stores/camera.js"

    import Plotly from 'plotly.js-dist-min';

    import { onMounted, ref, watch, computed } from 'vue';

    import Moment from 'moment';
    import { extendMoment } from 'moment-range';
    const moment = extendMoment(Moment);

    const well = computed(()=>Camera().reportWell);
    const data = computed(()=>Camera().reportData);

//chart
    let chart = null;

    const chartRef = ref();

    const createChart = ()=>{
        if(chart)Plotly.purge(chart);


        let charts = [];
        let dt = data.value['data_4_2']

        charts.push({
            type: 'scatter',
            name: 'Pпл',
            x: dt.map(e => e['Дата']),
            y: dt.map(e => e['Давление_пласт']),
            line: {
                width: 2,
                color: '#FF0000',
            }
        })
        
        charts.push({
            type: 'scatter',
            name: 'Pуст',
            x: dt.map(e => e['Дата']),
            y: dt.map(e => e['Давление_устье']),
            line: {
                width: 2,
                color: '#0000FF',
            }
        })

        console.log(charts);

        chart = new Plotly.newPlot(
                chartRef.value, 
                charts,
                {
                    showlegend: true,
                    legend: {
                        orientation: 'h',
                        y: -0.13
                    },
                    height: 400,
                    watch: 600,
                    margin: {
                        t: 0,
                        r: 0
                    },
                    xaxis: {
                        tickvals: getDates(dt.map(e => e['Дата'])),
                        ticktext: getDates(dt.map(e => e['Дата'])),
                        tickangle: 75
                    },
                    yaxis: {
                        title: 'Давлениеб МПа',
                        nticks: 10
                    },
                },
                {
                    responsive: true
                }
            );
    }

    const getDates = (datesArray)=>{
        datesArray = JSON.parse(JSON.stringify(datesArray));
        datesArray.sort();

        return Array.from(moment.range(datesArray[0], datesArray[datesArray.length - 1]).by('year')).map(m => m.format('YYYY'));
    }

    const getData = (data, key, isSum)=>{
        let dates = getDates(data.map(e => e['Дата']));
        
        let arr = dates.map(date => 
            data.filter(e => e['Дата'].includes(date))
        )

        if(isSum){
            return arr.map(e => e.reduce((acc, val)=>acc+val[key],0));
        }

        return arr.map(e => e[e.length - 1][key]);
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
</style>