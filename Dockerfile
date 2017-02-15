FROM node:6-slim
ENV APP_DIR /usr/src/app
ENV YARN_HOME /root/.yarn
ENV YARN_BIN ${YARN_HOME}/bin

# install app dependencies
RUN apt-get update -y
RUN apt-get install apt-utils bzip2 libfontconfig -y

# install Yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json yarn.lock /tmp/
RUN cd /tmp && ${YARN_BIN}/yarn install
RUN mkdir -p ${APP_DIR} && cp -a /tmp/node_modules ${APP_DIR}/

# from here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
WORKDIR ${APP_DIR}
COPY . ${APP_DIR}

# clean update
RUN rm -rf ${YARN_HOME}
RUN rm -rf /tmp

CMD ["npm", "start"]
