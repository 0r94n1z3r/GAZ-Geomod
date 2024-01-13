<template>
    <div class="btn" :loading="loading || null">
        <slot/>
    </div>
</template>

<script setup>
    const props = defineProps({
        loading: Boolean
    })
</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .btn{
        cursor: pointer;
        @include flex-c;
        height: 48px;
        width: 100%;
        background: var(--bg-control-primary);
        color: var(--c-white);
        border-radius: 4px;
        font-size: 16px;
        transition: .3s;
        gap: 10px;
        text-align: center;

        &:hover{
            background: var(--bg-control-primary-hover);
        }

        &:active{
            transition: 0.01s;
            background: var(--bg-control-primary);
        }

        &[loading]{
            pointer-events: none;
            animation: pulse .6s linear alternate infinite;
        }

        @include pulse-anim;

        &[hollow]{
            background: transparent;
            border: 1px solid var(--bg-control-primary);;
            color: var(--bg-control-primary);
            
            &:hover{
                border-color: var(--bg-control-primary-hover);;
                color: var(--bg-control-primary-hover);;
            }

            &:active{
                border-color: var(--bg-control-primary);
                color: var(--bg-control-primary);
            }
        }

        &[grey]{
            background: var(--bg-control-ghost-f);
            color: var(--typo-ghost);
            
            &:hover{
                background: var(--bg-control-ghost-hover);
            }

            &:active{
                background: var(--bg-control-ghost);
            }
        }

        &[fit]{
            height: auto;
            width: max-content;
            min-height: 32px;
            padding: 0.2em 1em;
        }
    }
</style>