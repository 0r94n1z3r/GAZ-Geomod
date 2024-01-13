<template>
    <div class="src-report-wr">
        <div class="block column" ref='padRef'>
            <SRPad :info="Camera().reportWell" v-if="Camera().reportWell"/>
        </div>
        <div class="block square" ref='mapRef'>
            <SRMap/>
        </div>
        
        <div class="block chart" v-for="i in objs" :key="i.name">
            <Component :is="i.component" :ref="e => i.ref = e"/>
        </div>
    </div>
</template>

<script setup>
    import { onMounted, ref, watch, computed } from "vue";

    import SRPad from "./report/SRPad.vue";
    import SRMap from "./report/SRMap.vue";
    import SRTraj from "./report/SRTraj.vue";
    import SRDynamic from "./report/SRDynamic.vue";
    import SRDynamic2 from "./report/SRDynamic2.vue";

    import Camera from "@/stores/camera.js";


    const mapRef = ref();
    const padRef = ref();

    let objs = ref([
        {name: 'repTraj', component: SRTraj, ref: null},
        {name: 'repDynamic', component: SRDynamic, ref: null},
        {name: 'repDynamic2', component: SRDynamic2, ref: null},
    ])

    const trajRef = ref();
    const dynamicRef = ref();

    onMounted(()=>{
        Camera().addZone('repMap', mapRef.value);
        Camera().addZone('repPad', padRef.value);

        objs.value.forEach(e => {
            Camera().addZone(e.name, e.ref);
        });
    })
</script>

<style lang="scss" scoped>
    .src-report-wr{
        pointer-events: none;
        opacity: 0; //0
        position: fixed;
        top: 0;
        left: 0;
        z-index: 5;
        display: flex;
        height: max-content;

        .block{
            width: 600px;
            height: 600px;
        }

        .chart{
            height: 400px;
        }
        
        .column{
            height: 900px;
        }

    }
</style>