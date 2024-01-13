<template>
    <div>
        <div v-for="ser in series" :key="ser.name">
            <h3>{{ser.name}}</h3>
            <div class="chart-wr">
                <apexchart type="donut" height="300" width="300" :options="chartOptions(ser)" :series="ser.data"></apexchart>
                <div class="content">
                    <div class="total">
                        <div class="num">
                            {{round(ser.data.reduce((acc, e) => acc+e, 0), 3, {splitThree: true})}}
                        </div>
                        <p>всего, {{ser.unit}}</p>
                    </div>
                    <div class="legend">
                        <div class="legend-block" v-for="(n, nk) in ser.data" :key="nk">
                            <div 
                                class="plaque"
                                :style="{'border-color': colors[nk]}"
                            >
                                <div class="num">{{round(n, 3, {splitThree: true})}}</div>
                                <p>{{ser.keys[nk]}}</p>
                            </div>
                            <div class="perc">
                                {{round(n / ser.data.reduce((acc, e) => acc+e, 0) * 100, 3)}}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed } from "vue";
    
    import { round } from "@/script/formatters.js";

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
                "тыс. т",
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

    const colors = ['#008ffb', '#00e396', '#feb019', '#ff4560', '#775dd0'];

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
                type: 'donut',
                toolbar: {
                    show: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            legend: {
                show: false,
            },
            labels: ser.keys
        }
    };
</script>

<style lang="scss" scoped>
    h3{
        font-size: 18px;
        font-weight: 600;
    }

    .chart-wr{
        display: flex;
        gap: 40px;
        align-items: center;
        margin: 8px 0 24px;

        .content{
            min-width: 0;

            .total{
                .num{
                    font-size: 32px;
                }

                p{
                    font-size: 18px;
                }
            }

            .legend{
                display: flex;
                width: 100%;
                overflow-x: auto;
                margin-top: 20px;
                gap: 16px;

                .legend-block{
                    max-width: 170px;
                    flex-shrink: 0;
                    min-width: 0;

                    .plaque{
                        border-left: 4px solid;
                        padding-left: 6px;

                        .num{
                            font-size: 18px;
                        }

                        p{
                            @include text-overflow;
                            font-size: 14px;
                            color: var(--typo-secondary);
                        }
                    }

                    .perc{
                        padding-left: 10px;
                        margin: 8px 0;
                        font-size: 18px;
                        color: var(--typo-secondary);
                    }
                }
            }
        }
    }
</style>