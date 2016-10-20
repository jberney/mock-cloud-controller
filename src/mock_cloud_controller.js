const uuid = require('node-uuid');
const values = require('object.values');

function checkName({state, name, key, guid, res}) {
    const keys = [key];
    if (key === 'service_instances') {
        keys.push('user_provided_service_instances');
    }
    const exists = keys.reduce((memo, key) => {
        return memo || Object.keys(state[key]).reduce((memo, thisGuid) => {
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

function newName() {
    const seed = Math.floor(Math.random() * 1000000)
    return `name-${seed}`;
}

module.exports = {

    getList(state, key, parentKey) {
        return (req, res) => {
            let resources = values(state[key]);
            if (req.query.q) {
                const q = req.query.q;
                // if (typeof req.query.q === 'string') {
                //     req.query.q = [req.query.q];
                // }
                // req.query.q.forEach(q => {
                const elements = q.split(':');
                // if (elements.length !== 2) return;
                const filter = elements[0];
                const value = elements[1];
                resources = resources.filter(resource => resource.entity[filter] === value);
                // });
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

    get(state, key) {
        return (req, res) => {
            const resource = state[key][req.params.guid];
            res.json(resource);
        };
    },

    put(state, key, parentKey) {
        return (req, res) => {
            const now = new Date(Date.now()).toISOString();
            const entity = req.body;
            const name = entity.name;
            const guid = req.params.guid || uuid.v4();
            if (checkName({state, name, key, guid, res})) return;
            let resource = state[key][guid];
            if (!resource) {
                resource = {
                    metadata: {
                        guid,
                        url: `/v2/${key}/${guid}`,
                        created_at: now,
                        updated_at: now
                    },
                    entity: {}
                };
                state[key][guid] = resource;
            }
            resource.metadata.updated_at = now;
            Object.keys(entity).forEach(key => {
                resource.entity[key] = entity[key];
            });
            resource.entity.name = resource.entity.name || newName();
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
            switch (key) {
                case 'apps':
                    resource.entity.package_state = 'STAGED';
                    break;
            }
            state[key][guid] = resource;
            resource.entity.name = resource.entity.name || newName();
            res.json(state[key][guid]);
        };
    },

    putBody(req, res) {
        res.json(req.body);
    },

    getStateful(req, res) {
        res.json({0: {state: 'running'}});
    },

    getEmpty(req, res) {
        res.json({});
    }

};