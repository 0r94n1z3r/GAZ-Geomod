import { defineStore } from 'pinia';
import { ref, computed, reactive } from "vue";
import { getCookie, setCookie, deleteCookie } from '@/script/cookie.js';

import { useMapStore } from './map.js';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

export const useCameraStore = defineStore("camera", ()=>{

    const map = useMapStore();

    const zones = ref({});

    const loading = ref(false);

    const addZone = (name, ref)=>{
        zones.value[name] = ref;
    }

    const getPhoto = (zoneName, cb, options={})=>{
        loading.value = true;

        options = Object.assign(
            {
                useCORS: true,
                imageTimeout: 0,
                noExit: false,
            }, 
            options
        );
        
        setTimeout(()=>{
            html2canvas(
                zones.value[zoneName],
                options
            ).then((canvas)=>{
                if(!options.noExit)loading.value = false;
                let photo = canvas.toDataURL("image/jpeg");
                
                cb(photo)
            });
        },350);
    }

    const downloadFile = (name, photo)=>{
        var a = document.createElement("a");
        a.href =  photo;
        a.download = name+".jpg";
        a.click();
    }

//screen
    const makePrintscreen = ()=>{
        getPhoto('screen', file=>downloadFile('screen', file));
    };

//map
    const mapPhotoLoading = ref(false);
    const makeMapPhoto = ()=>{
        mapPhotoLoading.value = true;
        setTimeout(()=>{map.resize()});
        getPhoto('screen', file=>{
            downloadFile('map', file);
            mapPhotoLoading.value = false;
            map.resize();
        });
    };

//charts
    const chartsLoading = ref(false);

    const makeChartsPhotos = ()=>{
        chartsLoading.value = true;
        loading.value = true;
    } 

    const downloadCharts = (charts)=>{ //[{name: ..., base: ...},...]
        loading.value = true;
        let zip = new JSZip();
        charts.forEach(ch => {
            zip.file(`${ch.name}.jpg`, ch.base, {base64: true});
        })
        zip
        .generateAsync({type:"blob"})
        .then((content)=>{
            saveAs(content, "charts.zip");
            loading.value = false;
            chartsLoading.value = false;
        });
    }

//botChrts
    const botChartsLoading = ref(false);
    const makeBotChartsPhotos = ()=>{
        botChartsLoading.value = true;
        getPhoto('botChart', file=>{
            downloadFile('indicators', file);
            botChartsLoading.value = false;
        });
    };

//report
    const reportWell = ref();
    const reportData = ref();

    const reportLoading = ref(false);

    const getReportPhotos = (well, data, cb)=>{
        reportWell.value = well;
        reportData.value = data;
        reportLoading.value = true;

        console.log(
            reportWell.value,
            reportData.value
        )
        
        let res = {};

        setTimeout(
            ()=>{
                getPhoto('repMap', file=>{
                    res['img1_1'] = file; 
                    res['img1_1_SIZE'] = [600, 600];

                    getPhoto('repPad', file=>{
                        res['img1_3'] = file; 
                        res['img1_3_SIZE'] = [600, 900];

                        zones.value['repTraj'].getPhoto(file =>{
                            res['img1_2'] = file; 
                            res['img1_2_SIZE'] = [600, 400];

                            zones.value['repDynamic'].getPhoto(file =>{
                                res['img2_1'] = file; 
                                res['img2_1_SIZE'] = [600, 400];
        
                                zones.value['repDynamic2'].getPhoto(file =>{
                                    res['img4_2'] = file; 
                                    res['img4_2_SIZE'] = [600, 400];

                                    reportWell.value = null;
                                    reportData.value = null;
            
                                    reportLoading.value = false;
                                    console.log(res);
                                    cb(res); 
                                })
                            })
                        })
                    })
                });
            },
            100
        );
    }

//--------------------------------------------------------------------
    return {
        zones,
        loading,

        addZone,
        getPhoto,
        
        makePrintscreen,

        mapPhotoLoading,
        makeMapPhoto,

        chartsLoading,
        makeChartsPhotos,
        downloadCharts,

        botChartsLoading,
        makeBotChartsPhotos,

        reportWell,
        reportData,
        reportLoading,
        getReportPhotos,
    };
})

export default useCameraStore;