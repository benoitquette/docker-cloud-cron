#!/usr/bin/env node

/**
 * Module dependencies.
 */

require('isomorphic-fetch');
const _ = require('lodash');
const cron = require('node-cron');
const async = require('async');
const dockerCloud = require('../lib/docker-cloud');

// End of dependencies.

const DEFAULT_LABEL = 'docker-cloud-cron.schedule';
const DEFAULT_API_LIMIT = 100;

const label = !_.isNil(process.env.LABEL) ? process.env.LABEL : DEFAULT_LABEL;
const apiLimit = !_.isNil(process.env.API_LIMIT) ? process.env.API_LIMIT : DEFAULT_API_LIMIT;
const apiKey = process.env.DOCKERCLOUD_AUTH;
const stack = process.env.DOCKERCLOUD_STACK_NAME;

if (_.isNil(apiKey) || _.isEmpty(apiKey)) {
  console.log(`Missing API key. Please make sure the service is running
  with the 'global' role so it can have access to the node environment.`);
} else {
  // look for all services with the appropriate label
  dockerCloud.findServicesByLabel(label, apiKey, apiLimit, (err, services) => {
    if (err) {
      return console.log(err);
    }
    // we schedule each of the service to start
    // as specified in the label text
    console.log(`Found ${services.length} service(s) to schedule.`);
    return _.each(services, (service => {
      cron.schedule(service.schedule, () => {
        dockerCloud.startService(service.uuid, apiKey, err => {
          if (err) return console.log(err);
          console.log(`Request to start service ${uuid} sent successfuly.`);
        })
      });
      console.log(`Scheduled service ${service.name} to ${service.schedule}.`);
    }));
  });
}
