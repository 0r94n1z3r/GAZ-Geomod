<template>
    <div class="switch-input">
        <div 
            class="tab"
            v-for="(i,k) in list"
            :key="k"
            @click="emit('update:modelValue', i)"
            :active="i.title == modelValue?.title || null"
        >
            {{i.title}}   
        </div>
    </div>
</template>

<script setup>
    const props = defineProps({
        list: Array,
        modelValue: Object
    });

    const emit = defineEmits(['update:modelValue']);
</script>

<style lang="scss" scoped>
    .switch-input{
        width: 100%;

        display: flex;

        border: 1px solid var(--bg-border);
        border-radius: 4px;
        overflow: hidden;

        background: var(--bg-default);
        width: max-content;

        .tab{
            min-height: 30px;
            text-align: center;
            padding: 0.2em 1em;
            cursor: pointer;
            @include flex-c;

            transition: .3s;

            &:hover{
                color: var(--typo-ghost);
            }

            &[active]{
                background: var(--bg-control-ghost);
                color: var(--typo-ghost);
            }
        }
    }
</style>