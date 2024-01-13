<template>
    <VModal :title="`Сводная информация по скважине ${object.info['Скважина']}`" class="well-modal" ref="modal" @close="object.close()">
        <template #header>
            <AllWellsSearch v-model="object.info"/>
        </template>

        <div class="lists">
            <div class="list" v-for="(l,k) in lists" :key="k">
                <div class="item" v-for="(i,f) in l" :key="f" :drop="i.drop || null">
                    <div 
                        class="top"
                        @click="itemClickHandler(i)"
                    >
                        <img src="/img/listArrow.svg" alt="" class="drop-arr">
                        <div class="title">{{i.title}}</div>
                    </div>
                    <div class="drop">
                        <div 
                            class="option" 

                            v-for="(m,n) in i.docs?.list || []" 
                            :key="n"

                            @click="optionClickHandler(m)"
                        >   
                            <img v-if="m.loading" src="/img/spinner.svg" alt="" >
                            <img v-else src="/img/download.svg" alt="" >
                            <div class="title">{{m['Комментарий']}} [{{m['Файл']}}]</div>
                        </div>
                        <div class="loader" v-if="i.docs?.loading">
                            <div class="sign">Загрузка...</div>
                        </div>
                        <div class="no" v-else-if="!i.docs?.list.length">
                            Нет файлов этого типа
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </VModal>
</template>

<script setup>
    import { ref, watch } from 'vue';

    import { getDocsList, downloadDoc } from '@/script/docs.js';

    import VModal from '@/components/ui/VModal.vue';

    import AreaDrop from '@/components/header/AreaDrop.vue'
    import LayerDrop from '@/components/header/LayerDrop.vue'
    
    import AllWellsSearch from "@/components/wellModal/AllWellsSearch.vue"

    import { useWellModalStore } from '@/stores/wellModal.js';
    
    const object = useWellModalStore();

    const lists = ref([
        [
            {title: 'Дело скважин', request: "documentsCaseWells"},
            {title: 'Документы ГРП', request: "documentsGRP"},
            // {title: 'Заголовки las', request: "headersLas"}
        ],
        [
            {title: 'Документы скважин', request: "documentsGIS"},
            {title: 'Документы КРС', request: "documentsKRS"}
        ]
    ])

//refresh
    const refresh = ()=>{
        lists.value.forEach(l => {
            l.forEach(e => {
                e.docs =  {
                    list: [],
                    loading: true
                };

                e.drop = false;
            })
        })
    }

    watch(()=>object.info, refresh);

//drop
    const itemClickHandler = (item)=>{
        item.drop = !item.drop;

        if(!item.docs.list.length){
            getDocsList(
                item.request,
                object.info['Ид_скважины'],
                (res)=>{
                    item.docs.loading = false;
                    item.docs.list = res.filter(e => e['Файл']);
                }
            );
        }
    }

//file
    const optionClickHandler = (item)=>{
        item.loading = true;

        downloadDoc(item['Файл'], res=>{
            item.loading = false;
        })
    }

//call
    watch(()=>object.isCalled, (q)=>{
        if(q){
            call();
        }else{
            close();
        }
    })

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
    @import '@/style/mixins.scss';

    .well-modal :deep(.modal-content){
        overflow: auto;
    }

    .lists{
        padding: 24px;
        padding-right: 16px;
        width: 700px;
        display: flex;

        .list{
            width: 50%;

            .item{
                

                .top{
                    display: flex;
                    gap: 18px;
                    cursor: pointer;
                    padding: 12px 18px;

                    .title{
                        font-size: 16px;
                        @include text-overflow;
                    }

                    .drop-arr{
                        transition: .3s;
                    }

                    
                }

                .drop{
                    overflow: hidden;

                    .option{
                        display: flex;
                        align-items: baseline;
                        gap: 18px;
                        cursor: pointer;
                        padding: 12px 18px;
                        color: var(--c-dark);

                        &:hover{
                            text-decoration: underline;
                        }

                        img{
                            height: .9em;
                            width: .9em;
                            flex-shrink: 0;
                            object-fit: contain;
                        }
                    }

                    .loader{
                        @include flex-c;
                        padding: 12px 18px;

                        .sign{
                            color: var(--typo-secondary);
                        }

                        @include pulse-anim;

                        &[show]{
                            animation: pulse .8s linear alternate infinite;
                        }
                    }

                    .no{
                        padding: 12px 18px;
                    }
                    
                }

                &[drop]{
                    .top .drop-arr{
                        transform: rotate(.5turn);
                    }
                }

                &:not([drop]){
                    .drop{
                        height: 0;
                    }
                }

                
                
            }

            &:nth-child(1){
                .item:nth-child(2n+1){
                    background: #0020330D;
                }
            }
            
            &:nth-child(2){
                .item:nth-child(2n){
                    background: #0020330D;
                }
            }
        }
    }

    :deep(.content){
        overflow-y: scroll;
        max-height: calc(90vh - 71px);
    }
</style>