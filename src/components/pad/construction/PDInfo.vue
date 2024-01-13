<template>
    <div>
        <template v-for="(i,k) in tables" >
            <div class="block" v-if="info[i.name]?.length" :key="k">
                <h2>{{i.title}}</h2>
                <table>
                    <thead>
                        <tr>
                            <th v-for="c in i.cols" :key="c">{{c}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row,r) in info[i.name]" :key="r">
                            <td v-for="c in i.cols" :key="c">
                                {{
                                    c.includes('Дата')?
                                    row[c]?.replaceAll(/T|Z/g,' '):
                                    row[c]
                                }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
    </div>
</template>

<script setup>

    import { ref, watch } from 'vue';

    const props = defineProps({
        info: Object
    })

    const tables = ref([
        {
            name: 'Проходка',
            title: 'Проходка',
            cols: ['Кровля','Подошва','Диам_долота','Дата']
        },
        {
            name: 'Текущий_забой',
            title: 'Текущий забой',
            cols: ['Тек_забой','Дата']
        },
        {
            name: 'Колонны',
            title: 'Колонны',
            cols: ['Тип','Дата','Кровля','Подошва','Подошва_уточн','Дата_уточн','Внеш_диам','Толщина']
        },
        {
            name: 'Перфорация',
            title: 'Перфорация',
            cols: ['Кровля','Подошва','Плотность_перф','Заряд_ВВ','Диаметр_отверстия','Дата']
        },
        {
            name: 'Уточнение_перфорации',
            title: 'Уточнение перфорации',
            cols: ['Кровля','Подошва','Кровля_уточн','Подошва_уточн','Причина_для_кровли','Причина_для_подошвы','Дата']
        },
        {
            name: 'НКТ',
            title: 'НКТ',
            cols: ['Дата_уст','Дата_под','Кровля','Подошва','Подошва_уточн','Внеш_диам','Толщина']
        },
        {
            name: 'Оборудование',
            title: 'Оборудование',
            cols: ['Тип_обор','Код_обор','Кровля','Подошва','Внут_диам','Внеш_диам','Дата_уст','Дата_под']
        },
        
    ])
</script>

<style lang="scss" scoped>
    .block{
        margin-bottom: 24px;
        padding-right: 24px;

        h2{
            font-size: 16px;
            color: var(--typo-ghost);
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--typo-primary)
        }
    }

    table{
        border-collapse: collapse;
        width: 100%;
        // max-width: 1003px;

        th,td{
            border-right: 1px solid var(--bg-border);
        }

        thead{
            tr{
                border-bottom: 1px solid var(--typo-secondary);

                th{
                    font-weight: 400;
                    white-space: nowrap;
                    padding: 18.25px 12px;

                    &:first-child{
                        text-align: left;
                    }
                }
            }
        }

        tbody{
            tr{
                &:nth-child(2n){
                    background: var(--bg-control-ghost-hover);
                }

                td{
                    padding: 12px;
                }
            }
        }
    }
</style>