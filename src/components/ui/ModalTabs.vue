<template>
    <div class="modal-tabs">
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
    .modal-tabs{
        width: 100%;

        display: flex;
        gap: 12px;

        position: relative;

        margin-bottom: 20px;

        &::before{
            @include pseudo-absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 1px;
            background: var(--bg-border);
        }

        .tab{
            font-size: 16px;
            text-align: center;
            padding: 9.5px 0;
            cursor: pointer;
            position: relative;
            color: var(--typo-secondary);
            transition: .3s;

            &::before{
                @include pseudo-absolute;
                left: 0;
                bottom: 0;
                width: 100%;
                height: 2px;
                background: var(--bg-border);
                opacity: 0;
                transition: .3s;
            }

            &:hover::before{
                opacity: 1;
            }

            &[active]{
                color: var(--typo-primary);

                &::before{
                    opacity: 1;
                    background: var(--bg-control-primary);
                }
            }
        }
    }
</style>