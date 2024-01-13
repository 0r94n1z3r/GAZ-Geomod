<template>
    <div class="depth">
        <div class="segment" v-for="(i,k) in Math.ceil(wellHeight/step/4 + 10)" :key="k" :style="{height: `${4*stepH}px`, opacity: map.isAbsoluteHeight?.1:1}">
            <div class="num dash" @click="panToHeight(round(((i-1)*4)*step, 2))"><span>{{round(((i-1)*4)*step, 2)}}</span></div>
            <div class="dash" v-for="i in 3" :key="i"></div>
            <div></div>
        </div>

        <template v-for="(i,k) in absoluteHeights">
            <div class="absoluteDash" v-if="map.isAbsoluteHeight" :key="k" :style="{top: `${i['Глубина']*stepH/step}px`}">
                <div class="num">
                    {{round(i.Z, 2)}}
                    <!-- {{i['Глубина']}} -->
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
    import { useMapStore } from "@/stores/map.js";

    import { round } from '@/script/formatters.js';

    import { computed } from 'vue';

    const props = defineProps({
        info: Object,
        step: Number,
        stepH: Number
    });

    const map = useMapStore();

    const wellHeight = computed(()=>props.info?.['Подошва_инкл'] || props.info?.['Подошва_fake']);

    const absoluteHeights = computed(()=>
        props.info['Траектория'] && 
        props.info['Траектория'].map(e => {
            return {'Глубина': e['Глубина'], 'Z': e['Z']};
        }
    ))

    const panToHeight = (height)=>{
        map.scrollToheight = height;
    }
</script>

<style lang="scss" scoped>
    .depth{
        @include flex-col;
        position: relative;

        .segment{
            @include flex-col;
            justify-content: space-between;
            width: 100%;

            .dash{
                @include flex-jtf;
                align-items: center;
                height: 1px;
                width: 100%;

                &::before,
                &::after{
                    @include pseudo;
                    height: 1px;
                    width: 8px;
                    background: var(--bg-border);
                }
            }

            .num{
                cursor: pointer;

                &::before,
                &::after{
                    width: 12px;
                }

                span{
                    font-size: 12px;
                    font-weight: 700;
                    background: #fff;
                    padding: 0 4px;
                }
            }
        }

        .absoluteDash{
            position: absolute;
            left: 0;

            @include flex-jtf;
            align-items: center;
            height: 1px;
            width: 100%;
            color: var(--bg-border);

            .num{
                font-size: 12px;
                font-weight: 700;
                background: #fff;
                padding: 0 4px;
                color: orange;
                width: 100%;
                text-align: center;
            }

            

            &::before,
            &::after{
                @include pseudo;
                height: 1px;
                width: 12px;
                background: orange;
            }
        }
    }
</style>