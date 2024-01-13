<template>
    <div class="select-wr" :drop="drop || null" v-click-outside="cancel">
        <div class="title" @click="drop = !drop">
            <img src="/img/time.svg" alt="" class="icon">
            <div class="text">{{beautifyDate(activeDate)}}</div>
        </div>

        <div class="drop shadow-block">
            <div class="text-date">
                <input type="text" v-maska="'##.##.####'" v-model="textDate" @keydown="textDateHandler">
                <img src="/img/calendar.svg" alt="">
            </div>
            <DatePicker 
                trim-weeks 
                v-model="tmpDate" 
                :attributes="calendarAttributes" 
                class="calendar" 
                ref="calendar"
                :locale="{masks: { weekdays: 'WW' }}"
            />
            <div class="btns">
                <VButton class="btn" grey @click="cancel">Отмена</VButton>
                <VButton class="btn" @click="confirm">Применить</VButton>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { nextTick, ref, watch } from "vue";
    import vClickOutside from 'click-outside-vue3/src/v-click-outside';

    import { DatePicker } from 'v-calendar'
    import 'v-calendar/dist/style.css';

    import { beautifyDate } from '@/script/formatters.js';

//drop
    const drop = ref(false);

//data
    const activeDate = ref(new Date());

//text-input
    const textDate = ref(beautifyDate(activeDate.value, true));

    const mutateTextDate = ()=>{
        var splittedStr = textDate.value.split('.');
        let date = new Date(splittedStr[2], splittedStr[1]-1, splittedStr[0])
        
        tmpDate.value = date;
        calendar.value.focusDate(date);
    };

    watch(textDate, ()=>{
        if(textDate.value.length == 10){
            setTimeout(mutateTextDate,1)
        }
    })

//calendar
    const tmpDate = ref(activeDate.value);
    const calendar = ref(null);

    watch(tmpDate, ()=>{
        textDate.value = beautifyDate(tmpDate.value, true);
    });

    const calendarAttributes = ref([
        {
            key: 'today',
            highlight: {
                color: 'blue',
                fillMode: 'outline'
            },
            dates: new Date(),
        },
    ]);

//confirm/cancel
    const cancel = ()=>{
        tmpDate.value = activeDate.value;
        textDate.value = beautifyDate(activeDate.value, true);
        drop.value = false;
    }

    const confirm = ()=>{
        activeDate.value = tmpDate.value;
        drop.value = false;
    }

</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .drop{
        left: auto;
        right: 0;
        @include flex-col;
        gap: 10px;
        padding: 15px;
    }

    .text-date{
        position: relative;
        width: 180px;
        
        input{
            height: 40px;
            width: 180px;
            font-size: 16px;
            border: 1px solid var(--bg-border);
            padding: 0 36px 0 11px;
            border-radius: 4px 0 0 4px;
            transition: .3s;

            &:focus{
                border-color: var(--bg-border-focus);
            }
        }

        img{
            position: absolute;
            right: 10px;
            top: 0;
            bottom: 0;
            margin: auto;
        }
    }

    :deep(.calendar){
        border: none;

        .vc-header{
            padding-bottom: 12px;
        }

        .vc-weekday{
            font-weight: 300;
        }

        .vc-highlights{
            &+span{
                font-weight: normal!important;
            }
        }

        .vc-highlight{
            border-width: 1px!important;
        }
    }

    .btns{
        display: flex;
        gap: 15px;

        .btn{
            height: 40px;
        }
    }
</style>