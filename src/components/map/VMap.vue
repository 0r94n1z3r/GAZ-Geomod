<template>
    <div 
        class="map" 
        v-if="user.isLogged" 
        :selection="selectionMode || null"
        v-click-outside="flushSelection"
    >
        
        <div class="loader" :show="!map.mapItemsLoaded || null">
            <div class="sign">Загрузка...</div>
        </div>

        <LMap 
            id="map"
            ref="lmap" 

            :zoom="6" 
            :center="map.center"
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
                resizePoly();
            }"
            @mousedown="(e)=>{
                if(selectionMode)selectionStart(e);
                map.resize();
                rullerClickAllowed = true;
            }"
            @mousemove="(e)=>{
                if(selectionActive)selectionMove(e)
                rullerClickAllowed = false;
            }"
            @mouseup="(e)=>{
                if(selectionActive)seletionEnd(e)
                rulerClick(e);
            }"
        >
            <LTileLayer :url="`${cfg.maps}/{z}/{x}/{y}.png`"/>
            <LControlZoom position="topright"/>

            <!-- wells -->
                <template v-if="isActiveTool('wells') && map.mapItemsLoaded">
                    <template v-if="isClusters">
                        <LMarker
                            v-for="(i,k) in map.clusters.clusters" 
                            :key="k"
                            :lat-lng="i.coords"
                        >
                            <LIcon>
                                <div 
                                    class="cluster-wr"
                                    :inactive="!map.highlightedClustersIDs.includes(i.name) || null"
                                >   
                                    <div class="cluster">
                                        {{i.name}}
                                    </div>
                                </div>
                            </LIcon>
                        </LMarker>
                    </template>
                    <template v-else>
                        <LMarker 
                            v-for="(i,k) in visibleWells" 
                            :key="k" 
                            :lat-lng="{lat: i['Коорд_y'], lng: i['Коорд_x']}" 
                            :interactive="false"
                            @click="()=>{
                                if(rulerObj.active){
                                    map.switchActiveState(i['Ид_скважины'])
                                }
                            }"
                        >
                            <LIcon>
                                <div 
                                    class="marker-wr" 
                                    :active="map.activeWellsIDs.includes(i['Ид_скважины']) || null"
                                    :inactive="!map.highlightedWellsIDs.includes(i['Ид_скважины']) || null"
                                >   
                                    <div class="point"></div>
                                    <div class="number">{{i['Скважина']}}</div>
                                    <div class="description">
                                        <h3>Скважина: {{i['Скважина']}}</h3>
                                        <p>Категория: {{i?.['Категория_скважины']?.[0]?.['Категория']}}</p>
                                        <p>Участок: {{i['Участки']?.[0]?.['Название']}}</p>
                                        <p>Куст: {{i['Номер_куста']}}</p>
                                    </div>
                                </div>
                            </LIcon>
                        </LMarker>
                    </template>
                </template>

            <!-- connections -->
                <LPolyline
                    :lat-lngs="map.activeWells.map(e => {return {lat: e['Коорд_y'], lng: e['Коорд_x']}})"
                    color="var(--c-blue)"
                    :interactive="false"
                    :weight="2"
                    v-if="isActiveTool('links')"
                />

            <!-- production -->
                <template v-if="bumbBtn.active && !isClusters">
                    <LMarker 
                        v-for="(i,k) in prodListToShow" 
                        :key="k" 
                        :lat-lng="{lat: i['Коорд_y'], lng: i['Коорд_x']}" 
                    >
                        <LIcon>
                            <div 
                                class="prod-circle"
                                :style="{
                                    background: i.grad,
                                    'border-radius': '100%',
                                    '--rad': `calc(100px * ${i.radius})`
                                }"
                            ></div>
                        </LIcon>
                    </LMarker>

                    <LMarker 
                        v-for="(i,k) in prodListToShow" 
                        :key="k" 
                        :lat-lng="{lat: i['Коорд_y'], lng: i['Коорд_x']}" 
                    >
                        <LIcon>
                            <div class="prod-info-marker">
                                <div class="prod-marker-wr">
                                    <div v-for="(j,f) in i.bumbles" :key="f" class="num">
                                        {{roundedVal(bumbMin[f], activeProdMode.id == 0?j.value:j.qvalue).value}} 
                                        <span v-if="f != i.bumbles.length - 1">/</span>
                                    </div>
                                </div>
                            </div>
                        </LIcon>
                    </LMarker>
                </template>


            <!-- ruler -->
                <LPolyline
                    :lat-lngs="[]"
                    ref="rullerLineRef"
                    color="var(--c-dark)"
                    :interactive="false"
                    :weight="2"
                    v-if="rulerPoints[rulerPoints.length - 1]"
                />
                
                <LMarker 
                    v-for="(i,k) in rulerPoints" 
                    :key="k" 
                    :lat-lng="i"
                    @drag="rulerPoints[k] = $event.latlng"
                    :draggable="true"
                >
                    <LIcon>
                        <div class="ruler-point"></div>
                    </LIcon>
                </LMarker>

                <LMarker 
                    :lat-lng="rulerPoints[k + 1]"
                    :interactive="false"
                    v-for="(i,k) in rullerDistance"
                    :key="k"
                >
                    <LIcon>
                        <div class="ruler-number">
                            {{i}} км
                        </div>
                    </LIcon>
                </LMarker>

            <!-- trajectory -->
                <template v-if="isActiveTool('trajectory')">
                    <LPolyline
                        v-for="(i,k) in visibleTrajectoryWells"
                        :key="k"

                        :lat-lngs="i.trajectory.full"
                        color="#888"
                        :interactive="false"
                        :weight="1"
                    />

                    <LPolyline
                        v-for="(i,k) in visibleTrajectoryWells"
                        :key="k"

                        :lat-lngs="i.trajectory.selected"
                        color="#F38B00"
                        :interactive="false"
                        :weight="3"
                    />
                </template>

                <LMarker 
                        v-for="(i,k) in layerEntranceWells" 
                        :key="k" 
                        :lat-lng="{lat: i.trajectory.entrance?.coords.lat || i['Коорд_y'], lng: i.trajectory.entrance?.coords.lng || i['Коорд_x']}" 
                        :interactive="false"
                        @click="()=>{
                            if(rulerObj.active){
                                map.switchActiveState(i['Ид_скважины'])
                            }
                        }"
                    >
                        <LIcon>
                            <div 
                                class="marker-wr layer-entrance-marker"
                            >   
                                <div class="point"></div>
                                <div class="number">{{i['Скважина']}}</div>
                                <div class="description">
                                    <h3>Скважина: {{i['Скважина']}}</h3>
                                    <p>Категория: {{i?.['Категория_скважины']?.[0]?.['Категория']}}</p>
                                    <p>Участок: {{i['Участки']?.[0]?.['Название']}}</p>
                                    <p>Куст: {{i['Номер_куста']}}</p>
                                    <p>Глубина: {{i.trajectory.entrance?.['Глубина']}}</p>
                                    <p>Z: {{i.trajectory.entrance?.Z.toFixed(2)}}</p>
                                </div>
                            </div>
                        </LIcon>
                </LMarker>

            <!-- selection -->
                <template v-if="selectionActive">
                    <LPolygon
                        :lat-lngs="selectionPolygon"
                        :fill="true"
                        fillColor="#aaa"
                        :fillOpacity="0.2"
                        
                        :stroke="true"
                        :weight="1"
                        color="#aaa"
                        dashArray="7 4"
                    />
                </template>

            <!-- poly -->
                <template v-if="polyOtions[0].activeItems()[0]?.map">
                    <LMarker 
                        :interactive="false" 
                        :lat-lng="{
                            lat: polyOtions[0].activeItems()[0].map['Макс_Y'], 
                            lng: polyOtions[0].activeItems()[0].map['Мин_X']
                        }">
                        <LIcon :interactive="false">
                            <div class="polyMapContainer" id="polyMapTop0" :ref="resizePoly">
                                <img :src="polyOtions[0].activeItems()[0].map['Изображение']" alt="">
                            </div>
                        </LIcon>
                    </LMarker>
                    <LMarker 
                        :interactive="false" 
                        :lat-lng="{
                            lat: polyOtions[0].activeItems()[0].map['Мин_Y'], 
                            lng: polyOtions[0].activeItems()[0].map['Макс_X']
                        }"
                    >
                        <LIcon :interactive="false"><div id="polyMapAncor0"></div></LIcon>
                    </LMarker>
                </template>

                <template :v-if="polyOtions[1].activeItems().length">
                    <LMarker 
                        v-for="(i,k) in polyOtions[1].activeItems().filter(e => e.map)"
                        :key="k"

                        :interactive="false"
                        :lat-lng="{
                            lat: polyOtions[0].activeItems()[0].map['Макс_Y'], 
                            lng: polyOtions[0].activeItems()[0].map['Мин_X']
                        }">
                        <LIcon :interactive="false">
                            <div class="polyMapContainer" :id="`polyMapTop${k+1}`" :ref="resizePoly">
                                <img :src="polyOtions[0].activeItems()[0].map['Изображение']" alt="">
                            </div>
                        </LIcon>
                    </LMarker>
                    <LMarker 
                        v-for="(i,k) in polyOtions[1].activeItems().filter(e => e.map)"
                        :key="k"

                        :interactive="false"
                        :lat-lng="{
                            lat: polyOtions[0].activeItems()[0].map['Мин_Y'], 
                            lng: polyOtions[0].activeItems()[0].map['Макс_X']
                        }"
                    >
                        <LIcon :interactive="false"><div :id="`polyMapAncor${k+1}`"></div></LIcon>
                    </LMarker>
                </template>
            

        </LMap>

        <div class="selection-caption" v-if="selectionMode">Выделите нужные скважины</div>

        <!-- constrols -->
            
            <div class="constrols layers">
                <div class="container zoom-controls">
                    <div 
                        class="item clear"
                        @click="map.mapObj.zoomIn()"
                        active
                    >   
                        +
                    </div>
                    <div 
                        class="item clear"
                        @click="map.mapObj.zoomOut()"
                        active
                    >   
                        -
                    </div>
                </div>

                <div class="container">
                    <div class="item"
                        @click="()=>{if(map.activeAreaDisplay)bumbBtn.active = !bumbBtn.active}"
                        :active="!map.activeAreaDisplay?true:!bumbBtn.active || null"
                    >   
                        <img :src="bumbBtn.img" alt="">
                        <div class="title">{{map.activeAreaDisplay?bumbBtn.title:`${bumbBtn.title} (Выберите участок)`}}</div>
                    </div>
                </div>
                
                <div class="container">
                    <div 
                        class="item poly-item" 

                        v-for="(i,k) in polyOtions" 
                        :key="k" 

                        :active="!i.activeItems?.().length || null"
                    >
                        <img :src="i.img" alt="">
                        <!-- <div class="min" v-if="i.active && i.activeItems().length">{{i.activeItems().length}}</div> -->
                        <div class="display">
                            <div class="top">{{i.title}}</div>
                            <div class="content">
                                <template v-if="i.loading">
                                    <div class="info">Загрузка...</div>
                                </template>
                                <template v-else-if="!i.list.length">
                                    <div class="info" v-if="!map.activeLayerDisplay">Выберите пласт</div>
                                    <div class="info" v-else>{{i.title}} не обнаруженны на данном пласте</div>
                                </template>
                                <template v-else>
                                    <div 
                                        class="option" 
                                        v-for="(j,f) in i.list" :key="f" 
                                        @click="i.switchItem(f)" 
                                        :active="j.active || null"
                                        :hov="i.noCheckboxes"
                                    >   
                                        <div class="loading" src="/img/spinner.svg" alt="" v-if="j.loading"></div>
                                        <div class="status" v-else-if="!i.noCheckboxes"></div>
                                        <div class="name">{{j["Название_объекта"]}}</div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="container">
                    <div 
                        class="item"
                        :active="!false || null"
                        @click="nodesModal.call()"
                    >
                        <img src="/img/map/nodes.svg" alt="">
                        <div class="title">Узловой анализ</div>
                    </div>
                </div>

                <!-- <div class="container">
                    <div class="item" active @click="polyDrop = !polyDrop">
                        <img src="/img/map/layers.svg" alt="">
                    </div>
                    
                    <div class="drop" :drop="polyDrop || null">
                        <div 
                            class="item" 

                            v-for="(i,k) in polyOtions" 
                            :key="k" 

                            @click="i.active = !i.active"
                            :active="!i.active || null"
                        >
                            <img :src="i.img" alt="">
                            <div class="title">{{i.title}}</div>
                        </div>
                    </div>
                </div> -->
            </div>

            <div class="constrols tools">
                <div class="container">
                    <div 
                        class="item"

                        v-for="(i,k) in toolsDisplay[0]"
                        :key="k"

                        :active="!i.active || null"

                        @click="i.clickHandler"
                    >
                        <img :src="i.img" alt="">
                        <div class="title">{{i.title}}</div>
                    </div>
                </div>

                <div class="container">
                    <div 
                        class="item"

                        v-for="(i,k) in toolsDisplay[1]"
                        :key="k"

                        :active="i.active || null"

                        @click="i.clickHandler"
                    >
                        <img :src="i.img" alt="">
                        <div class="title">{{i.title}}</div>
                    </div>
                </div>

                <div class="container" :hide="!map?.activeWells?.length && !rulerPoints.length || null">
                    <div 
                        class="item clear"
                        @click="clearMap"
                        active
                    >
                        <ICross class="cross"/>
                        <div class="title">Очиcтить</div>
                    </div>
                </div>

                <div class="container" :hide="!rulerPoints.length || null">
                    <div 
                        class="item clear"
                        @click="removeRuler"
                        active
                    >   
                        <img src="/img/map/noRuler.svg" alt="">
                        <div class="title">Удалить линейку</div>
                    </div>
                </div>
            </div>

        <!-- production -->
            <div class="prod-select" v-if="map.activeAreaDisplay && bumbBtn.active">
                <div class="prod-marker-wr">
                    <div v-for="(j,f) in prod.productionBubmbles" :key="f" class="num">
                        {{j.title}} {{`(${bumbMin[f]>1000?roundedVal(bumbMin[f], bumbMin[f]).text + ' ':''}${j.unit})`}}
                        <span v-if="f != prod.productionBubmbles.length - 1">/</span>
                    </div>
                </div>
                <VSelect class="select" :list="prodModes" v-model="activeProdMode" keyName="title"/>
            </div>
        
        <!-- poly-legend -->
            <div class="poly-legend">
                <div class="item" v-for="(i,k) in polyLegend" :key="k">
                    <div class="color" :style="{background: i.color}"></div>
                    <div class="num">{{i.depth}}</div>
                </div>
            </div>

        <!-- modals -->
        <Teleport to='body'>
            <EvalModal ref="evalModal"/>
            <NodesModal ref="nodesModal"/>
        </Teleport>
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

    import EvalModal from "./modals/EvalModal.vue";
    import NodesModal from "./modals/nodes/NodesModal.vue";

    import vClickOutside from 'click-outside-vue3/src/v-click-outside';

    import ICross from '@/components/icons/ICross.vue';

    import VSelect from '@/components/ui/VSelect.vue';

    import _ from "lodash";

    import chroma from "chroma-js";

    import cfg from "@/config.json";

    const map = useMapStore();
    const user = useUserStore();
    const prod = useProductionStore();

    const lmap = ref(null);
    const init = ()=>{
        map.init(lmap.value);
        setTimeout(()=>updateBounds());
    };

    const log = (msg)=>console.log(msg);

