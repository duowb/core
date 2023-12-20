import selector from "./selector";
import FastjsDom from "./fastjsDom";
import FastjsDomList from "./fastjsDomList";
import type {FastjsDomProps} from "./def";


export default {
    select: selector,
    newEl: (el: FastjsDom | HTMLElement | Element | string, properties?: FastjsDomProps) => new FastjsDom(el, properties),
    newElList: (list: Array<HTMLElement>) => new FastjsDomList(list)
}
export {
    selector,
    FastjsDom,
    FastjsDomList
}