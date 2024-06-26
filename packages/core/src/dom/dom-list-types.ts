import type { FastjsDom, FastjsDomAPI, FastjsDomAtom } from "./dom-types";
import type { EachCallback } from "./def";
import { FastjsModuleBase } from "../base/def";

export interface FastjsDomListAtom {
  construct: "FastjsDomList";
  _list: Array<FastjsDom>;
  length: number;
}

export interface FastjsDomListAPI {
  add(el: FastjsDom): FastjsDomList;
  delete(key: number, deleteDom?: boolean): FastjsDomList;
  each(callback: EachCallback): FastjsDomList;
  el(key?: number): HTMLElement;
  getElement(key?: number): HTMLElement;
  getDom(key?: number): FastjsDom;
  next<
    T extends FastjsDom | FastjsDomList | null =
      | FastjsDom
      | FastjsDomList
      | null
  >(
    selector: string
  ): T;
  toArray(): FastjsDomList;
  toElArray(): Array<HTMLElement>;
}

export type FastjsDomList = FastjsDomListAtom &
  FastjsDomListAPI &
  Omit<FastjsDomAtom, "construct"> &
  Omit<FastjsDomAPI, keyof Array<FastjsDom>> &
  FastjsModuleBase &
  Array<FastjsDom>;
