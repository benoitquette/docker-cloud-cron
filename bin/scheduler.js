#!/usr/bin/env node

/**
 * Module dependencies.
 */
require('isomorphic-fetch');
const _ = require('lodash');
const cron = require('node-cron');
const async = require('async');
const dockerCloud = require('../lib/docker-cloud');
const base64 = require('base-64');
// End of dependencies.

const DEFAULT_LABEL = 'docker-cloud-cron.schedule';
const DEFAULT_API_LIMIT = 100;

const label = !_.isNil(process.env.LABEL) ? process.env.LABEL : DEFAULT_LABEL;
const apiLimit = !_.isNil(process.env.API_LIMIT) ? process.env.API_LIMIT : DEFAULT_API_LIMIT;
const stack = process.env.DOCKERCLOUD_STACK_NAME;

buildAuthenticationToken((err, auth) => {
  if (err) return console.log(err);
  // look for all services with the appropriate label
  return dockerCloud.findServicesByLabel(label, auth, apiLimit, (service) => {
    // we schedule each of the service to start as specified in the label text
    console.log(`Found service ${service.name} to schedule.`);
    cron.schedule(service.schedule, () => {
      dockerCloud.restartService(service.uuid, auth, err => {
        if (err) return console.log(err);
        console.log(`Request to restart service ${service.uuid} sent successfuly.`);
      })
    });
    console.log(`Scheduled service ${service.name} to ${service.schedule}.`);
  });
});

/**
 * Decides wether to use the authentication token from Docker Cloud
 * or uses basic auth with the username and API key configured using
 * environment variables.
 *
 * @param {function} callback takes 2 arguments: an <code>error</code>
 * string and the auth token.
 */
function buildAuthenticationToken(callback) {
  let auth = process.env.DOCKERCLOUD_AUTH;
  const user = process.env.DOCKERCLOUD_USER;
  const apiKey = process.env.DOCKERCLOUD_API_KEY;
  if (_.isNil(auth) || _.isEmpty(auth)) {
    console.log(`Missing authorization key: using username and API key.`);
    if (_.isNil(apiKey) || _.isEmpty(apiKey) || _.isNil(user) || _.isEmpty(user)) {
      callback('Missing username and/or API key. Giving up.')
    } else {
      auth = 'Basic ' + base64.encode(`${user}:${apiKey}`);
    }
  }
  callback(null, auth);
}
