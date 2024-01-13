<template>
    <div 
        class="map" 
        v-if="user.isLogged" 
    >
        <LMap 
            id="mapPhoto"
            ref="map" 

            :zoom="6" 
            :center="[0,0]"
            :zoomControl="false"
            :options="{
                zoomControl: false,
                removeOutsideVisibleBounds: true
            }"
            
            @ready="init" 
            @zoom="()=>{
                updateCurrentZoom();
                updateBounds();
            }"
            @moveend="()=>{
                updateBounds();
            }"
        >
            <LTileLayer :url="`${cfg.maps}/{z}/{x}/{y}.png`"/>

            <!-- wells -->
                <template v-if="mapStore.mapItemsLoaded">
                    <LMarker 
                        v-for="(i,k) in visibleWells" 
                        :key="k" 
                        :lat-lng="{lat: i['Коорд_y'], lng: i['Коорд_x']}" 
                        :interactive="false"
                    >
                        <LIcon>
                            <div 
                                class="marker-wr" 
                                :active="well?.['Ид_скважины'] == i['Ид_скважины'] || null"
                            >   
                                <div class="point"></div>
                                <div class="number">{{i['Скважина']}}</div>
                            </div>
                        </LIcon>
                    </LMarker>
                </template>

            <!-- trajectory -->
                <template v-if="false">
                    <LPolyline
                        v-for="(i,k) in visibleTrajectoryWells"
                        :key="k"

                        :lat-lngs="i.trajectory.full"
                        color="#888"
                        :interactive="false"
                        :weight="1"
                    />
                </template>

                <LMarker 
                    v-for="(i,k) in layerEntranceWells" 
                    :key="k" 
                    :lat-lng="{lat: i.trajectory.entrance?.coords.lat || i['Коорд_y'], lng: i.trajectory.entrance?.coords.lng || i['Коорд_x']}" 
                    :interactive="false"
                >
                    <LIcon>
                        <div 
                            class="marker-wr layer-entrance-marker"
                        >   
                            <div class="point"></div>
                            <div class="number">{{i['Скважина']}}</div>
                        </div>
                    </LIcon>
                </LMarker>
        </LMap>
    </div>
</template>

<script setup>
    import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
    import { roundedVal } from '@/script/formatters.js';

    import { useMapStore } from "@/stores/map.js"
    import { useUserStore } from "@/stores/user.js"
    import { useProductionStore } from "@/stores/production.js"
    
    import "leaflet/dist/leaflet.css";
    import { LMap, LTileLayer, LMarker, LIcon, LPolyline, LPolygon, LControlZoom, LCircle, LRectangle } from "@vue-leaflet/vue-leaflet";
    import LGU from "leaflet-geometryutil";

    import _ from "lodash";

    import cfg from "@/config.json";

    import Camera from "@/stores/camera.js"

    const well = computed(()=>Camera().reportWell);

    const mapStore = useMapStore();
    const user = useUserStore();
    const prod = useProductionStore();

    const map = ref(null);
    const mapObj = computed(()=>map.value?.leafletObject);
    const init = ()=>{
        setTimeout(()=>updateBounds());
    };

    //well
        const panToWell = ()=>{
            if(!well.value)return;
            
            mapObj?.value?.setView(
                [
                    well.value['Коорд_y'],
                    well.value['Коорд_x']
                ],
                16
            );

            setTimeout(()=>mapObj?.value?.invalidateSize());
        }

        onMounted(panToWell);
        watch(()=>well.value?.['Ид_скважины'], panToWell);

    //trajectory
        const visibleTrajectoryWells = computed(() => 
            visibleWells.value.map(e => {
                e.trajectory = trajectoryToCoords(e, true);
                return e;
            })
        );

        const trajectoryToCoords = (well)=>{
            if(!well)return {full: [],selected: []};

            let res = {
                full: [{lat: well['Коорд_y'], lng: well['Коорд_x']}],
                selected: []
            };

            if(!well['Траектория'])return res;


            let last = {X: 0, Y: 0};

            let selectedBorders = [-1,-1];

            if(well['Стратиграфия']?.length){
                if(mapStore.activeLayerDisplay){
                    const layer =  well['Стратиграфия'].find(e => e['Пласт']['Ид_пласта'] == mapStore.activeLayer['Ид_пласта']);
                    if(layer)selectedBorders = [layer['Кровля'], (layer['Подошва']||well['Подошва_инкл']||well['Подошва_fake'])]
                }else if(mapStore.activeObjectDisplay){
                    selectedBorders = [
                        well['Стратиграфия'].find(e => e['Пласт']['Пласт'] == mapStore.activeObjectDisplay['Верхний_страт_пласт'])?.['Кровля'] || -1,
                        well['Стратиграфия'].find(e => e['Пласт']['Пласт'] == mapStore.activeObjectDisplay['Нижний_страт_пласт'])?.['Подошва'] || -1
                    ]
                }
            }

            well['Траектория'].forEach(e => {                
                // if(
                //     e.Y == last.Y && 
                //     e.X == last.X && 
                //     !(selectedBorders[0] != -1 && e['Глубина'] >= selectedBorders[0] && e['Глубина'] <= selectedBorders[1])
                // )return;

                last.X = e?.X||0;
                last.Y = e?.Y||0;

                let coords = LGU.destination(
                                {lat: well['Коорд_y'],lng: well['Коорд_x']}, 
                                (360+Math.round(Math.atan2(e.Y, e.X) * 180/Math.PI))%360, 
                                Math.sqrt(e.X*e.X + e.Y*e.Y)
                            )

                res.full.push(coords);

                if(selectedBorders[0] != -1 && e['Глубина'] >= selectedBorders[0] && e['Глубина'] <= selectedBorders[1]){
                    //console.log('!', res.entrance);
                    if(!res.entrance){
                        res.entrance = {
                            'Глубина': e['Глубина'],
                            Z: e.Z,
                            coords
                        }
                    }
                    res.selected.push(coords);
                }
            })
            
            return res;
        }

        const layerEntranceWells = computed(()=>visibleTrajectoryWells.value.filter(e => e.trajectory.entrance));

