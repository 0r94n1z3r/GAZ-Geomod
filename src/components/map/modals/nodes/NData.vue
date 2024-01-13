<template>
    <div>
        <div class="content-wr">
            <div class="inp-wr">
                <p class="title">Скважина</p>
                <div class="inp-content">
                    <TextSelect :list="tmpList"/>
                </div>
            </div>
            <div class="inp-wr">
                <p class="title"></p>
                <div class="inp-content">
                    <VButton>Выполнить расчет</VButton>
                    <VButton grey>Загрузить данные</VButton>
                </div>
            </div>
        </div>

        <h2>Условия расчета</h2>

        <div class="content-wr">
            <div class="inp-wr">
                <p class="title">Режим расчета</p>
                <div class="inp-content">
                    <TextSelect :list="tmpList"/>
                </div>
            </div>
            <div class="inp-wr">
                <p class="title">Газовая смесь</p>
                <div class="inp-content">
                    <TextSelect :list="tmpList"/>
                </div>
            </div>
            <div class="inp-wr">
                <p class="title">Псевдокритическая температура, К</p>
                <div class="inp-content">
                    <VTextInput/>
                </div>
            </div>
            <div class="inp-wr">
                <p class="title">Псевдокритическая температура, К</p>
                <div class="inp-content">
                    <VTextInput/>
                </div>
            </div>
            <div class="inp-wr">
                <p class="title">Псевдокритическое давление, МПа</p>
                <div class="inp-content">
                    <VTextInput/>
                </div>
            </div>
            <div class="inp-wr">
                <p class="title">Псевдокритическое давление, МПа</p>
                <div class="inp-content">
                    <VTextInput/>
                </div>
            </div>
            <div class="inp-wr">
                <p class="title">Адд. моляр. масса</p>
                <div class="inp-content">
                    <VTextInput/>
                </div>
            </div>
            <div class="inp-wr">
                <p class="title">Плотн. смеси при норм. усл.</p>
                <div class="inp-content">
                    <VTextInput/>
                </div>
            </div>
        </div>

        <h2>Конструкция скважины</h2>

        <div class="content-wr">
            <div class="inp-wr">
                <p class="title">Элементы конструкции</p>
                <div class="columns">
                    <div class="col" v-for="(i,k) in cols" :key="k">
                        <p class="title">Колонна №{{k+1}}</p>
                        <div class="inps">
                            <TextSelect bottom placeholder="Кровля, мм" :list="tmpList"/>
                            <VTextInput placeholder="Внутр. д., мм"/>
                        </div>
                    </div>
                    <VButton fit grey @click="addCol">Добавить колонну</VButton>
                </div>
            </div>
            <div class="inp-wr">
                <p class="title">Диаметр по долоту, мм</p>
                <div class="inp-content">
                    <VTextInput/>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed } from "vue";

    const tmpList = ref([1,2,3,4,5,6,8,7,9,10,11]);

//cols
    const cols = ref([{}]);
    const addCol = ()=>{
        cols.value.push({});
    }
</script>

<style lang="scss" scoped>
    .inp-wr{
        font-size: 14px;
        width: 100%;
        max-width: 380px;

        p.title{
            
            color: var(--typo-secondary);
            margin-bottom: 8px;
            min-height: 1.2em;
        }

        .inp-content{
            display: flex;
            gap: 24px;
            width: 100%;

            >*{
                width: 100%;
            }

            .btn{
                font-size: 14px;
                padding: 0 25px;
                white-space: nowrap;
                height: 32px;
            }
        }
    }

    .content-wr{
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px 66px;
        margin-bottom: 23px;
    }

    h2{
        font-size: 18px;
        margin-bottom: 12px;
    }

    .columns{
        @include flex-col;
        gap: 13px;
        
        .col{
            display: flex;
            gap: 10px;
            white-space: nowrap;
            
            .title{
                padding: 7.5px 0;
                margin-bottom: 0;
            }

            .inps{
                display: flex;

                >*{
                    width: 100%;

                    &:not(:first-child){
                        &.text-select, 
                        :deep(.content){
                            border-left-width: 0;
                            border-top-left-radius: 0;
                            border-bottom-left-radius: 0;
                        }
                    }
                    
                    &:not(:last-child){
                        &.text-select, 
                        :deep(.content){
                            border-top-right-radius: 0;
                            border-bottom-right-radius: 0;
                        }
                    }
                }
                
            }
        }

        .btn{
            font-size: 14px;
        }
    }
</style>