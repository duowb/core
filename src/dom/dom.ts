import _dev from "../dev";
import _selector from "./selector";
import FastjsDomList from "./dom-list";
import type {styleObj, styleObjKeys} from "./css";
import {ArrayProxyHandler} from "./proxy";
import type {EventCallback, EventList, InsertReturn, PushReturn, FastjsDomProps, EachCallback} from "./def";
import FastjsBaseModule from "../base";
import {InsertTarget, PushTarget} from "./def";


class Dom extends FastjsBaseModule<Dom>{
    public readonly construct: string = "Dom";
    _events: EventList = [];

    constructor(el: Dom | HTMLElement | Element | string, p?: FastjsDomProps) {
        super()
        
        if (__DEV__)
            _dev.browserCheck("fastjs/dom/Dom")

        if (__DEV__ && el instanceof Dom) {
            _dev.warn("fastjs/dom/Dom", "wtf are you doing? el is already a Dom", [
                "*el:", el,
                "constructor(**el: Dom | HTMLElement | Element | string**, properties?: FastjsDomProps)",
                "super:", this
            ], ["fastjs.wrong"]);
        }

        el = el instanceof Dom ? el.el() : el;
        // if string
        if (typeof el === "string") {
            // create element
            this._el = document.createElement(el);
            if (p) {
                let key: keyof FastjsDomProps;
                for (key in p) {
                    const value = p[key];

                    if (value === undefined) continue;

                    switch (key) {
                        case "html":
                            this.html(p[key] as string);
                            break;
                        case "text":
                            this.text(p[key] as string);
                            break;
                        case "css":
                            this.setStyle(p[key] as styleObj);
                            break;
                        case "class": {
                            if (typeof value === "string") this.setClass(value.split(" "));
                            else if (Array.isArray(value)) this.setClass(value);
                        }
                            break;
                        case "attr": {
                            let attrKey: string;
                            for (attrKey in p[key]) {
                                this.setAttr(attrKey, p[key]?.[attrKey] as string);
                            }
                        }
                            break;
                        case "value":
                            this.val(p[key] as string);
                            break;
                        default:
                            this.set(key, p[key]);
                            break;
                    }
                }
            }
        } else if (el instanceof HTMLElement) {
            this._el = el
        } else if (__DEV__) {
            _dev.warn("fastjs/dom/Dom", `el is not **HTMLElement or string**, instead of **${typeof el}**`, [
                "*el: ", el,
                "properties: ", p,
                "constructor(**el: Dom | HTMLElement | Element | string**, properties?: FastjsDomProps)",
                "super: ", this
            ], ["fastjs.right", "fastjs.wrong"]);
            throw _dev.error("fastjs/dom/Dom", "el is not HTMLElement or string, instead of " + typeof el, [
                "constructor(el: Dom | HTMLElement | Element | string, properties?: FastjsDomProps)",
                "Dom.constructor",
            ]);
        } else throw "6e2s"

        // construct
        this.construct = "Dom";

        return this;
    }

    _el: HTMLElement

    // methods

    getAttr(): { [key: string]: string }
    getAttr(key: string): string | null
    getAttr(callback: (attr: { [key: string]: string }) => void): Dom
    getAttr(key: string, callback: (value: string | null) => void): Dom

    getAttr(keyOrCallback?: string | ((attr: { [key: string]: string }) => void), callback?: (value: string | null) => void): { [key: string]: string } | string | null | Dom {
        const getAttrProxy = (): { [key: string]: string } => {
            const arr = [...this._el.attributes];
            const obj: { [key: string]: string } = {};
            arr.forEach((v) => {
                obj[v.name] = v.value;
            })
            return new Proxy(obj, {
                set: (target, key: string, value) => {
                    this.setAttr(key, value);
                    return Reflect.set(target, key, value);
                }
            })
        }

        if (typeof keyOrCallback === "string")
            if (callback)
                callback(this._el.getAttribute(keyOrCallback));
            else
                return this._el.getAttribute(keyOrCallback);
        else if (typeof keyOrCallback === "function")
            keyOrCallback(getAttrProxy());
        else
            return getAttrProxy()

        return this;
    }

    setAttr(map: { [key: string]: string | null }): Dom
    setAttr(key: string, value: string): Dom
    setAttr(key: string, value: null): Dom
    setAttr(key: string, value: string | null): Dom

