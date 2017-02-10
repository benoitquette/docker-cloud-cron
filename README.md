# docker-cloud-cron
Schedule one-off starting of services in [Docker Cloud](https://cloud.docker.com).

The goal of this project is to facilitate the starting of services in a cron-like fashion.
This will only work in Docker Cloud.

This is inspired from the [Rancher Cron Service](https://github.com/SocialEngine/rancher-cron) project that already exists but for [Rancher](http://rancher.com/) only.

## Setup

Setting up an environment can be done in 2 steps:
1. Adding a service based on the docker-cloud-cron image in one of your stack.
You need to ensure that the service will have a 'global' role.
```yaml
cron:
  image: benoitquette/docker-cloud-cron
  restart: always
  roles:
    - global
```
2. Setting a label on a service of one of your stacks that will specify the schedule of the service in a crontab syntax.
In the example below, the 'hello'service will be started every minute.
```yaml
hello:
  image: helloworld
  labels:
    - 'docker-cloud-cron.schedule=0 1 * * * *'
```

## CRON syntax

## Configuration
