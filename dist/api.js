"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_types_1 = require("./api_types");
const ensure_1 = require("./helpers/ensure");
const handler_templates_1 = require("./handler_templates");
const handler_templates_2 = require("./handler_templates");
const schema_1 = require("./schema");
class UserVisibleError extends Error {
}
exports.UserVisibleError = UserVisibleError;
class StatusCodeError extends Error {
    constructor(statusCode) {
        super(`statusCode: ${statusCode}`);
        this.statusCode = statusCode;
    }
}
exports.StatusCodeError = StatusCodeError;
// NOTE[roger] remove once not needed.
exports.PARAM_DESCRIPTION_DOES_NOT_EXIST = 'NO PARAMETER DESCRIPTION HAS BEEN ADDED. For guidance, see https://coda.link/param-docs';
function makeStringParameter(name, description, args = {}) {
    return Object.freeze(Object.assign({}, args, { name, description, type: api_types_1.Type.string }));
}
exports.makeStringParameter = makeStringParameter;
function makeNumericParameter(name, description, args = {}) {
    return Object.freeze(Object.assign({}, args, { name, description, type: api_types_1.Type.number }));
}
exports.makeNumericParameter = makeNumericParameter;
function makeBooleanParameter(name, description, args = {}) {
    return Object.freeze(Object.assign({}, args, { name, description, type: api_types_1.Type.boolean }));
}
exports.makeBooleanParameter = makeBooleanParameter;
function makeDateParameter(name, description, args = {}) {
    return Object.freeze(Object.assign({}, args, { name, description, type: api_types_1.Type.date }));
}
exports.makeDateParameter = makeDateParameter;
function makeUserVisibleError(msg) {
    return new UserVisibleError(msg);
}
exports.makeUserVisibleError = makeUserVisibleError;
function check(condition, msg) {
    if (!condition) {
        throw makeUserVisibleError(msg);
    }
}
exports.check = check;
function isObjectPackFormula(fn) {
    return fn.resultType === api_types_1.Type.object;
}
exports.isObjectPackFormula = isObjectPackFormula;
function isStringPackFormula(fn) {
    return fn.resultType === api_types_1.Type.string;
}
exports.isStringPackFormula = isStringPackFormula;
function makeNumericFormula(definition) {
    return Object.assign({}, definition, { resultType: api_types_1.Type.number });
}
exports.makeNumericFormula = makeNumericFormula;
function makeStringFormula(definition) {
    const { response } = definition;
    return Object.assign({}, definition, Object.assign({ resultType: api_types_1.Type.string }, (response && { schema: response.schema })));
}
exports.makeStringFormula = makeStringFormula;
function makeGetConnectionNameFormula(execute) {
    return makeStringFormula({
        name: 'getConnectionName',
        description: 'Return name for new connection.',
        execute(args, context) {
            const [codaUserName, authParams] = args;
            return execute(context, codaUserName, authParams);
        },
        parameters: [
            makeStringParameter('codaUserName', 'The username of the Coda account to use.'),
            makeStringParameter('authParams', 'The parameters to use for this connection.'),
        ],
        examples: [],
        network: {
            hasSideEffect: false,
            hasConnection: true,
            requiresConnection: true,
        },
    });
}
exports.makeGetConnectionNameFormula = makeGetConnectionNameFormula;
function isResponseHandlerTemplate(obj) {
    return obj && obj.schema;
}
function isResponseExampleTemplate(obj) {
    return obj && obj.example;
}
function makeObjectFormula(definition) {
    const { response } = definition;
    let schema;
    if (response) {
        if (isResponseHandlerTemplate(response)) {
            response.schema = schema_1.normalizeSchema(response.schema);
            schema = response.schema;
        }
        else if (isResponseExampleTemplate(response)) {
            // TODO(alexd): Figure out what to do with examples.
            // schema = generateSchema(response.example);
        }
    }
    let execute = definition.execute;
    if (isResponseHandlerTemplate(response)) {
        const { onError } = response;
        const wrappedExecute = execute;
        const responseHandler = handler_templates_2.generateObjectResponseHandler(response);
        execute = function exec(params, context) {
            return __awaiter(this, void 0, void 0, function* () {
                let result;
                try {
                    result = yield wrappedExecute(params, context);
                }
                catch (err) {
                    if (onError) {
                        result = onError(err);
                    }
                    else {
                        throw err;
                    }
                }
                return responseHandler({ body: ensure_1.ensureExists(result), status: 200, headers: {} });
            });
        };
    }
    return Object.assign({}, definition, {
        resultType: api_types_1.Type.object,
        execute,
        schema,
    });
}
exports.makeObjectFormula = makeObjectFormula;
function makeTranslateObjectFormula(definition) {
    const { request, response, parameters } = definition;
    response.schema = schema_1.normalizeSchema(response.schema);
    const { onError } = response;
    const requestHandler = handler_templates_1.generateRequestHandler(request, parameters);
    const responseHandler = handler_templates_2.generateObjectResponseHandler(response);
    function execute(params, context) {
        return context
            .fetcher.fetch(requestHandler(params))
            .catch(err => {
            if (onError) {
                return onError(err);
            }
            throw err;
        })
            .then(responseHandler);
    }
    return Object.assign({}, definition, {
        execute,
        resultType: api_types_1.Type.object,
        schema: response.schema,
    });
}
exports.makeTranslateObjectFormula = makeTranslateObjectFormula;
function makeEmptyFormula(definition) {
    const { request, parameters } = definition;
    const requestHandler = handler_templates_1.generateRequestHandler(request, parameters);
    function execute(params, context) {
        return context.fetcher.fetch(requestHandler(params)).then(() => '');
    }
    return Object.assign({}, definition, {
        execute,
        resultType: api_types_1.Type.string,
    });
}
exports.makeEmptyFormula = makeEmptyFormula;
