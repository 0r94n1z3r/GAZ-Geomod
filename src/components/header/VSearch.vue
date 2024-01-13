<template>
    <div class="v-search" v-click-outside="()=>{drop = false;}" @click="drop = true;">
        <input type="text" placeholder="Объекты разработки" v-model="text">
        <img src="/img/search.svg" alt="" class="icon">
        <div class="drop shadow-block" :drop="drop || null">
            <div class="item" v-for="i,k in displayTree" :key="k" @click="pickObject(i)">{{i['Объект']}}</div>
            <!-- <SearchBranch v-for="i,k in tree" :key="k" :obj="i"/> -->
        </div>
    </div>
</template>

<script setup>
    import { computed, ref } from "vue";
    import SearchBranch from './SearchBranch.vue';
    import vClickOutside from 'click-outside-vue3/src/v-click-outside';

    import { useMapStore } from '@/stores/map.js';

    const map = useMapStore();

    const tree = computed(()=>map.objects || []);

    const text = ref('');

    const displayTree = computed(()=>
        tree.value.filter(e => e['Объект'].toLowerCase().includes(text.value.toLowerCase()))
    )

    const pickObject = (obj)=>{
        setTimeout(()=>drop.value = false);
        text.value = '';

        let list = [];

        obj['Объекты_по_скважине'].forEach(e => {
            list.push(e['Скважина']);
        });

        map.selectWells(list);
    }

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
        }

        input{
            height: 40px;
            width: 250px;
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