    setAttr(keyOrMap: string | { [key: string]: string | null }, value?: string | null): Dom {
        if (typeof keyOrMap === "object") {
            for (let key in keyOrMap) {
                this.setAttr(key, keyOrMap[key]);
            }
        } else {
            const key = keyOrMap;
            if (value === null) this._el.removeAttribute(key);
            else this._el.setAttribute(key, value as string);
        }
        return this;
    }

    getStyle(): styleObj
    getStyle(key: styleObjKeys): string
    getStyle(callback: (style: styleObj) => void): Dom
    getStyle(key: styleObjKeys, callback: (value: string) => void): Dom

    getStyle(keyOrCallback?: styleObjKeys | ((style: styleObj) => void), callback?: (value: string) => void): styleObj | string | Dom {
        const getStyleProxy = (): styleObj => {
            const handler: ProxyHandler<CSSStyleDeclaration> = {
                set: (target, key: PropertyKey, value) => {
                    if (!Number.isNaN(Number(key))) this.setStyle(key as styleObjKeys, value);
                    return Reflect.set(target, key, value);
                }
            }
            return new Proxy(this._el.style, handler)
        }

        if (typeof keyOrCallback === "string")
            if (callback)
                callback(this._el.style.getPropertyValue(keyOrCallback));
            else
                return this._el.style.getPropertyValue(keyOrCallback);
        else if (typeof keyOrCallback === "function")
            keyOrCallback(getStyleProxy());
        else
            return getStyleProxy()

        return this;
    }

    setStyle(css: string): Dom
    setStyle(map: styleObj): Dom
    setStyle(key: styleObjKeys, value: string, important?: boolean): Dom

    setStyle(keyOrMapOrString: styleObjKeys | styleObj | string, value?: string, other: boolean = false): Dom {
        if (typeof keyOrMapOrString === "object") {
            let k: styleObjKeys;
            for (k in keyOrMapOrString) {
                this.setStyle(k, keyOrMapOrString[k]);
            }
        } else if (!value) {
            this._el.style.cssText = keyOrMapOrString as string;
        } else {
            const key = keyOrMapOrString as keyof styleObj;
            this.get("style").setProperty(key as string, value, other ? "important" : "");
        }
        return this;
    }

    el(): HTMLElement {
        return this._el;
    }

    each(callback: EachCallback, deep: boolean = false): Dom {
        const each = (el: HTMLElement, index: number) => {
            callback(new Dom(el), el, index);
            if (deep)
                for (let i = 0; i < el.children.length; i++) {
                    each(el.children[i] as HTMLElement, i);
                }
        }
        each(this._el, 0);
        return this;
    }

    focus(): Dom {
        this._el.focus();
        return this;
    }

    firstChild(): Dom | null {
        return this._el.firstElementChild ? new Dom(this._el.firstElementChild as HTMLElement) : null;
    }

    lastChild(): Dom | null {
        return this._el.lastElementChild ? new Dom(this._el.lastElementChild as HTMLElement) : null;
    }

    children(): FastjsDomList {
        return new FastjsDomList([...this._el.children]);
    }

    father(): Dom | null {
        return new Dom(this.get("parentElement") as HTMLElement);
    }

    get<T extends keyof HTMLElement>(key: T): HTMLElement[T] {
        return this._el[key];
    }

    html(): string
    html(val: string): Dom

    html(val?: string): string | Dom {
        // if null -> not change || String(val)
        return val === undefined ? this.get("innerHTML") : this.set("innerHTML", val);
    }

    last(): Dom | null {
        return this._el.lastElementChild ? new Dom(this._el.lastElementChild as HTMLElement) : null;
    }

    next(selector: string): Dom | FastjsDomList | null {
        return _selector(selector, this._el);
    }

    push<T extends PushTarget>(el?: HTMLElement | FastjsDomList | Dom, target?: T, clone?: boolean): PushReturn<T>
    push<T extends PushTarget>(el?: HTMLElement | FastjsDomList | Dom, callback?: (pushReturn: PushReturn<T>) => void, target?: T, clone?: boolean): Dom

