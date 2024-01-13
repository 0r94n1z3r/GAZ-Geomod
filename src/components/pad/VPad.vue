<template>
<div class="pad-wr" :hid="!list?.length || null">
    <ColorLegendModal ref="colorLegend"/>

    <div 
        class="pad" 
        :style="`width:${wrWidth}px`" 
        :drop="drop || null"
    >
        <div class="top">
            <div class="content">
                <div class="title">
                    <h4>Геофизический планшет</h4>
                    <img src="/img/info.svg" class="info" alt="" @click="$refs.colorLegend.call()">
                </div>
                <div class="checkboxes">
                    <label class="absolute checkbox">
                        <input type="checkbox" v-model="map.isAbsoluteHeight">
                        <span>Абсолютная глубина</span>
                    </label>
                    <label class="absolute checkbox" :hide="!drop || list?.length <= 1 || null">
                        <input type="checkbox" v-model="map.syncScroll">
                        <span>Одновременная прокрутка</span>
                    </label>
                </div>
                
            </div>
            <UnfoldArrow :hid="list?.length <= 1 || null" class="arrow" :direction="drop?'l':'r'" @click="switchDrop"/>
        </div>

        
        <div class="charts scrl-wr" 
            v-touch:drag="drag" 
            v-touch:release="dragStop"
            @mouseleave="dragStop"
            ref="scrlWr"
        ><!-- @wheel.prevent="shift($event.wheelDelta)"   -->
            <div class="scrl" ref="scrl">
                <div ref="chartsRef" v-for="(i,k) in list.slice(0,5)" :key="k">
                    <WellChart :info="i" :localId="k"/>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script setup>
    import { computed, ref, watch, onMounted } from "vue";
    import WellChart from "@/components/pad/WellChart.vue";
    import { useMapStore } from "@/stores/map.js";

    import ColorLegendModal from "@/components/pad/ColorLegendModal.vue";

    const map = useMapStore();

    const list = computed(()=>map.activeWells)

//drop
    const drop = ref(false);
    const chartsRef = ref([]);

    const wrWidth = ref(0);

    const recalculateWidth = ()=>{
        setTimeout(()=>{
            wrWidth.value = drop.value?
                chartsRef.value.slice(0,5).reduce((acc, e)=> acc + e.clientWidth + 21, 0) - 21:
                chartsRef.value[0]?.clientWidth
        })
    };

    onMounted(recalculateWidth);
    watch(()=>[...list.value, drop.value, ...list.value.filter(e => e.isLg)], recalculateWidth);


    let resizeTimeout = null;

    const switchDrop = ()=>{
        drop.value = !drop.value;

        moveTo(0);

        resizeTimeout = setInterval(()=>useMapStore().resize(),1);
        setTimeout(()=>clearInterval(resizeTimeout),600);
    }

    watch(list, (l)=>{
        if(l.length == 1 || l.length == 0 && !resizeTimeout){
            resizeTimeout = setInterval(()=>useMapStore().resize(),1);
        }
        setTimeout(()=>clearInterval(resizeTimeout),600);
    })

//scroll
    const scrl = ref(null);
    const scrlWr = ref(null);

    let prevDrag = null
    const drag = (e)=>{

        if(!drop.value)return;

        if (document.selection) {
            document.selection.empty()
        } else {
            window.getSelection().removeAllRanges()
        }

        if(prevDrag !== null){
            shift(e.clientX - prevDrag);
        }

        prevDrag = e.clientX;
    }

    const dragStop = ()=>{
        prevDrag = null
    }

    const shift = (num)=>{
        var pos = parseFloat(scrl.value.style.transform.replaceAll('translateX(','') || 0);
        moveTo(num+pos)
    }

    const moveTo = (num)=>{
        var border = scrl.value.offsetWidth - scrlWr.value.offsetWidth;
        if(border<=0)num = 0;

        var destination = 
            num >= 0? 0:
            num < -border? -border:
            num;

        scrl.value.style.transform = `translateX(${destination}px)`;
    }

</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .pad-wr{
        transition: .3s;

        &[hid]{
            margin-left: -260px;
            opacity: 0;
        }
    }

    .pad{
        flex-shrink: 0;
        min-width: 260px;
        max-width: 80vw;
        height: 100%;
        border-right: 1px solid var(--bg-border);
        background: var(--bg-secondary);
        @include flex-col;
        transition: .3s;

        .top{
            background: var(--bg-secondary);
            height: auto;
            padding: 10px 20px 11px 17px;
            
            @include flex-jtf;

            .title{
                display: flex;
                align-items: center;
                gap: 5px;
                margin-bottom: 10px;

                h4{
                    margin-bottom: 0;
                    font-size: 14px;
                }

                .info{
                    cursor: pointer;
                }
            }

            .arrow{
                &[hid]{
                    @include hidden(0);
                }
            }

            .checkboxes{
                display: flex;
                width: max-content;
                gap: 20px;
                font-size: 14px;

                [hide]{
                    display: none;
                }
            }
        }
        
        .charts{
            height: 100%;
            display: flex;
            overflow: hidden;

            .scrl{
                height: 100%;
                display: flex;
                gap: 21px;
                transition: .2s ease-out;
            }
        }
    }
</style>