#!/bin/bash

docker build app -t us.gcr.io/lahacks2019-236102/backend
docker push us.gcr.io/lahacks2019-236102/backend

docker build frontend -t us.gcr.io/lahacks2019-236102/frontend
docker push us.gcr.io/lahacks2019-236102/frontend