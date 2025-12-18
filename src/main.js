import { createApp } from 'vue'
import App from './App.vue'
import '@fortawesome/fontawesome-free/css/all.css'
import Agent from '@knowlearning/agents'

window.Agent = Agent

createApp(App).mount('#app')
