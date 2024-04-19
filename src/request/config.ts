import _dev from "../dev";

import type { FastjsRequest } from "./fetch";
import type { FailedParams } from "./def";
import type { RequestReturn } from "./def";

export interface GlobalConfig {
    timeout: number;
    hooks: {
        before?: (request: FastjsRequest, config: GlobalConfig) => boolean;
        init?: (request: FastjsRequest, config: GlobalConfig) => boolean;
        success?: (response: RequestReturn, config: GlobalConfig) => boolean;
        failed?: (error: Error | number, request: FastjsRequest, config: GlobalConfig) => boolean;
        callback?: (
            response: Response,
            request: FastjsRequest,
            data: {
                [key: string]: any;
            }, config: GlobalConfig
        ) => boolean
    }
    handler: {
        handleResponse: (response: Response, request: FastjsRequest) => Promise<any>;
        responseCode: (code: number, request: FastjsRequest) => boolean;
    }
    check: {
        ignoreFormatWarning: boolean;
        stringBodyWarning: boolean;
        unrecommendedMethodWarning: boolean;
    }
}

export const globalConfig: GlobalConfig = {
    timeout: 5000,
    hooks: {
        // before: (): boolean => true,
        // init: (): boolean => true,
        // success: (): boolean => true,
        // failed: (): boolean => true,
        // callback: (): boolean => true,
    },
    handler: {
        handleResponse: async (response: Response, request: FastjsRequest): Promise<object | string> => {
            if (response.headers.get("Content-Type")?.includes("application/json"))
                return (await response.json());
            return (await response.text());
        },
        responseCode: (code: number): boolean => {
            return code >= 200 && code < 300;
        }
    },
    check: {
        ignoreFormatWarning: false,
        stringBodyWarning: true,
        unrecommendedMethodWarning: true
    }
}

export function createConfig(config: Partial<RequestConfig> = {}): RequestConfig {
    return {
        timeout: config.timeout || globalConfig.timeout,
        headers: config.headers || {},
        wait: config.wait || 0,
        failed: config.failed || (() => 0),
        callback: config.callback || (() => 0),
        keepalive: config.keepalive || false,
        keepaliveWait: config.keepaliveWait || 0,
        query: config.query || null,
        body: config.body || null,
        hooks: {
            before: config.hooks?.before || globalConfig.hooks.before || (() => true),
            init: config.hooks?.init || globalConfig.hooks.init || (() => true),
            success: config.hooks?.success || globalConfig.hooks.success || (() => true),
            failed: config.hooks?.failed || globalConfig.hooks.failed || (() => true),
            callback: config.hooks?.callback || globalConfig.hooks.callback || (() => true)
        }
    }
}


export interface RequestConfig {
    timeout: number;
    headers: {
        [key: string]: string;
    };
    wait: number;
    failed: (error: FailedParams<Error | number | null>) => void;
    callback: (data: any, response: RequestReturn) => void;
    keepalive: boolean;
    keepaliveWait: number;
    query: {
        [key: string]: any;
    } | string | null;
    body: {
        [key: string]: any;
    } | string | null;
    hooks: {
        before: (request: FastjsRequest, config: GlobalConfig) => boolean;
        init: (request: FastjsRequest, config: GlobalConfig) => boolean;
        success: (response: RequestReturn, config: GlobalConfig) => boolean;
        failed: (error: any, request: FastjsRequest, config: GlobalConfig) => boolean;
        callback: (
            response: Response,
            request: FastjsRequest,
            data: {
                [key: string]: any;
            }, config: GlobalConfig
        ) => boolean
    }
}