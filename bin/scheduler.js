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
let auth = process.env.DOCKERCLOUD_AUTH;
const user = process.env.DOCKERCLOUD_USER;
const apiKey = process.env.DOCKERCLOUD_API_KEY;
const stack = process.env.DOCKERCLOUD_STACK_NAME;

if (_.isNil(auth) || _.isEmpty(auth)) {
  console.log(`Missing authorization key: using username and API key.`);
  if (_.isNil(apiKey) || _.isEmpty(apiKey) || _.isNil(user) || _.isEmpty(user)) {
    console.log('Missing username and/or API key. Giving up.')
  } else {
    auth = 'Basic ' + base64.encode(`${user}:${apiKey}`);
    // look for all services with the appropriate label
    dockerCloud.findServicesByLabel(label, auth, apiLimit, (err, services) => {
      if (err) return console.log(err);
      // we schedule each of the service to start as specified in the label text
      console.log(`Found ${services.length} service(s) to schedule.`);
      return _.each(services, (service => {
        cron.schedule(service.schedule, () => {
          dockerCloud.startService(service.uuid, auth, err => {
            if (err) return console.log(err);
            console.log(`Request to start service ${uuid} sent successfuly.`);
          })
        });
        console.log(`Scheduled service ${service.name} to ${service.schedule}.`);
      }));
    });
  }
}
