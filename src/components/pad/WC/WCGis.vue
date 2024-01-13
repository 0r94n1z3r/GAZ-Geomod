<template>
    <div class="gis">
        <div class="background">
            <div class="tile" :style="{height: `${4*stepH}px`}" v-for="(i,k) in Math.ceil(wellHeight/step/4 + 10)" :key="k" ></div>
        </div>

        <template v-for="(i,k) in proplastki">
            <div 
                v-if="i.sat"
                :key="k" 
                class="block"
                :style="{
                    height: `${i.height/step*stepH}px`, 
                    top: `${i.top/step*stepH}px`, 
                    background: layersColor(i.sat)
                }"
            >
                <div class="title">{{i.sat}}</div>
            </div>
        </template>
        

        <WellChartLine 
            v-for="(i,k) in activeCurves"
            :key="k"

            :curve="i"

            :stepH="stepH"
            :step="step"
            :wellHeight="wellHeight"

            :logarithmic="lg"

            class="chart-line"
        />

        <div class="call-lg"
            v-if="!lg"
            :style="{
                'padding-top': topHeight+5+'px',
                'margin-top': '-'+topHeight+'px',
            }"
        >
            <VButton grey fit @click="info.isLg = !info.isLg">
                lg
            </VButton>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue';
    import WellChartLine from '@/components/pad/WellChartLine.vue';

    const props = defineProps({
        info: Object,
        step: Number,
        stepH: Number,
        proplastki: Array,
        activeCurves: Array,
        lg: Boolean,
        topHeight: Number
    });

    const wellHeight = computed(()=>props.info?.['Подошва_инкл'] || props.info?.['Подошва_fake']);

    const layersColor = (color)=>{
        switch (color){
            case '3_КЛАСС': return '#BDBD04';
            case '2_КЛАСС': return '#E9E8AE';
            case '1_КЛАСС': return '#FBFAF5';
            case 'ПЛОТ': return '#646464';
            case 'ВЕРГАЗ': return '#9FFF60';
            case 'ВЕРНЕФТЬ': return '#B16363';
            case 'ВОДА': return '#80FFFF';
            case 'ВОДАНЕФ': return '#D76666';
            case 'ГАЗ': return '#FFFF00';
            case 'ГАЗВОДА': return '#9FFF60';
            case 'ГАЗНЕД': return '#FFFF80';
            case 'ГЖСМЕСЬ': return '#00FF80';
            case 'Н_О': return '#B3E3FF';
            case 'Н_О_ЗПС': return '#B3E3FF';
            case 'НЕФВОДА': return '#D6ADAD';
            case 'НЕФНЕД': return '#804040';
            case 'НЕФТЬ': return '#7D0000';
            case 'ПЕРВОДА': return '#80FFFF';
            case 'ПЕРГАЗ': return '#FFFF80';
            case 'ПРОД': return '#C0C0C0';
            case 'СЛАБГАЗ': return '#FFFFBB';
            case 'СЛАБНЕФ': return '#BB7777';
            case 'ПРОДВОДА': return '#B3E3FF';
            case 'Н_О_ВГАЗ': return '#B3E3FF';
            case 'ГАЗНЕФ': return '#B3E3FF';
            case 'ГАЗОКОН': return '#B3E3FF';
            case 'ПГЛОЩ': return '#B3E3FF';
            case 'ЖИДК': return '#B3E3FF';
            case 'ВОДАГАЗ': return '#B3E3FF';
            case 'СЛ ПОГЛ': return '#B3E3FF';
            case 'НЕОДНОЗН': return '#B3E3FF';
        }
    }
</script>

<style lang="scss" scoped>
    .gis{
        position: relative;

        .background{
            position: absolute;
            top: 0px;
            left: 0px;
            height: 100%;
            width: 100%;
            overflow: hidden;

            .tile{
                width: 100%;
                border-bottom: 1px solid var(--bg-border);
                @include flex-c;
                
                &::before{
                    @include pseudo;
                    width: 1px;
                    height: 100%;
                    border-left: 1px solid var(--bg-border);
                }
            }
        }

        .chart-line{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            pointer-events: none;
        }

        .block{
            position: absolute;
            width: 100%;
            left: 0;
            opacity: .7;

            .title{
                border: 1px solid var(--bg-border);
                font-size: 12px;
                color: var(--typo-ghost);
                background: var(--bg-default);
                border-radius: 3px;
                padding: 0 1px;
                width: max-content;
                opacity: .9;
            }

            &:hover{
                z-index: 1;
                opacity: .8;

                .title{
                    opacity: 1;
                }
            }
        }

        .call-lg{
            position: sticky;
            right: 0;
            top: 0;
            display: flex;
            justify-content: end;
            padding-right: 5px;

            .btn{
                min-height: unset;
                font-size: 14px;
                z-index: 10;
            }
        }
    }

    
</style>