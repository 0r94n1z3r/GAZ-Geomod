<template>
    <VSelect :list="useMapStore().areasDropList" v-model="useMapStore().activeArea" keyName="Название" :loading="!useMapStore().areas.length"/>
</template>

<script setup>
    import VSelect from "@/components/ui/VSelect.vue";

    import { useMapStore } from '@/stores/map.js';
</script>

<style lang="scss" scoped>
    
</style>