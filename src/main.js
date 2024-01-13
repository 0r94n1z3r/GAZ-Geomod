import { createApp } from 'vue'

import App from './App.vue'
const app = createApp(App)

//libs
    import { createPinia } from 'pinia'
    import router from './router'
    import Maska from 'maska';
    import Vue3TouchEvents from "vue3-touch-events";
    import VueApexCharts from "vue3-apexcharts";

    app.use(createPinia())
    app.use(router)
    app.use(Maska)
    app.use(Vue3TouchEvents)
    app.use(VueApexCharts)

//components
    import VButton from '@/components/ui/VButton.vue';
    import UnfoldArrow from '@/components/ui/UnfoldArrow.vue';
    import VModal from '@/components/ui/VModal.vue';
    import MapModal from '@/components/ui/MapModal.vue';
    import TextSelect from '@/components/ui/TextSelect.vue';
    import VTextInput from '@/components/ui/VTextInput.vue';

    app.component('VButton', VButton)
    app.component('UnfoldArrow', UnfoldArrow)
    app.component('VModal', VModal)
    app.component('MapModal', MapModal)
    app.component('TextSelect', TextSelect)
    app.component('VTextInput', VTextInput)

app.mount('#app')
