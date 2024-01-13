<template>
    <div>
        <table class="table-default">
            <thead>
                <tr>
                    <th>Местоположение</th>
                    <th>Дебит (тек.),<br>тыс. м куб. / сут.</th>
                    <th>Дебит (потенц.),<br>тыс. м куб. / сут.</th>
                    <th>Статус</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(i,k) in 20" :key="k">
                    <td>123</td>
                    <td>456</td>
                    <td>789</td>
                    <td :success="k == 2 || null">{{k == 2?'Расчет выполнен':'Информация отсутствует'}}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
    [success]{
        color: #16BE3B;
    }
</style>