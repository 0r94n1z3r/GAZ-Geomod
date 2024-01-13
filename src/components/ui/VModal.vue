<template>
    <div class="modal-wr" :show="show || null" @mousedown.self="close">
        <div class="modal">
            <div class="top">
                <div class="top-content">
                    <h2>{{title}}</h2>
                    <slot name="header"/>
                </div>
                <div class="close-container">
                    <div class="cross-wr" @click="close">
                        <ICross class="cross"/>
                    </div>
                </div>
                
            </div>

            <div class="modal-content">
                <slot/>
            </div>
        </div>
    </div>
</template>

<script setup>
    import ICross from '@/components/icons/ICross.vue';
    import { ref } from 'vue';

    const props = defineProps({
        title: String
    });

    const emit = defineEmits(['close']);

//call
    const show = ref(false);

    const call = ()=>{
        show.value = true;
    }

    const close = ()=>{
        emit('close');
        show.value = false;
    }

    defineExpose({
        call,
        close
    });
</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .modal-wr{
        @include flex-c;
        background: rgba(0, 32, 51, 0.85);
        position: fixed;
        z-index: 1000;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        transition: .3s;

        .modal{
            background: var(--bg-default);
            border-radius: 4px;
            box-shadow: 0px 12px 28px 0px #0020331F;
            box-shadow: 0px 8px 8px 0px #0020330A;
            max-width: 90vw;
            max-height: 90vh;
            transition: .3s;
            @include flex-col;

            .top{
                padding: 10px 10px 10px 24px;
                border-bottom: 1px solid var(--bg-border  );
                min-height: 60px;
                display: flex;

                &-content{
                    @include flex-jtf;
                    width: 100%;
                    gap: 20px;
                    align-items: flex-start;

                    h2{
                        font-size: 14px;
                        font-weight: 400;
                        display: flex;
                        align-items: center;
                        min-height: 50px;
                        text-transform: uppercase;
                        color: var(--typo-secondary);
                    }
                }

                .close-container{
                    @include flex-c;
                    height: 50px;
                    width: 50px;
                }
            }

            
        }

        &:not([show]){
            @include hidden(0);

            .modal{
                @include hidden(-10px);
            }
        }
    }

    .cross-wr{
        @include flex-c;
        cursor: pointer;
        position: relative;
        transition: .3s;
        width: 30px;
        height: 30px;
        border-radius: 50%;

        .cross{
            color: var(--c-icon-button);
            height: 12px;
            width: 12px;
            transition: .3s;
        }

        &::before{
            @include pseudo-absolute;
            height: 100%;
            width: 100%;
            border-radius: 50%;
            transition: .3s;
        }

        &:hover{
            &::before{
                background: var(--bg-ghost);
            }

            .cross{
                color: var(--bg-border-focus);
            }
        }

        &:active{
            &::before{
                transition: 0s;
                background: var(--bg-border);
            }
        }


    }
</style>