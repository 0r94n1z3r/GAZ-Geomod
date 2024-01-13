<template>
    <div 
        class="construction"
        :style="{
            '--display-w': displayWidth+'px',
            '--wall': 10 * displayRatio+'px',
            '--gap': 50 * displayRatio+'px',
        }"
    >
        <div 
            class="depth content-wr"
            :style="{
                'margin-right': `calc(-.5 * (${displayWidth}px - var(--gap) * 2 - var(--wall) * 1.3 * 2 - ${widestCol['Внеш_диам'] *displayRatio}px) + 10px)`
            }"
        >
            <div 
                class="depth-container"
                style="top: 0; "
            >
                <div class="num">0 м</div>
            </div>
            <div 
                class="depth-container"
                v-for="(tic, ticK) in tics"
                :key="ticK"
                :style="{
                    top: convertHeight(tic.depth)+'px'
                }"
            >
                <div class="num">{{tic.depth}}</div>
            </div>
        </div>
        <div 
            class="display content-wr"
            ref="displayRef"
        >
            <div class="spacer"></div>
            <div 
                class="line"
                v-for="(col) in cols"
                :key="col['Ид_строки']"
                :style="{
                    width: `calc(${100*(widestCol['Внеш_диам']/maxColWidth)}% + var(--gap) * 2 + var(--wall) * 1.3 * 2)`,
                    height: colHeight(col)+'px',
                    top: colTop(col)+'px'
                }"
            >
            </div>
            <div 
                class="col-wr"
                v-for="(col) in cols"
                :key="col['Ид_строки']"
                :style="{
                    width: 100*(col['Внеш_диам']/maxColWidth)+'%',
                    height: colHeight(col)+'px',
                    top: colTop(col)+'px'
                }"
                :type="col['Тип']"
            >
                <div
                    v-for="w in 2"
                    :key="w"
                    class="wall"
                >
                    <div class="corner"></div>
                </div>
            </div>
        </div>
        <div 
            class="signs content-wr"
            :style="{
                'margin-left': `calc(-.5 * (${displayWidth}px - var(--gap) * 2 - var(--wall) * 1.3 * 2 - ${widestCol['Внеш_диам'] *displayRatio}px))`,
                'margin-right': `calc(.5 * (${displayWidth}px - var(--gap) * 2 - var(--wall) * 1.3 * 2 - ${widestCol['Внеш_диам'] *displayRatio}px))`
            }"
        >
            <div 
                class="sign-container"
                v-for="(col, k) in cols"
                :key="col['Ид_строки']"
                :style="{
                    top: 
                        (prevCol(col, k)?
                            (
                            colTop(prevCol(col, k)) != colTop(col)?
                                colTop(col):
                                colBottom(prevCol(col, k))
                            ):
                            colTop(col)
                        )
                        +'px',
                }"
            >
                <p>{{getType(col['Тип'])}}</p>
                <p class="info">Ø {{col['Внеш_диам']}}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref, onMounted } from "vue";

    const props = defineProps({
        info: Object
    })

    const cols = computed(()=>
        [...props.info['Колонны']]
        .sort((a,b)=>{
            if ( a['Внеш_диам'] < b['Внеш_диам'] ) return 1;
            if ( a['Внеш_диам'] > b['Внеш_диам'] ) return -1;
            return 0;
        })
        .sort((a,b)=>{
            if ( a['Кровля'] < b['Кровля'] ) return -1;
            if ( a['Кровля'] > b['Кровля'] ) return 1;
            return 0;
        })
    );

    onMounted(()=>console.log(cols.value));

    const maxColWidth = ref(700);
    const displayWidth = ref(700);
    const displayRatio = computed(()=> displayWidth.value/maxColWidth.value)

    const deepestCol = computed(()=>cols.value.reduce((prev, current) => (+prev['Подошва'] > +current['Подошва']) ? prev : current));
    const widestCol = computed(()=>cols.value.reduce((prev, current) => (+prev['Внеш_диам'] > +current['Внеш_диам']) ? prev : current));

    const displayRef = ref();

    const colBottom = (col)=>convertHeight(col['Подошва']);
    const colTop = (col)=>convertHeight(col['Кровля']);
    const colHeight = (col)=>convertHeight(col['Подошва']) - convertHeight(col['Кровля']);

    const convertHeight = (h)=>{
        let displayH = displayRef.value?.offsetHeight;

        if(!h || !displayH)return 0;

        let deepH = deepestCol.value?.['Подошва'];

        return displayH * (h/deepH) - 20;
    }

    const tics = computed(()=>cols.value.reduce((acc, val)=>{
        if(val['Кровля'])acc.push({type: 'Кровля', depth: val['Кровля'], col: val});
        if(val['Подошва'])acc.push({type: 'Кровля', depth: val['Подошва'], col: val});
        return acc;
    }, []))


    const prevCol = (col, k)=>{
        return cols.value[k-1];
    }

    const nextCol = (col, k)=>{
        return cols.value[k+1];
    }

    const getType = (type)=>{
        switch(type) {
            case 'КОНДУКТОР': return 'Кондуктор';
            case 'ТЕХНИЧ': return 'Техническая';
            case 'ЭКСПЛ': return 'Эксплуатационная';
            case 'ХВОСТОВИК': return 'Хвостовик';
        }

        return type;
    }

    

