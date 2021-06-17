FROM node:10-slim

ENV INSTALL_PATH /app
ENV PATH $INSTALL_PATH/node_modules/.bin:${PATH}
ENV GULPFILE gulpfile.js
ENV VIEW NYU
ENV PROXY_SERVER https://bobcatdev.library.nyu.edu:443

# Install essentials
RUN apt-get update -qq && apt-get install -y build-essential unzip

# Install node_modules with yarn
ADD ./gulp/package.json /tmp/
RUN cd /tmp && \
    npm install -g gulp && \
    npm install
RUN mkdir -p $INSTALL_PATH && cd $INSTALL_PATH && cp -R /tmp/node_modules $INSTALL_PATH

WORKDIR $INSTALL_PATH

# Adds files, overwriting package.json files
ADD . ./gulp/package.json ./

RUN sed -ie 's@http:\/\/your-server:your-port@'"$PROXY_SERVER"'@g' $INSTALL_PATH/gulp/config.js

EXPOSE 8003 3001

WORKDIR $INSTALL_PATH

CMD [ "/bin/bash", "-c", "gulp run --view ${VIEW}"]
# gulp create-package
