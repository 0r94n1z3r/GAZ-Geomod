<template>
    <div>
        <div 
            class="wr" 
            ref="screen" 
            :map-photo="camera.mapPhotoLoading || null" 
            v-if="!camera.chartsLoading && !camera.botChartsLoading && !camera.reportLoading || null"
        >
            <VHeader class="header" v-if="!camera.mapPhotoLoading"/>
            
            <div class="content">
                <VPad class="pad-wr" v-if="!camera.mapPhotoLoading"/>

                <div class="container">
                    <VMap class="map"/>
                    <VProdChart class="prod-chart" v-if="!camera.mapPhotoLoading"/>
                </div>
            </div>

            <IntroModal ref="introModal" v-if="!camera.loading"/>
            <WellModal ref="wellModal" v-if="!camera.loading"/>
        </div>

        <ScrPlaceholder/>
        <ScrCharts/>
        <ScrBotCharts/>
        <ScrReport/>
    </div>
    
</template>

<script setup>
    import { onMounted, ref, watch } from "vue";

    import VHeader from "@/components/header/VHeader.vue";

    import VPad from "@/components/pad/VPad.vue";
    import VMap from "@/components/map/VMap.vue";
    import VProdChart from "@/components/prodChart/VProdChart.vue";

    import IntroModal from "@/components/IntroModal.vue";
    import WellModal from '@/components/wellModal/WellModal.vue';
    import { useCameraStore } from '@/stores/camera.js';

    import ScrPlaceholder from '@/components/screenshot/ScrPlaceholder.vue';
    import ScrCharts from '@/components/screenshot/ScrCharts.vue';
    import ScrBotCharts from '@/components/screenshot/ScrBotCharts.vue';
    import ScrReport from '@/components/screenshot/SrcReport.vue';
  

//introModal
    const introModal = ref(null);

    onMounted(()=>{
        introModal.value.call();
    })

//screenshot
    const camera = useCameraStore();
    const screen = ref(null);

    onMounted(()=>{
        camera.addZone('screen', screen.value)
    })
    
</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .wr{
        position: relative;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        @include flex-col;

        .header{
            flex-shrink: 0;
        }
        
        .content{
            height: 100%;
            display: flex;

            .container{
                width: 100%;
                height: 100%;
                min-width: 0;

                @include flex-col;

                .map{
                    height: 100%;
                }

                .prod-chart{
                    flex-shrink: 0;
                }
            }
        }
    }
</style>