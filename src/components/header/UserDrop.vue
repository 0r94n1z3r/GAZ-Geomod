<template>
    <div class="user-drop" v-Click-Outside="()=>{drop = false}" @click="drop = true">
        <img v-if="userInfo['avatar']" :src="userInfo['avatar']" alt="" class="avatar">
        <div class="info">
            <div class="name">{{userInfo['username']}}</div>
            <div class="status">{{userInfo['role']}}</div>
        </div>
        <IDrop class="drop-icon"/>

        <div class="drop shadow-block" :drop="drop || null">
            <VButton grey @click="exit">Выйти</VButton>
        </div>
    </div>
</template>

<script setup>
    import IDrop from '@/components/icons/IDrop.vue';
    import vClickOutside from 'click-outside-vue3/src/v-click-outside';
    import { getCookie } from '@/script/cookie.js';

    import { reactive, ref } from 'vue';

    const drop = ref(false);

    const userInfo = reactive(getCookie('user')?JSON.parse(getCookie('user')):{});

//exit
    import { useUserStore } from "@/stores/user.js";
    const user = useUserStore();

    const exit = ()=>{
        user.exit();
        drop.value = false;
    }
</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .user-drop{
        position: relative;
        display: flex;
        gap: 10px;
        align-items: center;
        cursor: pointer;
        max-width: 200px;

        .avatar{
            border-radius: 50%;
            height: 32px;
            width: 32px;
            flex-shrink: 0;
        }

        .info{
            @include flex-col;
            justify-content: center;
            min-width: 0;

            .name{
                font-size: 16px;
                line-height: .8;
                @include text-overflow;
            }

            .status{
                font-size: 12px;
                color: var(--typo-secondary);
            }
        }

        .drop-icon{
            color: var(--c-dark);
            flex-shrink: 0;
        }

        .drop{
            position: absolute;
            right: 0;
            top: calc(100% + 10px);
            width: 100px;
            padding: 5px;
            border-radius: 4px;
            transition: .3s;

            &:not([drop]){
                @include hidden(-10px)
            }

            .btn{
                height: 30px;
            }
        }
    }
</style>