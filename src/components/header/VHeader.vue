<template>
    <div class="v-header">
        <div class="l-container container">
            <div class="logo">
                <img src="/img/logo.svg" alt="">
            </div>
            <FieldDrop class="drop"/>
            <AreaDrop class="drop"/>
            <!-- <ObjectsDrop class="drop"/> -->
            <LayerDrop class="drop"/>
            <WellSearch/>
            <!-- <DateDrop/> -->
            <DateSpanDrop/>
        </div>
        <div class="r-container container">
            <VButton class="passport-caller" @click="passportRef.call()"><IGeo class="ico"/>Паспорт месторождения</VButton>
            <DownloadDrop/>
            <UserDrop/>
        </div>

        <PassportModal ref="passportRef"/>
    </div>
</template>

<script setup>
    import VSearch from '@/components/header/VSearch.vue';
    import WellSearch from '@/components/header/WellSearch.vue';

    import IGeo from "@/components/icons/IGeo.vue";

    import AreaDrop from '@/components/header/AreaDrop.vue'
    import FieldDrop from '@/components/header/FieldDrop.vue'
    import LayerDrop from '@/components/header/LayerDrop.vue'
    import ObjectsDrop from '@/components/header/ObjectsDrop.vue'
    import DateSpanDrop from '@/components/header/DateSpanDrop.vue'
    import DownloadDrop from '@/components/header/DownloadDrop.vue'
    import UserDrop from '@/components/header/UserDrop.vue'
    
    import PassportModal from "@/components/passport/PassportModal.vue";

    import { ref } from "vue";

    const passportRef = ref();
</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .v-header{
        @include flex-jtf;
        height: 60px;
        background: var(--bg-default);
        box-shadow: var(--shadow);
        border-bottom: 1px solid var(--bg-border);
        gap: 24px;
        padding: 0 40px;
        z-index: 5;

        .container{
            display: flex;
            align-items: center;

            &.l-container{
                gap: 24px;
                .drop{
                    width: 200px;
                }

                .logo{
                    width: 80px;
                    height: 39px;
                    flex-shrink: 0;

                    img{
                        width: 100%;
                        height: 100%;
                        transform: translateY(-6px);
                    }
                }
            }

            &.r-container{
                gap: 24px;
                width: 100%;
                justify-content: end;

                .drop{
                    width: 100%;
                    max-width: 200px;
                }
            }
        }
    }

    .btn.passport-caller{
        white-space: nowrap;
        height: 32px;
        padding: 0 9px;
        width: max-content;
        font-size: 14px;

        .ico{
            flex-shrink: 0;
        }
    }
</style>