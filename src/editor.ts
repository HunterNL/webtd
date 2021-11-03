import { onDomReady } from "./util/domready";
import {default as Vue} from "vue";

const elementList = {
    list: [1,2,3,4]
}

onDomReady(() => {
    const element = document.getElementById("buffercontainer");

    if(!element) {
        throw new Error("No element");
        
    }
    const buffers = new Vue({
        data: elementList,
        template: "<circle cx={{this}}px cy=50px r=10px/>"
    })

    
    buffers.list 
})