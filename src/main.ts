// modules
import request from "./request";
import array from "./array";
import date from "./date";
import dom from "./dom";
import {FastjsDom, FastjsDomList} from "./dom";
import utils from "./utils";
import {rand, copy} from "./utils/methods";

if (__DEV__) {
    console.info("You are running fastjs in development mode.\n" +
        "Make sure to use the production build (*.prod.js) when deploying for production.");
}

// export
export {
    /** @module array */
    array,
    /** @module date */
    date,
    /** @module dom */
    dom,
    FastjsDom,
    FastjsDomList,
    /** @module request */
    request,
    /** @module utils */
    utils,
    rand,
    copy
};
