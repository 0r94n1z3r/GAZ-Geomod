<template>
    <div class="select-wr" :drop="drop || null" v-click-outside="()=>{if(drop)cancel()}">
        <div class="title" @click="()=>{drop = !drop, prod.syncEdit()}">
            <img src="/img/time.svg" alt="" class="icon">
            <template v-if="prod.editDateLen == 0">
                <template v-if="prod.emptyDateString.start != prod.emptyDateString.end && prod.emptyDateString.end != 1970">
                    {{prod.emptyDateString.start}} - {{prod.emptyDateString.end}}
                </template>
                <template v-else>
                    Не найдено
                </template>
            </template>
            <template v-else-if="prod.editDateLen == 1">
                <span>{{prod.editDateString.end}}</span>
            </template>
            <template v-else>
                <span>{{prod.editDateString.start}}</span> - 
                <span>{{prod.editDateString.end}}</span>
            </template>
            
        </div>

        <div class="drop shadow-block">
            <div class="type">
                <div 
                    class="block" 
                    
                    v-for="(i,k) in prod.modes"
                    :key="k"

                    :active="k == prod.editDate.activeModeId || null" 

                    @click="prod.editDate.activeModeId = k"
                >
                    {{i.title}}
                </div>
            </div>

            <hr>

            <div class="slider">
                <VButton grey class="btn" @click="prod.changePage(-1)"><img src="/img/listArrow.svg" alt=""></VButton> 
                <span>{{prod.modePageString}}</span> 
                <VButton grey class="btn" @click="prod.changePage(1)"><img src="/img/listArrow.svg" alt=""></VButton> 
            </div>

            <div class="calendar">
                <div class="line" v-for="(f,n) in prod.activeEditMode.size[1]" :key="n">
                    <VButton 
                        class="block" 
                        v-for="(f,m) in prod.activeEditMode.size[0]" 
                        :key="m"

                        @click="prod.setEditDate(prod.typeById(prod.activeEditMode.size[0] * n + m).date)"

                        :grey="
                            prod.editDateBounds(prod.typeById(prod.activeEditMode.size[0] * n + m).date) == 0 ||
                            null
                        "

                        :hollow="
                            prod.editDateBounds(prod.typeById(prod.activeEditMode.size[0] * n + m).date) == 1 ||
                            null
                        "
                    >   
                        <!-- {{prod.editDateBounds(prod.typeById(prod.activeEditMode.size[0] * n + m).date)}} /  -->
                        {{prod.typeById(prod.activeEditMode.size[0] * n + m).title}}
                    </VButton>
                </div>
                
            </div>


            <!-- <div class="text-date">
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
            /> -->
            <hr>

            <div class="btns">
                <VButton class="btn" grey @click="prod.flushEditDate()">Очистить</VButton>
                <VButton class="btn" grey @click="cancel">Отмена</VButton>
                <VButton class="btn" @click="confirm">Применить</VButton>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from "vue";
    import vClickOutside from 'click-outside-vue3/src/v-click-outside';
    import { useProductionStore } from '@/stores/production.js';

    const prod = useProductionStore();

    const log = (f)=>console.log(f);

    //drop
        const drop = ref(false);

    //confirm/cancel
        const cancel = ()=>{
            drop.value = false;
            prod.syncEdit();
        }

        const confirm = ()=>{
            prod.syncActive();
            drop.value = false;

            setTimeout(()=>prod.updateFieldProduction());
        }
</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .type{
        display: flex;
        width: 100%;
        justify-content: center;

        .block{
            border: 1px solid var(--bg-control-primary);
            padding: 0 10px 2px;;
            font-size: 16px;
            cursor: pointer;
            transition: .3s;
            color: var(--bg-control-primary);

            &:not(:last-child){
                border-right: 0;
            }

            &:first-child{
                border-radius: 4px 0 0 4px;
            }

            &:last-child{
                border-radius: 0 4px 4px 0;
            }

            &[active]{
                background: var(--bg-control-primary);
                color: var(--bg-default);
            }
        }
    }

    hr{
        margin: 0;
        height: 1px;
        width: 100%;
        border: none;
        background: var(--bg-border);
    }

    .drop{
        left: 0;
        @include flex-col;
        gap: 15px;
        padding: 15px;
    }

    .slider{
        @include flex-c;
        gap: 10px;

        span{
            white-space: nowrap;
        }

        .btn{
            width: 25px;
            height: 25px;
            padding: 0;

            &:first-child{
                transform: rotate(.25turn);
            }
            &:last-child{
                transform: rotate(-.25turn);
            }
        }
    }

    .calendar{
        @include flex-col;
        gap: 5px;

        .line{
            display: flex;
            gap: 5px;

            .block{
                height: 25px;
                line-height: 0;
            }
        }
    }

    .btns{
        display: flex;
        gap: 15px;

        .btn{
            height: 40px;
            padding: 0 10px;
        }
    }
</style>