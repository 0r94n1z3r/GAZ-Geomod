<template>
    <VSelect :list="map.objectsDropList" v-model="map.activeObject" keyName="Объект" :loading="!useMapStore().objects?.length"/>
</template>

<script setup>
    import VSelect from "@/components/ui/VSelect.vue";
    import { useMapStore } from '@/stores/map.js';
    import { watch, ref, computed } from "@vue/runtime-core";

    const map = useMapStore();    
</script>

<style lang="scss" scoped>

</style>