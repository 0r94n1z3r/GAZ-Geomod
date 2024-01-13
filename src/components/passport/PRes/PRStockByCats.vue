<template>
    <div>
        <div v-for="ser in series" :key="ser.name">
            <h3>{{ser.name}}</h3>
            <apexchart type="bar" :height="ser.data.length * 22 + 100" :options="chartOptions(ser)" :series="[ser]"></apexchart>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed } from "vue";

    const props = defineProps({
        data: Object
    });


    const series = computed(()=>
        [
            getSeries(
                "Геологические запасы газа",
                "млн м³",
                'gasGeol'
            ),
            getSeries(
                "Извлекаемые запасы газа",
                "млн м³",
                'gasIzvl'
            ),
            getSeries(
                "Геологические запасы конденсата",
                "тыс т",
                'condGeol'
            ),
            getSeries(
                "Извлекаемые запасы конденсата",
                "тыс. т",
                'condIzvl'
            ),
            getSeries(
                "Геологические запасы нефти",
                "тыс. т",
                'oilGeol'
            ),
            getSeries(
                "Извлекаемые запасы нефти",
                "тыс. т",
                'oilIzvl'
            ),
            
        ]
    );

    const getSeries = (name, unit, key)=>{
        return { 
            name,
            unit,
            data: Object.values(props.data).map(e => 
                Object.values(e.cats).reduce((acc, cat)=>
                    cat.category.includes('+')?acc:((acc+(parseFloat(cat[key]) || 0))),
                    0
                )
            ),
            keys: Object.keys(props.data)
        }
    }

    const chartOptions = (ser)=>{
        return {
            chart: {
                type: 'bar',
                stacked: true,
                toolbar: {
                    show: false,
                },
            },
            
            plotOptions: {
                bar: {
                    horizontal: true,
                    dataLabels: {
                        position: 'bottom',
                        total: {
                            enabled: true,
                            offsetY: 9,
                            offsetX: 2,
                            style: {
                                fontSize: '13px',
                                fontWeight: '300'
                            }
                        }
                    },
                }
            },
            dataLabels: {
                enabled: false,
            },
            xaxis: {
                title: {
                    text: `${ser.name}, ${ser.unit}`,
                    style: {
                        fontWeight: '300'
                    }
                },
                categories: ser.keys,
            },
            yaxis: {
                title: {
                    text: 'Объект',
                    offsetX: 14,
                    style: {
                        fontWeight: '300',
                    }
                },
            }
        }
    };
</script>

<style lang="scss" scoped>
    h3{
        font-size: 18px;
        font-weight: 600;
        margin-bottom: -20px;
    }
</style>