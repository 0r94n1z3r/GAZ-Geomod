<template>
    <div class="well-chart"
        :photo-mode="true"
    >
        <div class="table" ref="tableRef" @scroll="scrollHandler">
            <div class="table-top"
                ref="topRef"
                :style="{height: topHeight + 'px'}"
            >
                <div class="container">
                    <div class="layer col">
                        <h5>Пласт</h5>
                    </div>
                    <div class="depth col">
                        <h5>Глубина, м</h5>
                    </div>
                    <div class="design col">
                        <h5>скважины<br>Конструкция</h5>
                    </div>
                    <div class="lithology col">
                        <h5>Литология по ГИС</h5>
                    </div>
                    <div class="gis">

                        <div v-for="(i,k) in activeCurves" :key="k" class="range">
                            <h5>{{i.name}} <span>{{i.date?`(${i.date})`:''}}</span></h5>
                            <div class="border" :style="{'border-color': i.color}"></div>
                            <div class="scales">
                                <div class="num">{{round(i.range[0], 2)}}</div>
                                <div class="num">{{round(i.range[0] + ((i.range[1] - i.range[0]) / 2), 2)}}</div>
                                <div class="num">{{round(i.range[1], 2)}}</div>
                            </div>
                        </div>
                        
                        <div class="chart"></div>
                    </div>
                    <div class="gis gis-log" :shrunk="!info.isLg || null">
                        
                        <div v-for="(i,k) in activeCurvesLg" :key="k" class="range">
                            <h5>{{i.name}} <span>{{i.date?`(${i.date})`:''}}</span></h5>
                            <div class="border" :style="{'border-color': i.color}"></div>
                            <div class="scales">
                                <div class="num">{{round(i.rangeLog[0], 2)}}</div>
                                <div class="num">{{round(i.rangeLog[0] + ((i.rangeLog[1] - i.rangeLog[0]) / 2), 2)}}</div>
                                <div class="num">{{round(i.rangeLog[1], 2)}}</div>
                            </div>
                        </div>
                        
                        <div class="chart"></div>
                    </div>
                </div>
            </div>

            <div class="charts placeholder" v-if="loading">
                <div class="loader">Загрузка...</div>
            </div>

            <div class="charts" v-else>
                <WCLayers class="layer col" :info="info" :step="step" :stepH="stepH" :layers="layers" @setScrollToLayer="setScrollToLayer($event)" photo/>
                <WCDepth class="depth col" :info="info" :step="step" :stepH="stepH"/>
                <WCDesign class="design col" :info="info" :step="step" :stepH="stepH"/>
                <WCLithology class="lithology col" :info="info" :step="step" :stepH="stepH" :proplastki="proplastki"/>
                <WCGis class="gis " 
                    :info="info" 
                    :step="step" 
                    :stepH="stepH" 
                    :proplastki="proplastki" 
                    :activeCurves="activeCurves"
                    :topHeight="topHeight"
                />
                <WCGis class="gis gis-log" 
                    lg 
                    :shrunk="!info.isLg || null" 
                    :info="info" 
                    :step="step" 
                    :stepH="stepH" 
                    :proplastki="proplastki" 
                    :activeCurves="activeCurvesLg" 
                    :topHeight="topHeight"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
    import ICross from '@/components/icons/ICross.vue'
    import IDrop from '@/components/icons/IDrop.vue';
    import ConstructionModal from '@/components/pad/construction/ConstructionModal.vue'
    import TrajModal from '@/components/pad/TrajModal.vue'

    import vClickOutside from 'click-outside-vue3/src/v-click-outside';

    import WCLayers from '@/components/pad/WC/WCLayers.vue'
    import WCDepth from '@/components/pad/WC/WCDepth.vue'
    import WCLithology from '@/components/pad/WC/WCLithology.vue'
    import WCGis from '@/components/pad/WC/WCGis.vue'
    import WCDesign from '@/components/pad/WC/WCDesign.vue'

    import Camera from "@/stores/camera.js";

    import { generateDocument } from "@/script/templater/templater.js"; 

    import { round } from '@/script/formatters.js';

    import { getWellInfo, getWellDesign } from '@/script/well.js';
    import { downloadWellReport, getReportData } from '@/script/docs.js';

    import { useWellModalStore } from '@/stores/wellModal.js';
    import { useCameraStore } from '@/stores/camera.js';
    import { useMapStore } from "@/stores/map.js";

    import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

    import { beautifyDate } from '@/script/formatters.js';
    
    import IDotsV from "@/components/icons/IDotsV.vue";

    const map = useMapStore();

    const props = defineProps({
        info: Object,
        localId: Number,
    })

    const emit =  defineEmits(['allLoaded']);

    const wellHeight = computed(()=>props.info?.['Подошва_инкл'] || props.info?.['Подошва_fake']);