    push<T extends PushTarget>(el: HTMLElement | FastjsDomList | Dom = document.body, callbackOrTarget: ((pushReturn: PushReturn<T>) => void) | T = PushTarget.lastElementChild as T, target: T | boolean = PushTarget.lastElementChild as T, clone: boolean = false): PushReturn<T> | Dom {
        const solve = (result: PushReturn<T>): Dom | PushReturn<T> => {
            if (typeof callbackOrTarget !== "function") return result;
            callbackOrTarget(result);
            return this;
        }

        const _target: T = typeof callbackOrTarget === "function" ? target as T : callbackOrTarget;
        el = el instanceof Dom || el instanceof FastjsDomList ? el.el() : el;
        // const node = (typeof target === "boolean" ? target : clone) ? this._el.cloneNode(true) as HTMLElement : this._el;
        let node: HTMLElement;
        if (typeof target === "boolean" ? target : clone) {
            node = this._el.cloneNode(true) as HTMLElement;
            // copy events
            this._events.forEach((v) => {
                node.addEventListener(v.type, v.trigger);
            })
        } else node = this._el;
        if (el.parentElement === null) {
            if (__DEV__) {
                let callback = typeof callbackOrTarget === "function" ? callbackOrTarget : undefined;
                _dev.warn("fastjs/dom/push", "el.parentElement is null, did you pass the **document object** or is this element **exist in document**?", [
                    "*el:", el,
                    "target: Fastjs.PushTarget." + target,
                    "clone: " + clone,
                    "callback: " + callback,
                    "push<T extends PushTarget>(**el?: HTMLElement | FastjsDomList | Dom**, target?: T, clone?: boolean): PushReturn<T>",
                ], ["fastjs.warn", "fastjs.warn", "fastjs.wrong"]);
                throw _dev.error("fastjs/dom/push", "el.parentElement can't be null", [
                    "push<T extends PushTarget>(el?: HTMLElement | FastjsDomList | Dom, target?: T, clone?: boolean): PushReturn<T>",
                    "Dom.push",
                ])
            }
            throw "hg42"
        }
        // if replace
        if (_target === PushTarget.replaceElement) {
            const replaced = el.parentElement.replaceChild(node, el);
            const newEl = new Dom(node as HTMLElement);

            return solve({
                isReplace: true,
                newElement: newEl,
                oldElement: new Dom(replaced),
                index: newEl.father()?.children().toElArray().indexOf(node),
                el: newEl,
                origin: this,
                father: newEl.father()
            } as unknown as PushReturn<T>);
        } else {
            let added;
            switch (_target) {
                case PushTarget.firstElementChild:
                    added = el.insertBefore(node, el.firstElementChild);
                    break;
                case PushTarget.lastElementChild:
                    added = el.appendChild(node);
                    break;
                case PushTarget.beforeElement:
                    added = el.parentElement.insertBefore(node, el);
                    break;
                case PushTarget.afterElement:
                    added = el.parentElement.insertBefore(node, el.nextSibling);
                    break;
            }
            const newEl = new Dom(added as HTMLElement);
            return solve({
                isReplace: false,
                index: newEl.father()?.children().toElArray().indexOf(added as HTMLElement),
                el: newEl,
                origin: this,
                father: newEl.father()
            } as unknown as PushReturn<T>);
        }
    }

    insert<T extends InsertTarget>(el?: HTMLElement | FastjsDomList | Dom, target?: T, clone?: boolean): InsertReturn
    insert<T extends InsertTarget>(el?: HTMLElement | FastjsDomList | Dom, callback?: (insertReturn: InsertReturn) => void, target?: T, clone?: boolean): Dom

    insert<T extends InsertTarget>(el: HTMLElement | FastjsDomList | Dom = document.body, callbackOrTarget: ((insertReturn: InsertReturn) => void) | T = InsertTarget.last as T, target: T | boolean = InsertTarget.last as T, clone: boolean = true): InsertReturn | Dom {
        const solve = (result: InsertReturn): Dom | InsertReturn => {
            if (typeof callbackOrTarget !== "function") return result;
            callbackOrTarget(result);
            return this;
        }

        const _target: T = typeof callbackOrTarget === "function" ? target as T : callbackOrTarget;
        el = el instanceof HTMLElement ? el : el.el();
        const node = (typeof target === "boolean" ? target : clone) ? el.cloneNode(true) as HTMLElement : el;

        let added;
        switch (_target) {
            case InsertTarget.first:
                added = this._el.insertBefore(node, this._el.firstElementChild);
                break;
            case InsertTarget.last:
                added = this._el.appendChild(node);
                break;
            case InsertTarget.random:
                added = this._el.insertBefore(node, this._el.children[Math.floor(Math.random() * this._el.children.length)]);
                break;
        }
        const newEl = new Dom(added as HTMLElement);
        return solve({
            index: this.children().toElArray().indexOf(added as HTMLElement),
            added: newEl,
            origin: this
        } as unknown as InsertReturn);
    }


