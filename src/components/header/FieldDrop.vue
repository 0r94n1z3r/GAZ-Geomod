<template>
    <VSelect :list="useMapStore().fields" v-model="useMapStore().activeField" keyName="dbName" :loading="!useMapStore().fields.length"/>
</template>

<script setup>
    import VSelect from "@/components/ui/VSelect.vue";

    import { useMapStore } from '@/stores/map.js';
</script>

<style lang="scss" scoped>
    
</style>