//scaleControl
    const scale = computed(()=>(2000 / 100) || 1);
    const step = computed(() => scale.value / 4); //Кол-во шагов в одном делении (одно деление = 4 шага)
    const stepH = ref(20); //Высота одного деления в пикселях

//infoDrop
    const infoDrop = ref(false);

//remove
    const remove = ()=>{
        map.switchActiveState(props.info["Ид_скважины"]);
    }

//fullInfo
    const loading = ref(true);

    const getFullInfo = ()=>{
        loading.value = true;

        let allLoaded = 0;

        const fin = ()=>{
            allLoaded++;
            if(allLoaded == 4){
                emit('allLoaded');
                loading.value = false;
            }
        }

        addWellInfo('Proplastki', 'Пропластки', fin);
        addWellInfo('Stratigraphy', 'Стратиграфия', fin);
        addWellInfo('GISCurves', 'Кривые', fin);
        addWellDesign(fin);
    }

    const addWellInfo = (name, key, cb)=>{
        if(!props.info)return;
        if(props.info?.[key]){
            cb();
            return;
        }

        getWellInfo(
            props.info['Ид_скважины'],
            name,
            (res)=>{
                map.extendWell(props.info['Ид_скважины'], key, res[key])
 
                if(!props.info['Траектория']){
                    map.extendWell(props.info['Ид_скважины'], 'Траектория', res['Траектория']);
                }

                cb();
            }
        );        
    }

    const addWellDesign = (cb)=>{
        const key = 'Конструкция';

        if(!props.info)return;
        if(props.info?.[key]){
            cb();
            return;
        }

        getWellDesign(
            props.info['Ид_скважины'],
            (res)=>{
                map.extendWell(props.info['Ид_скважины'], key, res);
                cb();
            }
        );    
    };


    onMounted(getFullInfo);
    watch(()=>props.info['Ид_скважины'], getFullInfo);

//top-resize
    const topRef = ref(null);
    let isDrag = null

    const topHeight = ref(175); 
    
    const resize = (e)=>{
        if(!isDrag)return;

        if (document.selection) {
            document.selection.empty()
        } else {
            window.getSelection().removeAllRanges()
        }

        topHeight.value = e.clientY - topRef.value.getBoundingClientRect().top + 'px';
    }

    const resizeStart = ()=>{
        isDrag = true;
    }

    const resizeStop = ()=>{
        isDrag = false;
    }

//Пропластки
    const proplastki = computed(()=>{
        let arr = props.info['Пропластки'];

        if(!arr)return[];

        return arr.map(e => { 
            return {
                top: e['Кровля'],
                height: e['Подошва'] - e['Кровля'],
                type: e['Литотип'],
                sat: e['Насыщение'],
            }
        })
    })    

//layers
    const layers = computed(()=>{
        let arr = props.info['Стратиграфия'];

        if(!arr)return[];

        let res = arr.map(e => {
            return {
                top: e['Кровля'],
                height: (e['Подошва']||props.info['Подошва_инкл']||props.info['Подошва_fake']) - e['Кровля'],
                title: e['Пласт']?.['Пласт'] || `Пласт ${e['Ид_пласта']}`,
                id: e['Ид_пласта'],
                z: e.TVDSS,
                x: e['Поправка_x_кровля'],
                y: e['Поправка_y_кровля']
            }
        });

        scrlTo((res[0]?.top * (stepH.value / step.value)) - 250);

        return res;
    })

