<template>
    <div class="div" v-if="data">
        <ModalTabs
            :list="tabs"
            v-model="activeTab"
        />

        <div class="passport-content">
            <Component :is="activeTab.component" :data="rows"/>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed } from "vue";

    import ModalTabs from "@/components/ui/ModalTabs.vue";

    import PRTable from "./PRTable.vue";
    import PRStockByCats from "./PRStockByCats.vue";
    import PRStockByObjects from "./PRStockByObjects.vue";
    import PRFluid from "./PRFluid.vue";

    const props = defineProps({
        data: Object
    });

    //tabs
    const tabs = computed(()=>[
        {title: "Табличные данные", component: PRTable},
        {title: "Запасы по категориям", component: PRStockByCats},
        {title: "Запасы по объектам", component: PRStockByObjects},
        // {title: "Состав флюида", component: PRFluid},
    ]);

    const activeTab = ref(tabs.value[0]);

    const rows = computed(()=>
        props.data.gasReservesTable.reduce((acc, e)=>
        {   
            let name = e.poolProd;

            let obj = acc[name];

            if(!obj){
                acc[name] = {
                    cats: {
                        [e.category]: e
                    },
                    kik: e.kik,
                    kin: e.kin,
                };
                return acc;
            }

            obj.cats[e.category] = e;
            return acc;
        }, 
        {}
        )
    )
</script>

<style lang="scss" scoped>

</style>