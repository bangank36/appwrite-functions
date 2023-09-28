/**
 *  Local Server
 *
 *  This file is being used just to be able to execute the
 *  current Appwrite function with a local environment
 *  while attempting to provide all the wrapped data.
 */
const func = require('./src/main.js');
const dotenv = require("dotenv")

dotenv.config()

const req = {
    method: 'GET',
    query: {
        order_id: 'order_id',
        site_url: 'site_url',
        package: 'package',
    },
    headers: {},
    payload: {},
    variables: {
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
        GITHUB_REPOS: process.env.GITHUB_REPOS,
        GITHUB_SLOW: process.env.GITHUB_SLOW,
        APPWRITE_FUNCTION_ID: '',
        APPWRITE_FUNCTION_NAME: '',
        APPWRITE_FUNCTION_DEPLOYMENT: '',
        APPWRITE_FUNCTION_TRIGGER: '',
        APPWRITE_FUNCTION_RUNTIME_NAME: '',
        APPWRITE_FUNCTION_RUNTIME_VERSION: '',
        APPWRITE_FUNCTION_EVENT: '',
        APPWRITE_FUNCTION_EVENT_DATA: '',
        APPWRITE_FUNCTION_DATA: '',
        APPWRITE_FUNCTION_PROJECT_ID: '',
        APPWRITE_FUNCTION_USER_ID: '',
        APPWRITE_FUNCTION_JWT: '',
    },
};

const res = {
    send(text, status) {
        console.log(text, status);
    },
    json(obj, status) {
        console.log(obj, status);
    },
    setHeader(key, value) {
        console.log(key, value);
    },
    set(key, value) {
        console.log(key, value);
    }
};

const log = (...args) => console.log('[LOG] ', ...args);
const error = (...args) => console.error('[ERR] ', ...args);

func({ req, res, log, error }).then();
