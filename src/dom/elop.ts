import FastjsDom from "./fastjsDom";

export enum PushTarget {
    firstElementChild = "firstElementChild",
    lastElementChild = "lastElementChild",
    beforeElement = "beforeElement",
    afterElement = "afterElement",
    replaceElement = "replaceElement"
}

export type PushReturn<T> = {
    isReplace: T extends PushTarget.replaceElement ? true : false;
    newElement: T extends PushTarget.replaceElement ? FastjsDom : never;
    oldElement: T extends PushTarget.replaceElement ? FastjsDom : never;
    /** @description index to parent -> children, start with 0 */
    index: number;
    /** @description FastjsDom point to the new element */
    el: FastjsDom;
    /** @description FastjsDom point to the origin element when you call(this) */
    origin: FastjsDom;
    father: FastjsDom;
}

export enum InsertTarget {
    first = "first",
    last = "last",
    random = "random"
}

export type InsertReturn = {
    /** @description index to parent -> children, start with 0 */
    index: number;
    /** @description FastjsDom point to the new element */
    added: FastjsDom;
    /** @description FastjsDom point to the origin element when you call(this) */
    origin: FastjsDom;
}