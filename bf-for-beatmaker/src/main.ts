import './assets/main.css'
import Aura from '@primevue/themes/aura'

import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import App from './App.vue'
import router from './router'
import ProgressSpinner from 'primevue/progressspinner'
import Card from 'primevue/card'

import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyDe2ElMOwxTxhSm_HPFFgiiy2EDhk2XlOw',
  authDomain: 'beats-cb93b.firebaseapp.com',
  projectId: 'beats-cb93b',
  storageBucket: 'beats-cb93b.appspot.com',
  messagingSenderId: '942228199965',
  appId: '1:942228199965:web:2c26657009c79e18a0c4f4'
}

initializeApp(firebaseConfig)

const app = createApp(App)
app.use(ToastService)
app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})
app.component('app-menubar', Menubar)
app.component('app-button', Button)
app.component('app-input-text', InputText)
app.component('app-toast', Toast)
app.component('app-progress', ProgressSpinner)
app.component('app-card', Card)

app.mount('#app')
