if (__DEV__ && !__TEST__ && !__ESM_BUNDLER__) {
  console.info(
    "You are running fastjs in development mode.\n" +
      "Make sure to use the production build (*.prod.js) when deploying for production."
  );
}

export { default as dom } from "./dom/index";
export type * from "./dom/index";
export { default as date } from "./date/index";
export type * from "./date/index";
export { default as request } from "./request/index";
export type * from "./request/index";
export { default as cookie } from "./cookie/index";
export type * from "./cookie/index";
export { default as utils } from "./utils/index";
export * from "./utils/index";