//modals
    const evalModal = ref();
    const nodesModal = ref();

//poly
    const polyDrop = ref(false);

    const polyOtions = computed(()=>[
        {
            name:'polyMap', 
            img: '/img/map/areaLayers.svg', 
            title: 'Карты', 
            list: map.polyMapList || [],
            loading: map.polyListLoading,
            activeItems(){
                return this.list?.filter(e => e.active) || []
            },
            switchItem(id){
                this.activeItems().forEach((e) => {
                    if(e['Название_объекта'] != this.list?.[id]['Название_объекта']){
                        e.active = false
                    }       
                });

                setTimeout(resizePoly,100);
                if(this.list?.[id]){
                    this.list[id].active = !this.list[id].active;
                    console.log(this.list[id]);
                    map.updatePolyMap(
                        this.list?.[id],
                        ()=>setTimeout(resizePoly,100)
                    );
                } 
            }
        },
        {
            name:'poly', 
            img: '/img/map/area.svg', 
            title: 'Полигоны', 
            list: map.polyList || [],
            loading: map.polyListLoading,
            activeItems(){
                return this.list?.filter(e => e.active) || []
            },
            switchItem(id){
                setTimeout(resizePoly,100);
                if(this.list?.[id]){
                    this.list[id].active = !this.list[id].active;
                    map.updatePolyMap(
                        this.list?.[id],
                        ()=>setTimeout(resizePoly,100)
                    );
                } 
            }
        },
        {
            name:'polyMapEval', 
            img: '/img/map/settings.svg', 
            title: 'Оценка корректности картопостроения',
            notFoundTitle: 'Карты', 
            list: map.polyMapList.filter(e => e["Название_объекта"] != 'карта изменения ГВК') || [], // tmp !!!REPLACE!!! map.polyMapList || [],
            loading: map.polyListLoading,
            switchItem(id){
                evalModal.value.call(this.list[id]);
            },
            noCheckboxes: true
        },
        // {
        //     name:'poly', 
        //     img: '/img/map/settings.svg', 
        //     title: 'Картопостроение', 
        //     list: [],
        //     loading: false
        // },
    ])

    const isActivePoly = (name)=>!!polyOtions.value.find(e => e['Название_объекта'] == name)?.active; 

    const resizePoly = ()=>{
        for (let i = 0; i < polyOtions.value[1].activeItems().length + 1; i++){
            let ancs = [
                document.querySelector(`#polyMapTop${i}`),
                document.querySelector(`#polyMapAncor${i}`)
            ]

            if(
                !ancs[0] || 
                !ancs[0].closest('.leaflet-marker-icon') ||
                !ancs[1] ||
                !ancs[1].closest('.leaflet-marker-icon')
            )return;

            ancs[0].closest('.leaflet-marker-icon').style['pointer-events'] = 'none';

            let t = ancs[0].closest('.leaflet-marker-icon').style.transform.replaceAll('translate3d(', '').split(',').map(e=>parseInt(e));
            let b = ancs[1].closest('.leaflet-marker-icon').style.transform.replaceAll('translate3d(', '').split(',').map(e=>parseInt(e));

            let dims = {
                width: Math.abs(t[0] - b[0]),
                height: Math.abs(t[1] - b[1])
            }

            let obj = document.querySelector('.polyMapContainer');
            if(!obj)return;
            obj.style.height = dims.height + 'px';
            obj.style.width = dims.width + 'px';
        }
    }

    //poly-legend
        const polyLegend = computed(()=>{
            let res = [];

            let mp = polyOtions.value?.[0]?.activeItems()?.[0]?.map;

            if(!mp)return[];

            console.log(mp);
            
            let grad = chroma.scale( ["E600FF", "A300FF", "0736FF", "00A0FF", "00F6F0", "00FF39", "C0FF00", "FFF900", "FF6500", "FF0000", "CC0000"]);

            let range = [
                mp['Минимальное_значение'],
                mp['Максимальное_значение']
            ];

            let step = Math.round(Math.abs(Math.abs(range[1]) - Math.abs(range[0])) / 25);

            while (range[0] < range[1]) {
                res.push({
                    depth: range[0].toFixed(2),
                    color: grad(
                            (range[0] - mp['Минимальное_значение'])/
                            (range[1] - mp['Минимальное_значение'])
                        ).toString()
                })

                range[0] += step;
            }

            res[res.length-1].depth = range[1].toFixed(2);

            res = res.reverse();

            console.log(res);

            return res;
        }) 

