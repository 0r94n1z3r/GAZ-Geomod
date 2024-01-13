<template>
    <div class="chart-wr">
        <div class="header">
            <div class="title">
                <h2>Прогноз потенциала скважины</h2>
                <p>Индикаторная диаграмма (IPR)</p>
            </div>

            <SwitchInput :list="tabs" v-model="activeTab"/>
        </div>
        <apexchart height="500" :options="chartOptions" :series="series"></apexchart>
    </div>
</template>

<script setup>
    import { ref, computed } from "vue";

    import SwitchInput from "@/components/ui/SwitchInput.vue";

    const props = defineProps({
        list: Array 
    });

//tabs
    const tabs = ref([
        {title: 'Устьевое давление, МПа'},
        {title: 'Пластовое давление, МПа'},
    ])

    const activeTab = ref(tabs.value[0]);

    const range = computed(()=> {
        const xPadding = (Math.max(...props.list.flat().map(e => e[0])) - Math.min(...props.list.flat().map(e => e[0]))) * 0.1
        const yPadding = (Math.max(...props.list.flat().map(e => e[1])) - Math.min(...props.list.flat().map(e => e[1]))) * 0.1

        return {
            x: [Math.min(...props.list.flat().map(e => e[0])) - xPadding, Math.max(...props.list.flat().map(e => e[0])) + xPadding],
            y: [Math.min(...props.list.flat().map(e => e[1])) - yPadding, Math.max(...props.list.flat().map(e => e[1])) + yPadding],
        }
    })

//chart
    const series = computed(()=>
        props.list?.map(e => {
            return {
                type: 'line',
                data: e
            }
        })
    );

    const chartOptions =  computed(()=>{
        return {
            chart: {
                toolbar: {
                    tools: {zoom: false},
                    show: false,
                },
                animations: {
                    enabled: false
                }
            },

            stroke: {
                width: 1
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
                }
            },
            xaxis: {
                tickAmount: 5,
                title: {
                    text: 'Дебит, тыс. м куб./сут',
                    style: {
                        fontWeight: '300'
                    }
                },
                min: range.value.x[0],
                max: range.value.x[1],
            },
            yaxis: {
                type: 'numeric',
                tickAmount: 5,
                title: {
                    text: 'Давление, МПа',
                    offsetX: -4,
                    style: {
                        fontWeight: '300',
                    }
                },
                min: range.value.y[0],
                max: range.value.y[1],
            },
            legend: {
                show: false,
            },
            markers: {
                size: 4
            }
        }
    });

</script>

<style lang="scss" scoped>
    .chart-wr{
        padding: 22px 24px;
        border: 1px solid var(--bg-border);
        border-radius: 10px;
        height: max-content;

        .header{
            @include flex-jtf;
            align-items: center;
            gap: 20px;

            h2{
                font-size: 16px;
                font-weight: 600;
            }

            p{
                font-size: 14px;
                color: var(--typo-secondary);

            }
        }
    }
</style>