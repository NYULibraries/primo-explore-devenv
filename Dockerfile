FROM node:6.9.2-slim

ENV INSTALL_PATH /app
ENV PATH $INSTALL_PATH/node_modules/.bin:${PATH}
ENV GULPFILE nyu-gulpfile.js
ENV VIEW NYU
ENV PROXY_SERVER http://bobcatdev.library.nyu.edu:80

# Install essentials
RUN apt-get update -qq && apt-get install -y build-essential

# Install node_modules with yarn
ADD package.json yarn.lock /tmp/
RUN cd /tmp && yarn install --frozen-lockfile
RUN mkdir -p $INSTALL_PATH && cd $INSTALL_PATH && cp -R /tmp/node_modules $INSTALL_PATH

WORKDIR $INSTALL_PATH

ADD . .

RUN sed -ie 's@http:\/\/your-server:your-port@'"$PROXY_SERVER"'@g' $INSTALL_PATH/gulp/config.js

EXPOSE 8003 3001

CMD [ "/bin/bash", "-c", "yarn start"]
