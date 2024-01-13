<template>
    <div class="wr">

        <div class="tip">
            <p>test111@mail.ru</p>
            <p>123456789Abc</p>
        </div>

        <div class="content">
            <div class="block shadow-block">
                <img src="/img/logo.svg" class="logo" alt="">
                <h5>Вход в систему</h5>

                <div class="input-wr">
                    <div class="title">Имя пользователя</div>
                    <input 
                        v-model="login"
                        @keydown.enter="passwInp.focus()"
                        @focus="err[0]=''"
                        
                        :err="err[0] || null"

                        ref="loginInp" 
                        type="text" 
                        placeholder="example@gazprom.ru"
                    >
                    <div class="err" v-show="err[0]">{{err[0]}}</div>
                </div>
                <div class="input-wr">
                    <div class="title">Пароль</div>
                    <input 
                        v-model="password"
                        @keydown.enter="auth"
                        @focus="err[1]=''"
                        
                        :err="err[1] || null"
                        
                        ref="passwInp" 
                        type="password" 
                        placeholder="••••••••"
                    >
                    <div class="err" v-show="err[1]">{{err[1]}}</div>
                </div>

                <VButton
                    @click="auth"
                    :loading="loading || null"

                    class="btn" 
                >
                    Войти
                </VButton>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { onMounted, ref } from "vue";
    import { useUserStore } from "@/stores/user.js";

    const user = useUserStore();

//data
    const login = ref('');
    const password = ref('');

//refs
    const loginInp = ref(null);
    const passwInp = ref(null);

    onMounted(()=>{
        loginInp.value.focus()
    });

//state
    const err = ref(['','']) 
    const loading = ref(false);

//auth
    const auth = ()=>{
        //empty input handling
            var error = false;
            if(!login.value){
                err.value[0]="Заполните поле"
                error = true;
            }
            if(!password.value){
                err.value[1]="Заполните поле"
                error = true;
            }

            if(error)return;

        loading.value = true;
        
        //sending data
            user.auth(
                login.value,
                password.value,
                (data)=>{
                    err.value[1]=data;
                    loading.value = false;
                }
            )
    }


</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .tip{
        position: absolute;
        left: 10px;
        top: 6px;
        opacity: 0;
    }

    .wr{
        @include flex-c;
        width: 100%;
        height: 100%;

        .content{
            @include flex-col;
            gap: 45px;

            width: 100%;
            max-width: 364px;

            .block{
                padding: 48px 32px;
                border-radius: 8px;

                box-shadow: 0px 12px 28px 0px #0020331F;
                box-shadow: 0px 8px 8px 0px #0020330A;

                
                @include flex-col;
                align-items: center;

                .logo{
                    width: 137px;
                    height: 67px;
                    margin-bottom: 30px;
                }

                h5{
                    font-size: 16px;
                    font-weight: 700;
                    margin-bottom: 30px;
                }

                .input-wr{
                    width: 100%;
                    margin-bottom: 15px;

                    .title{
                        font-size: 14px;
                        color: var(--typo-secondary);
                        margin-bottom: 5px;
                        @include flex-jtf;
                    }

                    input{
                        height: 40px;
                        width: 100%;
                        border-radius: 4px;
                        border: 1px solid var(--bg-border);
                        padding: 0 11px;
                        font-size: 16px;
                        transition: .3s;
                        
                        &::placeholder{
                            color: var(--bg-border);
                            transition: .3s;
                        }

                        &:focus{
                            border-color: var(--bg-border-focus);
                                &::placeholder{
                                color: var(--bg-border-focus);
                            }
                        }

                        &[err]{
                            border-color: var(--c-red);
                        }
                    }

                    .err{
                        color: var(--c-red);
                        font-size: 14px;
                    }
                }

                .btn{
                    margin-top: 20px;
                }
            }
        }
    }
</style>