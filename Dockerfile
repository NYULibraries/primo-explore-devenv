FROM node:latest

ENV INSTALL_PATH /app
ENV PATH $INSTALL_PATH/node_modules/.bin:${PATH}
ENV GULPFILE nyu-gulpfile.js
ENV VIEW NYU-NUI

# Install essentials
RUN apt-get update -qq && apt-get install -y build-essential vim

# Install yarn
RUN apt-get update && apt-get install -y apt-transport-https
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install yarn

# Install node_modules with yarn
ADD package.json yarn.lock /tmp/
RUN cd /tmp && yarn
RUN mkdir -p $INSTALL_PATH && cd $INSTALL_PATH && cp -R /tmp/node_modules $INSTALL_PATH

WORKDIR $INSTALL_PATH

ADD . .

EXPOSE 8003 3001

CMD [ "/bin/bash", "-c", "yarn run gulp run --gulpfile=$GULPFILE --view $VIEW --browserify" ]
