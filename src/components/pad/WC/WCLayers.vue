<template>
    <div class="layer">
        <div 
            v-for="(i,k) in layers" 
            :key="k" 
            class="block"
            :style="{
                height: `${i.height/step*stepH}px`, 
                top: `${i.top/step*stepH}px`
            }"

            @click="emit('setScrollToLayer', i.id)"
        >
            <p>{{i.title}}</p>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue';

    const props = defineProps({
        info: Object,
        step: Number,
        stepH: Number,
        layers: Array
    });

    const emit = defineEmits(['setScrollToLayer']);
</script>

<style lang="scss" scoped>
    .layer{
        position: relative;

        .block{
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #D2E058;
            @include flex-c;
            padding: 7.5px 0;
            min-height: 0px;
            cursor: pointer;
            border: 1px solid #D2E058;
            transition: .1s;
            overflow: hidden;

            &:hover{
                border-color: #000;
            }

            p{
                writing-mode: vertical-lr;
                transform: rotate(.5turn);
                max-height: 100%;
                @include text-overflow;
                font-size: 14px;
                font-weight: 600;
            }
        }

        &[photo] .block p{
            writing-mode: unset;
            transform: rotate(-.25turn);
            overflow: visible;
        }
    }
    
</style>