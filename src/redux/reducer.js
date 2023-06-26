import { defaultBranch, LangsBranch } from './router';
import proxy from '../proxy'
import Langs from '../langs';
import { config, functions } from './configs';
import { socket } from './configs/socket';

import DatabaseBranch from './router/db';
import ApiBranch from './router/api';

const initState = {
    ...config,
    functions,
    auth: {},
    // socket,
    tempFields: [],
    tempCounter: 0,
    proxy,
    lang: Langs[localStorage.getItem("lang") ? localStorage.getItem("lang") : "Vi"],
    database: { tables: [], fields: [], currentTable: {}, currentField: {}, offsets: [], tableOffsets: [], offsetPoints: [] },
}

export default (state = initState, action) => {
    switch (action.branch) {
        case "langs":
            return LangsBranch(state, action);
            break;
        // case "default":
        //     return defaultBranch(state, action);
        //     break;
        case "db":
            return DatabaseBranch(state, action);
            break;

        case "api":
            return ApiBranch(state, action);
            break;

        default:
            return defaultBranch(state, action);
            break;
    }
}