</script>

<style lang="scss" scoped>
    .construction{
        display: flex;
        padding: 10px 0;
    }

    .depth{
        position: relative;
        width: 50px;
        
        .depth-container{
            display: flex;
            align-items: end;
            justify-content: end;
            position: absolute;
            right: 0;
            // border-bottom: 1px solid green;
            
            .num{
                font-size: 18px;
                color: var(--typo-secondary);
                transform: translateY(-50%);
            }
        }
    }

    .display{
        width: var(--display-w);
        position: relative;
        overflow: hidden;
        pointer-events: none;

        .spacer{
            height: 100vh;
            pointer-events: none;
        }

        .line{
            position: absolute;
            @include directions(unset, 0, unset, 0);
            margin: auto;
            border: 1px solid var(--bg-border);
            border-width: 1px 0;
        }

        .col-wr{
            position: absolute;
            @include directions(0, 0, unset, 0);
            margin: auto;
            display: flex;
            @include flex-jtf;

            .wall{
                height: 100%;
                width: calc(50% - var(--gap) / 2);
                position: relative;

                &:after{
                    @include pseudo-absolute;
                    top: 0;
                    width: var(--wall);
                    height: 100%;
                    background: linear-gradient(180deg, #3276CB 4.32%, #2A5EA1 70.68%);
                }

                .corner{
                    position: absolute;
                    bottom: 0;
                    aspect-ratio: 1/1;
                    width: calc(var(--wall)*1.3);
                    overflow: hidden;
                    transform: scaleY(1.7);
                    transform-origin: 50% 100%;

                    &:after{
                        @include pseudo;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(180deg, #2F6BB8 0%, #162030 100%);;
                        transform: rotate(45deg) scaleX(2) translateY(50%);
                    }
                }

                &:first-child{
                    background: linear-gradient(-90deg, #2F6BB8 0%, #162030 100%);
                    
                    &:after{left: 0;}

                    .corner{
                        right: 100%;
                        transform: scaleY(1.7) scaleX(-1);
                    }
                }
                
                &:last-child{
                    background: linear-gradient(90deg, #2F6BB8 0%, #162030 100%);

                    &:after{right: 0;}

                    .corner{
                        left: 100%;
                    }
                }

                
            }

            &[type="ХВОСТОВИК"]{
                .wall{
                    &:after{
                        background: linear-gradient(180deg, #B5D1DD 0%, #4E687A 100%);
                    }

                    .corner:after{
                        display: none;
                        background: linear-gradient(180deg, #B5D1DD 0%, #4E687A 100%);
                    }

                    &:first-child{
                        background: linear-gradient(-90deg, #B5D1DD 0%, #4E687A 100%);
                        // &:after{
                        //     transform: translateX(-100%);
                        // }
                    }
                    
                    &:last-child{
                        background: linear-gradient(90deg, #B5D1DD 0%, #4E687A 100%);
                        // &:after{
                        //     transform: translateX(100%);
                        // }
                    }
                }

                background: #B5D1DD;
            }
        }
    }

    .signs{
        @include flex-col;
        position: relative;
        
        .sign-container{
            padding: 6px;
            overflow: hidden;
            position: absolute;
            transform: translateY(-13px);

            p{
                font-size: 12px;
                margin-bottom: 2px;

                &.info{
                    color: var(--typo-secondary);
                }
            }
        }
    }

    
</style>