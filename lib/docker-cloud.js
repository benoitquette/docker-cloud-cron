/**
 * Module dependencies.
 */

const _ = require('lodash');
const async = require('async');
require('isomorphic-fetch');

// End of dependencies.

/**
 * Look for services with a specific label assigned to them.
 *
 * @param {string} label the name of the label to look for.
 * @param {string} auth the API key to use to authenticate against Docker Cloud.
 * @param {number} apiLimit the limit number of services. This number will be used
 * to fetch the services. We use it because if not set, the API defaults to 25 and
 * we would have to handle paging. And we don't want to do that...
 * @param {function} callback takes 2 arguments: an <code>error</code> string and
 * an <code>array</code> of services.
 */
function findServicesByLabel(label, auth, apiLimit, callback) {
  console.log(`Looking for services with label ${label}...`);
  fetch(`https://cloud.docker.com/api/app/v1/service/?limit=${apiLimit}`, {
    method: 'GET',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Authorization' : auth
    })
  })
    .then(response => {
      if (response.status >= 400) throw new Error(response.statusText);
      return response.json();
    })
    .then(services => {
      async.reduce(services.objects, [], (res, item, cbk) => {
          _fetchService(item.uuid, auth, (err, service) => {
            if (err) return cbk(err);
            if (service.labels.hasOwnProperty(label)) {
              console.log(`Found label ${label} on service ${service.nickname}`);
              res.push({
                uuid: item.uuid,
                name: service.nickname,
                schedule: service.labels[label]
              });
            }
            return cbk(null, res);
          })
        }, (err, results) => {
          callback(null, results);
        });
    })
    .catch(err => callback(err));
}

function _fetchService(uuid, auth, callback) {
  fetch(`https://cloud.docker.com/api/app/v1/service/${uuid}`, {
    method: 'GET',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Authorization' : auth
    })
  })
    .then(response => {
      if (response.status >= 400) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(service => {
      console.log(`Inspecting service ${service.nickname}`);
      callback(null, service);
    })
    .catch(err => callback(err));
}

/**
 * Sends a request to Docker Cloud to start a given service.
 *
 * @param {string} uuid the unique identifier of the service to start.
 * @param {string} auth the API key to use to authenticate against Docker Cloud.
 * @param {function} callback takes one argument only: an <code>error</code> string.
 */
function _startService(uuid, auth, callback) {
  return _controlService('start', uuid, auth, callback);
}

/**
 * Sends a request to Docker Cloud to stop a given service.
 *
 * @param {string} uuid the unique identifier of the service to start.
 * @param {string} auth the API key to use to authenticate against Docker Cloud.
 * @param {function} callback takes one argument only: an <code>error</code> string.
 */
function _stopService(uuid, auth, callback) {
  return _controlService('stop', uuid, auth, callback);
}

/**
 * Sends a request to Docker Cloud to stop the given service, waits 10 seconds
 * and then sends a request to start the same service.
 *
 * @param {string} uuid the unique identifier of the service to start.
 * @param {string} auth the API key to use to authenticate against Docker Cloud.
 * @param {function} callback takes one argument only: an <code>error</code> string.
 */
function restartService(uuid, auth, callback) {
  _stopService(uuid, auth, err => {
    if (err) return callback(err);
    setTimeout(() => {
      _startService(uuid, auth, err => {
      if (err) return callback(err);
      callback();
    });
    }, 10000);
  })
}

/**
 * Sends a request to Docker Cloud to control a given service. Can be 'start' or 'stop'
 *
 * @param {string} action the action to take: stop or start.
 * @param {string} uuid the unique identifier of the service to start.
 * @param {string} auth the API key to use to authenticate against Docker Cloud.
 * @param {function} callback takes one argument only: an <code>error</code> string.
 */
function _controlService(action, uuid, auth, callback) {
  console.log(`Sending request to ${action} service ${uuid}...`);
  fetch(`https://cloud.docker.com/api/app/v1/service/${uuid}/${action}/`, {
    method: 'POST',
    mode: 'cors',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Authorization' : auth
    })
  })
    .then(response => {
      if (response.status >= 400) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(results => {
      callback(null);
    })
    .catch(err => callback(err));
}

module.exports = {
  findServicesByLabel,
  restartService
}
