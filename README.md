# docker-cloud-cron
[![Docker Automated buil](https://img.shields.io/docker/automated/benoitquette/docker-cloud-cron.svg)](https://hub.docker.com/r/benoitquette/docker-cloud-cron/builds/) [![Docker Pulls](https://img.shields.io/docker/pulls/benoitquette/docker-cloud-cron.svg)](https://hub.docker.com/r/benoitquette/docker-cloud-cron/) [![Docker Stars](https://img.shields.io/docker/stars/benoitquette/docker-cloud-cron.svg)](https://hub.docker.com/r/benoitquette/docker-cloud-cron/)

Schedule [Docker Cloud](https://cloud.docker.com) services from within your stack.

The goal of this project is to facilitate the starting of services in a cron-like fashion.
This will only work in Docker Cloud. This is inspired from the [Rancher Cron Service](https://github.com/SocialEngine/rancher-cron) project that already exists but for [Rancher](http://rancher.com/) only.

## Setup

Setting up an environment can be done in 2 steps:
1. Create the cron service
2. Schedule services to be started

### Create the cron service

Adding a service based on the [docker-cloud-cron](https://hub.docker.com/r/benoitquette/docker-cloud-cron/) image in one of your stack. You need to ensure that the service has a 'global' role.
```yaml
cron:
  image: benoitquette/docker-cloud-cron
  restart: always
  roles:
    - global
```
[TBC] If you do not wish to assign this type of role, you will have to manually pass the username and API key as environment variables. You can get an API key from your Docker Cloud account.
```yaml
cron:
  image: benoitquette/docker-cloud-cron
  restart: always
  environment:
    - 'DOCKERCLOUD_USER=[your username here]'
    - 'DOCKERCLOUD_API_KEY=[your API key here]'
```

### Schedule services to be started

Setting a label on a service of your stack that will specify the schedule of the service in a crontab syntax. In the example below, the 'hello'service will be started every minute.
```yaml
hello:
  image: hello-world
  labels:
    - 'docker-cloud-cron.schedule=1 * * * * *'
```
For now, the service can inspect all the services in your nodes. No restrictions on nodes or stacks. I have only tested this on a single node setup. Please let me know how it behaves on multiple nodes.

[![Deploy to Docker Cloud](https://files.cloud.docker.com/images/deploy-to-dockercloud.svg)](https://cloud.docker.com/stack/deploy/?repo=https://github.com/benoitquette/docker-cloud-cron)

## CRON syntax
*Note: this section is copied from the underlying implemetation: [node-cron](https://github.com/merencia/node-cron).*

This is a quick reference to cron syntax and also shows the options supported.

### Allowed fields

```
 ┌────────────── second (optional)
 │ ┌──────────── minute
 │ │ ┌────────── hour
 │ │ │ ┌──────── day of month
 │ │ │ │ ┌────── month
 │ │ │ │ │ ┌──── day of week
 │ │ │ │ │ │
 │ │ │ │ │ │
 * * * * * *
```

### Allowed values

|     field    |        value        |
|--------------|---------------------|
|    second    |         0-59        |
|    minute    |         0-59        |
|     hour     |         0-23        |
| day of month |         1-31        |
|     month    |     1-12 (or names) |
|  day of week |     0-7 (or names, 0 or 7 are sunday)  |


#### Using multiples values

You may use multiples values separated by comma:

```yaml
  labels:
    - 'docker-cloud-cron.schedule=1,2,4,5 * * * *'
```

#### Using ranges

You may also define a range of values:

```yaml
  labels:
    - 'docker-cloud-cron.schedule=1-5 * * * *'
```

#### Using step values

Step values can be used in conjunction with ranges, following a range with '/' and a number. e.g: `1-10/2` that is the same as `2,4,6,8,10`. Steps are also permitted after an asterisk, so if you want to say “every two minutes”, just use `*/2`.

```yaml
  labels:
    - 'docker-cloud-cron.schedule=*/2 * * * *'
```

#### Using names

For month and week day you also may use names or short names. e.g:

```yaml
  labels:
    - 'docker-cloud-cron.schedule=* * * January,September Sunday'
```

Or with short names:

```yaml
  labels:
    - 'docker-cloud-cron.schedule=* * * Jan,Sep Sun'
```

## Configuration

## What's next

