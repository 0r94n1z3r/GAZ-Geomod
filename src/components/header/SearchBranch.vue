<template>
    <div class="branch" :drop="drop || null">
        <div class="caller">
            <div class="drop-arr" v-if="obj.sub" @click="drop = !drop">
                <img src="/img/listArrow.svg" alt="">
            </div>
            <div class="drop-arr" v-else></div>
            {{obj.name}}
        </div>

        <div class="drop" v-if="obj.sub">
            <SearchBranch v-for="i,k in obj.sub" :key="k" :obj="i"/>
        </div>
    </div>
    
</template>

<script setup>
    import { ref } from 'vue';
    import SearchBranch from './SearchBranch.vue';

    const props = defineProps({
        obj: Object
    });

    const drop = ref(false);
</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .branch{
        padding-left: 16px;

        .caller{
            display: flex;
            font-size: 14px; 
            cursor: pointer;
            transition: .2s;
            border-radius: 4px;

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

        &:not([drop]){
            .drop{
                height: 0;
                overflow: hidden;
            }

            .drop-arr{
                transform: rotate(-.25turn);
            }
        }
        
    }
</style>