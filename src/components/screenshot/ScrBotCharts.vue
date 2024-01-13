<template>
    <div class="src-charts-wr" ref="wr" :hide="!camera.botChartsLoading || null">
        <VProdChart class="prod-chart"/>
    </div>
</template>

<script setup>
    import VProdChart from '@/components/prodChart/VProdChart.vue';
    
    import { computed, onMounted, ref, watch } from '@vue/runtime-core';
    
    import { useCameraStore } from '@/stores/camera.js';

    const camera = useCameraStore();

    const wr = ref(null);
    onMounted(()=>{
        camera.addZone('botChart', wr.value);
    });
</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .src-charts-wr{
        position: fixed;
        left: 0;
        top: 0;
        height: max-content;

        &[hide]{
            @include hidden(0);
        }
    }

    .prod-chart{
        width: calc(100vw - 17px);
    }
</style>