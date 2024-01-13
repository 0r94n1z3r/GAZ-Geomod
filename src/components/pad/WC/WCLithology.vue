<template>
    <div class="lithology">
        <div 
            v-for="(i,k) in proplastki" 
            :key="k" 
            class="block"
            :style="{
                height: `${i.height/step*stepH}px`, 
                top: `${i.top/step*stepH}px`, 
                background: proplaskiColor(i.type)
            }"
        ></div>
    </div>
</template>

<script setup>
    import { computed } from 'vue';

    const props = defineProps({
        info: Object,
        step: Number,
        stepH: Number,
        proplastki: Array
    });

    const proplaskiColor = (color)=>{
        switch (color){
            case '1_Ханин':
                return '#FBFBF4'
            case '2_Ханин':
                return '#EFEFD9'
            case '3_Ханин':
                return '#E9E9AF'
            case '4_Ханин':
                return '#DADA50'
            case '5_Ханин':
                return '#BEBC05'
            case 'ГЛИНА':
                return '#800200'
            case 'НИЗКАЯ':
                return '#808040'
            case 'ОЧВЫСОК':
                return '#FFFFE1'
            case 'ПЕРЕСЛ':
                return '#008000'
            case 'ПЛОТ':
                return '#646464'
            case 'ПОНИЖ':
                return '#C6A639'
            case 'ВЫСОКОЕ':
                return '#FFFF80'
            case 'ПОВЫШ':
                return '#F7D240'
            case 'СРЕДНЕЕ':
                return '#E2B61D'
            case '3_КЛАСС':
                return '#BDBD04'
            case '2_КЛАСС':
                return '#E9E8AE'
            case '1_КЛАСС':
                return '#FBFAF5'
            case 'ПЛОТ':
                return '#646464'
            default:
                return '#B3E3FF'
        }
    }
</script>

<style lang="scss" scoped>
    .lithology{
        position: relative;

        .block{
            position: absolute;
            width: 100%;
            left: 0;                        
        }
    }
</style>