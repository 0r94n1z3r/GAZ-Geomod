<template>
    <RouterView v-if="loaded" />
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user.js";
import { useMapStore } from "@/stores/map.js";
import { onMounted, watch, ref, nextTick } from "vue";

const router = useRouter();
const route = useRoute();
const user = useUserStore();
const map = useMapStore();

const loaded = ref(false);

const authAction = () => {
    if (user.isLogged === null) return;

    var name = user.isLogged ? "home" : "auth";

    router.push({ name });

    if (user.isLogged) map.updateFields();

    loaded.value = true;
};

watch(() => user.isLogged, authAction);
onMounted(authAction);
</script>

<style lang="scss">
@import "@/style/reset.scss";
@import "@/style/colors.scss";
@import "@/style/style.scss";
</style>