//Curves
    const curves = ref([]);
    const curvesLg = ref([]);

    const curvesDrop = ref(false);
    const curvesDropLg = ref(false);

    const fillCurves = ()=>{
        curves.value = [];
        curvesLg.value = [];
        if(!(props.info['Кривые'] && props.info['Кривые'].length))return;

        let defaultCurves = ['PS', 'GK']

        curves.value = JSON.parse(JSON.stringify(props)).info['Кривые'].map((obj, k) =>{
            if(!obj)return;

            let path = obj['Кривая'].map((e, pk) => {
                // console.log(e, Math.log(e));
                return{
                    depth: obj['Кровля']+(obj['Шаг']*pk),
                    X: e,
                    XLog: Math.log(e) || 0,
                }
            }).filter(e => e.X > obj['Отказ']);

            let isDefault = false;
            if(defaultCurves.includes(obj['Имя']) && path.length){
                isDefault = true;
                defaultCurves = defaultCurves.filter(e => e != obj['Имя']);
            }

            return {
                name: obj['Имя'],
                step: obj['Шаг'],
                path,
                date: obj['Дата']?beautifyDate(new Date(obj['Дата'])):null,
                range: [Math.min(...path.map(e => e.X)), Math.max(...path.map(e => e.X))],
                rangeLog: [Math.min(...path.map(e => e.XLog)), Math.max(...path.map(e => e.XLog))],
                active: isDefault
            }
        })
        .filter(e => e.path.length)
        .sort((a,b)=>{
            if ( a.name < b.name ) return -1;
            if ( a.name > b.name ) return 1;
            return 0;
        });

        curvesLg.value = JSON.parse(JSON.stringify(curves.value));

        // console.log(props.info['Кривые'].filter(e => e['Имя'] == 'GK'));
    };

    watch(()=>props.info['Кривые'], fillCurves);
    onMounted(fillCurves);

    const activeCurves = computed(()=>curves.value.filter(e => e.active).map((e,k,arr)=>{
        let res = e;
        res.color = "hsl(" + (360/arr.length)*k + " 50% 50%)";
        return res;
    }));
    
    const activeCurvesLg = computed(()=>curvesLg.value.filter(e => e.active).map((e,k,arr)=>{
        let res = e;
        res.color = "hsl(" + (360/arr.length)*k + " 50% 50%)";
        return res;
    }));

//scroll
    const tableRef = ref(null);
    let relativeScroll = 0;

    const scrollHandler = ()=>{
        const scrl = tableRef.value?.scrollTop || 0;

        if(map.syncScroll){
            //const maxScr = map.minPadheight*stepH.value/2.5 - 441 - tableRef.value.style.height;
            map.currentScroll = scrl - relativeScroll;//(scrl<=maxScr)?scrl:maxScr;
        }

        // if(props.localId == 0)map.primaryScroll = scrl;

        setScrollToLayer(0);
    };

    const scrlTo = (scrl)=>{
        setTimeout(()=>
            tableRef.value?.scrollTo(0, scrl)
        );
    }

    //syncScroll
        watch(()=>map.syncScroll, (e)=>{
            if(e){
                relativeScroll = tableRef.value?.scrollTop || 0;
                // scrlTo(map.currentScroll);
            }
        })

        watch(()=>map.currentScroll, (scrl)=>scrlTo(relativeScroll + scrl))

    //layerScroll
        watch(()=>map.scrollToLayerId, (id, old)=>{
            if(old != id && id){
                map.syncScroll = false;
                setTimeout(()=>
                    scrlTo(layers.value.find(e => e.id == id)?.top * (stepH.value / step.value))
                )
            }
        })

        const setScrollToLayer = (id)=>{
            map.scrollToLayerId = id;
        }

    //panToHeight
        watch(()=>map.scrollToheight, (h)=>{
            map.syncScroll = false;
            setTimeout(()=>
                scrlTo(h * (stepH.value / step.value))
            )
        })

        const panToHeight = (height)=>{
            map.scrollToheight = height;
        }

//report
    const getWellReport = ()=>{
        downloadWellReport(
            props.info['Скважина'],
            props.info['Ид_скважины'],
            map.activeField.dbName,
            res => console.log(res)
        )
    }
    
    const getLocalWellReport = ()=>{
        getReportData(
            props.info['Ид_скважины'],
            map.activeField.dbName,
            res => {
                let data = res;

                Camera().getReportPhotos(
                    props.info,
                    data,
                    (res)=>{
                        generateDocument(
                            data.well.wellName,
                            "/report.docx",
                            Object.assign(data, res)
                        );
                    }
                )
            }
        )
    }

