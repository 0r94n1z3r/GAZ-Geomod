<template>
    <MapModal 
        subtitle="узловой анализ"
        :title="map.activeField?.dbName" 
        ref="modal"
    >
        <ModalTabs
            :list="tabs"
            v-model="activeTab"
        />

        <div class="nodes-content">
            <Component :is="activeTab.component"/>
            <NChart class="chart" :list="activeTab.list"/>
        </div>
    </MapModal>
</template>

<script setup>
    import { useMapStore } from "@/stores/map.js";

    import { ref, computed } from "vue";

    import ModalTabs from "@/components/ui/ModalTabs.vue";
    
    import NChart from "./NChart.vue";

    import NData from "./NData.vue";
    import NResult from "./NResult.vue";

    const map = useMapStore();

//tabs
    const tabs = computed(()=>[
        {title: "Загрузка данных", component: NData, list: [[[120, 568], [150, 255]]]},
        {title: "Сравнительный анализ", component: NResult, 
            list:
                [
                    [[120, 568], [150, 255]],
                    [[156, 215], [136, 400]],
                    [[320, 420], [480, 380]],
                    [[280, 300], [420, 480]],
                    [[200, 150], [300, 350]],
                    [[400, 380], [450, 200]],
                    [[180, 220], [260, 480]],
                    [[350, 300], [470, 420]],
                    [[160, 450], [240, 480]],
                    [[300, 160], [480, 300]]
                ]
        },
    ]);

    const activeTab = ref(tabs.value[0]);

//call
    const modal = ref(null);

    const call = ()=>{
        modal.value.call();
    }

    const close = ()=>{
        modal.value.close();
    }

    defineExpose({
        call,
        close
    });
</script>

<style lang="scss" scoped>
    .nodes-content{
        display: flex;
        gap: 54px;
        overflow-y: auto;
        overflow-y: auto;
    }

    :deep(.map-modal-content){
        display: flex;
        flex-direction: column;
    }

    .chart{
        margin-bottom: 20px;
        margin-right: 20px;
    }
</style>

