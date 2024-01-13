<template>
    <div class="select-wr" :drop="drop || null" v-click-outside="()=>{drop = false}">
        <div class="title" @click="drop = !drop">
            <img src="/img/download.svg" alt="" class="icon">
            <div class="text">Скачать</div>
            <div class="arrow"><IDrop class="ico"/></div>
        </div>

        <div class="drop shadow-block">
            <div v-for="i,k in list" :key="k" class="option" @click="init(i.func)">
                {{i.title}}
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from "vue";

    import vClickOutside from 'click-outside-vue3/src/v-click-outside';
    import IDrop from '@/components/icons/IDrop.vue';

    import { useCameraStore } from '@/stores/camera.js';
    const camera = useCameraStore();

    const getScreenShot = ()=>{
        camera.makePrintscreen();
    };

    const getMapShot = ()=>{
        camera.makeMapPhoto();
    };

    const getCharts = ()=>{
        camera.makeChartsPhotos()
    };

    const getBotCharts = ()=>{
        camera.makeBotChartsPhotos()
    };
    
    const list = ref([
        {title: "Весь экран", func: getScreenShot},
        {title: "Карту", func: getMapShot},
        // {title: "Геофизический планшет .zip", func: getCharts},
        {title: "Показатели разработки", func: getBotCharts},
    ])
    
    const drop = ref(false);

    const init = (func)=>{
        func();
        drop.value = false;
    }

    
</script>

<style lang="scss" scoped>

</style>