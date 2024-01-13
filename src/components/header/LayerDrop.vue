<template>
    <VSelect :list="layersDisplay" v-model="map.activeLayer" keyName="Пласт" :loading="!map.layers.length"/>
</template>

<script setup>
    import VSelect from "@/components/ui/VSelect.vue";
    import { watch, ref, computed } from "@vue/runtime-core";

    import { useMapStore } from '@/stores/map.js';

    const map = useMapStore();

    const depth = (a,b)=>{
        if(a['Пласт'] == 'Пласт')return -1;
        if(!a['Стратиграфия'] || !b['Стратиграфия'])return 1;
        
        const minStrat = (strat)=>Math.min(...strat.map(e => e['Кровля']))

        if ( minStrat(a['Стратиграфия']) < minStrat(b['Стратиграфия']) ) return -1;
        if ( minStrat(a['Стратиграфия']) > minStrat(b['Стратиграфия']) ) return 1;
        return 0;
    }

    const layersDisplay = computed(()=>
        map.activeObjectDisplay?
        map.currentLayers.filter(e => e['Ид_Объекта_эксплуатации'] == map.activeObjectDisplay['Ид_объекта'] || e['Пласт'] == 'Пласт'):
        map.currentLayers
    );

</script>

<style lang="scss" scoped>

</style>