</script>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .well-chart{
        // width: 260px;
        flex-shrink: 0;
        height: 100%;
        background: var(--bg-default);
        @include flex-col;

        .top{
            @include flex-jtf;
            padding: 3px 7px 3px 17px;

            .title{
                display: flex;
                gap: 7px;
                padding: 5px 7px 5px 0;
                width: 100%;

                .switch-btns{
                    display: flex;

                    .btn{
                        @include flex-c;
                        align-self: center;
                        height: 18px;
                        width: 18px;
                        cursor: pointer;
                        transition: .3s;
                        border-radius: 4px;
                        color: var(--bg-border-focus);

                        &:hover{
                            background: var(--bg-ghost);
                        }
                        
                        &.l{
                            transform: rotate(.25turn);
                        }

                        &.r{
                            transform: rotate(-.25turn);
                        }
                    }
                }

                h4{
                    font-weight: 700;
                    font-size: 14px;
                    word-break: break-word;
                }

                .info{
                    height: 16px;
                    width: 16px;
                    flex-shrink: 0;
                    margin-top: 1px;
                    cursor: pointer
                }
            }

            .options{
                position: relative;
                padding: 4px 0;

                .btn.caller{
                    height: 24px;
                    width: 24px;
                    min-height: unset;
                    padding: 0;
                    flex-shrink: 0;
                    @include flex-c;
                }

                .drop{
                    position: absolute;
                    z-index: 10;
                    top: calc(100%);
                    right: -10px;
                    background: var(--bg-default);
                    border: 1px solid var(--bg-border);
                    border-radius: 4px;
                    padding: 4px 0; 
                    width: 220px;
                    transition: .3s;

                    .option{
                        display: flex;
                        padding: 0 4px;
                        font-size: 14px;
                        cursor: pointer;
                        gap: 4px;

                        &:hover{
                            background: var(--bg-ghost);
                        }

                        p{
                            padding: .25em 0;
                        }

                        .ico-wr{
                            width: 24px;
                            height: 24px;
                            flex-shrink: 0;
                            @include flex-c;
                        }
                    }
                }

                &:not([drop]){
                    .drop{
                        @include hidden(-10px);
                    }
                }
            }

            .cross-wr{
                @include flex-c;
                cursor: pointer;
                position: relative;
                transition: .3s;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                flex-shrink: 0;

                .cross{
                    color: var(--c-icon-button);
                    height: 12px;
                    width: 12px;
                    transition: .3s;
                }

                &::before{
                    @include pseudo-absolute;
                    height: 100%;
                    width: 100%;
                    border-radius: 50%;
                    transition: .3s;
                }

                &:hover{
                    &::before{
                        background: var(--bg-ghost);
                    }

                    .cross{
                        color: var(--bg-border-focus);
                    }
                }

                &:active{
                    &::before{
                        transition: 0s;
                        background: var(--bg-border);
                    }
                }
            }
            
        }

        .table{
            position: relative;
            overflow-y: auto;
            height: 100%;
            @include flex-col;
            overflow-y: scroll;

            .col{
                flex-shrink: 0;
                border: 0 solid var(--bg-border);
                border-right-width: 1px;
                @include flex-c;
            }

            .layer{
                width: 27px;
            }

            .depth{
                width: 70px;
            }

            .design{
                width: 70px;
            }

            .lithology{
                width: 27px;
            }

            .gis{
                width: 138px;
                min-width: 0;
            }

            .table-top{
                width: 100%;
                height: 175px;
                position: sticky;
                left: 0;
                top: 0;
                flex-shrink: 0;
                background: #fff;
                @include flex-col;
                z-index: 3;
                min-height: 70px;

                .container{
                    display: flex;
                    height: calc(100% - 15px);
                    overflow: hidden;
                    
                    .col{
                        padding: 5px 0;
                        position: relative;

                        h5{
                            transform: rotate(-0.25turn);
                            font-size: 14px;
                            font-weight: 600;
                            max-height: 100%;
                            text-align: center;
                        }
                    }

                    .gis{
                        @include flex-col;
                        position: relative;

                        h5{
                            @include flex-c;
                            font-size: 14px;
                            font-weight: 600;
                            height: 27px;
                            flex-shrink: 0;
                            gap: .3em;

                            span{
                                padding-top: 1px;
                                font-size: .7em;
                            }
                        }

                        .border{
                            width: calc(100% - 6px);
                            @include flex-c;
                            border: solid var(--graph-blue);
                            border-width: 1px 1px 0 1px;
                            height: 6px;
                            margin: 0 3px;
                            flex-shrink: 0;

                            &::after{
                                @include pseudo;
                                width: 1px;
                                height: 100%;
                                background: var(--graph-ghost);
                            }
                        }

                        .scales{
                            @include flex-jtf;
                            font-size: 12px;
                            padding: 0 3px;
                            flex-shrink: 0;

                            .num{
                                width: 100%;
                                color: var(--graph-ghost);
                                
                                &:first-child,
                                &:last-child{
                                    font-weight: 600;
                                    color: #000;
                                }

                                &:nth-child(2){
                                    text-align: center
                                }

                                &:last-child{
                                    text-align: right;
                                }
                                
                            }
                        }

                        .chart{
                            height: 100%;
                            @include flex-c;
                            &::after{
                                @include pseudo;
                                width: 1px;
                                height: 100%;
                                border-left: 1px dashed var(--graph-ghost);
                            }

                        }
                    }

                    .top-drop{
                        &-spacer{
                            height: 0px;
                            flex-shrink: 0;
                        }

                        &-vars{
                            height: 100%;
                            width: 100%;
                            @include flex-col;
                            position: absolute;
                            z-index: 1;
                            transition: .3s;

                            .caller{
                                margin: 0 4px 2px;
                                height: 20px;
                                width: 20px;
                                flex-shrink: 0;
                                @include flex-c;
                                cursor: pointer;
                                color: var(--typo-ghost);
                                transition: .3s;
                                border-radius: 4px;

                                &:hover{
                                    background: var(--bg-ghost);
                                }

                                .ico{
                                    transition: .3s;
                                }
                            }

                            .list{
                                overflow-y: auto;
                                padding: 1px 0;
                                transition: .3s;

                                .item{
                                    padding: 1px 4px;
                                }
                                
                                background: var(--bg-default);
                            }

                            &:not([drop]){
                                .list{
                                    @include hidden(-10px);
                                }
                            }

                            &[drop]{
                                background: var(--bg-default);
                                .caller{
                                    .ico{
                                        rotate: .5turn;
                                    }
                                }
                            }
                        }
                    }

                    .top-drop-vars{
                        font-size: 12px;
                    }

                    .depth{
                        label{
                            display: flex;

                            span{
                                display: flex;
                                width: 100%;
                            }
                        }

                        :deep(.text-input){
                            .content{
                                height: 16px;
                                width: 100%;

                                input{
                                    padding: 0 1px;
                                    display: block!important;
                                }
                            }
                        }
                    }
                }

                .drag{
                    height: 15px;
                    width: 100%;
                    border: solid var(--bg-border);
                    border-width: 1px 0;
                    cursor: row-resize;
                    padding: 2px 0;
                    flex-shrink: 0;

                    .block{
                        background: var(--bg-ghost);
                        height: 100%;
                        @include flex-c;
                        img{
                            width: 13px;
                        }
                    }

                }
            }

            .charts{
                display: flex;
                padding: 10px 0;

                &.placeholder{
                    .loader{
                        text-align: center;
                        width: 100%;
                        color: var(--typo-ghost);
                        animation: pulse .6s linear alternate infinite;
                        @include pulse-anim;
                    }
                }
            }

        }
    
        // &[photo-mode]{
        //     .table .table-top .container h5,
        //     .table .charts .layer .block p{
        //         transform: rotate(-.25turn);
        //         writing-mode: inherit;
        //         text-overflow: clip;
        //         overflow: visible;
        //     }

        //     .table .table-top .container .gis h5{
        //         transform: none;
        //     }
        // }

        // &[photo-chart]{
        //     height: auto;
        // }

        .gis-log{
            border-left: 1px solid var(--bg-border);

            &[shrunk]{
                width: 0;
                overflow: hidden;
            }
        }
    }
</style>