<template>
    <div class="design" >
        <template v-if="des">
            <div 
                class="perforation"
                v-for="(i,k) in des?.['Перфорация']"
                :key="k"
                :style="{
                    top: getTop(i['Кровля']),
                    height: getHeight(i['Кровля'], i['Подошва']), 
                    left: getLeft(leftColumn['Внеш_диам'])
                }"
            ></div>

            <div 
                class="concrete"
                v-for="(i,k) in des?.['Цементаж']"
                :key="k"
                :style="{
                    top: getTop(i['Кровля']),
                    height: getHeight(i['Кровля'], i['Подошва']), 
                    left: getLeft(leftColumn['Внеш_диам']),
                    background: getConcrete(i['Качество'])
                }"
            ></div>

            <!-- cols -->
            <div 
                class="col nkt" 
                v-for="(i,k) in des['НКТ']"
                :key="k"
                :style="{
                    top: getTop(i['Кровля']),
                    height: getHeight(i['Кровля'], i['Подошва']), 
                    left: getLeft(i['Внеш_диам'])
                }"
            >
                <p>НКТ (d{{i['Внеш_диам']}} мм)</p>
            </div>
            <div 
                class="col" 
                v-for="(i,k) in des['Колонны']"
                :key="k"
                :style="{
                    top: getTop(i['Кровля']),
                    height: getHeight(i['Кровля'], i['Подошва']),
                    left: getLeft(i['Внеш_диам'])
                }"
            >
                <p>{{i['Тип']}} (d{{i['Внеш_диам']}} мм)</p>
            </div>
        </template>
    </div>
</template>

<script setup>
    import { computed } from 'vue';
    import { sortByKey } from '@/script/formatters.js';

    const props = defineProps({
        info: Object,
        step: Number,
        stepH: Number,
    });

//
    const getTop = (top)=>`${(top||0)/(props.step||1)*props.stepH}px`;
    const getHeight = (top, bottom)=>`${((bottom||0) - (top||0))/(props.step||1)*props.stepH}px`;
    const getLeft = (left)=> (((left||0) - range.value[0]) / ((range.value[1] - range.value[0])||1)) * 100 + '%'

//
    const des = computed(() => 
        props.info?.['Конструкция']
    );

    const range = computed(() => {
        if(!des.value?.['Колонны'].length)return [0, des.value['НКТ'][0]['Внеш_диам']*1.25]

        return [
            0, 
            JSON.parse(JSON.stringify(des.value['Колонны'])).sort((a,b)=>sortByKey(a,b,'Внеш_диам',-1))[0]['Внеш_диам']*1.25
        ];
    });

    const leftColumn = computed(() => {
        if(!des.value?.['Колонны'].length)return des.value['НКТ'][0];
        return JSON.parse(JSON.stringify(des.value['Колонны'])).sort((a,b)=>sortByKey(a,b,'Внеш_диам'))[0];
    });

//
    const getConcrete = (type)=>{
        if(!type)return;
        type = type.replaceAll(' ', '');

        switch(type) {
            case 'ПЦЕМ': return '#808000';
            case 'ОТЦЕМ': return '#80FFFF';
            case 'ЧЦЕМ': return '#FF8040';
            case 'ЖЦЕМ': return '#804040';
        }
    }

    
</script>

<style lang="scss" scoped>
    .design{
        position: relative;

        .col{
            position: absolute;
            width: 1px;

            --color: var(--typo-primary);

            border-left: 1px solid var(--color);
            color: var(--color);

            p{
                font-size: 10px;
                white-space: nowrap;
                writing-mode: vertical-lr;
                transform: rotate(0.5turn);
                will-change: background;
            }

            &.nkt{
                --color: #FF0000;
            }

            &:hover{
                z-index: 2;

                p{
                    background: #fff;
                }
            }
        }

        .perforation{
            position: absolute;
            width: 8px;
            transform: translateX(-100%);
            background: url(/img/perf_pattern.svg);
        }

        .concrete{
            position: absolute;
            width: 8px;
        }
    }    
</style>