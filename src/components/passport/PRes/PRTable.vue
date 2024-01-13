<template>
    <div class="table-wr">
        <table class="passport-table">
            <thead>
                <tr>
                    <th rowspan="3">Объект</th>
                    <th :colspan="cats.length * 2">Запасы газа, млн. м³</th>
                    <th :colspan="cats.length * 2">Запасы конденсата, тыс. т</th>
                    <th rowspan="3">КИК, доли ед.</th>
                    <th :colspan="cats.length * 2">Запасы нефти, тыс. т</th>
                    <th rowspan="3">КИН, доли ед.</th>
                </tr>
                <tr>
                    <th :colspan="cats.length">геологические</th>
                    <th :colspan="cats.length">извлекаемые</th>
                    <th :colspan="cats.length">геологические</th>
                    <th :colspan="cats.length">извлекаемые</th>
                    <th :colspan="cats.length">геологические</th>
                    <th :colspan="cats.length">извлекаемые</th>
                </tr>
                <tr>
                    <!--  eslint-disable-next-line -->
                    <template v-for="i in 6" :key="i">
                        <th v-for="cat in cats" :key="cat">{{cat}}</th>
                    </template>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, name) in data" :key="name">
                    <td>{{name}}</td>
                    <td v-for="i in cats" :key="i">{{row.cats[i].gasGeol}}</td>
                    <td v-for="i in cats" :key="i">{{row.cats[i].gasIzvl}}</td>
                    <td v-for="i in cats" :key="i">{{row.cats[i].condGeol}}</td>
                    <td v-for="i in cats" :key="i">{{row.cats[i].condIzvl}}</td>
                    <td>{{row.kik}}</td>
                    <td v-for="i in cats" :key="i">{{i.oilGeol}}</td>
                    <td v-for="i in cats" :key="i">{{i.oilIzvl}}</td>
                    <td>{{row.kin}}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
    import { ref, computed } from "vue";

    const props = defineProps({
        data: Object
    });

    const cats = computed(()=>
        new Array(...new Set(
            Object.values(props.data).reduce((acc, e)=>acc.concat(Object.keys(e.cats)),[])
        ))
    );
</script>

<style lang="scss" scoped>
    .table-wr{
        width: 100%;
        overflow-x: auto;
    }
</style>