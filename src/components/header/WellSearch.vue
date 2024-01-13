<template>
    <div class="v-search" v-click-outside="()=>{drop = false;}">
        <input type="text" ref="input" placeholder="Скважина" v-model="text" @click="drop = !drop;" @keydown.enter="list[0] && pickObject(list[0])">
        <img src="/img/search.svg" alt="" class="icon">
        <div class="drop shadow-block" v-if="list.length" :drop="drop || null">
            <div class="item" v-for="i,k in list" :key="k" @click="pickObject(i)">{{i['Скважина']}}</div>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref } from "vue";
    import vClickOutside from 'click-outside-vue3/src/v-click-outside';

    import { useMapStore } from '@/stores/map.js';

    const map = useMapStore();

    const input = ref(null);

    const pickObject = (obj)=>{
        map.selectWells([obj]);
        text.value = '';
        drop.value = false;
        input.value.blur();
        map.mapObj.setView([obj['Коорд_y'], obj['Коорд_x']], 16);
    };

    const list = computed(()=>{
        let wells = map.highlightedWells.length?map.highlightedWells:(map.wells.length?map.wells:map.allWells);
        return wells.filter(e => e['Скважина'].includes(text.value))
    });

    const text = ref('');

    const drop = ref(false);
</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .v-search{
        display: flex;
        align-items: center;
        position: relative;

        .icon{
            width: 16px;
            height: 16px;
            position: absolute;
            left: 11px;
            z-index: 6;
            pointer-events: none;
        }

        input{
            height: 32px;
            width: 130px;
            border-radius: 4px;
            border: 1px solid var(--bg-border);
            padding: 0 11px 0 33px;
            transition: .3s;
            z-index: 6;
            font-size: 14px;
            
            &::placeholder{
                color: var(--bg-border);
                transition: .3s;
            }

            &:focus{
                border-color: var(--bg-border-focus);
                    &::placeholder{
                    color: var(--bg-border-focus);
                }
            }
        }

        .drop{
            position: absolute;
            top: calc(100% - 2px);
            left: 0;
            width: 100%;
            max-height: 437px;
            overflow-y: auto;
            z-index: 5;
            border-radius: 0 0 4px 4px;
            border: 1px solid var(--bg-border);
            border-top: 0;
            padding: 10px 5px 5px 5px;
            transition: .3s;

            &:not([drop]){
                @include hidden(-10px);
            }

            .item{
                display: flex;
                font-size: 14px; 
                cursor: pointer;
                transition: .2s;
                border-radius: 4px;
                padding: 1px 10px;

                &:hover{
                    background: var(--bg-ghost)
                }

                .drop-arr{
                    @include flex-c;
                    height: 21px;
                    width: 25px;
                    cursor: pointer;
                }
            }
        }
    }
    
</style>