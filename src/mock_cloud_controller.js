const uuid = require('node-uuid');
const values = require('object.values');

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
        res.status(502) && res.json({description});
    }
    return exists;
};

const subRoutes = {
    apps: ['routes'],
    organizations: ['managers', 'memory_usage', 'services', 'spaces', 'user_roles', 'users'],
    spaces: ['developers', 'managers', 'users']
}

module.exports = {

    subRoutes,

    getList(state, key, subKey) {
        return (req, res) => {
            let resources = null;
            try {
                resources = values(!subKey ? state[key] : state[key][req.params.guid][subKey]);
            } catch (e) {
            }
            resources = resources || []
            if (req.query.q) {
                const elements = req.query.q.split(':');
                const filter = elements[0];
                const value = elements[1];
                resources = resources.filter(resource => resource.entity[filter] === value);
            }
            res.json({
                total_results: resources.length,
                total_pages: 1,
                prev_url: null,
                next_url: null,
                resources
            });
        };
    },

    get(state, key, subKey) {
        return (req, res) => {
            const resource = !subKey ? state[key][req.params.guid] : state[key][req.params.guid][subKey];
            res.json(resource);
        };
    },

    put(state, key, subKey) {
        return (req, res) => {
            const now = new Date(Date.now()).toISOString();
            const entity = req.body;
            const name = entity.name;
            const guid = req.params.guid;
            if (checkName({state, name, key, guid, res})) return;
            let resource = !subKey ? state[key][guid] : state[key][guid][subKey][req.params.subGuid];
            if (!resource) {
                req.params.subGuid = req.params.subGuid || uuid.v4();
                resource = {
                    metadata: {
                        guid: req.params.subGuid,
                        url: `/v2/${key}/${guid}`,
                        created_at: now,
                        updated_at: now
                    },
                    entity: {}
                };
                if (!subKey) {
                    state[key][guid] = resource;
                } else {
                    state[key][guid][subKey][req.params.subGuid] = resource;
                }
            }
            resource.metadata.updated_at = now;
            Object.keys(entity).forEach(key => {
                resource.entity[key] = entity[key];
            });
            res.json(resource);
        };
    },

    del(state, key) {
        return (req, res) => {
            delete state[key][req.params.guid];
            res.json({});
        }
    },

    post(state, key) {
        return (req, res) => {
            const entity = req.body;
            const name = entity.name;
            if (checkName({state, name, key, res})) return;
            const guid = entity.guid || uuid.v4();
            delete entity.guid;
            const now = new Date(Date.now()).toISOString();
            const resource = {
                metadata: {
                    guid,
                    url: `/v2/${key}/${guid}`,
                    created_at: now,
                    updated_at: now
                },
                entity
            };
            subRoutes[key] && subRoutes[key].forEach(subRoute => {
                resource[subRoute] = []
            });
            state[key][guid] = resource;
            switch (key) {
                case 'service_bindings':
                    state[key][guid].entity.credentials = {
                        pass: 'word',
                        user: 'name'
                    };
                    break;
            }
            res.json(state[key][guid]);
        };
    }

};