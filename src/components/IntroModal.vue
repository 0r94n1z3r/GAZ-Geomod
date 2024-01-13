<template>
    <VModal title="Выбор месторождения и участка" ref="modal">
        <div class="drops">
            <FieldDrop class="select"/>
            <AreaDrop class="select"/>
        </div>

        <div class="btns">
            <VButton class="btn" @click="confirm">Выбрать</VButton>
        </div>
    </VModal>
</template>

<script setup>
    import VModal from '@/components/ui/VModal.vue';

    import AreaDrop from '@/components/header/AreaDrop.vue'
    import LayerDrop from '@/components/header/LayerDrop.vue'
    import FieldDrop from '@/components/header/FieldDrop.vue'
    
    import { ref } from 'vue';

    const confirm = ()=>{
        close();
    }

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
    .drops{
        padding: 30px 24px;
        border-bottom: 1px solid var(--bg-border);
        width: 520px;
        display: flex;
        gap: 20px;

        .select{
            min-width: 40%;
        }
    }

    .btns{
        display: flex;
        justify-content: end;
        padding: 15px 34px;

        .btn{
            width: max-content;
            padding: 0 20px;
            height: 40px;
        }
        
    }
</style>