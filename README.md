# New Primo UI

[![Web Services](https://img.shields.io/badge/Owner-LITS%20Web%20Services-Black.svg)](https://shields.io/) 
[![Docker Repository on Quay](https://quay.io/repository/nyulibraries/primo-explore-devenv/status "Docker Repository on Quay")](https://quay.io/repository/nyulibraries/primo-explore-devenv)
[![CircleCI](https://circleci.com/gh/NYULibraries/primo-explore-devenv.svg?style=shield)](https://circleci.com/gh/NYULibraries/primo-explore-devenv)

## What is this?

At NYU we've made a fork of the [ExLibris-maintained proxy](https://github.com/ExLibrisGroup/primo-explore-devenv) made for developing Primo view packages locally and generating packaged in `zip` format for deploy through the Primo Back Office (or VE).

We've made some changes

### What is different from upstream primo-explore-devenv?

- `Docker` - we wrap the dev environment in a container with Docker and docker-compose
- `webpack` - we forgo using the `gulp` environment setup by ExLibris and use `webpack` instead for compile JS/SCSS as well as running the dev server (via `webpack-dev-server`) and compile the `zip` packages
  - `webpack.config.js` - all the configs
  - `package.json` - webpack dependencies, etc. - divergent from the upstream `package.json`
  - `webpack/loadPrimoMiddlewares.js` - `webpack` will load these dependencies for us from the ExLibris code so we don't have to write our own proxy, etc.
- `yarn` - we use `yarn` to build our dependencies
  - `yarn.lock`
- `quay.io` - our container repository
  - `script/push_docker.sh` - utils
- `CircleCI` - we build and push our container images via CircleCI
  - `.circleci`

## Setting up the dev environment

### Settings
* PROXY_SERVER: Used for specifying the discovery server used by the development server.
* VIEW: Which Primo View will be served. (matches directory in `primo-explore/custom/{VIEW}`)
* VE: Set as a string "true" to use VE settings
* SAML: Set as string "true" to use SAML authentication method

### Running locally

With Node.js (>=10) and yarn installed:

```sh
yarn install --frozen-lockfile
```

Then start the server up:

```
PROXY_SERVER=https://bobcatdev.library.nyu.edu:443 VIEW=NYU [VE='true' SAML='true'] yarn start
```

Your developer server will be accessible at `http://localhost:8004/primo-explore/search?vid={VIEW}`

#### Symlinking your views to the devenv

If you maintain your view packages in a separate repository or directory structure, you can symlink your root directory of your views repository to the `primo-explore` directory like so:

```sh
# In Mac/Linux
# PWD: primo-explore-devenv
rm -rf primo-explore
ln -s /path/to/repos/primo-explore-views ./primo-explore
```

Simply ensure that your packages conform to the same directory structure of: `primo-explore/custom/{VIEW}/js/main.js`.

Node modules will be smart enough to pick up any intermediary `node_modules` directories and resolve to the closest parent directory. In our case, we use a monorepo structure with [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/), allowing us to 'hoist' common depdencies to a common root located in `primo-explore`. Dependencies are installed in the particular view packages where versions among submodules potentially conflict.

(See our `primo-explore-views` monorepo structure at: [primo-explore-views](https://github.com/NYULibraries/primo-explore-views)).

### Running with Docker

With Docker and docker-compose installed:

1. Configure `docker-compose.yml` to fit your institutional setup in the `x-environment` section.
1. `docker-compose build web`
1. `VIEW=NYU docker-compose up web`

On your local machine, the developer server will be accessible at `http://localhost:8004/primo-explore/search?vid={VIEW}`

Within the [docker network](https://docs.docker.com/network/), this will be accordingly be accessible at domain `http://web:8004`

## JS, (S)CSS, & HTML

`js/main.js` is considered webpack's entry file. All imports of JavaScript and (S)CSS will occur as `import` statements in your `js/main.js`. Ensure at least one CSS is included in the entry file! If you *do not* include CSS, the Primo server will fail as the necessary `custom1.css` will not output!

To use HTML as a JavaScript `String` in your code (e.g. for an Angular.js template), `import` and use in your `main.js`

### Live reload

Live reload will automatically refresh the page when changes are made to any fiels associated with the entry `main.js` file(s). Whether or not live reload is enabled responds to environment variables.

`NODE_ENV` is `test`, `staging`, or `production`, then live reload is turned off
`LIVE` is `true`, this overrides the setting based on `NODE_ENV` and enables live reload.

### Example

```js
/* Import styles */
import '../css/sass/main.scss';

/* Import any node dependencies */
import 'primo-explore-libraryh3lp-widget';

/* Import other JS files relative to main.js */
import libraryh3lpWidgetConfig from './libraryh3lpWidget';

/* HTML imported as a string for use in JS */
import customRequestsRequestInformationTemplate from '../html/custom_requests_request_information.html';

let app = angular.module('viewCustom', [
  'libraryh3lpWidget',
]);

app
  .constant(libraryh3lpWidgetConfig.name, libraryh3lpWidgetConfig.config)
  .component('prmLocationItemsAfter', {
    template: `${customRequestsRequestInformationTemplate}`
  });
```

```scss
/* main.scss */
/* import local sass */
@import 'variables';

/* import relative CSS files */
@import '../css/app-colors.css';

/* Manually import css assets that are delivered with NPM modules */
@import '~primo-explore-libraryh3lp-widget/css/custom1.css';
```

Example tree:
```
├── primo-explore
│   ├── custom
│   │   ├── NYU
│   │   │   ├── README.md
│   │   │   ├── colors.json
│   │   │   ├── css
│   │   │   │   ├── app-colors.css
│   │   │   │   ├── custom1.css # Generated by webpack
│   │   │   │   ├── custom1.css.map # Generated by webpack
│   │   │   │   ├── main.css
│   │   │   │   └── sass
│   │   │   │       ├── _availability.scss
│   │   │   │       ├── _chat_widget.scss
│   │   │   │       ├── _custom_request.scss
│   │   │   │       ├── _hide.scss
│   │   │   │       ├── _logo.scss
│   │   │   │       ├── _variables.scss
│   │   │   │       └── main.scss
│   │   │   ├── html
│   │   │   │   ├── custom_requests_request_information.html
│   │   │   │   └── home_en_US.html
│   │   │   ├── img
│   │   │   ├── js
│   │   │   │   ├── clickableLogoToAnyLink.js
│   │   │   │   ├── custom.js # Generated by webpack
│   │   │   │   ├── custom.js.map # Generated by webpack
│   │   │   │   └── libraryh3lpWidget.js
```

## Docker image

This docker image is intended for usage within other view package repositories. Our image can be pulled from `quay.io/nyulibraries/primo-explore-devenv` [(image repository)](https://quay.io/repository/nyulibraries/primo-explore-devenv?tab=info)

#### Example

```dockerfile
FROM quay.io/nyulibraries/primo-explore-devenv:1.1.1

ENV VIEW NYU
ENV DEVENV_PATH /app

WORKDIR /app/primo-explore/

# Installs Node modules, along with inner repository node_modules
COPY yarn.lock package.json ./
COPY custom/CENTRAL_PACKAGE/package.json ./custom/CENTRAL_PACKAGE/package.json
COPY custom/NYU/package.json ./custom/NYU/package.json
COPY custom/NYUAD/package.json ./custom/NYUAD/package.json
COPY custom/NYUSH/package.json ./custom/NYUSH/package.json
COPY custom/NYSID/package.json ./custom/NYSID/package.json
COPY custom/NYHS/package.json ./custom/NYHS/package.json
COPY custom/BHS/package.json ./custom/BHS/package.json
COPY custom/CU/package.json ./custom/CU/package.json

# Installs production version of dependencies from NPM
RUN yarn install --prod --frozen-lockfile --ignore-optional && yarn cache clean

# Copies remaining VIEW files
COPY ./custom/ ./custom/

# Sets up for running as a container
WORKDIR ${DEVENV_PATH}

EXPOSE 8004 3001

# CMD not necessary: inherited from devenv
```

## Build a Package

### Locally

```sh
VIEW=[view] NODE_ENV=[stage] yarn create-package
```

### Docker

With volumes enabled in the `docker-compose.yml`:

```sh
VIEW=[view] NODE_ENV=[stage] docker-compose run create-package
```

## Deploys

Deploys must be done through the back office UI with an uploaded zip package.

1. **Notify admins and devs** by scheduling a block in the appropriate Primo calendar. This ensures no conflicts between manual deploys and jobs.

1. **Build a package.** Run `docker-compose create-package` to build a zip file of this customization package. The script also removes files that cause the upload to fail, specifically any files except `package.json` without the following extensions: `png`, `jpg`, `gif`, `js`, `html`, `css`.

1. **Verify that no deploys or pipes are running or scheduled.** Under Monitor Primo Status, check the following to ensure nothing is running or scheduled (Jobs need about 15 minutes after completion to finish before a deploy can be run.):
    - Schedule Tasks
    - Deploy Monitoring
    - Process Monitoring
    - Job Monitoring

1. **Upload zip file.** Navigate to Deploy & Utilities > Customization Manager. Select the appropriate view (e.g. "NYU") as View. Download the existing package in case of failure. Choose file and click "Upload".

1. **Deploy** by clicking "Deploy." You can monitor progress under "Deploy Monitoring."

## Resources

- [Legacy Docs: The Gulp Environment](https://github.com/NYULibraries/primo-explore-devenv/wiki/Legacy:-Gulp-Environment)
- [ExLibris Javascript recipes](https://github.com/ExLibrisGroup/primo-explore-package/blob/master/VIEW_CODE/js/README.md)
- [ExLibris CSS recipes](https://github.com/ExLibrisGroup/primo-explore-package/blob/master/VIEW_CODE/css/README.md)
- [ExLibris Primo New UI overview](https://github.com/ExLibrisGroup/primo-explore-devenv)
- [ExLibris Primo New UI best practices](https://knowledge.exlibrisgroup.com/Primo/Product_Documentation/New_Primo_User_Interface/New_UI_Customization_-_Best_Practices)
- [ExLibris Primo New UI package manager](https://knowledge.exlibrisgroup.com/Primo/Product_Documentation/Back_Office_Guide/090Primo_Utilities/The_UI_Customization_Package_Manager)
- [Community contributions](https://github.com/search?utf8=%E2%9C%93&q=primo-explore)
