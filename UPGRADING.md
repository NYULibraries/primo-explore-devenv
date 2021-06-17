This repos is a fork of an upstream repos managed by the ExlibrisGroup vendor account. We do want to keep this periodically up-to-date with the upstream even though we've made some changes to the way we run and build packages (i.e. via webpack over gulp).

## Merge upstream changes

```
git fetch upstream
git merge upstream/master
# Resolve conflicts
```

Resolve conflicts with fork. In most cases we want to use the most up to date upstream version. The one exception is `package.json`, see below.

### `package.json`

Our root `package.json` is completely divergent from the upstream. However, we maintain the upsteam dependencies under `gulp/package.json` and build it into a separate container defined by `gulp/Dockerfile`. When merging upstream you'll have to manually copy the updated `package.json` from upstream to `gulp/package.json`.

## Updating Node

Update root `Dockerfile` to use the correct version of Node from the upstream

Update the `gulp/Dockerfile` to use the correct version of Node from the upstream

## Resolving Issues

It has happened that an upstream change has broken our webpack customizations. For instance in a recent update (as of June 2021) when trying to start up the `webpack-dev-server` we saw the following error:

```
web_1              | $ webpack-dev-server
web_1              | /app/node_modules/webpack-dev-server/bin/webpack-dev-server.js:115
web_1              |     throw err;
web_1              |     ^
web_1              | 
web_1              | ReferenceError: Response is not defined
web_1              |     at proxy_function (/app/gulp/primoProxy.js:173:15)
web_1              |     at loadMiddlewares (/app/webpack/loadPrimoMiddlewares.js:22:11)
```

Traced back to the `primoProxy.js` file and with some Googling we discovered that the `Response` class needed to be polyfilled `isomorphic-fetch` so we installed the package and added `require('isomorphic-fetch');` into the `loadPrimoMiddlewares.js` file before including the `primoProxy.js`.