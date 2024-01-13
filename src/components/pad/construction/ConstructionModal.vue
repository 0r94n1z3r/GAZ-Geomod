<template>
    <MapModal 
        :title="`Скважина ${info?.['Скважина'] || ''}`" 
        subtitle="конструкция скважины" 
        ref="modal"
        class="construction-modal"
    >
        <div class="loader-we" v-if="loading">
            <div class="loader">Загрузка...</div>
        </div>

        <template v-else>
            <ModalTabs
                :list="tabs"
                v-model="activeTab"
            />
            <Component class="constr-modal-content" :is="activeTab.component" :info="info"/>
        </template>
        
    </MapModal>
</template>

<script setup>
    import ModalTabs from "@/components/ui/ModalTabs.vue";

    import PDInfo from "./PDInfo.vue"
    import PDConstruction from "./PDConstruction.vue"

    import { getExportInfo } from '@/script/docs.js';

    import { ref, computed, watch } from 'vue';

//tabs
    const tabs = computed(()=>[
        {title: "Информация о конструкции скважины", component: PDInfo},
        {title: "Визуализация конструкции скважины", component: PDConstruction},
    ]);

    const activeTab = ref(tabs.value[0]);

//info
    const info = ref({});

//call
    const loading = ref(true);
    const modal = ref(null);

    const call = (id)=>{
        loading.value = true;

        getExportInfo(
            id,
            (res)=>{
                console.log(res)
                info.value = res;
                loading.value = false;
            }
        )
        
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
    @import "@/style/mixins.scss";

    .constr-modal-content{
        height: 100%;
        overflow-y: auto;
    }
</style>