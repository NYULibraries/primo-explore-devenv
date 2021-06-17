#!/bin/sh -ex

docker tag primo-explore-devenv quay.io/nyulibraries/primo-explore-devenv:latest
docker tag primo-explore-devenv quay.io/nyulibraries/primo-explore-devenv:${CIRCLE_BRANCH//\//_}
docker tag primo-explore-devenv quay.io/nyulibraries/primo-explore-devenv:${CIRCLE_BRANCH//\//_}-${CIRCLE_SHA1}

docker push quay.io/nyulibraries/primo-explore-devenv:latest
docker push quay.io/nyulibraries/primo-explore-devenv:${CIRCLE_BRANCH//\//_}
docker push quay.io/nyulibraries/primo-explore-devenv:${CIRCLE_BRANCH//\//_}-${CIRCLE_SHA1}

# Pushes using version number for master
# Do this with circle filters instead
# if [[ $CIRCLE_BRANCH == master ]]; then
#   VERSION=$(awk -F\" '/"version":/ {print $4}' package.json)
#   docker tag primo-explore-devenv quay.io/nyulibraries/primo-explore-devenv:$VERSION
#   docker push quay.io/nyulibraries/primo-explore-devenv:$VERSION
# fi