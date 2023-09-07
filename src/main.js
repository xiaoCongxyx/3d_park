import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import * as THREE from 'three'
import {Pane} from 'tweakpane';
import * as TWEEN from '@tweenjs/tween.js'

Vue.config.productionTip = false

import './assets/css/resetTheStyle.css'

// Vuetify
import vuetify from './plugins/vuetify' // path to vuetify export

import destroyThree from './utils/destroyThree'
import resizeScene from './utils/resizeScene'

Vue.prototype.THREE = THREE
Vue.prototype.Pane = Pane
Vue.prototype.TWEEN = TWEEN

Vue.prototype.D = destroyThree
Vue.prototype.R = resizeScene

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app')
