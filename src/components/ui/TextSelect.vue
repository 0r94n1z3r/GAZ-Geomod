<template>
    <div class="text-select" v-click-outside="()=>{checkValid(); blurHandler()}" :focused="focused || null" :disabled="disabled || null">
        <slot name="pre"></slot>
        <input type="text" ref="inp" v-model="text" @keydown="noBtn = false" @focus="focusHandler" :placeholder="placeholder">

        <div class="drop" v-if="displayList.length" :drop="drop || null">
            <div class="item" v-for="(i,k) in displayList" :key="k" @click="confirm(i)">{{keyName?i[keyName]:i}}</div>
        </div>
    </div>
</template>

<script setup>
    import vClickOutside from 'click-outside-vue3/src/v-click-outside';

    import { computed, ref, watch } from "@vue/runtime-core";

    const props = defineProps({
        modelValue: [Object, String, Number],
        list: Array,
        keyName: String,
        disabled: Boolean,
        placeholder: String,
    })

    const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur']);

    const drop = ref(false);

    const noBtn = ref(true);

    watch(drop, ()=>noBtn.value = true);
    
    const text = ref(props.keyName?props.modelValue?.[props.keyName]:props.modelValue || '');
    watch(()=>props.modelValue, (n)=>text.value = props.keyName?n?.[props.keyName]:n || '');

    const displayList = computed(()=>{
        if(!props.modelValue || noBtn.value)return props.list;
        let list = props.list.filter(e =>((props.keyName?e?.[props.keyName]:e)+'').toLowerCase().includes(text.value.toLowerCase()));        
        return list;
    });

//finishers
    const checkValid = ()=>{
        if(!drop.value)return;

        let obj = displayList.value.find(e => ((props.keyName?e?.[props.keyName]:e)+'')?.toLowerCase() == text?.value?.toLowerCase());
        if(obj){
            confirm(obj);
        }else{
            text.value = '';
            confirm(null);
        }
    }

    const confirm = (obj)=>{
        text.value = obj?.[props.keyName] || ''
        emit('update:modelValue', obj);
        if(props.modelValue?.[props.keyName] != text.value )emit('change', obj);
        setTimeout(()=>drop.value = false);
    }

//focus
    const inp = ref();

    const focused = ref(false);

    const focus = ()=>{
        setTimeout(()=>inp.value?.focus?.());
    }

    const focusHandler = ()=>{
        emit('focus');
        drop.value = true;
        focused.value = true;
    }

//blur
    const blurHandler = ()=>{
        emit('blur');
        drop.value = false;
        focused.value = false;
    }

    const blur = ()=>inp.value.blur();
    
</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .text-select{
        position: relative;
        height: 32px; 
        border: 1px solid var(--bg-border);
        border-radius: 4px;
        display: flex;
        align-items: center;

        transition: .3s;

        input{
            margin: 0;
            width: 100%;
            border: none;
            display: flex;
            padding: 0 9px;
            border-radius: 3px;
            font-size: inherit;
            background: transparent;
            height: 100%;

            &::placeholder{
                color: #00203359;
            }
        }

        &[focused]{
            border-color: var(--bg-border-focus);
        }

        &[disabled]{
            opacity: 0.6;
            pointer-events: none;
        }

        .drop{
            position: absolute;
            left: 0;
            top: 100%;
            background: #fff;
            padding: 5px 0;
            width: 100%;
            border-radius: 0 0 5px 5px;
            box-shadow: (0 0 5px #00000040);
            max-height: 40vh;
            overflow-y: auto;
            z-index: 5;
            transition: .3s;

            .item{
                padding: 5px;
                cursor: pointer;
                word-break: break-word;
                text-align: left;

                &:hover{
                    background: #f5f5f5;
                }
            }

            &:not([drop]){
                @include hidden(-10px);
            }
        }

        &[bottom]{
            .drop{
                top: unset;
                bottom: calc(100% + 2px);

                &:not([drop]){
                    @include hidden(10px);
                }
            }
        }
    }
</style>