const uuid = require('node-uuid');
const values = require('object.values');

function sendJson(res, obj) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(obj));
};

function checkName({state, name, key, guid, res}) {
    const keys = [key];
    if (key === 'service_instances') {
        keys.push('user_provided_service_instances');
    }
    const exists = keys.reduce((memo, key) => {
        return memo || Object.keys(state[key] || {}).reduce((memo, thisGuid) => {
                const value = state[key][thisGuid];
                return memo || thisGuid !== guid && value.entity.name === name;
            }, false);
    }, false);
    if (exists) {
        const keySingular = key.replace('_', ' ').replace(/_?([^_]+)s$/, '$1');
        const description = `The ${keySingular} name is taken: ${name}`;
        res.status(502) && sendJson(res, {description});
    }
    return exists;
};

module.exports = {

    emptyLists: [
        '/apps/:appGuid/routes',
        '/organizations/:orgGuid/private_domains',
        '/spaces/:spaceGuid/services',
        '/spaces/:spaceGuid/user_roles'
    ],

    emptyObjects: [
        '/apps/:appGuid/env',
        '/apps/:appGuid/instances',
        '/apps/:appGuid/stats',
        '/config/feature_flags/:feature_flag'
    ],

    subRoutes: {
        apps: ['routes'],
        organizations: ['memory_usage', 'services', 'spaces', 'user_roles']
    },

    getEmptyList(req, res){
        sendJson(res, {
            'total_results': 0,
            'total_pages': 1,
            'prev_url': null,
            'next_url': null,
            'resources': []
        });
    },

    getEmptyObject(req, res){
        sendJson(res, {});
    },

    getList(state, key, subKey){
        return (req, res) => {
            let resources = null;
            try {
                resources = values(!subKey ? state[key] : state[key][req.params.guid][subKey]);
            } catch (e) {
                resources = [];
            }
            sendJson(res, {
                total_results: resources.length,
                total_pages: 1,
                prev_url: null,
                next_url: null,
                resources
            });
        };
    },

    get(state, key, subKey){
        return (req, res) => {
            const resource = !subKey ? state[key][req.params.guid] : state[key][req.params.guid][subKey];
            sendJson(res, resource);
        };
    },

    put(state, key, subKey){
        return (req, res) => {
            const now = new Date(Date.now()).toISOString();
            const name = req.body.name;
            const guid = req.params.guid;
            if (checkName({state, name, key, guid, res})) return;
            let resource = !subKey ? state[key][guid] : state[key][guid][subKey][req.params.subGuid];
            // TODO: does put support create?
            // if (!resource) {
            //     req.params.subGuid = uuid.v4();
            //     resource = {
            //         metadata: {
            //             guid: req.params.subGuid,
            //             url: `/v2/${key}/${guid}`,
            //             created_at: now,
            //             updated_at: now
            //         },
            //         entity: {}
            //     };
            //     state[key][guid][subKey][req.params.subGuid] = resource;
            // }
            resource.metadata.updated_at = now;
            Object.keys(req.body).forEach(key => {
                resource.entity[key] = req.body[key];
            });
            sendJson(res, resource);
        };
    },

    del(state, key){
        return (req, res) => {
            delete state[key][req.params.guid];
            sendJson(res, {});
        }
    },

    post(state, key){
        return (req, res) => {
            const name = req.body.name;
            if (checkName({state, name, key, res})) return;
            const guid = uuid.v4();
            const now = new Date(Date.now()).toISOString();
            state[key][guid] = {
                metadata: {
                    guid,
                    url: `/v2/${key}/${guid}`,
                    created_at: now,
                    updated_at: now
                },
                entity: req.body
            };
            switch (key) {
                case 'service_bindings':
                    state[key][guid].entity.credentials = {
                        pass: 'word',
                        user: 'name'
                    };
                    break;
            }
            sendJson(res, state[key][guid]);
        };
    }

};