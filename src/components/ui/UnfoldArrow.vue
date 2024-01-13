<template>
    <div class="unfold-arrow">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="arrow">
            <path d="M10.8831 7.71143L7.58589 4.41421L9.0001 3L14.7114 8.71132L9.0001 14.4226L7.58589 13.0084L10.8829 9.71143H2.28878V7.71143L10.8831 7.71143Z" fill="black"/>
        </svg>
    </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .unfold-arrow{
        height: 33px;
        width: 33px;
        border: 1px solid var(--bg-border);
        border-radius: 4px;
        background: var(--c-white);
        @include flex-c;
        cursor: pointer;
        transition: .3s;

        &:hover{
            border-color: var(--bg-border-focus);
        }

        .arrow{
            transition: .3s;
            height: 17px;
            width: 17px;
        }

        &[direction="t"] .arrow{
            transform: rotate(-.25turn);
        }
        
        &[direction="r"] .arrow{
            transform: rotate(0turn);
        } 
        
        &[direction="b"] .arrow{
            transform: rotate(.25turn);
        }
        
        &[direction="l"] .arrow{
            transform: rotate(.5turn);
        }

        &:active{
            transition: 0s;
            background: var(--bg-secondary);
        }
        
    }
</style>