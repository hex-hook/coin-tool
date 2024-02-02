import { createApp } from "vue";
import "./styles.css";
import App from "./App.vue";
import { createPinia } from 'pinia'
import { Buffer } from 'buffer'



// nodejs Buffer polyfill
window.Buffer = Buffer


const app = createApp(App)

const pinia = createPinia()

app.use(pinia)


app.mount("#app");
