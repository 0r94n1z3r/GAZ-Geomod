<template>
    <div class="modal-wr" :show="camera.loading || null" :opaque="camera.chartsLoading || camera.reportLoading || null">
        <div class="modal">
            <h2 v-if="camera.reportLoading">Создание документа<span v-for="i in dots" :key="i">.</span></h2>
            <h2 v-else>Создание фотографии<span v-for="i in dots" :key="i">.</span></h2>
            <p>Это может занять до 2 минут</p>
        </div>
    </div>
</template>

<script setup>
    import { useCameraStore } from '@/stores/camera.js';
    import { onMounted, ref, watch } from 'vue';
    
    var camera = useCameraStore();

    const dots = ref(3);

    // let ticker = null

    // watch(()=>camera.loading, ()=>{
    //     if(ticker)clearInterval(ticker);

    //     ticker = setInterval(()=>{
    //         console.log('+');
    //         dots.value = (dots.value + 1) % 4;
    //     },300);
    // })

</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .modal-wr{
        @include flex-c;
        background: rgba(0, 32, 51, 0.85);
        position: fixed;
        z-index: 1000;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        transition: .3s;

        .modal{
            background: var(--bg-default);
            border-radius: 4px;
            box-shadow: 0px 12px 28px 0px #0020331F;
            box-shadow: 0px 8px 8px 0px #0020330A;
            max-width: 90vw;
            max-height: 90vh;
            transition: .3s;
            padding: 10px 15px;

            h2,
            p{
                color: var(--typo-ghost);
            }
        }

        &:not([show]){
            @include hidden(0);

            .modal{
                @include hidden(-10px);
            }
        }

        &[opaque]{
            background: #264151;
        }
    }
</style>