    addEvent(event: keyof HTMLElementEventMap = "click", callback: EventCallback): Dom {
        let eventTrig: EventListener | EventListenerObject = (event: Event) => callback(this, event);
        this._events.push({
            type: event,
            callback: callback,
            trigger: eventTrig,
            remove: () => {
                this.removeEvent(callback)
            }
        });

        this._el.addEventListener(event, eventTrig);
        return this;
    }

    getEvent(): EventList
    getEvent(type: keyof HTMLElementEventMap): EventCallback | null
    getEvent(callback: (eventList: EventList) => void): Dom
    getEvent(type: keyof HTMLElementEventMap, callback: (event: EventCallback | null) => void): Dom

    getEvent(typeOrCallback?: keyof HTMLElementEventMap | ((eventList: EventList) => void), callback?: (event: EventCallback | null) => void): EventList | EventCallback | null | Dom {
        if (typeof typeOrCallback === "string")
            if (callback)
                callback(this._events.find((v) => v.type === typeOrCallback)?.callback || null);
            else
                return this._events.find((v) => v.type === typeOrCallback)?.callback || null;
        else if (typeof typeOrCallback === "function")
            typeOrCallback(this._events);
        else
            return this._events;

        return this;
    }

    removeEvent(): Dom
    removeEvent(type: keyof HTMLElementEventMap): Dom
    removeEvent(key: number): Dom
    removeEvent(type: keyof HTMLElementEventMap, key: number): Dom
    removeEvent(callback: EventCallback): Dom

    removeEvent(typeOrKeyOrCallback?: keyof HTMLElementEventMap | number | EventCallback, key?: number): Dom {
        if (__DEV__) {
            if (typeOrKeyOrCallback === undefined) {
                _dev.warn("fastjs/dom/removeEvent", "You are removing **all events**, make sure you want to do this.", [
                    "***No Any Argument",
                    "*removeEvent(): Dom",
                    "super:", this
                ], ["fastjs.warn"]);
            }
            if (typeof typeOrKeyOrCallback === "string" && key === undefined) {
                _dev.warn("fastjs/dom/removeEvent", "You are removing **all events** with type " + typeOrKeyOrCallback + ", make sure you want to do this.", [
                    "*type: " + typeOrKeyOrCallback,
                    "*removeEvent(key: keyof HTMLElementEventMap): Dom",
                    "super:", this
                ], ["fastjs.warn"]);
            }
        }

        if (typeof typeOrKeyOrCallback === "string")
            if (key !== undefined) {
                this._el.removeEventListener(typeOrKeyOrCallback, this._events.filter((v) => v.type === typeOrKeyOrCallback)[key].trigger as Function as EventListener);
                this._events.splice(key, 1);
            } else
                this._events.filter((v) => v.type === typeOrKeyOrCallback).forEach((v) => {
                    this._el.removeEventListener(v.type, v.trigger as Function as EventListener);
                    this._events.splice(this._events.indexOf(v), 1);
                });
        else if (typeof typeOrKeyOrCallback === "number") {
            this._el.removeEventListener(this._events[typeOrKeyOrCallback].type, this._events[typeOrKeyOrCallback].trigger as Function as EventListener);
            this._events.splice(typeOrKeyOrCallback, 1);
        } else if (typeof typeOrKeyOrCallback === "function") {
            this._events.filter((v) => v.callback === typeOrKeyOrCallback).forEach((v) => {
                this._el.removeEventListener(v.type, v.trigger as Function as EventListener);
                this._events.splice(this._events.indexOf(v), 1);
            });
        } else {
            this._events.forEach((v) => {
                v.remove();
            });
            this._events = [];
        }

        return this;
    }


    remove(): Dom {
        this._el.remove();
        return this;
    }

