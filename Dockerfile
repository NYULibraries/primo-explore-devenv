FROM node:10-alpine

ENV INSTALL_PATH /app
ENV PATH $INSTALL_PATH/node_modules/.bin:${PATH}
ENV VIEW=CENTRAL_PACKAGE

# Install essentials
RUN apk update && apk add build-base git

# Install node_modules with yarn
ADD package.json yarn.lock /tmp/
RUN cd /tmp && yarn install --frozen-lockfile --ignore-optional \
  && mkdir -p $INSTALL_PATH \
  && cd $INSTALL_PATH \
  && cp -R /tmp/node_modules $INSTALL_PATH \
  && rm -r /tmp/* && yarn cache clean

WORKDIR $INSTALL_PATH

ADD webpack.config.js package.json yarn.lock ./
ADD webpack/ ./webpack/
ADD images/ ./images/
ADD gulp/primoProxy.js gulp/config.js ./gulp/

EXPOSE 8004 3001

CMD VIEW=${VIEW} PROXY_SERVER=${PROXY_SERVER} yarn start