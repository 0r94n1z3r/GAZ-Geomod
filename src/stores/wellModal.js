import { defineStore } from 'pinia';
import { ref, computed, reactive } from "vue";

export const useWellModalStore = defineStore("wellModal", ()=>{

    const isCalled = ref(false);

    const info = ref({
        'Скважина':0
    });

    const call = (inf)=>{
        info.value = inf;
        isCalled.value = true;
    };

    const close = ()=>{
        isCalled.value = false;
    }

//------------------------------------------------------------------------------
    return {
        isCalled,
        info,
        call,
        close
    }

})