//clusters
    const currentZoom = ref(6);

    const updateCurrentZoom = ()=>{
        currentZoom.value = currentZoom.value = mapObj.value.getZoom();
    }

    const isClusters = computed(()=>currentZoom.value<13);

    //wells
        const bounds = ref({});
        const visibleWells = ref([]);
        const visibleWellsIds = computed(()=>visibleWells.value.map(e => e['Ид_скважины']));

        const updateBounds = ()=>{
            bounds.value = mapObj.value.getBounds();

            const ext = false?0.017:0.0001; //tmp

            visibleWells.value = [];
            
            setTimeout(()=>{
                visibleWells.value = !isClusters.value?
                    mapStore.allWells.filter(e => 
                        e['Коорд_x']<=bounds.value._northEast.lng + ext && 
                        e['Коорд_x']>=bounds.value._southWest.lng - ext &&
                        e['Коорд_y']<=bounds.value._northEast.lat + ext && 
                        e['Коорд_y']>=bounds.value._southWest.lat - ext
                    )
                :[]
            })
        }
</script>

<style>
    .leaflet-control-zoom{
        display: none;
    }
</style>

<style lang="scss" scoped>
    @import '@/style/mixins.scss';

    .loader{
        @include flex-c;
        z-index: 1001;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background: #fff;

        .sign{
            color: var(--typo-secondary);
            font-size: 18px;
        }

        @include pulse-anim;

        &[show]{
            animation: pulse .8s linear alternate infinite;
        }

        &:not([show]){
            @include hidden(0);
        }
    }

    .map{
        z-index: 1;
        position: relative;
        height: 100%;
        width: 100%;

        .marker-wr{
            position: relative;
            @include flex-c;
            height: 12px;
            width: 12px;
            cursor: pointer;
            transform: translate(-50%, -50%);

            .point{
                height: 50%;
                width: 50%;
                border-radius: 50%;
                background: var(--c-dark);
                flex-shrink: 0;
            }

            .number{
                position: absolute;
                left: 100%;
                white-space: nowrap;
            }

            &[inactive]{
                --color: #c1c1c1;

                .point{
                    background: var(--color)!important;
                }

                .number{
                    color: var(--color);
                }
            }

            &[active]{
                --color: var(--c-blue);

                .point{
                    background: var(--color)!important;
                    height: 7px;
                    width: 7px;
                }

                .number{
                    color: var(--color);
                    font-weight: 600;
                }
            }

            .description{
                position: absolute;
                left: 0;
                bottom: calc(100% + 8px);
                background: var(--c-dark);
                padding: 8px;
                border-radius: 4px;
                opacity: .85;
                transition: .3s;
                
                pointer-events: none;

                *{
                    color: var(--c-white);
                }

                h3{
                    font-size: 14px;
                    font-weight: 700;
                    white-space: nowrap;
                }

                p{
                    white-space: nowrap;
                }

                &::after{
                    @include pseudo-absolute;
                    @include directions(100%, 0, auto, 0);
                    height: 8px;
                }

                &::before{
                    @include pseudo-absolute;
                    @include directions(100%, auto, 8px, auto);
                    height: 8px;
                    width: 8px;
                    border-style: solid;
                    border-width: 5px 5px 0 5px;
                    border-color: var(--c-dark) transparent transparent transparent;
                }
            }

            &:not(:hover){
                .description{
                    @include hidden(10px);
                }
            } 
        }

        .layer-entrance-marker{
            .number{
                color: var(--c-yellow)
            }

            .point{
                background: var(--c-yellow);
            }
        }

        .cluster-wr{
            padding: 1px;
            background: var(--bg-border-focus);
            pointer-events: none;
            transform: translate(-50%, -50%);

            .cluster{
                background: var(--typo-ghost);
                padding: 1px 5px;
                white-space: nowrap;
                color: var(--c-white);
            }

            &[inactive]{
                background: #88888844;

                .cluster{
                    background: #aaaaaa88;
                }
            }
        }

        .constrols{
            z-index: 401;
            position: absolute;
            width: 34px;
            @include flex-col;
            gap: 10px;
        
            .container{
                border: 1px solid var(--bg-border);
                border-radius: 4px;
                position: relative;
                background: var(--bg-default);
                transition: .3s;

                &[hide]{
                    @include hidden-hor(-50%);
                }

                .item{
                    height: 32px;
                    @include flex-c;
                    cursor: pointer;
                    background: #EDF2F4;
                    border-radius: 4px;
                    transition: .3s;
                    position: relative;

                    &[active]{
                        background: var(--bg-default);
                    }

                    &:hover{
                        background: #6aafd847;
                    }

                    .title{
                        position: absolute;
                        top: 0;
                        left: 110%;
                        bottom: 0;
                        margin: auto;
                        height: min-content;
                        width: max-content;
                        background: var(--c-white);
                        padding: 1px 5px;
                        border-radius: 4px;
                        border: 1px solid var(--bg-border);
                        pointer-events: none;
                        transition: .3s;
                        opacity: .7;
                        max-width: 200px;
                    }

                    &:not(:hover){
                        .title{
                            @include hidden-hor(-10px)
                        }
                    }
                }

                .drop{
                    position: absolute;
                    top: calc(100% + 1px);
                    width: calc(100% + 2px); 
                    left: -1px;
                    border-radius: 0 0 4px 4px;
                    border: 1px solid var(--bg-border);
                    border-top-width: 0;
                    transition: .3s;
                    background: var(--bg-default);
                    
                    &:after{
                        @include pseudo-absolute;
                        top: -4px;
                        left: -1px;
                        width: calc(100% + 2px);
                        height: 4px;
                        border: 1px solid var(--bg-border);
                        border-width: 0 1px 0 1px;
                    }

                    &:not([drop]){
                        @include hidden(-10px);
                    }
                }

                
            }
        }

        .selection-caption{
            position: absolute;
            left: 52px;
            top: 15px;
            z-index: 500;
            color: var(--typo-ghost);
            pointer-events: none;
        }

        .layers{
            right: 10px;
            top: 10px;

            .container .item{
                .title{
                    left: auto;
                    right: 110%;
                }

                &:not(:hover){
                    .title{
                        @include hidden-hor(10px)
                    }
                }
            }   
        }

        .zoom-controls{
            .item{
                font-size: 24px;
            }
        }

        .tools{
            left: 10px;
            top: 10px;
            border-radius: 4px;
        }

        &[selection]{
            cursor: crosshair!important;
        }

        .ruler-point{
            height: 5px;
            width: 5px;
            background: var(--c-dark);
            transform: translate(-50%, -50%);
            pointer-events: none;
        }
        
        .ruler-number{
            background: var(--c-dark);
            transform: translate(-50%, -130%);
            pointer-events: none;
            background: var(--bg-default);
            white-space: nowrap;
            font-size: 12px;
            padding: 0 3px;
            border-radius: 3px;
            border: 1px solid var(--c-dark);
            display: flex;
            gap: 3px;

            .cross-wr{
                height: 18px;
                width: 18px;
                border-radius: 50%;
                transition: .3s;

                @include flex-c;

                &:hover{
                    background: var(--bg-ghost);
                }

                .cross{
                    width: 55%;
                    height: 55%;
                }
            }
        }

        .prod-select{
            position: absolute;
            bottom: 10px;
            right: 10px;
            z-index: 401;
            display: flex;
            gap: 15px;
            
            :deep(.select-wr){
                .title{
                    background: var(--bg-default);
                    border: 1px solid var(--bg-border);
                }

                .drop{
                    width: max-content;
                    @include directions(auto, 0, 100%, auto);
                }

                &:not([drop]){
                    .drop{
                        @include hidden(-10px);
                    }
                }
            }

            .prod-marker-wr{
                border: 1px solid var(--bg-border);
                background: var(--bg-default);
                border-radius: 4px;
                align-items: center;
                font-size: 14px;
                padding: 0 15px;

                display: flex;
                gap: 3px;

                .num{
                    display: flex;
                    gap: 3px;
                    color: var(--typo-ghost);
                }
            }
        }

        .prod-info-marker{
            position: relative;

            .prod-marker-wr{
                position: absolute;
                right: 10px;
                top: 0;
                display: flex;
                transform: translateY(-50%);
                gap: 3px;

                .num{
                    display: flex;
                    gap: 3px;
                }
            }
        }

        .prod-circle{
            width: var(--rad);
            height: var(--rad);
            opacity: .5;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }

        .poly-item{
            &::before{
                @include pseudo-absolute;
                height: 300%;
                width: 10px;
                right: 100%;
                top: -1px;
            }

            &:hover{background: var(--bg-secondary)!important;}
            &[active]:hover{background: var(--bg-default)!important;}

            &:not(:hover){
                .display{
                    
                    @include hidden-hor(10px);
                }

                &::before{
                    pointer-events: none;
                }
            }

            .display{
                position: absolute;
                right: calc(110%);
                top: -1px;
                border: 1px solid var(--bg-border);
                border-radius: 4px;
                background: var(--c-white);
                width: 250px;
                transition: .3s;
                
                .top{
                    padding: 4px 10px;
                    background: var(--bg-ghost);
                    color: var(--typo-ghost);
                }

                .content{
                    padding: 4px 0;
                    max-height: 300px;
                    overflow-y: auto;
                    min-height: 29px;

                    .info, 
                    .option{
                        padding: 4px 10px;
                    }

                    .option{
                        cursor: pointer;
                        display: flex;
                        gap: 8px;

                        &[hov]{
                            &:hover{
                                background: var(--bg-ghost);
                            }
                        }

                        .status{
                            height: 14px;
                            width: 14px;
                            border: 1px solid var(--bg-border);
                            flex-shrink: 0;
                            margin-top: 4px;
                            border-radius: 4px;
                            transition: .2s;
                        }

                        .loading{
                            height: 14px;
                            width: 14px;
                            background: center no-repeat url(/img/spinner.svg);
                            background-size: 170%;
                            flex-shrink: 0;
                            margin-top: 6px;
                        }

                        &:hover{
                            .status{
                                background: var(--bg-ghost);
                            }
                        }

                        &[active]{
                            .status{
                                background: var(--typo-ghost);
                            }
                        }
                    }
                }
            }
        }

        .polyMapContainer{
            opacity: .7;
            @include flex-col;

            img{
                width: 100%;
                height: 100%;
            }
        }

        .poly-legend{
            position: absolute;
            bottom: 10px;
            left: 10px;
            z-index: 401;
            background: var(--bg-default);
            border-radius: 4px;
            padding: 2px 5px;
            border: 1px solid var(--bg-default);
            
            .item{
                display: flex;
                gap: 5px;
                align-items: center;
                font-size: 12px;

                .color{
                    height: 1.2em;
                    width: 1.2em;
                }
            }
        }
    }

    .testTable{
        position: absolute;
        top: 0;
        left: 0;
        z-index: 9999;

        .row{
            display: flex;

            .cell{
                width: 1px;
                height: 1px;
            }
        }
    }
    
</style>

<style lang="scss">
    .leaflet-control-attribution{
        display: none!important;
    }

    .leaflet-control-zoom{
        border: 1px solid var(--bg-border)!important;
        user-select: none;

        .leaflet-control-zoom-in,
        .leaflet-control-zoom-out{
            width: 32px!important;
            height: 32px!important;
        }

        .leaflet-touch .leaflet-bar a{

            &:first-child{
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
            }

            &:last-child {
                border-bottom-left-radius: 4px;
                border-bottom-right-radius: 4px;
            }
        }


        .leaflet-control-zoom-in{
            border: none;
        }
    }

    .leaflet-shadow-pane{
        display: none;
    }

    [alt="Marker"]{
        height: 6px!important;
        width: 6px!important;
        background: #000;
        filter: brightness(0);
        border-radius: 90%;
        overflow: hidden;
        margin: -3px!important;
        pointer-events: none!important;

    }
</style>