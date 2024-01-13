<template>
    <VModal 
        :title="subtitle" 
        ref="modal"
    >
        <h2>{{title}}</h2>

        <div class="map-modal-content">
            <slot/>
        </div>
    </VModal> 
</template>

<script setup>
    import { ref } from "vue";

    const props = defineProps({
        subtitle: String,
        title: String
    });

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
    .modal-wr:deep(.modal){
        .top{
            border-bottom-width: 0!important;
            padding-bottom: 0!important; 
            margin-bottom: -16px;
        }

        .modal-content{
            padding: 24px;
            padding-top: 0;

            @include flex-col;
            overflow: hidden;

            .map-modal-content{
                @include flex-col;
                overflow-y: auto;
                overflow-x: hidden;
            }
        }

        .input .content{
            padding: 0;
        }   
    }

    

    h2{
        font-size: 24px;
        color: var(--typo-primary);  
        margin-bottom: 15px;     
    }
</style>