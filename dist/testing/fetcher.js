"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newFetcherSyncExecutionContext = exports.newFetcherExecutionContext = exports.DummyBlobStorage = exports.AuthenticatingFetcher = void 0;
const types_1 = require("../types");
const url_1 = require("url");
const ensure_1 = require("../helpers/ensure");
const auth_1 = require("./auth");
const request_promise_native_1 = __importDefault(require("request-promise-native"));
const uuid_1 = require("uuid");
const xml2js_1 = __importDefault(require("xml2js"));
const FetcherUserAgent = 'Coda-Server-Fetcher';
const MAX_CONTENT_LENGTH_BYTES = 25 * 1024 * 1024;
class AuthenticatingFetcher {
    constructor(authDef, credentials) {
        this._authDef = authDef;
        this._credentials = credentials;
    }
    fetch(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { url, headers, body, form } = this._applyAuthentication(request);
            const response = yield request_promise_native_1.default({
                url,
                method: request.method,
                headers: Object.assign(Object.assign({}, headers), { 'User-Agent': FetcherUserAgent }),
                body,
                form,
                encoding: request.isBinaryResponse ? null : undefined,
                resolveWithFullResponse: true,
                timeout: 60000,
                forever: true,
            });
            let responseBody = response.body;
            if (responseBody && responseBody.length >= MAX_CONTENT_LENGTH_BYTES) {
                throw new Error(`Response body is too large for Coda. Body is ${responseBody.length} bytes.`);
            }
            try {
                const contentType = response.headers['content-type'];
                if (contentType && contentType.includes('text/xml')) {
                    responseBody = yield xml2js_1.default.parseStringPromise(responseBody, { explicitRoot: false });
                }
                else {
                    responseBody = JSON.parse(responseBody);
                }
                // Do not inadvertently parse non-objects.
                if (typeof responseBody !== 'object') {
                    responseBody = response.body;
                }
            }
            catch (e) {
                // Ignore if we cannot parse.
            }
            const responseHeaders = Object.assign({}, response.headers);
            for (const key of Object.keys(responseHeaders)) {
                if (key.toLocaleLowerCase() === 'authorization') {
                    delete responseHeaders[key];
                }
            }
            return {
                status: response.statusCode,
                headers: responseHeaders,
                body: responseBody,
            };
        });
    }
    _applyAuthentication({ url, headers, body, form, }) {
        if (!this._authDef) {
            return { url, headers, body, form };
        }
        if (!this._credentials) {
            throw new Error(`${this._authDef.type} authentication is required for this pack, but no local credentials were found. ` +
                'Run "coda auth path/to/pack/manifest to set up credentials."');
        }
        switch (this._authDef.type) {
            case types_1.AuthenticationType.None:
                return { url, headers, body, form };
            case types_1.AuthenticationType.WebBasic: {
                const { username, password } = this._credentials;
                const encodedAuth = Buffer.from(`${username}:${password}`).toString('base64');
                return { url, body, form, headers: Object.assign(Object.assign({}, headers), { Authorization: `Basic ${encodedAuth}` }) };
            }
            case types_1.AuthenticationType.QueryParamToken: {
                const { paramValue } = this._credentials;
                const parsedUrl = new url_1.URL(url);
                // Put the key at the beginning, as some APIs expect it at the beginning.
                const entries = [...parsedUrl.searchParams.entries()];
                parsedUrl.searchParams.set(this._authDef.paramName, paramValue);
                for (const [key, value] of entries) {
                    parsedUrl.searchParams.delete(key);
                    parsedUrl.searchParams.set(key, value);
                }
                return { headers, body, form, url: parsedUrl.href };
            }
            case types_1.AuthenticationType.MultiQueryParamToken: {
                const paramDict = this._credentials;
                const parsedUrl = new url_1.URL(url);
                for (const [paramName, paramValue] of Object.entries(paramDict)) {
                    if (!paramValue) {
                        throw new Error(`Param value for ${paramName} is empty. Please provide a value for this parameter or omit it.`);
                    }
                    parsedUrl.searchParams.set(paramName, paramValue);
                }
                return { headers, body, form, url: parsedUrl.href };
            }
            case types_1.AuthenticationType.HeaderBearerToken:
            case types_1.AuthenticationType.CodaApiHeaderBearerToken: {
                const { token } = this._credentials;
                return { url, body, form, headers: Object.assign(Object.assign({}, headers), { Authorization: `Bearer ${token}` }) };
            }
            case types_1.AuthenticationType.CustomHeaderToken: {
                const { token } = this._credentials;
                const valuePrefix = this._authDef.tokenPrefix ? `${this._authDef.tokenPrefix} ` : '';
                return { url, body, form, headers: Object.assign(Object.assign({}, headers), { [this._authDef.headerName]: `${valuePrefix}${token}` }) };
            }
            case types_1.AuthenticationType.AWSSignature4:
                throw new Error('Not yet implemented');
            case types_1.AuthenticationType.OAuth2:
                throw new Error('Not yet implemented');
            default:
                return ensure_1.ensureUnreachable(this._authDef);
        }
    }
}
exports.AuthenticatingFetcher = AuthenticatingFetcher;
class DummyBlobStorage {
    storeUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            return `https://example.com/temporaryBlob/${uuid_1.v4()}`;
        });
    }
    storeBlob() {
        return __awaiter(this, void 0, void 0, function* () {
            return `https://example.com/temporaryBlob/${uuid_1.v4()}`;
        });
    }
}
exports.DummyBlobStorage = DummyBlobStorage;
function newFetcherExecutionContext(packName, authDef, credentialsFile) {
    const allCredentials = auth_1.readCredentialsFile(credentialsFile);
    const credentials = allCredentials === null || allCredentials === void 0 ? void 0 : allCredentials[packName];
    return {
        invocationLocation: {
            protocolAndHost: 'https://coda.io',
        },
        timezone: 'America/Los_Angeles',
        invocationToken: uuid_1.v4(),
        fetcher: new AuthenticatingFetcher(authDef, credentials),
        temporaryBlobStorage: new DummyBlobStorage(),
    };
}
exports.newFetcherExecutionContext = newFetcherExecutionContext;
function newFetcherSyncExecutionContext(packName, authDef, credentialsFile) {
    const context = newFetcherExecutionContext(packName, authDef, credentialsFile);
    return Object.assign(Object.assign({}, context), { sync: {} });
}
exports.newFetcherSyncExecutionContext = newFetcherSyncExecutionContext;
