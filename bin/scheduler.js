#!/usr/bin/env node

/**
 * Module dependencies.
 */

const _ = require('lodash');
const cron = require('node-cron');

// End of dependencies.

// look for all services with the label 'docker-cloud.schedule'

// for each service we start a scheduler
cron.schedule(crawlerConfig.schedule, () => {
  startService();
});

function scheduleService(name, schedule) {
  console.log(`Starting scheduler for service ${name}...`);
  console.log(`Starting scheduler for service ${name}: OK`);
}

function startService() {

}
