#!/usr/bin/env node

/**
 * Module dependencies.
 */

const _ = require('lodash');
const cron = require('node-cron');

// End of dependencies.

const LABEL = 'docker-cloud-cron.schedule';

// retrieve API key
const apiKey = process.env.DOCKERCLOUD.DOCKERCLOUD_AUTH;
console.log(`Retrieved API key: ${apiKey}`);

// look for all services with the label 'docker-cloud-cron.schedule'
const services = getServicesByLabel(LABEL);
_.each(services, service => {
  startService(service.name, service.schedule);
});

function scheduleService(name, schedule) {
  console.log(`Scheduling service ${name}...`);
  cron.schedule(schedule, () => {
    startService(name);
  });
  console.log(`Scheduling service ${name}: OK`);
}

function startService(name) {

}

function getServicesByLabel(label) {
  console.log(`Looking for services with label ${label}...`);
  console.log(`Looking for services with label ${label}: OK`);
  return [];
}
