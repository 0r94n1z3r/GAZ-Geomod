<template>
    <div class="select-wr" :drop="drop || null" v-click-outside="()=>{drop = false}">
        <div class="title" @click="drop = !drop" v-if="!isloading">
            <div class="text">{{keyName?modelValue?.[keyName]:modelValue}}</div>
            <div class="arrow"><IDrop class="ico"/></div>
        </div>
        <div class="title" @click="drop = true" v-else>
            <div class="text">{{hasempty?'-':'Загрузка...'}}</div>
        </div>

        <div class="drop shadow-block" v-if="list?.length && modelValue">
            <div v-for="i,k in list" :key="k" class="option" @click="select(i)">
                {{keyName?i[keyName]:i}}
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref, watch } from "vue";
    import vClickOutside from 'click-outside-vue3/src/v-click-outside';

    import IDrop from '@/components/icons/IDrop.vue';

    const props = defineProps({
        list: Array,
        modelValue: Object,
        keyName: String,
        loading: Boolean,
        hasempty: Boolean,
    })

    const emit = defineEmits(['update:modelValue']);

    const drop = ref(false);

    const select = (obj)=>{
        emit('update:modelValue',obj);
        drop.value = false;
    }

    const isloading = computed(()=>props.loading || !props.modelValue);

</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .title, .drop{
        width: 100%;
        justify-content: space-between;
    }
</style>