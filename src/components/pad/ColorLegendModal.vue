<template>
    <VModal title="Легенда" ref="modal">
        <div class="table-wr">
            <table>
                <tr>
                    <th>Наименование</th>
                    <th>Код</th>
                    <th>Цвет</th>
                </tr>
                <tr v-for="i in layers" :key="i">
                    <td>{{i.name}}</td>
                    <td>{{i.code}}</td>
                    <td >
                        <div class="color" :style="{'background': i.color}"></div>
                    </td>
                </tr>
            </table>
            <hr>
            <table>
                <tr>
                    <th>Наименование</th>
                    <th>Код</th>
                    <th>Цвет</th>
                </tr>
                <tr v-for="i in construction" :key="i">
                    <td>{{i.name}}</td>
                    <td>{{i.code}}</td>
                    <td >
                        <div class="color" :style="{'background': i.color}"></div>
                    </td>
                </tr>
            </table>
        </div>
    </VModal>
</template>

<script setup>
    import VModal from '@/components/ui/VModal.vue';
    import { ref, watch } from 'vue';

    const layers = [
        {name: '3_класс', code: '3_класс', color: '#BDBD04'},
        {name: '2_класс', code: '2_класс', color: '#E9E8AE'},
        {name: '1_класс', code: '1_класс', color: '#FBFAF5'},
        {name: 'ПЛОТ', code: 'ПЛОТ', color: '#646464'},
        {name: 'Глина', code: 'ГЛИНА', color: '#800200'},
        {name: 'Продукт (вероятно газ)', code: 'ВЕРГАЗ', color: '#9FFF60'},
        {name: 'Продукт (вероятно нефть)', code: 'ВЕРНЕФТЬ', color: '#B16363'},
        {name: 'Вода', code: 'ВОДА', color: '#80FFFF'},
        {name: 'Вода+нефть', code: 'ВОДАНЕФ', color: '#D76666'},
        {name: 'Газ', code: 'ГАЗ', color: '#FFFF00'},
        {name: 'Газ+вода', code: 'ГАЗВОДА', color: '#9FFF60'},
        {name: 'Газ (зона недонасыщения)', code: 'ГАЗНЕД', color: '#FFFF80'},
        {name: 'Газожидкостная смесь', code: 'ГЖСМЕСЬ', color: '#00FF80'},
        {name: 'Н_О', code: 'Н_О', color: '#B3E3FF'},
        {name: 'н/о зона потери сопротивления', code: 'Н_О_ЗПС', color: '#B3E3FF'},
        {name: 'Нефть + вода', code: 'НЕФВОДА', color: '#D6ADAD'},
        {name: 'Нефть (зона недонасыщения)', code: 'НЕФНЕД', color: '#804040'},
        {name: 'Нефть', code: 'НЕФТЬ', color: '#7D0000'},
        {name: 'Предп. переток воды', code: 'ПЕРВОДА', color: '#80FFFF'},
        {name: 'Предп. переток газа', code: 'ПЕРГАЗ', color: '#FFFF80'},
        {name: 'Продукт', code: 'ПРОД', color: '#C0C0C0'},
        {name: 'Слабая газонасыщенность', code: 'СЛАБГАЗ', color: '#FFFFBB'},
        {name: 'Слабая нефтенасыщенность', code: 'СЛАБНЕФ', color: '#BB7777'},
        {name: 'Продукт+вода', code: 'ПРОДВОДА', color: '#B3E3FF'},
        {name: 'н/о вероятно газ', code: 'Н_О_ВГАЗ', color: '#B3E3FF'},
        {name: 'Газ+нефть', code: 'ГАЗНЕФ', color: '#B3E3FF'},
        {name: 'Газоконденсат', code: 'ГАЗОКОН', color: '#B3E3FF'},
        {name: 'Поглощение закачиваемой жидкости', code: 'ПГЛОЩ', color: '#B3E3FF'},
        {name: 'Техногенная жидкость', code: 'ЖИДК', color: '#B3E3FF'},
        {name: 'Вода+газ', code: 'ВОДАГАЗ', color: '#B3E3FF'},
        {name: 'Слабо поглощает закачиваемую жидклсть', code: 'СЛ ПОГЛ', color: '#B3E3FF'},
        {name: 'В данных условиях оценить работу сложно', code: 'НЕОДНОЗН', color: '#B3E3FF'},
    ]

    const construction = [
        {name: 'ПЦЕМ', code: 'ПЦЕМ', color: '#808000'},
        {name: 'ОТЦЕМ', code: 'ОТЦЕМ', color: '#80FFFF'},
        {name: 'ЧЦЕМ', code: 'ЧЦЕМ', color: '#FF8040'},
        {name: 'ЖЦЕМ', code: 'ЖЦЕМ', color: '#804040'}
    ]

//call
    const modal = ref(null);

    const call = ()=>{
        modal.value.call();
    }

    const close = ()=>{
        modal.value.close();
    }

    defineExpose({
        call,
        close
    });
</script>

<style lang="scss" scoped>
    .table-wr{
        padding: 10px 24px;
        overflow: auto;
        height: 100%;
        max-height: calc(90vh - 71px);

        table{
            width: 100%;
        }

        th{
            text-align: left;
        }

        td,th{
            padding: 1px 10px;

            &:first-child{
                padding-left: 0;
            }

            &:nth-child(2){
                width: 115px;
            }

            &:last-child{
                padding-right: 0;
                width: 50px;
            }
        }

        .color{
            width: 100%;
            height: 21px;
        }
    }
</style>