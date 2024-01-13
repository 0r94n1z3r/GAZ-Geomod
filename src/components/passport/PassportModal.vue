<template>
    <MapModal 
        subtitle="ПАСПОРТ МЕСТОРОЖДЕНИЯ"
        :title="map.activeField?.dbName" 
        ref="modal"
    >
        
        <div class="loader" v-if="!data">
            <img class="spinner" src="/img/spinner.svg" alt="">
        </div>

        <template v-else>
            <!-- <h2>Начальные запасы газа</h2> -->
            <data class="data-wr">
                <PRes :data="data"/>
            </data>
        </template>

        <div class="caption">
            Информация, в том числе её структура, для паспорта месторождения предоставляется Заказчиком (ООО “Газпром недра”)
        </div>
    </MapModal>
</template>
     
<script setup>
    import PRes from "./PRes/PRes.vue";

    import { useMapStore } from "@/stores/map.js";
    import { getPassport } from "@/script/passport.js";

    import { ref, computed } from "vue";

    const map = useMapStore();

    const data = ref();

//call
    const modal = ref(null);

    const call = ()=>{
        modal.value.call();

        data.value = null;
        getPassport(
            (res)=>{
                data.value = res[0]; 
            }
        );
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
    .passport-content{
        width: 1200px;

        :deep(h2){
            font-size: 18px;
            color: var(--typo-primary);
            margin-bottom: 10px;
        }
    }

    .caption{
        width: 100%;
        text-align: center;
        font-style: italic;
        padding: 20px;
        padding-bottom: 0;
    }

    h2{
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
    }

    .data-wr{
        // padding: 0 20px;
    }

    :deep(.passport-table){
        border-collapse: collapse;
        font-size: 16px;
        width: 100%;
        margin-bottom: 8px;

        th{
            border: 1px solid var(--bg-border);
            background: var(--bg-ghost);
            padding: 16px;
            font-weight: 600;
        }
        
        tr{
            border-bottom: 1px solid var(--bg-border);
        }

        td{
            padding: 16px;
            background: var(--bg-default);
        }

        td, thead tr:first-child th{
            &:first-child{
                white-space: nowrap;
                position: sticky;
                left: 0;
            }
        }
    }
</style>