//production (Bubmles)
    const bumbBtn = ref({
        img: '/img/map/production.svg', 
        title: "Накопленная добыча",
        active: false
    });

    const prodModes = [
        {id: 0, title: 'Текущая добыча'},
        {id: 1, title: 'Добыча за все время'}
    ];
    const activeProdMode = ref(prodModes[0]);

    const bumbMin = ref(new Array(prod.productionBubmbles.length))

    const prodList = computed(()=>{
        const wells = map.highlightedWells;

        const list = [];

        let range = {
            range: [-1,-1],
            qrange: [-1,-1]
        };

        wells.forEach(e => {
            let prodArr = prod.allAreaProduction[e["Ид_скважины"]]
            if(!prodArr || !prodArr.length)return;

            let res = {
                "Ид_скважины": e["Ид_скважины"],
                "Коорд_x": e["Коорд_x"],
                "Коорд_y": e["Коорд_y"],
                value: 0,
                qvalue: 0,
                bumbles: []
            }

            prod.productionBubmbles.forEach(i => {
                let bumb = JSON.parse(JSON.stringify(i));

                // bumb.value = 0;
                // bumb.qvalue = 0;

                // prodArr.forEach(k => {
                //     //bumb.value += k[bumb.key] || 0;
                //     //bumb.value += k[bumb.key] || (Math.random() * 1000);
                //     bumb.qvalue += k[bumb.qkey] || 0
                // })

                bumb.qvalue = prodArr[prodArr.length - 1][bumb.qkey] || 0;
                bumb.value = prodArr[prodArr.length - 1][bumb.key] || 0;
                //bumb.qvalue = prodArr[prodArr.length - 1][bumb.qkey] || 0;

                res.value += bumb.value;
                res.qvalue += bumb.qvalue;

                res.bumbles.push(bumb);
            });

            

            if(res.value < range.range[0] || range.range[0] == -1)range.range[0] = res.value;
            if(res.value > range.range[1] || range.range[1] == -1)range.range[1] = res.value;
            if(res.qvalue < range.qrange[0] || range.qrange[0] == -1)range.qrange[0] = res.qvalue;
            if(res.qvalue > range.qrange[1] || range.qrange[1] == -1)range.qrange[1] = res.qvalue;

            list.push(res);
        });

        return {list, range}
    });

    const prodListToShow = computed(()=>{
        let l = prodList.value;

        let list = prod.productionDisplayMode==0?
            l.list:
            l.list.filter(e => map.activeWellsIDs.includes(e['Ид_скважины']));
        let activeRange = activeProdMode.value.id == 0?l.range.range:l.range.qrange;

        bumbMin.value = new Array(prod.productionBubmbles.length);

        list.forEach(e => {
            let globVal = activeProdMode.value.id == 0?e.value:e.qvalue
            e.radius = ((activeRange[1]-activeRange[0] > 0) && globVal)?
                        globVal/activeRange[1]:
                        0;

            //pie-chart
                e.grad = 'conic-gradient(';
                let lastDeg = 0;
                e.bumbles.forEach((i)=>{
                    let val = activeProdMode.value.id == 0?i.value:i.qvalue;
                    if(!val)return;

                    let newDeg = lastDeg + 360*(val / globVal);
                    e.grad += `${i.color} ${lastDeg}deg ${newDeg}deg, `
                    lastDeg = newDeg;
                })
                e.grad = e.grad.slice(0,-2)+')';

            
            e.bumbles.forEach((i,k) => {
                let val = activeProdMode.value.id == 0?i.value:i.qvalue;
                if(
                    bumbMin.value[k] === undefined ||
                    val && val < bumbMin.value[k] ||
                    (!bumbMin.value[k] && val)
                ){
                    bumbMin.value[k] = val;
                }
            });
        });

        return list;
    });

