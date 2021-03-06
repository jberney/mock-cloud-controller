const uuid = require('node-uuid');
const values = require('object.values');

const names = {
  private_domains: 'domains',
  shared_domains: 'domains',
  spaces: 'app spaces'
};

function pushLog(logs, guid, message) {
  logs[guid] = logs[guid] || [];
  logs[guid].push({
    message: Buffer.from(message),
    message_type: 'OUT',
    timestamp: 1000 * Date.now()
  });
}

function initParentAssocs(state, parentKey, parentGuid, key) {
  const parentAssocs = state.associations[parentKey];
  if (!parentAssocs[parentGuid]) {
    parentAssocs[parentGuid] = {};
  }
  if (!parentAssocs[parentGuid][key]) {
    parentAssocs[parentGuid][key] = [];
  }
  return parentAssocs[parentGuid][key];
};

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
    const keySingular = (names[key] || key).replace('_', ' ').replace(/_?([^_]+)s$/, '$1');
    const description = `The ${keySingular} name is taken: ${name}`;
    res.status(502) && res.json({description});
  }
  return exists;
}

function newName() {
  const seed = Math.floor(Math.random() * 1000000);
  return `name-${seed}`;
}

function filterFunction(op, filter, value) {
  return {
    ':': resource => resource.entity[filter] === value,
    ' IN 20': resource => {
      const values = value.split(',');
      return values.indexOf(resource.entity[filter]) !== -1
    }
  }[op];
}

module.exports = {

  getFeature({params: {feature}}, res) {
    res.json({name: feature, enabled: true});
  },

  getList(state, key, parentKey) {
    return (req, res) => {
      let resources = values(state[key]);
      if (parentKey && ['services', 'shared_domains'].indexOf(key) === -1) {
        const parentGuid = req.params.parentGuid;
        const parentAssocs = initParentAssocs(state, parentKey, parentGuid, key);
        resources = resources.filter(({metadata: {guid}}) => parentAssocs.indexOf(guid) !== -1);
      }
      if (req.query.q) {
        if (typeof req.query.q === 'string') {
          req.query.q = [req.query.q];
        }
        req.query.q.forEach(q => {
          let op;
          // if (q.indexOf(':') !== -1) op = ':';
          // else if (q.indexOf('>=') !== -1) op = '>=';
          // else if (q.indexOf('<=') !== -1) op = '<=';
          // else if (q.indexOf('>') !== -1) op = '>';
          // else if (q.indexOf('<') !== -1) op = '<';
          /*else*/
          if (q.indexOf(' IN 20') !== -1) op = ' IN 20';
          else op = ':';
          const elements = q.split(op);
          const filter = elements[0];
          const value = elements[1];
          resources = resources.filter(filterFunction(op, filter, value));
        });
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

  put(state, logs, key, parentKey) {
    return (req, res) => {
      const now = new Date(Date.now()).toISOString();
      const entity = req.body;
      const guid = req.params.guid || uuid.v4();
      if (parentKey) {
        const parentGuid = req.params.parentGuid;
        const parentAssocs = initParentAssocs(state, parentKey, parentGuid, key);
        parentAssocs.push(guid);
        if (['managers', 'users'].indexOf(key) !== -1 && parentKey === 'organizations') {
          const username = entity.username || 'admin';
          entity.username = username;
          const orgRole = `org_${key}`.slice(0, -1);
          const userRole = state.user_roles[username] || {
              metadata: {
                guid: username,
                url: `/v2/user_roles/${username}`,
                created_at: now,
                updated_at: now
              },
              entity: {
                username,
                admin: username === 'admin',
                active: username === 'admin',
                organization_roles: [
                  orgRole
                ]
              }
            };
          userRole.metadata.updated_at = now;
          state.user_roles[username] = userRole;
          const parentUserRoles = initParentAssocs(state, parentKey, parentGuid, 'user_roles');
          parentUserRoles.indexOf(username) !== -1 || parentUserRoles.push(username);
        }
      }
      const name = entity.name;
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
      switch (key) {
        case 'apps':
          const eventGuid = uuid.v4();
          state.events[eventGuid] = {
            metadata: {
              guid: eventGuid,
              url: `/v2/events/${eventGuid}`,
              created_at: now,
              updated_at: now
            },
            entity: {
              actee: guid,
              type: {
                STARTED: 'audit.app.create',
                STOPPED: 'audit.app.crash'
              }[entity.state]
            }
          };
          pushLog(logs, guid, `"state"=>"${entity.state}"`);
          break;
      }

      res.json(resource);
    };
  },

  del(state, key, parentKey) {
    return ({params: {guid, parentGuid}}, res) => {
      delete state[key][guid];
      if (parentKey && key === 'users') {
        const userRoles = state.associations[parentKey][parentGuid].user_roles;
        const guidIndex = userRoles.indexOf(guid);
        guidIndex === -1 || userRoles.splice(guidIndex, 1);
      }
      res.status(204).end();
    }
  },

  post(state, logs, key) {
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
          resource.entity.stack_guid = 'STACK_GUID';
          const spaceGuid = resource.entity.space_guid;
          resource.entity.organization_guid = state.spaces[spaceGuid].entity.organization_guid;
          pushLog(logs, guid, `Created app with guid ${guid}`);
          break;
        case 'routes':
          resource.entity.path = resource.entity.path || '';
          break;
        case 'service_bindings':
          resource.entity.credentials = {
            pass: 'word',
            user: 'name'
          };
          break;
        case 'service_instances':
          resource.entity.type = 'managed_service_instance';
          break;
        case 'user_provided_service_instances':
          resource.entity.type = 'user_provided_service_instance';
          break;
      }
      resource.entity.name = resource.entity.name || newName();
      Object.keys(entity).forEach(field => {
        if (!field.match(/_guid$/)) return;
        const assocParentGuid = entity[field];
        const assocParentKey = `${field
          .replace(/^owning_/, '')
          .replace(/_guid$/, '')}s`;
        if (!state.associations[assocParentKey]) return;
        const parentAssocs = initParentAssocs(state, assocParentKey, assocParentGuid, key);
        parentAssocs.push(guid);
      });
      state[key][guid] = resource;
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