    set<T extends keyof HTMLElement>(key: T, val: HTMLElement[T]): Dom {
        if (findPropInChain(this._el.constructor.prototype, key)?.writable ||
            findPropInChain(this._el.constructor.prototype, key)?.set
        ) {
            this._el[key] = val;
        } else if (__DEV__)
            _dev.warn("fastjs/dom/set", `key **${key}** is not writable`, [
                "*key: " + key,
                "set<T extends keyof HTMLElement>(**key: T**, val: HTMLElement[T]): Dom",
                "super:", this
            ], ["fastjs.warn"]);
        return this;

        function findPropInChain(obj: object, prop: string): PropertyDescriptor | null {
            while (obj !== null) {
                const desc = Object.getOwnPropertyDescriptor(obj, prop);
                if (desc) return desc;
                obj = Object.getPrototypeOf(obj);
            }
            return null;
        }
    }

    text(): string
    text(val: string): Dom

    text(val?: string): string | Dom {
        // if null -> not change || String(val)
        return val === undefined ? this.get("innerText") : this.set("innerText", val);
    }

    val(): string
    val(val: string): Dom

    val(val?: string): Dom | string {
        const btn = this._el instanceof HTMLButtonElement;
        if (this._el instanceof HTMLInputElement || this._el instanceof HTMLTextAreaElement || this._el instanceof HTMLButtonElement) {
            // if val and is button || input || textarea
            if (val === undefined) {
                return btn ? this._el.innerText : this._el.value;
            } else {
                if (btn)
                    this._el.innerText = val;
                else
                    this._el.value = val;
            }
        } else if (__DEV__) {
            _dev.warn("fastjs/dom/val", `This element is not a **input or textarea or button**, instanceof **${this._el.constructor.name}**`, [
                "*super._el: ", this._el,
                "val(): string",
                "val(val: string): Dom",
                "super:", this
            ], ["fastjs.right", "fastjs.warn"]);
        }
        return this;
    }

    /** @description Class Functions */

    addClass(className: string[]): Dom
    addClass(...className: string[]): Dom

    addClass(className: string | string[]): Dom {
        if (typeof className === "string") {
            [...arguments].forEach((v: string) => {
                v.split(" ").forEach((v) => {
                    this.setClass(v, true);
                })
            })
        } else this.setClass(className);
        return this;
    }

    clearClass(): Dom {
        return this.removeClass(...this._el.classList);
    }

    removeClass(className: string[]): Dom
    removeClass(...className: string[]): Dom

    removeClass(className: string | string[]): Dom {
        const classList: string[] = Array.isArray(className) ? className : [...arguments];
        classList.forEach((v) => {
            this.setClass(v, false);
        });
        return this;
    }

    setClass(): Dom
    setClass(className: string, value?: boolean): Dom
    setClass(classNames: string[]): Dom
    setClass(classNames: { [key: string]: boolean }): Dom

    setClass(classNames?: string | string[] | { [key: string]: boolean }, value: boolean = true): Dom {
        if (typeof classNames === "string")
            this._el.classList[value ? "add" : "remove"](classNames);
        else if (Array.isArray(classNames))
            classNames.forEach((v) => {
                this._el.classList.add(v);
            })
        else if (typeof classNames === "object")
            Object.entries(classNames).forEach((v) => {
                this._el.classList[v[1] ? "add" : "remove"](v[0]);
            })
        else this._el.classList.remove(...this._el.classList);

        return this;
    }

    getClass(): string[]
    getClass(className: string): boolean
    getClass(callback: (classNames: string[]) => void): Dom
    getClass(className: string, callback: (value: boolean) => void): Dom

    getClass(classNameOrCallback?: string | ((classNames: string[]) => void), callback?: (value: boolean) => void): string[] | boolean | Dom {
        const getClassProxy = (): string[] => {
            const handler: ArrayProxyHandler<string> = {
                set: (target, key: PropertyKey, value) => {
                    if (!Number.isNaN(Number(key))) this.setClass(value);
                    return Reflect.set(target, key, value);
                }
            }
            return new Proxy([...this._el.classList], handler)
        }

        if (typeof classNameOrCallback === "string")
            if (callback)
                callback(this._el.classList.contains(classNameOrCallback));
            else
                return this._el.classList.contains(classNameOrCallback);
        else if (typeof classNameOrCallback === "function")
            classNameOrCallback(getClassProxy());
        else
            return getClassProxy()

        return this;
    }
}

export default Dom