//tools
    const toolsDisplay = ref([
        [
            {name: 'wells', img: '/img/map/markers.svg', title: "Показать/скрыть устья скважин", active: true, clickHandler: ()=>switchWells()},
            {name: 'trajectory', img: '/img/map/traj.svg', title: "Показать/скрыть траектории скважин", active: false, clickHandler: ()=>switchTrajectory()},
            // {name: 'currentMap', img: '/img/map/IconGeo.svg', title: "Построить карту текущих отборов", active: true, clickHandler: ()=>buildCurrentMap()},
            // {name: 'accumulatedMap', img: '/img/map/summary.svg', title: "Построить карту накопленных отборов", active: true, clickHandler: ()=>buildAccumulatedMap()},
            {name: 'links', img: '/img/map/links.svg', title: "Показать/скрыть соединения между скважинами", active: false, clickHandler: ()=>switchLinks()},
        ],
        [
            {name: 'selectArea', img: '/img/map/selectArea.svg', title: "Выделить скважины", active: true, clickHandler: ()=>callAreaSelection()},
            {name: 'ruler', img: '/img/map/ruler.svg', title: "Измерить расстояние", active: true, clickHandler: ()=>ruler()},
        ]
    ])

    const tools = computed(()=>toolsDisplay.value.flat());

    const toolByName = (name)=>tools.value.find(e => e.name == name);

    const isActiveTool = (name)=>!!toolByName(name)?.active;

    //selection
        const selectionMode = ref(false);
        const selectionActive = ref(false);

        const selectionArea = ref([[0,0],[0,0]]);

        const selectedWells = ref([])

        const selectionPolygon = computed(()=>
            {
                let a = selectionArea.value;
                return [[a[0][0],a[0][1]],[a[0][0],a[1][1]],[a[1][0],a[1][1]],[a[1][0],a[0][1]]]
            }
        )

        const selectionBorders = computed(()=>{
            let res = JSON.parse(JSON.stringify(selectionArea.value));
            let tmp;

            if(res[0][0]>res[1][0]){
                tmp = res[0][0];
                res[0][0] = res[1][0];
                res[1][0] = tmp;
            }
            
            if(res[0][1]>res[1][1]){
                tmp = res[0][1];
                res[0][1] = res[1][1];
                res[1][1] = tmp;
            }

            return res
        })

        const callAreaSelection = ()=>{
            selectionMode.value = !selectionMode.value;
            if(selectionMode.value){
                map.mapObj.dragging.disable();
                toolByName('selectArea').active = false;
            }else{
                flushSelection();
            }
        }

        const selectionStart = (ev)=>{
            var coords = ev.latlng;
            if(!coords)return;
            
            selectionActive.value = true;

            selectionArea.value[0] = [coords.lat, coords.lng];
            selectionArea.value[1] = [coords.lat, coords.lng];            
        }

        const selectionMove = (ev)=>{
            var coords = ev.latlng;
            if(!coords)return;

            selectionArea.value[1] = [coords.lat, coords.lng];
            const sb = selectionBorders.value;

            selectedWells.value = map.allWells.filter(e => 
                (e['Коорд_y']>=sb[0][0] && e['Коорд_y']<=sb[1][0])&&
                (e['Коорд_x']>=sb[0][1] && e['Коорд_x']<=sb[1][1])
            )
        }

        const seletionEnd = (ev)=>{
            var coords = ev.latlng;
            if(!coords)return;

            if(selectedWells.value.length){
                map.activeWells = selectedWells.value;
            }
            
            flushSelection();
        }

        const flushSelection = ()=>{
            map?.mapObj?.dragging.enable();
            selectionActive.value = false;
            selectionMode.value = false;
            selectionArea.value = [[0,0],[0,0]];
            toolByName('selectArea').active = true;
        }

    //trajectory
        const switchTrajectory = ()=>{
            toolByName('trajectory').active = !toolByName('trajectory').active;
        }

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
                if(map.activeLayerDisplay){
                    const layer =  well['Стратиграфия'].find(e => e['Пласт']['Ид_пласта'] == map.activeLayer['Ид_пласта']);
                    if(layer)selectedBorders = [layer['Кровля'], (layer['Подошва']||well['Подошва_инкл']||well['Подошва_fake'])]
                }else if(map.activeObjectDisplay){
                    selectedBorders = [
                        well['Стратиграфия'].find(e => e['Пласт']['Пласт'] == map.activeObjectDisplay['Верхний_страт_пласт'])?.['Кровля'] || -1,
                        well['Стратиграфия'].find(e => e['Пласт']['Пласт'] == map.activeObjectDisplay['Нижний_страт_пласт'])?.['Подошва'] || -1
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

    const switchLinks = ()=>{
        toolByName('links').active = !toolByName('links').active;
    }

    const switchWells = ()=>{
        toolByName('wells').active = !toolByName('wells').active;
    }

    //ruler
        const rulerPoints = ref([])
        const rulerObj = computed(()=>tools.value.find(e => e.name == 'ruler'));
        const rullerClickAllowed = ref(true);

        const rullerLineRef = ref();

        watch(()=>[...rulerPoints.value], n=>{
            rullerLineRef.value?.leafletObject.setLatLngs(n);
        })

        const ruler = ()=>{
            rulerObj.value.active = !rulerObj.value.active;
        }

        const rulerClick = (ev)=>{
            if(!rullerClickAllowed.value)return;
            if(rulerObj.value.active)return;
            
            let coords = ev.latlng;
            if(!coords)return;
            rulerPoints.value.push(coords);
        }

        const removeRuler = () => {
            rulerPoints.value = [];
            rulerObj.value.active = true;
        }

        const rullerDistance = computed(()=>{
            if(rulerPoints.value.length < 2)return 0;

            let res = [0];

            // for(let i = 1; i < rulerPoints.value.length; i++){
            //     dist[i] += rulerPoints.value[i-1].distanceTo(rulerPoints.value[i])
            // }
            
            for(let i = 1; i < rulerPoints.value.length; i++){
                res[i] = res[i-1] + rulerPoints.value[i-1].distanceTo(rulerPoints.value[i]);
            }

            console.log(res.map(e => (e/1000).toFixed(2)));

            return res.map(e => (e/1000).toFixed(2)).slice(1);
        });

        // const rullerMid = computed(()=>{
        //     if(rulerPoints.value.length < 2)return[0,0];

        //     let pts = rulerPoints.value;
        //     let res = {
        //         x: {min: 0, max: 0},
        //         y: {min: 0, max: 0},
        //     }

        //     if(pts[0].lat > pts[1].lat){
        //         res.x.min = pts[1].lat;
        //         res.x.max = pts[0].lat;
        //     }else{
        //         res.x.max = pts[1].lat;
        //         res.x.min = pts[0].lat;
        //     }

        //     if(pts[0].lng > pts[1].lng){
        //         res.y.min = pts[1].lng;
        //         res.y.max = pts[0].lng;
        //     }else{
        //         res.y.max = pts[1].lng;
        //         res.y.min = pts[0].lng;
        //     }

        //     return {
        //         lat: res.x.min + (res.x.max - res.x.min)/2,
        //         lng: res.y.min + (res.y.max - res.y.min)/2
        //     }
        // })

    
    //clearMap
        const clearMap = ()=>{
            map.selectWells([]);
            removeRuler();
        }  

//centerMap
    watch(()=>[map.mapItemsLoaded, map.activeArea, map.map], ()=>panToCenter());
    onMounted(()=>panToCenter());

    const panToCenter = ()=>{ // calculates center and sets view
        if(!map.mapObj || !map.mapItemsLoaded || !map.allWells.length)return;
        const wells = map.wells.length?map.wells:map.allWells;

        let coords = {x:[], y:[]};
        wells.forEach(obj => {
            coords.x.push(obj['Коорд_x']);
            coords.y.push(obj['Коорд_y']);
        });

        let borders = {
            min: {x: Math.min.apply(null, coords.x), y: Math.min.apply(null, coords.y)},
            max: {x: Math.max.apply(null, coords.x), y: Math.max.apply(null, coords.y)}
        }

        map?.mapObj?.setView(
            [
                borders.min.y + ((borders.max.y - borders.min.y)/2),
                borders.min.x + ((borders.max.x - borders.min.x)/2)
            ],
            8
        );
    }

    onUnmounted(()=>{
        map.remove();
    })

//clusters
    const currentZoom = ref(6);

    const updateCurrentZoom = ()=>{
        currentZoom.value = currentZoom.value = map.mapObj.getZoom();
    }

    const isClusters = computed(()=>currentZoom.value<13);

    //wells
        const bounds = ref({});
        const visibleWells = ref([]);
        const visibleWellsIds = computed(()=>visibleWells.value.map(e => e['Ид_скважины']));

        const updateBounds = ()=>{
            bounds.value = map.mapObj.getBounds();

            const ext = toolByName('trajectory').active?0.017:0.0001;

            visibleWells.value = [];
            
            setTimeout(()=>{
                visibleWells.value = !isClusters.value?
                    map.allWells.filter(e => 
                        e['Коорд_x']<=bounds.value._northEast.lng + ext && 
                        e['Коорд_x']>=bounds.value._southWest.lng - ext &&
                        e['Коорд_y']<=bounds.value._northEast.lat + ext && 
                        e['Коорд_y']>=bounds.value._southWest.lat - ext
                    )
                :[]
            })
        }

        watch(visibleWells, n => {if(map.activeLayerDisplay)n.forEach(e => map.updateWellStrat(e));});


        

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
        
        #map{
            height: 100%;
            width: 100%;
        }

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