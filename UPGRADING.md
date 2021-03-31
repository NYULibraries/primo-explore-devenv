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

